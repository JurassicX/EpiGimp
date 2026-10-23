import { useEffect, useRef, useState } from "react";
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

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 32;

interface CanvasAreaProps {
  doc: EpiDocument;
  brush: BrushSettings;
  onBrushChange: (changes: Partial<BrushSettings>) => void;
}

export function CanvasArea({ doc, brush, onBrushChange }: CanvasAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stroke = useRef<MousePos[] | null>(null);
  const areaRef = useRef<HTMLElement>(null);
  const spaceHeld = useRef(false);
  const pan = useRef<{ x: number; y: number } | null>(null);
  const [view, setView] = useState({ zoom: 1, x: 0, y: 0 });

  function fitToView() {
    const area = areaRef.current;
    if (!area) return;

    const zoom = Math.min(
      1,
      (area.clientWidth - 64) / doc.width,
      (area.clientHeight - 64) / doc.height,
    );
    setView({
      zoom,
      x: (area.clientWidth - doc.width * zoom) / 2,
      y: (area.clientHeight - doc.height * zoom) / 2,
    });
  }

  useEffect(fitToView, [doc.width, doc.height]);

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;

    const handleWheel = (ev: WheelEvent) => {
      if (!ev.ctrlKey) return;
      ev.preventDefault();

      const rect = area.getBoundingClientRect();
      const cursorX = ev.clientX - rect.left;
      const cursorY = ev.clientY - rect.top;

      setView((previous) => {
        const zoom = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, previous.zoom * (ev.deltaY < 0 ? 1.1 : 1 / 1.1)),
        );
        const ratio = zoom / previous.zoom;
        return {
          zoom,
          x: cursorX - (cursorX - previous.x) * ratio,
          y: cursorY - (cursorY - previous.y) * ratio,
        };
      });
    };

    area.addEventListener("wheel", handleWheel, { passive: false });
    return () => area.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    function handleKey(ev: KeyboardEvent) {
      if (ev.code !== "Space") return;
      if (ev.target instanceof HTMLInputElement) return;
      ev.preventDefault();
      spaceHeld.current = ev.type === "keydown";
    }

    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", handleKey);
    };
  }, []);

  function isPanStart(ev: React.PointerEvent) {
    return ev.button === 1 || spaceHeld.current;
  }

  function handleAreaPointerDown(ev: React.PointerEvent<HTMLElement>) {
    if (!isPanStart(ev)) return;
    ev.preventDefault();
    ev.currentTarget.setPointerCapture(ev.pointerId);
    pan.current = { x: ev.clientX - view.x, y: ev.clientY - view.y };
  }

  function handleAreaPointerMove(ev: React.PointerEvent<HTMLElement>) {
    if (!pan.current) return;
    setView({
      ...view,
      x: ev.clientX - pan.current.x,
      y: ev.clientY - pan.current.y,
    });
  }

  function handleAreaPointerUp() {
    pan.current = null;
  }

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
    if (stroke.current || isPanStart(ev)) return;

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
    <main
      ref={areaRef}
      className="canvas-area"
      onPointerDown={handleAreaPointerDown}
      onPointerMove={handleAreaPointerMove}
      onPointerUp={handleAreaPointerUp}
    >
      <canvas
        ref={canvasRef}
        className="checkerboard"
        width={800}
        height={600}
        style={{
          left: view.x,
          top: view.y,
          width: doc.width * view.zoom,
          height: doc.height * view.zoom,
          imageRendering: view.zoom >= 2 ? "pixelated" : "auto",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <button className="zoom-label" title="fit to window" onClick={fitToView}>
        {Math.round(view.zoom * 100)}%
      </button>
    </main>
  );
}
