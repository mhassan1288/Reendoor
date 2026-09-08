import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth'
import { StatusPill } from '../components/Cards'
import { HomeIndicator, Icon } from '../components/Chrome'
import { Button } from '../components/Form'
import { Header } from '../components/Header'
import { useApp } from '../context'
import { images } from '../icons'
import type { ServiceRequest } from '../types'

export function ViewRequest() {
  const { id } = useParams()
  const { user } = useAuth()
  const { requests, acceptQuote, rejectQuote, addComment, toast } = useApp()
  const [detail, setDetail] = useState<ServiceRequest | null>(null)
  const [tab, setTab] = useState('Service info')
  const [activity, setActivity] = useState<'Comments' | 'History'>('Comments')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!id) return
    const cached = requests.find((item) => item.id === id) || null
    setDetail(cached)
    api<{ request: ServiceRequest }>(`/requests/${id}`)
      .then((res) => setDetail(res.request))
      .catch(() => undefined)
  }, [id, requests])

  const request = detail
  if (!request) {
    return (
      <section className="screen">
        <Header title="View service request" back />
        <p className="form">Request not found.</p>
      </section>
    )
  }

  const comments = request.comments ?? []
  const history = request.activities ?? []
  const showUpgrade = user?.role === 'owner_free'

  return (
    <section className="screen">
      <Header
        title="View service request"
        back
        tabs={['Service info', 'Activity']}
        activeTab={tab}
        onTab={setTab}
      />
      <div className="screen-body">
        {tab === 'Service info' ? (
          <div className="detail">
            <div className="detail-head">
              <h1>{request.title}</h1>
              <p className="code">{request.code}</p>
              <p className="meta">
                Created on - <b>{request.createdAt}</b>
              </p>
              <div className="status-line">
                Status - <StatusPill status={request.status} />
              </div>
            </div>

            {request.status === 'Quoted' || request.quoteAmount ? (
              <>
                <div className="divider" />
                <div className="block">
                  <h2>Service quotation</h2>
                  <div className="quote-file">
                    <div className="quote-preview" />
                    <div className="quote-meta">
                      <div>
                        <p>QuotationFile.PDF</p>
                        <small>1mb</small>
                      </div>
                    </div>
                    <div className="quote-price">
                      ${request.quoteAmount}
                      <span>Incl tax</span>
                    </div>
                  </div>
                  {request.quoteAccepted ? (
                    <p className="prio">Quote Accepted</p>
                  ) : request.quoteRejected ? (
                    <p className="prio">Quote Rejected</p>
                  ) : request.status === 'Quoted' ? (
                    <div className="actions-2">
                      <Button variant="reject" onClick={() => void rejectQuote(request.id)}>
                        Reject
                      </Button>
                      <Button variant="accept" onClick={() => void acceptQuote(request.id)}>
                        Accept
                      </Button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}

            <div className="divider" />
            <div className="block">
              <h2>Service details</h2>
              <dl className="kv">
                <dt>Service type:</dt>
                <dd>{request.type}</dd>
                <dt>Summary:</dt>
                <dd>{request.title}</dd>
                <dt>Description:</dt>
                <dd>{request.description}</dd>
                <dt>Images:</dt>
                <dd>
                  <div className="thumbs">
                    {(request.images?.length ? request.images : [images.leak1, images.leak2, images.leak3]).map((url) => (
                      <span className="thumb" key={url}>
                        <img src={url} alt="" />
                      </span>
                    ))}
                  </div>
                </dd>
                <dt>Priority:</dt>
                <dd>{request.priority}</dd>
              </dl>
            </div>
            <div className="divider" />
            <div className="block">
              <h2>Timelines</h2>
              <div className="timeline">
                <div className="chip">
                  {request.date} - <span>Service Request Created</span>
                </div>
                <div className="chip">
                  N/A - <span>Servicing Started</span>
                </div>
                <div className="chip">
                  N/A - <span>Servicing Ended</span>
                </div>
              </div>
            </div>
            <div className="divider" />
            <div className="block">
              <h2>Property address</h2>
              <dl className="kv">
                <dt>Type:</dt>
                <dd>My property</dd>
                <dt>Address:</dt>
                <dd>{request.address}</dd>
                <dt>Post town:</dt>
                <dd>{request.postTown}</dd>
                <dt>Post code:</dt>
                <dd>{request.postCode}</dd>
              </dl>
            </div>
          </div>
        ) : (
          <div className="form">
            <div className="subtabs">
              {(['Comments', 'History'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`subtab${activity === item ? ' active' : ''}`}
                  onClick={() => setActivity(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            {activity === 'Comments' ? (
              comments.length ? (
                comments.map((item, i) => (
                  <article className="comment" key={item.id}>
                    {i > 0 ? <div className="hr" /> : null}
                    <div className="comment-h">
                      <div className="who">
                        <span className="avatar">{item.initials}</span>
                        <strong>{item.author}</strong>
                      </div>
                      <span className="date">{item.date}</span>
                    </div>
                    <p>{item.body}</p>
                  </article>
                ))
              ) : (
                <p className="addr">No comments yet.</p>
              )
            ) : history.length ? (
              history.map((item) => (
                <div className="history-item" key={item.id}>
                  <div className="who">
                    <span className="avatar">{item.initials}</span>
                    <div>
                      <h4>{item.author}</h4>
                      <small>{item.date}</small>
                    </div>
                  </div>
                  <p>{item.message}</p>
                </div>
              ))
            ) : (
              <p className="addr">No history yet.</p>
            )}
          </div>
        )}
      </div>
      {tab === 'Service info' ? (
        <>
          <button className="fab outline" type="button" aria-label="Edit" style={{ bottom: showUpgrade ? 172 : 112 }}>
            <Icon name="edit" />
          </button>
          {showUpgrade ? (
            <div className="footer-bar">
              <div className="upgrade">
                <Icon name="info" />
                <p>
                  <b>Upgrade</b> to the 'Property Management Pro' to access more features
                </p>
              </div>
              <Button variant="gradient">Upgrade to Pro</Button>
              <HomeIndicator />
            </div>
          ) : (
            <div className="footer-bar">
              <HomeIndicator />
            </div>
          )}
        </>
      ) : (
        <div className="footer-bar">
          <div className="composer">
            <Icon name="plus" size={16} />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Type here..."
            />
            <button
              className="send"
              type="button"
              aria-label="Send"
              onClick={() => {
                if (!note.trim()) return
                void addComment(request.id, note).then((updated) => {
                  setDetail(updated)
                  setNote('')
                })
              }}
            >
              <Icon name="arrowBack" size={18} />
            </button>
          </div>
          <HomeIndicator />
        </div>
      )}
      {toast ? <div className="toast">{toast}</div> : null}
    </section>
  )
}
