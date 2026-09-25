import { addLayer, type EpiDocument, type Layer } from "../core/document";
import type { MousePos } from "../mouse/mouseEvent";

export function drawCircle(pos: MousePos, testDocument: EpiDocument) {
    const layer = testDocument.layers.find(l => l.id === testDocument.activeLayerId)
    layer.ctx.fillStyle = '#e04040'
    layer.ctx.beginPath()
    layer.ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2)
    layer.ctx.fill()
}