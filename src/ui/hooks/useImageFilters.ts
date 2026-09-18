import { useCallback, useState } from 'react'
import { DEFAULT_FILTERS, type FilterSettings } from '../core/filters'

export function useImageFilters() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS)

  const setFilter = useCallback((key: keyof FilterSettings, value: number) => {
    setFilters((previous) => ({ ...previous, [key]: value }))
  }, [])

  const openFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    const loaded = new Image()
    loaded.addEventListener('load', () => {
      URL.revokeObjectURL(url)
      setFilters(DEFAULT_FILTERS)
      setImage(loaded)
    })
    loaded.src = url
  }, [])

  return { image, filters, setFilter, openFile }
}
