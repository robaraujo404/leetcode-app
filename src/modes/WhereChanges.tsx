import { useState } from 'react'
import type { Problem } from '../content'
import { CodeLines } from '../ui/CodeLines'
import { BottomBar, Button, Card } from '../ui/primitives'
import { useT, useUI } from '../lib/i18n'

export function WhereChangesMode({ problem, onFinish }: { problem: Problem; onFinish: (correct: boolean) => void }) {
  const t = useT()
  const ui = useUI()
  const lines = problem.content.source.split('\n')
  const [selected, setSelected] = useState<number[]>([])
  const [checked, setChecked] = useState(false)
  const correctSet = problem.content.followUp.changeLines

  function toggle(i: number) {
    if (checked) return
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))
  }

  function check() {
    setChecked(true)
    const a = new Set(selected)
    const b = new Set(correctSet)
    onFinish(a.size === b.size && [...a].every((x) => b.has(x)))
  }

  const extra = selected.filter((l) => !correctSet.includes(l))

  return (
    <div className="flex flex-col gap-4 pb-24">
      <Card>
        <p className="text-[14px] text-slate-700 dark:text-slate-200">{t(problem.content.followUp.task)}</p>
      </Card>
      <CodeLines
        lines={lines}
        onTapLine={checked ? undefined : toggle}
        selected={!checked ? selected : []}
        correct={checked ? correctSet : []}
        wrong={checked ? extra : []}
      />
      {checked ? (
        <div className="rounded-xl bg-violet-50 p-3 text-sm text-violet-900 dark:bg-violet-950 dark:text-violet-100">
          {t(problem.content.followUp.explanation)}
        </div>
      ) : null}
      <BottomBar className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button size="lg" className="w-full" onClick={check} disabled={checked || selected.length === 0}>
          {ui.check}
        </Button>
      </BottomBar>
    </div>
  )
}
