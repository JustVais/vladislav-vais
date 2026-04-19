import type { Metadata } from 'next'
import { photos } from '@/data/photos'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return photos.map((p) => ({ id: p.publicId }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const photo = photos.find((p) => p.publicId === id)
  if (!photo) return { title: 'Vladislav Vikul | Photos' }

  const ogImage = `https://res.cloudinary.com/duoo4ajch/image/upload/w_1200,h_630,c_fill,q_80,f_jpg/${photo.publicId}`
  const title = photo.meta.description
    ? `${photo.meta.description} · ${photo.meta.place || photo.meta.date}`
    : photo.meta.place || photo.meta.date || 'Photo'

  return {
    title: `${title} | Vladislav Vikul`,
    openGraph: {
      title: `${title} | Vladislav Vikul`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
  }
}

export default function PhotoPage() {
  return null
}
