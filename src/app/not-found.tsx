import Link from 'next/link'
import { PageLayout } from '@/components/shared/PageLayout'

export default function NotFound() {
  return (
    <PageLayout>
      <div className="h-full grid content-center">
        <div className="grid justify-items-center gap-y-4">
          <h1 className="text-6xl sm:text-8xl m-0 font-eurostile leading-none">404</h1>
          <p className="text-base sm:text-lg m-0 font-open-sans font-light text-gray-500">
            Страница не найдена
          </p>
          <Link
            href="/"
            className="mt-2 text-sm font-open-sans font-light text-black underline underline-offset-4"
          >
            На главную
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
