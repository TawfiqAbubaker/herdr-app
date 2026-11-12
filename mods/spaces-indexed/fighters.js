// Stable IDs let the roster move or grow without changing existing spaces.
export const FIGHTERS = [
  { id: "conor", name: "Conor McGregor" },
  { id: "pereira", name: "Alex Pereira" },
  { id: "islam", name: "Islam Makhachev" },
  { id: "shavkat", name: "Shavkat Rakhmonov" },
  { id: "aspinall", name: "Tom Aspinall" },
  { id: "gaethje", name: "Justin Gaethje" },
  { id: "poirier", name: "Dustin Poirier" },
  { id: "oliveira", name: "Charles Oliveira" },
  { id: "merab", name: "Merab Dvalishvili" },
  { id: "topuria", name: "Ilia Topuria" },
  { id: "volkanovski", name: "Alexander Volkanovski" },
  { id: "khabib", name: "Khabib Nurmagomedov" },
  { id: "jiri", name: "Jiri Prochazka" },
  { id: "omalley", name: "Sean O'Malley" },
  { id: "ddp", name: "Dricus du Plessis" },
  { id: "yan", name: "Petr Yan" },
  { id: "paddy", name: "Paddy Pimblett" },
  { id: "prates", name: "Carlos Prates" },
  { id: "belal", name: "Belal Muhammad" },
].map(fighter => ({ ...fighter, icon: `mods/spaces-indexed/fighters/${fighter.id}.png` }));

// Keep closed/recent and temporarily disconnected spaces in saved state too.
// Each new space gets an unused fighter where possible, then any random fighter
// once every portrait is represented among the open spaces.
export function assignFighters(spaces, saved, random = Math.random) {
  const assignments = saved && typeof saved === "object" && !Array.isArray(saved) ? { ...saved } : {};
  const valid = new Set(FIGHTERS.map(fighter => fighter.id));
  const used = new Set(spaces.map(space => assignments[space.id]).filter(id => valid.has(id)));
  let changed = false;
  for (const space of spaces) {
    if (valid.has(assignments[space.id])) continue;
    const unused = FIGHTERS.filter(fighter => !used.has(fighter.id));
    const choices = unused.length ? unused : FIGHTERS;
    const fighter = choices[Math.floor(random() * choices.length)];
    assignments[space.id] = fighter.id;
    used.add(fighter.id);
    changed = true;
  }
  return { assignments, changed };
}
