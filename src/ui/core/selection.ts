import type { SelectionRect } from "./document";

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
