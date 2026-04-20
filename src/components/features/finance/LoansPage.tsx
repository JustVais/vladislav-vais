'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/auth'
import { apiGetIssuedLoans, apiCreateIssuedLoan, apiPayLoanPayment } from '@/lib/finance-api'
import type { IssuedLoanResponse, LoanPayment, RecurrenceRule } from '@/types/finance'
import { formatMoney, formatDate, LOAN_STATUS_LABELS, PAYMENT_STATUS_LABELS, todayISO } from './formatters'
import { RecurrenceBuilder } from './RecurrenceBuilder'
import { useToast } from './ToastContext'

const STATUS_COLORS = {
  ACTIVE: 'text-blue-600 border-blue-200',
  PAID: 'text-green-600 border-green-200',
  OVERDUE: 'text-red-600 border-red-200',
}

const PAYMENT_COLORS = {
  PENDING: 'text-gray-500',
  PAID: 'text-green-600',
  OVERDUE: 'text-red-600',
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

const loanSchema = z.object({
  debtorName: z.string().min(1, 'Введите имя'),
  principal: z.number().positive(),
  interestRate: z.number().min(0),
  currency: z.string().min(3),
  issueDate: z.string().min(1),
  dueDate: z.string().min(1),
  notes: z.string().optional(),
  hasSchedule: z.boolean(),
  paymentAmount: z.number().positive().optional(),
  paymentRecurrence: z.any().optional(),
})

type LoanFormValues = z.infer<typeof loanSchema>

function LoanForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const { token } = useAuthStore()
  const { addToast } = useToast()

  const { register, handleSubmit, watch, setValue, control, setError, formState: { errors, isSubmitting } } = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      currency: 'RUB',
      interestRate: 0,
      issueDate: todayISO(),
      hasSchedule: false,
      paymentRecurrence: { frequency: 'MONTHLY', interval: 1, dayOfMonth: 1 } as RecurrenceRule,
    },
  })

  const hasSchedule = watch('hasSchedule')

  const onSubmit = async (values: LoanFormValues) => {
    if (!token) return
    const payload: Parameters<typeof apiCreateIssuedLoan>[1] = {
      debtorName: values.debtorName,
      principal: values.principal,
      interestRate: values.interestRate,
      currency: values.currency,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      notes: values.notes,
      ...(values.hasSchedule && values.paymentAmount && {
        paymentRecurrence: values.paymentRecurrence as RecurrenceRule,
        paymentAmount: values.paymentAmount,
      }),
    }
    try {
      const res = await apiCreateIssuedLoan(token, payload)
      if (res.success) {
        addToast('Займ создан', 'success')
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
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Должник</label>
          <input {...register('debtorName')} className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
          {errors.debtorName && <p className="text-xs text-red-500 mt-1">{errors.debtorName.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Валюта</label>
          <select {...register('currency')} className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent">
            <option value="RUB">RUB</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Сумма</label>
          <input {...register('principal', { valueAsNumber: true })} type="number" step="0.01" min="0" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
          {errors.principal && <p className="text-xs text-red-500 mt-1">{errors.principal.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">% годовых (0 = беспроцентный)</label>
          <input {...register('interestRate', { valueAsNumber: true })} type="number" step="0.1" min="0" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Дата выдачи</label>
          <input {...register('issueDate')} type="date" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
        </div>
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Дата погашения</label>
          <input {...register('dueDate')} type="date" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Заметки</label>
        <textarea {...register('notes')} rows={2} className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent resize-none" />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={hasSchedule}
          onChange={(e) => setValue('hasSchedule', e.target.checked)}
          className="cursor-pointer"
        />
        <span className="text-sm font-open-sans font-light text-gray-600">Настроить график платежей</span>
      </label>

      {hasSchedule && (
        <div className="border border-gray-100 p-4 space-y-4">
          <div>
            <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Сумма платежа</label>
            <input {...register('paymentAmount', { valueAsNumber: true })} type="number" step="0.01" min="0" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
          </div>
          <Controller
            name="paymentRecurrence"
            control={control}
            render={({ field }) => (
              <RecurrenceBuilder
                value={field.value as RecurrenceRule ?? { frequency: 'MONTHLY', interval: 1, dayOfMonth: 1 }}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      )}

      {errors.root && <p className="text-xs text-red-500">{errors.root.message}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="flex-1 bg-black text-white font-open-sans font-light text-sm py-3 cursor-pointer border-none hover:bg-gray-900 transition-colors disabled:opacity-50">
          {isSubmitting ? '...' : 'Создать'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-transparent text-black font-open-sans font-light text-sm py-3 cursor-pointer border border-gray-200 hover:border-black transition-colors">
          Отмена
        </button>
      </div>
    </form>
  )
}

const paySchema = z.object({
  paidDate: z.string().min(1),
  paidAmount: z.number().positive().optional(),
})
type PayFormValues = z.infer<typeof paySchema>

function PaymentForm({
  loanId,
  payment,
  onSave,
  onCancel,
}: {
  loanId: string
  payment: LoanPayment
  onSave: () => void
  onCancel: () => void
}) {
  const { token } = useAuthStore()
  const { addToast } = useToast()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PayFormValues>({
    resolver: zodResolver(paySchema),
    defaultValues: { paidDate: todayISO(), paidAmount: payment.amount },
  })

  const onSubmit = async (values: PayFormValues) => {
    if (!token) return
    try {
      const res = await apiPayLoanPayment(token, loanId, payment.id, values)
      if (res.success) {
        addToast('Платёж отмечен', 'success')
        onSave()
      } else {
        addToast(res.message || 'Ошибка', 'error')
      }
    } catch {
      addToast('Нет соединения с сервером', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Дата оплаты</label>
        <input {...register('paidDate')} type="date" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
      </div>
      <div>
        <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Фактическая сумма</label>
        <input {...register('paidAmount', { valueAsNumber: true })} type="number" step="0.01" min="0" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
        {errors.paidAmount && <p className="text-xs text-red-500 mt-1">{errors.paidAmount.message}</p>}
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="flex-1 bg-black text-white font-open-sans font-light text-sm py-3 cursor-pointer border-none hover:bg-gray-900 transition-colors disabled:opacity-50">
          {isSubmitting ? '...' : 'Подтвердить'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-transparent text-black font-open-sans font-light text-sm py-3 cursor-pointer border border-gray-200 hover:border-black transition-colors">
          Отмена
        </button>
      </div>
    </form>
  )
}

export function LoansPage() {
  const { token } = useAuthStore()
  const { addToast } = useToast()

  const [loans, setLoans] = useState<IssuedLoanResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null)
  const [payingPayment, setPayingPayment] = useState<{ loanId: string; payment: LoanPayment } | null>(null)

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await apiGetIssuedLoans(token)
      if (res.success && res.data) setLoans(res.data)
    } catch {
      addToast('Нет соединения с сервером', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-white p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-eurostile text-3xl">Займы выданные</h1>
        <button onClick={() => setShowForm(true)} className="text-sm font-open-sans font-light text-white bg-black px-4 py-2 border-none cursor-pointer hover:bg-gray-900 transition-colors">
          + Добавить
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 border border-gray-100 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-32 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="text-center py-16 border border-gray-100">
          <p className="text-sm font-open-sans font-light text-gray-400">Займов нет</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const paidCount = loan.payments.filter((p) => p.status === 'PAID').length
            const totalCount = loan.payments.length
            const isExpanded = expandedLoan === loan.id

            return (
              <div key={loan.id} className="border border-gray-100">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-open-sans font-medium text-gray-800 text-sm">{loan.debtorName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-open-sans font-light px-2 py-0.5 border ${STATUS_COLORS[loan.status]}`}>
                          {LOAN_STATUS_LABELS[loan.status]}
                        </span>
                        {loan.interestRate > 0 && (
                          <span className="text-xs font-open-sans font-light text-gray-400">{loan.interestRate}%</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-eurostile text-xl text-gray-900">{formatMoney(loan.principal, loan.currency)}</p>
                      <p className="text-xs font-open-sans font-light text-gray-400 mt-1">
                        {formatDate(loan.issueDate)} → {formatDate(loan.dueDate)}
                      </p>
                    </div>
                  </div>

                  {totalCount > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-open-sans font-light text-gray-400">Платежи</span>
                        <span className="text-xs font-open-sans font-light text-gray-400">{paidCount} / {totalCount}</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full transition-all"
                          style={{ width: totalCount > 0 ? `${(paidCount / totalCount) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  )}

                  {loan.notes && <p className="text-xs font-open-sans font-light text-gray-400 mb-3">{loan.notes}</p>}

                  {totalCount > 0 && (
                    <button
                      onClick={() => setExpandedLoan(isExpanded ? null : loan.id)}
                      className="text-xs font-open-sans font-light text-gray-500 hover:text-black transition-colors bg-transparent border-none cursor-pointer p-0"
                    >
                      {isExpanded ? '↑ Скрыть платежи' : `↓ Показать платежи (${totalCount})`}
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-50">
                          <th className="text-left px-4 py-2 text-xs font-open-sans font-light text-gray-400">Дата</th>
                          <th className="text-right px-4 py-2 text-xs font-open-sans font-light text-gray-400">Сумма</th>
                          <th className="text-right px-4 py-2 text-xs font-open-sans font-light text-gray-400">Статус</th>
                          <th className="px-4 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {loan.payments.map((payment) => (
                          <tr key={payment.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                            <td className="px-4 py-2 font-open-sans font-light text-gray-700 text-xs">{formatDate(payment.dueDate)}</td>
                            <td className="px-4 py-2 text-right font-open-sans font-light text-gray-700 text-xs">
                              {formatMoney(payment.paidAmount ?? payment.amount, loan.currency)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <span className={`text-xs font-open-sans font-light ${PAYMENT_COLORS[payment.status]}`}>
                                {PAYMENT_STATUS_LABELS[payment.status]}
                                {payment.status === 'PAID' && ' ✓'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right">
                              {payment.status !== 'PAID' && (
                                <button
                                  onClick={() => setPayingPayment({ loanId: loan.id, payment })}
                                  className="text-xs font-open-sans font-light text-gray-500 hover:text-black border border-gray-200 hover:border-black px-2 py-0.5 transition-colors bg-transparent cursor-pointer"
                                >
                                  Оплачен
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <Modal title="Новый займ" onClose={() => setShowForm(false)}>
          <LoanForm onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {payingPayment && (
        <Modal title="Отметить платёж оплаченным" onClose={() => setPayingPayment(null)}>
          <PaymentForm
            loanId={payingPayment.loanId}
            payment={payingPayment.payment}
            onSave={() => { setPayingPayment(null); load() }}
            onCancel={() => setPayingPayment(null)}
          />
        </Modal>
      )}
    </div>
  )
}
