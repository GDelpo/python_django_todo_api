import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export const Button: React.FC<Props> = ({ variant = 'primary', className = '', ...rest }) => {
  const base = 'inline-flex items-center justify-center rounded-md border text-sm font-semibold px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
  const map: Record<string, string> = {
    primary: 'bg-sky-500 text-white border-sky-600 hover:bg-sky-600',
    secondary: 'bg-slate-200 text-slate-900 border-slate-300 hover:bg-slate-300',
    ghost: 'bg-transparent text-slate-900 border-slate-300 hover:bg-slate-50',
  }
  return <button className={`${base} ${map[variant]} ${className}`} {...rest} />
}
