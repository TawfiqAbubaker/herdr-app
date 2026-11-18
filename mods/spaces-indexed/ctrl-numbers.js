import { appHome, checking, exec, window } from "herdr";

// Modifier events on sidebar elements don't reach a focused terminal. The
// macOS helper waits for a Ctrl-state change; only changes notify this view.
export function initCtrlNumbers(view, cx) {
  view.ctrlDown = false;
  view.ctrlNumbersClosed = false;
  if (checking() || window().platform !== "macos") return;
  cx.spawn(async cx => {
    const folder = `${appHome()}/mods/spaces-indexed`;
    const binary = `${folder}/ctrl-state-macos-v1`;
    try {
      try {
        const probe = await exec(binary, ["-1"], { timeout: 2000 });
        if (probe.code !== 0) return;
      } catch {
        const built = await exec("/usr/bin/clang", ["-O2", `${folder}/ctrl-state-macos.c`, "-framework", "CoreGraphics", "-o", binary]);
        if (built.code !== 0) return;
      }
      let previous = -1;
      while (!view.ctrlNumbersClosed) {
        const result = await exec(binary, [String(previous)], { timeout: 25000 });
        if (view.ctrlNumbersClosed || result.code !== 0) return;
        const value = result.stdout.trim();
        if (value !== "0" && value !== "1") return;
        previous = Number(value);
        const down = previous === 1;
        if (view.ctrlDown !== down) {
          view.ctrlDown = down;
          cx.notify();
        }
      }
    } catch {
      // A missing compiler or unavailable helper leaves hints hidden.
      if (!view.ctrlNumbersClosed && view.ctrlDown) {
        view.ctrlDown = false;
        cx.notify();
      }
    }
  });
}

export const showCtrlNumbers = view => Boolean(view.ctrlDown && window().active);
