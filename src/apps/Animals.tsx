import { useState } from 'react'
import { chime, say, tone } from '../os/audio'

const ANIMALS = [
  { emoji: '🐶', name: 'Dog', sound: 'Woof woof' },
  { emoji: '🐱', name: 'Cat', sound: 'Meow' },
  { emoji: '🐮', name: 'Cow', sound: 'Moo' },
  { emoji: '🐸', name: 'Frog', sound: 'Ribbit' },
  { emoji: '🦁', name: 'Lion', sound: 'Roar' },
  { emoji: '🐘', name: 'Elephant', sound: 'Pawoo' },
  { emoji: '🐵', name: 'Monkey', sound: 'Ooh ooh ah ah' },
  { emoji: '🐥', name: 'Chick', sound: 'Cheep cheep' },
  { emoji: '🐼', name: 'Panda', sound: 'Panda' },
]

export default function Animals() {
  const [open, setOpen] = useState<number[]>([])

  const toggle = (index: number) => {
    const isOpen = open.includes(index)
    if (isOpen) {
      tone({ freq: 420, to: 300, dur: 0.16, type: 'triangle', gain: 0.1 })
      setOpen((prev) => prev.filter((i) => i !== index))
      return
    }
    const animal = ANIMALS[index]
    chime()
    say(`${animal.name}. ${animal.sound}!`)
    setOpen((prev) => [...prev, index])
  }

  return (
    <div className="stage animals-stage">
      <p className="hint">Who is hiding? Tap a card</p>
      <div className="cardgrid">
        {ANIMALS.map((animal, index) => {
          const revealed = open.includes(index)
          return (
            <button
              key={animal.name}
              type="button"
              className={`flipcard${revealed ? ' flipped' : ''}`}
              onClick={() => toggle(index)}
              aria-label={revealed ? `${animal.name}, tap to hide` : 'Hidden animal, tap to reveal'}
              aria-pressed={revealed}
            >
              <span className="flipcard-inner">
                <span className="flipcard-face flipcard-back" aria-hidden="true">
                  🐾
                </span>
                <span className="flipcard-face flipcard-front" aria-hidden="true">
                  <span className="animal-emoji">{animal.emoji}</span>
                  <span className="animal-name">{animal.name}</span>
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
