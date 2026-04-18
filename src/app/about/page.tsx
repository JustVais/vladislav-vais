'use client'

import { useTranslation } from 'react-i18next'
import { PageLayout } from '@/components/shared/PageLayout'

const LANGUAGES = ['Java', 'JavaScript', 'TypeScript']

const STACK = [
  { category: 'Frontend', items: ['React', 'Next.js', 'Redux', 'Redux-Saga', 'Svelte', 'Webpack'] },
  { category: 'Backend',  items: ['Java', 'NestJS'] },
  { category: 'Storage',  items: ['PostgreSQL', 'MySQL', 'MongoDB'] },
  { category: 'Tools',    items: ['Git', 'Docker', 'gRPC', 'Apollo GraphQL', 'WebSocket', 'Ubuntu / Debian'] },
]

const FAMILIAR = ['React Native', 'Vue', 'MobX', 'RxJS', 'Java Spring', 'urql', 'HTML / CSS', 'PHP', 'C#', 'Python']

const EXPERIENCE = [
  { company: 'Брусника',   period: 'Apr 2023 — по настоящее время' },
  { company: 'Admitad Projects', period: 'Jan 2022 — Mar 2023' },
  { company: 'Cheap-lead', period: 'Aug 2021 — Dec 2021' },
  { company: 'Freelance',  period: '2019 — 2021' },
]

function Tag({ label, filled = false }: { label: string; filled?: boolean }) {
  return (
    <span className={`inline-block px-3 py-1 text-sm rounded-full border transition-colors duration-200 cursor-default
      ${filled
        ? 'bg-black text-white border-black hover:bg-gray-800'
        : 'bg-transparent text-gray-500 border-gray-300 hover:border-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-open-sans font-bold tracking-[0.2em] uppercase text-gray-400 mb-6">
      {children}
    </p>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white px-4 py-5 sm:px-6 sm:py-6 md:px-8 rounded-2xl">
      {children}
    </div>
  )
}

export default function AboutPage() {
  const { t } = useTranslation('about')

  return (
    <PageLayout>
      <div className="w-full py-4 flex flex-col gap-3">

        <Card>
          <h1 className="text-4xl font-eurostile mb-3">{t('about_me')}</h1>
          <p className="text-gray-500 font-open-sans leading-relaxed">
            Full Stack Developer с опытом в построении веб-приложений от интерфейса до инфраструктуры.
          </p>
        </Card>

        <Card>
          <SectionLabel>{t('prog_lang')}</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => <Tag key={lang} label={lang} filled />)}
          </div>
        </Card>

        <Card>
          <SectionLabel>{t('use')}</SectionLabel>
          <div className="flex flex-col gap-5">
            {STACK.map(({ category, items }) => (
              <div key={category} className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-start gap-2 sm:gap-4">
                <span className="text-xs font-open-sans text-gray-400 pt-1.5">{category}</span>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => <Tag key={item} label={item} filled />)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionLabel>{t('familiar')}</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {FAMILIAR.map((item) => <Tag key={item} label={item} />)}
          </div>
        </Card>

        <Card>
          <SectionLabel>{t('experience')}</SectionLabel>
          <div className="flex flex-col">
            {EXPERIENCE.map((job, i) => (
              <div key={job.company} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-black mt-1.5 shrink-0" />
                  {i < EXPERIENCE.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                </div>
                <div className="pb-6">
                  <p className="font-open-sans font-bold text-base leading-none">{job.company}</p>
                  <p className="text-sm text-gray-400 font-open-sans mt-1">{job.period}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </PageLayout>
  )
}
