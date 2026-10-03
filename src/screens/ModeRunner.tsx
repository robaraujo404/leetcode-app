import { useState } from 'react'
import { PROBLEM_BY_ID } from '../content'
import { useNav } from '../lib/nav'
import { useUI } from '../lib/i18n'
import { Screen, ResultBanner } from '../ui/primitives'
import { recordResult, type ModeId } from '../lib/storage'
import { MODE_COMPONENTS } from '../modes'

// Parsons is multi-level free practice (the user switches levels inside the
// mode itself); it has no single "round" end, so it gets no result banner —
// the back button in the header is how you leave it.
const NO_BANNER: ModeId[] = ['parsons']

export function ModeRunner({ problemId, mode }: { problemId: number; mode: ModeId }) {
  const nav = useNav()
  const ui = useUI()
  const problem = PROBLEM_BY_ID.get(problemId)
  const [result, setResult] = useState<boolean | null>(null)
  if (!problem) return null

  function handleFinish(correct: boolean) {
    recordResult(problem!.id, mode, correct)
    if (!NO_BANNER.includes(mode)) setResult(correct)
  }

  const Comp = MODE_COMPONENTS[mode]

  return (
    <Screen title={ui.modes[mode]}>
      <Comp problem={problem} onFinish={handleFinish} />
      {result !== null ? (
        <ResultBanner
          correct={result}
          label={result ? ui.correct : ui.incorrect}
          onContinue={() => nav.pop()}
          continueLabel={ui.continue}
        />
      ) : null}
    </Screen>
  )
}
