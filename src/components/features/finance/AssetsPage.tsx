'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/auth'
import { apiGetAssets, apiCreateAsset, apiUpdateAsset, apiDeleteAsset } from '@/lib/finance-api'
import type { AssetResponse, AssetType, Liquidity } from '@/types/finance'
import { formatMoney, formatDate, ASSET_TYPE_LABELS, LIQUIDITY_LABELS } from './formatters'
import { useToast } from './ToastContext'

const LIQUIDITY_COLORS: Record<Liquidity, string> = {
  HIGH: 'text-green-600 border-green-200',
  MEDIUM: 'text-yellow-600 border-yellow-200',
  LOW: 'text-gray-500 border-gray-200',
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

const schema = z.object({
  name: z.string().min(1, 'Введите название'),
  type: z.enum(['SECURITIES', 'PRECIOUS_METALS', 'REAL_ESTATE', 'VEHICLE', 'OTHER']),
  currentValue: z.number().positive(),
  currency: z.string().min(3),
  liquidity: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  acquiredAt: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function AssetForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: AssetResponse
  onSave: () => void
  onCancel: () => void
}) {
  const { token } = useAuthStore()
  const { addToast } = useToast()

  const { register, handleSubmit, watch, setValue, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          name: initial.name,
          type: initial.type,
          currentValue: initial.currentValue,
          currency: initial.currency,
          liquidity: initial.liquidity,
          acquiredAt: initial.acquiredAt ?? '',
          notes: initial.notes ?? '',
        }
      : { type: 'SECURITIES', currency: 'RUB', liquidity: 'HIGH' },
  })

  const liquidity = watch('liquidity') as Liquidity

  const onSubmit = async (values: FormValues) => {
    if (!token) return
    try {
      const res = initial
        ? await apiUpdateAsset(token, initial.id, values)
        : await apiCreateAsset(token, values as Parameters<typeof apiCreateAsset>[1])
      if (res.success) {
        addToast(initial ? 'Актив обновлён' : 'Актив добавлен', 'success')
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
        <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Название</label>
        <input {...register('name')} className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Тип</label>
          <select {...register('type')} className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent">
            {(Object.entries(ASSET_TYPE_LABELS) as [AssetType, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
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

      <div>
        <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Текущая стоимость</label>
        <input {...register('currentValue', { valueAsNumber: true })} type="number" step="0.01" min="0" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
        {errors.currentValue && <p className="text-xs text-red-500 mt-1">{errors.currentValue.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-2">Ликвидность</label>
        <div className="flex gap-2">
          {(['HIGH', 'MEDIUM', 'LOW'] as Liquidity[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setValue('liquidity', l)}
              className={`flex-1 py-2 text-xs font-open-sans font-light border transition-colors cursor-pointer
                ${liquidity === l ? 'bg-black text-white border-black' : 'bg-transparent text-gray-600 border-gray-200 hover:border-black'}`}
            >
              {LIQUIDITY_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Дата покупки</label>
          <input {...register('acquiredAt')} type="date" className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-open-sans font-light uppercase tracking-[0.12em] text-gray-400 mb-1">Заметки</label>
        <textarea {...register('notes')} rows={2} className="w-full border-b border-gray-200 pb-2 font-open-sans text-sm font-light outline-none focus:border-black transition-colors bg-transparent resize-none" />
      </div>

      {errors.root && <p className="text-xs text-red-500">{errors.root.message}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="flex-1 bg-black text-white font-open-sans font-light text-sm py-3 cursor-pointer border-none hover:bg-gray-900 transition-colors disabled:opacity-50">
          {isSubmitting ? '...' : initial ? 'Сохранить' : 'Добавить'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-transparent text-black font-open-sans font-light text-sm py-3 cursor-pointer border border-gray-200 hover:border-black transition-colors">
          Отмена
        </button>
      </div>
    </form>
  )
}

export function AssetsPage() {
  const { token } = useAuthStore()
  const { addToast } = useToast()

  const [assets, setAssets] = useState<AssetResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<AssetResponse | null>(null)
  const [deleting, setDeleting] = useState<AssetResponse | null>(null)
  const [deletingInProgress, setDeletingInProgress] = useState(false)

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await apiGetAssets(token)
      if (res.success && res.data) setAssets(res.data)
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
      const res = await apiDeleteAsset(token, deleting.id)
      if (res.success) {
        addToast('Актив удалён', 'success')
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

  const totalByCurrency = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.currency] = (acc[a.currency] ?? 0) + a.currentValue
    return acc
  }, {})

  return (
    <div className="bg-white p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-eurostile text-3xl">Имущество</h1>
        <button onClick={() => setShowForm(true)} className="text-sm font-open-sans font-light text-white bg-black px-4 py-2 border-none cursor-pointer hover:bg-gray-900 transition-colors">
          + Добавить
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
              <div className="h-7 bg-gray-100 rounded w-32" />
            </div>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-16 border border-gray-100">
          <p className="text-sm font-open-sans font-light text-gray-400">Активов нет</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {assets.map((asset) => (
              <div key={asset.id} className="p-5 border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-open-sans font-medium text-gray-800 text-sm">{asset.name}</p>
                    <p className="text-xs font-open-sans font-light text-gray-400 mt-0.5">{ASSET_TYPE_LABELS[asset.type]}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(asset)} className="text-xs font-open-sans font-light text-gray-400 hover:text-black transition-colors bg-transparent border-none cursor-pointer p-0">Изм.</button>
                    <button onClick={() => setDeleting(asset)} className="text-xs font-open-sans font-light text-gray-400 hover:text-red-600 transition-colors bg-transparent border-none cursor-pointer p-0">Удалить</button>
                  </div>
                </div>
                <p className="font-eurostile text-2xl leading-none text-gray-900 mb-2">
                  {formatMoney(asset.currentValue, asset.currency)}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-open-sans font-light px-2 py-0.5 border ${LIQUIDITY_COLORS[asset.liquidity]}`}>
                    {LIQUIDITY_LABELS[asset.liquidity]}
                  </span>
                  {asset.acquiredAt && (
                    <span className="text-xs font-open-sans font-light text-gray-400">{formatDate(asset.acquiredAt)}</span>
                  )}
                </div>
                {asset.notes && <p className="text-xs font-open-sans font-light text-gray-400 mt-2">{asset.notes}</p>}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4">
            {Object.entries(totalByCurrency).map(([currency, total]) => (
              <div key={currency} className="flex justify-between items-center py-1">
                <span className="text-sm font-open-sans font-light text-gray-600">Всего ({currency}):</span>
                <span className="font-eurostile text-xl text-gray-900">{formatMoney(total, currency)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <Modal title="Новый актив" onClose={() => setShowForm(false)}>
          <AssetForm onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Редактировать актив" onClose={() => setEditing(null)}>
          <AssetForm initial={editing} onSave={() => { setEditing(null); load() }} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {deleting && (
        <Modal title="Удалить актив?" onClose={() => setDeleting(null)}>
          <p className="text-sm font-open-sans font-light text-gray-600 mb-6">«{deleting.name}» будет удалён безвозвратно.</p>
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
