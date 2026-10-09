import { LayerThumbnail } from "../components/LayerThumbnail"
import { type EpiDocument } from "../core/document"
import "./LayersPanel.css"

interface LayersPanelProps {
  doc: EpiDocument
  onAddLayer: () => void
  onDeleteLayer: (id: string) => void
  onSelectLayer: (id: string) => void
  onShowSwitchLayer: (id: string) => void
}

export function LayersPanel({ doc, onAddLayer, onDeleteLayer, onSelectLayer, onShowSwitchLayer }: LayersPanelProps) {


  return (
    <aside className="right-panel">
      <div>Layers:</div>
      <button onClick={onAddLayer}>ajouter</button>
      {doc.layers.toReversed().map((layer) => (
        <div key={layer.id} className={layer.id === doc.activeLayerId ? 'layer-row selected' : 'layer-row'}>
          <div onClick={() => onSelectLayer(layer.id)}>
            <div>{layer.name}</div>
            <LayerThumbnail layer={layer} ></LayerThumbnail>
          </div>
          <button onClick={() => onDeleteLayer(layer.id)}>suprimer</button>
          <button onClick={() => onShowSwitchLayer(layer.id)}>visible</button>
        </div>
      ))}
    </aside>
  )
}
