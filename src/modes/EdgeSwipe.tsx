import { useMemo, useState } from 'react'
import type { Problem } from '../content'
import { Button, Card, ProgressBar } from '../ui/primitives'
import { useT, useUI } from '../lib/i18n'
import { shuffle } from '../lib/shuffle'

export function EdgeSwipeMode({ problem, onFinish }: { problem: Problem; onFinish: (correct: boolean) => void }) {
  const t = useT()
  const ui = useUI()
  const cards = useMemo(() => shuffle(problem.content.edgeCards), [problem])
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const [phase, setPhase] = useState<'card' | 'quiz' | 'feedback'>('card')
  const [lastRight, setLastRight] = useState(false)
  const [fly, setFly] = useState<'left' | 'right' | null>(null)

  if (i >= cards.length) return null
  const card = cards[i]

  function swipe(dir: 'left' | 'right') {
    if (phase !== 'card') return
    const guessedRelevant = dir === 'right'
    const right = guessedRelevant === card.relevant
    setFly(dir)
    setLastRight(right)
    setScore((s) => s + (right ? 1 : 0))
    setMaxScore((m) => m + 1)
    setTimeout(() => {
      setFly(null)
      setPhase(right && card.relevant && card.followUp ? 'quiz' : 'feedback')
    }, 180)
  }

  function answerQuiz(idx: number) {
    const right = idx === card.followUp!.correct
    setScore((s) => s + (right ? 1 : 0))
    setMaxScore((m) => m + 1)
    setLastRight(right)
    setPhase('feedback')
  }

  function next() {
    const isLast = i + 1 >= cards.length
    setPhase('card')
    setI((v) => v + 1)
    if (isLast) onFinish(maxScore > 0 && score / maxScore >= 0.8)
  }

  return (
    <div className="flex flex-col gap-4">
      <ProgressBar value={i} max={cards.length} />
      <div className="relative min-h-56">
        <Card
          className={`flex min-h-56 items-center justify-center text-center transition-all duration-150 ${
            fly === 'right'
              ? 'translate-x-[120%] rotate-6 opacity-0'
              : fly === 'left'
                ? '-translate-x-[120%] -rotate-6 opacity-0'
                : ''
          }`}
        >
          {phase === 'quiz' && card.followUp ? (
            <div className="flex w-full flex-col gap-3">
              <p className="text-[15px] font-medium text-slate-800 dark:text-slate-100">{t(card.followUp.question)}</p>
              <div className="flex flex-col gap-2">
                {card.followUp.options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => answerQuiz(oi)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm active:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:active:bg-slate-800"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[17px] font-medium text-slate-800 dark:text-slate-100">{t(card.text)}</p>
          )}
        </Card>
      </div>
      {phase === 'feedback' ? (
        <div
          className={`rounded-xl p-3 text-sm ${
            lastRight
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
          }`}
        >
          <p className="mb-1 font-semibold">{card.relevant ? `✓ ${ui.relevant}` : `✕ ${ui.irrelevant}`}</p>
          <p>{t(card.why)}</p>
        </div>
      ) : null}
      {phase === 'card' ? (
        <div className="flex gap-3">
          <Button variant="secondary" size="lg" className="flex-1" onClick={() => swipe('left')}>
            ← {ui.irrelevant}
          </Button>
          <Button size="lg" className="flex-1" onClick={() => swipe('right')}>
            {ui.relevant} →
          </Button>
        </div>
      ) : phase === 'feedback' ? (
        <Button size="lg" onClick={next}>
          {i + 1 >= cards.length ? ui.finish : ui.next}
        </Button>
      ) : null}
    </div>
  )
}
