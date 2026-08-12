# XST Editor

A self-contained, browser-based editor for **Expresii Stroke Files (`.xst`)** — the
painting-stroke format used by [Expresii Paint](https://www.expresii.com/).

No build step, no server, no CDN. Just open `index.html` in a browser.

## What it does

- **Open** a `.xst` file (drag-drop, the Open button, or the Recent menu).
- **Preview** the strokes on a paper-coordinate canvas (Expresii convention: +X right,
  +Y down) with grid, axes, and zoom-to-fit.
- **Select** strokes:
  - click a stroke to select it,
  - Shift/Ctrl/Cmd-click to toggle multiple,
  - drag a **marquee** to box-select — hit-testing uses the stroke's real ink
    (segment intersection), so a long slanted stroke is *not* grabbed just because its
    bounding box overlaps the drag.
- **Move** one or many selected strokes together; right-drag to pan.
- **Edit frame** around the selection with 8 resize handles + a red rotation handle
  (drag the red handle to rotate around the selection's centre; it follows the cursor).
- **Edit frames** directly in the side table (x, y, z, pitch, roll, turn, pressure).
- **Layers** panel (reflects the file's `L` layer commands).
- **Save** via a dialog (filename + path; native picker where supported, with a
  download fallback). Untouched lines are preserved byte-for-byte; edited strokes save
  with their new values.
- **Recents** persisted in `localStorage`.

## How to use

1. Open `index.html` (double-click, or serve the folder — either works since nothing
   is fetched over the network).
2. Click **Open .xst** and pick a stroke file, or **New ▾ → Load demo strokes**.
3. Select / marquee / drag / resize / rotate as needed.
4. **Save** to write the edited file back out.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The entire editor (HTML + CSS + JS, single file). |
| `favicon.svg` / `logo.svg` | App icon / logo. |
| `test-parser.js` | Standalone parser sanity check (dev only; not loaded by the app). |

## Notes

- The editor parses `.xst` into a command tree (prelude · strokes · trailing) and keeps
  each stroke's original raw text so unmodified lines round-trip exactly.
- All coordinate math is done in data space; the preview mapping is inverted for
  mouse interaction, including cursor-anchored zoom and Y-flip.

## License

See the repository for license terms.
