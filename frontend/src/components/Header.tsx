import React from 'react'

export const Header => {
  return (
    <header className="flex items-center justify-between py-3">
      <strong className="text-xl">ToDo API – Demo</strong>
      {username ? <span className="text-slate-700">Hola, {username}</span> : <span />}
    </header>
  )
}
