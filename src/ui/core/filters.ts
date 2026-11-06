export interface FilterSettings {
  opacity: number;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  inversion: number;
}

export const DEFAULT_FILTERS: FilterSettings = {
  opacity: 100,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  inversion: 0,
};

export function toCssFilter(filters: FilterSettings): string {
  return [
    `opacity(${filters.opacity}%)`,
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `saturate(${filters.saturation}%)`,
    `blur(${filters.blur}px)`,
    `invert(${filters.inversion}%)`,
  ].join(" ");
}
