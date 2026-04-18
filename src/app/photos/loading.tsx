import { PageLayout } from '@/components/shared/PageLayout'

export default function PhotosLoading() {
  return (
    <PageLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square shimmer" />
        ))}
      </div>
    </PageLayout>
  )
}
