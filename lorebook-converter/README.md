# Lorebook Converter

Converts lorebook JSON arrays into SillyTavern-compatible format. Runs entirely in the browser — no backend, no dependencies.

**[Live demo →](https://yourusername.github.io/lorebook-converter/)**

## Usage

1. Paste your lorebook JSON (expected format: an array of entry objects)
2. Toggle options as needed
3. Hit **Convert & Download**

On iOS, the file will open in a new tab — tap **Share → Save to Files** to save it.

## Options

| Option | Description |
|---|---|
| Match Whole Words | Preserves the `matchWholeWords` field from source entries |
| Preserve Disabled | Keeps entries where `enabled: false` |
| Auto Selective | Enables `selective` for entries that have secondary keys |
| Use Probability | Sets `useProbability: true` on all entries |

## Hosting on GitHub Pages

1. Fork or upload this repo
2. Go to **Settings → Pages → Source → Deploy from branch → `main` / `root`**
3. Your tool will be live at `https://yourusername.github.io/lorebook-converter/`

## Files

```
index.html      — markup
style.css       — all styling
converter.js    — conversion logic + download handling
```
