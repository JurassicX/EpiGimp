import { addLayer, createDocument, type EpiDocument } from "./document"

export function createTestDocument(): EpiDocument {
  const doc = createDocument(800, 600)

  const square = addLayer(doc, 'Red square')
  square.ctx.fillStyle = '#e04040'
  square.ctx.fillRect(150, 120, 300, 300)

  const circle = addLayer(doc, 'Blue circle')
  circle.ctx.fillStyle = '#3070e0'
  circle.ctx.beginPath()
  circle.ctx.arc(430, 330, 160, 0, Math.PI * 2)
  circle.ctx.fill()
  circle.opacity = 0.7

  const rectangle = addLayer(doc, 'Green rectangle')
  rectangle.ctx.fillStyle = '#3BB143'
  rectangle.ctx.fillRect(0, 0, 500, 250)
  rectangle.blendMode = 'screen'

  const brush = addLayer(doc, 'Brush')
  doc.activeLayerId = brush.id
  return doc
}