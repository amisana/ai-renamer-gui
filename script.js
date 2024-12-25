/* Basic Reset */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f4f6f8;
    padding: 20px;
    color: #333;
  }
  
  /* Container */
  .container {
    max-width: 900px;
    margin: 0 auto;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 20px;
  }
  
  /* Form Layout */
  form fieldset {
    border: 1px solid #e2e2e2;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
  }
  
  form legend {
    font-weight: bold;
    margin-bottom: 10px;
    color: #444;
  }
  
  /* Form Groups */
  .form-group {
    margin-bottom: 16px;
    position: relative;
  }
  
  label {
    display: block;
    margin-bottom: 6px;
    font-weight: 600;
    color: #555;
  }
  
  .required {
    color: red;
  }
  
  /* Inputs */
  input[type="text"],
  input[type="password"],
  input[type="number"],
  select,
  textarea {
    width: 100%;
    padding: 12px 14px;
    font-size: 15px;
    color: #333;
    border: 1px solid #ccc;
    border-radius: 6px;
    transition: border 0.3s;
  }
  
  input[type="text"]:focus,
  input[type="password"]:focus,
  input[type="number"]:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: #007bff;
  }
  
  /* Error messages */
  .error-message {
    font-size: 0.85rem;
    color: red;
    display: none;
    margin-top: 4px;
  }
  
  .error-summary {
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid red;
    background-color: #ffe6e6;
    color: #cc0000;
    border-radius: 4px;
  }
  
  /* Tooltips */
  .tooltip {
    display: block;
    font-size: 0.85rem;
    color: #666;
    margin-top: 4px;
    line-height: 1.2;
  }
  
  /* Info box for provider explanation */
  .info-box {
    background-color: #eff5ff;
    border: 1px solid #d0e2ff;
    padding: 10px;
    margin-bottom: 16px;
    border-radius: 6px;
    color: #2c3e50;
    font-size: 0.9rem;
  }
  
  /* Buttons */
  .button-group {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  
  button[type="submit"],
  #testCommandBtn,
  .copy-btn,
  .close-btn {
    flex: 1 1 auto;
    padding: 12px 16px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    color: #fff;
    transition: background-color 0.3s;
  }
  
  button[type="submit"] {
    background-color: #007bff;
  }
  
  button[type="submit"]:hover {
    background-color: #0056b3;
  }
  
  #testCommandBtn {
    background-color: #6c757d;
  }
  
  #testCommandBtn:hover {
    background-color: #555b60;
  }
  
  .copy-btn {
    background-color: #28a745;
  }
  
  .copy-btn:hover {
    background-color: #218838;
  }
  
  .close-btn {
    background-color: #dc3545;
  }
  
  .close-btn:hover {
    background-color: #c82333;
  }
  
  /* Generated Command Section */
  .generated-command-wrapper {
    background-color: #f0f4f9;
    border: 1px solid #ced4da;
    border-radius: 6px;
    padding: 20px;
  }
  
  #generatedCommandWrapper h2 {
    margin-bottom: 15px;
  }
  
  #commandText {
    background-color: #fff;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 16px;
    white-space: pre-wrap;
    word-wrap: break-word;
    border: 1px solid #ced4da;
    font-family: monospace;
    font-size: 14px;
  }
  
  /* Responsive */
  @media (max-width: 600px) {
    form fieldset {
      padding: 15px;
    }
  
    label,
    .tooltip,
    .info-box {
      font-size: 0.9rem;
    }
  
    button[type="submit"],
    #testCommandBtn,
    .copy-btn,
    .close-btn {
      font-size: 14px;
      padding: 10px 12px;
    }
  
    .button-group {
      flex-direction: column;
    }
  }
  