# SPCM Compatibility Guide

## Introduction

This is a guide for plugin developers on how to make their plugin compatible with SPCM. This guide has two parts: 

1. How to properly implement Skyrim Platform's settings API so that your plugin can handle hot-reloading.
2. How to make an SPCM File to add or organize how your plugin's settings look in SPCM. 

If you've already implemented Skyrim Platform's settings API properly (e.g. your settings file can be edited while the game is running), you can head straight to the [SPCM File section](#spcm-file).

### Table of Contents
- [Settings API Implementation](#settings-api-implementation)
- [SPCM File](#spcm-file)
  - [Description](#description)
  - [Structure](#structure)
  - [Supported Setting Types](#supported-setting-types)
    - [Action](#action)
    - [Boolean](#boolean)
    - [Decimal and Decimal Range](#decimal-and-decimal-range)
    - [FormID](#formid)
    - [FormType](#formtype)
    - [Integer and Integer Range](#integer-and-integer-range)
    - [Key](#key)
    - [List](#list)
    - [Map](#map)
    - [Number](#number)
    - [String](#string)
    - [Values](#values)

# Settings API Implementation

To be added. 

For now refer to the [official documentation](https://github.com/skyrim-multiplayer/skymp/blob/main/docs/skyrim_platform/new_methods.md#settings) or [look at how SPCM does it](https://github.com/rzkyif/rykz-spcm/blob/master/src/main.ts).

# SPCM File

## Description

The SPCM file is a JSON file that you can use to provide additional information about the settings in your settings file. SPCM will look for SPCM files in the `Data/Platform/SPCM` folder. If your settings file is at `Data/Platform/Plugins/X-settings.txt`, you should make your SPCM file at `Data/Platform/SPCM/X.json`. 

When a companion SPCM file is not found for a settings file, SPCM will only load settings that is of type `number`, `boolean`, or `string`. The name for each setting in the SPCM menu will be each setting's key in the settings file. Type checking for user input will also be very limited, only ensuring that the input is a number.

You can generate a template for a new SPCM file from an existing settings file with the [SPCM File Generator](./spcm-generator/dist/index.html).

## Structure

The general structure of an SPCM file is as follows:

```
[    ]  {
[  1 ]    "title": "Example Settings"
[  2 ]    "categories": {
[  3 ]      "category_hotkeys": {
[  4 ]        "title": "Hotkeys",
[  5 ]        "settings": {
[  6 ]          "key_menu": {
[  7 ]            "name": "Menu Key"
[  8 ]            "desc": "The key to open the menu"
[  9 ]            "type": "key"
[ 10 ]            "default": "27"
[    ]          },
[ 11 ]          ...
[    ]        }
[    ]      },
[ 12 ]      ...
[    ]    }
[    ]  }
```

Refer to the line numbers above for the following descriptions.

| Line Number | Description                                                                                                                                                                                  |
|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1           | A `string`.  The title of the menu that will show in SPCM.                                                                                                                                   |
| 2           | An `object`.  Each key has to start with "category_", and the value should be a `Category`.                                                                                                  |
| 3           | An example `Category`, with the key "category_hotkeys".                                                                                                                                      |
| 4           | A `string`.  The title of the category that will show in SPCM.                                                                                                                               |
| 5           | An `object`.  Each key has to also exist in the settings file as an actual setting, and the value should be a Setting.                                                                            |
| 6           | An example `Setting`, with the key "key_menu".  There should also be a "key_menu" in the settings file.                                                                                      |
| 7           | A `string`.  The name of the setting that will show in SPCM.  Optional, default is the key.                                                                                                  |
| 8           | A `string`.  The description of the setting that will show in SPCM.  Optional, default is no description.                                                                                    |
| 9           | A `string`.  The type of the setting that is used for input management and checking.  Optional for settings of type `number`, `boolean`, and `string`, but it is very highly recommended that this is defined. Has to be valid according to the [supported setting types](#supported-setting-types).        |
| 10          | A value of a supported type. The default value of the setting. Optional, default is no default value (user can't reset setting to default). Has to be valid according to the setting's type. |
| 11          | Zero or more other `Setting`s.                                                                                                                                                              |
| 12          | Zero or more other `Category`s.                                                                                                                                                             |

## Supported Setting Types

The following is a list of setting types that are currently supported by SPCM. Each section will include one or more examples. 

The examples will include an example type string for that setting type and a default value with a type / structure that you can expect to receive in the actual settings file when a user modifies a setting of that setting type.

### Action
Special type of `Setting`s that doesn't need an actual counterpart in the settings file. 

It will show up as a button in SPCM that will send out a specific ModEvent when pressed.

Example `Setting`s :
```js
{
  ...
  "type": "action:Spawn,RykzChickenSpawner_Spawn"
  // will show as a button titled "Spawn" in SPCM, 
  // and will send out the "RykzChickenSpawner_Spawn" ModEvent when clicked
}
```

### Boolean
Booleans (true or false).

Example `Setting`s :
```js
{
  ...
  "type": "boolean",  // valid values are true and false
  "default": true
}
```

### Decimal and Decimal Range
Decimals and ranges of decimals. For ranges, users will input with a slider with a customizable step size.

Example `Setting`s :
```js
{
  ...
  "type": "decimal",  // valid values are ONLY decimals
  "default": 3.5
}
```
```js
{
  ...
  "type": "decimalrange:0.1,9.9",  // valid values from 0.1 to 9.9 (0.1 and 9.9 included)
  "default": 5.3
}
```
```js
{
  ...
  "type": "decimalrange:0.1,9.9,0.3",  // valid values from 0.1 to 9.9 with 0.3 as slider step
  "default": 0.4
}
```

### FormID
`FormID`s that can be used in your plugin. The actual setting value will be a number, but users will input in hex form.

Example `Setting`s :
```js
{
  ...
  "type": "formid",  // valid values are valid Skyrim FormIDs
  "default": 622440
}
```

### FormType
`FormType`s that can be used in your plugin. The actual setting value will be a number, but users will input in a dropdown containing all available `FormType`s.

Example `Setting`s :
```js
{
  ...
  "type": "formtype",  // valid values are valid Skyrim FormTypes
  "default": 42
}
```

### Integer and Integer Range
Whole numbers and ranges of whole numbers. For ranges, users will input with a slider with a customizable step size.

Example `Setting`s :
```js
{
  ...
  "type": "integer",  // valid values are ONLY whole numbers
  "default": 3
}
```
```js
{
  ...
  "type": "integerrange:1,10",  // valid values from 1 to 10 (1 and 10 included)
  "default": 3
}
```
```js
{
  ...
  "type": "integerrange:2,20,2",  // valid values from 2 to 20 with 2 as slider step
  "default": 4
}
```

### Key
`DXScanCode`s that can be used in your plugin. The actual setting value will be a number, but users will input with a key binding interface.

Example `Setting`s :
```js
{
  ...
  "type": "key",  // valid values are all valid DXScanCodes
  "default": 199
}
```

### List
Lists of other supported types.

Example `Setting`s :
```js
{
  ...
  "type": "list:number",  // valid values are all valid DXScanCodes
  "default": [
    4, 2, 0, 6.9
  ]
}
```

### Map
Maps of other supported types to other supported types.

Example `Setting`s :
```js
{
  ...
  "type": "map:string,number",  // valid values are all valid DXScanCodes
  "default": [
    ['bob', 29239],
    ['anne', 24.2]
  ]
}
```

### Number
Numbers.

Example `Setting`s :
```js
{
  ...
  "type": "number",  // valid values are valid Javascript numbers
  "default": 1024
}
```
```js
{
  ...
  "type": "number",  // valid values are valid Javascript numbers
  "default": 5.32
}
```

### String
Strings.

Example `Setting`s :
```js
{
  ...
  "type": "string",         // valid values are valid Javascript strings
  "default": "Hello World"
}
```

### Values
Single values that exists in a list that you provide. The actual setting value will be a string, but users will input with a dropdown.

Example `Setting`s :
```js
{
  ...
  "type": "values:Left,Center,Right,0",  // valid values are Left, Center, and Right
  "default": "0"
}
```