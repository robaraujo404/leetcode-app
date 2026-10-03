import { PROBLEMS } from '../content'
import { useNav } from '../lib/nav'
import { useUI } from '../lib/i18n'
import { Card, Screen } from '../ui/primitives'
import { getProblemMastery } from '../lib/storage'

function masteryColor(v: number) {
  if (v <= 0) return 'bg-slate-300 dark:bg-slate-700'
  if (v < 1.5) return 'bg-rose-400'
  if (v < 3) return 'bg-amber-400'
  return 'bg-emerald-500'
}

export function ProblemList() {
  const nav = useNav()
  const ui = useUI()
  return (
    <Screen title={ui.problems}>
      <div className="flex flex-col gap-2">
        {PROBLEMS.map((p) => (
          <Card key={p.id} onClick={() => nav.push({ name: 'hub', problemId: p.id })} className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {p.id}
            </span>
            <span className="flex-1 truncate text-[15px] font-medium text-slate-800 dark:text-slate-100">{p.title}</span>
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${masteryColor(getProblemMastery(p.id))}`} />
          </Card>
        ))}
      </div>
    </Screen>
  )
}
