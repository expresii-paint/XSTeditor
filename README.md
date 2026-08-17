# XST Editor

A self-contained, browser-based editor for **Expresii Stroke Files (`.xst`)** — the
painting-stroke format used by [Expresii Paint](https://www.expresii.com/).

No build step, no server, no CDN. Just open `index.html` in a browser.

![XST Editor — editing an Expresii .xst file, with the Expresii send controls, wetness/brush
params, and a selected stroke](assets/xst-editor-screenshot.png)

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
- **Transform** a selection with an Inkscape-like two-mode handle set. Click a *selected*
  stroke (without dragging) to toggle between:
  - **Scale mode** (default): 8 resize handles for scaling around the opposite edge/centre.
  - **Rotate mode**: the 4 **corner** handles become rotation handles (drag to rotate around
    the centre), and the 4 **edge-midpoint** handles become **shear** handles (drag to skew
    around the opposite edge). Click a selected stroke again to switch back.
  Transforms are baked into the stroke coordinates, so they apply on **Save** and
  **Send selected**. The transform panel also exposes numeric translate / scale / rotate /
  flip / pressure fields for the single selected stroke.
- **Edit** per-frame coordinates in the frames table (x, y, z, pitch, roll, turn, pressure);
  insert/delete the cursor frame.
- **Tools (Inkscape-like, mutually exclusive)** in the top toolbar:
  - **Selector Tool** (default) — select & transform strokes. A selected stroke gets the
    transform handles: 4 **corner** nodes (scale in scale-mode, rotate in rotate-mode) and
    4 **edge-midpoint** nodes (scale/shear). Click a selected stroke to toggle scale/rotate.
  - **Node Tool** — edit individual stroke nodes. A selected stroke shows only a plain
    marquee around it (no transform handles); each `s`-frame is a draggable **node**.
    Drag a node to move that single frame (pressure stays the same, position is re-projected
    through the current zoom/flip); right-click a node for a popup menu where you can
    **Delete node**. Node moves are recorded in the undo history and baked into the stroke
    coordinates, so they flow through **Save** and **Send selected**. Pen-up (`pressure 0`)
    nodes are drawn dashed so you can tell them apart from ink nodes.
  - Press `n` to toggle between the two tools. The tools are exclusive: when the Selector
    Tool is active the Node Tool is not, and vice-versa.
- **Clean up commands undone** — Expresii records an *undo* as a single `u` stream
  command and a *redo* as `r` (each discards or restores the most-recently-drawn
  stroke). Those `u`/`r` commands — and the strokes they undo — stay in the file, so a
  recording full of trial strokes ends up bloated. Click **Clean up undone** (or press
  the `u` / `r` key) to replay the file's undo/redo history and rewrite it with only the
  strokes that *survived* kept, and the `u`/`r` commands themselves removed. Every kept
  line is preserved verbatim (byte-for-byte), so an already-clean file round-trips
  identically and the button reports "Nothing to clean" when there's nothing to remove.
  The cleanup is undoable via the editor's own **Undo** (Ctrl+Z) history.
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

## Sending strokes to Expresii Paint

The editor can drive a running **Expresii Paint** instance over its local Web API
(enabled in Expresii via *Enable Web API* / *Start Stroke Server*, default port 9000).

- Set the server address in the **Expresii** box on the toolbar (default `http://localhost:9000`).
- **Ping** checks the server is reachable (`GET /info`).
- **Send all** sends every stroke (the full, edited document) as one XST command set.
- **Send selected** sends only the currently selected strokes.
- **Per-stroke brush:** when a single stroke is selected, the *Selected stroke* panel has a
  **Brush — this stroke** section (wetness `w`, size `B`, scratch `i`). These write a
  per-stroke override into that stroke's own config block, so they take effect on **Save** and
  **Send selected** and override the document-wide *Global parameters*. Leave a field blank to
  fall back to the global value. (Recorded `.xst` files often already carry their own `w`/`B`/`i`
  per stroke, which is why editing the global *wetness/size* alone didn't change a specific
  stroke — use this per-stroke control for that.)

Both buttons `POST` the XST text as a multipart `message` field to `/confirm-ajax`,
then poll `/result/{id}` and show the rendered PNG in a result dialog. The selected/all
text is re-serialized from the live (edited) tree, so moves/resizes/rotations you made
are included. Strokes are sent in Expresii's own world coordinates, so they paint exactly
as recorded — no coordinate conversion needed.

Note: the editor is a static file, so open it from `file://` or any local server; the
`/confirm-ajax` (multipart) and `/info` (GET) calls are CORS-permitted by the Expresii
server, so cross-origin use works. If Expresii isn't reachable you'll get a clear hint to
enable its Web API.

## License

See the repository for license terms.
