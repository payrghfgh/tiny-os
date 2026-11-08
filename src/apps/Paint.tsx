import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { boop, chime } from '../os/audio'

const PALETTE = ['#ff4d6d', '#ff9f1c', '#ffe066', '#4cd964', '#4fc3f7', '#a06bff', '#ff77c8', '#ffffff']

export default function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const hue = useRef(Math.random() * 360)
  const [color, setColor] = useState<string | null>(null)
  const [brush, setBrush] = useState(26)
  const [flash, setFlash] = useState(false)

  const setup = useCallback(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    const rect = wrap.getBoundingClientRect()
    const width = Math.max(1, Math.round(rect.width))
    const height = Math.max(1, Math.round(rect.height))
    if (canvas.width === Math.round(width * ratio) && canvas.height === Math.round(height * ratio)) return
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  useEffect(() => {
    setup()
    const wrap = wrapRef.current
    if (!wrap || typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', setup)
      return () => window.removeEventListener('resize', setup)
    }
    const observer = new ResizeObserver(() => setup())
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [setup])

  const strokeStyle = () => {
    if (color) return color
    hue.current = (hue.current + 3) % 360
    return `hsl(${hue.current} 92% 62%)`
  }

  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const start = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    canvas.setPointerCapture(event.pointerId)
    drawing.current = true
    const { x, y } = point(event)
    last.current = { x, y }
    ctx.fillStyle = strokeStyle()
    ctx.beginPath()
    ctx.arc(x, y, brush / 2, 0, Math.PI * 2)
    ctx.fill()
    boop()
  }

  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = point(event)
    const from = last.current ?? { x, y }
    ctx.strokeStyle = strokeStyle()
    ctx.lineWidth = brush
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(x, y)
    ctx.stroke()
    last.current = { x, y }
  }

  const end = () => {
    drawing.current = false
    last.current = null
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setFlash(true)
    chime()
    window.setTimeout(() => setFlash(false), 320)
  }

  return (
    <div className="stage paint-stage">
      <div className={`canvas-wrap${flash ? ' flash' : ''}`} ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="paint-canvas"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={end}
          aria-label="Finger painting area"
        />
        <p className="hint hint-paint">Draw with your finger</p>
      </div>
      <div className="palette">
        <button
          type="button"
          className={`swatch swatch-rainbow${color === null ? ' active' : ''}`}
          onClick={() => {
            setColor(null)
            boop()
          }}
          aria-label="Rainbow brush"
          aria-pressed={color === null}
        />
        {PALETTE.map((swatch) => (
          <button
            key={swatch}
            type="button"
            className={`swatch${color === swatch ? ' active' : ''}`}
            style={{ background: swatch }}
            onClick={() => {
              setColor(swatch)
              boop()
            }}
            aria-label={`Colour ${swatch}`}
            aria-pressed={color === swatch}
          />
        ))}
        <button
          type="button"
          className="tool"
          onClick={() => {
            setBrush((value) => (value >= 60 ? 16 : value + 16))
            boop()
          }}
          aria-label="Change brush size"
        >
          <span style={{ fontSize: `${12 + brush / 3}px` }} aria-hidden="true">
            ●
          </span>
        </button>
        <button type="button" className="tool tool-clear" onClick={clear} aria-label="Clear the page">
          🧽
        </button>
      </div>
    </div>
  )
}
