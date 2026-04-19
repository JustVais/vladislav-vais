import { PageLayout } from '@/components/shared/PageLayout'
import { PhotoGrid } from '@/components/features/photos/PhotoGrid'
import { photos } from '@/data/photos'

export default function PhotosLayout() {
  return (
    <PageLayout>
      <PhotoGrid photos={photos} />
    </PageLayout>
  )
}
