export type PeakType = 'summit' | 'base_camp'

export interface Peak {
  name: string
  nameEn: string
  elevation: number
  location: string
  type: PeakType
  date: string
  description: string
  coordinates: [number, number] // [longitude, latitude]
}

export const peaks: Peak[] = [
  {
    name: 'Приют Одиннадцати',
    nameEn: 'Priut 11',
    elevation: 4130,
    location: 'Кабардино-Балкария, Россия',
    type: 'base_camp',
    date: '2025',
    description: 'Легендарный высокогорный приют на южном склоне Эльбруса',
    coordinates: [42.43, 43.33],
  },
  {
    name: 'Иремель',
    nameEn: 'Iremel',
    elevation: 1582,
    location: 'Башкортостан, Россия',
    type: 'summit',
    date: '2025',
    description: 'Вторая по высоте вершина Южного Урала',
    coordinates: [58.85, 54.52],
  },
  {
    name: 'Скалы Пастухова',
    nameEn: 'Pastukhov Rocks',
    elevation: 4700,
    location: 'Кабардино-Балкария, Россия',
    type: 'summit',
    date: 'Май 2026',
    description: 'Скальные выходы на восточном склоне Эльбруса',
    coordinates: [43.33, 42.45],
  },
  {
    name: 'Обсерватория «Пик Терскол»',
    nameEn: 'Terskol Peak Observatory',
    elevation: 3100,
    location: 'Кабардино-Балкария, Россия',
    type: 'base_camp',
    date: 'Апрель 2026',
    description: 'Высокогорная астрономическая обсерватория на склоне горы Терскол',
    coordinates: [42.52, 43.27],
  },
  {
    name: 'Чегет',
    nameEn: 'Cheget',
    elevation: 3300,
    location: 'Кабардино-Балкария, Россия',
    type: 'summit',
    date: 'Апрель 2026',
    description: 'Гора с видом на Эльбрус и Баксанское ущелье',
    coordinates: [42.75, 43.27],
  },
]
