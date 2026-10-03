import { useMemo, useState } from 'react'
import type { Problem } from '../content'
import { CodeLines } from '../ui/CodeLines'
import { Card } from '../ui/primitives'
import { useT, useUI } from '../lib/i18n'
import { shuffle } from '../lib/shuffle'

export function BugHuntMode({ problem, onFinish }: { problem: Problem; onFinish: (correct: boolean) => void }) {
  const t = useT()
  const ui = useUI()
  const bug = useMemo(() => shuffle(problem.content.bugs)[0], [problem])
  const run = problem.bugRuns[bug.id]
  const lines = useMemo(() => {
    const ls = problem.content.source.split('\n')
    ls[bug.line] = bug.code
    return ls
  }, [problem, bug])
  const [picked, setPicked] = useState<number | null>(null)

  function tap(i: number) {
    if (picked !== null) return
    setPicked(i)
    onFinish(i === bug.line)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {ui.hiddenTest}: {bug.failsTest}
        </p>
        {run ? (
          <p className="mt-1 font-mono text-[12px] text-slate-600 dark:text-slate-300">
            {ui.inputLabel} {JSON.stringify(run.input)} → {ui.expectedLabel} {JSON.stringify(run.expected)}, {ui.gotLabel}{' '}
            {run.error ? `${ui.errorLabel}: ${run.error}` : JSON.stringify(run.got)}
          </p>
        ) : null}
      </Card>
      <CodeLines
        lines={lines}
        onTapLine={tap}
        correct={picked !== null ? [bug.line] : []}
        wrong={picked !== null && picked !== bug.line ? [picked] : []}
      />
      {picked !== null ? (
        <div
          className={`rounded-xl p-3 text-sm ${
            picked === bug.line
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
          }`}
        >
          {t(bug.why)}
        </div>
      ) : null}
    </div>
  )
}
