import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { BottomNav } from '../components/BottomNav'
import { Header } from '../components/Header'
import { Icon } from '../components/Chrome'
import { Drawer } from '../components/Overlays'
import { emptyPropertyCopy } from '../data'
import { images } from '../icons'
import { useApp } from '../context'
import { api } from '../api/client'
import type { PropertyRecord } from '../types'

export function Properties() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { properties, toast } = useApp()
  const [menu, setMenu] = useState(false)

  return (
    <section className="screen">
      <Header title="Property" onMenu={() => setMenu(true)} />
      <div className="screen-body">
        {properties.length ? (
          <div className="list">
            {properties.map((property) => (
              <button
                key={property.id}
                type="button"
                className="card"
                onClick={() => navigate(`/properties/${property.id}`)}
              >
                <h3>{property.address}</h3>
                <p className="type">{property.type}</p>
                <p className="addr">
                  {property.postTown} {property.postCode}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty">
            <Icon name="info" size={36} />
            <h2>{emptyPropertyCopy.title}</h2>
            <p>{emptyPropertyCopy.body}</p>
          </div>
        )}
      </div>
      <button
        className="fab"
        type="button"
        onClick={() => navigate('/properties/new')}
        aria-label="Add property"
      >
        <Icon name="plus" />
      </button>
      <BottomNav active="property" />
      {toast ? <div className="toast">{toast}</div> : null}
      <Drawer open={menu} onClose={() => setMenu(false)} onLogout={logout} />
    </section>
  )
}

export function AddProperty() {
  const navigate = useNavigate()
  const { addProperty } = useApp()
  const [type, setType] = useState('My property')
  const [address, setAddress] = useState('')
  const [town, setTown] = useState('')
  const [code, setCode] = useState('')
  const ready = Boolean(address && town && code)

  return (
    <section className="screen">
      <Header title="Add property" back />
      <div className="screen-body">
        <div className="form">
          <div className="form-block">
            <h2 className="section-title">Property details</h2>
            <div className="field">
              <label>Type</label>
              <input className="control" value={type} onChange={(e) => setType(e.target.value)} />
            </div>
            <div className="field">
              <label>
                Address <span className="req">*</span>
              </label>
              <input
                className="control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Type Here..."
              />
            </div>
            <div className="row-2">
              <div className="field">
                <label>
                  Post town <span className="req">*</span>
                </label>
                <input className="control" value={town} onChange={(e) => setTown(e.target.value)} />
              </div>
              <div className="field">
                <label>
                  Post code <span className="req">*</span>
                </label>
                <input className="control" value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="form-block">
            <h2 className="section-title">Property spaces</h2>
            <button className="add-image" type="button">
              <Icon name="camera" />
              Add
            </button>
          </div>
        </div>
      </div>
      <div className="footer-bar">
        <button
          className={`btn ${ready ? 'primary' : 'disabled'}`}
          disabled={!ready}
          type="button"
          onClick={() => {
            void addProperty({
              type,
              address,
              postTown: town,
              postCode: code,
              spaces: [
                { name: 'Lounging Area', note: 'Farmer Meeting' },
                { name: 'Bedroom 1', note: 'Farmer Meeting' },
                { name: 'Guestroom', note: 'Farmer Meeting' },
                { name: 'Bathroom', note: 'Farmer Meeting' },
              ],
            }).then((created) => navigate(`/properties/${created.id}`))
          }}
        >
          Add property
        </button>
        <div className="home-indicator">
          <span />
        </div>
      </div>
    </section>
  )
}

export function ViewProperty() {
  const { id } = useParams()
  const { properties } = useApp()
  const [loaded, setLoaded] = useState<PropertyRecord | null>(null)
  useEffect(() => {
    if (!id) return
    void api<{ property: PropertyRecord }>(`/properties/${id}`).then((res) => setLoaded(res.property))
  }, [id])
  const property = loaded || properties.find((item) => item.id === id) || properties[0]
  if (!property) {
    return (
      <section className="screen">
        <Header title="View property" back />
        <p className="form">No property added yet.</p>
      </section>
    )
  }

  return (
    <section className="screen">
      <Header title="View property" back />
      <div className="screen-body">
        <div style={{ height: 200, overflow: 'hidden' }}>
          <img src={images.leak2} alt="" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
        </div>
        <div className="block" style={{ paddingTop: 24 }}>
          <h2>Property address</h2>
          <dl className="kv">
            <dt>Type:</dt>
            <dd>{property.type}</dd>
            <dt>Address:</dt>
            <dd>{property.address}</dd>
            <dt>Post town:</dt>
            <dd>{property.postTown}</dd>
            <dt>Post code:</dt>
            <dd>{property.postCode}</dd>
          </dl>
        </div>
        <div className="divider" />
        <div className="block">
          <h2>Property spaces</h2>
          {property.spaces.map((space) => (
            <div className="space-row" key={space.name}>
              <div className="space-thumb">
                <img src={images.leak3} alt="" />
              </div>
              <div>
                <strong>{space.name}</strong>
                <p className="date">{space.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
