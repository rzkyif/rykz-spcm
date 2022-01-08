////////// STYLE LOADING

import "./index.less";

////////// CONSTANTS

const inputTextArea = document.getElementById('input');
const inputCursorPosition = document.getElementById('cursor-position-input');
const outputTextArea = document.getElementById('output');
const outputCursorPosition = document.getElementById('cursor-position-output');

////////// FUNCTIONS

function startGenerate() {
  try {
    outputTextArea.value = JSON.stringify(generateSPCMFromSettings(JSON.parse(inputTextArea.value)), null, 2)
  } catch (e) {
    outputTextArea.value = e.toString();
  }
}

function generateSPCMFromSettings(settingsJSON) {
  let spcmJSON = {
    title: "INSERT SETTINGS TITLE",
    categories: {
      category_INSERT_CATEGORY_KEY: {
        title: "INSERT CATEGORY TITLE",
        settings: {}
      }
    }
  }
  const settingsKeys = Object.keys(settingsJSON);
  for (let i = 0; i < settingsKeys.length; i++) {
    const settingsKey = settingsKeys[i];
    if (settingsKey.startsWith('_')) continue;
    spcmJSON.categories["category_INSERT_CATEGORY_KEY"].settings[settingsKey] = {
      name: "INSERT SETTING NAME",
      desc: "INSERT SETTING DESC",
      type: "INSERT SETTING TYPE",
      default: settingsJSON[settingsKey]
    }
  }
  return spcmJSON;
}

function updateCursorPosition() {
  inputCursorPosition.innerHTML = `Cursor Position: ${inputTextArea.selectionStart}`
  outputCursorPosition.innerHTML = `Cursor Position: ${outputTextArea.selectionStart}`

  setTimeout(updateCursorPosition, 300);
}

////////// INITIALIZATION CODE

inputTextArea.addEventListener('input', startGenerate);
setTimeout(updateCursorPosition, 300);
startGenerate();