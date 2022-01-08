import { callNative, Debug, printConsole, writeLogs } from "skyrimPlatform";
import { CODENAME } from "./constants";

export function uiUrl(uiName: string) {
  return `file:///Data/Platform/UI/${CODENAME}/${uiName}.html`;
}

export function pc(message: any) {
  printConsole(`[${CODENAME}] ${message}`);
}

export function n(message: string) {
  Debug.notification(message);
}

export function log(message: string) {
  writeLogs(CODENAME, `${(new Date()).toUTCString()}: ${message}`);
}

export function me(modEventName: string) {
  let handle = callNative(
    "ModEvent",
    "Create",
    undefined,
    modEventName
  ) as number;
  if (handle) {
    callNative("ModEvent", "Send", undefined, handle);
  }
}
