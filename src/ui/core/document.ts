import { DEFAULT_FILTERS, type FilterSettings } from './filters'

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'difference'

export const BLEND_MODES: Record<BlendMode, GlobalCompositeOperation> = {
  normal: 'source-over',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  difference: 'difference',
}

export interface Layer {
  id: string
  name: string
  visible: boolean
  opacity: number
  blendMode: BlendMode
  filters: FilterSettings
  canvas: OffscreenCanvas
  ctx: OffscreenCanvasRenderingContext2D
}

export interface EpiDocument {
  width: number
  height: number
  layers: Layer[]
  activeLayerId: string
}

export function createLayer(width: number, height: number, name: string): Layer {
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context unavailable')

  return {
    id: crypto.randomUUID(),
    name,
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    filters: { ...DEFAULT_FILTERS },
    canvas,
    ctx,
  }
}

export function createDocument(width: number, height: number): EpiDocument {
  const background = createLayer(width, height, 'Background')

  return {
    width,
    height,
    layers: [background],
    activeLayerId: background.id,
  }
}

export function addLayer(doc: EpiDocument, name: string): Layer {
  const layer = createLayer(doc.width, doc.height, name)
  doc.layers.push(layer)
  return layer
}
