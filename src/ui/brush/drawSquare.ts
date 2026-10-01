import type { EpiDocument } from "../core/document";
import type { MousePos } from "../mouse/mouseEvent";

export type BrushType = "brush" | "eraser" | "eyedropper"

export const BRUSH_TYPE: Record<BrushType, number> = {
    brush: 1,
    eraser: 2,
    eyedropper: 3,
}

export interface BrushSettings {
    size: number
    hardness: number
    color: string
    opacity: number
    brushType: BrushType
}

export const DEFAULT_BRUSH: BrushSettings = {
    size: 20,
    hardness: 1,
    color: '#000000',
    opacity: 1,
    brushType: "brush"
}

export function drawCircle(pos: MousePos, testDocument: EpiDocument, brush: BrushSettings) {
    const layer = testDocument.layers.find(l => l.id === testDocument.activeLayerId)
    if (!layer) return

    const radius = (brush.size / 2) * pos.pressure

    layer.ctx.filter = `blur(${(1 - brush.hardness) * radius * 0.5}px)`
    layer.ctx.fillStyle = brush.color
    layer.ctx.beginPath()
    layer.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
    if (DEFAULT_BRUSH.brushType === "eraser")
        layer.ctx.globalCompositeOperation = "destination-out"
    layer.ctx.fill()
    layer.ctx.globalAlpha = brush.opacity
    layer.ctx.filter = 'none'
    layer.ctx.globalCompositeOperation = "source-over"
}

export function drawStroke(from: MousePos, to: MousePos, testDocument: EpiDocument, brush: BrushSettings) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y)
    const steps = Math.max(1, Math.ceil(distance / (brush.size * 0.25)))

    for (let step = 1; step < steps; step++) {
        const ratio = step / steps

        drawCircle({
            x: from.x + (to.x - from.x) * ratio,
            y: from.y + (to.y - from.y) * ratio,
            pressure: from.pressure + (to.pressure - from.pressure) * ratio,
        }, testDocument, brush)
    }
}
