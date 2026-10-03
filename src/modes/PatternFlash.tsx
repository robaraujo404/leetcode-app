import { useEffect, useMemo, useState } from 'react'
import type { Problem } from '../content'
import { Button, Card, Timer } from '../ui/primitives'
import { PATTERNS } from '../content/patterns'
import { useT } from '../lib/i18n'
import { shuffle } from '../lib/shuffle'

const READ_TIME = 10

export function PatternFlashMode({ problem, onFinish }: { problem: Problem; onFinish: (correct: boolean) => void }) {
  const t = useT()
  const [seconds, setSeconds] = useState(READ_TIME)
  const [revealed, setRevealed] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)
  const options = useMemo(
    () => shuffle([problem.content.pattern.correct, ...problem.content.pattern.distractors]),
    [problem],
  )

  useEffect(() => {
    if (revealed) return
    if (seconds <= 0) {
      setRevealed(true)
      return
    }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seconds, revealed])

  function pick(p: string) {
    if (picked) return
    setPicked(p)
    onFinish(p === problem.content.pattern.correct)
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="text-center">
        <p className="text-[15px] text-slate-700 dark:text-slate-200">{problem.prompt}</p>
      </Card>
      {!revealed ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <Timer seconds={seconds} total={READ_TIME} />
          <Button variant="secondary" onClick={() => setRevealed(true)}>
            →
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {options.map((p) => {
            const isCorrect = p === problem.content.pattern.correct
            const show = picked !== null
            return (
              <button
                key={p}
                onClick={() => pick(p)}
                disabled={picked !== null}
                className={`rounded-xl border p-3 text-left font-medium transition active:scale-[0.99] ${
                  show
                    ? isCorrect
                      ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950'
                      : p === picked
                        ? 'border-rose-400 bg-rose-50 dark:border-rose-600 dark:bg-rose-950'
                        : 'border-slate-200 bg-white opacity-60 dark:border-slate-800 dark:bg-slate-900'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                {t(PATTERNS[p])}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
