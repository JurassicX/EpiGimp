import { BLEND_MODES, type EpiDocument } from './document'
import { toCssFilter } from './filters'

export function renderDocument(ctx: CanvasRenderingContext2D, doc: EpiDocument): void {
  ctx.clearRect(0, 0, doc.width, doc.height)

  for (const layer of doc.layers) {
    if (!layer.visible || layer.opacity === 0) continue

    ctx.globalAlpha = layer.opacity
    ctx.globalCompositeOperation = BLEND_MODES[layer.blendMode]
    ctx.filter = toCssFilter(layer.filters)
    ctx.drawImage(layer.canvas, 0, 0)
  }

  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  ctx.filter = 'none'
}
