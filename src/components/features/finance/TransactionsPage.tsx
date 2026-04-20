'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/auth'
import { useFinanceStore } from '@/store/finance'
import { apiGetTransactions, apiCreateTransaction, apiDeleteTransaction } from '@/lib/finance-api'
import type { TransactionResponse, Category, Direction } from '@/types/finance'
import { formatMoney, formatDate, CATEGORY_LABELS, todayISO, startOfMonthISO } from './formatters'
import { useToast } from './ToastContext'

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][]

const schema = z.object({
  accountId: z.string().min(1, 'Выберите счёт'),
  direction: z.enum(['IN', 'OUT']),
  amount: z.number().positive('Сумма должна быть больше 0'),
  category: z.enum(['SALARY', 'DIVIDEND', 'INTEREST', 'LOAN_PAYMENT', 'CARD_PAYMENT', 'LOAN_ISSUED', 'LOAN_RECEIVED', 'TRANSFER', 'OTHER']),
  date: z.string().min(1, 'Введите дату'),
  description: z.string().optional(),
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

function TransactionForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const { token } = useAuthStore()
  const { accounts } = useFinanceStore()
  const { addToast } = useToast()

  const { register, handleSubmit, watch, setValue, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { direction: 'OUT', date: todayISO(), category: 'OTHER' },
  })

  const direction = watch('direction') as Direction

  const onSubmit = async (values: FormValues) => {
    if (!token) return
    try {
      const res = await apiCreateTransaction(token, values as Parameters<typeof apiCreateTransaction>[1])
      if (res.success) {
        addToast('Транзакция добавлена', 'success')
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
      <div>
        <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Счёт</label>
        <select {...register('accountId')} className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent">
          <option value="">Выберите счёт</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        {errors.accountId && <p className="text-xs text-red-500 mt-1">{errors.accountId.message}</p>}
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
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Сумма</label>
          <input {...register('amount', { valueAsNumber: true })} type="number" step="0.01" min="0" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
          {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Дата</label>
          <input {...register('date')} type="date" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
          {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Категория</label>
        <select {...register('category')} className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent">
          {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Описание (необязательно)</label>
        <textarea {...register('description')} rows={2} className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent resize-none" />
      </div>

      {errors.root && <p className="text-xs text-red-500">{errors.root.message}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="flex-1 bg-black text-white font-open-sans font-light text-sm py-3 cursor-pointer border-none hover:bg-gray-900 transition-colors disabled:opacity-50">
          {isSubmitting ? '...' : 'Добавить'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-transparent text-black font-open-sans font-light text-sm py-3 cursor-pointer border border-gray-200 hover:border-black transition-colors">
          Отмена
        </button>
      </div>
    </form>
  )
}

export function TransactionsPage() {
  const { token } = useAuthStore()
  const { accounts } = useFinanceStore()
  const { addToast } = useToast()

  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<TransactionResponse | null>(null)
  const [deletingInProgress, setDeletingInProgress] = useState(false)

  const [filterAccountId, setFilterAccountId] = useState('')
  const [filterCategory, setFilterCategory] = useState<Category | ''>('')
  const [filterFrom, setFilterFrom] = useState(startOfMonthISO())
  const [filterTo, setFilterTo] = useState(todayISO())

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await apiGetTransactions(token, {
        accountId: filterAccountId || undefined,
        category: (filterCategory || undefined) as Category | undefined,
        from: filterFrom,
        to: filterTo,
      })
      if (res.success && res.data) setTransactions(res.data)
    } catch {
      addToast('Нет соединения с сервером', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!token || !deleting) return
    setDeletingInProgress(true)
    try {
      const res = await apiDeleteTransaction(token, deleting.id)
      if (res.success) {
        addToast('Транзакция удалена', 'success')
        setDeleting(null)
        load()
      } else {
        addToast(res.message || 'Ошибка', 'error')
      }
    } catch {
      addToast('Нет соединения с сервером', 'error')
    } finally {
      setDeletingInProgress(false)
    }
  }

  const grouped = transactions.reduce<Record<string, TransactionResponse[]>>((acc, t) => {
    ;(acc[t.date] ??= []).push(t)
    return acc
  }, {})

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id

  return (
    <div className="bg-white p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-eurostile text-3xl">Транзакции</h1>
        <button
          onClick={() => setShowForm(true)}
          className="text-sm font-open-sans font-light text-white bg-black px-4 py-2 border-none cursor-pointer hover:bg-gray-900 transition-colors"
        >
          + Добавить
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 border border-gray-100">
        <select
          value={filterAccountId}
          onChange={(e) => setFilterAccountId(e.target.value)}
          className="border-b border-gray-200 pb-1 font-open-sans text-xs font-light outline-none focus:border-black transition-colors bg-transparent"
        >
          <option value="">Все счета</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as Category | '')}
          className="border-b border-gray-200 pb-1 font-open-sans text-xs font-light outline-none focus:border-black transition-colors bg-transparent"
        >
          <option value="">Все категории</option>
          {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="border-b border-gray-200 pb-1 font-open-sans text-xs font-light outline-none focus:border-black transition-colors bg-transparent" />
        <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="border-b border-gray-200 pb-1 font-open-sans text-xs font-light outline-none focus:border-black transition-colors bg-transparent" />
        <button
          onClick={load}
          className="text-xs font-open-sans font-light text-white bg-black px-3 py-1 border-none cursor-pointer hover:bg-gray-900 transition-colors"
        >
          Применить
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 py-3 border-b border-gray-50">
              <div className="h-4 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-sm font-open-sans font-light text-gray-400 py-8 text-center">Операций не найдено</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, txns]) => (
            <div key={date}>
              <p className="text-xs font-open-sans font-light text-gray-400 uppercase tracking-[0.12em] mb-2">{formatDate(date)}</p>
              <div className="space-y-0 border border-gray-100">
                {txns.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-4 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-lg leading-none ${t.direction === 'IN' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.direction === 'IN' ? '↑' : '↓'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-open-sans font-light text-gray-800">
                          {CATEGORY_LABELS[t.category]}
                          {t.scheduledOperationId && (
                            <span className="ml-2 text-xs text-gray-400 border border-gray-200 px-1">Плановая</span>
                          )}
                        </p>
                        {t.description && <p className="text-xs font-open-sans font-light text-gray-400 truncate">{t.description}</p>}
                        <p className="text-xs font-open-sans font-light text-gray-300">{accountName(t.accountId)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-sm font-open-sans ${t.direction === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.direction === 'IN' ? '+' : '−'}{formatMoney(t.amount)}
                      </span>
                      <button onClick={() => setDeleting(t)} className="text-xs font-open-sans font-light text-gray-300 hover:text-red-600 transition-colors bg-transparent border-none cursor-pointer p-0">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="Новая транзакция" onClose={() => setShowForm(false)}>
          <TransactionForm onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {deleting && (
        <Modal title="Удалить транзакцию?" onClose={() => setDeleting(null)}>
          <p className="text-sm font-open-sans font-light text-gray-600 mb-6">
            Транзакция будет удалена, баланс счёта откатится.
          </p>
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={deletingInProgress} className="flex-1 bg-black text-white font-open-sans font-light text-sm py-3 cursor-pointer border-none hover:bg-gray-900 transition-colors disabled:opacity-50">
              {deletingInProgress ? '...' : 'Удалить'}
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
