import { useState } from 'react'
import { tone } from '../os/audio'

const NOTES = [
  { freq: 523.25, color: '#ff5d5d' },
  { freq: 587.33, color: '#ff9f43' },
  { freq: 659.25, color: '#ffd93d' },
  { freq: 783.99, color: '#6bcB77' },
  { freq: 880.0, color: '#4d96ff' },
  { freq: 1046.5, color: '#9b5de5' },
  { freq: 1174.66, color: '#f15bb5' },
  { freq: 1318.51, color: '#00c2c7' },
]

type Spark = { id: number; left: number; hue: number }

let sparkId = 1

export default function Music() {
  const [active, setActive] = useState<number | null>(null)
  const [sparks, setSparks] = useState<Spark[]>([])

  const play = (index: number) => {
    const note = NOTES[index]
    tone({ freq: note.freq, dur: 0.7, type: 'triangle', gain: 0.16 })
    tone({ freq: note.freq * 2, dur: 0.4, type: 'sine', gain: 0.05 })
    setActive(index)
    window.setTimeout(() => setActive((current) => (current === index ? null : current)), 220)
    const spark: Spark = { id: sparkId++, left: (index / NOTES.length) * 100 + 5, hue: index * 42 }
    setSparks((prev) => [...prev, spark])
    window.setTimeout(() => setSparks((prev) => prev.filter((s) => s.id !== spark.id)), 1400)
  }

  return (
    <div className="stage music-stage">
      <p className="hint">Tap the bars</p>
      <div className="xylo">
        {NOTES.map((note, index) => (
          <button
            key={note.freq}
            type="button"
            className={`bar${active === index ? ' bar-active' : ''}`}
            style={{
              background: `linear-gradient(180deg, ${note.color}, ${note.color}bb)`,
              height: `${100 - index * 7}%`,
            }}
            onPointerDown={() => play(index)}
            aria-label={`Play note ${index + 1}`}
          />
        ))}
      </div>
      <div className="spark-layer" aria-hidden="true">
        {sparks.map((spark) => (
          <span key={spark.id} className="spark" style={{ left: `${spark.left}%`, ['--hue' as string]: spark.hue }}>
            {['♪', '♫', '🎵', '✨'][spark.id % 4]}
          </span>
        ))}
      </div>
    </div>
  )
}
