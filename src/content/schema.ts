// Typed content for one problem. Static metadata (prompt, constraints,
// clarifications, visible/hidden tests, follow-ups) lives in data/tests.json;
// this schema holds only what the training modes add on top of it.

export type Lang = 'pt' | 'en'
export type Bi = { pt: string; en: string }

export type PatternId =
  | 'graph-bfs'
  | 'grid-bfs'
  | 'multi-source-bfs'
  | 'dfs-flood-fill'
  | 'union-find'
  | 'topo-sort'
  | 'topo-sort-heap'
  | 'dijkstra'
  | 'bellman-ford'
  | 'sweep-line'
  | 'sort-intervals'
  | 'heap'
  | 'monotonic-deque'
  | 'binary-search'
  | 'two-pointers'
  | 'hash-map-count'
  | 'bucket-sort'
  | 'quickselect'
  | 'trie'
  | 'trie-dfs'
  | 'hierholzer'
  | 'hash-map-linked-list'
  | 'queue-window'
  | 'tree-recursion'
  | 'linked-list-pointers'
  | 'greedy'
  | 'simulation-heap'
  | 'candidate-enumeration'
  | 'dp'
  | 'backtracking'
  | 'prefix-sum'

/** A pseudocode step used by Parsons levels 1–3. `indent` is the nesting depth. */
export interface Step {
  text: Bi
  indent: number
  /** When set and shared with the immediately adjacent step(s) at the same indent,
   *  those steps may appear in any relative order among themselves — they're
   *  independent (neither reads what the other writes). Must be contiguous. */
  group?: number
}

/** A wrong step mixed in at level 3. `why` is shown when the user picks it. */
export interface StepDistractor extends Step {
  why: Bi
}

/** Level 4: one token of a source line is hidden and chosen from `options`. */
export interface Blank {
  /** 0-based index into `source.split('\n')`. */
  line: number
  /** Exact substring of that line to hide. Must occur exactly once in the line. */
  token: string
  /** Wrong alternatives; the correct answer is `token`. */
  options: string[]
}

/** Level 5: a wrong real-code line mixed in. */
export interface CodeDistractor {
  code: string
  why: Bi
}

/** Bug hunt + Log where?: one patched line that makes a hidden test fail. */
export interface Bug {
  id: string
  /** 0-based line index in `source` that is replaced. */
  line: number
  /** Replacement for that line (keep the leading indentation). */
  code: string
  /** Name of the hidden test (from tests.json) this bug makes fail. Verified by scripts/verify.ts. */
  failsTest: string
  why: Bi
  /** Line index where a print/log would reveal the bug fastest, given `failsTest` output. */
  logLine: number
  logWhy: Bi
}

export interface FollowUp {
  task: Bi
  /** Line indexes of `source` that must change (or where lines get inserted) for the follow-up. */
  changeLines: number[]
  explanation: Bi
}

export type QuestionKind =
  /** Reveals a clarification the interviewer only gives when asked. */
  | 'good'
  /** The prompt or constraints already answer it; wastes time. */
  | 'stated'
  /** Irrelevant to this problem; wastes time. */
  | 'noise'

export interface InterviewerQuestion {
  text: Bi
  kind: QuestionKind
  /** Seconds of the mock clock this question costs. */
  cost: number
  /** What the interviewer answers. For `good`, this is the clarification. */
  reply: Bi
}

export interface EdgeCard {
  text: Bi
  /** true = this is a real edge case for the problem; false = irrelevant / covered by constraints. */
  relevant: boolean
  /** Hidden test name this card corresponds to, when relevant. */
  concept?: string
  /** Asked after a relevant card is swiped right. */
  followUp?: {
    question: Bi
    options: string[]
    correct: number
  }
  why: Bi
}

export interface Approach {
  name: Bi
  time: string
  space: string
  /** The approach the reference solution uses. Exactly one per problem. */
  chosen: boolean
  why: Bi
}

export interface ProblemContent {
  /** Matches `id` in data/tests.json. */
  id: number
  /** Runnable TypeScript source. One function (or class) named as in tests.json `signature.function`.
   *  No `export`. Avoid blank lines: line indexes elsewhere refer to `source.split('\n')`.
   *  First line is the signature/class header and last line is the closing brace; both are pinned in Parsons mode. */
  source: string
  /** Parsons levels 1–3. 5–12 steps, in correct order with correct indentation. */
  steps: Step[]
  /** Level 3 distractors (2–4). */
  stepDistractors: StepDistractor[]
  /** Level 4 blanks (3–6). */
  blanks: Blank[]
  /** Level 5 distractors (2–4). */
  codeDistractors: CodeDistractor[]
  /** 3–5 bugs, each failing a different hidden test when possible. */
  bugs: Bug[]
  followUp: FollowUp
  /** 6–9 questions: 3–4 good (one per clarification), 2–3 stated, 1–2 noise. */
  questions: InterviewerQuestion[]
  /** 6–9 cards: one per hidden concept (relevant) plus 2–4 irrelevant. */
  edgeCards: EdgeCard[]
  pattern: {
    correct: PatternId
    /** Three wrong patterns shown alongside the correct one. */
    distractors: PatternId[]
  }
  /** 2–3 approaches; exactly one `chosen`. */
  approaches: Approach[]
}
