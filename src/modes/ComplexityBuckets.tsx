import { useMemo, useState } from 'react'
import type { Problem } from '../content'
import { BottomBar, Button, Card, Chip } from '../ui/primitives'
import { useT, useUI } from '../lib/i18n'
import { shuffle } from '../lib/shuffle'

export function ComplexityBucketsMode({ problem, onFinish }: { problem: Problem; onFinish: (correct: boolean) => void }) {
  const t = useT()
  const ui = useUI()
  const approaches = useMemo(
    () => shuffle(problem.content.approaches.map((a, i) => ({ ...a, id: i }))),
    [problem],
  )
  const buckets = useMemo(
    () => Array.from(new Set(problem.content.approaches.map((a) => a.time))),
    [problem],
  )
  const [assign, setAssign] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  function assignBucket(id: number, bucket: string) {
    if (checked) return
    setAssign((a) => ({ ...a, [id]: bucket }))
  }

  function check() {
    setChecked(true)
    onFinish(approaches.every((a) => assign[a.id] === a.time))
  }

  const allAssigned = approaches.every((a) => assign[a.id] !== undefined)

  return (
    <div className="flex flex-col gap-4 pb-24">
      <p className="text-sm text-slate-500 dark:text-slate-400">{problem.prompt}</p>
      {approaches.map((a) => (
        <Card key={a.id}>
          <p className="font-medium text-slate-800 dark:text-slate-100">{t(a.name)}</p>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{t(a.why)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {buckets.map((b) => {
              const isAssigned = assign[a.id] === b
              const tone = checked ? (b === a.time ? 'good' : isAssigned ? 'bad' : 'neutral') : 'neutral'
              return (
                <Chip key={b} active={isAssigned} tone={tone} onClick={() => assignBucket(a.id, b)} className="font-mono">
                  {b}
                </Chip>
              )
            })}
          </div>
        </Card>
      ))}
      <BottomBar className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button size="lg" className="w-full" onClick={check} disabled={!allAssigned || checked}>
          {ui.check}
        </Button>
      </BottomBar>
    </div>
  )
}
