import { div, image } from "gpui-kit";
// Native text frames move pixel wisps upward. Blank tail frames let them vanish
// before the next puff; the native opacity loop adds a gradual fade in and out.
// No JavaScript animation timer or sidebar-wide per-frame redraw is needed.
export const SMOKE_FRAMES = Array.from({ length: 24 }, (_, i) => {
  if (i >= 21) return "";
  const grid = Array.from({ length: 10 }, () => Array(7).fill("\u00a0"));
  const progress = i / 20;
  const row = Math.round(8 * (1 - progress));
  const col = 2 + Math.round(Math.sin(progress * Math.PI * 2));
  grid[row][col] = progress > 0.7 ? "░" : "▒";
  if (row + 1 < 10 && i > 1) grid[row + 1][Math.max(0, col - 1)] = "░";
  if (row > 0 && i > 5) grid[row - 1][Math.min(6, col + 1)] = "░";
  return grid.map(line => line.join("")).join("\n");
});

export function idleScene(t) {
  const width = 80;
  const height = width / 3;
  const imageTop = 40 - height; // Keep his ground aligned with the Idle label.
  // The approved upward-facing sprite's cigarette ember is at 22.3%, 37.4%.
  const emberX = width * 0.223;
  const emberY = imageTop + height * 0.374;
  return div().id("idle-prates-scene").relative().w(width).h(imageTop + height).flex_none()
    .tooltip("Carlos Prates · taking it easy")
    .child(image("mods/agents-fighters/idle-prates.png").id("idle-prates-art").absolute().left(0).top(imageTop).w(width).h(height))
    .child(div().id("idle-prates-smoke").absolute().left(emberX - 5).top(emberY - 20).w(20).h(20)
      .font_family("Menlo").text_size(3).line_height("2px").text_color(t.muted)
      .frames(SMOKE_FRAMES, 120)
      .loop("opacity", { from: 0.08, to: 0.7, period: 2880, easing: "ease-in-out" }));
}
