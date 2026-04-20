'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/auth'
import { useFinanceStore } from '@/store/finance'
import {
  apiGetScheduled,
  apiCreateScheduled,
  apiUpdateScheduled,
  apiDeleteScheduled,
  apiExecuteScheduled,
} from '@/lib/finance-api'
import type { ScheduledOperationResponse, Category, Direction, RecurrenceRule } from '@/types/finance'
import { formatMoney, formatDate, CATEGORY_LABELS, formatRecurrence, todayISO } from './formatters'
import { RecurrenceBuilder } from './RecurrenceBuilder'
import { useToast } from './ToastContext'

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][]

const schema = z.object({
  accountId: z.string().min(1, 'Выберите счёт'),
  name: z.string().min(1, 'Введите название'),
  category: z.enum(['SALARY', 'DIVIDEND', 'INTEREST', 'LOAN_PAYMENT', 'CARD_PAYMENT', 'LOAN_ISSUED', 'LOAN_RECEIVED', 'TRANSFER', 'OTHER']),
  direction: z.enum(['IN', 'OUT']),
  amount: z.number().positive('Сумма должна быть > 0'),
  startDate: z.string().min(1, 'Введите дату'),
  endDate: z.string().optional(),
  recurrence: z.any(),
})

type FormValues = z.infer<typeof schema>

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h2 className="font-eurostile text-2xl">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors bg-transparent border-none cursor-pointer text-2xl p-0 leading-none">✕</button>
      </div>
      <div className="flex-1 px-6 py-8 max-w-2xl w-full mx-auto">
        {children}
      </div>
    </div>
  )
}

function ScheduledForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: ScheduledOperationResponse
  onSave: () => void
  onCancel: () => void
}) {
  const { token } = useAuthStore()
  const { accounts } = useFinanceStore()
  const { addToast } = useToast()

  const { register, handleSubmit, watch, setValue, control, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          accountId: initial.accountId,
          name: initial.name,
          category: initial.category,
          direction: initial.direction,
          amount: initial.amount,
          startDate: initial.startDate,
          endDate: initial.endDate ?? '',
          recurrence: initial.recurrence,
        }
      : {
          direction: 'OUT',
          category: 'OTHER',
          startDate: todayISO(),
          recurrence: { frequency: 'MONTHLY', interval: 1, dayOfMonth: 1 } as RecurrenceRule,
        },
  })

  const direction = watch('direction') as Direction

  const onSubmit = async (values: FormValues) => {
    if (!token) return
    const payload = {
      ...values,
      endDate: values.endDate || null,
    }
    try {
      const res = initial
        ? await apiUpdateScheduled(token, initial.id, payload)
        : await apiCreateScheduled(token, payload as Parameters<typeof apiCreateScheduled>[1])
      if (res.success) {
        addToast(initial ? 'Операция обновлена' : 'Операция создана', 'success')
        onSave()
      } else {
        setError('root', { message: res.message || res.errors?.[0] || 'Ошибка' })
      }
    } catch {
      addToast('Нет соединения с сервером', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Счёт</label>
          <select {...register('accountId')} className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent">
            <option value="">Выберите счёт</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          {errors.accountId && <p className="text-xs text-red-500 mt-1">{errors.accountId.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Название</label>
          <input {...register('name')} className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Категория</label>
          <select {...register('category')} className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent">
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Сумма</label>
          <input {...register('amount', { valueAsNumber: true })} type="number" step="0.01" min="0" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
          {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-2">Направление</label>
        <div className="flex gap-2">
          {(['IN', 'OUT'] as Direction[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setValue('direction', d)}
              className={`flex-1 py-2 text-sm font-open-sans font-light border transition-colors cursor-pointer
                ${direction === d ? 'bg-black text-white border-black' : 'bg-transparent text-gray-600 border-gray-200 hover:border-black'}`}
            >
              {d === 'IN' ? '↑ Приход' : '↓ Расход'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Дата начала</label>
          <input {...register('startDate')} type="date" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
          {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Дата окончания (необязательно)</label>
          <input {...register('endDate')} type="date" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
        </div>
      </div>

      <div className="border border-gray-100 p-4">
        <p className="text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-3">Правило повторения</p>
        <Controller
          name="recurrence"
          control={control}
          render={({ field }) => (
            <RecurrenceBuilder
              value={field.value as RecurrenceRule ?? { frequency: 'MONTHLY', interval: 1, dayOfMonth: 1 }}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {errors.root && <p className="text-xs text-red-500">{errors.root.message}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="flex-1 bg-black text-white font-open-sans font-light text-sm py-3 cursor-pointer border-none hover:bg-gray-900 transition-colors disabled:opacity-50">
          {isSubmitting ? '...' : initial ? 'Сохранить' : 'Создать'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-transparent text-black font-open-sans font-light text-sm py-3 cursor-pointer border border-gray-200 hover:border-black transition-colors">
          Отмена
        </button>
      </div>
    </form>
  )
}

export function ScheduledPage() {
  const { token } = useAuthStore()
  const { accounts } = useFinanceStore()
  const { addToast } = useToast()

  const [items, setItems] = useState<ScheduledOperationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ScheduledOperationResponse | null>(null)
  const [deleting, setDeleting] = useState<ScheduledOperationResponse | null>(null)
  const [executing, setExecuting] = useState<string | null>(null)

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await apiGetScheduled(token)
      if (res.success && res.data) setItems(res.data)
    } catch {
      addToast('Нет соединения с сервером', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!token || !deleting) return
    try {
      const res = await apiDeleteScheduled(token, deleting.id)
      if (res.success) {
        addToast('Операция архивирована', 'success')
        setDeleting(null)
        load()
      } else {
        addToast(res.message || 'Ошибка', 'error')
      }
    } catch {
      addToast('Нет соединения с сервером', 'error')
    }
  }

  const handleExecute = async (id: string) => {
    if (!token) return
    setExecuting(id)
    try {
      const res = await apiExecuteScheduled(token, id)
      if (res.success) {
        addToast('Операция выполнена', 'success')
        load()
      } else {
        addToast(res.message || 'Ошибка', 'error')
      }
    } catch {
      addToast('Нет соединения с сервером', 'error')
    } finally {
      setExecuting(null)
    }
  }

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-eurostile text-3xl">Плановые операции</h1>
        <button onClick={() => setShowForm(true)} className="text-sm font-open-sans font-light text-white bg-black px-4 py-2 border-none cursor-pointer hover:bg-gray-900 transition-colors">
          + Добавить
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-48" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-gray-100">
          <p className="text-sm font-open-sans font-light text-gray-400 mb-4">Добавьте первую плановую операцию</p>
          <button onClick={() => setShowForm(true)} className="text-sm font-open-sans font-light text-black border border-black px-4 py-2 bg-transparent cursor-pointer hover:bg-black hover:text-white transition-colors">
            Создать операцию
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((op) => {
            const isOverdue = op.nextOccurrence < today
            return (
              <div key={op.id} className="p-4 border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-base leading-none ${op.direction === 'IN' ? 'text-green-500' : 'text-red-500'}`}>
                        {op.direction === 'IN' ? '↑' : '↓'}
                      </span>
                      <p className="text-sm font-open-sans font-medium text-gray-800">{op.name}</p>
                    </div>
                    <p className="text-xs font-open-sans font-light text-gray-400 mb-1">
                      {accountName(op.accountId)} · {CATEGORY_LABELS[op.category]} · {formatRecurrence(op.recurrence)}
                    </p>
                    <p className={`text-xs font-open-sans font-light ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                      Следующее: {formatDate(op.nextOccurrence)} {isOverdue && '⚠ просрочено'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`text-sm font-open-sans ${op.direction === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                      {op.direction === 'IN' ? '+' : '−'}{formatMoney(op.amount)}
                    </span>
                    <div className="flex flex-col gap-1 items-end">
                      <button
                        onClick={() => handleExecute(op.id)}
                        disabled={executing === op.id}
                        className="text-xs font-open-sans font-light text-gray-500 hover:text-black border border-gray-200 hover:border-black px-2 py-1 transition-colors disabled:opacity-40 bg-transparent cursor-pointer"
                      >
                        {executing === op.id ? '...' : 'Исполнить'}
                      </button>
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(op)} className="text-xs font-open-sans font-light text-gray-400 hover:text-black transition-colors bg-transparent border-none cursor-pointer p-0">Изм.</button>
                        <button onClick={() => setDeleting(op)} className="text-xs font-open-sans font-light text-gray-400 hover:text-red-600 transition-colors bg-transparent border-none cursor-pointer p-0">Архив</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <Modal title="Новая операция" onClose={() => setShowForm(false)}>
          <ScheduledForm onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Редактировать операцию" onClose={() => setEditing(null)}>
          <ScheduledForm initial={editing} onSave={() => { setEditing(null); load() }} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {deleting && (
        <Modal title="Архивировать операцию?" onClose={() => setDeleting(null)}>
          <p className="text-sm font-open-sans font-light text-gray-600 mb-6">«{deleting.name}» будет архивирована.</p>
          <div className="flex gap-3">
            <button onClick={handleDelete} className="flex-1 bg-black text-white font-open-sans font-light text-sm py-3 cursor-pointer border-none hover:bg-gray-900 transition-colors">
              Архивировать
            </button>
            <button onClick={() => setDeleting(null)} className="flex-1 bg-transparent text-black font-open-sans font-light text-sm py-3 cursor-pointer border border-gray-200 hover:border-black transition-colors">
              Отмена
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
