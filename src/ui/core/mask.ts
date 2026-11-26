import type { Layer } from "./document";
import { copyCanvas } from "./history";

export function applyMask(layer: Layer): OffscreenCanvas {
  if (!layer.mask) return layer.canvas;

  const { width, height } = layer.canvas;
  const result = copyCanvas(layer.canvas);
  const ctx = result.getContext("2d")!;
  const image = ctx.getImageData(0, 0, width, height);
  const mask = layer.mask.ctx.getImageData(0, 0, width, height).data;

  for (let i = 0; i < mask.length; i += 4) {
    const brightness =
      (mask[i] * 0.299 + mask[i + 1] * 0.587 + mask[i + 2] * 0.114) *
      (mask[i + 3] / 255);
    image.data[i + 3] = (image.data[i + 3] * brightness) / 255;
  }

  ctx.putImageData(image, 0, 0);
  return result;
}
