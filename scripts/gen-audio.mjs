// One-off: generates narration audio for each problem's prompt via OpenAI TTS,
// saved to public/audio/<slug>.mp3. Static files, served once and cached by the
// PWA — no API calls happen at runtime.
//
// Usage: OPENAI_API_KEY=sk-... node scripts/gen-audio.mjs [id ...]
// With no ids, regenerates every screen-phase problem (1-20).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'public/audio')
fs.mkdirSync(OUT_DIR, { recursive: true })

const key = process.env.OPENAI_API_KEY
if (!key) {
  console.error('Set OPENAI_API_KEY in the environment first.')
  process.exit(1)
}

const VOICE = 'nova'
const MODEL = 'tts-1'

const problems = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/tests.json'), 'utf8'))
const wanted = new Set(process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n)))

async function synth(text) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, voice: VOICE, input: text, response_format: 'mp3' }),
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`)
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  const targets = problems.filter((p) => p.phase === 'screen' && (!wanted.size || wanted.has(p.id)))
  let totalBytes = 0
  for (const p of targets) {
    const out = path.join(OUT_DIR, `${p.slug}.mp3`)
    const text = `Problem ${p.id}: ${p.title}. ${p.prompt}`
    process.stdout.write(`[${String(p.id).padStart(2, '0')}] ${p.title} ... `)
    try {
      const audio = await synth(text)
      fs.writeFileSync(out, audio)
      totalBytes += audio.length
      console.log(`${(audio.length / 1024).toFixed(0)} KB`)
    } catch (e) {
      console.log('FAILED')
      console.error('  ' + e.message)
    }
    await new Promise((r) => setTimeout(r, 250)) // gentle pacing
  }
  console.log(`\nTotal: ${(totalBytes / 1024 / 1024).toFixed(2)} MB across ${targets.length} files`)
}

main()
