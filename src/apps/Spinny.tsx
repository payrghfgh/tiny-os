import { useRef, useState } from 'react'
import { SCALE, tone } from '../os/audio'

const SEGMENTS = ['#ff5d5d', '#ff9f43', '#ffd93d', '#6bcB77', '#4d96ff', '#9b5de5', '#f15bb5', '#00c2c7']

const gradient = `conic-gradient(${SEGMENTS.map((color, index) => {
  const start = (index / SEGMENTS.length) * 100
  const end = ((index + 1) / SEGMENTS.length) * 100
  return `${color} ${start}% ${end}%`
}).join(', ')})`

export default function Spinny() {
  const [angle, setAngle] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const ticks = useRef<number[]>([])

  const spin = () => {
    if (spinning) return
    const turn = 720 + Math.random() * 720
    setAngle((current) => current + turn)
    setSpinning(true)
    ticks.current.forEach((id) => window.clearTimeout(id))
    ticks.current = Array.from({ length: 8 }).map((_, index) =>
      window.setTimeout(() => {
        tone({ freq: SCALE[index % SCALE.length], dur: 0.18, type: 'square', gain: 0.05 })
      }, index * 90),
    )
    window.setTimeout(() => setSpinning(false), 3100)
  }

  return (
    <div className="stage spinny-stage" onPointerDown={spin}>
      <p className="hint">Tap to spin</p>
      <div className="wheel-frame">
        <div
          className={`wheel${spinning ? ' spinning' : ''}`}
          style={{ background: gradient, transform: `rotate(${angle}deg)` }}
          aria-hidden="true"
        >
          <span className="wheel-hub" />
        </div>
        <span className="wheel-pointer" aria-hidden="true" />
      </div>
      <button type="button" className="spin-button" onPointerDown={(event) => event.stopPropagation()} onClick={spin}>
        Spin!
      </button>
    </div>
  )
}
