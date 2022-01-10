export default {
  "example-settings.txt": {
    "title": "Example Settings",
    "categories": {
      "category_a": {
        "title": "Part 1",
        "settings": {
          "setting_0_action": {
            "name": "Action Setting",
            "desc": "This setting can be pressed to trigger an action.",
            "type": "action:Action!,Example_Action",
            "_friendlyName": true
          },
          "setting_1_boolean": {
            "name": "Boolean Setting",
            "desc": "This setting can only be true or false.",
            "type": "boolean",
            "default": true,
            "_value": true,
            "_initialValue": true,
            "_friendlyName": true
          },
          "setting_2_decimal": {
            "name": "Decimal Setting",
            "desc": "This setting can only be decimals.",
            "type": "decimal",
            "default": 3.2,
            "_value": 23.4,
            "_initialValue": 23.4,
            "_friendlyName": true
          },
          "setting_3_decimal_range": {
            "name": "Decimal Range Setting",
            "desc": "This setting can only be a decimal in a valid range.",
            "type": "decimalrange:0.1,9.9,0.1",
            "default": 5.0,
            "_value": 7.5,
            "_initialValue": 7.5,
            "_friendlyName": true
          },
          "setting_4_formid": {
            "name": "FormID Setting",
            "desc": "This setting can only be a valid FormID.",
            "type": "formid",
            "default": 622440,
            "_value": 622432,
            "_initialValue": 622432,
            "_friendlyName": true
          },
          "setting_5_formtype": {
            "name": "FormType Setting",
            "desc": "This setting can only be a valid FormType",
            "type": "formtype",
            "default": 42,
            "_value": 46,
            "_initialValue": 46,
            "_friendlyName": true
          },
          "setting_6_integer": {
            "name": "Integer Setting",
            "desc": "This setting can only be an integer (whole number).",
            "type": "integer",
            "default": 225,
            "_value": 232,
            "_initialValue": 232,
            "_friendlyName": true
          }
        }
      },
      "category_b": {
        "title": "Part 2",
        "settings": {
          "setting_7_integer_range": {
            "name": "Integer Range Setting",
            "desc": "This setting can only be an integer in a valid range.",
            "type": "integerrange:0,100,10",
            "default": 10,
            "_value": 20,
            "_initialValue": 20,
            "_friendlyName": true
          },
          "setting_8_key": {
            "name": "Key Setting",
            "desc": "This setting can only be a keybind.",
            "type": "key",
            "default": 27,
            "_value": 29,
            "_initialValue": 29,
            "_friendlyName": true
          },
          "setting_9_list": {
            "name": "List of RGBY Setting",
            "desc": "This setting can only be a list of Red, Green, Blue, and Yellow.",
            "type": "list:values:Red,Green,Blue,Yellow",
            "default": [
              "Red",
              "Green",
              "Blue",
              "Yellow"
            ],
            "_value": [
              "Green",
              "Red",
              "Blue",
              "Yellow"
            ],
            "_initialValue": [
              "Green",
              "Red",
              "Blue",
              "Yellow"
            ],
            "_friendlyName": true
          },
          "setting_10_map": {
            "name": "Map of FormType to IntegerRange Setting",
            "desc": "This setting can only be a map of FormTypes to integers from 0 to 10.",
            "type": "map:formtype,integerrange:0,10",
            "default": [
              [42, 2],
              [43, 3]
            ],
            "_value": [
              [42, 1],
              [43, 4],
              [44, 7]
            ],
            "_initialValue": [
              [42, 1],
              [43, 4],
              [44, 7]
            ],
            "_friendlyName": true
          },
          "setting_11_number": {
            "name": "Number Setting",
            "desc": "This setting can only be a valid number.",
            "type": "number",
            "default": 42.32,
            "_value": 23.125,
            "_initialValue": 23.125,
            "_friendlyName": true
          },
          "setting_12_string": {
            "name": "String Setting",
            "desc": "This setting can only be a valid string.",
            "type": "string",
            "default": "42 can be a string",
            "_value": "Hello World!",
            "_initialValue": "Hello World!",
            "_friendlyName": true
          },
          "setting_13_values": {
            "name": "Values Setting",
            "desc": "This setting can only be Apple, Banana, or Pear of Destruction.",
            "type": "values:Apple,Banana,Pear of Destruction",
            "default": "Apple",
            "_value": "Banana",
            "_initialValue": "Banana",
            "_friendlyName": true
          }
        }
      }
    }
  },
  "raw-settings.txt": {
    "title": "raw-settings.txt",
    "categories": {
      "category_detected": {
        "title": "Detected Settings",
        "settings": {
          "setting_1_boolean": {
            "name": "setting_1_boolean",
            "type": "boolean",
            "_value": true,
            "_initialValue": true,
            "_friendlyName": false
          },
          "setting_11_number": {
            "name": "setting_11_number",
            "type": "number",
            "_value": 42.32,
            "_initialValue": 42.32,
            "_friendlyName": false
          },
          "setting_12_string": {
            "name": "setting_12_string",
            "type": "string",
            "_value": "Hello World!",
            "_initialValue": "Hello World!",
            "_friendlyName": false
          },
        }
      }
    }
  }
}