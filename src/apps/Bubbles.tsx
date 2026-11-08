import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { pop } from '../os/audio'

type Bubble = {
  id: number
  x: number
  size: number
  hue: number
  duration: number
  drift: number
}

type Burst = { id: number; x: number; y: number; hue: number }

let nextId = 1

export default function Bubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [bursts, setBursts] = useState<Burst[]>([])
  const boxRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  const spawn = useCallback(() => {
    setBubbles((prev) => {
      if (prev.length > 13) return prev
      return [
        ...prev,
        {
          id: nextId++,
          x: 4 + Math.random() * 86,
          size: 70 + Math.random() * 90,
          hue: Math.floor(Math.random() * 360),
          duration: 7 + Math.random() * 6,
          drift: Math.random() * 40 - 20,
        },
      ]
    })
  }, [])

  useEffect(() => {
    spawn()
    spawn()
    const interval = window.setInterval(spawn, 650)
    return () => {
      window.clearInterval(interval)
      timers.current.forEach((id) => window.clearTimeout(id))
    }
  }, [spawn])

  const remove = (id: number) => setBubbles((prev) => prev.filter((b) => b.id !== id))

  const handlePop = (bubble: Bubble, event: ReactPointerEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    pop()
    const box = boxRef.current
    if (box) {
      const rect = box.getBoundingClientRect()
      const burst: Burst = {
        id: nextId++,
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
        hue: bubble.hue,
      }
      setBursts((prev) => [...prev, burst])
      const timer = window.setTimeout(
        () => setBursts((prev) => prev.filter((b) => b.id !== burst.id)),
        700,
      )
      timers.current.push(timer)
    }
    remove(bubble.id)
  }

  return (
    <div className="stage bubbles-stage" ref={boxRef}>
      <p className="hint">Tap the bubbles</p>
      {bubbles.map((bubble) => (
        <button
          key={bubble.id}
          type="button"
          className="bubble"
          style={{
            left: `${bubble.x}%`,
            width: bubble.size,
            height: bubble.size,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${-Math.random() * bubble.duration}s`,
            ['--drift' as string]: `${bubble.drift}px`,
            ['--hue' as string]: bubble.hue,
          }}
          onPointerDown={(event) => handlePop(bubble, event)}
          onAnimationEnd={() => remove(bubble.id)}
          aria-label="Pop bubble"
        >
          <span className="bubble-skin" aria-hidden="true" />
        </button>
      ))}
      {bursts.map((burst) => (
        <span
          key={burst.id}
          className="burst"
          style={{ left: `${burst.x}%`, top: `${burst.y}%`, ['--hue' as string]: burst.hue }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
