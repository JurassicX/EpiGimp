import { TopBar } from './panels/TopBar'
import { ToolPanel } from './panels/ToolPanel'
import { CanvasArea } from './panels/CanvasArea'
import { LayersPanel } from './panels/LayersPanel'
import './App.css'
import { useCallback, useState } from 'react'
import { createTestDocument } from './core/createTestDoc'
import { createDocument, createLayer } from './core/document'
import { DEFAULT_FILTERS, type FilterSettings } from './core/filters'
import { renderDocument } from './core/renderer'
import { DEFAULT_PANELS, type PanelVisibility } from './core/panels'


export function App() {
  const [doc, setDoc] = useState(createTestDocument)
  const [panels, setPanels] = useState<PanelVisibility>(DEFAULT_PANELS)
  const showLeft = panels.file || panels.edit || panels.filters
  const activeFilters = doc.layers.find(layer => layer.id === doc.activeLayerId)?.filters ?? DEFAULT_FILTERS

  function setFilter(key: keyof FilterSettings, value: number) {
    const layers = doc.layers.map(layer => layer.id === doc.activeLayerId ? { ...layer, filters: { ...layer.filters, [key]: value } } : layer)
    setDoc({ ...doc, layers })
  }
  
  const openFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    const loaded = new Image()
    loaded.addEventListener('load', () => {
      URL.revokeObjectURL(url)
      const newDoc = createDocument(loaded.width, loaded.height)
      newDoc.layers[0].ctx.drawImage(loaded, 0, 0)
      setDoc(newDoc)
    })
    loaded.src = url
  }, [])

  function saveImage() {
    const downloadCanvas = document.createElement('canvas')
    if (!downloadCanvas) return
    const donwloadCanvasCtx = downloadCanvas.getContext('2d')
    if (!donwloadCanvasCtx) return

    downloadCanvas.width = doc.width
    downloadCanvas.height = doc.height
    renderDocument(donwloadCanvasCtx, doc)

    downloadCanvas.toBlob((blob) => {
      const newA = document.createElement('a')
      if (!blob) return
      const url = URL.createObjectURL(blob)

      newA.href = url
      newA.download = "Epigimp.png"
      newA.click()
      URL.revokeObjectURL(url)
    })
  }

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

  function moveLayer(draggedId: string, targetId: string) {
    if (draggedId === targetId) return

    const from = doc.layers.findIndex(layer => layer.id === draggedId)
    const to = doc.layers.findIndex(layer => layer.id === targetId)
    if (from === -1 || to === -1) return

    const layers = [...doc.layers]
    const moved = layers[from]
    layers.splice(from, 1)
    layers.splice(to, 0, moved)
    setDoc({ ...doc, layers })
  }

  function showSwitchLayer(id: string) {
    const layers = doc.layers.map(layer => layer.id === id ? { ...layer, visible: !layer.visible } : layer)
    setDoc({ ...doc, layers })
  }

  function togglePanel(name: keyof PanelVisibility) {
    setPanels({ ...panels, [name]: !panels[name] })
  }

  function appClass() {
    let className = 'app'
    if (!showLeft) className += ' no-left'
    if (!panels.image) className += ' no-right'
    return className
  }

  return (
    <div className={appClass()}>
      <TopBar panels={panels} onTogglePanel={togglePanel} />
      {showLeft && <ToolPanel panels={panels} filters={activeFilters} onFilterChange={setFilter} onOpenFile={openFile} onSaveImage={saveImage} />}
      <CanvasArea doc={doc} />
      {panels.image && <LayersPanel doc={doc} onAddLayer={handleAddLayer} onDeleteLayer={deleteLayer} onSelectLayer={selectLayer} onShowSwitchLayer={showSwitchLayer} onMoveLayer={moveLayer}/>}
    </div>
  )
}
