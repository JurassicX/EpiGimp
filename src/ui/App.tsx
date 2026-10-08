import { TopBar } from './panels/TopBar'
import { ToolPanel } from './panels/ToolPanel'
import { CanvasArea } from './panels/CanvasArea'
import { LayersPanel } from './panels/LayersPanel'
import { useImageFilters } from './hooks/useImageFilters'
import './App.css'
import { useState } from 'react'
import { createTestDocument } from './core/createTestDoc'
import { createLayer } from './core/document'


export function App() {
  const { image, filters, setFilter, openFile } = useImageFilters()
  const [doc, setDoc] = useState(createTestDocument)

  function handleAddLayer() {
    const layer = createLayer(doc.width, doc.height, 'New layer')
    setDoc({ ...doc, layers: [...doc.layers, layer] })
  }

  function deleteLayer(id: string) {
    setDoc({ ...doc, layers: [...doc.layers.filter(layer => layer.id !== id)] })
  }

  function selectLayer(id: string) {
    setDoc({...doc, activeLayerId: id})
  }

  return (
    <div className="app">
      <TopBar />
      <ToolPanel filters={filters} onFilterChange={setFilter} onOpenFile={openFile} />
      <CanvasArea image={image} filters={filters} doc={doc} />
      <LayersPanel doc={doc} onAddLayer={handleAddLayer} onDeleteLayer={deleteLayer} onSelectLayer={selectLayer}/>
    </div>
  )
}
