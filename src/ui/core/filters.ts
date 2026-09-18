export interface FilterSettings {
  brightness: number
  saturation: number
  blur: number
  inversion: number
}

export const DEFAULT_FILTERS: FilterSettings = {
  brightness: 100,
  saturation: 100,
  blur: 0,
  inversion: 0,
}

export function toCssFilter(filters: FilterSettings): string {
  return [
    `brightness(${filters.brightness}%)`,
    `saturate(${filters.saturation}%)`,
    `blur(${filters.blur}px)`,
    `invert(${filters.inversion}%)`,
  ].join(' ')
}
