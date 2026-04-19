import type { Metadata } from 'next'
import { PageLayout } from '@/components/shared/PageLayout'
import { ElevationChart } from '@/components/features/mountains/ElevationChart'
import { MountainMapClient } from '@/components/features/mountains/MountainMapClient'
import { peaks } from '@/data/mountains'

export const metadata: Metadata = {
  title: 'Vladislav Vikul | Горы',
}

export default function MountainsPage() {
  const summits = peaks.filter((p) => p.type === 'summit').length
  const maxElevation = Math.max(...peaks.map((p) => p.elevation))

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">

        {/* Stats */}
        <div className="bg-white rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
          <div>
            <p className="text-xs font-open-sans font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">
              Вершин
            </p>
            <p className="font-eurostile text-4xl">{summits}</p>
          </div>
          <div>
            <p className="text-xs font-open-sans font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">
              Макс. высота
            </p>
            <p className="font-eurostile text-4xl">{maxElevation} <span className="text-2xl text-gray-400">м</span></p>
          </div>
          <div>
            <p className="text-xs font-open-sans font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">
              Точек
            </p>
            <p className="font-eurostile text-4xl">{peaks.length}</p>
          </div>
        </div>

        {/* Elevation chart */}
        <ElevationChart />

        {/* Peak list */}
        <div className="bg-white rounded-2xl overflow-hidden">
          {peaks
            .slice()
            .sort((a, b) => b.elevation - a.elevation)
            .map((peak, i, arr) => (
              <div
                key={peak.name}
                className={`flex items-start gap-3 sm:gap-6 px-4 sm:px-6 py-4 sm:py-5 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <span className="text-xs text-gray-300 font-open-sans w-5 shrink-0 pt-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-eurostile text-lg sm:text-2xl leading-tight">{peak.name}</span>
                    <span className="font-open-sans text-xs sm:text-sm text-gray-400">{peak.location}</span>
                  </div>
                  <p className="font-open-sans text-xs sm:text-sm text-gray-500 mt-1">{peak.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-eurostile text-xl sm:text-2xl">{peak.elevation}</p>
                  <p className="font-open-sans text-[10px] sm:text-xs text-gray-400">м · {peak.date}</p>
                </div>
              </div>
            ))}
        </div>

        {/* Map */}
        <MountainMapClient />

      </div>
    </PageLayout>
  )
}
