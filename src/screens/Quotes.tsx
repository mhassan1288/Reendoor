import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth'
import { BottomNav } from '../components/BottomNav'
import { Header } from '../components/Header'
import { Icon } from '../components/Chrome'
import { Drawer } from '../components/Overlays'
import { useApp } from '../context'
import type { QuoteRecord } from '../types'

export function Quotations() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { toast } = useApp()
  const [menu, setMenu] = useState(false)
  const [quotes, setQuotes] = useState<QuoteRecord[]>([])

  useEffect(() => {
    void api<{ quotes: QuoteRecord[] }>('/quotes').then((res) => setQuotes(res.quotes))
  }, [])

  return (
    <section className="screen">
      <Header title="Quotations" onMenu={() => setMenu(true)} />
      <div className="screen-body">
        <div className="list">
          {quotes.map((quote) => (
            <button key={quote.id} type="button" className="card" onClick={() => navigate(`/quotations/${quote.id}`)}>
              <h3>{quote.name}</h3>
              <p className="type">{quote.clientName || quote.companyName}</p>
              <div className="card-foot">
                <span className={`pill ${quote.status === 'Paid' ? 'accepted' : 'quoted'}`}>{quote.status}</span>
                <span className="date">{quote.date}</span>
              </div>
              <p className="metric sm" style={{ marginTop: 8 }}>
                ${quote.total}
              </p>
            </button>
          ))}
        </div>
      </div>
      <button className="fab" type="button" aria-label="Create quote" onClick={() => navigate('/quotations/new')}>
        <Icon name="plus" />
      </button>
      <BottomNav active="quotations" />
      {toast ? <div className="toast">{toast}</div> : null}
      <Drawer open={menu} onClose={() => setMenu(false)} onLogout={logout} />
    </section>
  )
}

export function CreateQuote() {
  const navigate = useNavigate()
  const { flash } = useApp()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('New quotation')
  const [companyName, setCompanyName] = useState('Lalaj Services')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [description, setDescription] = useState('Call-out')
  const [qty, setQty] = useState('1')
  const [price, setPrice] = useState('200')

  const subtotal = Number(qty || 0) * Number(price || 0)
  const vat = Math.round(subtotal * 0.2)
  const total = subtotal + vat

  return (
    <section className="screen">
      <Header title={`Create new quote · Step ${step} of 5`} back />
      <div className="screen-body">
        <div className="form">
          {step === 1 ? (
            <>
              <div className="field">
                <label>Quote name</label>
                <input className="control" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label>Company name</label>
                <input className="control" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div className="field">
                <label>Client name</label>
                <input className="control" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </div>
              <div className="field">
                <label>Client email</label>
                <input className="control" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
              </div>
            </>
          ) : null}
          {step === 2 ? (
            <>
              <div className="field">
                <label>Item description</label>
                <input className="control" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="row-2">
                <div className="field">
                  <label>Quantity</label>
                  <input className="control" value={qty} onChange={(e) => setQty(e.target.value)} />
                </div>
                <div className="field">
                  <label>Unit price</label>
                  <input className="control" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>
              <p className="metric sm">Sub-total ${subtotal}</p>
            </>
          ) : null}
          {step === 3 ? (
            <div className="field">
              <label>Notes and instructions</label>
              <textarea className="control" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          ) : null}
          {step >= 4 ? (
            <>
              <h2 className="section-title">Review</h2>
              <dl className="kv">
                <dt>Quote</dt>
                <dd>{name}</dd>
                <dt>Client</dt>
                <dd>{clientName}</dd>
                <dt>Item</dt>
                <dd>{description}</dd>
                <dt>Sub-total</dt>
                <dd>${subtotal}</dd>
                <dt>VAT</dt>
                <dd>${vat}</dd>
                <dt>Total</dt>
                <dd>${total}</dd>
              </dl>
            </>
          ) : null}
        </div>
      </div>
      <div className="footer-bar">
        <div className="actions-2">
          {step > 1 ? (
            <button className="btn outline" type="button" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          ) : (
            <span />
          )}
          {step < 5 ? (
            <button className="btn primary" type="button" onClick={() => setStep((s) => s + 1)}>
              Next
            </button>
          ) : (
            <button
              className="btn primary"
              type="button"
              onClick={() => {
                void api('/quotes', {
                  method: 'POST',
                  body: JSON.stringify({
                    name,
                    companyName,
                    clientName,
                    clientEmail,
                    notes,
                    vat,
                    lines: [{ description, quantity: Number(qty), unitPrice: Number(price) }],
                  }),
                }).then(() => {
                  flash('New quotation created')
                  navigate('/quotations')
                })
              }}
            >
              Save & Send
            </button>
          )}
        </div>
        <div className="home-indicator">
          <span />
        </div>
      </div>
    </section>
  )
}

export function ViewQuote() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { flash } = useApp()
  const [quote, setQuote] = useState<QuoteRecord | null>(null)

  useEffect(() => {
    if (!id) return
    void api<{ quote: QuoteRecord }>(`/quotes/${id}`).then((res) => setQuote(res.quote))
  }, [id])

  if (!quote) {
    return (
      <section className="screen">
        <Header title="View quote" back />
        <p className="form">Loading…</p>
      </section>
    )
  }

  return (
    <section className="screen">
      <Header title="View quote" back />
      <div className="screen-body">
        <div className="form">
          <h2 className="section-title">{quote.name}</h2>
          <span className={`pill ${quote.status === 'Paid' ? 'accepted' : 'quoted'}`}>{quote.status}</span>
          <dl className="kv" style={{ marginTop: 16 }}>
            <dt>Client</dt>
            <dd>{quote.clientName}</dd>
            <dt>Company</dt>
            <dd>{quote.companyName}</dd>
            <dt>Total</dt>
            <dd>${quote.total}</dd>
          </dl>
          <h2 className="section-title">Items</h2>
          {quote.lines.map((line, i) => (
            <div className="cost-row" key={line.id || i}>
              <span>
                {line.description} × {line.quantity}
              </span>
              <b>${line.unitPrice}</b>
            </div>
          ))}
        </div>
      </div>
      <div className="footer-bar">
        {quote.status === 'Paid' ? (
          <button
            className="btn primary"
            type="button"
            onClick={() => {
              void api(`/quotes/${quote.id}/invoice`, { method: 'POST' }).then(() => {
                flash('Invoice created')
                navigate('/invoices')
              })
            }}
          >
            Create Invoice
          </button>
        ) : (
          <div className="actions-2">
            <button className="btn outline" type="button">
              Edit
            </button>
            <button
              className="btn primary"
              type="button"
              onClick={() => {
                void api(`/quotes/${quote.id}/send`, { method: 'POST' }).then(() => {
                  flash('Quotation sent')
                  navigate('/quotations')
                })
              }}
            >
              Assign & Send
            </button>
          </div>
        )}
        <div className="home-indicator">
          <span />
        </div>
      </div>
    </section>
  )
}
