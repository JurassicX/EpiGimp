import type { EpiDocument, SelectionRect } from "./document";

export const HISTORY_LIMIT = 50;

export interface PixelChange {
  ctx: OffscreenCanvasRenderingContext2D;
  x: number;
  y: number;
  before: ImageData;
  after: ImageData;
}

export interface HistoryEntry {
  tag?: string;
  doc?: { before: EpiDocument; after: EpiDocument };
  pixels?: PixelChange;
}

export function copyCanvas(canvas: OffscreenCanvas): OffscreenCanvas {
  const copy = new OffscreenCanvas(canvas.width, canvas.height);
  const ctx = copy.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  ctx.drawImage(canvas, 0, 0);
  return copy;
}

export function captureChange(
  ctx: OffscreenCanvasRenderingContext2D,
  snapshot: OffscreenCanvas,
  region: SelectionRect,
): PixelChange {
  const snapshotCtx = snapshot.getContext("2d");
  if (!snapshotCtx) throw new Error("2D context unavailable");

  const { x, y, width, height } = region;
  return {
    ctx,
    x,
    y,
    before: snapshotCtx.getImageData(x, y, width, height),
    after: ctx.getImageData(x, y, width, height),
  };
}
