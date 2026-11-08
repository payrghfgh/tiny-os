/**
 * Tiny sound engine.
 *
 * Every sound is synthesised with the Web Audio API at runtime, so the app
 * ships with zero audio files and still works offline. Nothing here loads
 * over the network.
 */

let ctx: AudioContext | null = null
let enabled = true

type AudioContextCtor = typeof AudioContext

function ctor(): AudioContextCtor | null {
  const w = window as unknown as {
    AudioContext?: AudioContextCtor
    webkitAudioContext?: AudioContextCtor
  }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

export function setSoundEnabled(value: boolean) {
  enabled = value
  if (!value && ctx && ctx.state === 'running') void ctx.suspend()
  if (value && ctx && ctx.state === 'suspended') void ctx.resume()
}

export function isSoundEnabled() {
  return enabled
}

/** Browsers only allow audio after a gesture, so this is called on every tap. */
export function unlockAudio(): AudioContext | null {
  if (!enabled) return null
  if (!ctx) {
    const AC = ctor()
    if (!AC) return null
    try {
      ctx = new AC()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export type ToneOptions = {
  freq: number
  to?: number
  dur?: number
  type?: OscillatorType
  gain?: number
  delay?: number
}

export function tone({ freq, to, dur = 0.28, type = 'sine', gain = 0.16, delay = 0 }: ToneOptions) {
  const c = unlockAudio()
  if (!c) return
  const start = c.currentTime + delay
  const osc = c.createOscillator()
  const amp = c.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (to && to !== freq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + dur)
  }

  amp.gain.setValueAtTime(0.0001, start)
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), start + 0.015)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur)

  osc.connect(amp).connect(c.destination)
  osc.start(start)
  osc.stop(start + dur + 0.03)
}

/** Short filtered noise burst — the "pop" of a bubble. */
export function noiseBurst(dur = 0.12, gain = 0.12) {
  const c = unlockAudio()
  if (!c) return
  const frames = Math.floor(c.sampleRate * dur)
  const buffer = c.createBuffer(1, frames, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i += 1) {
    const decay = 1 - i / frames
    data[i] = (Math.random() * 2 - 1) * decay * decay
  }
  const src = c.createBufferSource()
  src.buffer = buffer
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1400
  filter.Q.value = 0.9
  const amp = c.createGain()
  amp.gain.value = gain
  src.connect(filter).connect(amp).connect(c.destination)
  src.start()
}

export function pop() {
  noiseBurst()
  tone({ freq: 680, to: 240, dur: 0.14, type: 'sine', gain: 0.2 })
}

export function chime() {
  tone({ freq: 880, dur: 0.5, type: 'sine', gain: 0.1 })
  tone({ freq: 1320, dur: 0.45, type: 'sine', gain: 0.07, delay: 0.07 })
  tone({ freq: 1760, dur: 0.4, type: 'sine', gain: 0.05, delay: 0.14 })
}

export function boop() {
  tone({ freq: 320, to: 520, dur: 0.18, type: 'triangle', gain: 0.14 })
}

export function whoosh() {
  tone({ freq: 200, to: 900, dur: 0.3, type: 'sawtooth', gain: 0.06 })
}

/** A pentatonic scale — any note order sounds pleasant. */
export const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51]

export function scaleNote(index: number, type: OscillatorType = 'triangle') {
  const freq = SCALE[((index % SCALE.length) + SCALE.length) % SCALE.length]
  tone({ freq, dur: 0.55, type, gain: 0.13 })
}

/** Spoken word, used sparingly for animal names and counting. */
export function say(text: string) {
  if (!enabled) return
  try {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.85
    utterance.pitch = 1.2
    utterance.volume = 0.9
    synth.speak(utterance)
  } catch {
    /* Speech is a bonus, never a requirement. */
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* ignore */
  }
}
