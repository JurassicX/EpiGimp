export interface PanelVisibility {
  file: boolean
  edit: boolean
  image: boolean
  filters: boolean
}

export const DEFAULT_PANELS: PanelVisibility = {
  file: true,
  edit: true,
  image: true,
  filters: true,
}
