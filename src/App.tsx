import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { APPS } from './apps/registry'
import { chime, setSoundEnabled, stopSpeaking, tone, unlockAudio } from './os/audio'

const SOUND_KEY = 'tinyos.sound'

function formatClock(date: Date) {
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hour12}:${minutes} ${suffix}`
}

export default function App() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [sound, setSound] = useState(() => {
    try {
      return window.localStorage.getItem(SOUND_KEY) !== 'off'
    } catch {
      return true
    }
  })
  const [grownUpsOpen, setGrownUpsOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const holdTimer = useRef<number | null>(null)

  useEffect(() => {
    setSoundEnabled(sound)
    try {
      window.localStorage.setItem(SOUND_KEY, sound ? 'on' : 'off')
    } catch {
      /* Private mode: the setting just will not persist. */
    }
  }, [sound])

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 15000)
    return () => window.clearInterval(tick)
  }, [])

  // Toddler-proofing: no pinch-zoom, no long-press menus, no double-tap zoom.
  useEffect(() => {
    const block = (event: Event) => event.preventDefault()
    document.addEventListener('gesturestart', block)
    document.addEventListener('contextmenu', block)
    return () => {
      document.removeEventListener('gesturestart', block)
      document.removeEventListener('contextmenu', block)
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenId(null)
        setGrownUpsOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const openApp = useCallback((id: string) => {
    unlockAudio()
    tone({ freq: 620, to: 940, dur: 0.22, type: 'triangle', gain: 0.14 })
    setOpenId(id)
  }, [])

  const closeApp = useCallback(() => {
    stopSpeaking()
    tone({ freq: 700, to: 420, dur: 0.2, type: 'triangle', gain: 0.12 })
    setOpenId(null)
  }, [])

  const active = useMemo(() => APPS.find((app) => app.id === openId) ?? null, [openId])

  const startHold = () => {
    holdTimer.current = window.setTimeout(() => {
      setGrownUpsOpen(true)
      chime()
    }, 900)
  }
  const endHold = () => {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
  }

  return (
    <div className="os">
      <div className="wallpaper" aria-hidden="true">
        <span className="blob blob-a" />
        <span className="blob blob-b" />
        <span className="blob blob-c" />
        <span className="blob blob-d" />
        <span className="sun" />
      </div>

      <header className="statusbar">
        <button
          type="button"
          className="clock"
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          aria-label={`Clock. It is ${formatClock(now)}. Press and hold for grown-up settings.`}
        >
          {formatClock(now)}
        </button>
        <div className="status-icons" aria-hidden="true">
          <span className="status-pill">{sound ? '🔊' : '🔇'}</span>
          <span className="status-pill">🔋</span>
        </div>
      </header>

      {!active && (
        <main className="home">
          <h1 className="sr-only">TinyOS home screen</h1>
          <ul className="appgrid">
            {APPS.map((app) => (
              <li key={app.id} className="appcell">
                <button
                  type="button"
                  className="appicon"
                  style={{ '--from': app.from, '--to': app.to } as CSSProperties}
                  onClick={() => openApp(app.id)}
                  aria-label={`Open ${app.label}`}
                >
                  <span className="glyph" aria-hidden="true">
                    {app.emoji}
                  </span>
                  <span className="shine" aria-hidden="true" />
                </button>
                <span className="applabel">{app.label}</span>
              </li>
            ))}
          </ul>
        </main>
      )}

      {active && (
        <section
          key={active.id}
          className="window"
          style={{ '--from': active.from, '--to': active.to } as CSSProperties}
          aria-label={`${active.label} app`}
        >
          <div className="windowbar">
            <button type="button" className="homebtn" onClick={closeApp} aria-label="Back to home screen">
              <span aria-hidden="true">🏠</span>
            </button>
            <span className="windowtitle">{active.label}</span>
            <span className="windowspacer" aria-hidden="true" />
          </div>
          <div className="windowbody">
            <active.App />
          </div>
        </section>
      )}

      {grownUpsOpen && (
        <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-label="Grown-up settings">
          <div className="sheet">
            <h2>Grown-ups</h2>
            <p className="sheet-note">
              TinyOS has no internet, no ads, no links out and no data collection. Everything your little
              one does stays on this device.
            </p>
            <button type="button" className="sheet-row" onClick={() => setSound((value) => !value)}>
              <span>Sounds</span>
              <span className="sheet-value">{sound ? 'On' : 'Off'}</span>
            </button>
            <button
              type="button"
              className="sheet-row"
              onClick={() => {
                stopSpeaking()
                setGrownUpsOpen(false)
              }}
            >
              <span>Close</span>
              <span className="sheet-value">✕</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
