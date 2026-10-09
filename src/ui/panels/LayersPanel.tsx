import { useState } from "react"
import { LayerThumbnail } from "../components/LayerThumbnail"
import { type EpiDocument, type Layer } from "../core/document"
import "./LayersPanel.css"

interface LayersPanelProps {
  doc: EpiDocument
  onAddLayer: () => void
  onDeleteLayer: (id: string) => void
  onSelectLayer: (id: string) => void
  onShowSwitchLayer: (id: string) => void
  onMoveLayer: (draggedId: string, targetId: string) => void
}

export function LayersPanel({ doc, onAddLayer, onDeleteLayer, onSelectLayer, onShowSwitchLayer, onMoveLayer }: LayersPanelProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  function endDrag() {
    setDraggedId(null)
    setOverId(null)
  }

  function rowClass(layer: Layer) {
    let className = 'layer-row'
    if (layer.id === doc.activeLayerId) className += ' selected'
    if (!layer.visible) className += ' hidden-layer'
    if (layer.id === draggedId) className += ' dragging'
    if (layer.id === overId && layer.id !== draggedId) className += ' drag-over'
    return className
  }

  return (
    <aside className="right-panel">
      <div className="panel-title">Layers:</div>
      <button onClick={onAddLayer}>ajouter</button>
      {doc.layers.toReversed().map((layer) => (
        <div
          key={layer.id}
          className={rowClass(layer)}
          draggable
          onDragStart={() => setDraggedId(layer.id)}
          onDragOver={(event) => {
            event.preventDefault()
            setOverId(layer.id)
          }}
          onDrop={() => {
            if (draggedId) onMoveLayer(draggedId, layer.id)
            endDrag()
          }}
          onDragEnd={endDrag}
        >
          <div className="layer-info" onClick={() => onSelectLayer(layer.id)}>
            <LayerThumbnail layer={layer} ></LayerThumbnail>
            <div>{layer.name}</div>
          </div>
          <button onClick={() => onDeleteLayer(layer.id)}>suprimer</button>
          <button className={layer.visible ? 'visibility on' : 'visibility'} onClick={() => onShowSwitchLayer(layer.id)}>
            {layer.visible ? 'visible' : 'caché'}
          </button>
        </div>
      ))}
    </aside>
  )
}
