import { useCallback, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { pop, scaleNote } from '../os/audio'

type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'heart'
type Spawn = {
  id: number
  kind: ShapeKind
  x: number
  y: number
  size: number
  hue: number
  rot: number
}

const KINDS: ShapeKind[] = ['circle', 'square', 'triangle', 'star', 'heart']

function ShapeArt({ kind }: { kind: ShapeKind }) {
  const props = { fill: 'currentColor' } as const
  switch (kind) {
    case 'square':
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <rect x="7" y="7" width="86" height="86" rx="20" {...props} />
        </svg>
      )
    case 'triangle':
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <polygon points="50,8 93,88 7,88" {...props} />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <polygon points="50,5 61,38 96,38 68,59 79,93 50,72 21,93 32,59 4,38 39,38" {...props} />
        </svg>
      )
    case 'heart':
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path
            d="M50 88C22 68 8 52 8 35 8 20 20 10 33 10c8 0 14 4 17 10 3-6 9-10 17-10 13 0 25 10 25 25 0 17-14 33-42 53z"
            {...props}
          />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="44" {...props} />
        </svg>
      )
  }
}

let seq = 1

export default function Shapes() {
  const [shapes, setShapes] = useState<Spawn[]>([])
  const boxRef = useRef<HTMLDivElement>(null)
  const note = useRef(0)

  const addShape = (event: ReactPointerEvent<HTMLDivElement>) => {
    const box = boxRef.current
    if (!box) return
    const rect = box.getBoundingClientRect()
    const shape: Spawn = {
      id: seq++,
      kind: KINDS[Math.floor(Math.random() * KINDS.length)],
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
      size: 110 + Math.random() * 90,
      hue: Math.floor(Math.random() * 360),
      rot: Math.random() * 60 - 30,
    }
    note.current += 1
    scaleNote(note.current, 'sine')
    setShapes((prev) => [...prev.slice(-11), shape])
  }

  const popShape = useCallback((id: number) => {
    pop()
    setShapes((prev) => prev.filter((shape) => shape.id !== id))
  }, [])

  return (
    <div className="stage shapes-stage" ref={boxRef} onPointerDown={addShape}>
      <p className="hint">Tap anywhere for a new shape</p>
      {shapes.map((shape) => (
        <button
          key={shape.id}
          type="button"
          className="shape"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
            color: `hsl(${shape.hue} 88% 62%)`,
            ['--rot' as string]: `${shape.rot}deg`,
          }}
          onPointerDown={(event) => {
            event.stopPropagation()
            popShape(shape.id)
          }}
          aria-label={`Pop the ${shape.kind}`}
        >
          <ShapeArt kind={shape.kind} />
        </button>
      ))}
    </div>
  )
}
