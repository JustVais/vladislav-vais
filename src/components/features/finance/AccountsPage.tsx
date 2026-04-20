'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/auth'
import { useFinanceStore } from '@/store/finance'
import { apiCreateAccount, apiUpdateAccount, apiDeleteAccount } from '@/lib/finance-api'
import type { AccountResponse, AccountType } from '@/types/finance'
import { formatMoney, ACCOUNT_TYPE_LABELS } from './formatters'
import { useToast } from './ToastContext'

const schema = z.object({
  name: z.string().min(1, 'Введите название'),
  type: z.enum(['CASH', 'DEBIT', 'CREDIT_CARD', 'CREDIT_LOAN']),
  currency: z.string().min(3, 'Введите валюту'),
  balance: z.number(),
  creditLimit: z.number().nullable().optional(),
  interestRate: z.number().nullable().optional(),
  minPayment: z.number().nullable().optional(),
})

type FormValues = z.infer<typeof schema>

function AccountForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: AccountResponse
  onSave: () => void
  onCancel: () => void
}) {
  const { token } = useAuthStore()
  const { addToast } = useToast()
  const invalidateAccounts = useFinanceStore((s) => s.invalidateAccounts)
  const loadAccounts = useFinanceStore((s) => s.loadAccounts)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          name: initial.name,
          type: initial.type,
          currency: initial.currency,
          balance: initial.balance,
          creditLimit: initial.creditLimit,
          interestRate: initial.interestRate,
          minPayment: initial.minPayment,
        }
      : { type: 'DEBIT', currency: 'RUB', balance: 0 },
  })

  const type = watch('type') as AccountType

  const onSubmit = async (values: FormValues) => {
    if (!token) return
    const payload = {
      ...values,
      creditLimit: type === 'CREDIT_CARD' ? (values.creditLimit ?? null) : null,
      interestRate: type === 'CREDIT_CARD' || type === 'CREDIT_LOAN' ? (values.interestRate ?? null) : null,
      minPayment: type === 'CREDIT_CARD' ? (values.minPayment ?? null) : null,
    }
    try {
      const res = initial
        ? await apiUpdateAccount(token, initial.id, payload)
        : await apiCreateAccount(token, payload)
      if (res.success) {
        addToast(initial ? 'Счёт обновлён' : 'Счёт создан', 'success')
        invalidateAccounts()
        loadAccounts(token)
        onSave()
      } else {
        const msg = res.message || res.errors?.[0] || 'Ошибка'
        setError('root', { message: msg })
      }
    } catch {
      addToast('Нет соединения с сервером', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Название</label>
        <input {...register('name')} className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Тип</label>
        <select {...register('type')} className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent">
          {(Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Валюта</label>
          <select {...register('currency')} className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent">
            <option value="RUB">RUB</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">
            Баланс {(type === 'CREDIT_CARD' || type === 'CREDIT_LOAN') && <span className="text-gray-300">(отрицательный = долг)</span>}
          </label>
          <input
            {...register('balance', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent"
          />
          {errors.balance && <p className="text-xs text-red-500 mt-1">{errors.balance.message}</p>}
        </div>
      </div>

      {type === 'CREDIT_CARD' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Кредитный лимит</label>
            <input {...register('creditLimit', { valueAsNumber: true })} type="number" step="0.01" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
          </div>
          <div>
            <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Мин. платёж</label>
            <input {...register('minPayment', { valueAsNumber: true })} type="number" step="0.01" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
          </div>
        </div>
      )}

      {(type === 'CREDIT_CARD' || type === 'CREDIT_LOAN') && (
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Процентная ставка (% годовых)</label>
          <input {...register('interestRate', { valueAsNumber: true })} type="number" step="0.1" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
        </div>
      )}

      {errors.root && <p className="text-xs text-red-500">{errors.root.message}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="flex-1 bg-black text-white font-open-sans font-light text-sm py-3 cursor-pointer border-none hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? '...' : initial ? 'Сохранить' : 'Создать'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-transparent text-black font-open-sans font-light text-sm py-3 cursor-pointer border border-gray-200 hover:border-black transition-colors">
          Отмена
        </button>
      </div>
    </form>
  )
}

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

export function AccountsPage() {
  const { token } = useAuthStore()
  const { accounts, isAccountsLoaded, invalidateAccounts, loadAccounts } = useFinanceStore()
  const { addToast } = useToast()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<AccountResponse | null>(null)
  const [deleting, setDeleting] = useState<AccountResponse | null>(null)
  const [deletingInProgress, setDeletingInProgress] = useState(false)

  useEffect(() => {
    if (token && !isAccountsLoaded) loadAccounts(token)
  }, [token, isAccountsLoaded, loadAccounts])

  const handleDelete = async () => {
    if (!token || !deleting) return
    setDeletingInProgress(true)
    try {
      const res = await apiDeleteAccount(token, deleting.id)
      if (res.success) {
        addToast('Счёт архивирован', 'success')
        invalidateAccounts()
        loadAccounts(token)
        setDeleting(null)
      } else {
        addToast(res.message || 'Ошибка', 'error')
      }
    } catch {
      addToast('Нет соединения с сервером', 'error')
    } finally {
      setDeletingInProgress(false)
    }
  }

  return (
    <div className="bg-white p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-eurostile text-3xl">Счета</h1>
        <button
          onClick={() => setShowForm(true)}
          className="text-sm font-open-sans font-light text-white bg-black px-4 py-2 border-none cursor-pointer hover:bg-gray-900 transition-colors"
        >
          + Добавить
        </button>
      </div>

      {!isAccountsLoaded ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-100 rounded mb-3 w-24" />
              <div className="h-8 bg-gray-100 rounded mb-2 w-32" />
              <div className="h-3 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-16 border border-gray-100">
          <p className="text-sm font-open-sans font-light text-gray-400 mb-4">Добавьте первый счёт</p>
          <button onClick={() => setShowForm(true)} className="text-sm font-open-sans font-light text-black border border-black px-4 py-2 bg-transparent cursor-pointer hover:bg-black hover:text-white transition-colors">
            Создать счёт
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="p-5 border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-open-sans font-medium text-gray-800 text-sm">{acc.name}</p>
                  <span className="text-xs font-open-sans font-light text-gray-400 px-2 py-0.5 border border-gray-100 inline-block mt-1">
                    {ACCOUNT_TYPE_LABELS[acc.type]}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(acc)} className="text-xs font-open-sans font-light text-gray-400 hover:text-black transition-colors bg-transparent border-none cursor-pointer p-0">Изм.</button>
                  <button onClick={() => setDeleting(acc)} className="text-xs font-open-sans font-light text-gray-400 hover:text-red-600 transition-colors bg-transparent border-none cursor-pointer p-0">Архив</button>
                </div>
              </div>
              <p className={`font-eurostile text-2xl leading-none ${acc.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatMoney(acc.balance, acc.currency)}
              </p>
              <div className="mt-3 space-y-1">
                {acc.creditLimit != null && (
                  <p className="text-xs font-open-sans font-light text-gray-400">Лимит: {formatMoney(acc.creditLimit, acc.currency)}</p>
                )}
                {acc.interestRate != null && (
                  <p className="text-xs font-open-sans font-light text-gray-400">Ставка: {acc.interestRate}% годовых</p>
                )}
                {acc.minPayment != null && (
                  <p className="text-xs font-open-sans font-light text-gray-400">Мин. платёж: {formatMoney(acc.minPayment, acc.currency)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="Новый счёт" onClose={() => setShowForm(false)}>
          <AccountForm onSave={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Редактировать счёт" onClose={() => setEditing(null)}>
          <AccountForm initial={editing} onSave={() => setEditing(null)} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {deleting && (
        <Modal title="Архивировать счёт?" onClose={() => setDeleting(null)}>
          <p className="text-sm font-open-sans font-light text-gray-600 mb-6">
            Счёт «{deleting.name}» будет архивирован и скрыт из списка.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={deletingInProgress}
              className="flex-1 bg-black text-white font-open-sans font-light text-sm py-3 cursor-pointer border-none hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {deletingInProgress ? '...' : 'Архивировать'}
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
