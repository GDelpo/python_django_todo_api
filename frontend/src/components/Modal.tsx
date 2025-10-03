import React from 'react'
import { Button } from './Button'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export const Modal: React.FC<Props> = ({ open, onClose, title, children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-white rounded-xl p-4 w-[min(560px,92vw)] shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="m-0 text-lg font-semibold">{title}</h3>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  )
}
