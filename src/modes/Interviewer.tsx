import { useState } from 'react'
import type { Problem } from '../content'
import { BottomBar, Button, Card } from '../ui/primitives'
import { AudioButton } from '../ui/AudioButton'
import { useT, useUI } from '../lib/i18n'
import { shuffle } from '../lib/shuffle'

const BUDGET = 150

export function InterviewerMode({ problem, onFinish }: { problem: Problem; onFinish: (correct: boolean) => void }) {
  const t = useT()
  const ui = useUI()
  const c = problem.content
  const [order] = useState(() => shuffle(c.questions.map((_, i) => i)))
  const [asked, setAsked] = useState<number[]>([])
  const [done, setDone] = useState(false)

  const spent = asked.reduce((s, i) => s + c.questions[i].cost, 0)
  const remaining = Math.max(0, BUDGET - spent)
  const goodTotal = c.questions.filter((q) => q.kind === 'good').length
  const goodAsked = asked.filter((i) => c.questions[i].kind === 'good').length
  const wasted = asked.length - goodAsked

  function ask(i: number) {
    if (done || asked.includes(i)) return
    if (spent + c.questions[i].cost > BUDGET) return
    setAsked((a) => [...a, i])
  }

  function finish() {
    setDone(true)
    onFinish(goodAsked === goodTotal && wasted <= 1)
  }

  return (
    <div className="flex flex-col gap-4 pb-28">
      <Card>
        <div className="flex items-start gap-2">
          <p className="flex-1 text-[14px] text-slate-700 dark:text-slate-200">{problem.prompt}</p>
          <AudioButton slug={problem.slug} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {problem.constraints.map((con, i) => (
            <span
              key={i}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            >
              {con}
            </span>
          ))}
        </div>
      </Card>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">
          {goodAsked}/{goodTotal} {ui.good} · {wasted} {ui.wasted}
        </span>
        <span className={`font-mono tabular-nums ${remaining < 30 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
          {remaining}s
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {order.map((i) => {
          const q = c.questions[i]
          const isAsked = asked.includes(i)
          return (
            <button
              key={i}
              onClick={() => ask(i)}
              disabled={done || isAsked}
              className={`rounded-xl border p-3 text-left transition active:scale-[0.99] disabled:active:scale-100 ${
                isAsked
                  ? q.kind === 'good'
                    ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950'
                    : 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <p className="text-[14px] font-medium text-slate-800 dark:text-slate-100">{t(q.text)}</p>
              {isAsked ? (
                <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-300">{t(q.reply)}</p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-400">-{q.cost}s</p>
              )}
            </button>
          )
        })}
      </div>
      <BottomBar className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button size="lg" className="w-full" onClick={finish} disabled={done}>
          {ui.finish}
        </Button>
      </BottomBar>
    </div>
  )
}
