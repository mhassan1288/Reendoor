import { icons } from '../icons'

type IconName = keyof typeof icons

export function Icon({
  name,
  size = 24,
  alt = '',
}: {
  name: IconName
  size?: number
  alt?: string
}) {
  return (
    <span className="icon" style={{ width: size, height: size }}>
      <img src={icons[name]} alt={alt} width={size} height={size} />
    </span>
  )
}

export function StatusBar({ light = false }: { light?: boolean }) {
  const suffix = light ? 'Light' : ''
  return (
    <div className={`status-bar${light ? ' light' : ''}`}>
      <div className="time">9:41</div>
      <div className="status-icons">
        <img src={icons[`signal${suffix}` as IconName]} alt="" height={11} />
        <img src={icons[`wifi${suffix}` as IconName]} alt="" height={11} />
        <span className="battery">
          <img className="outline" src={icons[`batteryOutline${suffix}` as IconName]} alt="" />
          <img className="fill" src={icons[`batteryFill${suffix}` as IconName]} alt="" />
          <img className="tip" src={icons[`batteryTip${suffix}` as IconName]} alt="" />
        </span>
      </div>
    </div>
  )
}

export function HomeIndicator({ light = false }: { light?: boolean }) {
  return (
    <div className={`home-indicator${light ? ' light' : ''}`}>
      <span />
    </div>
  )
}
