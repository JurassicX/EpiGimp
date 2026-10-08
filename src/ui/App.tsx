import { TopBar } from './panels/TopBar'
import { ToolPanel } from './panels/ToolPanel'
import { CanvasArea } from './panels/CanvasArea'
import { LayersPanel } from './panels/LayersPanel'
import './App.css'
import { useCallback, useState } from 'react'
import { createTestDocument } from './core/createTestDoc'
import { createDocument, createLayer } from './core/document'
import { DEFAULT_FILTERS, type FilterSettings } from './core/filters'


export function App() {
  const [doc, setDoc] = useState(createTestDocument)
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS)

  const setFilter = useCallback((key: keyof FilterSettings, value: number) => {
    setFilters((previous) => ({ ...previous, [key]: value }))
  }, [])
  
  const openFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    const loaded = new Image()
    loaded.addEventListener('load', () => {
      URL.revokeObjectURL(url)
      setFilters(DEFAULT_FILTERS)
      const newDoc = createDocument(loaded.width, loaded.height)
      newDoc.layers[0].ctx.drawImage(loaded, 0, 0)
      setDoc(newDoc)
    })
    loaded.src = url
  }, [])

  function handleAddLayer() {
    const layer = createLayer(doc.width, doc.height, 'New layer')
    setDoc({ ...doc, layers: [...doc.layers, layer] })
  }

  function deleteLayer(id: string) {
    setDoc({ ...doc, layers: [...doc.layers.filter(layer => layer.id !== id)] })
  }

  function selectLayer(id: string) {
    setDoc({ ...doc, activeLayerId: id})
  }

  function showSwitchLayer(id: string) {
    const layers = doc.layers.map(layer => layer.id === id ? { ...layer, visible: !layer.visible } : layer)
    setDoc({ ...doc, layers })
  }

  return (
    <div className="app">
      <TopBar />
      <ToolPanel filters={filters} onFilterChange={setFilter} onOpenFile={openFile} />
      <CanvasArea filters={filters} doc={doc} />
      <LayersPanel doc={doc} onAddLayer={handleAddLayer} onDeleteLayer={deleteLayer} onSelectLayer={selectLayer} onShowSwitchLayer={showSwitchLayer}/>
    </div>
  )
}
