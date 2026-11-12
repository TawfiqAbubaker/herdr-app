import { div, svg, PathBuilder } from "gpui-kit";
import { h_flex } from "gpui-base";
import { shared, setShared } from "herdr";

export const FIGHTER_COUNTRIES = {
  conor: ["ireland"], pereira: ["brazil"], islam: ["russia"],
  shavkat: ["kazakhstan"], aspinall: ["england"], gaethje: ["usa"],
  poirier: ["usa"], oliveira: ["brazil"], merab: ["georgia"],
  topuria: ["georgia", "spain"], volkanovski: ["australia"],
  khabib: ["russia"], jiri: ["czechia"], omalley: ["usa"],
  ddp: ["south-africa"], yan: ["russia"], paddy: ["england"],
  prates: ["brazil"], belal: ["palestine"],
};
export const HAS_COUNTRY_WASH = new Set(Object.keys(FIGHTER_COUNTRIES));
export const FLAG_SETTINGS_KEY = "space.flag-style";

export function normalizeFlagSettings(value) {
  return {
    enabled: value?.enabled !== false,
    opacity: typeof value?.opacity === "number" && Number.isFinite(value.opacity)
      ? Math.max(0, Math.min(1, value.opacity)) : 0.03,
  };
}
export const flagSettings = () => normalizeFlagSettings(shared(FLAG_SETTINGS_KEY));
export function updateFlagSettings(patch) {
  const previous = flagSettings();
  const next = normalizeFlagSettings({ ...previous, ...patch });
  if (previous.enabled !== next.enabled || previous.opacity !== next.opacity)
    setShared(FLAG_SETTINGS_KEY, next);
}

function shape(points, colour) {
  const path = PathBuilder.fill().add_polygon(points.map(([x, y]) => [`${x}%`, `${y}%`])).build();
  return window.paint_path(path, colour).absolute().left(0).top(0).size_full();
}
const rect = (x, y, width, height, colour) => shape([[x,y],[x+width,y],[x+width,y+height],[x,y+height]], colour);
function star(x, y, size, points = 5) {
  return shape(Array.from({ length: points * 2 }, (_, i) => {
    const radius = i % 2 ? size * 0.4 : size;
    const angle = -Math.PI / 2 + i * Math.PI / points;
    return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius];
  }), "#FFFFFF");
}
function cross(x, y, width, height, thickness, colour) {
  return [rect(x, y + (height-thickness)/2, width, thickness, colour), rect(x+(width-thickness)/2, y, thickness, height, colour)];
}
function horizontal(root, colours, weights = colours.map(() => 1)) {
  const total = weights.reduce((sum, value) => sum + value, 0);
  let y = 0;
  colours.forEach((colour, i) => {
    const height = weights[i] / total * 100;
    root.child(rect(0, y, 100, height, colour));
    y += height;
  });
  return root;
}

function flag(country) {
  const root = div().relative().flex_1().min_w(0).h_full().overflow_hidden();
  switch (country) {
    case "brazil":
      return root.bg("#009739")
        .child(shape([[50,4],[92,50],[50,96],[8,50]], "#FFDF00"))
        .child(div().absolute().left("43%").top("20%").w("14%").h("60%").rounded_full().bg("#002776"));
    case "russia": return horizontal(root, ["#FFFFFF", "#0039A6", "#D52B1E"]);
    case "ireland":
      return root.bg("#FFFFFF").child(rect(0,0,100/3,100,"#169B62")).child(rect(200/3,0,100/3,100,"#FF883E"));
    case "england": return root.bg("#FFFFFF").children(cross(0,0,100,100,20,"#CE1124"));
    case "georgia":
      root.bg("#FFFFFF").children(cross(0,0,100,100,14,"#FF0000"));
      for (const x of [20,70]) for (const y of [18,65]) root.children(cross(x,y,10,17,4,"#FF0000"));
      return root;
    case "spain": return horizontal(root,["#AA151B","#F1BF00","#AA151B"],[1,2,1]);
    case "czechia": return horizontal(root,["#FFFFFF","#D7141A"]).child(shape([[0,0],[50,50],[0,100]],"#11457E"));
    case "palestine": return horizontal(root,["#000000","#FFFFFF","#007A3D"]).child(shape([[0,0],[40,50],[0,100]],"#CE1126"));
    case "kazakhstan":
      return root.bg("#00AFCA").child(rect(5,8,3,84,"#FEC50C"))
        .child(div().absolute().left("43%").top("15%").w("14%").h("43%").rounded_full().bg("#FEC50C"))
        .child(shape([[29,61],[45,69],[50,64],[55,69],[71,61],[61,77],[50,81],[39,77]],"#FEC50C"));
    case "south-africa":
      return root.bg("#FFFFFF")
        .child(shape([[0,0],[100,0],[100,33],[47,33],[9,0]],"#E03C31"))
        .child(shape([[0,100],[9,100],[47,67],[100,67],[100,100]],"#001489"))
        .child(shape([[0,0],[45,40],[100,40],[100,60],[45,60],[0,100],[0,76],[31,50],[0,24]],"#007749"))
        .child(shape([[0,12],[40,50],[0,88]],"#FFB81C"))
        .child(shape([[0,23],[29,50],[0,77]],"#000000"));
    case "usa":
      root.bg("#FFFFFF");
      {
        const stripes = PathBuilder.fill();
        for (let i = 0; i < 13; i += 2) {
          const top = i * 100 / 13, bottom = (i + 1) * 100 / 13;
          stripes.add_polygon([["0%", `${top}%`], ["100%", `${top}%`], ["100%", `${bottom}%`], ["0%", `${bottom}%`]]);
        }
        root.child(window.paint_path(stripes.build(), "#B31942").absolute().left(0).top(0).size_full());
      }
      return root.child(rect(0,0,40,700/13,"#0A3161"))
        .child(svg("mods/spaces-indexed/flag-us-stars.svg").absolute().left(0).top(0).w("40%").h("53.85%").text_color("#FFFFFF"));
    case "australia":
      root.bg("#012169")
        .child(shape([[0,0],[4,0],[45,43],[45,50],[41,50],[0,7]],"#FFFFFF"))
        .child(shape([[41,0],[45,0],[45,7],[4,50],[0,50],[0,43]],"#FFFFFF"))
        .child(rect(0,18,45,14,"#FFFFFF")).child(rect(16,0,13,50,"#FFFFFF"))
        .child(rect(0,21,45,8,"#C8102E")).child(rect(19,0,7,50,"#C8102E"));
      for(const [x,y,size] of [[22,76,8],[73,19,5],[61,50,5],[88,44,5],[74,83,5],[80,61,3]]) root.child(star(x,y,size,7));
      return root;
    default: return root;
  }
}

export function countryWash(fighterId) {
  return h_flex().absolute().left(0).top(0).size_full().rounded(8).overflow_hidden()
    .opacity(flagSettings().opacity)
    .children((FIGHTER_COUNTRIES[fighterId] ?? []).map(flag));
}
