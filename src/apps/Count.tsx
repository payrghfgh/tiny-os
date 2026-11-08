import { useRef, useState } from 'react'
import { chime, pop, say, tone } from '../os/audio'

const FRUIT = ['🍎', '🍓', '🐥', '🐟', '⭐', '🍪', '🎈', '🐞']
const MAX = 10

export default function Count() {
  const [count, setCount] = useState(1)
  const fruit = useRef(FRUIT[Math.floor(Math.random() * FRUIT.length)]).current
  const [party, setParty] = useState(false)

  const advance = () => {
    if (count >= MAX) {
      setParty(true)
      chime()
      say(`Ten! Well done!`)
      window.setTimeout(() => setParty(false), 1600)
      setCount(1)
      return
    }
    const next = count + 1
    pop()
    tone({ freq: 480 + next * 60, dur: 0.2, type: 'triangle', gain: 0.12 })
    say(String(next))
    setCount(next)
  }

  return (
    <div className="stage count-stage" onPointerDown={advance}>
      <div className="count-top">
        <span className="count-number" key={count}>
          {count}
        </span>
      </div>
      <div className={`fruit-tray${party ? ' party' : ''}`} aria-live="polite">
        {Array.from({ length: count }).map((_, index) => (
          <span className="fruit" key={`${count}-${index}`} style={{ animationDelay: `${index * 60}ms` }}>
            {fruit}
          </span>
        ))}
      </div>
      <p className="hint hint-count">Tap to add one more</p>
      {party && <div className="confetti-layer" aria-hidden="true" />}
    </div>
  )
}
