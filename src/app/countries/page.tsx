import type { Metadata } from 'next'
import { PageLayout } from '@/components/shared/PageLayout'
import { WorldMapClient } from '@/components/features/countries/WorldMapClient'
import { visited } from '@/data/countries'

export const metadata: Metadata = {
  title: 'Vladislav Vikul | Страны',
}

export default function CountriesPage() {
  const totalCities = visited.reduce((acc, c) => acc + c.cities.length, 0)

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">

        {/* Статистика */}
        <div className="bg-white rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
          <div>
            <p className="text-xs font-open-sans font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">
              Страны
            </p>
            <p className="font-eurostile text-4xl">{visited.length}</p>
          </div>
          <div>
            <p className="text-xs font-open-sans font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">
              Города
            </p>
            <p className="font-eurostile text-4xl">{totalCities}</p>
          </div>
        </div>

        {/* Список стран */}
        <div className="bg-white rounded-2xl overflow-hidden">
          {visited.map((country, i) => (
            <div
              key={country.isoNumeric}
              className={`flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 px-6 py-5 ${i < visited.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-center gap-4 sm:w-48 shrink-0">
                <span className="text-4xl leading-none">{country.flag}</span>
                <div className="flex flex-col">
                  <p className="font-eurostile text-xl leading-tight">{country.name}</p>
                  <p className="font-open-sans text-xs text-gray-400 mt-1 tabular-nums">
                    {country.cities.length}&nbsp;{country.cities.length === 1 ? 'город' : country.cities.length < 5 ? 'города' : 'городов'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {country.cities.map((city) => (
                  <span
                    key={city.name}
                    className="font-open-sans text-xs px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 border border-gray-100"
                  >
                    {city.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Карта */}
        <WorldMapClient />

      </div>
    </PageLayout>
  )
}
