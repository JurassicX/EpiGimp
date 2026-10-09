import { DEFAULT_BRUSH } from '../brush/drawSquare'
import { Slider } from '../components/Slider'
import type { FilterSettings } from '../core/filters'
import type { PanelVisibility } from '../core/panels'
import './ToolPanel.css'

interface ToolPanelProps {
  panels: PanelVisibility
  filters: FilterSettings
  onFilterChange: (key: keyof FilterSettings, value: number) => void
  onOpenFile: (file: File) => void
  onSaveImage: () => void
}

function updateBrushSize(size: number) {
  DEFAULT_BRUSH.size = size
}

function updateBrushOpaHardness(hardness: number) {
  DEFAULT_BRUSH.hardness = hardness
}

function updateBrushOpacity(opacity: number) {
  DEFAULT_BRUSH.opacity = opacity
}

function updateBrushColor(color: string) {
  DEFAULT_BRUSH.color = color
}

export function ToolPanel({ panels, filters, onFilterChange, onOpenFile, onSaveImage }: ToolPanelProps) {
  return (
    <aside className="left-panel">
      <div className="tool-panel">
        {panels.file && (
          <div className="tool-panel-item">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) onOpenFile(file)
              }}
            />
            <button onClick={() => onSaveImage()} >sauvegarder</button>
          </div>
        )}

        {panels.filters && (
          <div className="filters-panel">
            <Slider id="brightness" label="brightness" min={0} max={200}
                    value={filters.brightness} onChange={(value) => onFilterChange('brightness', value)} />
            <Slider id="saturation" label="saturation" min={0} max={200}
                    value={filters.saturation} onChange={(value) => onFilterChange('saturation', value)} />
            <Slider id="blur" label="blur" min={0} max={25}
                    value={filters.blur} onChange={(value) => onFilterChange('blur', value)} />
            <Slider id="inversion" label="inversion" min={0} max={100}
                    value={filters.inversion} onChange={(value) => onFilterChange('inversion', value)} />
          </div>
        )}
      </div>
      {panels.edit && (
      <div className="brush-panel">
        <button onClick={() => DEFAULT_BRUSH.brushType = "brush"}>pinceau</button>
        <button onClick={() => DEFAULT_BRUSH.brushType = "eraser"}>gomme</button>
        <button onClick={() => DEFAULT_BRUSH.brushType = "eyedropper"}>pipette</button>
        <div>color</div>
        <input type="color" defaultValue={DEFAULT_BRUSH.color} onChange={(event) => {updateBrushColor(event.target.value)}} ></input>
        <div>size</div>
        <input type="number" defaultValue={DEFAULT_BRUSH.size} min={1} max={1000} onChange={(event) => {updateBrushSize(Number(event.target.value))}}></input>
        <div>hardness</div>
        <input type="number" defaultValue={DEFAULT_BRUSH.hardness} min={0} max={1} step={0.1} onChange={(event) => {updateBrushOpaHardness(Number(event.target.value))}} ></input>
        <div>opacity</div>
        <input type="number" defaultValue={DEFAULT_BRUSH.opacity} min={0} max={1} step={0.1} onChange={(event) => {updateBrushOpacity(Number(event.target.value))}}></input>

      </div>
      )}
    </aside>
  )
}
