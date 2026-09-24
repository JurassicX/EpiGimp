import { useEffect, useMemo, useRef } from 'react'
import { toCssFilter, type FilterSettings } from '../core/filters'
import { addLayer, createDocument, type EpiDocument } from '../core/document'
import { renderDocument } from '../core/renderer'
import './CanvasArea.css'

interface CanvasAreaProps {
  image: HTMLImageElement | null
  filters: FilterSettings
}

function createTestDocument(): EpiDocument {
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
  return doc
}

export function CanvasArea({ image, filters }: CanvasAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const testDocument = useMemo(() => createTestDocument(), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (!image) {
      canvas.width = testDocument.width
      canvas.height = testDocument.height
      renderDocument(ctx, testDocument)
      return
    }

    canvas.width = image.width
    canvas.height = image.height
    ctx.filter = toCssFilter(filters)
    ctx.drawImage(image, 0, 0)
  }, [image, filters, testDocument])

  return (
    <main className="canvas-area">
      <canvas ref={canvasRef} className="checkerboard" width={800} height={600} />
    </main>
  )
}
