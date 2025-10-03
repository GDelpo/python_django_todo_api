import React from 'react'
import { Button } from './Button'

type Props = {
  email: string
  username: string
  password: string
  onEmail: (v: string) => void
  onUsername: (v: string) => void
  onPassword: (v: string) => void
  onSubmit: () => void
}

export const FormRegister: React.FC<Props> = ({ email, username, password, onEmail, onUsername, onPassword, onSubmit }) => {
  return (
    <div className="flex gap-2 flex-wrap">
      <input className="border border-slate-300 rounded-md px-3 py-2" value={email} onChange={e => onEmail(e.target.value)} placeholder="email" />
      <input className="border border-slate-300 rounded-md px-3 py-2" value={username} onChange={e => onUsername(e.target.value)} placeholder="username" />
      <input className="border border-slate-300 rounded-md px-3 py-2" value={password} onChange={e => onPassword(e.target.value)} placeholder="password" type="password" />
      <Button onClick={() => { onEmail('test@example.com'); onUsername('test'); onPassword('TestPassword123!') }}>Autocompletar</Button>
      <Button onClick={onSubmit}>Registrarme</Button>
    </div>
  )
}
