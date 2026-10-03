import { useState } from 'react'
import { PROBLEM_BY_ID, SCREEN_PROBLEMS } from '../content'
import { buildQueue, recordResult, MODE_IDS, type QueueItem } from '../lib/storage'
import { useNav } from '../lib/nav'
import { useUI } from '../lib/i18n'
import { Screen, ProgressBar, ResultBanner, Card, Button } from '../ui/primitives'
import { MODE_COMPONENTS } from '../modes'

// Parsons is excluded: it's multi-level free practice with no single round,
// which doesn't fit a quick auto-advancing queue.
const SESSION_MODES = MODE_IDS.filter((m) => m !== 'parsons')
const SESSION_SIZE = 8

export function Session() {
  const nav = useNav()
  const ui = useUI()
  const [queue] = useState<QueueItem[]>(() =>
    buildQueue(SCREEN_PROBLEMS.map((p) => p.id), SESSION_SIZE, SESSION_MODES),
  )
  const [index, setIndex] = useState(0)
  const [result, setResult] = useState<boolean | null>(null)

  if (queue.length === 0) {
    return (
      <Screen title={ui.practice5}>
        <Card>
          <p className="text-sm text-slate-600 dark:text-slate-300">{ui.emptyQueue}</p>
        </Card>
      </Screen>
    )
  }

  if (index >= queue.length) {
    return (
      <Screen title={ui.practice5}>
        <Card className="text-center">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{ui.sessionDone}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{ui.sessionDoneDesc}</p>
          <Button className="mt-4" onClick={() => nav.pop()}>
            {ui.home}
          </Button>
        </Card>
      </Screen>
    )
  }

  const item = queue[index]
  const problem = PROBLEM_BY_ID.get(item.problemId)!
  const Comp = MODE_COMPONENTS[item.mode]

  function handleFinish(correct: boolean) {
    recordResult(item.problemId, item.mode, correct)
    setResult(correct)
  }
  function advance() {
    setResult(null)
    setIndex((i) => i + 1)
  }

  return (
    <Screen title={`${problem.id}. ${ui.modes[item.mode]}`}>
      <div className="mb-3">
        <ProgressBar value={index} max={queue.length} />
      </div>
      <Comp key={`${item.problemId}-${item.mode}-${index}`} problem={problem} onFinish={handleFinish} />
      {result !== null ? (
        <ResultBanner
          correct={result}
          label={result ? ui.correct : ui.incorrect}
          onContinue={advance}
          continueLabel={index + 1 >= queue.length ? ui.finish : ui.next}
        />
      ) : null}
    </Screen>
  )
}
