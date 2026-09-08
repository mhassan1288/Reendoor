import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HomeIndicator, Icon } from '../components/Chrome'
import { Header } from '../components/Header'
import { Button, Field, Select, TextInput } from '../components/Form'
import { priorities, serviceTypes } from '../data'
import { useApp } from '../context'

export function CreateRequest() {
  const navigate = useNavigate()
  const { addRequest, properties } = useApp()
  const [type, setType] = useState('')
  const [summary, setSummary] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('')
  const [location, setLocation] = useState<'mine' | 'other'>('mine')
  const [hasImage, setHasImage] = useState(false)
  const [busy, setBusy] = useState(false)

  const ready = Boolean(type && summary && priority && hasImage) && !busy
  const home = properties[0]

  const address = useMemo(
    () =>
      location === 'mine' && home
        ? { line: home.address, town: home.postTown, code: home.postCode }
        : location === 'mine'
          ? { line: '1 Broadway Hemel Hempstead HP25 8BL', town: 'LONDON', code: 'SE' }
          : { line: '', town: '', code: '' },
    [home, location],
  )

  const [custom, setCustom] = useState({ line: '', town: '', code: '' })
  const loc = location === 'mine' ? address : custom

  async function submit() {
    if (!ready) return
    setBusy(true)
    try {
      await addRequest({
        title: summary,
        type,
        description,
        priority: priority as 'High' | 'Medium' | 'Low',
        address: loc.line,
        postTown: loc.town,
        postCode: loc.code,
      })
      navigate('/queues')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="screen">
      <Header title="Create new service request" back />
      <div className="screen-body">
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <div className="form-block">
            <h2 className="section-title">Service details</h2>
            <Field label="Service type" required>
              <Select
                value={type}
                onChange={setType}
                placeholder="Select Service Type"
                options={serviceTypes}
              />
            </Field>
            <Field label="Summary" required>
              <TextInput value={summary} onChange={setSummary} placeholder="Type Here..." />
            </Field>
            <Field label="Description">
              <textarea
                className="control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Type Here..."
              />
            </Field>
            <Field label="Add images" required>
              <button className="add-image" type="button" onClick={() => setHasImage(true)}>
                <Icon name="camera" />
                Add
              </button>
              {hasImage ? <p className="date" style={{ marginTop: 8 }}>1 image attached</p> : null}
            </Field>
            <Field label="Service priority" required>
              <Select
                value={priority}
                onChange={setPriority}
                placeholder="Select Priority"
                options={priorities}
              />
            </Field>
          </div>
          <div className="form-block">
            <h2 className="section-title">Service location</h2>
            <div className="radios">
              <label className="radio">
                <input
                  type="radio"
                  checked={location === 'mine'}
                  onChange={() => setLocation('mine')}
                />
                My property
              </label>
              <label className="radio">
                <input
                  type="radio"
                  checked={location === 'other'}
                  onChange={() => setLocation('other')}
                />
                Different address
              </label>
            </div>
            <Field label="Address" required>
              <TextInput
                value={loc.line}
                onChange={(v) => setCustom((c) => ({ ...c, line: v }))}
                readOnly={location === 'mine'}
              />
            </Field>
            <div className="row-2">
              <Field label="Post town" required>
                <TextInput
                  value={loc.town}
                  onChange={(v) => setCustom((c) => ({ ...c, town: v }))}
                  readOnly={location === 'mine'}
                />
              </Field>
              <Field label="Post code" required>
                <TextInput
                  value={loc.code}
                  onChange={(v) => setCustom((c) => ({ ...c, code: v }))}
                  readOnly={location === 'mine'}
                />
              </Field>
            </div>
          </div>
        </form>
      </div>
      <div className="footer-bar">
        <Button variant={ready ? 'primary' : 'disabled'} disabled={!ready} onClick={() => void submit()}>
          Create Service Request
        </Button>
        <HomeIndicator />
      </div>
    </section>
  )
}
