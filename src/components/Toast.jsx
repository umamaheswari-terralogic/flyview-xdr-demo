import { useState, useEffect, useCallback } from 'react'

let _push = null

export function useToast() {
  const push = useCallback((title, desc = '', type = 'ok') => {
    _push?.({ title, desc, type, id: Math.random().toString(36).slice(2) })
  }, [])
  return push
}

export function ToastProvider() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    _push = (t) => {
      setToasts(prev => [...prev, t])
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== t.id))
      }, 4000)
    }
    return () => { _push = null }
  }, [])

  const ICONS = { ok: '✓', cr: '✕', hi: '⚠', in: 'ℹ' }

  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <div className={`toast-icon ${t.type}`}>{ICONS[t.type] ?? 'ℹ'}</div>
          <div className="toast-body">
            <div className="toast-title">{t.title}</div>
            {t.desc && <div className="toast-desc">{t.desc}</div>}
          </div>
          <button className="toast-close" onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>×</button>
        </div>
      ))}
    </div>
  )
}
