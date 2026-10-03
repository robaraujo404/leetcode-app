import type { ReactNode } from 'react'
import { useNav } from '../lib/nav'

export function Screen({
  title,
  onBack,
  right,
  children,
  padded = true,
}: {
  title: string
  onBack?: () => void
  right?: ReactNode
  children: ReactNode
  padded?: boolean
}) {
  const nav = useNav()
  const back = onBack ?? (nav.stack.length > 1 ? nav.pop : undefined)
  // Outer strip fills whatever window we're in; the inner column is phone-width
  // (and full-bleed on an actual phone, since max-w-md is wider than any phone
  // viewport) so the app always reads as a single mobile screen, not a stretched
  // desktop page. Fixed bottom bars (see BottomBar) mirror this same column.
  return (
    <div className="flex min-h-dvh justify-center bg-slate-200 dark:bg-slate-900">
      <div className="flex min-h-dvh w-full max-w-md flex-col bg-slate-50 shadow-xl dark:bg-slate-950">
        <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-white/90 px-3 py-[calc(env(safe-area-inset-top)+0.6rem)] pt-[max(0.6rem,env(safe-area-inset-top))] backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          {back ? (
            <button
              onClick={back}
              aria-label="back"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-slate-600 active:bg-slate-200 dark:text-slate-300 dark:active:bg-slate-800"
            >
              ‹
            </button>
          ) : (
            <div className="w-10 shrink-0" />
          )}
          <h1 className="flex-1 truncate text-[17px] font-semibold text-slate-900 dark:text-slate-50">{title}</h1>
          <div className="flex shrink-0 items-center gap-2">{right}</div>
        </header>
        <main className={padded ? 'flex-1 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3' : 'flex-1'}>
          {children}
        </main>
      </div>
    </div>
  )
}

/** Fixed-to-bottom action bar that stays inside the phone-width column (see Screen). */
export function BottomBar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 flex justify-center">
      <div className={`w-full max-w-md ${className}`}>{children}</div>
    </div>
  )
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  className = '',
  size = 'md',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  disabled?: boolean
  className?: string
  size?: 'md' | 'lg'
}) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 select-none'
  const sizes = size === 'lg' ? 'px-5 py-3.5 text-base min-h-13' : 'px-4 py-2.5 text-[15px] min-h-11'
  const variants: Record<string, string> = {
    primary: 'bg-violet-600 text-white active:bg-violet-700 dark:bg-violet-500 dark:active:bg-violet-600',
    secondary: 'bg-slate-200 text-slate-900 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:active:bg-slate-700',
    ghost: 'bg-transparent text-slate-600 active:bg-slate-200 dark:text-slate-300 dark:active:bg-slate-800',
    danger: 'bg-rose-600 text-white active:bg-rose-700',
    success: 'bg-emerald-600 text-white active:bg-emerald-700',
  }
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${sizes} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

export function Chip({
  children,
  active,
  onClick,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  tone?: 'neutral' | 'good' | 'bad'
  className?: string
}) {
  const toneClass =
    tone === 'good'
      ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-200'
      : tone === 'bad'
        ? 'border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-600 dark:bg-rose-950 dark:text-rose-200'
        : active
          ? 'border-violet-500 bg-violet-100 text-violet-900 dark:border-violet-400 dark:bg-violet-950 dark:text-violet-100'
          : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition active:scale-95 ${toneClass} ${className}`}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={`block w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900 ${onClick ? 'active:scale-[0.99] active:bg-slate-50 dark:active:bg-slate-800/60' : ''} ${className}`}
    >
      {children}
    </Comp>
  )
}

export function ProgressBar({ value, max, className = '' }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 ${className}`}>
      <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function ResultBanner({
  correct,
  label,
  onContinue,
  continueLabel,
}: {
  correct: boolean
  label?: string
  onContinue: () => void
  continueLabel: string
}) {
  return (
    <BottomBar
      className={`flex items-center justify-between gap-3 border-t px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] ${
        correct
          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950'
          : 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950'
      }`}
    >
      <div className={`text-[15px] font-semibold ${correct ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'}`}>
        {label}
      </div>
      <Button onClick={onContinue} variant={correct ? 'success' : 'danger'}>
        {continueLabel}
      </Button>
    </BottomBar>
  )
}

export function Timer({ seconds, total }: { seconds: number; total: number }) {
  const pct = (seconds / total) * 100
  const danger = seconds <= 10
  return (
    <div className="flex items-center gap-1.5 text-sm font-mono tabular-nums">
      <svg width="20" height="20" viewBox="0 0 20 20" className={danger ? 'text-rose-500' : 'text-violet-500'}>
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={2 * Math.PI * 8}
          strokeDashoffset={2 * Math.PI * 8 * (1 - pct / 100)}
          strokeLinecap="round"
          transform="rotate(-90 10 10)"
        />
      </svg>
      <span className={danger ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}>{seconds}s</span>
    </div>
  )
}
