import { useEffect, useMemo, useRef } from 'react'
import { toCssFilter, type FilterSettings } from '../core/filters'
import { addLayer, createDocument, type EpiDocument } from '../core/document'
import { renderDocument } from '../core/renderer'
import { getMousePos, type MousePos } from '../mouse/mouseEvent'
import './CanvasArea.css'
import { drawCircle } from '../brush/drawSquare'

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

  const brush = addLayer(doc, 'Brush')
  doc.activeLayerId = brush.id
  return doc
}

export function CanvasArea({ image, filters }: CanvasAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const testDocument = useMemo(() => createTestDocument(), [])
  const clickMaintained = useRef(false)

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

  function paintAt(pos: MousePos) {
    drawCircle(pos, testDocument)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderDocument(ctx, testDocument)
  }

  function handleMouseDown(ev: React.MouseEvent<HTMLCanvasElement>) {
    const pos = getMousePos(ev.currentTarget, ev)

    if (clickMaintained.current) return
    clickMaintained.current = true
    paintAt(pos)

    console.log('x:' + pos.x + ' y:' + pos.y)
  }

  function handleMouseMove(ev: React.MouseEvent<HTMLCanvasElement>) {
    if (!clickMaintained.current) return
    paintAt(getMousePos(ev.currentTarget, ev))
  }

  function handleMouseUp() {
    clickMaintained.current = false
  }

  return (
    <main className="canvas-area">
      <canvas
        ref={canvasRef}
        className="checkerboard"
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
    </main>
  )
}
