// Merges the pack's source of truth (data/tests.json) with the derived training
// content (src/content/problems/*.ts) and the bug-run outputs captured by
// scripts/verify.ts (src/content/generated.json) into one Problem the UI consumes.
import rawTests from '../../data/tests.json'
import generated from './generated.json'
import { PROBLEMS_CONTENT } from './problems'
import type { ProblemContent } from './schema'

export interface TestCase {
  name: string
  concept?: string
  input: unknown
  expected: unknown
  visible: boolean
}

export interface RawProblem {
  id: number
  title: string
  source: string
  slug: string
  phase: 'screen' | 'onsite'
  timer_minutes: number
  prompt: string
  constraints: string[]
  signature: { function: string; params: { name: string; type: string }[]; returns: string; notes: string }
  clarifications: string[]
  tests: TestCase[]
  performance: {
    shape: string
    expected_reasoning: string
    mock_runtime_target: string
    time_limit_seconds: number
    fixture: string | null
  }
  follow_up_code: string[]
  follow_up_design: string[]
}

export interface BugRun {
  test: string
  input: unknown
  expected: unknown
  got: unknown
  error?: string
}

export interface Problem extends Omit<RawProblem, 'source'> {
  content: ProblemContent
  bugRuns: Record<string, BugRun>
}

const RAW = rawTests as unknown as RawProblem[]
const rawById = new Map(RAW.map((p) => [p.id, p]))
const generatedById = generated as unknown as Record<string, { bugs: Record<string, BugRun> }>

export const PROBLEMS: Problem[] = Object.values(PROBLEMS_CONTENT)
  .sort((a, b) => a.id - b.id)
  .map((content) => {
    const raw = rawById.get(content.id)
    if (!raw) throw new Error(`no data/tests.json entry for problem ${content.id}`)
    const { source: _rawSource, ...rest } = raw
    return {
      ...rest,
      content,
      bugRuns: generatedById[String(content.id)]?.bugs ?? {},
    }
  })

export const PROBLEM_BY_ID = new Map(PROBLEMS.map((p) => [p.id, p]))

export const SCREEN_PROBLEMS = PROBLEMS.filter((p) => p.phase === 'screen')
export const ONSITE_PROBLEMS = PROBLEMS.filter((p) => p.phase === 'onsite')
