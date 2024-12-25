document.addEventListener('DOMContentLoaded', () => {
  const providerSelect = document.getElementById('provider');
  const modelSelect = document.getElementById('model');
  const apiKeyGroup = document.getElementById('apiKeyGroup');
  const commandForm = document.getElementById('commandForm');
  const testCommandBtn = document.getElementById('testCommandBtn');

  // Load previous preferences from localStorage (if any)
  loadPreferences();

  // Update models initially
  updateModels();

  // Listen for provider changes
  providerSelect.addEventListener('change', updateModels);

  // Handle form submission
  commandForm.addEventListener('submit', function(event) {
    event.preventDefault();
    clearErrors();

    if (validateForm()) {
      generateCommand();
      savePreferences();
    }
  });

  // "Test Command" button (just logs to console, or do something else)
  testCommandBtn.addEventListener('click', () => {
    clearErrors();
    if (validateForm()) {
      const cmd = buildCommand();
      console.log('[TEST MODE] The generated command is:\n', cmd);
      alert('Check the console for the generated command.');
    }
  });
});

/**
 * Populates the model dropdown based on the selected provider.
 */
function updateModels() {
  const provider = document.getElementById('provider').value;
  const modelSelect = document.getElementById('model');
  const apiKey = document.getElementById('apiKey');
  const apiKeyGroup = document.getElementById('apiKeyGroup');

  modelSelect.innerHTML = '<option value="" disabled selected>Select a model</option>';

  if (provider === 'openai' || provider === 'claude') {
    apiKeyGroup.style.display = 'block';
    // Pre-select default model
    addOption(modelSelect, 'gpt-4o', 'gpt-4o', true);
    addOption(modelSelect, 'gpt-4', 'gpt-4');
    addOption(modelSelect, 'gpt-3.5-turbo', 'gpt-3.5-turbo');
  } else {
    // Hide API Key block for local providers
    apiKeyGroup.style.display = 'none';
    apiKey.value = ''; // Clear it
    if (provider === 'ollama') {
      addOption(modelSelect, 'llava:13b', 'llava:13b', true);
      addOption(modelSelect, 'gemma2', 'gemma2');
      addOption(modelSelect, 'phi', 'phi');
    } else if (provider === 'lm-studio') {
      addOption(modelSelect, 'lmstudio-default', 'lmstudio-default', true);
    }
  }
}

/**
 * Adds an <option> to a <select> element.
 */
function addOption(select, value, text, isSelected = false) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = text;
  if (isSelected) option.selected = true;
  select.appendChild(option);
}

/**
 * Validates the form fields and displays errors if any.
 */
function validateForm() {
  let isValid = true;

  const fields = [
    { id: 'directory', name: 'Directory Path' },
    { id: 'provider', name: 'Provider' },
    { id: 'model', name: 'Model' },
    { id: 'caseStyle', name: 'Case Style' },
    { id: 'chars', name: 'Character Limit' },
    { id: 'language', name: 'Language' },
    { id: 'includeSubdirectories', name: 'Include Subdirectories' },
    { id: 'customPrompt', name: 'Custom Prompt' }
  ];

  fields.forEach(field => {
    const input = document.getElementById(field.id);
    const errorEl = document.getElementById(`${field.id}Error`);
    if (!input.value.trim()) {
      errorEl.textContent = `${field.name} is required.`;
      errorEl.style.display = 'block';
      isValid = false;
    }
  });

  // Additional validation for API key if provider is openai or claude
  const provider = document.getElementById('provider').value;
  if (provider === 'openai' || provider === 'claude') {
    const apiKey = document.getElementById('apiKey').value.trim();
    const apiKeyError = document.getElementById('apiKeyError');
    if (!apiKey) {
      apiKeyError.textContent = 'API Key is required for OpenAI/Claude.';
      apiKeyError.style.display = 'block';
      isValid = false;
    }
  }

  // Validate frames
  const framesVal = document.getElementById('frames').value.trim();
  if (framesVal) {
    const framesNum = Number(framesVal);
    if (!Number.isInteger(framesNum) || framesNum < 1 || framesNum > 999) {
      const framesError = document.getElementById('framesError');
      framesError.textContent = 'Frames must be a positive integer (1–999).';
      framesError.style.display = 'block';
      isValid = false;
    }
  }

  // Optional: Check directory path format (example: must start with "/")
  const directory = document.getElementById('directory').value.trim();
  if (directory && !directory.startsWith('/')) {
    const dirError = document.getElementById('directoryError');
    dirError.textContent = 'Please provide a valid absolute path (starting with "/").';
    dirError.style.display = 'block';
    isValid = false;
  }

  return isValid;
}

/**
 * Clears all error messages.
 */
function clearErrors() {
  const errors = document.querySelectorAll('.error-message');
  errors.forEach(err => {
    err.textContent = '';
    err.style.display = 'none';
  });
}

/**
 * Builds the command string based on form inputs.
 */
function buildCommand() {
  const directory = document.getElementById('directory').value.trim();
  const provider = document.getElementById('provider').value.trim();
  const model = document.getElementById('model').value.trim();
  const baseUrl = document.getElementById('baseUrl').value.trim();
  const frames = document.getElementById('frames').value.trim();
  const caseStyle = document.getElementById('caseStyle').value.trim();
  const chars = document.getElementById('chars').value.trim();
  const language = document.getElementById('language').value.trim();
  const customPrompt = document.getElementById('customPrompt').value.trim();
  const includeSubdirectories = document.getElementById('includeSubdirectories').value.trim();
  const apiKey = document.getElementById('apiKey').value.trim();

  let command = `ai-renamer "${directory}" \\\n  --provider=${provider} \\\n  --model=${model}`;

  if (provider === 'openai' || provider === 'claude') {
    command += ` \\\n  --api-key="${escapeForCommand(apiKey)}"`;
  }

  if (baseUrl) {
    command += ` \\\n  --base-url="${escapeForCommand(baseUrl)}"`;
  }

  if (frames) {
    command += ` \\\n  --frames=${frames}`;
  }

  if (caseStyle) {
    command += ` \\\n  --case=${caseStyle}`;
  }

  if (chars) {
    command += ` \\\n  --chars=${chars}`;
  }

  if (language) {
    command += ` \\\n  --language="${escapeForCommand(language)}"`;
  }

  if (includeSubdirectories) {
    command += ` \\\n  --include-subdirectories=${includeSubdirectories}`;
  }

  if (customPrompt) {
    const escapedPrompt = escapeForCommand(customPrompt);
    command += ` \\\n  --custom-prompt="${escapedPrompt}"`;
  }

  return command;
}

/**
 * Generates the command and displays it in the UI.
 */
function generateCommand() {
  const command = buildCommand();
  displayCommand(command);
}

/**
 * Displays the generated command in the UI.
 */
function displayCommand(command) {
  const commandText = document.getElementById('commandText');
  const generatedCommand = document.getElementById('generated-command');

  commandText.textContent = command;
  generatedCommand.style.display = 'block';
}

/**
 * Copies the generated command to the clipboard.
 */
function copyCommand() {
  const commandText = document.getElementById('commandText').textContent;
  navigator.clipboard.writeText(commandText)
    .then(() => {
      alert('Command copied to clipboard!');
    })
    .catch(err => {
      alert('Failed to copy command. Please copy it manually.');
      console.error('Clipboard copy failed:', err);
    });
}

/**
 * Escape special characters (backslashes, quotes) that could break the command.
 */
function escapeForCommand(str) {
  return str.replace(/(["\\$`])/g, '\\$1');
}

/**
 * Saves some form preferences in localStorage (for convenience).
 */
function savePreferences() {
  const provider = document.getElementById('provider').value.trim();
  const model = document.getElementById('model').value.trim();
  const caseStyle = document.getElementById('caseStyle').value.trim();
  const language = document.getElementById('language').value.trim();

  const prefs = {
    provider, model, caseStyle, language
  };
  localStorage.setItem('aiRenamerPrefs', JSON.stringify(prefs));
}

/**
 * Loads preferences from localStorage, if available, and updates the UI.
 */
function loadPreferences() {
  const raw = localStorage.getItem('aiRenamerPrefs');
  if (raw) {
    try {
      const { provider, model, caseStyle, language } = JSON.parse(raw);
      if (provider) document.getElementById('provider').value = provider;
      // We’ll repopulate models when updateModels() runs
      if (caseStyle) document.getElementById('caseStyle').value = caseStyle;
      if (language) document.getElementById('language').value = language;

      // We'll select the model after updateModels() is called
      setTimeout(() => {
        if (model) document.getElementById('model').value = model;
      }, 200);
    } catch (e) {
      console.warn('Error parsing saved preferences:', e);
    }
  }
}
