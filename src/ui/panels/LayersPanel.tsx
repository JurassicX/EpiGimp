import type { EpiDocument } from "../core/document"

interface LayersPanelProps {
  doc: EpiDocument
}

export function LayersPanel({ doc }: LayersPanelProps) {


  return <aside className="right-panel">Layers</aside>
}
