# Herdr app personal config

This repository lives at `~/.config/herdr-app`, the folder Herdr reads directly. Edits to tracked files apply to the running app.

## Tracked files

- `keys.json` — personal keyboard shortcuts
- `layouts/UFCisco.json` — custom layout
- `mods/spaces-indexed/` — numbered Spaces sidebar
- `mods/tabs-indexed/` — tab indices and keyboard prompts

Herdr-generated state, logs, sockets, shipped defaults, and generated type declarations are intentionally ignored.

Use `git status` and `git diff` to review edits, then commit them. Once a private GitHub remote is connected, use `git push` to back them up.
