import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { HomeIndicator, StatusBar } from '../components/Chrome'
import { Button, Field, TextInput } from '../components/Form'
import { api } from '../api/client'

export function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const ready = password.length >= 8 && password === confirm

  async function submit() {
    setError('')
    setMessage('')
    if (!ready) {
      setError('Passwords must match and contain at least 8 characters')
      return
    }
    try {
      const result = await api<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: params.get('token') || '', password }),
      })
      setMessage(result.message)
      window.setTimeout(() => navigate('/signin'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password')
    }
  }

  return (
    <section className="screen">
      <StatusBar />
      <div className="auth">
        <h1>Reset password</h1>
        <p className="sub">Choose a new password for your account.</p>
        <Field label="New password" error={error || undefined}>
          <TextInput value={password} onChange={setPassword} type="password" placeholder="At least 8 characters" />
        </Field>
        <Field label="Confirm password">
          <TextInput value={confirm} onChange={setConfirm} type="password" placeholder="Repeat password" />
        </Field>
        {message ? <p className="date">{message}</p> : null}
      </div>
      <div className="auth-actions">
        <Button variant={ready ? 'primary' : 'disabled'} disabled={!ready} onClick={() => void submit()}>
          Update password
        </Button>
      </div>
      <HomeIndicator />
    </section>
  )
}
