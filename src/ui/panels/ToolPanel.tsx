import { Slider } from '../components/Slider'
import type { FilterSettings } from '../core/filters'
import './ToolPanel.css'

interface ToolPanelProps {
  filters: FilterSettings
  onFilterChange: (key: keyof FilterSettings, value: number) => void
  onOpenFile: (file: File) => void
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
    </aside>
  )
}
