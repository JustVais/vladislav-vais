'use client'

import dynamic from 'next/dynamic'

const WorldMap = dynamic(
  () => import('./WorldMap').then((m) => m.WorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[2/1] bg-white rounded-2xl shimmer" />
    ),
  }
)

export function WorldMapClient() {
  return <WorldMap />
}
