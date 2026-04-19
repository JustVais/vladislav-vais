'use client'

import dynamic from 'next/dynamic'

const MountainMap = dynamic(
  () => import('./MountainMap').then((m) => m.MountainMap),
  {
    ssr: false,
    loading: () => <div className="w-full aspect-[2/1] bg-white rounded-2xl shimmer" />,
  }
)

export function MountainMapClient() {
  return <MountainMap />
}
