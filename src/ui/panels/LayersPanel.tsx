import { LayerThumbnail } from "../components/LayerThumbnail"
import { type EpiDocument } from "../core/document"

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
        <div key={layer.id}>
          <div>{layer.name}</div>
          <LayerThumbnail layer={layer} ></LayerThumbnail>
          <button onClick={() => onDeleteLayer(layer.id)}>suprimer</button>
        </div>
      ))}
    </aside>
  )
}
