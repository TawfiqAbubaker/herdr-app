import { appHome, checking, exec, shared, setShared, window } from "herdr";

// Global preference; missing means the usual always-visible numbers.
export const hideSpaceNumbers = () => shared("spaces.hide-numbers-until-ctrl") === true;
export const setHideSpaceNumbers = value => setShared("spaces.hide-numbers-until-ctrl", Boolean(value));

// Modifier events on sidebar elements don't reach a focused terminal. The
// macOS helper waits for a Ctrl-state change; only changes notify this view.
export function initCtrlNumbers(view, cx) {
  view.ctrlDown = false;
  view.ctrlNumbersClosed = false;
  syncCtrlNumbers(view, cx);
}

export function syncCtrlNumbers(view, cx) {
  if (checking() || !hideSpaceNumbers() || window().platform !== "macos"
      || view.ctrlNumbersClosed || view.ctrlNumbersRunning || view.ctrlNumbersUnavailable) return;
  view.ctrlNumbersRunning = true;
  cx.spawn(async cx => {
    const folder = `${appHome()}/mods/spaces-indexed`;
    const binary = `${folder}/ctrl-state-macos-v1`;
    try {
      try {
        const probe = await exec(binary, ["-1"], { timeout: 2000 });
        if (probe.code !== 0) { view.ctrlNumbersUnavailable = true; return; }
      } catch {
        const built = await exec("/usr/bin/clang", ["-O2", `${folder}/ctrl-state-macos.c`, "-framework", "CoreGraphics", "-o", binary]);
        if (built.code !== 0) { view.ctrlNumbersUnavailable = true; return; }
      }
      let previous = -1;
      while (!view.ctrlNumbersClosed && hideSpaceNumbers()) {
        const result = await exec(binary, [String(previous)], { timeout: 25000 });
        if (view.ctrlNumbersClosed) return;
        if (result.code !== 0) { view.ctrlNumbersUnavailable = true; return; }
        const value = result.stdout.trim();
        if (value !== "0" && value !== "1") { view.ctrlNumbersUnavailable = true; return; }
        previous = Number(value);
        const down = previous === 1;
        if (view.ctrlDown !== down) {
          view.ctrlDown = down;
          cx.notify();
        }
      }
    } catch {
      view.ctrlNumbersUnavailable = true;
      // A missing compiler or unavailable helper leaves hints hidden.
      if (!view.ctrlNumbersClosed && view.ctrlDown) {
        view.ctrlDown = false;
        cx.notify();
      }
    } finally {
      view.ctrlNumbersRunning = false;
    }
  });
}

export const showCtrlNumbers = view => !hideSpaceNumbers() || Boolean(view.ctrlDown && window().active);
