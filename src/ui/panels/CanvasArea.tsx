import { useEffect, useRef } from 'react'
import { toCssFilter, type FilterSettings } from '../core/filters'
import './CanvasArea.css'

interface CanvasAreaProps {
  image: HTMLImageElement | null
  filters: FilterSettings
}

export function CanvasArea({ image, filters }: CanvasAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (!image) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    canvas.width = image.width
    canvas.height = image.height
    ctx.filter = toCssFilter(filters)
    ctx.drawImage(image, 0, 0)
  }, [image, filters])

  return (
    <main className="canvas-area">
      <canvas ref={canvasRef} className="checkerboard" width={800} height={600} />
    </main>
  )
}
