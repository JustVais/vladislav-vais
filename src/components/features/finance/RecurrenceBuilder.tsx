'use client'

import { useState, useEffect } from 'react'
import type { RecurrenceRule, Frequency, DayOfWeek } from '@/types/finance'
import { formatRecurrence } from './formatters'

const FREQ_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'ONCE', label: 'Однократно' },
  { value: 'DAILY', label: 'Ежедневно' },
  { value: 'WEEKLY', label: 'Еженедельно' },
  { value: 'MONTHLY', label: 'Ежемесячно' },
  { value: 'YEARLY', label: 'Ежегодно' },
]

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 'MONDAY', label: 'Пн' },
  { value: 'TUESDAY', label: 'Вт' },
  { value: 'WEDNESDAY', label: 'Ср' },
  { value: 'THURSDAY', label: 'Чт' },
  { value: 'FRIDAY', label: 'Пт' },
  { value: 'SATURDAY', label: 'Сб' },
  { value: 'SUNDAY', label: 'Вс' },
]

const MONTHS: { value: number; label: string }[] = [
  { value: 1, label: 'Января' }, { value: 2, label: 'Февраля' }, { value: 3, label: 'Марта' },
  { value: 4, label: 'Апреля' }, { value: 5, label: 'Мая' }, { value: 6, label: 'Июня' },
  { value: 7, label: 'Июля' }, { value: 8, label: 'Августа' }, { value: 9, label: 'Сентября' },
  { value: 10, label: 'Октября' }, { value: 11, label: 'Ноября' }, { value: 12, label: 'Декабря' },
]

const WEEK_OF_MONTH: { value: number; label: string }[] = [
  { value: 1, label: 'первый' }, { value: 2, label: 'второй' },
  { value: 3, label: 'третий' }, { value: 4, label: 'четвёртый' }, { value: -1, label: 'последний' },
]

function inputCls() {
  return 'border-b border-gray-200 pb-1 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent'
}

interface Props {
  value: RecurrenceRule
  onChange: (rule: RecurrenceRule) => void
}

export function RecurrenceBuilder({ value, onChange }: Props) {
  const [monthlyMode, setMonthlyMode] = useState<'day' | 'week'>(
    value.weekOfMonth !== undefined ? 'week' : 'day',
  )

  const set = (patch: Partial<RecurrenceRule>) => onChange({ ...value, ...patch })

  const toggleDayOfWeek = (d: DayOfWeek) => {
    const current = value.daysOfWeek ?? []
    const next = current.includes(d) ? current.filter((x) => x !== d) : [...current, d]
    set({ daysOfWeek: next })
  }

  const preview = formatRecurrence(value)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-2">Частота</label>
        <div className="flex flex-wrap gap-2">
          {FREQ_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ frequency: opt.value, interval: 1 })}
              className={`px-3 py-1.5 text-xs font-open-sans font-light border transition-colors cursor-pointer
                ${value.frequency === opt.value ? 'bg-black text-white border-black' : 'bg-transparent text-gray-600 border-gray-200 hover:border-black'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {value.frequency === 'DAILY' && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-open-sans font-light text-gray-600">Каждые</span>
          <input
            type="number"
            min="1"
            value={value.interval ?? 1}
            onChange={(e) => set({ interval: Number(e.target.value) })}
            className={`w-16 text-center ${inputCls()}`}
          />
          <span className="text-sm font-open-sans font-light text-gray-600">дней</span>
        </div>
      )}

      {value.frequency === 'WEEKLY' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-open-sans font-light text-gray-600">Каждые</span>
            <input
              type="number"
              min="1"
              value={value.interval ?? 1}
              onChange={(e) => set({ interval: Number(e.target.value) })}
              className={`w-16 text-center ${inputCls()}`}
            />
            <span className="text-sm font-open-sans font-light text-gray-600">недель</span>
          </div>
          <div>
            <p className="text-xs font-open-sans font-light text-gray-400 mb-2">По дням:</p>
            <div className="flex gap-2 flex-wrap">
              {DAYS_OF_WEEK.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDayOfWeek(d.value)}
                  className={`w-9 h-9 text-xs font-open-sans font-light border transition-colors cursor-pointer
                    ${(value.daysOfWeek ?? []).includes(d.value) ? 'bg-black text-white border-black' : 'bg-transparent text-gray-600 border-gray-200 hover:border-black'}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {value.frequency === 'MONTHLY' && (
        <div className="space-y-3">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={monthlyMode === 'day'}
                onChange={() => {
                  setMonthlyMode('day')
                  set({ weekOfMonth: undefined, dayOfWeek: undefined, dayOfMonth: 1 })
                }}
                className="cursor-pointer"
              />
              <span className="text-sm font-open-sans font-light text-gray-600">Каждый</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={monthlyMode === 'week'}
                onChange={() => {
                  setMonthlyMode('week')
                  set({ dayOfMonth: undefined, weekOfMonth: 1, dayOfWeek: 'MONDAY' })
                }}
                className="cursor-pointer"
              />
              <span className="text-sm font-open-sans font-light text-gray-600">Каждый Н-й день</span>
            </label>
          </div>

          {monthlyMode === 'day' && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-open-sans font-light text-gray-600">Каждый</span>
              <input
                type="number"
                min="-1"
                max="28"
                value={value.dayOfMonth ?? 1}
                onChange={(e) => set({ dayOfMonth: Number(e.target.value) })}
                className={`w-16 text-center ${inputCls()}`}
              />
              <span className="text-sm font-open-sans font-light text-gray-400">(-1 = последний)</span>
            </div>
          )}

          {monthlyMode === 'week' && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-open-sans font-light text-gray-600">Каждый</span>
              <select
                value={value.weekOfMonth ?? 1}
                onChange={(e) => set({ weekOfMonth: Number(e.target.value) })}
                className={inputCls()}
              >
                {WEEK_OF_MONTH.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
              <select
                value={value.dayOfWeek ?? 'MONDAY'}
                onChange={(e) => set({ dayOfWeek: e.target.value as DayOfWeek })}
                className={inputCls()}
              >
                {DAYS_OF_WEEK.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <span className="text-sm font-open-sans font-light text-gray-600">месяца</span>
            </div>
          )}
        </div>
      )}

      {value.frequency === 'YEARLY' && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-open-sans font-light text-gray-600">Каждый год</span>
          <input
            type="number"
            min="1"
            max="31"
            value={value.dayOfMonth ?? 1}
            onChange={(e) => set({ dayOfMonth: Number(e.target.value) })}
            className={`w-14 text-center ${inputCls()}`}
          />
          <select
            value={value.monthOfYear ?? 1}
            onChange={(e) => set({ monthOfYear: Number(e.target.value) })}
            className={inputCls()}
          >
            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      )}

      {value.frequency !== 'ONCE' && (
        <p className="text-xs font-open-sans font-light text-gray-400 italic">{preview}</p>
      )}
    </div>
  )
}
