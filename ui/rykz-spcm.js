////////// STYLE LOAD

// Removed by webpack:
import './rykz-spcm.less';
// import './rykz-spcm.less';

////////// CONSTANTS IMPORT

import { 
  KEY_DXSCANCODE_MAP, 
  DXSCANCODE_NAME_MAP, 
  NAME_DXSCANCODE_MAP, 
  FORMTYPE_NAME_MAP, 
  NAME_FORMTYPE_MAP, 
  FORMTYPES,
  TYPES_LEFT_RIGHT,
  TYPES_TOP_DOWN,
  LINKED_ELEMENTS
} from './js/constants';

import TEST_DATA from './js/test-data';

////////// TEMPLATES

const pluginTemplate = (index, name, categoryList, edited, raw) => {
  let categories = categoryList.map((categoryName, categoryIndex) => `
    <button${raw ? ' raw' : ''} onclick="dataSelect(${index}, ${categoryIndex})">${categoryName}</button>
  `).join('');
  return `
    <div id="m-plugin-${index}">
    <button${edited ? ' edited' : ''}${raw ? ' raw' : ''} onclick="dataSelect(${index}, 0)">${name}</button>
    <div categories>
      ${categories}
    </div>
    </div>
`;
}

const settingTemplate = (path, name, desc, type, defaultValue, value, friendlyName, edited) => {
  const splitted = type.split(':');
  const ensureType = splitted[0]
  const ensureVariables = splitted[1];
  if (TYPES_LEFT_RIGHT.includes(ensureType))
    return `
      <div id="m-setting-${path.replaceAll(',','-')}" class="m-setting" type="${ensureType=='action'?'action':'single'}">
        <div left>
          <label${friendlyName ? ' friendly' :''}>${name}</label>
          <span>${desc || ''}</span>
        </div>
        <div right>
          ${inputTemplate(path, ensureType, ensureVariables, value, defaultValue, edited)}
        </div>
      </div>
    `;
  else if (TYPES_TOP_DOWN.includes(ensureType))
    return `
      <div id="m-setting-${path.replaceAll(',','-')}" class="m-setting" type="${ensureType}">
        <div top>
          <label${friendlyName ? ' friendly' :''}>${name}</label>
          <span>${desc || ''}</span>
        </div>
        <div bottom>
          ${inputTemplate(path, ensureType, ensureVariables, value, defaultValue, edited)}
        </div>
      </div>
    `;
}

const inputTemplate = (path, ensureType, ensureVariables, value, defaultValue, edited) => {
  ensureVariables = ensureVariables ? ensureVariables.split(',') : [];
  switch (ensureType) {
    case 'number':
    case 'string':
    case 'boolean':
    case 'integer':
    case 'decimal':
    case 'formid':
    case 'formtype':
    case 'values':
    case 'key':
      return `
        <input 
            path="${path}" 
            ${defaultValue !== undefined ? 'default="'+convertToDisplay(defaultValue, ensureType)+'"' : ''}
            ${edited ? 'edited' : ''} 
            value="${convertToDisplay(value, ensureType)}" 
            ensure="${ensureType}${ensureVariables.length > 0 ? ':' + ensureVariables.join(',') : ''}" 
            disabled
          />`
    case 'decimalrange':
    case 'integerrange':
      return `
        <input 
          type="range" 
          path="${path}" 
          min="${ensureVariables[0]}" 
          max="${ensureVariables[1]}"
          ${ensureVariables[2] ? 'step="'+ensureVariables[2]+'"' : ''} 
          ${defaultValue !== undefined ? 'default="'+convertToDisplay(defaultValue, ensureType)+'"' : ''} 
          ${edited ? ' edited' : ''} 
          value="${convertToDisplay(value, ensureType)}" 
          ensure="${ensureType}${ensureVariables.length > 0 ? ':' + ensureVariables.join(',') : ''}" 
          disabled
        />
        <label range
          ${edited ? ' edited' : ''} 
        >
          ${convertToDisplay(value, ensureType)}
        </label>
      `;
    case 'action':
      return `
        <button 
          path="${path}" 
          ensure="${ensureType}${ensureVariables.length > 0 ? ':' + ensureVariables.join(',') : ''}" 
          disabled
        >
          ${ensureVariables[0]}
        </button>`
    case 'list':
    case 'map':
      let inputHTML = '';
      if (value) for (let i = 0; i < value.length; i++) {
        if (ensureType == 'list') {
          inputHTML += `
            <div entry>
              ${inputTemplate(`${path},${i}`, ensureVariables[0], '', value[i], defaultValue ? defaultValue[i] : undefined)}
              <button path="${path},${i}" delete-button>&times;</button>
            </div>`
        } else {
          inputHTML += `
            <div entry>
              ${inputTemplate(`${path},${i},0`, ensureVariables[0], '', value[i][0], defaultValue && defaultValue[i] ? defaultValue[i][0] : undefined)}
              ${inputTemplate(`${path},${i},1`, ensureVariables[1], '', value[i][1], defaultValue && defaultValue[i] ? defaultValue[i][1] : undefined)}
              <button path="${path},${i}" delete-button>&times;</button>
            </div>
          `;
        }
      }
      inputHTML += `<button path="${path}" append-button>+</button>`;
      return inputHTML;
  }
}

////////// IMPORTANT DOM MAPPINGS

const mPlugins = f('m-plugins');
const mSettings = f('m-settings');
const mSettingsTitle = f('m-settings-container').children[0];
const mOverlayKey = f('m-overlay-key');
const mSaveRevert = f('m-settings-container').children[1];
const mToggleSPCMOnly = f('m-plugins-container').children[1];
const mContextMenu = f('m-context-menu');

////////// DATA FUNCTIONS

let data = {};
let dataKeys = [];
let categoryKeys = [];
let loadedDataPath = null;
let settingsKeys = [];
let selectedPlugin = null;
let selectedCategory = null;
let pendingChanges = false;
let filterSPCMOnly = true;
let hoveredDataPath = null;

window.dataSet = dataSet;
function dataSet(dataURIComponent) {
  data = JSON.parse(decodeURIComponent(dataURIComponent));
  dataKeys = Object.keys(data);
  for (let i = 0; i < dataKeys.length; i++) {
    categoryKeys[i] = Object.keys(data[dataKeys[i]].categories);
    settingsKeys[i] = [];
    for (let j = 0; j < categoryKeys[i].length; j++) {
      settingsKeys[i][j] = Object.keys(data[dataKeys[i]].categories[categoryKeys[i][j]].settings);
    }
  }
  dataRefresh();
}

window.dataUpdate = dataUpdate;
function dataUpdate(dataKey, settingsURIComponent) {
  data[dataKey] = JSON.parse(decodeURIComponent(settingsURIComponent));
  for (let i = 0; i < dataKeys.length; i++) {
    categoryKeys[i] = Object.keys(data[dataKeys[i]].categories);
    settingsKeys[i] = [];
    for (let j = 0; j < categoryKeys[i].length; j++) {
      settingsKeys[i][j] = Object.keys(data[dataKeys[i]].categories[categoryKeys[i][j]].settings);
    }
  }
  dataRefresh();
}

function dataRefresh() {
  mPlugins.innerHTML = '';
  mSettings.innerHTML = '';
  for (let i = 0; i < dataKeys.length; i++) {
    const raw = data[dataKeys[i]].title == dataKeys[i];
    if (filterSPCMOnly && raw) continue;
    mPlugins.appendChild(elementFromHTML(pluginTemplate(i, data[dataKeys[i]].title, Object.entries(data[dataKeys[i]].categories).map((categoryKV) => categoryKV[1].title), data[dataKeys[i]]['_edited'], raw)));
  }
  mSettingsTitle.innerText = 'Settings';
  loadedDataPath = null;
  saveEditedCheck();
}

window.dataSelect = dataSelect;
function dataSelect(dataIndex, categoryIndex) {
  if (pendingChanges) return;
  if (selectedPlugin) {
    selectedPlugin.removeAttribute('selected');
    selectedPlugin.children[0].removeAttribute('selected');
    selectedPlugin.children[1].children[selectedCategory].removeAttribute('selected');
  }
  selectedCategory = categoryIndex;
  selectedPlugin = f(`m-plugin-${dataIndex}`);
  selectedPlugin.setAttribute('selected','');
  selectedPlugin.children[0].setAttribute('selected','');
  selectedPlugin.children[1].children[selectedCategory].setAttribute('selected','');
  dataLoad(dataIndex, categoryIndex);
}

function dataLoad(dataIndex, categoryIndex) {
  const categoryKeys = Object.keys(data[dataKeys[dataIndex]].categories)
  const settings = data[dataKeys[dataIndex]].categories[categoryKeys[categoryIndex]].settings;
  if (!settings) return;
  const settingsKeys = Object.keys(settings);
  mSettings.innerHTML = '';
  for (let settingIndex = 0; settingIndex < settingsKeys.length; settingIndex++) {
    const setting = settings[settingsKeys[settingIndex]];
    const settingElement = elementFromHTML(
      settingTemplate(
        `${dataIndex},${categoryIndex},${settingIndex}`, 
        setting['name'], 
        setting['desc'], 
        setting['type'], 
        setting['default'], 
        setting['_value'], 
        setting['_friendlyName'], 
        setting['_edited']
      )
    );
    mSettings.appendChild(settingElement);
    settingElement.addEventListener('mouseenter', () => {
      hoveredDataPath = settingElement.id.slice(10).replaceAll('-',',');
    });
    settingElement.addEventListener('mouseleave', () => {
      hoveredDataPath = null;
    });
  }
  loadedDataPath = `${dataIndex},${categoryIndex}`;
  mSettingsTitle.innerText = data[dataKeys[dataIndex]].title;
  linkStart(mSettings);
  saveEditedCheck();
}

window.dataToggleFilter = dataToggleFilter;
function dataToggleFilter() {
  const button = mToggleSPCMOnly.children[0];
  filterSPCMOnly = !filterSPCMOnly;
  if (filterSPCMOnly) {
    button.innerText = button.innerText.replace('Hide', 'Show');
  } else {
    button.innerText = button.innerText.replace('Show', 'Hide');
  }
  dataRefresh();
}

window.dataHideFilterButton = dataHideFilterButton;
function dataHideFilterButton() {
  mToggleSPCMOnly.setAttribute('hidden', '');
}

////////// LINKING FUNCTIONS

function linkStart(htmlElement) {
  for (const TAG of LINKED_ELEMENTS) {
    for (const element of htmlElement.getElementsByTagName(TAG)) {
      const dataPath = element.getAttribute('path');
      const ensure = element.getAttribute('ensure');

      if (!dataPath) continue;

      if (TAG == 'button') {
        if (element.hasAttribute('append-button')) {
          element.addEventListener('click', () => {
            dataPathAppendLast(dataPath);
          });
          continue;
        } else if (element.hasAttribute('delete-button')) {
          element.addEventListener('click', () => {
            dataPathDeleteRow(dataPath);
          });
          continue;
        }
      }

      if (!ensure) continue;

      const parts = ensure.split(':');
      const ensureType = parts[0];
      const ensureVariables = parts[1] ? parts[1].split(',') : [];

      element.removeAttribute('disabled');

      // input customization and validation
      switch (ensureType) {
        case 'action':
          element.addEventListener('click', () => {
            s('rykz-spcm-action', ensureVariables[1]);
          })
          break;
        case 'key':
          element.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (e.button != 0) return;

            mOverlayKey.removeAttribute('hidden');
            const getKeyFunction = function(mouseEvent) {
              mouseEvent.preventDefault();

              let key = mouseEvent.key;
              if (mouseEvent.location == KeyboardEvent.DOM_KEY_LOCATION_LEFT)
                key = 'L' + key;
              else if (mouseEvent.location == KeyboardEvent.DOM_KEY_LOCATION_RIGHT)
                key = 'R' + key;
              else if (mouseEvent.location == KeyboardEvent.DOM_KEY_LOCATION_NUMPAD)
                key = 'NP' + key;
              let scancode = KEY_DXSCANCODE_MAP[key] || 0;

              if (scancode == 0) console.log(`Can't bind key: ${key}`)

              dataPathSet(dataPath, '_value', scancode, true);

              mOverlayKey.setAttribute('hidden', '');
              document.removeEventListener('keyup', getKeyFunction);
            }
            document.addEventListener('keyup', getKeyFunction);
            const clickDetectFunction = function() {
              mOverlayKey.setAttribute('hidden', '');
              document.removeEventListener('keyup', getKeyFunction);
              mOverlayKey.removeEventListener('mousedown', clickDetectFunction);
            }
            mOverlayKey.addEventListener('mousedown', clickDetectFunction);
          });
          break;
        case 'boolean':
          element.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (e.button != 0) return;

            const value = !convertToValue(element.value, ensureType);
            dataPathSet(dataPath, '_value', value, true);
          });
          break;
        case 'decimalrange':
        case 'integerrange':
          element.addEventListener('input', function() {
            this.nextElementSibling.innerText = this.value;

            const value = convertToValue(this.value, ensureType);
            dataPathSet(dataPath, '_value', value);
          })
          break;
        case 'decimal':
          element.addEventListener('input', function() {
            let x = this.value;
            let p = this.selectionStart;

            x = x.replaceAll(/[^\d\.-]|(?<=[^^])-|\.(?=[^\.]*\.[^\.]*)|(?<=^|-)0+(?!\.|$)/g, '');

            this.value = x;
            this.selectionStart = p;
            this.selectionEnd = p;
          });
          element.addEventListener('change', function() {
            let x = this.value;

            if (!x.toString().includes('.'))
              x = x + '.';
            if (x.startsWith('.'))
              x = '0' + x;
            if (x.startsWith('-.'))
              x = x.replace('-.', '-0.');
            if (x.endsWith('.'))
              x = x + '0';
            
            this.value = x;

            const value = convertToValue(x, ensureType);
            dataPathSet(dataPath, '_value', value);
          });
          break;
        case 'formid':
          element.addEventListener('focus', function() {
            let x = this.value;

            if (x.startsWith('0x')) {
              x = x.slice(2);
            }

            this.value = x;
            this.select();
          });
          element.addEventListener('input', function() {
            let x = this.value;
            let p = this.selectionStart;

            x = x.toUpperCase().replaceAll(/[^\dABCDEF]/g, '');

            this.value = x;
            this.selectionStart = p;
            this.selectionEnd = p;
          });
          element.addEventListener('blur', function() {
            let x = this.value;
            
            x = '0x' + x.replace(/^0+/, '');
            if (x == '0x')
              x = '0x0';

            this.value = x;

            const value = convertToValue(x, ensureType);
            dataPathSet(dataPath, '_value', value);
          });
          break;
        case 'integer':
          element.addEventListener('input', function() {
            let x = this.value;
            let p = this.selectionStart;

            x = x.replaceAll(/[^\d-]|(?<=[^^])-|(?<=^|-)0+(?!$)/g, '');

            this.value = x;
            this.selectionStart = p;
            this.selectionEnd = p;
          });
          element.addEventListener('change', function() {
            let x = this.value;

            if (x == '')
              x = '0';
            else if (x == '-')
              x = '-0';

            this.value = x;

            const value = convertToValue(x, ensureType);
            dataPathSet(dataPath, '_value', value);
          });
          break;
        case 'string':
          element.addEventListener('input', function() {
            const value = convertToValue(this.value, ensureType);
            dataPathSet(dataPath, '_value', value);
          });
          break;
        case 'number':
          element.addEventListener('input', function() {
            let x = this.value;

            x = x.replaceAll(/[^\d\.-]|(?<=[^^])-|\.(?=[^\.]*\.[^\.]*)|(?<=^|-)0+(?!\.|$)/g, '');

            this.value = x;
          });
          element.addEventListener('change', function() {
            let x = this.value;

            if (x == '')
              x = '0';
            else if (x.startsWith('.'))
              x = '0' + x;
            else if (x.startsWith('-.'))
              x = x.replace('-.', '-0.');
            else if (x.endsWith('.'))
              x = x.slice(0,-1);
            
            this.value = x;

            const value = convertToValue(x, ensureType);
            dataPathSet(dataPath, '_value', value);
          });
          break;
        case 'formtype':
          applyAutoComplete(element, FORMTYPES);
          element.addEventListener('focus', function() {
            this.select();
          });
          element.addEventListener('change', function() {
            let x = this.value;

            if (!FORMTYPES.includes(x))
              x = 'None';
            
            this.value = x;

            const value = convertToValue(x, ensureType);
            dataPathSet(dataPath, '_value', value);
          });
          break;
        case 'values':
          applyAutoComplete(element, ensureVariables);
          element.addEventListener('focus', function() {
            this.select();
          });
          element.addEventListener('change', function() {
            let x = this.value;

            if (!ensureVariables.includes(x))
              x = ensureVariables[0];
            
            this.value = x;

            const value = convertToValue(x, ensureType);
            dataPathSet(dataPath, '_value', value);
          });
          break;
        default:
          element.setAttribute('disabled', '');
          break;
      }
    }
  }
  
}

////////// DATA PATH FUNCTIONS

function dataPathSet(dataPath, property, value, setElementValue=false) {
  const parts = dataPath.split(',');

  const dataKey = dataKeys[parts[0]];

  if (parts.length == 1) {
    data[dataKey][property] = value;
    return;
  }

  const categoryKey = categoryKeys[parts[0]][parts[1]];

  if (parts.length == 2) {
    data[dataKey].categories[categoryKey][property] = value;
    return;
  }

  const settingsKey = settingsKeys[parts[0]][parts[1]][parts[2]];
  const setting = data[dataKey].categories[categoryKey].settings[settingsKey]
  const settingDataPath = `${parts[0]},${parts[1]},${parts[2]}`;
  const ensureType = setting['type'].split(':')[0];

  if (property != '_value' && property != '_initialValue') {
    setting[property] = value;
  } else {
    if (parts.length == 3) {
      setting[property] = value;
    } else if (parts.length == 4) {
      setting[property][parts[3]] = value;
    } else if (parts.length == 5) {
      setting[property][parts[3]][parts[4]] = value;
    }
    if (property == '_value') {
      if (setElementValue) {
        switch (ensureType) {
          case 'list':
          case 'map':
            const bottomDivElement = dataPathElement(dataPath);
            if (bottomDivElement)  {
              const settingElement = bottomDivElement.parentElement;
              const newSettingElement = elementFromHTML(settingTemplate(
                settingDataPath, 
                setting['name'], 
                setting['desc'], 
                setting['type'], 
                setting['default'], 
                setting['_value'], 
                setting['_friendlyName'], 
                setting['_edited']
              ))
              settingElement.replaceWith(newSettingElement);
              newSettingElement.addEventListener('mouseenter', () => {
                hoveredDataPath = settingElement.id.slice(10).replaceAll('-',',');
              });
              newSettingElement.addEventListener('mouseleave', () => {
                hoveredDataPath = null;
              });
              linkStart(newSettingElement);
            }
            break;
          default:
            elementSetValue(dataPathElement(dataPath), convertToDisplay(value, ensureType));
            break;
        }
      }
      dataPathMarkEdited(settingDataPath, !simpleEqual(dataPathGet(settingDataPath, '_value'), dataPathGet(settingDataPath, '_initialValue')));
    }
  }
}

function dataPathGet(dataPath, property) {
  const parts = dataPath.split(',');
  if (parts.length < 3) return null;

  const dataKey = dataKeys[parts[0]];
  const categoryKey = categoryKeys[parts[0]][parts[1]];
  const settingsKey = settingsKeys[parts[0]][parts[1]][parts[2]];

  if (property != '_value' && property != '_initialValue') {
    return data[dataKey].categories[categoryKey].settings[settingsKey][property];
  } else {
    if (parts.length == 3) {
      return data[dataKey].categories[categoryKey].settings[settingsKey][property];
    } else if (parts.length == 4) {
      return data[dataKey].categories[categoryKey].settings[settingsKey][property][parts[3]];
    } else if (parts.length == 5) {
      return data[dataKey].categories[categoryKey].settings[settingsKey][property][parts[3]][parts[4]];
    }
  }
}

window.dataPathAppendLast = dataPathAppendLast;
function dataPathAppendLast(dataPath) {
  const parts = dataPath.split(',');
  if (parts.length != 3) return;

  const dataKey = dataKeys[parts[0]];
  const categoryKey = categoryKeys[parts[0]][parts[1]];
  const settingsKey = settingsKeys[parts[0]][parts[1]][parts[2]];

  const setting = data[dataKey].categories[categoryKey].settings[settingsKey];
  const ensureType = setting['type'].split(':')[0]

  if (!['list', 'map'].includes(ensureType)) return;

  setting['_value'].push(ensureType == 'list' ? null : [null, null]);

  const loadedParts = loadedDataPath.split(',');
  dataLoad(loadedParts[0], loadedParts[1]);
  dataPathMarkEdited(dataPath);
  dataPathRefreshInputs(dataPath);
}

window.dataPathDeleteRow = dataPathDeleteRow;
function dataPathDeleteRow(dataPath) {
  const parts = dataPath.split(',');
  if (parts.length != 4) return;

  const dataKey = dataKeys[parts[0]];
  const categoryKey = categoryKeys[parts[0]][parts[1]];
  const settingsKey = settingsKeys[parts[0]][parts[1]][parts[2]];

  const setting = data[dataKey].categories[categoryKey].settings[settingsKey];
  const ensureType = setting['type'].split(':')[0]

  if (!['list', 'map'].includes(ensureType)) return;

  setting['_value'].splice(parts[3], 1);

  const loadedParts = loadedDataPath.split(',');
  dataLoad(loadedParts[0], loadedParts[1]);
  dataPathMarkEdited(dataPath);
  dataPathRefreshInputs(dataPath);
}

window.dataPathElement = dataPathElement;
function dataPathElement(dataPath) {
  const parts = dataPath.split(',');
  try {
    switch (parts.length) {
      case 1: // plugin
        return f(`m-plugin-${parts[0]}`).children[0];
      case 2: // category
        return f(`m-plugin-${parts[0]}`).children[1].children[parts[1]];
      case 3: // single input / button
        const setting = f(`m-setting-${parts[0]}-${parts[1]}-${parts[2]}`);
        if (setting.children[1].hasAttribute('bottom'))
          return setting.children[1];
        else
          return setting.children[1].children[0];
      case 4: // list input
        return f(`m-setting-${parts[0]}-${parts[1]}-${parts[2]}`).children[1].children[parts[3]];
      case 5: // map input
        return f(`m-setting-${parts[0]}-${parts[1]}-${parts[2]}`).children[1].children[parts[3]][parts[4]];
      default:
        return undefined;
    }
  } catch (e) {
    return undefined;
  }
}

window.dataPathMarkEdited = dataPathMarkEdited;
function dataPathMarkEdited(dataPath, edited=true, check=true) {
  dataPathSet(dataPath, '_edited', edited);

  const element = dataPathElement(dataPath);
  if (element) {
    elementMarkEdited(element, edited);
    if (check) saveEditedCheck();
  }
}

window.dataPathRefreshInputs = dataPathRefreshInputs;
function dataPathRefreshInputs(dataPath) {
  const element = dataPathElement(dataPath);
  if (element) {
    switch (element.tagName) {
      case 'INPUT':
        element.dispatchEvent(new Event('input'));
        element.dispatchEvent(new Event('change'));
        element.dispatchEvent(new Event('blur'));
        break;
      case 'DIV':
        for (const inputElement of element.getElementsByTagName('input')) {
          inputElement.dispatchEvent(new Event('input'));
          inputElement.dispatchEvent(new Event('change'));
          inputElement.dispatchEvent(new Event('blur'));
        }
        break;
    }
  }
}

////////// SAVE FUNCTIONS

function saveEditedCheck() {
  for (let i = 0; i < dataKeys.length; i++) {
    dataPathMarkEdited(`${i}`, false, false);
    for (let j = 0; j < categoryKeys[i].length; j++) {
      dataPathMarkEdited(`${i},${j}`, false, false);
      for (let k = 0; k < settingsKeys[i][j].length; k++) {
        if (data[dataKeys[i]].categories[categoryKeys[i][j]].settings[settingsKeys[i][j][k]]['_edited']) {
          dataPathMarkEdited(`${i}`, true, false);
          dataPathMarkEdited(`${i},${j}`, true, false);
          dataPathMarkEdited(`${i},${j},${k}`, true, false);
        }
      }
    }
  }
  if (loadedDataPath && data[dataKeys[loadedDataPath.split(',')[0]]]['_edited']) {
    mSaveRevert.removeAttribute('hidden');
  } else {
    mSaveRevert.setAttribute('hidden', '');
  }
}

window.saveStart = saveStart;
function saveStart() {
  if (loadedDataPath) {
    const fileName = dataKeys[loadedDataPath.split(',')[0]];
    const saveData = encodeURIComponent(JSON.stringify(data[fileName]));

    s('rykz-spcm-save-data', fileName, saveData);
  }
}

window.saveRevert = saveRevert;
function saveRevert() {
  if (loadedDataPath) {
    const i = loadedDataPath.split(',')[0]

    for (let j = 0; j < categoryKeys[i].length; j++) {
      for (let k = 0; k < settingsKeys[i][j].length; k++) {
        const dataPath = `${i},${j},${k}`
        if (dataPathGet(dataPath, '_edited')) {
          dataPathSet(dataPath, '_value', simpleClone(dataPathGet(dataPath, '_initialValue')), true);
        }
      }
    }

    saveEditedCheck();
  }
}

////////// DATA CONVERSION FUNCTIONS

function convertToDisplay(value, ensureType=null) {
  if (value === null || value === undefined) return value;
  switch (ensureType) {
    case "key":
      return DXSCANCODE_NAME_MAP[value];
    case "boolean":
      return value === true ? 'On' : 'Off';
    case "formid":
      return '0x' + value.toString(16).toUpperCase();
    case "formtype":
      return FORMTYPE_NAME_MAP[value];
    default:
      return value.toString();
  }
}

function convertToValue(display, ensureType=null) {
  if (display === null || display === undefined) return display;
  switch (ensureType) {
    case "integer":
      return parseInt(display);
    case "decimal":
    case "number":
      return parseFloat(display);
    case "key":
      return NAME_DXSCANCODE_MAP[display];
    case "boolean":
      return display === 'On';
    case "formid":
      return parseInt(display.slice(2), 16);
    case "formtype":
      return NAME_FORMTYPE_MAP[display];
    default:
      return display;
  }
}

////////// CONTEXT MENU FUNCTIONS

let selectedDataPath = null;

function contextMenuSetup() {
  document.addEventListener('contextmenu', contextMenuOpen);
  mContextMenu.addEventListener('mouseleave', contextMenuClose);
  for (let i = 0; i < mContextMenu.children.length; i++) {
    mContextMenu.children[i].addEventListener('click', () => {contextMenuAction(i)});
  }
}

function contextMenuOpen(event) {
  event.preventDefault();
  if (!hoveredDataPath) return;
  selectedDataPath = hoveredDataPath;
  mContextMenu.style.left = (event.pageX - remToPx(0.3) + 'px');
  mContextMenu.style.top = (event.pageY - remToPx(0.3) + 'px');
  mContextMenu.removeAttribute('hidden');
  if (dataPathGet(selectedDataPath, 'default') !== undefined) {
    mContextMenu.children[1].removeAttribute('hidden');
  } else {
    mContextMenu.children[1].setAttribute('hidden', '');
  }
}

function contextMenuClose() {
  selectedDataPath = null;
  mContextMenu.setAttribute('hidden', true);
}

function contextMenuAction(index) {
  switch (index) {
    case 0: // reset to initial value
      dataPathSet(selectedDataPath, '_value', simpleClone(dataPathGet(selectedDataPath, '_initialValue')), true);
      break;
    case 1: // reset to default value
      dataPathSet(selectedDataPath, '_value', simpleClone(dataPathGet(selectedDataPath, 'default')), true);
      break;
    default:
      break;
  }
  contextMenuClose();
}

////////// UTILITY FUNCTIONS

window.s = s;
function s() {
  if (window.skyrimPlatform && window.skyrimPlatform.sendMessage)
    window.skyrimPlatform.sendMessage.apply(null, arguments);
  else 
    console.log(`Sending: ${Array.from(arguments)}`)
}

window.f = f;
function f(id) {
  return document.getElementById(id);
}

window.test = test;
function test() {
  dataSet(encodeURIComponent(JSON.stringify(TEST_DATA)));
}

function elementFromHTML(html) {
  var template = document.createElement('template');
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

function elementMarkEdited(htmlElement, edited=true) {
  if (!htmlElement) return;
  htmlElement.toggleAttribute('edited', edited);
  const type = htmlElement.getAttribute('ensure');
  const ensureType = type ? htmlElement.getAttribute('ensure').split(':')[0] : null;

  // mark additional elements for certain types
  switch (ensureType) {
    case 'decimalrange':
    case 'integerrange':
      htmlElement.nextElementSibling.toggleAttribute('edited', edited);
  }
}

function elementSetValue(htmlElement, value) {
  if (!htmlElement) return;
  htmlElement.value = value;
  const type = htmlElement.getAttribute('ensure');
  const ensureType = type ? htmlElement.getAttribute('ensure').split(':')[0] : null;

  // set additional values for certain types
  switch (ensureType) {
    case 'decimalrange':
    case 'integerrange':
      htmlElement.nextElementSibling.innerText = value;
  }
}

function remToPx(rem) {    
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function simpleClone(object) {
  return JSON.parse(JSON.stringify(object));
}

function simpleEqual(object1, object2) {
  return JSON.stringify(object1) === JSON.stringify(object2);
}

function applyAutoComplete(inputElement, values) {
  if (!inputElement) return;

  const dropdown = document.createElement('div');
  dropdown.classList.add('m-autocomplete-dropdown');
  dropdown.toggleAttribute('hidden', true)

  let parent = inputElement.parentElement;
  while (!parent.id.startsWith('m-setting')) {
    parent = parent.parentElement;
  }
  parent.appendChild(dropdown);

  inputElement.addEventListener('input', function() {
    let parent = this.parentElement, offsetTop = this.offsetTop, offsetLeft = this.offsetLeft;
    while (!parent.id.startsWith('m-setting')) {
      offsetTop += parent.offsetTop;
      offsetLeft += parent.offsetLeft;
      parent = parent.parentElement;
    }
    if (window.skyrimPlatform) {
      dropdown.style.top = (offsetTop + this.offsetHeight - 1) + 'px';
      dropdown.style.left = (offsetLeft) + 'px';
    } else {
      dropdown.style.top = (offsetTop + this.offsetHeight - 2) + 'px';
      dropdown.style.left = (offsetLeft + 1) + 'px';
    }
    dropdown.style.width = (this.offsetWidth - 2) + 'px';

    const searchResult = this.value != '' ? values.filter((value) => value.toLowerCase().startsWith(this.value.toLowerCase())) : values;
    dropdown.innerHTML = '';
    for (const result of searchResult) {
      const button = elementFromHTML(this.value != '' ? `
        <button>
          ${result.slice(0,this.value.length)}<span>${result.slice(this.value.length)}</span>
        </button>
      ` : `
        <button>
          ${result}
        </button>
      `)
      button.addEventListener('mousedown', ()=>{this.value = button.innerText});
      dropdown.appendChild(button);
    }
    dropdown.removeAttribute('hidden');
  });

  inputElement.addEventListener('blur', function() {
    dropdown.innerHTML = '';
    dropdown.toggleAttribute('hidden', true);
  });
}

////////// STARTUP CODE

window.onload = () => {
  setTimeout(() => {
    s('rykz-spcm-loaded');
  }, 200);
};
if (!window.skyrimPlatform) {
  test();
}
contextMenuSetup();