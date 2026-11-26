import { activeTarget, type EpiDocument } from "../core/document";
import type { MousePos } from "../mouse/mouseEvent";

export type BrushType =
  | "brush"
  | "eraser"
  | "eyedropper"
  | "select"
  | "bucket"
  | "wand"
  | "clone"
  | "move"
  | "transform"
  | "text";

export const BRUSH_TYPE: Record<BrushType, number> = {
  brush: 1,
  eraser: 2,
  eyedropper: 3,
  select: 4,
  bucket: 5,
  wand: 6,
  clone: 7,
  move: 8,
  transform: 9,
  text: 10,
};

export interface BrushSettings {
  size: number;
  hardness: number;
  color: string;
  opacity: number;
  tolerance: number;
  fontFamily: string;
  fontSize: number;
  brushType: BrushType;
}

export const DEFAULT_BRUSH: BrushSettings = {
  size: 20,
  hardness: 1,
  color: "#000000",
  opacity: 1,
  tolerance: 32,
  fontFamily: "sans-serif",
  fontSize: 48,
  brushType: "brush",
};

export function drawCircle(
  pos: MousePos,
  testDocument: EpiDocument,
  brush: BrushSettings,
) {
  const target = activeTarget(testDocument);
  if (!target) return;

  const radius = (brush.size / 2) * pos.pressure;
  const selection = testDocument.selection;

  target.ctx.save();
  if (selection) target.ctx.clip(selection.path);
  target.ctx.filter = `blur(${(1 - brush.hardness) * radius * 0.5}px)`;
  target.ctx.fillStyle = brush.color;
  target.ctx.globalAlpha = brush.opacity;
  target.ctx.beginPath();
  target.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  if (brush.brushType === "eraser")
    target.ctx.globalCompositeOperation = "destination-out";
  target.ctx.fill();
  target.ctx.restore();
}

export function drawStroke(
  from: MousePos,
  to: MousePos,
  size: number,
  paint: (pos: MousePos) => void,
) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.ceil(distance / (size * 0.25)));

  for (let step = 1; step < steps; step++) {
    const ratio = step / steps;

    paint({
      x: from.x + (to.x - from.x) * ratio,
      y: from.y + (to.y - from.y) * ratio,
      pressure: from.pressure + (to.pressure - from.pressure) * ratio,
    });
  }
}
