import { Input } from "skyrimPlatform";

let checks: any = {};
let keystate: any = {};

export function RegisterHotkey(
  dxScanCode: number,
  callback: (ctx: any) => void
) {
  if (dxScanCode == 0) return;
  keystate[dxScanCode] = false;
  checks[dxScanCode] = (ctx: any) => {
    if (Input.isKeyPressed(dxScanCode as number)) keystate[dxScanCode] = true;
    else if (keystate[dxScanCode]) {
      keystate[dxScanCode] = false;
      callback(ctx);
    }
  };
}

export function ClearHotkeys() {
  checks = {};
  keystate = {};
}

export function CheckHotkeys(ctx: any = {}) {
  Object.keys(checks).forEach((k) => {
    checks[k](ctx);
  });
}
