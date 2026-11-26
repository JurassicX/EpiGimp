import type { Point } from "../mouse/mouseEvent";
import type { BrushSettings } from "./drawSquare";

export const FONT_FAMILIES = ["sans-serif", "serif", "monospace", "cursive"];
export const LINE_HEIGHT = 1.2;

export function drawText(
  ctx: OffscreenCanvasRenderingContext2D,
  text: string,
  pos: Point,
  brush: BrushSettings,
) {
  const top = pos.y + ((LINE_HEIGHT - 1) / 2) * brush.fontSize;

  ctx.font = `${brush.fontSize}px ${brush.fontFamily}`;
  ctx.fillStyle = brush.color;
  ctx.globalAlpha = brush.opacity;
  ctx.textBaseline = "top";
  text.split("\n").forEach((line, index) => {
    ctx.fillText(line, pos.x, top + index * LINE_HEIGHT * brush.fontSize);
  });
}
