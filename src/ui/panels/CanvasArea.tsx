import { useEffect, useMemo, useRef } from 'react'
import { toCssFilter, type FilterSettings } from '../core/filters'
import { renderDocument } from '../core/renderer'
import { getMousePos, type MousePos } from '../mouse/mouseEvent'
import './CanvasArea.css'
import { DEFAULT_BRUSH, drawCircle, drawStroke } from '../brush/drawSquare'
import { hexColor } from '../core/hexColor'
import type { EpiDocument } from '../core/document'

interface CanvasAreaProps {
  image: HTMLImageElement | null
  filters: FilterSettings
  doc: EpiDocument
}

export function CanvasArea({ image, filters, doc }: CanvasAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stroke = useRef<MousePos[] | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (!image) {
      canvas.width = doc.width
      canvas.height = doc.height
      renderDocument(ctx, doc)
      return
    }

    canvas.width = image.width
    canvas.height = image.height
    ctx.filter = toCssFilter(filters)
    ctx.drawImage(image, 0, 0)
  }, [image, filters, doc])

  function paintAt(pos: MousePos) {
    drawCircle(pos, doc, DEFAULT_BRUSH)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderDocument(ctx, doc)
  }

  function getColorFromCoord(pos: MousePos) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const imageData = ctx.getImageData(pos.x, pos.y, 1, 1)
    console.log(imageData.data)
    DEFAULT_BRUSH.color = "#" + hexColor(imageData.data[0]) + hexColor(imageData.data[1]) + hexColor(imageData.data[2])
    DEFAULT_BRUSH.brushType = "brush"
  }

  function handlePointerDown(ev: React.PointerEvent<HTMLCanvasElement>) {
    if (stroke.current) return

    const pos = getMousePos(ev.currentTarget, ev)

    if (DEFAULT_BRUSH.brushType === "eyedropper") {
      getColorFromCoord(pos)
      return
    }
    stroke.current = [pos]
    paintAt(pos)
  }

  function handlePointerMove(ev: React.PointerEvent<HTMLCanvasElement>) {
    if (!stroke.current) return

    const pos = getMousePos(ev.currentTarget, ev)
    drawStroke(stroke.current[stroke.current.length - 1], pos, doc, DEFAULT_BRUSH)
    stroke.current.push(pos)
    paintAt(pos)
  }

  function handlePointerUp() {
    stroke.current = null
  }

  return (
    <main className="canvas-area">
      <canvas
        ref={canvasRef}
        className="checkerboard"
        width={800}
        height={600}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </main>
  )
}
