import { PROBLEM_BY_ID } from '../content'
import { useNav } from '../lib/nav'
import { useUI } from '../lib/i18n'
import { Card, Screen } from '../ui/primitives'
import { AudioButton } from '../ui/AudioButton'
import { MODE_IDS, getMastery } from '../lib/storage'

export function ModeHub({ problemId }: { problemId: number }) {
  const nav = useNav()
  const ui = useUI()
  const problem = PROBLEM_BY_ID.get(problemId)
  if (!problem) return null
  return (
    <Screen title={`${problem.id}. ${problem.title}`}>
      <div className="flex flex-col gap-4">
        <Card>
          <div className="flex items-start gap-2">
            <p className="flex-1 text-[14px] text-slate-700 dark:text-slate-200">{problem.prompt}</p>
            <AudioButton slug={problem.slug} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {problem.constraints.map((c, i) => (
              <span
                key={i}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              >
                {c}
              </span>
            ))}
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {MODE_IDS.map((mode) => {
            const box = getMastery(problem.id, mode)
            return (
              <Card
                key={mode}
                onClick={() => nav.push({ name: 'mode', problemId: problem.id, mode })}
                className="flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{ui.modes[mode]}</span>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      box === 0 ? 'bg-slate-300 dark:bg-slate-700' : box < 3 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">{ui.modeShort[mode]}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </Screen>
  )
}
