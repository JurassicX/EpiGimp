import { useEffect, useRef, useState } from "react";
import { renderDocument } from "../core/renderer";
import {
  getCanvasPoint,
  getMousePos,
  type MousePos,
  type Point,
} from "../mouse/mouseEvent";
import "./CanvasArea.css";
import {
  drawCircle,
  drawStroke,
  type BrushSettings,
} from "../brush/drawSquare";
import { hexColor } from "../core/hexColor";
import {
  activeTarget,
  type EpiDocument,
  type SelectionRect,
} from "../core/document";
import { captureChange, copyCanvas, type PixelChange } from "../core/history";
import {
  ellipseSelection,
  lassoSelection,
  rectSelection,
  type Selection,
} from "../core/selection";
import { fillAt, selectAt } from "../brush/fill";
import { drawClone } from "../brush/clone";
import { LINE_HEIGHT } from "../brush/text";
import {
  CORNERS,
  boxFromBounds,
  changedRegion,
  contentBounds,
  cornerOf,
  drawTransformed,
  isSameBox,
  rotateHandle,
  scaleFromCorner,
  toLocal,
  type TransformBox,
} from "../core/transform";

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 32;
const HANDLE_RADIUS = 6;
const ROTATE_DISTANCE = 28;

interface TransformDrag {
  mode: "move" | "rotate" | "scale";
  corner: Point;
  start: Point;
  startBox: TransformBox;
}

interface CanvasAreaProps {
  doc: EpiDocument;
  brush: BrushSettings;
  onBrushChange: (changes: Partial<BrushSettings>) => void;
  onSelectionChange: (selection: Selection | null) => void;
  onPixelsChange: (pixels: PixelChange) => void;
  onAddText: (text: string, pos: Point) => void;
}

export function CanvasArea({
  doc,
  brush,
  onBrushChange,
  onSelectionChange,
  onPixelsChange,
  onAddText,
}: CanvasAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stroke = useRef<MousePos[] | null>(null);
  const areaRef = useRef<HTMLElement>(null);
  const spaceHeld = useRef(false);
  const pan = useRef<{ x: number; y: number } | null>(null);
  const selectionPoints = useRef<Point[] | null>(null);
  const strokeSnapshot = useRef<OffscreenCanvas | null>(null);
  const cloneSource = useRef<Point | null>(null);
  const cloneOffset = useRef<Point | null>(null);
  const [cloneMark, setCloneMark] = useState<Point | null>(null);
  const moveStart = useRef<Point | null>(null);
  const transformSource = useRef<OffscreenCanvas | null>(null);
  const transformBounds = useRef<SelectionRect | null>(null);
  const transformDrag = useRef<TransformDrag | null>(null);
  const boxRef = useRef<TransformBox | null>(null);
  const [box, setBox] = useState<TransformBox | null>(null);
  const textInput = useRef<HTMLTextAreaElement>(null);
  const [textEdit, setTextEdit] = useState<Point | null>(null);
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
      if (ev.target instanceof HTMLTextAreaElement) return;
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

  useEffect(() => {
    function handleDeselect(ev: KeyboardEvent) {
      if (!ev.ctrlKey || ev.code !== "KeyD") return;
      ev.preventDefault();
      onSelectionChange(null);
    }

    window.addEventListener("keydown", handleDeselect);
    return () => window.removeEventListener("keydown", handleDeselect);
  }, [onSelectionChange]);

  function rectBetween(a: Point, b: Point): SelectionRect {
    const left = Math.round(Math.max(0, Math.min(a.x, b.x)));
    const top = Math.round(Math.max(0, Math.min(a.y, b.y)));
    const right = Math.round(Math.min(doc.width, Math.max(a.x, b.x)));
    const bottom = Math.round(Math.min(doc.height, Math.max(a.y, b.y)));
    return { x: left, y: top, width: right - left, height: bottom - top };
  }

  function clampToDoc(point: Point): Point {
    return {
      x: Math.round(Math.min(doc.width, Math.max(0, point.x))),
      y: Math.round(Math.min(doc.height, Math.max(0, point.y))),
    };
  }

  function shapeSelection(points: Point[]): Selection | null {
    if (brush.selectShape === "lasso")
      return lassoSelection(points.map(clampToDoc));

    const rect = rectBetween(points[0], points[points.length - 1]);
    if (rect.width === 0 || rect.height === 0) return null;
    return brush.selectShape === "ellipse"
      ? ellipseSelection(rect)
      : rectSelection(rect);
  }

  function strokeRegion(
    points: MousePos[],
    padding: number,
  ): SelectionRect | null {
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const left = Math.max(0, Math.floor(Math.min(...xs) - padding));
    const top = Math.max(0, Math.floor(Math.min(...ys) - padding));
    const right = Math.min(doc.width, Math.ceil(Math.max(...xs) + padding));
    const bottom = Math.min(doc.height, Math.ceil(Math.max(...ys) + padding));
    if (right <= left || bottom <= top) return null;
    return { x: left, y: top, width: right - left, height: bottom - top };
  }

  function isPanStart(ev: React.PointerEvent) {
    return ev.button === 1 || spaceHeld.current;
  }

  function updateBox(next: TransformBox | null) {
    boxRef.current = next;
    setBox(next);
  }

  function startTransform() {
    const target = activeTarget(doc);
    const bounds = target ? contentBounds(target.canvas) : null;

    transformSource.current = target ? copyCanvas(target.canvas) : null;
    transformBounds.current = bounds;
    updateBox(bounds ? boxFromBounds(bounds) : null);
  }

  function finishTransform(apply: boolean) {
    const target = activeTarget(doc);
    const source = transformSource.current;
    const bounds = transformBounds.current;
    const current = boxRef.current;
    if (!target || !source || !bounds || !current) return;
    if (isSameBox(current, boxFromBounds(bounds))) return;

    if (apply) {
      const region = changedRegion(current, bounds, doc.width, doc.height);
      onPixelsChange(captureChange(target.ctx, source, region));
    } else {
      target.ctx.clearRect(0, 0, doc.width, doc.height);
      target.ctx.drawImage(source, 0, 0);
      redraw();
    }
  }

  const targetCanvas = activeTarget(doc)?.canvas;

  useEffect(() => {
    if (brush.brushType !== "transform") return;
    startTransform();
    return () => {
      finishTransform(true);
      updateBox(null);
    };
  }, [brush.brushType, targetCanvas]);

  useEffect(() => {
    if (brush.brushType !== "transform") return;

    function handleTransformKeys(ev: KeyboardEvent) {
      if (ev.key !== "Enter" && ev.key !== "Escape") return;
      if (ev.target instanceof HTMLInputElement) return;
      ev.preventDefault();
      finishTransform(ev.key === "Enter");
      startTransform();
    }

    window.addEventListener("keydown", handleTransformKeys);
    return () => window.removeEventListener("keydown", handleTransformKeys);
  });

  function transformModeAt(pos: Point): TransformDrag | null {
    if (!box) return null;

    const reach = HANDLE_RADIUS / view.zoom;
    const near = (point: Point) =>
      Math.hypot(point.x - pos.x, point.y - pos.y) <= reach;
    const drag = { start: pos, startBox: box, corner: { x: 0, y: 0 } };

    if (near(rotateHandle(box, ROTATE_DISTANCE / view.zoom)))
      return { ...drag, mode: "rotate" };
    const corner = CORNERS.find((sign) => near(cornerOf(box, sign)));
    if (corner) return { ...drag, mode: "scale", corner };

    const local = toLocal(box, pos);
    if (
      Math.abs(local.x) <= box.width / 2 &&
      Math.abs(local.y) <= box.height / 2
    )
      return { ...drag, mode: "move" };
    return null;
  }

  function draggedBox(drag: TransformDrag, pos: Point, keepRatio: boolean) {
    const { startBox, start } = drag;

    if (drag.mode === "move")
      return {
        ...startBox,
        x: startBox.x + pos.x - start.x,
        y: startBox.y + pos.y - start.y,
      };

    if (drag.mode === "rotate") {
      const angle =
        Math.atan2(pos.y - startBox.y, pos.x - startBox.x) + Math.PI / 2;
      const step = Math.PI / 12;
      return {
        ...startBox,
        angle: keepRatio ? Math.round(angle / step) * step : angle,
      };
    }

    return scaleFromCorner(
      startBox,
      drag.corner,
      pos,
      transformBounds.current!,
      keepRatio,
    );
  }

  function handleAreaPointerDown(ev: React.PointerEvent<HTMLElement>) {
    const canvas = canvasRef.current;

    if (!isPanStart(ev) && brush.brushType === "transform" && canvas) {
      const drag = transformModeAt(getMousePos(canvas, ev));
      if (!drag) return;
      ev.currentTarget.setPointerCapture(ev.pointerId);
      transformDrag.current = drag;
      return;
    }

    if (!isPanStart(ev)) return;
    ev.preventDefault();
    ev.currentTarget.setPointerCapture(ev.pointerId);
    pan.current = { x: ev.clientX - view.x, y: ev.clientY - view.y };
  }

  function handleAreaPointerMove(ev: React.PointerEvent<HTMLElement>) {
    const drag = transformDrag.current;
    const target = activeTarget(doc);
    const canvas = canvasRef.current;

    if (drag && target && canvas && transformSource.current) {
      const next = draggedBox(drag, getMousePos(canvas, ev), ev.shiftKey);
      drawTransformed(
        target.ctx,
        transformSource.current,
        transformBounds.current!,
        next,
      );
      redraw();
      updateBox(next);
      return;
    }

    if (!pan.current) return;
    setView({
      ...view,
      x: ev.clientX - pan.current.x,
      y: ev.clientY - pan.current.y,
    });
  }

  function handleAreaPointerUp() {
    pan.current = null;
    transformDrag.current = null;
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

  function redraw() {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) renderDocument(ctx, doc);
  }

  function dab(pos: MousePos) {
    if (cloneOffset.current && strokeSnapshot.current)
      drawClone(pos, doc, brush, strokeSnapshot.current, cloneOffset.current);
    else drawCircle(pos, doc, brush);
  }

  function paintAt(pos: MousePos) {
    dab(pos);
    redraw();
  }

  function fillFrom(pos: MousePos) {
    const target = activeTarget(doc);
    if (!target) return;

    const snapshot = copyCanvas(target.canvas);
    const region = fillAt(pos, doc, brush);
    if (!region) return;
    onPixelsChange(captureChange(target.ctx, snapshot, region));
    redraw();
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

  function handleClick(ev: React.MouseEvent<HTMLCanvasElement>) {
    if (brush.brushType !== "text" || spaceHeld.current) return;
    setTextEdit(getCanvasPoint(ev.currentTarget, ev));
  }

  function finishText() {
    const input = textInput.current;
    if (!input || !textEdit) return;

    textInput.current = null;
    if (input.value.trim()) onAddText(input.value, textEdit);
    setTextEdit(null);
  }

  function handlePointerDown(ev: React.PointerEvent<HTMLCanvasElement>) {
    if (stroke.current || isPanStart(ev)) return;

    const pos = getMousePos(ev.currentTarget, ev);

    if (brush.brushType === "transform" || brush.brushType === "text") return;

    if (brush.brushType === "move") {
      const target = activeTarget(doc);
      if (!target) return;
      strokeSnapshot.current = copyCanvas(target.canvas);
      moveStart.current = pos;
      return;
    }

    if (brush.brushType === "select") {
      selectionPoints.current = [pos];
      onSelectionChange(null);
      return;
    }

    if (brush.brushType === "wand") {
      onSelectionChange(selectAt(pos, doc, brush));
      return;
    }

    if (brush.brushType === "bucket") {
      fillFrom(pos);
      return;
    }

    if (brush.brushType === "eyedropper") {
      getColorFromCoord(pos);
      return;
    }

    if (brush.brushType === "clone") {
      if (ev.altKey) {
        cloneSource.current = pos;
        setCloneMark(pos);
        return;
      }
      if (!cloneSource.current) return;
      cloneOffset.current = {
        x: cloneSource.current.x - pos.x,
        y: cloneSource.current.y - pos.y,
      };
    }

    const target = activeTarget(doc);
    strokeSnapshot.current = target ? copyCanvas(target.canvas) : null;
    stroke.current = [pos];
    paintAt(pos);
  }

  function handlePointerMove(ev: React.PointerEvent<HTMLCanvasElement>) {
    const target = activeTarget(doc);

    if (moveStart.current && strokeSnapshot.current && target) {
      const pos = getMousePos(ev.currentTarget, ev);
      target.ctx.clearRect(0, 0, doc.width, doc.height);
      target.ctx.drawImage(
        strokeSnapshot.current,
        Math.round(pos.x - moveStart.current.x),
        Math.round(pos.y - moveStart.current.y),
      );
      redraw();
      return;
    }

    if (selectionPoints.current) {
      selectionPoints.current.push(getMousePos(ev.currentTarget, ev));
      onSelectionChange(shapeSelection(selectionPoints.current));
      return;
    }

    if (!stroke.current) return;

    const pos = getMousePos(ev.currentTarget, ev);
    drawStroke(stroke.current[stroke.current.length - 1], pos, brush.size, dab);
    stroke.current.push(pos);
    paintAt(pos);

    const offset = cloneOffset.current;
    if (offset) setCloneMark({ x: pos.x + offset.x, y: pos.y + offset.y });
  }

  function handlePointerUp() {
    const target = activeTarget(doc);

    if (stroke.current && strokeSnapshot.current && target) {
      const region = strokeRegion(stroke.current, brush.size * 1.5 + 2);
      if (region)
        onPixelsChange(
          captureChange(target.ctx, strokeSnapshot.current, region),
        );
    }
    if (moveStart.current && strokeSnapshot.current && target) {
      const area = { x: 0, y: 0, width: doc.width, height: doc.height };
      onPixelsChange(captureChange(target.ctx, strokeSnapshot.current, area));
    }

    if (cloneOffset.current) setCloneMark(cloneSource.current);
    stroke.current = null;
    strokeSnapshot.current = null;
    cloneOffset.current = null;
    moveStart.current = null;
    selectionPoints.current = null;
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
        onClick={handleClick}
      />
      {textEdit && (
        <textarea
          ref={textInput}
          className="text-input"
          autoFocus
          spellCheck={false}
          style={{
            left: view.x + textEdit.x * view.zoom,
            top: view.y + textEdit.y * view.zoom,
            font: `${brush.fontSize * view.zoom}px ${brush.fontFamily}`,
            lineHeight: LINE_HEIGHT,
            color: brush.color,
          }}
          onBlur={finishText}
          onKeyDown={(event) => {
            if (event.key === "Escape") finishText();
          }}
        />
      )}
      {doc.selection && (
        <svg
          className="selection"
          viewBox={`${doc.selection.x} ${doc.selection.y} ${doc.selection.width} ${doc.selection.height}`}
          preserveAspectRatio="none"
          style={{
            left: view.x + doc.selection.x * view.zoom,
            top: view.y + doc.selection.y * view.zoom,
            width: doc.selection.width * view.zoom,
            height: doc.selection.height * view.zoom,
          }}
        >
          <path className="selection-outline" d={doc.selection.outline} />
          <path className="selection-ants" d={doc.selection.outline} />
        </svg>
      )}
      {box && (
        <svg className="transform-box">
          <TransformOverlay box={box} view={view} />
        </svg>
      )}
      {brush.brushType === "clone" && cloneMark && (
        <div
          className="clone-source"
          style={{
            left: view.x + cloneMark.x * view.zoom,
            top: view.y + cloneMark.y * view.zoom,
          }}
        />
      )}
      <button className="zoom-label" title="fit to window" onClick={fitToView}>
        {Math.round(view.zoom * 100)}%
      </button>
    </main>
  );
}

interface TransformOverlayProps {
  box: TransformBox;
  view: { zoom: number; x: number; y: number };
}

function TransformOverlay({ box, view }: TransformOverlayProps) {
  const screen = (point: Point) => ({
    x: view.x + point.x * view.zoom,
    y: view.y + point.y * view.zoom,
  });
  const corners = CORNERS.map((sign) => screen(cornerOf(box, sign)));
  const top = screen(cornerOf(box, { x: 0, y: -1 }));
  const handle = screen(rotateHandle(box, ROTATE_DISTANCE / view.zoom));

  return (
    <>
      <polygon points={corners.map((p) => `${p.x},${p.y}`).join(" ")} />
      <line x1={top.x} y1={top.y} x2={handle.x} y2={handle.y} />
      {[...corners, handle].map((p, index) => (
        <circle key={index} cx={p.x} cy={p.y} r={HANDLE_RADIUS} />
      ))}
    </>
  );
}
