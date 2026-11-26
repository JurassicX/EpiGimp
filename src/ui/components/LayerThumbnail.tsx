import { useEffect, useRef } from "react";
import type { Layer } from "../core/document";
import { toCssFilter } from "../core/filters";

interface LayerThumbnailProps {
  layer: Layer;
  showMask?: boolean;
}

export function LayerThumbnail({ layer, showMask }: LayerThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const source = showMask && layer.mask ? layer.mask : layer;
    ctx.clearRect(0, 0, 64, 48);
    ctx.filter = showMask ? "none" : toCssFilter(layer.filters);
    ctx.drawImage(source.canvas, 0, 0, 64, 48);
  }, [layer, showMask]);

  return (
    <canvas className="checkerboard" ref={canvasRef} width={64} height={48} />
  );
}
