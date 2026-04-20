'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiLogin } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

const schema = z.object({
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: Props) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const overlayRef = useRef<HTMLDivElement>(null)
  const mouseDownOnOverlay = useRef(false)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) reset()
  }, [open, reset])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await apiLogin(values.email, values.password)
      if (res.success && res.data) {
        setAuth(res.data.token, res.data.user, res.data.expiresIn)
        onClose()
      } else {
        const msg = res.message || res.errors?.[0] || 'Неверный логин или пароль'
        setError('root', { message: msg })
      }
    } catch {
      setError('root', { message: 'Ошибка сети. Попробуйте позже.' })
    }
  }

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onMouseDown={(e) => { mouseDownOnOverlay.current = e.target === overlayRef.current }}
      onMouseUp={(e) => { if (mouseDownOnOverlay.current && e.target === overlayRef.current) onClose() }}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* panel */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-white shadow-2xl">
        <div className="p-8">
          <div className="flex items-start justify-between mb-8">
            <h2 className="text-2xl font-eurostile leading-none m-0">Вход</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-black transition-colors bg-transparent border-none cursor-pointer p-0 leading-none text-xl"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-y-5">
            <div className="grid gap-y-1.5">
              <label className="text-xs font-open-sans font-light uppercase tracking-[0.15em] text-gray-500">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                autoFocus
                className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent"
              />
              {errors.email && (
                <span className="text-xs font-open-sans text-red-500">{errors.email.message}</span>
              )}
            </div>

            <div className="grid gap-y-1.5">
              <label className="text-xs font-open-sans font-light uppercase tracking-[0.15em] text-gray-500">
                Пароль
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent"
              />
              {errors.password && (
                <span className="text-xs font-open-sans text-red-500">{errors.password.message}</span>
              )}
            </div>

            {errors.root && (
              <p className="text-xs font-open-sans text-red-500 m-0">{errors.root.message}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full bg-black text-white font-open-sans font-light text-sm py-3 px-6 cursor-pointer border-none
                         hover:bg-gray-900 active:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
