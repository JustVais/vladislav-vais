import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from '@/locales/en/common.json'
import enAbout from '@/locales/en/about.json'
import enWork from '@/locales/en/work.json'
import ruCommon from '@/locales/ru/common.json'
import ruAbout from '@/locales/ru/about.json'
import ruWork from '@/locales/ru/work.json'

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { common: enCommon, about: enAbout, work: enWork },
      ru: { common: ruCommon, about: ruAbout, work: ruWork },
    },
    lng: 'ru',
    fallbackLng: 'ru',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
  })
}

export default i18n
