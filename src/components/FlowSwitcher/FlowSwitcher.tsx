import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

type Flow = {
  id: string
  label: string
  description: string
  route: string
  disabled: boolean
}

const FLOWS: Flow[] = [
  {
    id: 'flow-4',
    label: 'Flow 4',
    description: 'AI-First Accounting',
    route: '/v4/accounting/overview',
    disabled: false,
  },
  {
    id: 'flow-3',
    label: 'Flow 3',
    description: 'Accounting Review Workspace',
    route: '/v3/accounting/overview',
    disabled: false,
  },
  {
    id: 'flow-1',
    label: 'Flow 1',
    description: 'Bills AI Categorisation',
    route: '/v1/accounting/bills',
    disabled: false,
  },
  {
    id: 'flow-2',
    label: 'Flow 2',
    description: 'Map with AI',
    route: '/v2/accounting/map',
    disabled: false,
  },
]

const LayersIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="9" height="9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms cubic-bezier(0.4,0,0.2,1)' }}
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
)

const LockIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

export const FlowSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const activeFlow = FLOWS.find(f => !f.disabled && location.pathname.startsWith(f.route)) ?? FLOWS[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <style>{`
        .fs-wrap {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          font-family: 'SF Mono', 'Cascadia Code', 'Fira Mono', 'Consolas', monospace;
        }

        .fs-panel {
          width: 228px;
          background: rgba(14, 14, 20, 0.92);
          backdrop-filter: blur(24px) saturate(200%);
          -webkit-backdrop-filter: blur(24px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 14px;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.03),
            0 12px 40px rgba(0, 0, 0, 0.6),
            0 2px 8px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          overflow: hidden;
          transform-origin: bottom right;
          animation: fs-panel-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes fs-panel-in {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }

        .fs-panel-header {
          padding: 10px 14px 8px;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.25);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .fs-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 10px 14px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: background 130ms ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .fs-item:last-child { border-bottom: none; }
        .fs-item:hover:not(:disabled) { background: rgba(255, 255, 255, 0.05); }
        .fs-item:disabled { cursor: not-allowed; }

        .fs-item-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .fs-dot-active {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00d084;
          box-shadow: 0 0 0 2px rgba(0, 208, 132, 0.2), 0 0 8px rgba(0, 208, 132, 0.5);
          flex-shrink: 0;
          animation: fs-dot-pulse 2.4s ease-in-out infinite;
        }

        @keyframes fs-dot-pulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(0, 208, 132, 0.2), 0 0 8px rgba(0, 208, 132, 0.5); }
          50%       { box-shadow: 0 0 0 4px rgba(0, 208, 132, 0.1), 0 0 16px rgba(0, 208, 132, 0.3); }
        }

        .fs-dot-inactive {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.18);
          flex-shrink: 0;
        }

        .fs-item-name {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1;
          margin-bottom: 3px;
          letter-spacing: 0.2px;
        }
        .fs-item-name--disabled { color: rgba(255, 255, 255, 0.3); }

        .fs-item-desc {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.35);
          line-height: 1.2;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          letter-spacing: 0;
        }
        .fs-item-desc--disabled { color: rgba(255, 255, 255, 0.2); }

        .fs-item-lock {
          color: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .fs-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 13px 7px 10px;
          background: rgba(16, 16, 22, 0.88);
          backdrop-filter: blur(24px) saturate(200%);
          -webkit-backdrop-filter: blur(24px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 999px;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.04),
            0 4px 20px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          cursor: pointer;
          transition: background 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
        }
        .fs-pill:hover {
          background: rgba(26, 26, 36, 0.92);
          border-color: rgba(255, 255, 255, 0.16);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.06),
            0 6px 24px rgba(0, 0, 0, 0.55),
            0 0 16px rgba(0, 208, 132, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .fs-pill-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #00d084;
          box-shadow: 0 0 6px rgba(0, 208, 132, 0.65);
          flex-shrink: 0;
        }

        .fs-pill-icon {
          color: rgba(255, 255, 255, 0.38);
          display: flex;
          align-items: center;
        }

        .fs-pill-label {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.75);
          letter-spacing: 0.4px;
          white-space: nowrap;
          line-height: 1;
        }

        .fs-pill-chevron {
          color: rgba(255, 255, 255, 0.28);
          display: flex;
          align-items: center;
          margin-left: 1px;
        }
      `}</style>

      <div ref={containerRef} className="fs-wrap">

        {isOpen && (
          <div className="fs-panel">
            <div className="fs-panel-header">Flows</div>

            {FLOWS.map((flow) => {
              const isActive = flow.id === activeFlow.id
              return (
                <button
                  key={flow.id}
                  className="fs-item"
                  disabled={flow.disabled}
                  onClick={() => {
                    if (!flow.disabled) {
                      navigate(flow.route)
                      setIsOpen(false)
                    }
                  }}
                >
                  <div className="fs-item-left">
                    {isActive
                      ? <span className="fs-dot-active" />
                      : <span className="fs-dot-inactive" />
                    }
                    <div>
                      <div className={`fs-item-name${flow.disabled ? ' fs-item-name--disabled' : ''}`}>
                        {flow.label}
                      </div>
                      <div className={`fs-item-desc${flow.disabled ? ' fs-item-desc--disabled' : ''}`}>
                        {flow.description}
                      </div>
                    </div>
                  </div>

                  {flow.disabled && (
                    <span className="fs-item-lock">
                      <LockIcon />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <button className="fs-pill" onClick={() => setIsOpen(prev => !prev)}>
          <span className="fs-pill-dot" />
          <span className="fs-pill-icon">
            <LayersIcon />
          </span>
          <span className="fs-pill-label">{activeFlow.label}</span>
          <span className="fs-pill-chevron">
            <ChevronIcon open={isOpen} />
          </span>
        </button>

      </div>
    </>
  )
}
