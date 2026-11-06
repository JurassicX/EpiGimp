import { TopBar } from "./panels/TopBar";
import { ToolPanel } from "./panels/ToolPanel";
import { CanvasArea } from "./panels/CanvasArea";
import { LayersPanel } from "./panels/LayersPanel";
import "./App.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { createTestDocument } from "./core/createTestDoc";
import {
  createDocument,
  createLayer,
  type BlendMode,
  type EpiDocument,
  type SelectionRect,
} from "./core/document";
import {
  DEFAULT_FILTERS,
  toCssFilter,
  type FilterSettings,
} from "./core/filters";
import { renderDocument } from "./core/renderer";
import { DEFAULT_PANELS, type PanelVisibility } from "./core/panels";
import { DEFAULT_BRUSH, type BrushSettings } from "./brush/drawSquare";
import { NewDocumentDialog } from "./components/NewDocumentDialog";
import {
  HISTORY_LIMIT,
  captureChange,
  copyCanvas,
  type HistoryEntry,
  type PixelChange,
} from "./core/history";

export function App() {
  const [doc, setDoc] = useState(createTestDocument);
  const [panels, setPanels] = useState<PanelVisibility>(DEFAULT_PANELS);
  const [brush, setBrush] = useState<BrushSettings>(DEFAULT_BRUSH);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const undoStack = useRef<HistoryEntry[]>([]);
  const redoStack = useRef<HistoryEntry[]>([]);
  const showLeft = panels.file || panels.edit || panels.filters;
  const activeFilters =
    doc.layers.find((layer) => layer.id === doc.activeLayerId)?.filters ??
    DEFAULT_FILTERS;

  function record(entry: HistoryEntry) {
    const last = undoStack.current[undoStack.current.length - 1];

    if (entry.tag && last?.tag === entry.tag && last.doc && entry.doc) {
      last.doc.after = entry.doc.after;
    } else {
      undoStack.current.push(entry);
      if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
    }
    redoStack.current = [];
  }

  function changeDoc(next: EpiDocument, tag?: string) {
    record({ tag, doc: { before: doc, after: next } });
    setDoc(next);
  }

  function recordPixels(pixels: PixelChange) {
    record({ pixels });
  }

  function clearHistory() {
    undoStack.current = [];
    redoStack.current = [];
  }

  function showDoc(target: EpiDocument) {
    setDoc({ ...target, layers: target.layers.map((layer) => ({ ...layer })) });
  }

  function undo() {
    const entry = undoStack.current.pop();
    if (!entry) return;

    redoStack.current.push(entry);
    if (entry.pixels) {
      const { ctx, before, x, y } = entry.pixels;
      ctx.putImageData(before, x, y);
    }
    showDoc(entry.doc ? entry.doc.before : doc);
  }

  function redo() {
    const entry = redoStack.current.pop();
    if (!entry) return;

    undoStack.current.push(entry);
    if (entry.pixels) {
      const { ctx, after, x, y } = entry.pixels;
      ctx.putImageData(after, x, y);
    }
    showDoc(entry.doc ? entry.doc.after : doc);
  }

  useEffect(() => {
    function handleUndoKeys(ev: KeyboardEvent) {
      if (!ev.ctrlKey || ev.key.toLowerCase() !== "z") return;
      if (ev.target instanceof HTMLInputElement && ev.target.type === "number")
        return;

      ev.preventDefault();
      if (ev.shiftKey) redo();
      else undo();
    }

    window.addEventListener("keydown", handleUndoKeys);
    return () => window.removeEventListener("keydown", handleUndoKeys);
  }, [undo, redo]);

  function setFilter(key: keyof FilterSettings, value: number) {
    const layers = doc.layers.map((layer) =>
      layer.id === doc.activeLayerId
        ? { ...layer, filters: { ...layer.filters, [key]: value } }
        : layer,
    );
    changeDoc({ ...doc, layers }, `filter-${doc.activeLayerId}-${key}`);
  }

  function applyFilters() {
    const active = doc.layers.find((layer) => layer.id === doc.activeLayerId);
    if (!active) return;

    const copy = copyCanvas(active.canvas);

    active.ctx.clearRect(0, 0, doc.width, doc.height);
    active.ctx.filter = toCssFilter(active.filters);
    active.ctx.drawImage(copy, 0, 0);
    active.ctx.filter = "none";

    const layers = doc.layers.map((layer) =>
      layer.id === active.id
        ? { ...layer, filters: { ...DEFAULT_FILTERS } }
        : layer,
    );
    const next = { ...doc, layers };
    const area = { x: 0, y: 0, width: doc.width, height: doc.height };

    record({
      doc: { before: doc, after: next },
      pixels: captureChange(active.ctx, copy, area),
    });
    setDoc(next);
  }

  const openFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const loaded = new Image();
    loaded.addEventListener("load", () => {
      URL.revokeObjectURL(url);
      const newDoc = createDocument(loaded.width, loaded.height);
      newDoc.layers[0].ctx.drawImage(loaded, 0, 0);
      clearHistory();
      setDoc(newDoc);
    });
    loaded.src = url;
  }, []);

  function saveImage() {
    const downloadCanvas = document.createElement("canvas");
    if (!downloadCanvas) return;
    const donwloadCanvasCtx = downloadCanvas.getContext("2d");
    if (!donwloadCanvasCtx) return;

    downloadCanvas.width = doc.width;
    downloadCanvas.height = doc.height;
    renderDocument(donwloadCanvasCtx, doc);

    downloadCanvas.toBlob((blob) => {
      const newA = document.createElement("a");
      if (!blob) return;
      const url = URL.createObjectURL(blob);

      newA.href = url;
      newA.download = "Epigimp.png";
      newA.click();
      URL.revokeObjectURL(url);
    });
  }

  function newDocument(width: number, height: number, color: string) {
    const newDoc = createDocument(width, height);
    newDoc.layers[0].ctx.fillStyle = color;
    newDoc.layers[0].ctx.fillRect(0, 0, width, height);
    clearHistory();
    setDoc(newDoc);
    setShowNewDialog(false);
  }

  function handleAddLayer() {
    const layer = createLayer(doc.width, doc.height, "New layer");
    changeDoc({ ...doc, layers: [...doc.layers, layer] });
  }

  function deleteLayer(id: string) {
    if (doc.layers.length === 1) return;

    const index = doc.layers.findIndex((layer) => layer.id === id);
    const remaining = doc.layers.filter((layer) => layer.id !== id);
    const neighbour = remaining[Math.max(0, index - 1)];

    changeDoc({
      ...doc,
      layers: [...doc.layers.filter((layer) => layer.id !== id)],
      activeLayerId:
        doc.activeLayerId === id ? neighbour.id : doc.activeLayerId,
    });
  }

  function selectLayer(id: string) {
    setDoc({ ...doc, activeLayerId: id });
  }

  function moveLayer(draggedId: string, targetId: string) {
    if (draggedId === targetId) return;

    const from = doc.layers.findIndex((layer) => layer.id === draggedId);
    const to = doc.layers.findIndex((layer) => layer.id === targetId);
    if (from === -1 || to === -1) return;

    const layers = [...doc.layers];
    const moved = layers[from];
    layers.splice(from, 1);
    layers.splice(to, 0, moved);
    changeDoc({ ...doc, layers });
  }

  function showSwitchLayer(id: string) {
    const layers = doc.layers.map((layer) =>
      layer.id === id ? { ...layer, visible: !layer.visible } : layer,
    );
    changeDoc({ ...doc, layers });
  }

  function setBlendMode(id: string, blendMode: BlendMode) {
    const layers = doc.layers.map((layer) =>
      layer.id === id ? { ...layer, blendMode } : layer,
    );
    changeDoc({ ...doc, layers });
  }

  function setSelection(selection: SelectionRect | null) {
    setDoc((previous) => ({ ...previous, selection }));
  }

  function updateBrush(changes: Partial<BrushSettings>) {
    setBrush({ ...brush, ...changes });
  }

  function togglePanel(name: keyof PanelVisibility) {
    setPanels({ ...panels, [name]: !panels[name] });
  }

  function appClass() {
    let className = "app";
    if (!showLeft) className += " no-left";
    if (!panels.image) className += " no-right";
    return className;
  }

  return (
    <div className={appClass()}>
      <TopBar panels={panels} onTogglePanel={togglePanel} />
      {showLeft && (
        <ToolPanel
          panels={panels}
          brush={brush}
          onBrushChange={updateBrush}
          filters={activeFilters}
          onFilterChange={setFilter}
          onApplyFilters={applyFilters}
          onOpenFile={openFile}
          onSaveImage={saveImage}
          onNewDocument={() => setShowNewDialog(true)}
        />
      )}
      <CanvasArea
        doc={doc}
        brush={brush}
        onBrushChange={updateBrush}
        onSelectionChange={setSelection}
        onPixelsChange={recordPixels}
      />
      {panels.image && (
        <LayersPanel
          doc={doc}
          onAddLayer={handleAddLayer}
          onDeleteLayer={deleteLayer}
          onSelectLayer={selectLayer}
          onShowSwitchLayer={showSwitchLayer}
          onMoveLayer={moveLayer}
          onBlendModeChange={setBlendMode}
        />
      )}
      {showNewDialog && (
        <NewDocumentDialog
          onCreate={newDocument}
          onCancel={() => setShowNewDialog(false)}
        />
      )}
    </div>
  );
}
