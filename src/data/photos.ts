export interface PhotoMeta {
  description: string
  date: string
  place: string
}

export interface PhotoEntry {
  publicId: string
  meta: PhotoMeta
}

export const photos: PhotoEntry[] = [
  // апрель 2026
  {
    publicId: 'DSC02925_jgfxuv',
    meta: { description: 'Литературный квартал', date: 'апрель 2026', place: 'Екатеринбург' }
  },
  // ноябрь 2025
  {
    publicId: 'DSC02775_1_xil2ys',
    meta: { description: 'Moscow City', date: 'ноябрь 2025', place: 'Москва' }
  },
  {
    publicId: 'DSC02752_rzlkwa',
    meta: { description: 'Neva Towers', date: 'ноябрь 2025', place: 'Москва' }
  },
  {
    publicId: 'DSC02789_blqwa2',
    meta: { description: '', date: 'ноябрь 2025', place: 'СПБ' },
  },
  {
    publicId: 'DSC02824_dbnb3f',
    meta: { description: '', date: 'ноябрь 2025', place: 'СПБ' },
  },
  {
    publicId: 'DSC02833_zjmz2r',
    meta: { description: '', date: 'ноябрь 2025', place: 'СПБ' },
  },
  {
    publicId: 'DSC02841_rkhbmc',
    meta: { description: '', date: 'ноябрь 2025', place: 'СПБ' },
  },
  // октябрь 2025
  {
    publicId: 'DSC02347_2_wop0hh',
    meta: { description: 'Эльбрус', date: 'октябрь 2025', place: 'Пятигорск' },
  },
  // июль 2025
  {
    publicId: 'DSC02055_ujnbeo',
    meta: { description: 'Нейва', date: 'июль 2025', place: 'Алапаевск' },
  },
  {
    publicId: 'DSC02178_4_rv7gvu',
    meta: { description: '', date: 'июль 2025', place: 'Екатеринбург' },
  },
  // июнь 2025
  {
    publicId: 'DSC01763_ozmuap',
    meta: { description: '', date: 'июнь 2025', place: 'Махнево' },
  },
  {
    publicId: 'DSC01772_m2bplq',
    meta: { description: '', date: 'июнь 2025', place: 'Костино' },
  },
  {
    publicId: 'DSC01789_rwrwua',
    meta: { description: '', date: 'июнь 2025', place: 'Мугай' },
  },
  {
    publicId: 'DSC01826_ty9xkw',
    meta: { description: '', date: 'июнь 2025', place: 'Перевалово' },
  },
  // апрель 2025
  {
    publicId: 'DSC00435_hk9qke',
    meta: { description: 'РМК', date: 'апрель 2025', place: 'Екатеринбург' },
  },
  {
    publicId: 'DSC00438_rmmrni',
    meta: { description: '', date: 'апрель 2025', place: 'Екатеринбург' },
  },
  {
    publicId: 'DSC00644_mu1zmp',
    meta: { description: '', date: 'апрель 2025', place: 'Екатеринбург' },
  },
  {
    publicId: 'DSC00249_tuogoh',
    meta: { description: '', date: 'апрель 2025', place: 'Екатеринбург' },
  },
]
