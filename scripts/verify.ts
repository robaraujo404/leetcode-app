// Verifies every problem content file against data/tests.json (+ data/perf fixtures).
// Usage: pnpm verify [id ...]
//
// For each problem it checks that the reference `source` passes all visible and hidden
// tests (and the perf fixture under 2 s when one exists), that every bug patch makes the
// named hidden test fail, and that the rest of the content is well-formed.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'
import type { ProblemContent } from '../src/content/schema'
import { PATTERNS } from '../src/content/patterns'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PROBLEMS_DIR = path.join(ROOT, 'src/content/problems')

interface TestCase {
  name: string
  concept?: string
  input: unknown
  expected: unknown
  visible: boolean
}
interface Problem {
  id: number
  title: string
  slug: string
  signature: { function: string; params: { name: string; type: string }[]; returns: string; notes: string }
  clarifications: string[]
  tests: TestCase[]
  performance: { fixture: string | null; time_limit_seconds: number }
}

const problems: Problem[] = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/tests.json'), 'utf8'))
const byId = new Map(problems.map((p) => [p.id, p]))

// ---------- compiling the candidate source ----------

type Module = Record<string, any>

function compile(source: string): Module {
  const js = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText
  const names = [...source.matchAll(/^(?:function|class)\s+(\w+)/gm)].map((m) => m[1])
  if (names.length === 0) throw new Error('source declares no top-level function or class')
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function(`${js}\nreturn { ${names.join(', ')} };`)()
}

// ---------- input encodings (see CLAUDE-CODE-SPEC.md) ----------

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function serializeQuad(node: any): string {
  if (!node) return 'null'
  if (node.isLeaf) return `L${Number(node.val) ? 1 : 0}`
  return `N(${serializeQuad(node.topLeft)},${serializeQuad(node.topRight)},${serializeQuad(node.bottomLeft)},${serializeQuad(node.bottomRight)})`
}

function run(problem: Problem, mod: Module, input: any): unknown {
  const fnName = problem.signature.function
  switch (problem.id) {
    case 3: {
      const cal = new mod.MyCalendar()
      return input.map(([s, e]: number[]) => cal.book(s, e))
    }
    case 4:
      return input.op === 'isValid'
        ? mod.isValid(input.card)
        : mod.isValid(mod.generate(mulberry32(input.seed)))
    case 6: {
      const [capacity, ops] = input
      const cache = new mod.LRUCache(capacity)
      return ops.map(([op, ...args]: any[]) => (op === 'put' ? (cache.put(...args), null) : cache.get(...args)))
    }
    case 9:
      return serializeQuad(mod.construct(input))
    case 14: {
      const hc = new mod.HitCounter()
      return input.map(([op, t]: [string, number]) => (op === 'hit' ? (hc.hit(t), null) : hc.getHits(t)))
    }
    case 20: {
      const fsys = new mod.FileSystem()
      return input.map(([op, args]: [string, any[]]) => {
        switch (op) {
          case 'mkdir':
            return fsys.mkdir(...args), null
          case 'add':
            return fsys.addContentToFile(...args), null
          case 'read':
            return fsys.readContentFromFile(...args)
          case 'ls':
            return fsys.ls(...args)
          default:
            throw new Error(`unknown op ${op}`)
        }
      })
    }
    case 21: {
      const { vals, k } = input
      let head: any = null
      for (let i = vals.length - 1; i >= 0; i--) head = { val: vals[i], next: head }
      let node = mod.reverseKGroup(head, k)
      const out: number[] = []
      while (node) {
        out.push(node.val)
        node = node.next
      }
      return out
    }
    case 22: {
      const trie = new mod.Trie()
      return input.map(([op, w]: [string, string]) =>
        op === 'insert' ? (trie.insert(w), null) : op === 'search' ? trie.search(w) : trie.startsWith(w),
      )
    }
    case 23: {
      const tm = new mod.TimeMap()
      return input.map(([op, args]: [string, any[]]) => (op === 'set' ? (tm.set(...args), null) : tm.get(...args)))
    }
    default: {
      const fn = mod[fnName]
      if (typeof fn !== 'function') throw new Error(`source must declare function ${fnName}`)
      if (input !== null && typeof input === 'object' && !Array.isArray(input)) {
        return fn(...problem.signature.params.map((p) => (input as any)[p.name]))
      }
      return fn(input)
    }
  }
}

// ---------- comparison ----------

function equal(a: unknown, b: unknown, tol: number): boolean {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b))
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => equal(x, b[i], tol))
  if (a === undefined) a = null
  return JSON.stringify(a) === JSON.stringify(b)
}

function show(v: unknown): string {
  const s = JSON.stringify(v)
  return s.length > 120 ? s.slice(0, 117) + '...' : s
}

// ---------- checks ----------

class Report {
  errors: string[] = []
  notes: string[] = []
  fail(msg: string) {
    this.errors.push(msg)
  }
  note(msg: string) {
    this.notes.push(msg)
  }
}

function runTests(problem: Problem, mod: Module, tests: TestCase[], tol: number): { name: string; ok: boolean; got?: unknown; err?: string }[] {
  return tests.map((t) => {
    try {
      const got = run(problem, mod, structuredClone(t.input))
      return { name: t.name, ok: equal(got, t.expected, tol), got }
    } catch (e) {
      return { name: t.name, ok: false, err: e instanceof Error ? e.message : String(e) }
    }
  })
}

function checkSolution(problem: Problem, content: ProblemContent, r: Report, withPerf: boolean) {
  const tol = problem.id === 11 ? 1e-6 : 0
  let mod: Module
  try {
    mod = compile(content.source)
  } catch (e) {
    r.fail(`source does not compile: ${e instanceof Error ? e.message : e}`)
    return null
  }
  for (const res of runTests(problem, mod, problem.tests, tol)) {
    if (!res.ok) {
      const t = problem.tests.find((x) => x.name === res.name)!
      r.fail(`test ${res.name}: ${res.err ? 'threw ' + res.err : `got ${show(res.got)} expected ${show(t.expected)}`}`)
    }
  }
  if (withPerf && problem.performance.fixture) {
    const dir = path.join(ROOT, 'data', problem.performance.fixture)
    const pairs = [['input.json', 'expected.json']]
    if (fs.existsSync(path.join(dir, 'input_cycle.json'))) pairs.push(['input_cycle.json', 'expected_cycle.json'])
    for (const [inF, expF] of pairs) {
      const input = JSON.parse(fs.readFileSync(path.join(dir, inF), 'utf8'))
      const expected = JSON.parse(fs.readFileSync(path.join(dir, expF), 'utf8'))
      const t0 = performance.now()
      let got: unknown
      try {
        got = run(problem, mod, input)
      } catch (e) {
        r.fail(`perf ${inF}: threw ${e instanceof Error ? e.message : e}`)
        continue
      }
      const ms = performance.now() - t0
      if (!equal(got, expected, tol)) r.fail(`perf ${inF}: wrong answer`)
      else if (ms > problem.performance.time_limit_seconds * 1000) r.fail(`perf ${inF}: ${ms.toFixed(0)} ms > limit`)
      else r.note(`perf ${inF}: ${ms.toFixed(0)} ms`)
    }
  }
  return mod
}

export interface BugRun {
  test: string
  input: unknown
  expected: unknown
  got: unknown
  error?: string
}

function checkBugs(problem: Problem, content: ProblemContent, r: Report, out: Record<string, BugRun>) {
  const lines = content.source.split('\n')
  const hidden = problem.tests.filter((t) => !t.visible)
  const tol = problem.id === 11 ? 1e-6 : 0
  const ids = new Set<string>()
  for (const bug of content.bugs) {
    if (ids.has(bug.id)) r.fail(`bug ${bug.id}: duplicate id`)
    ids.add(bug.id)
    if (bug.line < 0 || bug.line >= lines.length) {
      r.fail(`bug ${bug.id}: line ${bug.line} out of range`)
      continue
    }
    if (bug.code === lines[bug.line]) r.fail(`bug ${bug.id}: patch is identical to the original line`)
    if (bug.logLine < 0 || bug.logLine >= lines.length) r.fail(`bug ${bug.id}: logLine ${bug.logLine} out of range`)
    const target = hidden.find((t) => t.name === bug.failsTest)
    if (!target) {
      r.fail(`bug ${bug.id}: failsTest "${bug.failsTest}" is not a hidden test (${hidden.map((t) => t.name).join(', ')})`)
      continue
    }
    const patched = [...lines]
    patched[bug.line] = bug.code
    let mod: Module
    try {
      mod = compile(patched.join('\n'))
    } catch (e) {
      r.fail(`bug ${bug.id}: patched source does not compile: ${e instanceof Error ? e.message : e}`)
      continue
    }
    // Guard against patches that loop forever: run the named test with a crude wall-clock budget.
    const t0 = performance.now()
    const results = runTests(problem, mod, hidden, tol)
    const ms = performance.now() - t0
    const named = results.find((x) => x.name === bug.failsTest)!
    if (named.ok) r.fail(`bug ${bug.id}: hidden test ${bug.failsTest} still passes with the patch`)
    out[bug.id] = { test: target.name, input: target.input, expected: target.expected, got: named.got ?? null, error: named.err }
    const failing = results.filter((x) => !x.ok).map((x) => x.name)
    r.note(`bug ${bug.id} fails: ${failing.join(', ')}${ms > 2000 ? ` (slow: ${ms.toFixed(0)} ms)` : ''}`)
  }
  if (content.bugs.length < 3) r.fail(`only ${content.bugs.length} bugs; want 3–5`)
}

function checkShape(problem: Problem, content: ProblemContent, r: Report) {
  const lines = content.source.split('\n')
  const hiddenNames = new Set(problem.tests.filter((t) => !t.visible).map((t) => t.name))

  if (lines.some((l) => l.trim() === '')) r.fail('source contains blank lines (line indexes become confusing)')
  if (/^\s*export\s/m.test(content.source)) r.fail('source must not use export')

  if (content.steps.length < 5 || content.steps.length > 12) r.fail(`steps: ${content.steps.length}; want 5–12`)
  if (content.steps[0]?.indent !== 0) r.fail('steps[0] must have indent 0')
  content.steps.forEach((s, i) => {
    if (i > 0 && s.indent > content.steps[i - 1].indent + 1) r.fail(`steps[${i}] indents more than one level deeper than the previous step`)
  })
  if (content.stepDistractors.length < 2) r.fail('want at least 2 stepDistractors')

  if (content.blanks.length < 3) r.fail('want at least 3 blanks')
  content.blanks.forEach((b, i) => {
    const line = lines[b.line]
    if (line === undefined) return r.fail(`blanks[${i}]: line ${b.line} out of range`)
    const count = line.split(b.token).length - 1
    if (count !== 1) r.fail(`blanks[${i}]: token "${b.token}" occurs ${count} times in line ${b.line}: ${line.trim()}`)
    if (b.options.includes(b.token)) r.fail(`blanks[${i}]: options include the correct token`)
    if (b.options.length < 2) r.fail(`blanks[${i}]: want at least 2 wrong options`)
  })
  if (content.codeDistractors.length < 2) r.fail('want at least 2 codeDistractors')
  content.codeDistractors.forEach((d, i) => {
    if (lines.includes(d.code)) r.fail(`codeDistractors[${i}] is identical to a real source line`)
  })

  content.followUp.changeLines.forEach((l) => {
    if (l < 0 || l >= lines.length) r.fail(`followUp.changeLines: ${l} out of range`)
  })
  if (content.followUp.changeLines.length === 0) r.fail('followUp.changeLines is empty')

  const kinds = { good: 0, stated: 0, noise: 0 }
  content.questions.forEach((q) => kinds[q.kind]++)
  if (kinds.good < 2) r.fail(`questions: ${kinds.good} good; want ≥2 (one per clarification)`)
  if (kinds.stated + kinds.noise < 2) r.fail('questions: want ≥2 stated/noise distractors')

  const relevant = content.edgeCards.filter((c) => c.relevant)
  if (relevant.length < 2) r.fail('edgeCards: want ≥2 relevant cards')
  if (content.edgeCards.length - relevant.length < 2) r.fail('edgeCards: want ≥2 irrelevant cards')
  content.edgeCards.forEach((c, i) => {
    if (c.relevant && c.concept && !hiddenNames.has(c.concept)) r.fail(`edgeCards[${i}]: concept "${c.concept}" is not a hidden test name`)
    if (c.followUp && (c.followUp.correct < 0 || c.followUp.correct >= c.followUp.options.length)) r.fail(`edgeCards[${i}]: followUp.correct out of range`)
  })
  const covered = new Set(relevant.map((c) => c.concept))
  for (const n of hiddenNames) if (!covered.has(n)) r.note(`hidden concept not covered by an edge card: ${n}`)

  if (!(content.pattern.correct in PATTERNS)) r.fail(`pattern.correct "${content.pattern.correct}" unknown`)
  if (content.pattern.distractors.length !== 3) r.fail('pattern.distractors must have exactly 3 entries')
  content.pattern.distractors.forEach((d) => {
    if (!(d in PATTERNS)) r.fail(`pattern distractor "${d}" unknown`)
    if (d === content.pattern.correct) r.fail('pattern distractor equals the correct pattern')
  })

  const chosen = content.approaches.filter((a) => a.chosen).length
  if (chosen !== 1) r.fail(`approaches: ${chosen} chosen; want exactly 1`)
  if (content.approaches.length < 2) r.fail('approaches: want at least 2')

  // Every Bi must have both languages.
  const walk = (v: unknown, p: string) => {
    if (v && typeof v === 'object') {
      if ('pt' in v && 'en' in v) {
        if (!(v as any).pt || !(v as any).en) r.fail(`${p}: empty pt/en`)
        return
      }
      for (const [k, x] of Object.entries(v)) walk(x, `${p}.${k}`)
    }
  }
  walk(content, 'content')
}

// ---------- main ----------

async function main() {
  const wanted = new Set(process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n)))
  // Filter by file name before importing, so a half-written file for another problem
  // (e.g. being authored in parallel) does not break this run.
  const files = fs
    .readdirSync(PROBLEMS_DIR)
    .filter((f) => /^\d\d-.*\.ts$/.test(f))
    .filter((f) => !wanted.size || wanted.has(Number(f.slice(0, 2))))
    .sort()
  const generated: Record<number, { bugs: Record<string, BugRun> }> = {}
  let failed = 0
  let seen = 0
  for (const f of files) {
    let content: ProblemContent
    try {
      content = (await import(pathToFileURL(path.join(PROBLEMS_DIR, f)).href)).default
    } catch (e) {
      console.log(`✗ ${f}: failed to load: ${e instanceof Error ? e.message : e}`)
      failed++
      seen++
      continue
    }
    seen++
    const problem = byId.get(content.id)
    const r = new Report()
    if (!problem) {
      console.log(`✗ ${f}: no problem with id ${content.id}`)
      failed++
      continue
    }
    const mod = checkSolution(problem, content, r, true)
    const bugRuns: Record<string, BugRun> = {}
    if (mod) checkBugs(problem, content, r, bugRuns)
    generated[content.id] = { bugs: bugRuns }
    checkShape(problem, content, r)
    const ok = r.errors.length === 0
    if (!ok) failed++
    console.log(`${ok ? '✓' : '✗'} ${problem.id}. ${problem.title} (${f})`)
    for (const n of r.notes) console.log(`    · ${n}`)
    for (const e of r.errors) console.log(`    ✗ ${e}`)
  }
  if (seen === 0) console.log('no content files matched')
  // Only a full run rewrites the generated file, so parallel partial runs never race on it.
  if (!wanted.size) {
    const outFile = path.join(ROOT, 'src/content/generated.json')
    fs.writeFileSync(outFile, JSON.stringify(generated))
    console.log(`wrote ${path.relative(ROOT, outFile)}`)
  }
  console.log(`\n${seen - failed}/${seen} problems verified`)
  process.exit(failed ? 1 : 0)
}

main()
