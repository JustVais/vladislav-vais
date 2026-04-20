import type {
  AccountType,
  Category,
  AssetType,
  Liquidity,
  LoanStatus,
  PaymentStatus,
  RecurrenceRule,
  DayOfWeek,
} from '@/types/finance'

const CURRENCY_SYMBOLS: Record<string, string> = { RUB: '₽', USD: '$', EUR: '€' }

export function formatMoney(amount: number, currency = 'RUB'): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  const formatted = Math.abs(amount).toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return `${formatted} ${symbol}`
}

export function formatMoneySign(amount: number, currency = 'RUB'): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  const formatted = Math.abs(amount).toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : ''
  return `${sign}${formatted} ${symbol}`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CASH: 'Наличные',
  DEBIT: 'Дебетовый',
  CREDIT_CARD: 'Кредитная карта',
  CREDIT_LOAN: 'Кредит',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  SALARY: 'Зарплата',
  DIVIDEND: 'Дивиденды',
  INTEREST: 'Банковский процент',
  LOAN_PAYMENT: 'Платёж по кредиту',
  CARD_PAYMENT: 'Платёж по карте',
  LOAN_ISSUED: 'Выдан займ',
  LOAN_RECEIVED: 'Возврат займа',
  TRANSFER: 'Перевод',
  OTHER: 'Прочее',
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  SECURITIES: 'Ценные бумаги',
  PRECIOUS_METALS: 'Драгметаллы',
  REAL_ESTATE: 'Недвижимость',
  VEHICLE: 'Транспорт',
  OTHER: 'Прочее',
}

export const LIQUIDITY_LABELS: Record<Liquidity, string> = {
  HIGH: 'Высокая',
  MEDIUM: 'Средняя',
  LOW: 'Низкая',
}

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  ACTIVE: 'Активен',
  PAID: 'Закрыт',
  OVERDUE: 'Просрочен',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Ожидает',
  PAID: 'Оплачен',
  OVERDUE: 'Просрочен',
}

const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'пн',
  TUESDAY: 'вт',
  WEDNESDAY: 'ср',
  THURSDAY: 'чт',
  FRIDAY: 'пт',
  SATURDAY: 'сб',
  SUNDAY: 'вс',
}

const MONTH_LABELS: Record<number, string> = {
  1: 'января', 2: 'февраля', 3: 'марта', 4: 'апреля',
  5: 'мая', 6: 'июня', 7: 'июля', 8: 'августа',
  9: 'сентября', 10: 'октября', 11: 'ноября', 12: 'декабря',
}

const WEEK_OF_MONTH_LABELS: Record<number, string> = {
  1: 'первый', 2: 'второй', 3: 'третий', 4: 'четвёртый', '-1': 'последний',
}

const DAY_OF_WEEK_FULL: Record<DayOfWeek, string> = {
  MONDAY: 'понедельник',
  TUESDAY: 'вторник',
  WEDNESDAY: 'среда',
  THURSDAY: 'четверг',
  FRIDAY: 'пятница',
  SATURDAY: 'суббота',
  SUNDAY: 'воскресенье',
}

export function formatRecurrence(rule: RecurrenceRule): string {
  const { frequency, interval = 1, dayOfMonth, daysOfWeek, weekOfMonth, dayOfWeek, monthOfYear } = rule
  switch (frequency) {
    case 'ONCE':
      return 'Однократно'
    case 'DAILY':
      return interval === 1 ? 'Каждый день' : `Каждые ${interval} дней`
    case 'WEEKLY': {
      const days = daysOfWeek?.map((d) => DAY_OF_WEEK_LABELS[d]).join(', ') ?? ''
      return `Каждую неделю${days ? `: ${days}` : ''}`
    }
    case 'MONTHLY':
      if (weekOfMonth !== undefined && dayOfWeek) {
        const week = WEEK_OF_MONTH_LABELS[weekOfMonth] ?? weekOfMonth
        const dow = DAY_OF_WEEK_FULL[dayOfWeek]
        return `Каждый ${week} ${dow} месяца`
      }
      if (dayOfMonth === -1) return 'Каждый последний день месяца'
      return `Каждый месяц ${dayOfMonth ?? ''}-го`
    case 'YEARLY':
      if (dayOfMonth && monthOfYear) {
        return `Ежегодно ${dayOfMonth} ${MONTH_LABELS[monthOfYear]}`
      }
      return 'Ежегодно'
    default:
      return ''
  }
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function startOfMonthISO(): string {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().split('T')[0]
}

export function startOfYearISO(): string {
  const d = new Date()
  d.setMonth(0, 1)
  return d.toISOString().split('T')[0]
}

export function endOfYearISO(): string {
  const d = new Date()
  d.setMonth(11, 31)
  return d.toISOString().split('T')[0]
}
