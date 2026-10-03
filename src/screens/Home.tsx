import { useNav } from '../lib/nav'
import { useLang, useUI } from '../lib/i18n'
import { Button, Card, Screen } from '../ui/primitives'
import { Heatmap } from '../ui/Heatmap'
import { getStreak } from '../lib/storage'
import { PROBLEMS } from '../content'

export function Home() {
  const nav = useNav()
  const ui = useUI()
  const { lang, setLang } = useLang()
  const streak = getStreak()

  return (
    <Screen
      title="Algo Trainer"
      right={
        <div className="flex overflow-hidden rounded-full border border-slate-300 text-xs dark:border-slate-700">
          <button
            onClick={() => setLang('pt')}
            className={`px-2 py-1 font-semibold ${lang === 'pt' ? 'bg-violet-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}
          >
            PT
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-1 font-semibold ${lang === 'en' ? 'bg-violet-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}
          >
            EN
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="text-3xl font-bold leading-none text-slate-900 dark:text-slate-50">{streak.count}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {ui.streak} ({ui.days})
            </p>
          </div>
          <Button size="lg" onClick={() => nav.push({ name: 'session' })}>
            {ui.practice5}
          </Button>
        </Card>

        <Card onClick={() => nav.push({ name: 'problems' })} className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{ui.problems}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{PROBLEMS.length} · screen phase</p>
          </div>
          <span className="text-xl text-slate-400">›</span>
        </Card>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{ui.mastery}</p>
          <Heatmap onPick={(id) => nav.push({ name: 'hub', problemId: id })} />
        </div>
      </div>
    </Screen>
  )
}
