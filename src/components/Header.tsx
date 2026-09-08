import { useNavigate } from 'react-router-dom'
import { Icon, StatusBar } from './Chrome'

export function Header({
  title,
  welcome,
  back,
  onMenu,
  tabs,
  activeTab,
  onTab,
}: {
  title?: string
  welcome?: string
  back?: boolean
  onMenu?: () => void
  tabs?: string[]
  activeTab?: string
  onTab?: (tab: string) => void
}) {
  const navigate = useNavigate()

  return (
    <header className={`header${tabs ? ' tabs' : ''}`}>
      <StatusBar />
      <div className="header-row">
        {back ? (
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="arrowBack" />
          </button>
        ) : (
          <button type="button" onClick={onMenu} aria-label="Menu">
            <Icon name="hamburger" />
          </button>
        )}
        {welcome ? (
          <p className="header-welcome">
            Welcome, <strong>{welcome}</strong>
          </p>
        ) : (
          <h1 className="header-title">{title}</h1>
        )}
      </div>
      {tabs ? (
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => onTab?.(tab)}
            >
              {tab}
              <span className="tab-line" />
            </button>
          ))}
        </div>
      ) : null}
    </header>
  )
}
