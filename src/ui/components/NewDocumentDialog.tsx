import { useState } from "react";
import "./NewDocumentDialog.css";

interface NewDocumentDialogProps {
  onCreate: (width: number, height: number, color: string) => void;
  onCancel: () => void;
}

const MAX_SIZE = 8000;

function checkSize(value: string): number | null {
  const size = Number(value);
  if (value.trim() === "" || !Number.isInteger(size)) return null;
  if (size < 1 || size > MAX_SIZE) return null;
  return size;
}

export function NewDocumentDialog({
  onCreate,
  onCancel,
}: NewDocumentDialogProps) {
  const [width, setWidth] = useState("800");
  const [height, setHeight] = useState("600");
  const [color, setColor] = useState("#ffffff");
  const [error, setError] = useState("");

  function handleCreate() {
    const w = checkSize(width);
    const h = checkSize(height);

    if (w === null || h === null) {
      setError(
        `Width and height must be whole numbers between 1 and ${MAX_SIZE}.`,
      );
      return;
    }
    onCreate(w, h, color);
  }

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <div className="dialog-title">New document</div>

        <label htmlFor="new-width">width</label>
        <input
          id="new-width"
          type="number"
          value={width}
          onChange={(event) => setWidth(event.target.value)}
        />

        <label htmlFor="new-height">height</label>
        <input
          id="new-height"
          type="number"
          value={height}
          onChange={(event) => setHeight(event.target.value)}
        />

        <label htmlFor="new-color">background</label>
        <input
          id="new-color"
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
        />

        {error && <div className="dialog-error">{error}</div>}

        <div className="dialog-buttons">
          <button onClick={onCancel}>annuler</button>
          <button className="dialog-confirm" onClick={handleCreate}>
            créer
          </button>
        </div>
      </div>
    </div>
  );
}
