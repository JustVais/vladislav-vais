export type PeakType = 'summit' | 'base_camp'

export interface Peak {
  name: string
  nameEn: string
  elevation: number
  location: string
  type: PeakType
  date: string
  description: string
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
  },
  {
    name: 'Иремель',
    nameEn: 'Iremel',
    elevation: 1582,
    location: 'Башкортостан, Россия',
    type: 'summit',
    date: '2025',
    description: 'Вторая по высоте вершина Южного Урала',
  },
]
