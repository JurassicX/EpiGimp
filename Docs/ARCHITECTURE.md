# Architecture

How the code works. For install and commands, see the [README](../README.md).

## The core idea

The `<canvas>` on screen is **not** the image. It is only a display.

The real image is an `EpiDocument`: a list of layers, each owning its own
`OffscreenCanvas` (a canvas held in memory, never added to the page). What you
see is those layers stacked on top of each other.

```
Layer 2  (blue circle)   ┐
Layer 1  (red square)    ├─ renderDocument() ─→  the visible <canvas>
Layer 0  (background)    ┘
```

## Where things live

```
src/electron/     Desktop window (Electron main process)
src/ui/
  App.tsx         Owns the state, composes the 4 panels
  core/           Pure TypeScript: no React, no DOM
    document.ts   EpiDocument and Layer types  (issue #4)
    renderer.ts   Stacks the layers onto the screen  (issue #5)
    filters.ts    Image filter settings
  mouse/          Pointer position and pressure  (issue #8)
  brush/          Painting onto a layer  (issue #9)
  panels/         The 4 regions: TopBar, ToolPanel, CanvasArea, LayersPanel
  components/     Generic reusable UI (Slider)
  hooks/          Reusable stateful logic
  styles/         Global tokens
```

Rule of thumb: if a file needs React, it does not belong in `core/`.

## Data flow

State lives in `App.tsx` and flows down as props. Panels never hold shared
state; they report changes back through callbacks. This keeps one source of
truth, so the sliders and the canvas can never disagree.

## The drawing loop

```
pointerdown/move  →  getMousePos()   screen coords → document coords + pressure
                  →  drawStroke()    stamps circles between the two last points
                  →  drawCircle()    draws on the ACTIVE layer only
                  →  renderDocument() re-stacks every layer onto the screen
```

`drawStroke` exists because pointer events fire every 8-16ms: a fast drag skips
large gaps, so the points in between have to be filled in.

## Conventions

- `layers[0]` is the **bottom** layer. The layers panel must display the list reversed.
- The selected layer is tracked by `activeLayerId`, never by array index, because
  indexes shift when layers are reordered or deleted.
- `opacity` is `0..1` (what `ctx.globalAlpha` expects). Sliders show `0..100` and divide.
- `ctx.filter` is sticky: always reset it to `'none'` after use.
