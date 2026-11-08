import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { chime, scaleNote } from '../os/audio'

type Star = { id: number; x: number; y: number; size: number; hue: number }

let seq = 1

export default function Stars() {
  const [stars, setStars] = useState<Star[]>([])
  const boxRef = useRef<HTMLDivElement>(null)
  const note = useRef(0)

  const place = (event: ReactPointerEvent<HTMLDivElement>) => {
    const box = boxRef.current
    if (!box) return
    const rect = box.getBoundingClientRect()
    const star: Star = {
      id: seq++,
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
      size: 26 + Math.random() * 34,
      hue: 40 + Math.random() * 60,
    }
    note.current += 1
    scaleNote(note.current, 'sine')
    setStars((prev) => [...prev.slice(-59), star])
  }

  return (
    <div className="stage stars-stage" ref={boxRef} onPointerDown={place}>
      <div className="moon" aria-hidden="true">
        🌙
      </div>
      <p className="hint hint-stars">Tap the sky to add a star</p>
      {stars.map((star) => (
        <span
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            ['--hue' as string]: star.hue,
            animationDelay: `${Math.random() * 2}s`,
          }}
          aria-hidden="true"
        >
          ✦
        </span>
      ))}
      <button
        type="button"
        className="tool tool-night"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => {
          setStars([])
          chime()
        }}
        aria-label="Clear the sky"
      >
        ✨
      </button>
    </div>
  )
}
