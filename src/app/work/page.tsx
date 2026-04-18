'use client'

import { useTranslation } from 'react-i18next'
import { PageLayout } from '@/components/shared/PageLayout'
import { WorkList } from '@/components/features/works'

interface Work {
  title: string
  capture: string
}

export default function WorkPage() {
  const { t } = useTranslation('work')
  const works = t('works', { returnObjects: true }) as Work[]

  return (
    <PageLayout>
      <div className="flex flex-col gap-6 md:gap-10">
        <h1 className="font-eurostile text-3xl sm:text-4xl md:text-5xl m-0">
          {t('title')}
        </h1>

        <WorkList works={works} />

        <p className="text-center font-eurostile text-base md:text-xl text-gray-400 m-0">
          {t('much_more')}
        </p>
      </div>
    </PageLayout>
  )
}
