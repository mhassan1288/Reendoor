import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../api/client'
import { homeFor } from '../roles'
import { useAuth } from '../auth'
import { HomeIndicator, StatusBar } from '../components/Chrome'

export function Splash() {
  const navigate = useNavigate()
  const { user, ready } = useAuth()

  useEffect(() => {
    if (!ready) return
    const timer = window.setTimeout(() => {
      if (user) navigate(homeFor(user.role))
      else if (getToken()) navigate('/queues')
      else navigate('/signin')
    }, 1600)
    return () => window.clearTimeout(timer)
  }, [navigate, ready, user])

  return (
    <section className="screen splash">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <StatusBar light />
      </div>
      <h1>Rendoor</h1>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <HomeIndicator light />
      </div>
    </section>
  )
}
