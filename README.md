# UFCisco for Herdr

A personal Herdr layout with UFC fighter portraits, random persistent space assignments, a fighter picker, global flag controls, an animated Idle illustration, compact tabs and panes, and custom macOS shortcuts.

## Requirements

- Herdr app and herdr-core installed. Checked with Herdr app 0.1.15 and hc 0.1.20.
- Herdr supplies its standard mods, icons, and native JavaScript APIs on startup.
- Fighter artwork is included locally; no image generation or API key is needed to use it.

## Install

Quit Herdr before replacing an existing configuration. Replace `YOUR_REPOSITORY_URL` below with this repository's clone URL.

```sh
# Preserve any existing configuration first.
if [ -d "$HOME/.config/herdr-app" ]; then
  mv "$HOME/.config/herdr-app" "$HOME/.config/herdr-app.backup-$(date +%Y%m%d-%H%M%S)"
fi

git clone YOUR_REPOSITORY_URL "$HOME/.config/herdr-app"
```

Open Herdr so it creates its standard files, then activate the custom layout:

```sh
herdr-app do layout.switch '{"name":"UFCisco"}'
```

An existing nonempty configuration folder cannot be the destination of a fresh `git clone`; back it up as shown above.

## Included

- `layouts/UFCisco.json` and `keys.json`: layout and keyboard shortcuts.
- `mods/spaces-indexed/`: fighter artwork, random space assignments, fighter picker, and global flag controls.
- `mods/tabs-indexed/`: compact numbered tabs and close confirmation.
- `mods/agents-fighters/`: custom agent sidebar and animated reclining Carlos Prates.
- `mods/ufc-chrome/`: UFC header logo.
- Portrait prompt template and generation records under `mods/spaces-indexed/fighters/`.

Session search is not part of this layout.

## Local state

Each installation uses its own spaces, running terminals, Codex sessions, connected machines, credentials, and saved fighter assignments. Those are not copied by this repository. New spaces receive their own random fighters.

The selected layout, flag enable/opacity preferences, and other saved UI state are local. Flags default to enabled at 3% opacity. Fonts, theme, zoom, and sounds use that installation's settings because `settings.json` is not tracked. Keyboard shortcuts are configured for macOS.

Herdr-generated files, logs, sockets, shipped defaults, and generated type declarations are intentionally ignored. Edit personal mods and layouts, review with `git diff`, then commit and push to share changes.
