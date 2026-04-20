'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start justify-between gap-3 px-4 py-3 shadow-lg pointer-events-auto
              ${toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : ''}
              ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : ''}
              ${toast.type === 'info' ? 'bg-white border border-gray-200 text-gray-800' : ''}
            `}
          >
            <span className="text-sm font-open-sans font-light">{toast.message}</span>
            <button
              onClick={() => remove(toast.id)}
              className="text-current opacity-50 hover:opacity-100 bg-transparent border-none cursor-pointer p-0 leading-none shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
