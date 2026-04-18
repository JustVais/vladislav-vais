export interface City {
  name: string
  coordinates: [number, number] // [longitude, latitude]
}

export interface Country {
  name: string
  nameEn: string
  flag: string
  isoNumeric: number
  cities: City[]
}

export const visited: Country[] = [
  {
    name: 'Россия',
    nameEn: 'Russia',
    flag: '🇷🇺',
    isoNumeric: 643,
    cities: [
      { name: 'Москва',           coordinates: [37.6173, 55.7558] },
      { name: 'Санкт-Петербург',  coordinates: [30.3141, 59.9386] },
      { name: 'Екатеринбург',     coordinates: [60.6122, 56.8519] },
      { name: 'Нижний Тагил',     coordinates: [59.9796, 57.9099] },
      { name: 'Нижний Новгород',  coordinates: [43.9578, 56.2965] },
      { name: 'Самара',           coordinates: [50.1606, 53.1959] },
      { name: 'Волгоград',        coordinates: [44.5133, 48.7080] },
      { name: 'Воронеж',          coordinates: [39.1843, 51.6720] },
      { name: 'Липецк',           coordinates: [39.5740, 52.6088] },
      { name: 'Рязань',           coordinates: [39.7257, 54.6269] },
      { name: 'Смоленск',         coordinates: [32.0401, 54.7818] },
      { name: 'Орёл',             coordinates: [36.0785, 52.9651] },
      { name: 'Курск',            coordinates: [36.1874, 51.7304] },
      { name: 'Краснодар',        coordinates: [38.9760, 45.0448] },
      { name: 'Анапа',            coordinates: [37.3167, 44.8953] },
      { name: 'Минеральные Воды', coordinates: [43.1333, 44.2167] },
      { name: 'Тула',             coordinates: [37.6167, 54.1961] },
      { name: 'Владимир',         coordinates: [40.3964, 56.1290] },
      { name: 'Калуга',           coordinates: [36.2636, 54.5293] },
      { name: 'Ярославль',        coordinates: [39.8845, 57.6261] },
    ],
  },
]
