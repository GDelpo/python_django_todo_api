import React from 'react'

export const Card: React.FC<{ title?: string; children: React.ReactNode }>
  = ({ title, children }) => {
  return (
    <div className="border border-slate-300 rounded-xl p-4 bg-white shadow-sm">
      {title && <h3 className="mt-0 text-lg font-semibold mb-3">{title}</h3>}
      {children}
    </div>
  )
}
