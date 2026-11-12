import { div, svg, image } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { spaces, panes, props, exec, run, theme, shared, setShared, openOverlay, closeOverlay } from "herdr";
import { FIGHTERS } from "./fighters.js";
import { initFlagControls, flagControls } from "./flag-controls.js";

function menuItems(view) {
  return [
    { label: "Choose fighter…", icon: "square", picker: true },
    { label: "Rename", icon: "square-pen", command: "space.rename", args: { id: view.spaceId } },
    ...(view.checkout ? [
      { label: "New worktree", icon: "git-branch", action: "new" },
      { label: "Open worktree", icon: "git-branch", action: "open" },
    ] : []),
    ...(view.checkout === "linked" ? [{ label: "Remove worktree", icon: "git-branch", action: "remove" }] : []),
    { label: "Close", icon: "x", command: "space.close", args: { id: view.spaceId } },
  ];
}

export function initSpaceMenu(view, cx, mode) {
  view.spaceMenuMode = mode;
  view.spaceId = props().space;
  view.checkout = null;
  const selected = shared("space.fighters")?.[view.spaceId];
  view.menuIndex = mode === "fighter-picker" ? Math.max(0, FIGHTERS.findIndex(f => f.id === selected)) : 0;
  view.menuFocus = cx.focus_handle();
  view.menuFocus.focus();
  if (mode === "fighter-picker") initFlagControls(view);
  if (mode !== "space-menu") return;
  const space = spaces().find(s => s.id === view.spaceId);
  const tabs = new Set((space?.tabs ?? []).map(tab => tab.id));
  const folder = panes().find(p => tabs.has(p.tab) && p.cwd)?.cwd || space?.folder;
  if (!folder) return;
  cx.spawn(async cx => {
    try {
      const options = { cwd: folder, on: space.machine };
      const [top, common] = await Promise.all([
        exec("git", ["rev-parse", "--show-toplevel"], options),
        exec("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], options),
      ]);
      if (top.code === 0 && common.code === 0)
        view.checkout = common.stdout.trim() === `${top.stdout.trim()}/.git` ? "main" : "linked";
    } catch {}
    cx.notify();
  });
}

function choose(view, index) {
  if (!spaces().some(space => space.id === view.spaceId)) return;
  if (view.spaceMenuMode === "fighter-picker") {
    const fighter = FIGHTERS[index];
    if (!fighter) return;
    setShared("space.fighters", { ...(shared("space.fighters") ?? {}), [view.spaceId]: fighter.id });
    closeOverlay(props().overlay);
    return;
  }
  const item = menuItems(view)[index];
  if (!item) return;
  closeOverlay(props().overlay);
  if (item.picker) {
    openOverlay({ mod: "spaces-indexed", kind: "dialog", width: 520, height: 640, props: { mode: "fighter-picker", space: view.spaceId } });
  } else if (item.action) {
    openOverlay({ mod: "worktree", kind: "dialog", ...(item.action === "open" ? { width: 560, height: 480 } : { width: 440, height: 260 }), props: { space: view.spaceId, action: item.action } });
  } else run(item.command, item.args);
}

export function renderSpaceMenu(view) {
  const t = theme();
  const picker = view.spaceMenuMode === "fighter-picker";
  const space = spaces().find(space => space.id === view.spaceId);
  const list = picker ? FIGHTERS : menuItems(view);
  const selected = shared("space.fighters")?.[view.spaceId];
  const root = v_flex().id("space-fighter-menu").track_focus(view.menuFocus)
    .w_full().min_h(0).bg(t.popover).text_color(t.foreground).text_size(13)
    .on_key_down((event, cx) => {
      if (!view.menuFocus.is_focused()) return;
      if (event.key === "escape") closeOverlay(props().overlay);
      else if (event.key === "enter") choose(view, view.menuIndex);
      else {
        const step = event.key === "down" ? (picker ? 2 : 1) : event.key === "up" ? (picker ? -2 : -1) : picker && event.key === "left" ? -1 : picker && event.key === "right" ? 1 : 0;
        if (!step) return;
        view.menuIndex = Math.max(0, Math.min(list.length - 1, view.menuIndex + step));
      }
      cx.stop_propagation();
      cx.notify();
    });
  if (!space) return root.p(16).child("This space is no longer open.");
  if (!picker) return root.p(5).children(list.map((item, i) =>
    h_flex().id(`space-menu-item-${i}`).h(31).px(8).gap(9).rounded(7).items_center().cursor_pointer()
      .when(i === view.menuIndex, el => el.bg(t.selected)).hover(s => s.bg(t.hover))
      .on_click(() => choose(view, i))
      .child(svg(`mods/workspace-chrome/${item.icon}.svg`).size(14).flex_none().text_color(t.muted))
      .child(div().flex_1().child(item.label))));

  const cell = (fighter, i) => h_flex().id(`fighter-choice-${fighter.id}`).flex_1().min_w(0).h(40).px(7).gap(8)
    .items_center().rounded(7).border_1().border_color(fighter.id === selected ? t.accent : t.border)
    .when(i === view.menuIndex, el => el.bg(t.selected)).hover(s => s.bg(t.hover)).cursor_pointer()
    .tooltip(fighter.name).on_click(() => choose(view, i))
    .child(image(fighter.icon).size(32).flex_none())
    .child(div().flex_1().min_w(0).truncate().text_size(12).child(fighter.name))
    .when(fighter.id === selected, el => el.child(svg("mods/workspace-chrome/check.svg").size(13).flex_none().text_color(t.accent)));
  const rows = [];
  for (let i = 0; i < FIGHTERS.length; i += 2) {
    rows.push(h_flex().gap(8).flex_none().child(cell(FIGHTERS[i], i))
      .child(i + 1 < FIGHTERS.length ? cell(FIGHTERS[i + 1], i + 1) : div().flex_1().min_w(0)));
  }
  return root.h_full().p(14).gap(12)
    .child(h_flex().items_center().gap(8).flex_none()
      .child(v_flex().flex_1().min_w(0).gap(3)
        .child(div().text_size(17).font_bold().child("Choose fighter"))
        .child(div().text_size(12).text_color(t.muted).truncate().child(space.name)))
      .child(div().id("fighter-picker-close").size(28).rounded(6).flex().items_center().justify_center()
        .cursor_pointer().hover(s => s.bg(t.hover)).tooltip("Close")
        .on_click(() => closeOverlay(props().overlay))
        .child(svg("mods/workspace-chrome/x.svg").size(14))))
    .child(flagControls(view, t))
    .child(v_flex().flex_1().min_h(0).gap(6).overflow_y_scrollbar().children(rows))
    .child(div().flex_none().text_size(11).text_color(t.dim).child("Choose a portrait to assign it to this space."));
}
