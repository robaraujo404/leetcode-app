// Shared drag-and-drop engine: a shuffled "bank" of tiles on top, an ordered
// "solution" list below. Drag between the two (or tap a bank tile to append,
// tap a solution tile's X to send it back) to build an answer, then Check.
// Used by Parsons levels 1-3 (prose steps, nesting, distractors) and level 5
// (real code lines + distractors).
import { useId, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BottomBar, Button } from './primitives'
import { useUI } from '../lib/i18n'

export interface Tile {
  id: string
  text: string
  indent?: number
  isDistractor?: boolean
  why?: string
}

type ContainerId = 'bank' | 'solution'

function TileRow({
  tile,
  container,
  monospace,
  indentMode,
  onIndent,
  onRemove,
  onAdd,
}: {
  tile: Tile
  container: ContainerId
  monospace?: boolean
  indentMode?: boolean
  onIndent?: (dir: 1 | -1) => void
  onRemove?: () => void
  onAdd?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tile.id })
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  const indent = tile.indent ?? 0
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 rounded-xl border bg-white shadow-sm dark:bg-slate-900 ${
        container === 'bank' ? 'border-slate-200 dark:border-slate-800' : 'border-violet-200 dark:border-violet-900'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="drag"
        className="flex h-11 w-8 shrink-0 cursor-grab touch-none items-center justify-center text-slate-400 active:cursor-grabbing"
      >
        ⠿
      </button>
      {container === 'solution' && indentMode ? (
        <div className="flex shrink-0 gap-0.5">
          <button
            onClick={() => onIndent?.(-1)}
            disabled={indent <= 0}
            className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-slate-500 disabled:opacity-30 dark:bg-slate-800"
          >
            ◀
          </button>
          <button
            onClick={() => onIndent?.(1)}
            disabled={indent >= 3}
            className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-slate-500 disabled:opacity-30 dark:bg-slate-800"
          >
            ▶
          </button>
        </div>
      ) : null}
      <div
        onClick={container === 'bank' ? onAdd : undefined}
        style={{ paddingLeft: container === 'solution' && indentMode ? indent * 16 : 0 }}
        className={`flex-1 py-2.5 pr-2 text-[13.5px] ${monospace ? 'font-mono whitespace-pre' : ''} text-slate-800 dark:text-slate-100 ${
          container === 'bank' ? 'cursor-pointer' : ''
        }`}
      >
        {tile.text === '' ? ' ' : tile.text}
      </div>
      {container === 'solution' ? (
        <button
          onClick={onRemove}
          aria-label="remove"
          className="flex h-11 w-9 shrink-0 items-center justify-center text-lg text-slate-400 active:text-rose-500"
        >
          ×
        </button>
      ) : null}
    </div>
  )
}

function Container({ id, children, label, empty }: { id: ContainerId; children: React.ReactNode; label: string; empty?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[3.25rem] flex-col gap-1.5 rounded-xl p-1 transition-colors ${
          isOver ? 'bg-violet-50 dark:bg-violet-950/40' : ''
        }`}
      >
        {children}
        {empty ? <p className="px-2 py-3 text-center text-sm text-slate-400">{empty}</p> : null}
      </div>
    </div>
  )
}

export function BankOrderPuzzle({
  tiles: initialTiles,
  correctOrderIds,
  indentMode = false,
  monospace = false,
  onDone,
}: {
  tiles: Tile[]
  correctOrderIds: string[]
  indentMode?: boolean
  monospace?: boolean
  onDone: (correct: boolean) => void
}) {
  const ui = useUI()
  const dndId = useId()
  const [bank, setBank] = useState<Tile[]>(initialTiles)
  const [solution, setSolution] = useState<Tile[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [checked, setChecked] = useState<null | { correct: boolean; wrongIds: Set<string> }>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function findContainer(id: string): ContainerId {
    return bank.some((t) => t.id === id) ? 'bank' : 'solution'
  }
  function listFor(c: ContainerId) {
    return c === 'bank' ? bank : solution
  }
  function setListFor(c: ContainerId, next: Tile[]) {
    if (c === 'bank') setBank(next)
    else setSolution(next)
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
    setChecked(null)
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e
    if (!over) return
    const activeC = findContainer(String(active.id))
    const overC = (over.id === 'bank' || over.id === 'solution' ? over.id : findContainer(String(over.id))) as ContainerId
    if (activeC === overC) return
    const activeList = listFor(activeC)
    const idx = activeList.findIndex((t) => t.id === active.id)
    if (idx === -1) return
    const [moved] = activeList.splice(idx, 1)
    const overList = listFor(overC)
    const overIdx = overList.findIndex((t) => t.id === over.id)
    const insertAt = overIdx === -1 ? overList.length : overIdx
    overList.splice(insertAt, 0, moved)
    setListFor(activeC, [...activeList])
    setListFor(overC, [...overList])
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const c = findContainer(String(active.id))
    const list = listFor(c)
    const activeIdx = list.findIndex((t) => t.id === active.id)
    const overIdx = list.findIndex((t) => t.id === over.id)
    if (activeIdx !== -1 && overIdx !== -1 && activeIdx !== overIdx) {
      setListFor(c, arrayMove(list, activeIdx, overIdx))
    }
  }

  function addToSolution(id: string) {
    const idx = bank.findIndex((t) => t.id === id)
    if (idx === -1) return
    const t = bank[idx]
    setBank(bank.filter((x) => x.id !== id))
    setSolution([...solution, { ...t, indent: 0 }])
    setChecked(null)
  }
  function removeFromSolution(id: string) {
    const idx = solution.findIndex((t) => t.id === id)
    if (idx === -1) return
    const t = solution[idx]
    setSolution(solution.filter((x) => x.id !== id))
    setBank([...bank, t])
    setChecked(null)
  }
  function changeIndent(id: string, dir: 1 | -1) {
    setSolution(solution.map((t) => (t.id === id ? { ...t, indent: Math.max(0, Math.min(3, (t.indent ?? 0) + dir)) } : t)))
  }

  function check() {
    const wrongIds = new Set<string>()
    const ids = solution.map((t) => t.id)
    if (ids.length !== correctOrderIds.length) {
      solution.forEach((t, i) => {
        if (correctOrderIds[i] !== t.id) wrongIds.add(t.id)
      })
      correctOrderIds.filter((id) => !ids.includes(id)).forEach((id) => wrongIds.add(id))
    } else {
      solution.forEach((t, i) => {
        const indentOk = !indentMode || t.indent === initialIndentFor(t.id)
        if (correctOrderIds[i] !== t.id || !indentOk) wrongIds.add(t.id)
      })
    }
    const correct = wrongIds.size === 0 && solution.length === correctOrderIds.length
    setChecked({ correct, wrongIds })
    onDone(correct)
  }

  function initialIndentFor(id: string): number | undefined {
    return initialTiles.find((t) => t.id === id)?.indent
  }

  const activeTile = bank.find((t) => t.id === activeId) ?? solution.find((t) => t.id === activeId)

  return (
    <div className="flex flex-col gap-5 pb-24">
      <DndContext id={dndId} sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <Container id="solution" label={ui.solution} empty={ui.tapToAdd}>
          <SortableContext items={solution.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {solution.map((t) => (
              <TileRow
                key={t.id}
                tile={checked ? { ...t, text: t.text } : t}
                container="solution"
                monospace={monospace}
                indentMode={indentMode}
                onIndent={(d) => changeIndent(t.id, d)}
                onRemove={() => removeFromSolution(t.id)}
              />
            ))}
          </SortableContext>
        </Container>
        <Container id="bank" label={ui.bank}>
          <SortableContext items={bank.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {bank.map((t) => (
              <TileRow key={t.id} tile={t} container="bank" monospace={monospace} onAdd={() => addToSolution(t.id)} />
            ))}
          </SortableContext>
        </Container>
        <DragOverlay>
          {activeTile ? (
            <div className="rounded-xl border border-violet-400 bg-white px-3 py-2.5 text-[13.5px] shadow-lg dark:bg-slate-900">
              <span className={monospace ? 'font-mono whitespace-pre' : ''}>{activeTile.text}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {checked && !checked.correct ? (
        <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200">
          {solution.find((t) => checked.wrongIds.has(t.id) && t.isDistractor && t.why)?.why ?? ui.incorrect}
        </div>
      ) : null}
      <BottomBar className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button size="lg" className="w-full" onClick={check} disabled={solution.length === 0}>
          {ui.check}
        </Button>
      </BottomBar>
    </div>
  )
}
