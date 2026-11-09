/** A real-world place you have logged somewhere: a theatre today, cafes, restaurants and activities later. */
export interface Place {
  id:         string
  kind:       string
  name:       string
  city:       string | null
  area:       string | null
  address:    string | null
  maps_url:   string | null
  created_at: string
}

/** The compact shape movie logs carry when they are loaded with their place. */
export type PlaceLite = Pick<Place, 'id' | 'kind' | 'name' | 'city' | 'area'>

export const CITIES = ['Hyderabad', 'Chennai'] as const

/** Screen formats you can pick for a theatre visit (picture and sound). Left empty for an ordinary screen. */
export const SCREEN_FORMATS: { key: string; label: string }[] = [
  { key: 'imax',    label: 'IMAX' },
  { key: '4dx',     label: '4DX' },
  { key: 'mx4d',    label: 'MX4D' },
  { key: 'dolby',   label: 'Dolby Cinema' },
  { key: 'atmos',   label: 'Dolby Atmos' },
  { key: 'vision',  label: 'Dolby Vision' },
  { key: 'barco',   label: 'HDR by Barco' },
  { key: 'screenx', label: 'ScreenX' },
  { key: 'pxl',     label: 'PXL' },
  { key: 'onyx',    label: 'Onyx LED' },
  { key: '3d',      label: '3D' },
]

/** Seating tier, picked separately because one visit can be both (IMAX in a recliner). */
export const SEATING: { key: string; label: string }[] = [
  { key: 'recliner', label: 'Recliner' },
  { key: 'luxe',     label: 'Luxe' },
  { key: 'insignia', label: 'Insignia' },
  { key: 'gold',     label: 'Gold Class' },
]

export const screenFormatLabel = (key: string | null | undefined) => SCREEN_FORMATS.find(f => f.key === key)?.label ?? null
export const seatingLabel      = (key: string | null | undefined) => SEATING.find(f => f.key === key)?.label ?? null

/** "Prasads Multiplex, Hyderabad" or just the name. */
export function placeLine(p: PlaceLite | null | undefined): string | null {
  if (!p) return null
  return [p.name, p.area, p.city].filter(Boolean).join(', ')
}
