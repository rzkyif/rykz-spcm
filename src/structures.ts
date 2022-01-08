import { FormType } from "skyrimPlatform";

export type DataType = number | boolean | string | FormType | DataType[] | Map<DataType, DataType>;
export type CustomDataTypeLabel = `integer` | `integerrange:${string}` | `decimal` | `decimalrange:${string}` | `formid` | `formtype` | `key` | `values:${string}`;
export type SingleDataTypeLabel = `number` | `boolean` | `string`;
export type ObjectDataTypeLabel = 
  `map:${SingleDataTypeLabel},${SingleDataTypeLabel}` | 
  `list:${SingleDataTypeLabel}` | 
  `action:${string}`
export type DataTypeLabel = CustomDataTypeLabel | SingleDataTypeLabel | ObjectDataTypeLabel;

export let CustomDataTypeRegex = /((integer)|(integerrange:\d+,\d+(,\d+)?)|(decimal)|(decimalrange:[\d\.]+,[\d\.]+(,[\d\.]+)?)|(formid)|(formtype)|(key)|(values:[^,]+(,[^,]+)*))/gm
export let SingleDataTypeRegex = /((number)|(boolean)|(string))/gm
export let ObjectDataTypeRegex = new RegExp(`((map:(${CustomDataTypeRegex.source}|${SingleDataTypeRegex.source}),(${CustomDataTypeRegex.source}|${SingleDataTypeRegex.source}))|(list:(${CustomDataTypeRegex.source}|${SingleDataTypeRegex.source}))|(action:[^,]+,[^,]+))`, 'gm');
export let DataTypeRegex = new RegExp(`(${CustomDataTypeRegex.source}|(${SingleDataTypeRegex.source})|(${ObjectDataTypeRegex.source}))$`);

export interface PluginSetting {
  name: string | undefined,
  desc: string | undefined,
  type: DataTypeLabel | undefined,
  default: DataType | undefined,
  _value: DataType,
  _friendlyName: boolean,
  _edited: boolean,
  _initialValue: DataType
}

export interface PluginSettingCategory {
  title: string,
  settings: Record<string, PluginSetting>,
  _edited: boolean
}

export interface PluginSettings {
  title: string,
  categories: Record<string, PluginSettingCategory>,
  _edited: boolean
}

export type MappedPluginSettings = Record<`${string}-settings.txt`, PluginSettings>;