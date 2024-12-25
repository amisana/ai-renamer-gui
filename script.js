document.addEventListener('DOMContentLoaded', () => {
  const providerSelect = document.getElementById('provider');
  const modelSelect = document.getElementById('model');
  const apiKeyGroup = document.getElementById('apiKeyGroup');
  const apiKeyInput = document.getElementById('apiKey');
  const directoryInput = document.getElementById('directory');
  const baseUrlInput = document.getElementById('baseUrl');
  const framesInput = document.getElementById('frames');
  const caseStyleInput = document.getElementById('caseStyle');
  const charsInput = document.getElementById('chars');
  const languageInput = document.getElementById('language');
  const includeSubdirectoriesInput = document.getElementById('includeSubdirectories');
  const customPromptInput = document.getElementById('customPrompt');
  const errorSummary = document.getElementById('errorSummary');
  const providerInfo = document.getElementById('providerInfo');
  const commandForm = document.getElementById('commandForm');
  const testCommandBtn = document.getElementById('testCommandBtn');

  loadPreferences();
  updateModels();

  providerSelect.addEventListener('change', updateModels);
  commandForm.addEventListener('submit', handleFormSubmit);
  testCommandBtn.addEventListener('click', handleTestCommand);

  // Real-time validation watchers
  const watchList = [
    directoryInput,
    providerSelect,
    modelSelect,
    caseStyleInput,
    charsInput,
    languageInput,
    includeSubdirectoriesInput,
    customPromptInput
  ];
  watchList.forEach(el => {
    el.addEventListener('input', () => clearFieldError(el));
  });

  framesInput.addEventListener('input', () => clearFieldError(framesInput));
  apiKeyInput.addEventListener('input', () => {
    if (providerIsOnline()) clearFieldError(apiKeyInput);
  });
});

function handleFormSubmit(e) {
  e.preventDefault();
  clearAllFieldErrors();
  clearErrorSummary();

  if (validateForm()) {
    savePreferences();
    const cmd = buildCommand();
    displayCommand(cmd);
  }
}

function handleTestCommand() {
  clearAllFieldErrors();
  clearErrorSummary();

  if (validateForm()) {
    const cmd = buildCommand();
    console.log('[TEST COMMAND]', cmd);
    alert('Test Command logged in the console.');
  }
}

function updateModels() {
  const provider = providerSelect.value;
  modelSelect.innerHTML = `<option value="" disabled selected>Select a model</option>`;
  providerInfo.style.display = 'none';
  providerInfo.textContent = '';

  if (!provider) {
    apiKeyGroup.style.display = 'none';
    return;
  }

  // Show/hide API Key
  if (providerIsOnline()) {
    apiKeyGroup.style.display = 'block';
  } else {
    apiKeyGroup.style.display = 'none';
    apiKeyInput.value = '';
  }

  switch (provider) {
    case 'openai':
      addModelOption('gpt-4', true);
      addModelOption('gpt-3.5-turbo');
      providerInfo.style.display = 'block';
      providerInfo.innerHTML = `
        You have selected <strong>OpenAI</strong>. An API key is required.
      `;
      break;
    case 'claude':
      addModelOption('claude-instant', true);
      addModelOption('claude-v2');
      providerInfo.style.display = 'block';
      providerInfo.innerHTML = `
        You have selected <strong>Claude</strong>. An API key is required for Anthropic’s Claude.
      `;
      break;
    case 'ollama':
      addModelOption('llava:13b', true);
      addModelOption('gemma2');
      addModelOption('phi');
      providerInfo.style.display = 'block';
      providerInfo.innerHTML = `
        You have selected <strong>Ollama</strong>. Usually runs locally. 
        Optionally set a custom <code>baseUrl</code> if not default.
      `;
      break;
    case 'lm-studio':
      addModelOption('lmstudio-default', true);
      providerInfo.style.display = 'block';
      providerInfo.innerHTML = `
        You have selected <strong>LM Studio</strong>. Typically runs locally on 
        <code>http://127.0.0.1:1234</code>.
      `;
      break;
  }
}

function addModelOption(name, selected = false) {
  const opt = document.createElement('option');
  opt.value = name;
  opt.textContent = name;
  if (selected) opt.selected = true;
  modelSelect.appendChild(opt);
}

function providerIsOnline() {
  return providerSelect.value === 'openai' || providerSelect.value === 'claude';
}

function validateForm() {
  let valid = true;
  const requiredList = [
    { el: directoryInput, name: 'Directory Path' },
    { el: providerSelect, name: 'Provider' },
    { el: modelSelect, name: 'Model' },
    { el: caseStyleInput, name: 'Case Style' },
    { el: charsInput, name: 'Character Limit' },
    { el: languageInput, name: 'Language' },
    { el: includeSubdirectoriesInput, name: 'Include Subdirectories' },
    { el: customPromptInput, name: 'Custom Prompt' }
  ];
  requiredList.forEach(({ el, name }) => {
    if (!el.value.trim()) {
      showFieldError(el, `${name} is required.`);
      valid = false;
    }
  });

  if (!validateDirectory()) valid = false;
  if (!validateFrames()) valid = false;
  if (providerIsOnline() && !validateApiKey()) valid = false;

  if (!valid) {
    errorSummary.style.display = 'block';
    errorSummary.textContent = 'Please fix the highlighted errors and try again.';
  }
  return valid;
}

function validateDirectory() {
  const val = directoryInput.value.trim();
  if (!val) return false;
  if (!val.startsWith('/')) {
    showFieldError(directoryInput, 'Directory path must begin with "/".');
    return false;
  }
  return true;
}

function validateFrames() {
  const val = framesInput.value.trim();
  if (!val) return true; // optional
  const num = Number(val);
  if (!Number.isInteger(num) || num < 1 || num > 50) {
    showFieldError(framesInput, 'Frames must be 1–50.');
    return false;
  }
  return true;
}

function validateApiKey() {
  const key = apiKeyInput.value.trim();
  if (!key) {
    showFieldError(apiKeyInput, 'API Key is required for this provider.');
    return false;
  }
  return true;
}

function buildCommand() {
  const directory = directoryInput.value.trim();
  const provider = providerSelect.value.trim();
  const model = modelSelect.value.trim();
  const baseUrl = baseUrlInput.value.trim();
  const frames = framesInput.value.trim();
  const caseStyle = caseStyleInput.value.trim();
  const chars = charsInput.value.trim();
  const language = languageInput.value.trim();
  const includeSubs = includeSubdirectoriesInput.value.trim();
  const customPrompt = customPromptInput.value.trim();
  const apiKey = apiKeyInput.value.trim();

  let cmd = `ai-renamer "${directory}" \\\n  --provider=${provider} \\\n  --model=${model}`;
  if (providerIsOnline()) {
    cmd += ` \\\n  --api-key="${escapeForCommand(apiKey)}"`;
  }
  if (baseUrl) {
    cmd += ` \\\n  --base-url="${escapeForCommand(baseUrl)}"`;
  }
  if (frames) {
    cmd += ` \\\n  --frames=${frames}`;
  }
  if (caseStyle) {
    cmd += ` \\\n  --case=${caseStyle}`;
  }
  if (chars) {
    cmd += ` \\\n  --chars=${chars}`;
  }
  if (language) {
    cmd += ` \\\n  --language="${escapeForCommand(language)}"`;
  }
  if (includeSubs) {
    cmd += ` \\\n  --include-subdirectories=${includeSubs}`;
  }
  if (customPrompt) {
    cmd += ` \\\n  --custom-prompt="${escapeForCommand(customPrompt)}"`;
  }
  return cmd;
}

function displayCommand(cmd) {
  const wrapper = document.getElementById('generatedCommandWrapper');
  const cmdText = document.getElementById('commandText');
  cmdText.textContent = cmd;
  wrapper.style.display = 'block';
}

function hideCommand() {
  document.getElementById('generatedCommandWrapper').style.display = 'none';
}

function copyCommand() {
  const cmdText = document.getElementById('commandText').textContent;
  navigator.clipboard.writeText(cmdText)
    .then(() => alert('Command copied to clipboard!'))
    .catch(err => {
      console.error('Clipboard copy failed:', err);
      alert('Failed to copy. Please copy manually.');
    });
}

function escapeForCommand(str) {
  return str.replace(/(["\\$`])/g, '\\$1');
}

function showFieldError(el, msg) {
  const errEl = document.getElementById(el.id + 'Error');
  if (errEl) {
    errEl.textContent = msg;
    errEl.style.display = 'block';
  }
  el.classList.add('invalid-field');
}

function clearFieldError(el) {
  const errEl = document.getElementById(el.id + 'Error');
  if (errEl) {
    errEl.textContent = '';
    errEl.style.display = 'none';
  }
  el.classList.remove('invalid-field');
}

function clearAllFieldErrors() {
  document.querySelectorAll('.error-message').forEach(e => {
    e.textContent = '';
    e.style.display = 'none';
  });
  document.querySelectorAll('.invalid-field').forEach(e => {
    e.classList.remove('invalid-field');
  });
}

function clearErrorSummary() {
  errorSummary.style.display = 'none';
  errorSummary.textContent = '';
}

function savePreferences() {
  const prefs = {
    provider: providerSelect.value.trim(),
    model: modelSelect.value.trim(),
    caseStyle: caseStyleInput.value.trim(),
    language: languageInput.value.trim(),
    customPrompt: customPromptInput.value.trim()
  };
  localStorage.setItem('aiRenamerPrefs', JSON.stringify(prefs));
}

function loadPreferences() {
  const raw = localStorage.getItem('aiRenamerPrefs');
  if (!raw) return;
  try {
    const { provider, model, caseStyle, language, customPrompt } = JSON.parse(raw);
    if (provider) providerSelect.value = provider;
    if (caseStyle) caseStyleInput.value = caseStyle;
    if (language) languageInput.value = language;
    if (customPrompt) customPromptInput.value = customPrompt;
    setTimeout(() => {
      if (model) modelSelect.value = model;
    }, 300);
  } catch (err) {
    console.warn('Failed to parse local prefs:', err);
  }
}
