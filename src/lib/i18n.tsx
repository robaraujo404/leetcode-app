import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Bi, Lang } from '../content/schema'

const KEY = 'algo-trainer:lang'

function readLang(): Lang {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'en' ? 'en' : 'pt'
  } catch {
    return 'pt'
  }
}

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'pt',
  setLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang)
  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(KEY, l)
    } catch {
      /* ignore */
    }
  }
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>
}

export function useLang() {
  return useContext(LangCtx)
}

/** `t(bi)` resolves a bilingual string to the active language. */
export function useT() {
  const { lang } = useLang()
  return (b: Bi) => b[lang]
}

export const UI = {
  pt: {
    home: 'Início',
    back: 'Voltar',
    problems: 'Problemas',
    practice5: 'Praticar 5 min',
    streak: 'sequência',
    days: 'dias',
    due: 'pra revisar',
    modes: {
      parsons: 'Montar o algoritmo',
      interviewer: 'Simulador de entrevistador',
      edge: 'Caça aos edge cases',
      pattern: 'Flash de padrão',
      complexity: 'Baldes de complexidade',
      bug: 'Caça ao bug',
      changes: 'Onde muda?',
      log: 'Onde logar?',
    },
    modeShort: {
      parsons: 'Ordenar e aninhar os passos do algoritmo',
      interviewer: 'Escolha as perguntas certas antes de codar',
      edge: 'Swipe nos casos que importam',
      pattern: 'Reconheça o padrão no enunciado',
      complexity: 'Compare abordagens por complexidade',
      bug: 'Ache a linha que quebra o teste oculto',
      changes: 'Ache as linhas que o follow-up muda',
      log: 'Ache onde um print resolve mais rápido',
    },
    check: 'Verificar',
    continue: 'Continuar',
    next: 'Próximo',
    correct: 'Certo!',
    incorrect: 'Quase.',
    skip: 'Pular',
    finish: 'Finalizar',
    retry: 'Tentar de novo',
    timeUp: 'Tempo esgotado',
    seconds: 's',
    level: 'Nível',
    line: 'linha',
    bank: 'Blocos disponíveis',
    solution: 'Sua solução',
    tapToAdd: 'Toque pra adicionar, arraste pra reordenar',
    noAttempts: 'ainda não tentado',
    mastery: 'domínio',
    sessionDone: 'Sessão concluída',
    sessionDoneDesc: 'Toque em início pra ver seu progresso.',
    emptyQueue: 'Nada pra revisar agora — escolha um problema pra praticar.',
    relevant: 'relevante',
    irrelevant: 'irrelevante',
    good: 'boas perguntas',
    wasted: 'perdidas',
    hiddenTest: 'teste oculto',
    inputLabel: 'entrada',
    expectedLabel: 'esperado',
    gotLabel: 'veio',
    errorLabel: 'erro',
  },
  en: {
    home: 'Home',
    back: 'Back',
    problems: 'Problems',
    practice5: 'Practice 5 min',
    streak: 'streak',
    days: 'days',
    due: 'due',
    modes: {
      parsons: 'Build the algorithm',
      interviewer: 'Interviewer simulator',
      edge: 'Edge case hunt',
      pattern: 'Pattern flash',
      complexity: 'Complexity buckets',
      bug: 'Bug hunt',
      changes: 'Where does it change?',
      log: 'Where to log?',
    },
    modeShort: {
      parsons: 'Order and nest the algorithm steps',
      interviewer: 'Pick the right questions before coding',
      edge: 'Swipe on the cases that matter',
      pattern: 'Recognize the pattern from the prompt',
      complexity: 'Compare approaches by complexity',
      bug: 'Find the line that breaks the hidden test',
      changes: 'Find the lines the follow-up touches',
      log: 'Find where a print solves it fastest',
    },
    check: 'Check',
    continue: 'Continue',
    next: 'Next',
    correct: 'Correct!',
    incorrect: 'Close.',
    skip: 'Skip',
    finish: 'Finish',
    retry: 'Try again',
    timeUp: "Time's up",
    seconds: 's',
    level: 'Level',
    line: 'line',
    bank: 'Available blocks',
    solution: 'Your solution',
    tapToAdd: 'Tap to add, drag to reorder',
    noAttempts: 'not attempted yet',
    mastery: 'mastery',
    sessionDone: 'Session complete',
    sessionDoneDesc: 'Tap home to see your progress.',
    emptyQueue: 'Nothing due right now — pick a problem to practice.',
    relevant: 'relevant',
    irrelevant: 'irrelevant',
    good: 'good questions',
    wasted: 'wasted',
    hiddenTest: 'hidden test',
    inputLabel: 'input',
    expectedLabel: 'expected',
    gotLabel: 'got',
    errorLabel: 'error',
  },
} as const

export function useUI() {
  const { lang } = useLang()
  return UI[lang]
}
