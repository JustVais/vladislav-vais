import type { Metadata } from 'next'
import { readdir } from 'fs/promises'
import path from 'path'
import { PageLayout } from '@/components/shared/PageLayout'
import { PhotoGrid } from '@/components/features/photos/PhotoGrid'
import { photosMeta } from '@/data/photos'

export const metadata: Metadata = {
  title: 'Vladislav Vikul | Photos',
}

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|svg)$/i

export default async function PhotosPage() {
  const dir = path.join(process.cwd(), 'public/photos')
  const files = await readdir(dir)
  const photos = files
    .filter((f) => IMAGE_EXT.test(f))
    .sort()
    .map((filename) => ({ filename, meta: photosMeta[filename] }))

  return (
    <PageLayout>
      <PhotoGrid photos={photos} />
    </PageLayout>
  )
}
