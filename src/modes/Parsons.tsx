import { useMemo, useState } from 'react'
import type { Problem } from '../content'
import { BankOrderPuzzle, type Tile } from '../ui/BankOrderPuzzle'
import { FillBlanks } from '../ui/FillBlanks'
import { Chip } from '../ui/primitives'
import { useT, useUI } from '../lib/i18n'
import { shuffle } from '../lib/shuffle'

export function ParsonsMode({ problem, onFinish }: { problem: Problem; onFinish: (correct: boolean) => void }) {
  const t = useT()
  const ui = useUI()
  const [level, setLevel] = useState(1)
  const c = problem.content

  const puzzle = useMemo(() => {
    if (level === 4) return null
    if (level === 5) {
      const sourceLines = c.source.split('\n')
      const correctTiles: Tile[] = sourceLines.map((line, i) => ({ id: `line${i}`, text: line }))
      const distractorTiles: Tile[] = c.codeDistractors.map((d, i) => ({
        id: `cd${i}`,
        text: d.code,
        isDistractor: true,
        why: t(d.why),
      }))
      return {
        tiles: shuffle([...correctTiles, ...distractorTiles]),
        correctOrderIds: correctTiles.map((x) => x.id),
        indentMode: false,
        monospace: true,
      }
    }
    const stepTiles: Tile[] = c.steps.map((s, i) => ({ id: `step${i}`, text: t(s.text), indent: s.indent }))
    const distractorTiles: Tile[] =
      level === 3
        ? c.stepDistractors.map((d, i) => ({
            id: `sd${i}`,
            text: t(d.text),
            indent: d.indent,
            isDistractor: true,
            why: t(d.why),
          }))
        : []
    return {
      tiles: shuffle([...stepTiles, ...distractorTiles]),
      correctOrderIds: stepTiles.map((x) => x.id),
      indentMode: level >= 2,
      monospace: false,
    }
  }, [level, c, t])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5].map((lv) => (
          <Chip key={lv} active={level === lv} onClick={() => setLevel(lv)}>
            {ui.level} {lv}
          </Chip>
        ))}
      </div>
      {level === 4 ? (
        <FillBlanks key={`${problem.id}-4`} source={c.source} blanks={c.blanks} onDone={onFinish} />
      ) : puzzle ? (
        <BankOrderPuzzle
          key={`${problem.id}-${level}`}
          tiles={puzzle.tiles}
          correctOrderIds={puzzle.correctOrderIds}
          indentMode={puzzle.indentMode}
          monospace={puzzle.monospace}
          onDone={onFinish}
        />
      ) : null}
    </div>
  )
}
