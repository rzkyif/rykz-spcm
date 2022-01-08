export default {
  "example-settings.txt": {
    "title": "Example Settings",
    "categories": {
      "category_a": {
        "title": "A",
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
            "_value": true,
            "_initialValue": true,
            "_friendlyName": true
          },
          "setting_2_decimal": {
            "name": "Decimal Setting",
            "desc": "This setting can only be decimals.",
            "type": "decimal",
            "default": 6.9,
            "_value": 3.2,
            "_initialValue": 3.2,
            "_friendlyName": true
          },
          "setting_3_decimal_range": {
            "name": "Decimal Range Setting",
            "desc": "This setting can only be a decimal in a valid range.",
            "type": "decimalrange:0.1,9.9,0.1",
            "_value": 5.2,
            "_initialValue": 5.2,
            "_friendlyName": true
          },
          "setting_4_formid": {
            "name": "FormID Setting",
            "desc": "This setting can only be a valid FormID.",
            "type": "formid",
            "_value": 622440,
            "_initialValue": 622440,
            "_friendlyName": true
          },
          "setting_5_formtype": {
            "name": "FormType Setting",
            "desc": "This setting can only be a valid FormType",
            "type": "formtype",
            "_value": 42,
            "_initialValue": 42,
            "_friendlyName": true
          },
          "setting_6_integer": {
            "name": "Integer Setting",
            "desc": "This setting can only be an integer (whole number).",
            "type": "integer",
            "_value": 225,
            "_initialValue": 225,
            "_friendlyName": true
          }
        }
      },
      "category_b": {
        "title": "B",
        "settings": {
          "setting_7_integer_range": {
            "name": "Integer Range Setting",
            "desc": "This setting can only be an integer in a valid range.",
            "type": "integerrange:0,100,10",
            "_value": 10,
            "_initialValue": 10,
            "_friendlyName": true
          },
          "setting_8_key": {
            "name": "Key Setting",
            "desc": "This setting can only be a keybind.",
            "type": "key",
            "_value": 27,
            "_initialValue": 27,
            "_friendlyName": true
          },
          "setting_9_list": {
            "name": "List of String Setting",
            "desc": "This setting can only be a list of strings.",
            "type": "list:string",
            "_value": [
              "can",
              "cat",
              "car"
            ],
            "_initialValue": [
              "can",
              "cat",
              "car"
            ],
            "_friendlyName": true
          },
          "setting_10_map": {
            "name": "Map of String to Integer Setting",
            "desc": "This setting can only be a map of string to integers.",
            "type": "map:string,integer",
            "_value": [
              ["Apple", 24],
              ["Banana", 54]
            ],
            "_initialValue": [
              ["Apple", 24],
              ["Banana", 54]
            ],
            "_friendlyName": true
          },
          "setting_11_number": {
            "name": "Number Setting",
            "desc": "This setting can only be a valid number.",
            "type": "number",
            "_value": 42.32,
            "_initialValue": 42.32,
            "_friendlyName": true
          },
          "setting_12_string": {
            "name": "String Setting",
            "desc": "This setting can only be a valid string.",
            "type": "string",
            "_value": "42",
            "_initialValue": "42",
            "_friendlyName": true
          },
          "setting_13_values": {
            "name": "Values Setting",
            "desc": "This setting can only be a valid value.",
            "type": "values:Apple,Banana,Pear of Destruction",
            "_value": "Apple",
            "_initialValue": "Apple",
            "_friendlyName": true
          }
        }
      }
    }
  },
  "raw-settings.txt": {
    "title": "raw-settings.txt",
    "categories": {
      "category_a": {
        "title": "A",
        "settings": {
          "setting_11_number": {
            "name": "setting_11_number",
            "type": "number",
            "_value": 42.32,
            "_initialValue": 42.32,
            "_friendlyName": false
          }
        }
      }
    }
  }
}