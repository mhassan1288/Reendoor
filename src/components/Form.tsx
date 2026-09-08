import type { ReactNode } from 'react'
import { icons } from '../icons'

export function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <div className="field">
      <label>
        {label}
        {required ? <span className="req"> *</span> : null}
      </label>
      {children}
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  readOnly,
  trailing,
}: {
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  type?: string
  error?: boolean
  readOnly?: boolean
  trailing?: ReactNode
}) {
  return (
    <div className="control-wrap">
      <input
        className={`control${error ? ' error' : ''}${readOnly ? ' readonly' : ''}`}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        type={type}
        readOnly={readOnly}
      />
      {trailing ? <span className="trail">{trailing}</span> : null}
    </div>
  )
}

export function Select({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: string[]
}) {
  return (
    <div className="control-wrap">
      <select className="control" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <span className="trail">
        <img src={icons.chevronDown} alt="" width={20} height={20} />
      </span>
    </div>
  )
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'disabled' | 'gradient' | 'outline' | 'reject' | 'accept'
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  const cls = disabled ? 'disabled' : variant
  return (
    <button type={type} className={`btn ${cls}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
