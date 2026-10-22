import type { BrushSettings, BrushType } from "../brush/drawSquare";
import { Slider } from "../components/Slider";
import type { FilterSettings } from "../core/filters";
import type { PanelVisibility } from "../core/panels";
import "./ToolPanel.css";

interface ToolPanelProps {
  panels: PanelVisibility;
  brush: BrushSettings;
  onBrushChange: (changes: Partial<BrushSettings>) => void;
  filters: FilterSettings;
  onFilterChange: (key: keyof FilterSettings, value: number) => void;
  onOpenFile: (file: File) => void;
  onSaveImage: () => void;
}

export function ToolPanel({
  panels,
  brush,
  onBrushChange,
  filters,
  onFilterChange,
  onOpenFile,
  onSaveImage,
}: ToolPanelProps) {
  function toolClass(type: BrushType) {
    return brush.brushType === type ? "active" : "";
  }

  return (
    <aside className="left-panel">
      <div className="tool-panel">
        {panels.file && (
          <div className="tool-panel-item">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onOpenFile(file);
              }}
            />
            <button onClick={() => onSaveImage()}>sauvegarder</button>
          </div>
        )}

        {panels.filters && (
          <div className="filters-panel">
            <Slider
              id="opacity"
              label="opacity"
              min={0}
              max={100}
              value={filters.opacity}
              onChange={(value) => onFilterChange("opacity", value)}
            />
            <Slider
              id="brightness"
              label="brightness"
              min={0}
              max={200}
              value={filters.brightness}
              onChange={(value) => onFilterChange("brightness", value)}
            />
            <Slider
              id="saturation"
              label="saturation"
              min={0}
              max={200}
              value={filters.saturation}
              onChange={(value) => onFilterChange("saturation", value)}
            />
            <Slider
              id="blur"
              label="blur"
              min={0}
              max={25}
              value={filters.blur}
              onChange={(value) => onFilterChange("blur", value)}
            />
            <Slider
              id="inversion"
              label="inversion"
              min={0}
              max={100}
              value={filters.inversion}
              onChange={(value) => onFilterChange("inversion", value)}
            />
          </div>
        )}
      </div>
      {panels.edit && (
        <div className="brush-panel">
          <button
            className={toolClass("brush")}
            onClick={() => onBrushChange({ brushType: "brush" })}
          >
            pinceau
          </button>
          <button
            className={toolClass("eraser")}
            onClick={() => onBrushChange({ brushType: "eraser" })}
          >
            gomme
          </button>
          <button
            className={toolClass("eyedropper")}
            onClick={() => onBrushChange({ brushType: "eyedropper" })}
          >
            pipette
          </button>
          <div>color</div>
          <input
            type="color"
            value={brush.color}
            onChange={(event) => onBrushChange({ color: event.target.value })}
          ></input>
          <div>size</div>
          <input
            type="number"
            value={brush.size}
            min={1}
            max={1000}
            onChange={(event) =>
              onBrushChange({ size: Number(event.target.value) })
            }
          ></input>
          <div>hardness</div>
          <input
            type="number"
            value={brush.hardness}
            min={0}
            max={1}
            step={0.1}
            onChange={(event) =>
              onBrushChange({ hardness: Number(event.target.value) })
            }
          ></input>
          <div>opacity</div>
          <input
            type="number"
            value={brush.opacity}
            min={0}
            max={1}
            step={0.1}
            onChange={(event) =>
              onBrushChange({ opacity: Number(event.target.value) })
            }
          ></input>
        </div>
      )}
    </aside>
  );
}
