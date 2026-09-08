import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth'
import { BottomNav } from '../components/BottomNav'
import { Header } from '../components/Header'
import { Icon } from '../components/Chrome'
import { Drawer } from '../components/Overlays'
import { useApp } from '../context'

type Person = { id: string; name: string; email?: string; phone?: string; company?: string; trade?: string; active?: boolean; category?: string; roleName?: string }

function listFrom(res: Record<string, unknown>) {
  const arr = Object.values(res).find((value) => Array.isArray(value))
  return (arr as Person[]) || []
}

function PeopleList({
  title,
  singular,
  path,
  fields,
  nav,
}: {
  title: string
  singular: string
  path: string
  fields: string[]
  nav: 'property' | 'profile' | 'queues'
}) {
  const { logout } = useAuth()
  const { flash, toast } = useApp()
  const [menu, setMenu] = useState(false)
  const [items, setItems] = useState<Person[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  function load() {
    void api<Record<string, unknown>>(path).then((res) => setItems(listFrom(res)))
  }

  useEffect(load, [path])

  return (
    <section className="screen">
      <Header title={title} onMenu={() => setMenu(true)} />
      <div className="screen-body">
        <div className="list">
          {items.map((item) => (
            <div className="card" key={item.id}>
              <h3>{item.name}</h3>
              <p className="type">{item.company || item.trade || item.roleName || item.category || item.email}</p>
              <p className="addr">{item.phone || item.email}</p>
              {item.active === false ? <span className="prio">Inactive</span> : null}
            </div>
          ))}
        </div>
      </div>
      <button className="fab" type="button" aria-label="Add" onClick={() => setOpen(true)}>
        <Icon name="plus" />
      </button>
      {open ? (
        <>
          <button className="overlay" type="button" onClick={() => setOpen(false)} />
          <div className="sheet">
            <div className="handle" />
            <h2 className="section-title">Add {singular}</h2>
            {fields.map((field) => (
              <div className="field" key={field}>
                <label>{field}</label>
                <input
                  className="control"
                  value={form[field] || ''}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                />
              </div>
            ))}
            <button
              className="btn primary"
              type="button"
              onClick={() => {
                const body: Record<string, string> = {
                  name: form.Name || form.name || 'New',
                  email: form.Email || '',
                  phone: form.Phone || '',
                  company: form.Company || '',
                  trade: form.Trade || '',
                  category: form.Category || '',
                  roleName: form.Role || 'Manager',
                }
                void api(path, { method: 'POST', body: JSON.stringify(body) }).then(() => {
                  flash(`${title} updated`)
                  setOpen(false)
                  setForm({})
                  load()
                })
              }}
            >
              Save
            </button>
            <div className="home-indicator">
              <span />
            </div>
          </div>
        </>
      ) : null}
      <BottomNav active={nav} />
      {toast ? <div className="toast">{toast}</div> : null}
      <Drawer open={menu} onClose={() => setMenu(false)} onLogout={logout} />
    </section>
  )
}

export function Contractors() {
  return (
    <PeopleList
      title="Contractors"
      singular="contractor"
      path="/contractors"
      fields={['Name', 'Company', 'Trade', 'Email', 'Phone']}
      nav="queues"
    />
  )
}

export function Tenants() {
  return (
    <PeopleList title="Tenants" singular="tenant" path="/tenants" fields={['Name', 'Email', 'Phone']} nav="property" />
  )
}

export function Inventory() {
  return (
    <PeopleList
      title="Inventory"
      singular="inventory item"
      path="/inventory"
      fields={['Name', 'Category']}
      nav="property"
    />
  )
}

export function Accounts() {
  return (
    <PeopleList
      title="Accounts"
      singular="user"
      path="/accounts/users"
      fields={['Name', 'Email', 'Role']}
      nav="profile"
    />
  )
}

export function Contacts() {
  return (
    <PeopleList
      title="Contacts"
      singular="contact"
      path="/contacts"
      fields={['Name', 'Email', 'Phone', 'Company']}
      nav="profile"
    />
  )
}

export function SubContractors() {
  return (
    <PeopleList
      title="Sub-contractors"
      singular="sub-contractor"
      path="/contractors"
      fields={['Name', 'Company', 'Trade', 'Email']}
      nav="profile"
    />
  )
}
