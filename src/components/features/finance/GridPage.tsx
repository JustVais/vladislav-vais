'use client'

import { useEffect, useState, useRef, useCallback, Fragment } from 'react'
import { useAuthStore } from '@/store/auth'
import { apiGetGrid, apiUpdateGridCell } from '@/lib/finance-api'
import type { GridResponse, GridAccountRow, GridColumn, Category, Direction } from '@/types/finance'
import { formatMoney, CATEGORY_LABELS } from './formatters'
import { useToast } from './ToastContext'

function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(' ')
}

function computeRange() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fromDate = new Date(now.getFullYear(), now.getMonth() - 12, 1)
  const toDate = new Date(now.getFullYear(), now.getMonth() + 12, 1)
  const lastDay = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0).getDate()
  return {
    from: `${fromDate.getFullYear()}-${pad(fromDate.getMonth() + 1)}-01`,
    to: `${toDate.getFullYear()}-${pad(toDate.getMonth() + 1)}-${pad(lastDay)}`,
    currentMonth: `${now.getFullYear()}-${pad(now.getMonth() + 1)}`,
  }
}

const MONTHS_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

function colLabel(col: GridColumn): string {
  if (col.type === 'MONTH' && col.month !== null) return `${MONTHS_RU[col.month - 1]} ${col.year}`
  if (col.type === 'DAY' && col.day !== null && col.month !== null) return `${col.day} ${MONTHS_RU[col.month - 1]} ${col.year}`
  return col.label
}

function devText(dev: number): string {
  if (dev === 0) return '—'
  return `${dev > 0 ? '+' : '−'}${formatMoney(Math.abs(dev))}`
}

function devColor(dev: number): string {
  if (dev === 0) return 'text-gray-300'
  return dev < 0 ? 'text-red-500' : 'text-gray-700'
}

// ── Display column type (month/day cols + synthetic year-total cols) ──────────

type DisplayCol =
  | { kind: 'col'; col: GridColumn }
  | { kind: 'year'; year: number; monthKeys: string[] }

function buildDisplayCols(
  monthCols: GridColumn[],
  expandedMonth: string | null,
  dayGrid: GridResponse | null,
): DisplayCol[] {
  const result: DisplayCol[] = []
  let currentYear: number | null = null
  let yearMonthKeys: string[] = []

  for (const mc of monthCols) {
    if (currentYear !== null && mc.year !== currentYear) {
      result.push({ kind: 'year', year: currentYear, monthKeys: yearMonthKeys })
      yearMonthKeys = []
    }
    currentYear = mc.year
    yearMonthKeys.push(mc.key)

    if (mc.key === expandedMonth && dayGrid) {
      for (const dc of dayGrid.columns) result.push({ kind: 'col', col: dc })
    } else {
      result.push({ kind: 'col', col: mc })
    }
  }

  if (currentYear !== null && yearMonthKeys.length > 0) {
    result.push({ kind: 'year', year: currentYear, monthKeys: yearMonthKeys })
  }

  return result
}

// ── CellEditor ────────────────────────────────────────────────────────────────

function CellEditor({ value, onSave }: { value: number; onSave: (val: number | null) => void }) {
  const [text, setText] = useState(value !== 0 ? String(value) : '')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.select() }, [])
  const commit = () => {
    const n = text === '' ? null : parseFloat(text.replace(',', '.'))
    onSave(n !== null && isNaN(n) ? null : n)
  }
  return (
    <input
      ref={ref}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onSave(null) }}
      className="w-full h-full bg-yellow-50 border-none outline-none text-xs font-open-sans font-light text-right px-1"
    />
  )
}

// ── CellTriple — план | факт | откл. (editable) ───────────────────────────────

interface CellTripleProps {
  plan: number; actual: number; direction: Direction
  planEditable: boolean; actualEditable: boolean
  saving: boolean; isCurrentMonth: boolean
  onEditPlan: (val: number) => void; onEditActual: (val: number) => void
}

function CellTriple({ plan, actual, direction, planEditable, actualEditable, saving, isCurrentMonth, onEditPlan, onEditActual }: CellTripleProps) {
  const [editing, setEditing] = useState<'plan' | 'actual' | null>(null)

  const dev = Math.abs(actual) - Math.abs(plan)
  const hasAny = plan !== 0 || actual !== 0
  const dc = hasAny ? devColor(dev) : 'text-gray-200'
  const dt = hasAny ? devText(dev) : '—'

  return (
    <>
      <td
        className={cn('p-0 min-w-[72px] h-10', isCurrentMonth ? 'border-l-2 border-l-black' : 'border-l border-gray-100', planEditable && !saving && 'cursor-text hover:bg-yellow-50', saving && 'opacity-50')}
        onClick={() => planEditable && !saving && setEditing('plan')}
      >
        {editing === 'plan' ? (
          <CellEditor value={Math.abs(plan)} onSave={(v) => { setEditing(null); if (v !== null) onEditPlan(v) }} />
        ) : (
          <div className="flex items-center justify-end px-2 h-full">
            <span className={`text-xs font-open-sans font-light ${plan !== 0 ? 'text-gray-500' : 'text-gray-200'}`}>{plan !== 0 ? formatMoney(Math.abs(plan)) : '—'}</span>
          </div>
        )}
      </td>
      <td
        className={cn('p-0 min-w-[72px] h-10 border-l border-gray-50', actualEditable && !saving && 'cursor-text hover:bg-yellow-50', saving && 'opacity-50')}
        onClick={() => actualEditable && !saving && setEditing('actual')}
      >
        {editing === 'actual' ? (
          <CellEditor value={Math.abs(actual)} onSave={(v) => { setEditing(null); if (v !== null) onEditActual(v) }} />
        ) : (
          <div className="flex items-center justify-end px-2 h-full">
            <span className={`text-xs font-open-sans font-light ${actual !== 0 ? 'text-gray-900' : 'text-gray-200'}`}>{actual !== 0 ? formatMoney(Math.abs(actual)) : '—'}</span>
          </div>
        )}
      </td>
      <td className="p-0 min-w-[72px] h-10 border-l border-gray-50 bg-gray-50/40">
        <div className="flex items-center justify-end px-2 h-full">
          <span className={`text-xs font-open-sans font-light ${dc}`}>{dt}</span>
        </div>
      </td>
    </>
  )
}

// ── AggregateTriple — план | факт | откл. (read-only) ─────────────────────────

function AggregateTriple({
  plan, actual, isCurrentMonth, yearTotal = false,
}: {
  plan: number; actual: number; isCurrentMonth: boolean; yearTotal?: boolean
}) {
  const dev = Math.abs(actual) - Math.abs(plan)
  const hasAny = plan !== 0 || actual !== 0
  const dc = hasAny ? devColor(dev) : 'text-gray-200'
  const dt = hasAny ? devText(dev) : '—'
  const bg = yearTotal ? 'bg-gray-50' : ''

  return (
    <>
      <td className={cn('p-0 min-w-[72px] h-10', bg, isCurrentMonth ? 'border-l-2 border-l-black' : 'border-l border-gray-100')}>
        <div className="flex items-center justify-end px-2 h-full">
          <span className={`text-xs font-open-sans ${yearTotal ? 'font-medium' : 'font-light'} ${hasAny ? 'text-gray-600' : 'text-gray-200'}`}>
            {plan !== 0 ? formatMoney(Math.abs(plan)) : '—'}
          </span>
        </div>
      </td>
      <td className={cn('p-0 min-w-[72px] h-10 border-l border-gray-50', bg)}>
        <div className="flex items-center justify-end px-2 h-full">
          <span className={`text-xs font-open-sans ${yearTotal ? 'font-medium' : 'font-light'} ${hasAny ? 'text-gray-900' : 'text-gray-200'}`}>
            {actual !== 0 ? formatMoney(Math.abs(actual)) : '—'}
          </span>
        </div>
      </td>
      <td className={cn('p-0 min-w-[72px] h-10 border-l border-gray-50', yearTotal ? 'bg-gray-50' : 'bg-gray-50/40')}>
        <div className="flex items-center justify-end px-2 h-full">
          <span className={`text-xs font-open-sans ${yearTotal ? 'font-medium' : 'font-light'} ${dc}`}>{dt}</span>
        </div>
      </td>
    </>
  )
}

// ── AccountRowView ────────────────────────────────────────────────────────────

interface AccountRowProps {
  row: GridAccountRow; monthCols: GridColumn[]
  expandedMonth: string | null; dayGrid: GridResponse | null
  isExpanded: boolean; currentMonth: string
  onToggle: () => void; onCollapseDay: () => void
  onSaveCell: (accountId: string, category: Category, direction: Direction, date: string, plan: number | null, actual: number | null) => void
  savingCell: string | null
}

function AccountRowView({ row, monthCols, expandedMonth, dayGrid, isExpanded, currentMonth, onToggle, onCollapseDay, onSaveCell, savingCell }: AccountRowProps) {
  const displayCols = buildDisplayCols(monthCols, expandedMonth, dayGrid)
  const dayAccountRow = dayGrid?.rows.find(r => r.accountId === row.accountId)
  const isPastOrCurrent = expandedMonth !== null && expandedMonth <= currentMonth

  const yearAggregate = (monthKeys: string[], getPlan: (k: string) => number, getActual: (k: string) => number) => ({
    plan: monthKeys.reduce((s, k) => s + getPlan(k), 0),
    actual: monthKeys.reduce((s, k) => s + getActual(k), 0),
  })

  return (
    <>
      {/* Account header row */}
      <tr className="border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={onToggle}>
        <td className="sticky left-0 z-10 bg-inherit px-3 py-2 min-w-[180px] max-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{isExpanded ? '▾' : '▸'}</span>
            <div>
              <p className="text-xs font-open-sans font-medium text-gray-800 truncate">{row.name}</p>
              <p className="text-xs font-open-sans font-light text-gray-400">{row.currency}</p>
            </div>
          </div>
        </td>
        {displayCols.map((dc) => {
          if (dc.kind === 'year') {
            const { plan, actual } = yearAggregate(
              dc.monthKeys,
              (k) => row.children.reduce((s, c) => s + (c.cells[k]?.plan ?? 0), 0),
              (k) => row.children.reduce((s, c) => s + (c.cells[k]?.actual ?? 0), 0),
            )
            return (
              <Fragment key={`year-${dc.year}`}>
                <AggregateTriple plan={plan} actual={actual} isCurrentMonth={false} yearTotal />
              </Fragment>
            )
          }
          const col = dc.col
          const isCurrentMonthCol = col.type === 'MONTH' && col.key === currentMonth
          const src = col.type === 'DAY' ? dayAccountRow : null
          const plan = src
            ? (src.cells[col.key]?.plan ?? src.children.reduce((s, c) => s + (c.cells[col.key]?.plan ?? 0), 0))
            : row.children.reduce((s, c) => s + (c.cells[col.key]?.plan ?? 0), 0)
          const actual = src
            ? (src.cells[col.key]?.actual ?? src.children.reduce((s, c) => s + (c.cells[col.key]?.actual ?? 0), 0))
            : row.children.reduce((s, c) => s + (c.cells[col.key]?.actual ?? 0), 0)
          return (
            <Fragment key={col.key}>
              <AggregateTriple plan={plan} actual={actual} isCurrentMonth={isCurrentMonthCol} />
            </Fragment>
          )
        })}
      </tr>

      {/* Category rows */}
      {isExpanded && row.children.map((child) => {
        const dayCategory = dayAccountRow?.children.find(c => c.category === child.category)
        return (
          <tr key={child.category} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <td className="sticky left-0 z-10 bg-white px-3 py-2 min-w-[180px] max-w-[200px]">
              <div className="flex items-center gap-2 pl-5">
                <span className={`text-xs leading-none ${child.direction === 'IN' ? 'text-green-500' : 'text-red-500'}`}>
                  {child.direction === 'IN' ? '↑' : '↓'}
                </span>
                <p className="text-xs font-open-sans font-light text-gray-700 truncate">{CATEGORY_LABELS[child.category]}</p>
              </div>
            </td>
            {displayCols.map((dc) => {
              if (dc.kind === 'year') {
                const { plan, actual } = yearAggregate(
                  dc.monthKeys,
                  (k) => child.cells[k]?.plan ?? 0,
                  (k) => child.cells[k]?.actual ?? 0,
                )
                return (
                  <Fragment key={`year-${dc.year}`}>
                    <AggregateTriple plan={plan} actual={actual} isCurrentMonth={false} yearTotal />
                  </Fragment>
                )
              }
              const col = dc.col
              const isDay = col.type === 'DAY'
              const isCurrentMonthCol = col.type === 'MONTH' && col.key === currentMonth
              const cell = isDay
                ? (dayCategory?.cells[col.key] ?? { plan: 0, actual: 0 })
                : (child.cells[col.key] ?? { plan: 0, actual: 0 })
              const cellId = `${row.accountId}-${child.category}-${col.key}`
              return (
                <CellTriple
                  key={col.key}
                  plan={cell.plan} actual={cell.actual} direction={child.direction}
                  planEditable={isDay} actualEditable={isDay && isPastOrCurrent}
                  saving={savingCell === cellId} isCurrentMonth={isCurrentMonthCol}
                  onEditPlan={(v) => onSaveCell(row.accountId, child.category, child.direction, col.key, v, null)}
                  onEditActual={(v) => onSaveCell(row.accountId, child.category, child.direction, col.key, null, v)}
                />
              )
            })}
          </tr>
        )
      })}
    </>
  )
}

// ── GridPage ──────────────────────────────────────────────────────────────────

export function GridPage() {
  const { token } = useAuthStore()
  const { addToast } = useToast()

  const { from, to, currentMonth } = computeRange()

  const [monthGrid, setMonthGrid] = useState<GridResponse | null>(null)
  const [dayGrid, setDayGrid] = useState<GridResponse | null>(null)
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [dayLoading, setDayLoading] = useState(false)
  const [savingCell, setSavingCell] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const currentMonthRef = useRef<HTMLTableCellElement>(null)
  const initializedRef = useRef(false)

  const loadMonthGrid = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await apiGetGrid(token, { from, to, granularity: 'MONTH' })
      if (res.success && res.data) setMonthGrid(res.data)
    } catch {
      addToast('Нет соединения с сервером', 'error')
    } finally {
      setLoading(false)
    }
  }, [token, from, to, addToast])

  const loadDayGrid = useCallback(async (month: string) => {
    if (!token) return
    setDayLoading(true)
    const [year, m] = month.split('-').map(Number)
    const lastDay = new Date(year, m, 0).getDate()
    const pad = (n: number) => String(n).padStart(2, '0')
    try {
      const res = await apiGetGrid(token, { from: `${month}-01`, to: `${month}-${pad(lastDay)}`, granularity: 'DAY' })
      if (res.success && res.data) setDayGrid(res.data)
    } catch {
      addToast('Нет соединения с сервером', 'error')
    } finally {
      setDayLoading(false)
    }
  }, [token, addToast])

  useEffect(() => { loadMonthGrid() }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (monthGrid && !initializedRef.current) {
      initializedRef.current = true
      setExpandedAccounts(new Set(monthGrid.rows.map(r => r.accountId)))
    }
  }, [monthGrid])

  useEffect(() => {
    if (!loading && currentMonthRef.current && containerRef.current) {
      const th = currentMonthRef.current
      const container = containerRef.current
      container.scrollLeft = th.offsetLeft - container.clientWidth / 2 + th.offsetWidth / 2
    }
  }, [loading])

  const handleMonthClick = (colKey: string) => {
    if (expandedMonth === colKey) { setExpandedMonth(null); setDayGrid(null) }
    else { setExpandedMonth(colKey); loadDayGrid(colKey) }
  }

  const handleCollapseDay = () => { setExpandedMonth(null); setDayGrid(null) }

  const handleSaveCell = async (
    accountId: string, category: Category, direction: Direction,
    date: string, plan: number | null, actual: number | null,
  ) => {
    if (!token) return
    const cellId = `${accountId}-${category}-${date}`
    setSavingCell(cellId)
    try {
      const res = await apiUpdateGridCell(token, { accountId, category, direction, date, plan, actual })
      if (res.success) {
        if (expandedMonth) loadDayGrid(expandedMonth)
        loadMonthGrid()
      } else {
        addToast(res.message || 'Ошибка сохранения', 'error')
      }
    } catch {
      addToast('Нет соединения с сервером', 'error')
    } finally {
      setSavingCell(null)
    }
  }

  const toggleAccount = (id: string) => {
    setExpandedAccounts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const sortedRows = monthGrid
    ? [...monthGrid.rows].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    : []

  const displayCols = monthGrid
    ? buildDisplayCols(monthGrid.columns, expandedMonth, dayGrid)
    : []

  return (
    <div className="bg-white">
      <div className="px-4 py-4 sm:px-6 md:px-8 border-b border-gray-100">
        <h1 className="font-eurostile text-3xl">Грид</h1>
      </div>

      {loading ? (
        <div className="px-4 py-6 sm:px-6 md:px-8 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-50 rounded animate-pulse" />
          ))}
        </div>
      ) : !monthGrid || monthGrid.rows.length === 0 ? (
        <p className="text-sm font-open-sans font-light text-gray-400 py-16 text-center">Нет данных за выбранный период</p>
      ) : (
        <div ref={containerRef} className="overflow-x-auto">
          <table className="border-collapse w-max min-w-full">
            <thead>
              {/* Row 1: period labels */}
              <tr className="border-b border-gray-100 bg-white">
                <th
                  rowSpan={2}
                  className="sticky left-0 z-20 bg-white px-3 py-2 min-w-[180px] text-left align-bottom border-b border-gray-200 border-r border-gray-100"
                >
                  <div className="text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400">
                    Счёт / Категория
                  </div>
                </th>
                {displayCols.map((dc) => {
                  if (dc.kind === 'year') {
                    return (
                      <th
                        key={`year-${dc.year}`}
                        colSpan={3}
                        className="min-w-[216px] text-center border-l-2 border-l-gray-300 bg-gray-50"
                      >
                        <div className="px-2 py-2 text-xs font-open-sans font-medium text-gray-700">
                          {dc.year} — итог
                        </div>
                      </th>
                    )
                  }
                  const col = dc.col
                  const isMonthHeader = col.type === 'MONTH'
                  const isDayHeader = col.type === 'DAY'
                  const isCurrentMonthCol = isMonthHeader && col.key === currentMonth
                  const isExpMon = col.key === expandedMonth
                  return (
                    <th
                      key={col.key}
                      colSpan={3}
                      ref={isCurrentMonthCol ? currentMonthRef : undefined}
                      className={cn(
                        'min-w-[216px] text-center',
                        isCurrentMonthCol ? 'border-l-2 border-l-black' : 'border-l border-gray-100',
                        isMonthHeader && 'cursor-pointer hover:bg-gray-50',
                        isDayHeader && 'cursor-pointer hover:bg-gray-50',
                      )}
                      onClick={isMonthHeader ? () => handleMonthClick(col.key) : isDayHeader ? handleCollapseDay : undefined}
                    >
                      <div className={`px-2 py-2 text-xs font-open-sans font-light ${
                        isDayHeader ? 'text-blue-500' :
                        isCurrentMonthCol ? 'text-black font-medium' :
                        isExpMon ? 'text-gray-800 font-medium' :
                        'text-gray-600'
                      }`}>
                        {colLabel(col)}
                        {isMonthHeader && <span className="ml-1 text-gray-300">{isExpMon ? '▴' : '▾'}</span>}
                        {dayLoading && isExpMon && <span className="ml-1 text-gray-300 animate-pulse">…</span>}
                      </div>
                    </th>
                  )
                })}
              </tr>

              {/* Row 2: план / факт / откл. */}
              <tr className="border-b border-gray-200 bg-white">
                {displayCols.map((dc) => {
                  if (dc.kind === 'year') {
                    return (
                      <Fragment key={`year-sub-${dc.year}`}>
                        <th className="py-1 px-2 text-[10px] font-open-sans font-light text-gray-400 text-center min-w-[72px] border-l-2 border-l-gray-300 bg-gray-50">план</th>
                        <th className="py-1 px-2 text-[10px] font-open-sans font-light text-gray-400 text-center min-w-[72px] border-l border-gray-200 bg-gray-50">факт</th>
                        <th className="py-1 px-2 text-[10px] font-open-sans font-light text-gray-300 text-center min-w-[72px] border-l border-gray-200 bg-gray-50">откл.</th>
                      </Fragment>
                    )
                  }
                  const col = dc.col
                  const isCurrentMonthCol = col.type === 'MONTH' && col.key === currentMonth
                  return (
                    <Fragment key={col.key}>
                      <th className={cn('py-1 px-2 text-[10px] font-open-sans font-light text-gray-400 text-center min-w-[72px]', isCurrentMonthCol ? 'border-l-2 border-l-black' : 'border-l border-gray-100')}>план</th>
                      <th className="py-1 px-2 text-[10px] font-open-sans font-light text-gray-400 text-center min-w-[72px] border-l border-gray-50">факт</th>
                      <th className="py-1 px-2 text-[10px] font-open-sans font-light text-gray-300 text-center min-w-[72px] border-l border-gray-50 bg-gray-50/40">откл.</th>
                    </Fragment>
                  )
                })}
              </tr>
            </thead>

            <tbody>
              {sortedRows.map((row) => (
                <AccountRowView
                  key={row.accountId}
                  row={row}
                  monthCols={monthGrid.columns}
                  expandedMonth={expandedMonth}
                  dayGrid={dayGrid}
                  isExpanded={expandedAccounts.has(row.accountId)}
                  currentMonth={currentMonth}
                  onToggle={() => toggleAccount(row.accountId)}
                  onCollapseDay={handleCollapseDay}
                  onSaveCell={handleSaveCell}
                  savingCell={savingCell}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
