'use client'

import { useApp } from '@/lib/store'
import { Toast } from '@/components/ui'

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp()
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onDismiss={() => dismissToast(t.id)} />
      ))}
    </div>
  )
}
