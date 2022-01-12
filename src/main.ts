import {
  browser,
  Game,
  Input,
  on,
  once,
  settings,
  Ui,
  Menu,
  Sound
} from "skyrimPlatform";
import { RegisterHotkey, CheckHotkeys, ClearHotkeys } from "./hotkey";
import {
  CODENAME,
  NAME,
  SOUND_CLOSE,
  SOUND_OPEN,
  VERSION,
  NATIVE_DATATYPE_LABELS
} from "./constants";
import { me, n, pc, uiUrl } from "./util";
import { MappedPluginSettings, PluginSettings, PluginSetting, DataTypeLabel, DataTypeRegex } from './structures';
import { FilesInFolder, ReadFromFile, FileExists, WriteToFile } from '../modules/PapyrusUtil/MiscUtil';

interface HotkeyContext {
  isWriting: boolean;
  isInOtherMenu: boolean;
}

let isMenu: boolean;
let hasInitialized: boolean = false;
let firstTimeOpen: boolean;

let mappedPluginSettings: MappedPluginSettings;

export let main = () => {
  // initialization
  once("update", () => {
    if (!hasInitialized) initialize();
  });

  on("update", () => {
    // hotkey system
    let ctx: HotkeyContext = {
      isWriting: Ui.isTextInputEnabled(),
      isInOtherMenu: Ui.isMenuOpen(Menu.Cursor) && !isMenu,
    };
    CheckHotkeys(ctx);
  });

  // receive browser message
  on("browserMessage", (e) => {
    if (settings[CODENAME]["debug"]) pc("Browser: " + e.arguments);
    switch (e.arguments[0]) {
      case 'rykz-spcm-loaded':
        isMenu = true;

        browser.executeJavaScript(`dataSet(\`${encodeURIComponent(JSON.stringify(mappedPluginSettings))}\`);`);
        browser.setVisible(true);
        browser.setFocused(true);

        if (firstTimeOpen) {
          firstTimeOpen = false;
        }
        break;
      case 'rykz-spcm-save-data':
        const settingsFileName = e.arguments[1] as '-settings.txt';
        const settings = JSON.parse(decodeURIComponent(e.arguments[2] as string));

        queueSettingsSave(settingsFileName, settings);
        break;
      case 'rykz-spcm-action':
        const actionName = e.arguments[1] as string;

        queueAction(actionName);
        break;
    }
  });

  pc(`Loaded ${NAME} v${VERSION}`);
};

function initialize() {
  pc(`Initializing...`);

  ClearHotkeys();
  RegisterHotkey(settings[CODENAME]["key_menu"] as number, onKeyMenu);
  RegisterHotkey(settings[CODENAME]["key_reset"] as number, onKeyReset);
  RegisterHotkey(Input.getMappedKey("Pause", 0xff), onKeyExit);
  RegisterHotkey(Input.getMappedKey("Tween Menu", 0xff), onKeyExit);

  isMenu = false;
  firstTimeOpen = true;
  mappedPluginSettings = {};

  queueSettingsScan();

  browser.setFocused(false);
  browser.setVisible(false);

  hasInitialized = true;
}

function queueSettingsScan() {
  once('update', () => {
    for (const file of FilesInFolder('data/Platform/Plugins', '.txt')) {
      if (file.endsWith('-settings.txt')) {
        let pluginSettings = processSettingsFile(file as '-settings.txt');
        if (pluginSettings)
          mappedPluginSettings[file as '-settings.txt'] = pluginSettings;
      }
    }
  });
}

function queueSettingsSave(filename: `${string}-settings.txt`, pluginSettings: PluginSettings) {
  const filepathSettings = `Data/Platform/Plugins/${filename}`;
  mappedPluginSettings[filename] = pluginSettings;
  once('update', () => {
    let jsonSettings = JSON.parse(ReadFromFile(filepathSettings));

    if (settings[CODENAME]['create_backups']) {
      const backupFileName = `data/Platform/SPCM/Backups/${filename}`;
      if (!FileExists(backupFileName)) {
        WriteToFile(backupFileName, JSON.stringify(jsonSettings, undefined, 2), false, false);
      }
    }
    
    for (const categoryKV of Object.entries(mappedPluginSettings[filename].categories)) {
      for (const settingKV of Object.entries(categoryKV[1].settings)) {
        if (jsonSettings[settingKV[0]] !== undefined && settingKV[1]['_edited']) {
          jsonSettings[settingKV[0]] = settingKV[1]['_value'];
        }
      }
    }

    WriteToFile(filepathSettings, JSON.stringify(jsonSettings, undefined, 2), false, false);

    // force SP plugin reload by editing SPCM's settings
    const filepathSPCMSettings = `Data/Platform/Plugins/${CODENAME}-settings.txt`;
    WriteToFile(filepathSPCMSettings, ReadFromFile(filepathSPCMSettings), false, false);

    let pluginSettings = processSettingsFile(filename);
    if (pluginSettings)
      mappedPluginSettings[filename] = pluginSettings;

    browser.executeJavaScript(`dataUpdate(\`${filename}\`, \`${encodeURIComponent(JSON.stringify(mappedPluginSettings[filename]))}\`)`);

    n(`[SPCM] Modified ${filename}!`);
  });
}

function queueAction(actionName: string) {
  once('update', () => {
    me(actionName);
  });
}

function processSettingsFile(filename: `${string}-settings.txt`): PluginSettings | null {
  const filepathSettings = `Data/Platform/Plugins/${filename}`;
  const filepathSPCM = `Data/Platform/SPCM/${filename.replace('-settings.txt', '.json')}`;

  let jsonSettings: any, jsonSPCM: any = null, pluginSettings: PluginSettings | null = null, pluginSetting: PluginSetting, validSettingKeys: string[];

  // try to load settings file
  try {
    jsonSettings = JSON.parse(ReadFromFile(filepathSettings));
    validSettingKeys = Object.keys(jsonSettings).filter((settingKey) => !settingKey.startsWith('_'));
  } catch (e) {
    pc(`Failed to load ${filename}: "${filepathSettings}" is not valid JSON!`);
    return null;
  }

  // try to load SPCM file
  try {
    if (FileExists(filepathSPCM)) {
      jsonSPCM = JSON.parse(ReadFromFile(filepathSPCM));
    }
  } catch (e) {
    pc(`Warning: "${filepathSPCM}" is not valid JSON!`);
    jsonSPCM = null;
  }

  // try to process using SPCM file
  if (jsonSPCM) try {
    pluginSettings = {
      title: jsonSPCM['title'],
      categories: {},
      _edited: false
    };

    const categories = jsonSPCM.categories;
    for (const categoryKey of Object.keys(categories)) { 
      if (!categoryKey.startsWith('category_')) continue;

      pluginSettings.categories[categoryKey] = {
        title: categories[categoryKey]['title'],
        settings: {},
        _edited: false
      }

      const category = categories[categoryKey];
      for (const settingKey of Object.keys(category.settings)) {
        const setting = category.settings[settingKey];
        
        if (setting['type'] && (setting['type'] as string).search(DataTypeRegex) != 0) continue;
        if (!validSettingKeys.includes(settingKey) && (!setting['type'] || setting['type'].slice(0,6) != 'action')) continue;

        pluginSetting = {
          name: setting['name'] || settingKey,
          desc: setting['desc'] || undefined,
          type: setting['type'] ? setting['type'] : (
            NATIVE_DATATYPE_LABELS.includes(typeof jsonSettings[settingKey]) ? typeof jsonSettings[settingKey] : undefined
          ),
          default: setting['default'] || undefined,
          _value: jsonSettings[settingKey],
          _initialValue: jsonSettings[settingKey],
          _friendlyName: setting['name'] !== undefined,
          _edited: false
        };
    
        if (pluginSetting.type)
          pluginSettings.categories[categoryKey].settings[settingKey] = pluginSetting;
      }
    } 

    pc(`Loaded ${filename}! (SPCM)`);
    return pluginSettings;
  } catch (e) {
    pc(`Warning: ${filepathSPCM} is in an incorrect format!`);
  }

  // if processing using SPCM file failed or SPCM file doesn't exist, process using settings file
  if (settings[CODENAME]['load_non_spcm']) try {
    pluginSettings = {
      title: filename,
      categories: {
        category_detected: {
          title: "Detected Settings",
          settings: {},
          _edited: false
        }
      },
      _edited: false
    };

    for (const settingKey of Object.keys(jsonSettings)) { 
      if (settingKey.startsWith('_')) continue;
  
      pluginSetting = {
        name: settingKey,
        desc: undefined,
        type: NATIVE_DATATYPE_LABELS.includes(typeof jsonSettings[settingKey]) ? (typeof jsonSettings[settingKey] as DataTypeLabel) : undefined,
        default: undefined,
        _value: jsonSettings[settingKey],
        _initialValue: jsonSettings[settingKey],
        _friendlyName: false,
        _edited: false
      };
  
      if (pluginSetting.type)
        pluginSettings.categories['category_detected'].settings[settingKey] = pluginSetting;
    } 

    pc(`Loaded ${filename}! (Non-SPCM)`);
    return pluginSettings;
  } catch (e) {
    pc(`Failed to load ${filename}: Failed to parse "${filepathSettings}"!`);
    return null;
  } else {
    return null;
  }
}

function toggleMenu() {
  if (!isMenu) {
    Sound.from(Game.getFormEx(SOUND_OPEN))?.play(Game.getPlayer());
    browser.loadUrl(uiUrl("rykz-spcm"));
  } else {
    Sound.from(Game.getFormEx(SOUND_CLOSE))?.play(Game.getPlayer());
    isMenu = false;
    browser.setFocused(false);
    browser.setVisible(false);
  }
}

function onKeyMenu(c: HotkeyContext) {
  if (!c.isInOtherMenu && !c.isWriting) toggleMenu();
}

function onKeyExit() {
  if (isMenu) toggleMenu();
}

function onKeyReset() {
  initialize();
  n(`${NAME} v${VERSION} has been reset!`);
}
