// Renders source lines in monospace with real indentation, optionally tappable
// (for BugHunt / WhereChanges / LogWhere) and optionally highlighted.
export function CodeLines({
  lines,
  selected = [],
  correct = [],
  wrong = [],
  onTapLine,
  dimUnselectable = false,
}: {
  lines: string[]
  selected?: number[]
  correct?: number[]
  wrong?: number[]
  onTapLine?: (i: number) => void
  dimUnselectable?: boolean
}) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-[13px] leading-6 dark:bg-black">
      <code className="font-mono">
        {lines.map((line, i) => {
          const isSelected = selected.includes(i)
          const isCorrect = correct.includes(i)
          const isWrong = wrong.includes(i)
          const tappable = !!onTapLine
          let bg = 'transparent'
          if (isCorrect) bg = 'rgba(16,185,129,0.25)'
          else if (isWrong) bg = 'rgba(244,63,94,0.25)'
          else if (isSelected) bg = 'rgba(139,92,246,0.3)'
          return (
            <div
              key={i}
              onClick={tappable ? () => onTapLine!(i) : undefined}
              className={`-mx-1 flex rounded px-1 ${tappable ? 'cursor-pointer active:bg-white/10' : ''} ${
                dimUnselectable && !tappable ? 'opacity-50' : ''
              }`}
              style={{ background: bg }}
            >
              <span className="mr-3 w-6 shrink-0 select-none text-right text-slate-500">{i}</span>
              <span className="whitespace-pre text-slate-100">{line === '' ? ' ' : line}</span>
            </div>
          )
        })}
      </code>
    </pre>
  )
}

/** A single tile's worth of code for the Parsons bank/solution UI (one line, monospace). */
export function CodeTile({ code }: { code: string }) {
  return <code className="whitespace-pre font-mono text-[13px] text-slate-100">{code === '' ? ' ' : code}</code>
}
