import { useEffect, useRef } from "react";
import { renderDocument } from "../core/renderer";
import { getMousePos, type MousePos } from "../mouse/mouseEvent";
import "./CanvasArea.css";
import {
  drawCircle,
  drawStroke,
  type BrushSettings,
} from "../brush/drawSquare";
import { hexColor } from "../core/hexColor";
import type { EpiDocument } from "../core/document";

interface CanvasAreaProps {
  doc: EpiDocument;
  brush: BrushSettings;
  onBrushChange: (changes: Partial<BrushSettings>) => void;
}

export function CanvasArea({ doc, brush, onBrushChange }: CanvasAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stroke = useRef<MousePos[] | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = doc.width;
    canvas.height = doc.height;
    renderDocument(ctx, doc);
  }, [doc]);

  function paintAt(pos: MousePos) {
    drawCircle(pos, doc, brush);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderDocument(ctx, doc);
  }

  function getColorFromCoord(pos: MousePos) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(pos.x, pos.y, 1, 1);
    onBrushChange({
      color:
        "#" +
        hexColor(imageData.data[0]) +
        hexColor(imageData.data[1]) +
        hexColor(imageData.data[2]),
      brushType: "brush",
    });
  }

  function handlePointerDown(ev: React.PointerEvent<HTMLCanvasElement>) {
    if (stroke.current) return;

    const pos = getMousePos(ev.currentTarget, ev);

    if (brush.brushType === "eyedropper") {
      getColorFromCoord(pos);
      return;
    }
    stroke.current = [pos];
    paintAt(pos);
  }

  function handlePointerMove(ev: React.PointerEvent<HTMLCanvasElement>) {
    if (!stroke.current) return;

    const pos = getMousePos(ev.currentTarget, ev);
    drawStroke(stroke.current[stroke.current.length - 1], pos, doc, brush);
    stroke.current.push(pos);
    paintAt(pos);
  }

  function handlePointerUp() {
    stroke.current = null;
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
  );
}
