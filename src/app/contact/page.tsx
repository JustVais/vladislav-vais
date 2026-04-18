import type { Metadata } from 'next'
import { PageLayout } from '@/components/shared/PageLayout'

export const metadata: Metadata = {
  title: 'Vladislav Vikul | Contact',
}

const contacts = [
  { logo: '/images/github.svg', link: 'https://github.com/JustVikul', alt: 'GitHub' },
  { logo: '/images/telegram.svg', link: 'https://t.me/JustVikul', alt: 'Telegram' },
]

export default function ContactPage() {
  return (
    <PageLayout>
      <div className="grid self-center justify-self-center grid-cols-[repeat(2,max-content)] gap-x-10">
        {contacts.map((item) => (
          <a
            key={item.link}
            href={item.link}
            target="_blank"
            rel="noreferrer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.logo}
              alt={item.alt}
              width={150}
              height={150}
              className="rounded-full cursor-pointer"
            />
          </a>
        ))}
      </div>
    </PageLayout>
  )
}
