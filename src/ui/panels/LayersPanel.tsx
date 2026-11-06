import { useState } from "react";
import { LayerThumbnail } from "../components/LayerThumbnail";
import { EyeIcon, EyeOffIcon, TrashIcon } from "../components/Icons";
import {
  BLEND_MODES,
  type BlendMode,
  type EpiDocument,
  type Layer,
} from "../core/document";
import "./LayersPanel.css";

const BLEND_MODE_NAMES = Object.keys(BLEND_MODES) as BlendMode[];

interface LayersPanelProps {
  doc: EpiDocument;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
  onSelectLayer: (id: string) => void;
  onShowSwitchLayer: (id: string) => void;
  onMoveLayer: (draggedId: string, targetId: string) => void;
  onBlendModeChange: (id: string, blendMode: BlendMode) => void;
}

export function LayersPanel({
  doc,
  onAddLayer,
  onDeleteLayer,
  onSelectLayer,
  onShowSwitchLayer,
  onMoveLayer,
  onBlendModeChange,
}: LayersPanelProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function endDrag() {
    setDraggedId(null);
    setOverId(null);
  }

  function rowClass(layer: Layer) {
    let className = "layer-row";
    if (layer.id === doc.activeLayerId) className += " selected";
    if (!layer.visible) className += " hidden-layer";
    if (layer.id === draggedId) className += " dragging";
    if (layer.id === overId && layer.id !== draggedId)
      className += " drag-over";
    return className;
  }

  return (
    <aside className="right-panel">
      <div className="layers-header">
        <div className="panel-title">Layers</div>
        <button className="add-layer" onClick={onAddLayer}>
          + ajouter
        </button>
      </div>
      {doc.layers.toReversed().map((layer) => (
        <div
          key={layer.id}
          className={rowClass(layer)}
          draggable
          onDragStart={() => setDraggedId(layer.id)}
          onDragOver={(event) => {
            event.preventDefault();
            setOverId(layer.id);
          }}
          onDrop={() => {
            if (draggedId) onMoveLayer(draggedId, layer.id);
            endDrag();
          }}
          onDragEnd={endDrag}
        >
          <div className="layer-info" onClick={() => onSelectLayer(layer.id)}>
            <LayerThumbnail layer={layer}></LayerThumbnail>
            <div>{layer.name}</div>
          </div>
          {layer.id === doc.activeLayerId && (
            <select
              value={layer.blendMode}
              onChange={(event) =>
                onBlendModeChange(layer.id, event.target.value as BlendMode)
              }
            >
              {BLEND_MODE_NAMES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          )}
          <button
            className={layer.visible ? "icon-button on" : "icon-button"}
            title={layer.visible ? "visible" : "caché"}
            onClick={() => onShowSwitchLayer(layer.id)}
          >
            {layer.visible ? <EyeIcon /> : <EyeOffIcon />}
          </button>
          <button
            className="icon-button danger"
            title="supprimer"
            onClick={() => onDeleteLayer(layer.id)}
          >
            <TrashIcon />
          </button>
        </div>
      ))}
    </aside>
  );
}
