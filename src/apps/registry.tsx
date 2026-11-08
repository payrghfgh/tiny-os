import type { ComponentType } from 'react'
import Bubbles from './Bubbles'
import Paint from './Paint'
import Music from './Music'
import Animals from './Animals'
import Shapes from './Shapes'
import Stars from './Stars'
import Count from './Count'
import Spinny from './Spinny'

export type AppDef = {
  id: string
  label: string
  emoji: string
  from: string
  to: string
  App: ComponentType
}

export const APPS: AppDef[] = [
  { id: 'bubbles', label: 'Bubbles', emoji: '🫧', from: '#4fc3f7', to: '#1e88e5', App: Bubbles },
  { id: 'paint', label: 'Paint', emoji: '🎨', from: '#ffb74d', to: '#f4511e', App: Paint },
  { id: 'music', label: 'Music', emoji: '🎹', from: '#b388ff', to: '#6a1b9a', App: Music },
  { id: 'animals', label: 'Animals', emoji: '🐶', from: '#81c784', to: '#2e7d32', App: Animals },
  { id: 'shapes', label: 'Shapes', emoji: '🔺', from: '#ff8a80', to: '#c62828', App: Shapes },
  { id: 'stars', label: 'Stars', emoji: '⭐', from: '#7986cb', to: '#1a237e', App: Stars },
  { id: 'count', label: 'Counting', emoji: '🍎', from: '#ffd54f', to: '#ef6c00', App: Count },
  { id: 'spinny', label: 'Spinny', emoji: '🌀', from: '#4dd0e1', to: '#00838f', App: Spinny },
]
