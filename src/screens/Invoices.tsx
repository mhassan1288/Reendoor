import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth'
import { BottomNav } from '../components/BottomNav'
import { Header } from '../components/Header'
import { Icon } from '../components/Chrome'
import { Drawer } from '../components/Overlays'
import { useApp } from '../context'
import type { InvoiceRecord } from '../types'

export function Invoices() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [menu, setMenu] = useState(false)
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])

  useEffect(() => {
    void api<{ invoices: InvoiceRecord[] }>('/invoices').then((res) => setInvoices(res.invoices))
  }, [])

  return (
    <section className="screen">
      <Header title="Invoices" onMenu={() => setMenu(true)} />
      <div className="screen-body">
        <div className="list">
          {invoices.map((invoice) => (
            <button
              key={invoice.id}
              type="button"
              className="card"
              onClick={() => navigate(`/invoices/${invoice.id}`)}
            >
              <h3>{invoice.name}</h3>
              <p className="type">{invoice.clientName}</p>
              <div className="card-foot">
                <span className={`pill ${invoice.status === 'Paid' ? 'accepted' : invoice.status === 'Overdue' ? 'open' : 'quoted'}`}>
                  {invoice.status}
                </span>
                <span className="date">{invoice.date}</span>
              </div>
              <p className="metric sm" style={{ marginTop: 8 }}>
                ${invoice.total}
              </p>
            </button>
          ))}
        </div>
      </div>
      <button className="fab" type="button" aria-label="Create invoice" onClick={() => navigate('/invoices/new')}>
        <Icon name="plus" />
      </button>
      <BottomNav active="invoices" />
      <Drawer open={menu} onClose={() => setMenu(false)} onLogout={logout} />
    </section>
  )
}

export function CreateInvoice() {
  const navigate = useNavigate()
  const { flash } = useApp()
  const [name, setName] = useState('INV-New')
  const [clientName, setClientName] = useState('')
  const [description, setDescription] = useState('Service')
  const [price, setPrice] = useState('200')

  return (
    <section className="screen">
      <Header title="Create invoice" back />
      <div className="screen-body">
        <div className="form">
          <div className="field">
            <label>Invoice number</label>
            <input className="control" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Client</label>
            <input className="control" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div className="field">
            <label>Item</label>
            <input className="control" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="field">
            <label>Amount</label>
            <input className="control" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="footer-bar">
        <button
          className="btn primary"
          type="button"
          onClick={() => {
            void api('/invoices', {
              method: 'POST',
              body: JSON.stringify({
                name,
                clientName,
                lines: [{ description, quantity: 1, unitPrice: Number(price) }],
              }),
            }).then(() => {
              flash('Invoice created')
              navigate('/invoices')
            })
          }}
        >
          Save
        </button>
        <div className="home-indicator">
          <span />
        </div>
      </div>
    </section>
  )
}

export function ViewInvoice() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState<InvoiceRecord | null>(null)
  useEffect(() => {
    if (!id) return
    void api<{ invoice: InvoiceRecord }>(`/invoices/${id}`).then((res) => setInvoice(res.invoice))
  }, [id])
  if (!invoice) {
    return (
      <section className="screen">
        <Header title="View invoice" back />
        <p className="form">Loading…</p>
      </section>
    )
  }
  return (
    <section className="screen">
      <Header title="View invoice" back />
      <div className="screen-body">
        <div className="form">
          <h2 className="section-title">{invoice.name}</h2>
          <span className={`pill ${invoice.status === 'Paid' ? 'accepted' : 'quoted'}`}>{invoice.status}</span>
          <dl className="kv" style={{ marginTop: 16 }}>
            <dt>Client</dt>
            <dd>{invoice.clientName}</dd>
            <dt>Total</dt>
            <dd>${invoice.total}</dd>
          </dl>
          {invoice.lines.map((line, i) => (
            <div className="cost-row" key={line.id || i}>
              <span>{line.description}</span>
              <b>${line.unitPrice}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
