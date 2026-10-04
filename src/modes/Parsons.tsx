import { useMemo, useRef, useState } from 'react'
import type { Problem } from '../content'
import { BankOrderPuzzle, type Tile } from '../ui/BankOrderPuzzle'
import { FillBlanks } from '../ui/FillBlanks'
import { Chip } from '../ui/primitives'
import { useT, useUI } from '../lib/i18n'
import { shuffle } from '../lib/shuffle'

/** Merges contiguous steps sharing the same `group` into one block the checker
 *  accepts in any internal order (see schema.ts `Step.group`). */
function toBlocks(items: { id: string; group?: number }[]): string[][] {
  const blocks: string[][] = []
  let currentGroup: number | undefined
  for (const item of items) {
    if (item.group !== undefined && item.group === currentGroup) {
      blocks[blocks.length - 1].push(item.id)
    } else {
      blocks.push([item.id])
    }
    currentGroup = item.group
  }
  return blocks
}

export function ParsonsMode({ problem, onFinish }: { problem: Problem; onFinish: (correct: boolean) => void }) {
  const t = useT()
  const ui = useUI()
  const [level, setLevel] = useState(1)
  const c = problem.content

  // Switching levels remounts the puzzle below (fresh shuffle each time would
  // otherwise lose progress), so cache each level's arrangement here and feed
  // it back in as the initial state when the user returns to that level.
  const puzzleCache = useRef<Record<number, { bank: Tile[]; solution: Tile[] }>>({})
  const blanksCache = useRef<Record<number, string>>({})

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
        correctOrder: correctTiles.map((x) => [x.id]),
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
      correctOrder: toBlocks(c.steps.map((s, i) => ({ id: `step${i}`, group: s.group }))),
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
        <FillBlanks
          key={`${problem.id}-4`}
          source={c.source}
          blanks={c.blanks}
          initialAnswers={blanksCache.current}
          onChange={(answers) => {
            blanksCache.current = answers
          }}
          onDone={onFinish}
        />
      ) : puzzle ? (
        <BankOrderPuzzle
          key={`${problem.id}-${level}`}
          tiles={puzzle.tiles}
          correctOrder={puzzle.correctOrder}
          indentMode={puzzle.indentMode}
          monospace={puzzle.monospace}
          initialBank={puzzleCache.current[level]?.bank}
          initialSolution={puzzleCache.current[level]?.solution}
          onChange={(bank, solution) => {
            puzzleCache.current[level] = { bank, solution }
          }}
          onDone={onFinish}
        />
      ) : null}
    </div>
  )
}
