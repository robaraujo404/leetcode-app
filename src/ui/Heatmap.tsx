import { PROBLEMS } from '../content'
import { getMastery, MODE_IDS, type ModeId } from '../lib/storage'
import { useUI } from '../lib/i18n'

const MODE_GROUP_LABELS: Record<string, ModeId[]> = {
  P: ['parsons'],
  I: ['interviewer', 'edge'],
  F: ['pattern', 'complexity'],
  D: ['bug', 'changes', 'log'],
}

function boxColor(box: number): string {
  if (box <= 0) return 'bg-slate-200 dark:bg-slate-800'
  if (box === 1) return 'bg-rose-300 dark:bg-rose-800'
  if (box === 2) return 'bg-amber-300 dark:bg-amber-700'
  if (box === 3) return 'bg-amber-200 dark:bg-amber-600'
  if (box === 4) return 'bg-emerald-300 dark:bg-emerald-700'
  return 'bg-emerald-500 dark:bg-emerald-500'
}

export function Heatmap({ onPick }: { onPick: (problemId: number) => void }) {
  const ui = useUI()
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="w-8" />
            {Object.keys(MODE_GROUP_LABELS).map((g) => (
              <th key={g} className="pb-1 text-[11px] font-medium text-slate-400">
                {g}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PROBLEMS.map((p) => (
            <tr key={p.id}>
              <td
                onClick={() => onPick(p.id)}
                className="cursor-pointer whitespace-nowrap pr-1 text-right text-[11px] text-slate-500 dark:text-slate-400"
                title={p.title}
              >
                {p.id}
              </td>
              {Object.values(MODE_GROUP_LABELS).map((modes, gi) => {
                const box = Math.round(Math.max(0, ...modes.map((m) => getMastery(p.id, m))))
                return (
                  <td key={gi} onClick={() => onPick(p.id)} className="cursor-pointer">
                    <div className={`h-5 w-5 rounded-md ${boxColor(box)}`} />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-slate-400">
        P = {ui.modes.parsons} · I = {ui.modes.interviewer}/{ui.modes.edge} · F = {ui.modes.pattern}/{ui.modes.complexity} · D ={' '}
        {ui.modes.bug}/{ui.modes.changes}/{ui.modes.log}
      </p>
    </div>
  )
}

export function unusedModeIds(): ModeId[] {
  return MODE_IDS
}
