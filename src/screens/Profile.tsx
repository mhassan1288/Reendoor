import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { roleLabel } from '../roles'
import { useAuth } from '../auth'
import { BottomNav } from '../components/BottomNav'
import { Header } from '../components/Header'
import { Icon } from '../components/Chrome'
import { Drawer } from '../components/Overlays'
import { images } from '../icons'
import { useApp } from '../context'

export function Profile() {
  const { user, logout } = useAuth()
  const { toast, flash } = useApp()
  const [menu, setMenu] = useState(false)
  if (!user) return null

  return (
    <section className="screen">
      <Header title="Profile" onMenu={() => setMenu(true)} />
      <div className="screen-body">
        <div className="profile">
          <div className="profile-h">
            <div className="photo">
              <img src={images.leak2} alt="" />
            </div>
            <div>
              <h2>{user.name}</h2>
              <p className="role">{roleLabel(user.role)}</p>
            </div>
          </div>
          <div className="pinfo">
            <p>
              <span>First Name</span>
              <b>{user.firstName}</b>
            </p>
            <p>
              <span>Last Name</span>
              <b>{user.lastName}</b>
            </p>
            <p>
              <span>Email</span>
              <b>{user.email}</b>
            </p>
            <p>
              <span>Phone Number</span>
              <b>{user.phone || '—'}</b>
            </p>
          </div>
        </div>
      </div>
      <button className="fab outline" type="button" aria-label="Edit" onClick={() => flash('Profile updated')}>
        <Icon name="edit" />
      </button>
      <BottomNav active="profile" />
      {toast ? <div className="toast">{toast}</div> : null}
      <Drawer open={menu} onClose={() => setMenu(false)} onLogout={logout} />
    </section>
  )
}

export function Feedback() {
  const navigate = useNavigate()
  const { flash } = useApp()
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')

  return (
    <section className="screen">
      <Header title="Help & Feedback" back />
      <div className="screen-body">
        <div className="form">
          <h2 className="section-title">Help us refine our product!</h2>
          <p className="addr" style={{ marginBottom: 16 }}>
            Select the emoji that best describes your experience
          </p>
          <div className="actions-2" style={{ marginBottom: 24 }}>
            {['Sad', 'Okay', 'Happy'].map((item) => (
              <button
                key={item}
                type="button"
                className={`choice${mood === item ? ' on' : ''}`}
                onClick={() => setMood(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="field">
            <label>What could be improved?</label>
            <textarea
              className="control"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Type Here..."
            />
          </div>
        </div>
      </div>
      <div className="footer-bar">
        <button
          className="btn primary"
          type="button"
          onClick={() => {
            if (!mood) return
            void api('/feedback', { method: 'POST', body: JSON.stringify({ mood, note }) }).then(() => {
              flash('Feedback sent')
              navigate(-1)
            })
          }}
        >
          Submit feedback
        </button>
        <div className="home-indicator">
          <span />
        </div>
      </div>
    </section>
  )
}
