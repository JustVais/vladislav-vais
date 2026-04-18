export interface PhotoMeta {
  description: string
  date: string
  place: string
}

export const photosMeta: Record<string, PhotoMeta> = {
  'DSC00435.JPG': {
    description: 'РМК',
    date: 'апрель 2025',
    place: 'Екатеринбург',
  },
  'DSC02347 (2).JPG': {
    description: 'Эльбрус',
    date: 'ноябрь 2025',
    place: 'Пятигорск',
  },
  'DSC02775.JPG': {
    description: 'Moscow City',
    date: 'ноябрь 2025',
    place: 'Москва',
  },
}
