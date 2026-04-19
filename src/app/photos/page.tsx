import type { Metadata } from 'next'
import { PageLayout } from '@/components/shared/PageLayout'
import { PhotoGrid } from '@/components/features/photos/PhotoGrid'
import { photos } from '@/data/photos'

export const metadata: Metadata = {
  title: 'Vladislav Vikul | Photos',
}

export default function PhotosPage() {
  return (
    <PageLayout>
      <PhotoGrid photos={photos} />
    </PageLayout>
  )
}
