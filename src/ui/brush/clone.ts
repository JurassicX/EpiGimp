import type { EpiDocument } from "../core/document";
import type { MousePos, Point } from "../mouse/mouseEvent";
import type { BrushSettings } from "./drawSquare";

const dab = new OffscreenCanvas(1, 1);
const dabCtx = dab.getContext("2d")!;

export function drawClone(
  pos: MousePos,
  doc: EpiDocument,
  brush: BrushSettings,
  source: OffscreenCanvas,
  offset: Point,
) {
  const layer = doc.layers.find((l) => l.id === doc.activeLayerId);
  if (!layer) return;

  const radius = (brush.size / 2) * pos.pressure;
  const side = Math.ceil(radius * 4) + 2;
  const left = Math.floor(pos.x - side / 2);
  const top = Math.floor(pos.y - side / 2);

  dab.width = side;
  dab.height = side;
  dabCtx.filter = `blur(${(1 - brush.hardness) * radius * 0.5}px)`;
  dabCtx.beginPath();
  dabCtx.arc(pos.x - left, pos.y - top, radius, 0, Math.PI * 2);
  dabCtx.fill();
  dabCtx.filter = "none";
  dabCtx.globalCompositeOperation = "source-in";
  dabCtx.drawImage(source, -(left + offset.x), -(top + offset.y));
  dabCtx.globalCompositeOperation = "source-over";

  layer.ctx.save();
  if (doc.selection) layer.ctx.clip(doc.selection.path);
  layer.ctx.globalAlpha = brush.opacity;
  layer.ctx.drawImage(dab, left, top);
  layer.ctx.restore();
}
