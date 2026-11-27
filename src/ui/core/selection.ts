import type { SelectionRect } from "./document";
import type { Point } from "../mouse/mouseEvent";

export type SelectShape = "rectangle" | "ellipse" | "lasso";

export const SELECT_SHAPES: SelectShape[] = ["rectangle", "ellipse", "lasso"];

export interface Selection extends SelectionRect {
  path: Path2D;
  outline: string;
}

export function rectSelection(rect: SelectionRect): Selection {
  const { x, y, width, height } = rect;
  const path = new Path2D();
  path.rect(x, y, width, height);

  return {
    ...rect,
    path,
    outline: `M${x} ${y}h${width}v${height}h${-width}Z`,
  };
}

export function ellipseSelection(rect: SelectionRect): Selection {
  const rx = rect.width / 2;
  const ry = rect.height / 2;
  const cx = rect.x + rx;
  const cy = rect.y + ry;
  const path = new Path2D();
  path.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);

  return {
    ...rect,
    path,
    outline: `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`,
  };
}

export function lassoSelection(points: Point[]): Selection | null {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  const width = Math.max(...xs) - x;
  const height = Math.max(...ys) - y;
  if (points.length < 3 || width < 1 || height < 1) return null;

  const path = new Path2D();
  points.forEach((point) => path.lineTo(point.x, point.y));
  path.closePath();
  const outline = points.map((point) => `${point.x} ${point.y}`).join("L");

  return { x, y, width, height, path, outline: `M${outline}Z` };
}

export function maskBounds(
  mask: Uint8Array,
  width: number,
  height: number,
): SelectionRect | null {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y * width + x]) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < 0) return null;
  return { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}

export function maskSelection(
  mask: Uint8Array,
  width: number,
  height: number,
): Selection | null {
  const bounds = maskBounds(mask, width, height);
  if (!bounds) return null;

  const inside = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < width && y < height && mask[y * width + x] === 1;
  const path = new Path2D();
  const outline: string[] = [];
  const right = bounds.x + bounds.width;
  const bottom = bounds.y + bounds.height;

  for (let y = bounds.y; y < bottom; y++) {
    let runStart = -1;
    for (let x = bounds.x; x <= right; x++) {
      if (inside(x, y) && runStart < 0) runStart = x;
      if (!inside(x, y) && runStart >= 0) {
        path.rect(runStart, y, x - runStart, 1);
        runStart = -1;
      }
    }
  }

  for (let y = bounds.y; y <= bottom; y++) {
    let edgeStart = -1;
    for (let x = bounds.x; x <= right; x++) {
      const isEdge = x < right && inside(x, y) !== inside(x, y - 1);
      if (isEdge && edgeStart < 0) edgeStart = x;
      if (!isEdge && edgeStart >= 0) {
        outline.push(`M${edgeStart} ${y}H${x}`);
        edgeStart = -1;
      }
    }
  }

  for (let x = bounds.x; x <= right; x++) {
    let edgeStart = -1;
    for (let y = bounds.y; y <= bottom; y++) {
      const isEdge = y < bottom && inside(x, y) !== inside(x - 1, y);
      if (isEdge && edgeStart < 0) edgeStart = y;
      if (!isEdge && edgeStart >= 0) {
        outline.push(`M${x} ${edgeStart}V${y}`);
        edgeStart = -1;
      }
    }
  }

  return { ...bounds, path, outline: outline.join("") };
}
