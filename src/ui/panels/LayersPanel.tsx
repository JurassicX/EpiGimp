import { addLayer, type EpiDocument, type Layer } from "../core/document"

interface LayersPanelProps {
  doc: EpiDocument
  onAddLayer: () => void
  onDeleteLayer: (id: string) => void
}

export function LayersPanel({ doc, onAddLayer, onDeleteLayer }: LayersPanelProps) {


  return (
    <aside className="right-panel">
      <div>Layers:</div>
      <button onClick={onAddLayer}>ajouter</button>
      {doc.layers.toReversed().map((layer) => (
        <div>
          <div key={layer.id}>{layer.name}</div>
          <canvas></canvas>
          <button onClick={() => onDeleteLayer(layer.id)}>suprimer</button>
        </div>
      ))}
    </aside>
  )
}
