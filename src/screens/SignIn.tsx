import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { homeFor } from '../roles'
import { useAuth } from '../auth'
import { HomeIndicator, Icon, StatusBar } from '../components/Chrome'
import { Button, Field, TextInput } from '../components/Form'

type InstallPrompt = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function SignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')
  const [installEvent, setInstallEvent] = useState<InstallPrompt | null>(null)
  const standalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  const ios = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as InstallPrompt)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const emailError = submitted && !email.includes('@')
  const passError = submitted && password.length < 4
  const ready = email.includes('@') && password.length >= 4

  async function onSubmit() {
    setSubmitted(true)
    setServerError('')
    if (!email.includes('@') || password.length < 4) return
    try {
      const user = await login(email.trim().toLowerCase(), password)
      navigate(homeFor(user.role))
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Sign in failed')
    }
  }

  return (
    <section className="screen">
      <StatusBar />
      <div className="auth">
        <h1>Welcome to Rendoor!</h1>
        <p className="sub">Sign In Your Account</p>
        <Field label="Email" error={emailError ? 'Error message here.' : undefined}>
          <TextInput
            value={email}
            onChange={setEmail}
            placeholder="eg. John_Doe@gmail.com"
            error={emailError}
          />
        </Field>
        <Field label="Password" error={passError ? 'Error message here.' : serverError || undefined}>
          <TextInput
            value={password}
            onChange={setPassword}
            placeholder="Type here"
            type={show ? 'text' : 'password'}
            error={passError || Boolean(serverError)}
            trailing={
              <button type="button" onClick={() => setShow((v) => !v)} aria-label="Toggle password">
                <Icon name="visibilityOff" />
              </button>
            }
          />
        </Field>
        <button className="link" type="button">
          Forgot Password?
        </button>
        <p className="date" style={{ marginTop: 16 }}>
          Demo: oliver@ / pro@ / tenant@ / contractor@ / admin@rendoor.com — password
        </p>
        {!standalone && installEvent ? (
          <button
            className="link"
            type="button"
            style={{ marginTop: 12 }}
            onClick={() => {
              void installEvent.prompt()
              void installEvent.userChoice.then(() => setInstallEvent(null))
            }}
          >
            Install app
          </button>
        ) : null}
        {!standalone && ios && !installEvent ? (
          <p className="date" style={{ marginTop: 12 }}>
            iPhone: tap Share, then Add to Home Screen
          </p>
        ) : null}
      </div>
      <div className="auth-actions">
        <Button variant={ready ? 'primary' : 'disabled'} disabled={!ready} onClick={() => void onSubmit()}>
          Sign In
        </Button>
      </div>
      <HomeIndicator />
    </section>
  )
}
