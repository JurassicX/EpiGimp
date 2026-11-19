import type { EpiDocument, SelectionRect } from "../core/document";
import { floodFill } from "../core/floodFill";
import { hexToRgb } from "../core/hexColor";
import { maskBounds, maskSelection, type Selection } from "../core/selection";
import type { MousePos } from "../mouse/mouseEvent";
import type { BrushSettings } from "./drawSquare";

function areaAt(pos: MousePos, doc: EpiDocument, tolerance: number) {
  const layer = doc.layers.find((l) => l.id === doc.activeLayerId);
  const x = Math.floor(pos.x);
  const y = Math.floor(pos.y);
  if (!layer || x < 0 || y < 0 || x >= doc.width || y >= doc.height)
    return null;

  const image = layer.ctx.getImageData(0, 0, doc.width, doc.height);
  return { layer, mask: floodFill(image, x, y, tolerance) };
}

export function fillAt(
  pos: MousePos,
  doc: EpiDocument,
  brush: BrushSettings,
): SelectionRect | null {
  const area = areaAt(pos, doc, brush.tolerance);
  if (!area) return null;
  const bounds = maskBounds(area.mask, doc.width, doc.height);
  if (!bounds) return null;

  const [red, green, blue] = hexToRgb(brush.color);
  const patch = new ImageData(bounds.width, bounds.height);

  for (let y = 0; y < bounds.height; y++) {
    for (let x = 0; x < bounds.width; x++) {
      if (!area.mask[(bounds.y + y) * doc.width + bounds.x + x]) continue;
      const offset = (y * bounds.width + x) * 4;
      patch.data.set([red, green, blue, 255], offset);
    }
  }

  const stamp = new OffscreenCanvas(bounds.width, bounds.height);
  stamp.getContext("2d")?.putImageData(patch, 0, 0);

  const { ctx } = area.layer;
  ctx.save();
  if (doc.selection) ctx.clip(doc.selection.path);
  ctx.globalAlpha = brush.opacity;
  ctx.drawImage(stamp, bounds.x, bounds.y);
  ctx.restore();
  return bounds;
}

export function selectAt(
  pos: MousePos,
  doc: EpiDocument,
  brush: BrushSettings,
): Selection | null {
  const area = areaAt(pos, doc, brush.tolerance);
  if (!area) return null;
  return maskSelection(area.mask, doc.width, doc.height);
}
