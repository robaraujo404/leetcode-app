// One-off: generates narration audio for each problem's prompt via OpenAI TTS,
// saved to public/audio/<lang>/<slug>.mp3. Static files, served once and cached
// by the PWA -- no API calls happen at runtime.
//
// Usage: OPENAI_API_KEY=sk-... node scripts/gen-audio.mjs [--lang en|pt|all] [id ...]
// With no ids, regenerates every screen-phase problem (1-20). Default --lang is all.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const key = process.env.OPENAI_API_KEY
if (!key) {
  console.error('Set OPENAI_API_KEY in the environment first.')
  process.exit(1)
}

const VOICE = 'nova'
const MODEL = 'tts-1'

const problems = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/tests.json'), 'utf8'))
const promptsPt = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/prompts-pt.json'), 'utf8'))

const args = process.argv.slice(2)
const langIdx = args.indexOf('--lang')
const lang = langIdx !== -1 ? args[langIdx + 1] : 'all'
const idArgs = args.filter((a, i) => a !== '--lang' && args[i - 1] !== '--lang')
const wanted = new Set(idArgs.map(Number).filter((n) => !Number.isNaN(n)))
const langs = lang === 'all' ? ['en', 'pt'] : [lang]

function textFor(p, l) {
  if (l === 'en') return `Problem ${p.id}: ${p.title}. ${p.prompt}`
  return `Problema ${p.id}: ${p.title}. ${promptsPt[String(p.id)]}`
}

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
  for (const l of langs) {
    const outDir = path.join(ROOT, 'public/audio', l)
    fs.mkdirSync(outDir, { recursive: true })
    let totalBytes = 0
    console.log(`\n== ${l.toUpperCase()} ==`)
    for (const p of targets) {
      if (l === 'pt' && !promptsPt[String(p.id)]) {
        console.log(`[${String(p.id).padStart(2, '0')}] ${p.title} ... SKIPPED (no PT translation in scripts/prompts-pt.json)`)
        continue
      }
      const out = path.join(outDir, `${p.slug}.mp3`)
      const text = textFor(p, l)
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
    console.log(`Total (${l}): ${(totalBytes / 1024 / 1024).toFixed(2)} MB`)
  }
}

main()
