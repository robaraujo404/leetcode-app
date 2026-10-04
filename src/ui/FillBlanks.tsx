// Parsons level 4 ("faded"): real code shown read-only, with one token per
// blank hidden behind a chip the user fills in from a shuffled option list.
import { useEffect, useState } from 'react'
import type { Blank } from '../content/schema'
import { BottomBar, Button } from './primitives'
import { useUI } from '../lib/i18n'
import { shuffle } from '../lib/shuffle'

export function FillBlanks({
  source,
  blanks,
  onDone,
  initialAnswers,
  onChange,
}: {
  source: string
  blanks: Blank[]
  onDone: (correct: boolean) => void
  /** Restores previously chosen answers (e.g. when switching back to level 4). */
  initialAnswers?: Record<number, string>
  /** Fires on every answer change, so a parent can cache it for later restoration. */
  onChange?: (answers: Record<number, string>) => void
}) {
  const ui = useUI()
  const lines = source.split('\n')
  const [answers, setAnswers] = useState<Record<number, string>>(initialAnswers ?? {})
  const [checked, setChecked] = useState(false)
  const [options] = useState(() => blanks.map((b) => shuffle([b.token, ...b.options])))

  useEffect(() => {
    onChange?.(answers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers])

  const byLine = new Map(blanks.map((b, i) => [b.line, i]))
  const allAnswered = blanks.every((_, i) => answers[i] !== undefined)

  function pick(blankIdx: number, value: string) {
    setAnswers((a) => ({ ...a, [blankIdx]: value }))
    setChecked(false)
  }

  function check() {
    setChecked(true)
    onDone(blanks.every((b, i) => answers[i] === b.token))
  }

  return (
    <div className="flex flex-col gap-4 pb-28">
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-[13px] leading-6 dark:bg-black">
        <code className="font-mono">
          {lines.map((line, li) => {
            const blankIdx = byLine.get(li)
            if (blankIdx === undefined) {
              return (
                <div key={li} className="flex">
                  <span className="mr-3 w-6 shrink-0 select-none text-right text-slate-500">{li}</span>
                  <span className="whitespace-pre text-slate-100">{line === '' ? ' ' : line}</span>
                </div>
              )
            }
            const b = blanks[blankIdx]
            const [pre, post] = line.split(b.token)
            const chosen = answers[blankIdx]
            const isCorrect = chosen === b.token
            return (
              <div key={li} className="flex">
                <span className="mr-3 w-6 shrink-0 select-none text-right text-slate-500">{li}</span>
                <span className="whitespace-pre text-slate-100">
                  {pre}
                  <span
                    className={`mx-0.5 inline-block rounded px-1.5 font-semibold ${
                      !chosen
                        ? 'bg-slate-700 text-slate-300'
                        : checked
                          ? isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                          : 'bg-violet-600 text-white'
                    }`}
                  >
                    {chosen ?? '?'}
                  </span>
                  {post}
                </span>
              </div>
            )
          })}
        </code>
      </pre>
      <div className="flex flex-col gap-3">
        {blanks.map((b, i) => (
          <div key={i}>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {ui.line} {b.line}
            </div>
            <div className="flex flex-wrap gap-2">
              {options[i].map((opt) => (
                <button
                  key={opt}
                  onClick={() => pick(i, opt)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-[13px] transition active:scale-95 ${
                    answers[i] === opt
                      ? 'border-violet-500 bg-violet-100 text-violet-900 dark:border-violet-400 dark:bg-violet-950 dark:text-violet-100'
                      : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <BottomBar className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button size="lg" className="w-full" onClick={check} disabled={!allAnswered}>
          {ui.check}
        </Button>
      </BottomBar>
    </div>
  )
}
