import type { SelectionRect } from "./document";
import { maskBounds } from "./selection";
import type { Point } from "../mouse/mouseEvent";

export interface TransformBox {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
}

export const CORNERS: Point[] = [
  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
];

export function contentBounds(canvas: OffscreenCanvas): SelectionRect | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const mask = new Uint8Array(canvas.width * canvas.height);
  for (let index = 0; index < mask.length; index++)
    mask[index] = data[index * 4 + 3] > 0 ? 1 : 0;
  return maskBounds(mask, canvas.width, canvas.height);
}

export function boxFromBounds(bounds: SelectionRect): TransformBox {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
    width: bounds.width,
    height: bounds.height,
    angle: 0,
  };
}

export function isSameBox(a: TransformBox, b: TransformBox) {
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.height === b.height &&
    a.angle === b.angle
  );
}

function rotate(point: Point, angle: number): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos };
}

export function toWorld(box: TransformBox, local: Point): Point {
  const turned = rotate(local, box.angle);
  return { x: box.x + turned.x, y: box.y + turned.y };
}

export function toLocal(box: TransformBox, point: Point): Point {
  return rotate({ x: point.x - box.x, y: point.y - box.y }, -box.angle);
}

export function cornerOf(box: TransformBox, sign: Point): Point {
  return toWorld(box, {
    x: (sign.x * box.width) / 2,
    y: (sign.y * box.height) / 2,
  });
}

export function rotateHandle(box: TransformBox, distance: number): Point {
  return toWorld(box, { x: 0, y: -box.height / 2 - distance });
}

export function scaleFromCorner(
  box: TransformBox,
  sign: Point,
  pointer: Point,
  original: SelectionRect,
  keepRatio: boolean,
): TransformBox {
  const anchor = cornerOf(box, { x: -sign.x, y: -sign.y });
  const reach = rotate(
    { x: pointer.x - anchor.x, y: pointer.y - anchor.y },
    -box.angle,
  );
  let width = Math.max(1, reach.x * sign.x);
  let height = Math.max(1, reach.y * sign.y);

  if (keepRatio) {
    const scale = Math.max(width / original.width, height / original.height);
    width = original.width * scale;
    height = original.height * scale;
  }

  const half = rotate(
    { x: (sign.x * width) / 2, y: (sign.y * height) / 2 },
    box.angle,
  );
  return {
    ...box,
    x: anchor.x + half.x,
    y: anchor.y + half.y,
    width,
    height,
  };
}

export function drawTransformed(
  ctx: OffscreenCanvasRenderingContext2D,
  source: OffscreenCanvas,
  original: SelectionRect,
  box: TransformBox,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(box.x, box.y);
  ctx.rotate(box.angle);
  ctx.scale(box.width / original.width, box.height / original.height);
  ctx.drawImage(
    source,
    -(original.x + original.width / 2),
    -(original.y + original.height / 2),
  );
  ctx.restore();
}

export function changedRegion(
  box: TransformBox,
  original: SelectionRect,
  width: number,
  height: number,
): SelectionRect {
  const points = CORNERS.map((sign) => cornerOf(box, sign));
  const xs = [
    ...points.map((p) => p.x),
    original.x,
    original.x + original.width,
  ];
  const ys = [
    ...points.map((p) => p.y),
    original.y,
    original.y + original.height,
  ];
  const left = Math.max(0, Math.floor(Math.min(...xs)) - 1);
  const top = Math.max(0, Math.floor(Math.min(...ys)) - 1);
  const right = Math.min(width, Math.ceil(Math.max(...xs)) + 1);
  const bottom = Math.min(height, Math.ceil(Math.max(...ys)) + 1);
  return {
    x: left,
    y: top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
}
