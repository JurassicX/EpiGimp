import { useEffect, useRef } from "react";
import type { Layer } from "../core/document";
import { toCssFilter } from "../core/filters";

export function LayerThumbnail ({ layer }: { layer: Layer}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.filter = toCssFilter(layer.filters)
        ctx.drawImage(layer.canvas, 0, 0, 64, 48)
    }, [layer])

    return <canvas className="checkerboard" ref={canvasRef} width={64} height={48} />
}