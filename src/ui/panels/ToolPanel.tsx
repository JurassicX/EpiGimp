import { useState } from "react";
import type { BrushSettings, BrushType } from "../brush/drawSquare";
import { EXPORT_FORMATS, type ExportFormat } from "../core/exportFormat";
import { FONT_FAMILIES } from "../brush/text";
import { SELECT_SHAPES, type SelectShape } from "../core/selection";
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
  onApplyFilters: () => void;
  onOpenFile: (file: File) => void;
  onSaveImage: (format: ExportFormat, quality: number) => void;
  onNewDocument: () => void;
}

export function ToolPanel({
  panels,
  brush,
  onBrushChange,
  filters,
  onFilterChange,
  onApplyFilters,
  onOpenFile,
  onSaveImage,
  onNewDocument,
}: ToolPanelProps) {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [quality, setQuality] = useState(90);

  function toolClass(type: BrushType) {
    return brush.brushType === type ? "active" : "";
  }

  return (
    <aside className="left-panel">
      {panels.file && (
        <section className="panel-section">
          <div className="panel-title">File</div>
          <div className="file-actions">
            <button onClick={onNewDocument}>nouveau</button>
            <label className="file-open">
              ouvrir
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onOpenFile(file);
                }}
              />
            </label>
            <button onClick={() => onSaveImage(format, quality)}>
              sauvegarder
            </button>
          </div>
          <div className="brush-options">
            <label htmlFor="export-format">format</label>
            <select
              id="export-format"
              value={format}
              onChange={(event) =>
                setFormat(event.target.value as ExportFormat)
              }
            >
              {EXPORT_FORMATS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {format !== "png" && (
              <>
                <label htmlFor="export-quality">quality</label>
                <input
                  id="export-quality"
                  type="number"
                  value={quality}
                  min={1}
                  max={100}
                  onChange={(event) => setQuality(Number(event.target.value))}
                />
              </>
            )}
          </div>
        </section>
      )}

      {panels.edit && (
        <section className="panel-section">
          <div className="panel-title">Edit</div>
          <div className="tool-buttons">
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
            <button
              className={toolClass("select")}
              onClick={() => onBrushChange({ brushType: "select" })}
            >
              sélection
            </button>
            <button
              className={toolClass("bucket")}
              onClick={() => onBrushChange({ brushType: "bucket" })}
            >
              seau
            </button>
            <button
              className={toolClass("wand")}
              onClick={() => onBrushChange({ brushType: "wand" })}
            >
              baguette
            </button>
            <button
              className={toolClass("clone")}
              title="alt + clic pour choisir la source"
              onClick={() => onBrushChange({ brushType: "clone" })}
            >
              tampon
            </button>
            <button
              className={toolClass("move")}
              onClick={() => onBrushChange({ brushType: "move" })}
            >
              déplacer
            </button>
            <button
              className={toolClass("transform")}
              title="entrée pour appliquer, échap pour annuler"
              onClick={() => onBrushChange({ brushType: "transform" })}
            >
              transformer
            </button>
            <button
              className={toolClass("text")}
              onClick={() => onBrushChange({ brushType: "text" })}
            >
              texte
            </button>
          </div>
          <div className="brush-options">
            <label htmlFor="brush-color">color</label>
            <input
              id="brush-color"
              type="color"
              value={brush.color}
              onChange={(event) => onBrushChange({ color: event.target.value })}
            />
            <label htmlFor="brush-size">size</label>
            <input
              id="brush-size"
              type="number"
              value={brush.size}
              min={1}
              max={1000}
              onChange={(event) =>
                onBrushChange({ size: Number(event.target.value) })
              }
            />
            <label htmlFor="brush-hardness">hardness</label>
            <input
              id="brush-hardness"
              type="number"
              value={brush.hardness}
              min={0}
              max={1}
              step={0.1}
              onChange={(event) =>
                onBrushChange({ hardness: Number(event.target.value) })
              }
            />
            <label htmlFor="brush-opacity">opacity</label>
            <input
              id="brush-opacity"
              type="number"
              value={brush.opacity}
              min={0}
              max={1}
              step={0.1}
              onChange={(event) =>
                onBrushChange({ opacity: Number(event.target.value) })
              }
            />
            {brush.brushType === "select" && (
              <>
                <label htmlFor="brush-select-shape">shape</label>
                <select
                  id="brush-select-shape"
                  value={brush.selectShape}
                  onChange={(event) =>
                    onBrushChange({
                      selectShape: event.target.value as SelectShape,
                    })
                  }
                >
                  {SELECT_SHAPES.map((shape) => (
                    <option key={shape} value={shape}>
                      {shape}
                    </option>
                  ))}
                </select>
              </>
            )}
            {brush.brushType === "text" && (
              <>
                <label htmlFor="brush-font">font</label>
                <select
                  id="brush-font"
                  value={brush.fontFamily}
                  onChange={(event) =>
                    onBrushChange({ fontFamily: event.target.value })
                  }
                >
                  {FONT_FAMILIES.map((family) => (
                    <option key={family} value={family}>
                      {family}
                    </option>
                  ))}
                </select>
                <label htmlFor="brush-font-size">font size</label>
                <input
                  id="brush-font-size"
                  type="number"
                  value={brush.fontSize}
                  min={4}
                  max={500}
                  onChange={(event) =>
                    onBrushChange({ fontSize: Number(event.target.value) })
                  }
                />
              </>
            )}
            {(brush.brushType === "bucket" || brush.brushType === "wand") && (
              <>
                <label htmlFor="brush-tolerance">tolerance</label>
                <input
                  id="brush-tolerance"
                  type="number"
                  value={brush.tolerance}
                  min={0}
                  max={255}
                  onChange={(event) =>
                    onBrushChange({ tolerance: Number(event.target.value) })
                  }
                />
              </>
            )}
          </div>
        </section>
      )}

      {panels.filters && (
        <section className="panel-section">
          <div className="panel-title">Filters</div>
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
            id="contrast"
            label="contrast"
            min={0}
            max={200}
            value={filters.contrast}
            onChange={(value) => onFilterChange("contrast", value)}
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
          <button className="primary apply" onClick={onApplyFilters}>
            appliquer
          </button>
        </section>
      )}
    </aside>
  );
}
