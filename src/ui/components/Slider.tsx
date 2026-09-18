import './Slider.css'

interface SliderProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

export function Slider({ id, label, value, min, max, onChange }: SliderProps) {
  return (
    <div className="slider">
      <label className="slider-label" htmlFor={id}>{label}</label>
      <input
        className="slider-input"
        type="range"
        id={id}
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
