import { div, image } from "gpui-kit";

// The animated WebP contains the actual pose sequence and longer top and bottom holds.
// This Herdr build currently shows the first frame; timer fallback is pending user approval.
export function workingScene() {
  const width = 52;
  const height = width * 170 / 240;
  return div().id("working-dc-scene").w(width).h(height).flex_none()
    .tooltip("Daniel Cormier · putting in the reps")
    .child(image("mods/agents-fighters/working-dc.webp").id("working-dc-art").w(width).h(height));
}
