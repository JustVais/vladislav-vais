'use client'

import { peaks, type Peak } from '@/data/mountains'

const REFERENCE_PEAKS = [
  { name: 'Эверест', elevation: 8849 },
  { name: 'Эльбрус', elevation: 5642 },
]

const MAX_ELEVATION = 9000
const GRID_LINES = [2000, 4000, 6000, 8000]
const CHART_HEIGHT = 256

function typeLabel(type: Peak['type']) {
  return type === 'base_camp' ? 'Приют' : 'Вершина'
}

export function ElevationChart() {
  const myPeaks = [...peaks].sort((a, b) => b.elevation - a.elevation)

  return (
    <div className="bg-white rounded-2xl px-4 sm:px-6 pt-6 pb-6">
      <p className="text-xs font-open-sans font-bold tracking-[0.2em] uppercase text-gray-400 mb-6 sm:mb-8">
        Высота над уровнем моря
      </p>

      {/* Мобайл: горизонтальные бары */}
      <div className="flex flex-col gap-4 md:hidden">
        {myPeaks.map((peak) => {
          const widthPct = (peak.elevation / MAX_ELEVATION) * 100
          return (
            <div key={peak.name}>
              <div className="flex items-baseline justify-between mb-1.5">
                <div>
                  <span className="font-open-sans font-bold text-sm">{peak.name}</span>
                  <span className="ml-2 text-[10px] font-open-sans text-gray-400">{typeLabel(peak.type)}</span>
                </div>
                <span className="font-eurostile text-base">{peak.elevation} м</span>
              </div>
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-black rounded-full"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          )
        })}

        {/* Ориентиры */}
        <div className="pt-2 border-t border-gray-100 flex flex-col gap-3">
          <p className="text-[10px] font-open-sans text-gray-300 uppercase tracking-widest">Ориентиры</p>
          {REFERENCE_PEAKS.map((ref) => {
            const widthPct = (ref.elevation / MAX_ELEVATION) * 100
            return (
              <div key={ref.name} className="opacity-40">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="font-open-sans text-xs text-gray-500">{ref.name}</span>
                  <span className="font-eurostile text-sm">{ref.elevation} м</span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-black rounded-full"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Десктоп: вертикальные бары */}
      <div className="hidden md:block">
        <div className="relative h-64">
          {GRID_LINES.map((alt) => (
            <div
              key={alt}
              className="absolute left-0 right-0 flex items-center gap-2 pointer-events-none"
              style={{ bottom: `${(alt / MAX_ELEVATION) * 100}%` }}
            >
              <span className="text-[10px] font-open-sans text-gray-300 w-12 text-right shrink-0 leading-none">
                {alt / 1000}к м
              </span>
              <div className="flex-1 border-t border-dashed border-gray-100" />
            </div>
          ))}

          <div className="absolute inset-0 flex items-end gap-4 pl-16">
            {myPeaks.map((peak) => {
              const barH = Math.round((peak.elevation / MAX_ELEVATION) * CHART_HEIGHT)
              return (
                <div key={peak.name} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="text-[9px] font-open-sans text-gray-400 mb-0.5 leading-none">
                    {typeLabel(peak.type)}
                  </span>
                  <span className="font-eurostile text-sm mb-1 leading-none">{peak.elevation} м</span>
                  <div className="w-full rounded-t-lg bg-black" style={{ height: barH }} />
                </div>
              )
            })}

            {REFERENCE_PEAKS.map((ref) => {
              const barH = Math.round((ref.elevation / MAX_ELEVATION) * CHART_HEIGHT)
              return (
                <div key={ref.name} className="flex-1 flex flex-col items-center justify-end h-full opacity-[0.12]">
                  <span className="font-eurostile text-sm mb-1 leading-none">{ref.elevation} м</span>
                  <div className="w-full rounded-t-lg bg-black" style={{ height: barH }} />
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-4 pl-16 mt-3">
          {myPeaks.map((peak) => (
            <div key={peak.name} className="flex-1 text-center">
              <p className="font-open-sans font-bold text-xs leading-tight">{peak.name}</p>
              <p className="font-open-sans text-[10px] text-gray-400 mt-0.5">{peak.date}</p>
            </div>
          ))}
          {REFERENCE_PEAKS.map((ref) => (
            <div key={ref.name} className="flex-1 text-center opacity-40">
              <p className="font-open-sans font-bold text-xs leading-tight">{ref.name}</p>
              <p className="font-open-sans text-[10px] text-gray-400 mt-0.5">ориентир</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
