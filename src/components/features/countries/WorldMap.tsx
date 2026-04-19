'use client'

import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import { visited } from '@/data/countries'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const visitedIds = new Set(visited.map((c) => c.isoNumeric))
const allCities = visited.flatMap((c) => c.cities)

const MIN_ZOOM = 1
const MAX_ZOOM = 8

export function WorldMap() {
  const [tooltip, setTooltip] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<[number, number]>([30, 20])

  const handleZoomIn = () => setZoom((z) => Math.min(z * 2, MAX_ZOOM))
  const handleZoomOut = () => setZoom((z) => Math.max(z / 2, MIN_ZOOM))
  const handleReset = () => { setZoom(1); setCenter([30, 20]) }

  return (
    <div className="relative w-full bg-white rounded-2xl overflow-hidden select-none">
      <ComposableMap
        projectionConfig={{ scale: 147, center: [30, 20] }}
        style={{ width: '100%', height: 'auto' }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={({ zoom: z, coordinates }: { zoom: number; coordinates: [number, number] }) => {
            setZoom(z)
            setCenter(coordinates)
          }}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: { rsmKey: string; id: string }[] }) =>
              geographies.map((geo) => {
                const isVisited = visitedIds.has(Number(geo.id))
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: isVisited ? '#111' : '#e5e7eb',
                        stroke: '#fff',
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                      hover: {
                        fill: isVisited ? '#333' : '#d1d5db',
                        outline: 'none',
                      },
                      pressed: { outline: 'none' },
                    }}
                  />
                )
              })
            }
          </Geographies>

          {allCities.map((city) => (
            <Marker
              key={city.name}
              coordinates={city.coordinates}
              onMouseEnter={() => setTooltip(city.name)}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => setTooltip((t) => t === city.name ? null : city.name)}
            >
              <circle r={4 / zoom} fill="#fff" stroke="#111" strokeWidth={1.5 / zoom} className="cursor-pointer" />
              {zoom >= 2 && (
                <text
                  textAnchor="middle"
                  y={-8 / zoom}
                  style={{
                    fontFamily: 'var(--font-open-sans)',
                    fontSize: 8 / zoom,
                    fill: '#fff',
                    stroke: '#111',
                    strokeWidth: 0.3 / zoom,
                    paintOrder: 'stroke',
                    pointerEvents: 'none',
                  }}
                >
                  {city.name}
                </text>
              )}
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="w-9 h-9 bg-white border border-gray-200 rounded-lg text-black font-eurostile text-lg leading-none flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm cursor-pointer"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="w-9 h-9 bg-white border border-gray-200 rounded-lg text-black font-eurostile text-lg leading-none flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm cursor-pointer"
        >
          −
        </button>
        {zoom > 1 && (
          <button
            onClick={handleReset}
            className="w-9 h-9 bg-white border border-gray-200 rounded-lg text-gray-400 text-xs flex items-center justify-center hover:bg-gray-50 shadow-sm cursor-pointer"
            title="Сбросить"
          >
            ↺
          </button>
        )}
      </div>

      {tooltip && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-open-sans px-3 py-1.5 rounded-full pointer-events-none whitespace-nowrap">
          {tooltip}
        </div>
      )}
    </div>
  )
}
