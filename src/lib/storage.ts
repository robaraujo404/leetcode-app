// Progress + spaced repetition, all in localStorage. One record per (problemId, mode).
// Leitner-style: a correct answer moves the item to a longer box; a miss drops it to box 1
// (due again soon). The "practice 5 min" session pulls whatever is most overdue.

export type ModeId =
  | 'parsons'
  | 'interviewer'
  | 'edge'
  | 'pattern'
  | 'complexity'
  | 'bug'
  | 'changes'
  | 'log'

export const MODE_IDS: ModeId[] = [
  'parsons',
  'interviewer',
  'edge',
  'pattern',
  'complexity',
  'bug',
  'changes',
  'log',
]

export interface Record_ {
  box: number // 0 = never attempted, 1-5 = Leitner box
  attempts: number
  correct: number
  lastResult: boolean | null
  dueAt: number // epoch ms
  updatedAt: number
}

const PROGRESS_KEY = 'algo-trainer:progress:v1'
const STREAK_KEY = 'algo-trainer:streak:v1'

// Days to wait before an item in this box comes due again.
const BOX_INTERVAL_DAYS = [0, 0, 1, 3, 7, 16]
const DAY_MS = 24 * 60 * 60 * 1000

function key(problemId: number, mode: ModeId) {
  return `${problemId}:${mode}`
}

function readAll(): Record<string, Record_> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAll(data: Record<string, Record_>) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data))
  } catch {
    /* ignore (private mode / quota) */
  }
}

export function getRecord(problemId: number, mode: ModeId): Record_ {
  const all = readAll()
  return all[key(problemId, mode)] ?? { box: 0, attempts: 0, correct: 0, lastResult: null, dueAt: 0, updatedAt: 0 }
}

export function recordResult(problemId: number, mode: ModeId, correct: boolean): Record_ {
  const all = readAll()
  const k = key(problemId, mode)
  const prev = all[k] ?? { box: 0, attempts: 0, correct: 0, lastResult: null, dueAt: 0, updatedAt: 0 }
  const box = correct ? Math.min(5, Math.max(1, prev.box + 1)) : 1
  const now = Date.now()
  const next: Record_ = {
    box,
    attempts: prev.attempts + 1,
    correct: prev.correct + (correct ? 1 : 0),
    lastResult: correct,
    dueAt: now + BOX_INTERVAL_DAYS[box] * DAY_MS,
    updatedAt: now,
  }
  all[k] = next
  writeAll(all)
  touchStreak()
  return next
}

/** For the heatmap: 0 = untried, 1-5 = current Leitner box (higher = stronger). */
export function getMastery(problemId: number, mode: ModeId): number {
  return getRecord(problemId, mode).box
}

export function getProblemMastery(problemId: number): number {
  const boxes = MODE_IDS.map((m) => getMastery(problemId, m))
  const tried = boxes.filter((b) => b > 0)
  if (tried.length === 0) return 0
  return tried.reduce((a, b) => a + b, 0) / MODE_IDS.length
}

export interface QueueItem {
  problemId: number
  mode: ModeId
  dueAt: number
  box: number
}

/** Items due now, most overdue first; falls back to least-practiced items when nothing is due. */
export function buildQueue(problemIds: number[], count: number, modes: ModeId[] = MODE_IDS): QueueItem[] {
  const now = Date.now()
  const items: QueueItem[] = []
  for (const pid of problemIds) {
    for (const mode of modes) {
      const r = getRecord(pid, mode)
      items.push({ problemId: pid, mode, dueAt: r.box === 0 ? 0 : r.dueAt, box: r.box })
    }
  }
  const due = items.filter((i) => i.dueAt <= now)
  due.sort((a, b) => a.box - b.box || a.dueAt - b.dueAt)
  if (due.length >= count) return due.slice(0, count)
  const rest = items
    .filter((i) => i.dueAt > now)
    .sort((a, b) => a.box - b.box || a.dueAt - b.dueAt)
  return [...due, ...rest].slice(0, count)
}

export interface Streak {
  count: number
  lastDay: string // YYYY-MM-DD
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getStreak(): Streak {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    return raw ? JSON.parse(raw) : { count: 0, lastDay: '' }
  } catch {
    return { count: 0, lastDay: '' }
  }
}

function touchStreak() {
  const s = getStreak()
  const t = today()
  if (s.lastDay === t) return
  const yesterday = new Date(Date.now() - DAY_MS).toISOString().slice(0, 10)
  const count = s.lastDay === yesterday ? s.count + 1 : 1
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify({ count, lastDay: t }))
  } catch {
    /* ignore */
  }
}
