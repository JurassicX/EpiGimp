import type { CSSProperties } from "react";
import "./Slider.css";

interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function Slider({ id, label, value, min, max, onChange }: SliderProps) {
  const fill = ((value - min) / (max - min)) * 100;

  return (
    <div className="slider">
      <label className="slider-label" htmlFor={id}>
        {label}
        <span className="slider-value">{value}</span>
      </label>
      <input
        className="slider-input"
        type="range"
        id={id}
        min={min}
        max={max}
        value={value}
        style={{ "--fill": `${fill}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
