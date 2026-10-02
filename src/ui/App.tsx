import { TopBar } from './panels/TopBar'
import { ToolPanel } from './panels/ToolPanel'
import { CanvasArea } from './panels/CanvasArea'
import { LayersPanel } from './panels/LayersPanel'
import { useImageFilters } from './hooks/useImageFilters'
import './App.css'
import { useState } from 'react'
import { createTestDocument } from './core/createTestDoc'

export function App() {
  const { image, filters, setFilter, openFile } = useImageFilters()
  const [doc, setDoc] = useState(createTestDocument)

  return (
    <div className="app">
      <TopBar />
      <ToolPanel filters={filters} onFilterChange={setFilter} onOpenFile={openFile} />
      <CanvasArea image={image} filters={filters} doc={doc} />
      <LayersPanel doc={doc} />
    </div>
  )
}
