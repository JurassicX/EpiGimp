import { DEFAULT_FILTERS, type FilterSettings } from "./filters";
import type { Selection } from "./selection";

export type BlendMode =
  "normal" | "multiply" | "screen" | "overlay" | "difference";

export const BLEND_MODES: Record<BlendMode, GlobalCompositeOperation> = {
  normal: "source-over",
  multiply: "multiply",
  screen: "screen",
  overlay: "overlay",
  difference: "difference",
};

export interface PaintTarget {
  canvas: OffscreenCanvas;
  ctx: OffscreenCanvasRenderingContext2D;
}

export interface Layer extends PaintTarget {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  filters: FilterSettings;
  mask: PaintTarget | null;
  editingMask: boolean;
}

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EpiDocument {
  width: number;
  height: number;
  layers: Layer[];
  activeLayerId: string;
  selection: Selection | null;
}

export function createLayer(
  width: number,
  height: number,
  name: string,
): Layer {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");

  return {
    id: crypto.randomUUID(),
    name,
    visible: true,
    opacity: 1,
    blendMode: "normal",
    filters: { ...DEFAULT_FILTERS },
    canvas,
    ctx,
    mask: null,
    editingMask: false,
  };
}

export function createMask(width: number, height: number): PaintTarget {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  return { canvas, ctx };
}

export function activeTarget(doc: EpiDocument): PaintTarget | undefined {
  const layer = doc.layers.find((l) => l.id === doc.activeLayerId);
  if (!layer) return undefined;
  return layer.editingMask && layer.mask ? layer.mask : layer;
}

export function createDocument(width: number, height: number): EpiDocument {
  const background = createLayer(width, height, "Background");

  return {
    width,
    height,
    layers: [background],
    activeLayerId: background.id,
    selection: null,
  };
}

export function addLayer(doc: EpiDocument, name: string): Layer {
  const layer = createLayer(doc.width, doc.height, name);
  doc.layers.push(layer);
  return layer;
}
