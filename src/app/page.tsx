import type { Metadata } from 'next'
import { PageLayout } from '@/components/shared/PageLayout'

export const metadata: Metadata = {
  title: 'Vladislav Vikul',
}

export default function HomePage() {
  return (
    <PageLayout>
      <div className="h-full grid content-center">
        <div className="grid justify-items-center gap-y-2.5">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] m-0 font-eurostile leading-[1.125]">Vladislav Vikul</h1>
          <span className="text-base sm:text-lg md:text-xl m-0 font-open-sans font-light leading-relaxed">
            Full Stack Web Developer
          </span>
        </div>
      </div>
    </PageLayout>
  )
}
