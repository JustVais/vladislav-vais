'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { useAuthStore } from '@/store/auth'
import { apiGetSummary, apiGetScheduledUpcoming, apiExecuteScheduled, apiGetTransactions } from '@/lib/finance-api'
import type { FinanceSummary, UpcomingOperationResponse, TransactionResponse } from '@/types/finance'
import { formatMoney, formatDateShort, CATEGORY_LABELS } from './formatters'
import { useToast } from './ToastContext'
import { useFinanceStore } from '@/store/finance'

// ─── helpers ────────────────────────────────────────────────────────────────

function getLast6Months() {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (5 - i))
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('ru-RU', { month: 'short' }),
      income: 0,
      expenses: 0,
    }
  })
}

function buildCashFlow(txns: TransactionResponse[]) {
  const months = getLast6Months()
  txns.forEach((t) => {
    const mk = t.date.slice(0, 7)
    const entry = months.find((m) => m.key === mk)
    if (!entry) return
    if (t.direction === 'IN') entry.income += t.amount
    else entry.expenses += t.amount
  })
  return months
}

function getFromDate() {
  const d = new Date()
  d.setMonth(d.getMonth() - 5)
  d.setDate(1)
  return d.toISOString().split('T')[0]
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

// ─── custom tooltip ──────────────────────────────────────────────────────────

function CashFlowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg px-4 py-3 text-xs font-open-sans font-light">
      <p className="font-medium text-gray-800 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="mb-0.5">
          {p.name === 'income' ? 'Доходы' : 'Расходы'}: {formatMoney(p.value)}
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="bg-white border border-gray-100 shadow-lg px-4 py-3 text-xs font-open-sans font-light">
      <p className="font-medium text-gray-800">{p.name}</p>
      <p style={{ color: p.payload.color }}>{formatMoney(p.value)}</p>
    </div>
  )
}

// ─── metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  label, value, currency = 'RUB', accent,
}: {
  label: string; value: number; currency?: string; accent?: string
}) {
  const isNeg = value < 0
  return (
    <div className="bg-white p-5 flex flex-col gap-1 border-b border-gray-100 last:border-0 md:border-b-0 md:border-r">
      <p className="text-[10px] font-open-sans font-light uppercase tracking-[0.14em] text-gray-400">{label}</p>
      <p className={`text-xl font-eurostile leading-none ${accent ?? (isNeg ? 'text-red-500' : 'text-gray-900')}`}>
        {formatMoney(value, currency)}
      </p>
    </div>
  )
}

// ─── main ────────────────────────────────────────────────────────────────────

const CAPITAL_COLORS = ['#111827', '#6366f1', '#10b981', '#f59e0b']
const LIQUIDITY_COLORS = ['#10b981', '#f59e0b', '#d1d5db']

export function DashboardPage() {
  const { token } = useAuthStore()
  const { addToast } = useToast()
  const invalidateAccounts = useFinanceStore((s) => s.invalidateAccounts)
  const loadAccounts = useFinanceStore((s) => s.loadAccounts)

  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [upcoming, setUpcoming] = useState<UpcomingOperationResponse[]>([])
  const [cashFlow, setCashFlow] = useState<ReturnType<typeof buildCashFlow>>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState<string | null>(null)

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      const [sumRes, upRes, txRes] = await Promise.all([
        apiGetSummary(token),
        apiGetScheduledUpcoming(token, 30),
        apiGetTransactions(token, { from: getFromDate(), to: todayISO() }),
      ])
      if (sumRes.success && sumRes.data) setSummary(sumRes.data)
      if (upRes.success && upRes.data) setUpcoming(upRes.data)
      if (txRes.success && txRes.data) setCashFlow(buildCashFlow(txRes.data))
    } catch {
      addToast('Нет соединения с сервером', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleExecute = async (opId: string) => {
    if (!token) return
    setExecuting(opId)
    try {
      const res = await apiExecuteScheduled(token, opId)
      if (res.success) {
        addToast('Операция выполнена', 'success')
        invalidateAccounts()
        if (token) loadAccounts(token)
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

  if (loading) return (
    <div className="bg-white animate-pulse space-y-4 p-6 md:p-8">
      <div className="h-20 bg-gray-50 rounded" />
      <div className="h-64 bg-gray-50 rounded" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-48 bg-gray-50 rounded" />
        <div className="h-48 bg-gray-50 rounded" />
      </div>
    </div>
  )

  if (!summary) return (
    <div className="bg-white p-8 text-sm font-open-sans font-light text-gray-400">Нет данных</div>
  )

  // Capital donut data
  const capitalData = [
    { name: 'Наличные и счета', value: Math.max(0, summary.cash.total), color: CAPITAL_COLORS[0] },
    { name: 'Имущество', value: Math.max(0, summary.liquidAssets.total), color: CAPITAL_COLORS[1] },
    { name: 'Займы выданные', value: Math.max(0, summary.issuedLoans.total), color: CAPITAL_COLORS[2] },
  ].filter((d) => d.value > 0)

  // Liquidity donut
  const liquidityData = [
    { name: 'Высокая', value: summary.liquidAssets.byLiquidity.high, color: LIQUIDITY_COLORS[0] },
    { name: 'Средняя', value: summary.liquidAssets.byLiquidity.medium, color: LIQUIDITY_COLORS[1] },
    { name: 'Низкая', value: summary.liquidAssets.byLiquidity.low, color: LIQUIDITY_COLORS[2] },
  ].filter((d) => d.value > 0)

  // Upcoming grouped
  const grouped = upcoming.reduce<Record<string, UpcomingOperationResponse[]>>((acc, op) => {
    ;(acc[op.date] ??= []).push(op)
    return acc
  }, {})

  const totalIncome = cashFlow.reduce((s, m) => s + m.income, 0)
  const totalExpenses = cashFlow.reduce((s, m) => s + m.expenses, 0)
  const hasCashFlow = totalIncome > 0 || totalExpenses > 0

  return (
    <div className="space-y-4">

      {/* ── Hero: net worth ─────────────────────────────────────────────── */}
      <div className="bg-white">
        {/* Top: big number */}
        <div className="px-6 pt-8 pb-6 border-b border-gray-100">
          <p className="text-[10px] font-open-sans font-light uppercase tracking-[0.18em] text-gray-400 mb-2">
            Чистый капитал
          </p>
          <p className={`font-eurostile text-5xl md:text-6xl leading-none mb-3 ${summary.netWorth >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
            {formatMoney(summary.netWorth)}
          </p>
          {/* 30-day forecast badges */}
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-open-sans font-light">
              <span className="text-base leading-none">↑</span>
              {formatMoney(summary.upcoming30Days.income)} ожидается
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-open-sans font-light">
              <span className="text-base leading-none">↓</span>
              {formatMoney(Math.abs(summary.upcoming30Days.expenses))} расходов
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-open-sans font-light
              ${summary.upcoming30Days.net >= 0 ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'}`}>
              Итог: {formatMoney(summary.upcoming30Days.net)}
            </span>
          </div>
        </div>

        {/* Bottom: metric strip */}
        <div className="grid grid-cols-2 md:grid-cols-4">
          <MetricCard label="Наличные и счета" value={summary.cash.total} />
          <MetricCard label="Долги" value={summary.debt.total} accent="text-red-500" />
          <MetricCard label="Займы выданные" value={summary.issuedLoans.total} accent="text-indigo-600" />
          <MetricCard label="Имущество" value={summary.liquidAssets.total} />
        </div>
      </div>

      {/* ── Cash flow chart ─────────────────────────────────────────────── */}
      {hasCashFlow && (
        <div className="bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-eurostile text-xl text-gray-900">Денежный поток</p>
              <p className="text-xs font-open-sans font-light text-gray-400 mt-0.5">Последние 6 месяцев</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-open-sans font-light text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-0.5 bg-green-500" /> Доходы
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-0.5 bg-red-400" /> Расходы
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={cashFlow} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expensesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontFamily: 'var(--font-open-sans)', fill: '#9ca3af', fontWeight: 300 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontFamily: 'var(--font-open-sans)', fill: '#9ca3af', fontWeight: 300 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`}
                width={40}
              />
              <Tooltip content={<CashFlowTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#incomeGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#f43f5e"
                strokeWidth={2}
                fill="url(#expensesGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-50">
            <div>
              <p className="text-[10px] font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Всего доходов</p>
              <p className="text-lg font-eurostile text-green-600">{formatMoney(totalIncome)}</p>
            </div>
            <div>
              <p className="text-[10px] font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Всего расходов</p>
              <p className="text-lg font-eurostile text-red-500">{formatMoney(totalExpenses)}</p>
            </div>
            <div>
              <p className="text-[10px] font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Сальдо</p>
              <p className={`text-lg font-eurostile ${totalIncome - totalExpenses >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                {formatMoney(totalIncome - totalExpenses)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Donuts row ──────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Capital structure */}
        {capitalData.length > 0 && (
          <div className="bg-white p-6">
            <p className="font-eurostile text-xl text-gray-900 mb-1">Структура капитала</p>
            <p className="text-xs font-open-sans font-light text-gray-400 mb-4">Активы без учёта долгов</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={capitalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {capitalData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {capitalData.map((d) => (
                  <div key={d.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-open-sans font-light text-gray-500 flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: d.color }} />
                        {d.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-eurostile text-gray-900">{formatMoney(d.value)}</p>
                      <p className="text-xs font-open-sans font-light text-gray-400">
                        {Math.round((d.value / capitalData.reduce((s, x) => s + x.value, 0)) * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Liquidity breakdown */}
        {liquidityData.length > 0 && (
          <div className="bg-white p-6">
            <p className="font-eurostile text-xl text-gray-900 mb-1">Ликвидность имущества</p>
            <p className="text-xs font-open-sans font-light text-gray-400 mb-4">По скорости реализации</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={liquidityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {liquidityData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {liquidityData.map((d) => (
                  <div key={d.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-open-sans font-light text-gray-500 flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: d.color }} />
                        {d.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-eurostile text-gray-900">{formatMoney(d.value)}</p>
                      <p className="text-xs font-open-sans font-light text-gray-400">
                        {Math.round((d.value / liquidityData.reduce((s, x) => s + x.value, 0)) * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Debt breakdown */}
        {summary.debt.total !== 0 && (
          <div className="bg-white p-6">
            <p className="font-eurostile text-xl text-gray-900 mb-1">Долговая нагрузка</p>
            <p className="text-xs font-open-sans font-light text-gray-400 mb-5">
              Итого: <span className="text-red-500 font-eurostile text-base">{formatMoney(Math.abs(summary.debt.total))}</span>
            </p>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart
                data={[
                  { name: 'Кредитные карты', value: Math.abs(summary.debt.creditCards) },
                  { name: 'Кредиты', value: Math.abs(summary.debt.loans) },
                ]}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                barSize={16}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontFamily: 'var(--font-open-sans)', fill: '#9ca3af', fontWeight: 300 }}
                  width={110}
                />
                <Tooltip
                  formatter={(v) => [formatMoney(Number(v)), '']}
                  contentStyle={{ fontFamily: 'var(--font-open-sans)', fontSize: 12, border: '1px solid #f3f4f6' }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="value" fill="#f43f5e" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Upcoming payments ───────────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <div className="bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-eurostile text-xl text-gray-900">Ближайшие платежи</p>
              <p className="text-xs font-open-sans font-light text-gray-400 mt-0.5">На 30 дней вперёд</p>
            </div>
            <span className="text-xs font-open-sans font-light text-gray-400 border border-gray-100 px-2 py-1">
              {upcoming.length} операций
            </span>
          </div>

          <div className="space-y-1">
            {Object.entries(grouped).map(([date, ops]) => (
              <div key={date}>
                <p className="text-[10px] font-open-sans font-light uppercase tracking-[0.12em] text-gray-300 py-2 px-0">
                  {formatDateShort(date)}
                </p>
                {ops.map((op) => (
                  <div
                    key={op.operationId}
                    className="flex items-center justify-between gap-4 py-3 px-4 hover:bg-gray-50 transition-colors -mx-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 flex items-center justify-center shrink-0 text-sm
                        ${op.direction === 'IN' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {op.direction === 'IN' ? '↑' : '↓'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-open-sans font-light text-gray-800 truncate">{op.name}</p>
                        <p className="text-xs font-open-sans font-light text-gray-400">{CATEGORY_LABELS[op.category]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-sm font-eurostile ${op.direction === 'IN' ? 'text-green-600' : 'text-red-500'}`}>
                        {op.direction === 'OUT' && '−'}{formatMoney(op.amount)}
                      </span>
                      <button
                        onClick={() => handleExecute(op.operationId)}
                        disabled={executing === op.operationId}
                        className="text-xs font-open-sans font-light text-gray-400 hover:text-black border border-gray-100 hover:border-black px-3 py-1.5 transition-colors disabled:opacity-40 bg-transparent cursor-pointer"
                      >
                        {executing === op.operationId ? '...' : 'Исполнить'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
