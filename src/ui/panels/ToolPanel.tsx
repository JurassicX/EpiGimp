import { DEFAULT_BRUSH } from '../brush/drawSquare'
import { Slider } from '../components/Slider'
import type { FilterSettings } from '../core/filters'
import './ToolPanel.css'

interface ToolPanelProps {
  filters: FilterSettings
  onFilterChange: (key: keyof FilterSettings, value: number) => void
  onOpenFile: (file: File) => void
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

export function ToolPanel({ filters, onFilterChange, onOpenFile }: ToolPanelProps) {
  return (
    <aside className="left-panel">
      <div className="tool-panel">
        <div className="tool-panel-item">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onOpenFile(file)
            }}
          />
        </div>

        <Slider id="brightness" label="brightness" min={0} max={200}
                value={filters.brightness} onChange={(value) => onFilterChange('brightness', value)} />
        <Slider id="saturation" label="saturation" min={0} max={200}
                value={filters.saturation} onChange={(value) => onFilterChange('saturation', value)} />
        <Slider id="blur" label="blur" min={0} max={25}
                value={filters.blur} onChange={(value) => onFilterChange('blur', value)} />
        <Slider id="inversion" label="inversion" min={0} max={100}
                value={filters.inversion} onChange={(value) => onFilterChange('inversion', value)} />
      </div>
      <div>
        <button onClick={() => DEFAULT_BRUSH.brushType = "brush"}>pinceau</button>
        <button onClick={() => DEFAULT_BRUSH.brushType = "eraser"}>gomme</button>
        <div>color</div>
        <input type="color" onChange={(event) => {updateBrushColor(event.target.value)}} ></input>
        <div>size</div>
        <input type="number" defaultValue={20} min={1} max={1000} onChange={(event) => {updateBrushSize(Number(event.target.value))}}></input>
        <div>hardness</div>
        <input type="number" defaultValue={1} min={0} max={1} step={0.1} onChange={(event) => {updateBrushOpaHardness(Number(event.target.value))}} ></input>
        <div>opacity</div>
        <input type="number" defaultValue={1} min={0} max={1} step={0.1} onChange={(event) => {updateBrushOpacity(Number(event.target.value))}}></input>

      </div>
    </aside>
  )
}
