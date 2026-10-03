// Tiny hand-rolled router: a stack of screens pushed/popped with the browser's
// history so the Android/gesture back button works, without pulling in react-router.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { ModeId } from './storage'

export type AppScreen =
  | { name: 'home' }
  | { name: 'problems' }
  | { name: 'hub'; problemId: number }
  | { name: 'mode'; problemId: number; mode: ModeId }
  | { name: 'session' }

function sameScreen(a: AppScreen, b: AppScreen): boolean {
  if (a.name !== b.name) return false
  if (a.name === 'hub' && b.name === 'hub') return a.problemId === b.problemId
  if (a.name === 'mode' && b.name === 'mode') return a.problemId === b.problemId && a.mode === b.mode
  return true
}

interface NavState {
  stack: AppScreen[]
  push: (s: AppScreen) => void
  pop: () => void
  replace: (s: AppScreen) => void
}

const NavCtx = createContext<NavState | null>(null)

export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<AppScreen[]>([{ name: 'home' }])

  useEffect(() => {
    history.replaceState({ depth: 0 }, '')
    const onPop = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const push = (s: AppScreen) =>
    setStack((prev) => {
      if (prev.length && sameScreen(prev[prev.length - 1], s)) return prev
      history.pushState({ depth: prev.length }, '')
      return [...prev, s]
    })
  const pop = () => {
    if (stack.length > 1) history.back()
  }
  const replace = (s: AppScreen) => setStack((prev) => [...prev.slice(0, -1), s])

  return <NavCtx.Provider value={{ stack, push, pop, replace }}>{children}</NavCtx.Provider>
}

export function useNav() {
  const ctx = useContext(NavCtx)
  if (!ctx) throw new Error('useNav outside NavProvider')
  return ctx
}
