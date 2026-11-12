import { div } from "gpui-kit";
import { h_flex, Switch, SliderState, Slider, SliderTrack, SliderIndicator, SliderThumb } from "gpui-base";
import { flagSettings, updateFlagSettings } from "./country-wash.js";

export function initFlagControls(view) {
  view.flagSlider = SliderState.new({ min: 0, max: 100, step: 1, value: Math.round(flagSettings().opacity * 100) });
  view.flagSlider.on("change", (value, cx) => {
    if (typeof value !== "number") return;
    updateFlagSettings({ opacity: value / 100 });
    cx.notify();
  });
}

export function flagControls(view, t) {
  const flags = flagSettings();
  const percentage = Math.round(flags.opacity * 100);
  if (view.flagSlider.value() !== percentage) view.flagSlider.set_value(percentage);
  const slider = Slider.new(view.flagSlider).w_full()
    .accessibility_label("Flag opacity for all spaces")
    .child(SliderTrack.new(view.flagSlider).h(24).w_full().flex().items_center()
      .child(SliderIndicator.new(view.flagSlider).relative().w_full().h(4).rounded(2).bg(t.input)
        .range_style(fill => fill.rounded(2).bg(t.accent))
        .child(SliderThumb.new(view.flagSlider).id("fighter-flag-opacity-thumb")
          .size(12).ml(-6).mt(-4).rounded(6).bg(t.foreground))));
  return h_flex().id("fighter-flag-controls").h(38).gap(8).flex_none().items_center()
    .child(Switch.new("fighter-flags-enabled").checked(flags.enabled)
      .accessibility_label("Flag backgrounds for all spaces")
      .w(28).h(16).flex_none().rounded_full().p(2).flex().items_center()
      .bg(flags.enabled ? t.accent : t.input)
      .when(flags.enabled, el => el.justify_end()).when(!flags.enabled, el => el.justify_start())
      .on_change(enabled => updateFlagSettings({ enabled }))
      .child(div().size(12).rounded_full().bg(flags.enabled ? t.accent_foreground : t.foreground)))
    .child(div().flex_none().text_size(11).text_color(t.muted).child("Flags · all"))
    .child(div().id("fighter-flag-opacity").flex_1().min_w(40)
      .tooltip("Flag opacity · applies to every space")
      .child(slider))
    .child(div().w(30).flex_none().text_right().text_size(11).text_color(t.dim).child(`${percentage}%`));
}
