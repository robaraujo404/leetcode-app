import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function taskSchedulerII(...)
//  1 const lastDone = new Map<number, number>()
//  2 let day = 0
//  3 for (const task of tasks) {
//  4   day++
//  5   if (lastDone.has(task)) {
//  6     const earliest = lastDone.get(task)! + space + 1
//  7     if (earliest > day) day = earliest
//  8   }
//  9   lastDone.set(task, day)
// 10 }
// 11 return day
// 12 }

const content: ProblemContent = {
  id: 17,
  source: `function taskSchedulerII(tasks: number[], space: number): number {
  const lastDone = new Map<number, number>()
  let day = 0
  for (const task of tasks) {
    day++
    if (lastDone.has(task)) {
      const earliest = lastDone.get(task)! + space + 1
      if (earliest > day) day = earliest
    }
    lastDone.set(task, day)
  }
  return day
}`,

  steps: [
    { indent: 0, text: { pt: 'Cria o mapa lastDone (tipo de task → último dia usado) e day = 0', en: 'Create map lastDone (task type → last day used) and day = 0' } },
    { indent: 0, text: { pt: 'Para cada task da lista, na ordem dada:', en: 'For each task in the list, in order:' } },
    { indent: 1, text: { pt: 'day++ (gasta pelo menos um dia novo)', en: 'day++ (spend at least one new day)' } },
    { indent: 1, text: { pt: 'Se essa task já rodou antes:', en: 'If this task has run before:' } },
    { indent: 2, text: { pt: 'earliest = lastDone[task] + space + 1', en: 'earliest = lastDone[task] + space + 1' } },
    { indent: 2, text: { pt: 'Se earliest > day, avança day até earliest', en: 'If earliest > day, advance day to earliest' } },
    { indent: 1, text: { pt: 'Grava lastDone[task] = day', en: 'Record lastDone[task] = day' } },
    { indent: 0, text: { pt: 'Retorna day', en: 'Return day' } },
  ],

  stepDistractors: [
    {
      indent: 1,
      text: { pt: 'Se a task já rodou antes, pula ela (continue) para não repetir', en: 'If the task ran before, skip it (continue) to avoid repeating' },
      why: { pt: 'Toda task da lista precisa ser executada, inclusive repetições; o que se ajusta é o dia, nunca se descarta a task.', en: 'Every task in the list must run, repeats included; what gets adjusted is the day, the task itself is never dropped.' },
    },
    {
      indent: 0,
      text: { pt: 'Ordena as tasks antes de simular', en: 'Sort the tasks before simulating' },
      why: { pt: 'As tasks não podem ser reordenadas; ordenar destrói a sequência de execução e dá uma resposta sem sentido.', en: 'Tasks may not be reordered; sorting destroys the execution sequence and produces a meaningless answer.' },
    },
    {
      indent: 2,
      text: { pt: 'earliest = lastDone[task] + space', en: 'earliest = lastDone[task] + space' },
      why: { pt: 'Faltam os "space dias completos de espera" mais o dia em que a task de fato roda; sem o +1 o resultado fica um dia atrasado em relação ao real.', en: 'This is missing the full `space` idle days plus the day the task actually runs; without the +1 the result lands one day short of the real minimum.' },
    },
  ],

  blanks: [
    { line: 1, token: 'new Map<number, number>()', options: ['new Set<number>()', 'new Map<number, number[]>()'] },
    { line: 2, token: '0', options: ['1', '-1'] },
    { line: 4, token: 'day++', options: ['day--', 'day += space'] },
    { line: 6, token: '+ space + 1', options: ['+ space', '+ space + 2'] },
    { line: 7, token: 'earliest > day', options: ['earliest >= day', 'earliest < day'] },
  ],

  codeDistractors: [
    {
      code: '      if (earliest >= day + 1) day = earliest',
      why: { pt: 'Reescreve a comparação de forma "mais segura" mas desloca o limite: no caso earliest == day isso atrasa um dia a mais sem necessidade.', en: 'A "safer-looking" rewrite of the comparison that shifts the boundary: when earliest == day it delays one extra day for no reason.' },
    },
    {
      code: '  const lastDone = new Map<number, number[]>()',
      why: { pt: 'Guardar um array de todos os dias passados é desnecessário; só o último dia importa, e o resto do código espera um number, não um array.', en: 'Storing an array of every past day is unnecessary; only the last day matters, and the rest of the code expects a number, not an array.' },
    },
    {
      code: '    day += space',
      why: { pt: 'Confunde "avançar para o dia depois dos dias de espera" com "somar o cooldown em toda task"; isso infla o dia até para tasks que nunca repetem.', en: 'Confuses "advance to the day after the idle days" with "add the cooldown to every task"; this inflates the day even for tasks that never repeat.' },
    },
  ],

  bugs: [
    {
      id: 'missing-plus-one',
      line: 6,
      code: '      const earliest = lastDone.get(task)! + space',
      why: { pt: 'Essa é a linha original. O bug real está em trocar o `+1` por nada, perdendo o dia em que a task roda além dos `space` dias de espera.', en: 'This is the original line. The real bug is dropping the `+1`, losing the day the task actually runs on top of the `space` idle days.' },
      failsTest: 'large_gap',
      logLine: 6,
      logWhy: { pt: 'Logar `earliest` e `day` nessa linha mostra o valor exatamente um dia menor que o esperado quando o gap é grande.', en: 'Logging `earliest` and `day` on this line shows the value exactly one day short of expected when the gap is large.' },
    },
    {
      id: 'reversed-comparison',
      line: 7,
      code: '      if (earliest < day) day = earliest',
      why: { pt: 'Inverte a direção da comparação: `day` só deveria poder avançar para alcançar `earliest`, nunca recuar; com `<` o avanço nunca acontece quando é preciso esperar.', en: 'Flips the comparison direction: `day` should only ever advance to reach `earliest`, never go back; with `<` the advance never happens when a wait is actually needed.' },
      failsTest: 'alternating_repeats',
      logLine: 7,
      logWhy: { pt: 'Logar `day` antes e depois dessa linha mostra que ele nunca avança para `earliest` quando deveria esperar.', en: 'Logging `day` before and after this line shows it never advances to `earliest` when it should wait.' },
    },
    {
      id: 'off-by-one-extra-day',
      line: 6,
      code: '      const earliest = lastDone.get(task)! + space + 2',
      why: { pt: 'Soma um dia de espera além do necessário; para space = 0 isso ainda força uma espera inexistente.', en: 'Adds one more idle day than necessary; for space = 0 this still forces a wait that should not exist.' },
      failsTest: 'zero_cooldown',
      logLine: 6,
      logWhy: { pt: 'Logar `earliest` com space = 0 mostra que ele fica um dia acima do próprio `day` atual, forçando espera onde não deveria haver nenhuma.', en: 'Logging `earliest` with space = 0 shows it lands one day above the current `day`, forcing a wait where there should be none.' },
    },
    {
      id: 'double-increment',
      line: 4,
      code: '    day += 2',
      why: { pt: 'Um erro de copiar-e-colar de uma variante onde cada task ocupa dois dias; avança o relógio em dobro mesmo quando nada se repete.', en: 'A copy-paste slip from a variant where each task takes two days; it advances the clock twice as fast even when nothing repeats.' },
      failsTest: 'all_unique',
      logLine: 4,
      logWhy: { pt: 'Logar `day` depois do incremento, para tasks sem nenhuma repetição, mostra que ele dobra em vez de andar de 1 em 1.', en: 'Logging `day` after the increment, for tasks with no repeats at all, shows it doubling instead of stepping by 1.' },
    },
  ],

  followUp: {
    task: { pt: 'Cada tipo de task tem seu próprio cooldown (`space` passa a ser um mapa).', en: 'Each task type has its own cooldown (`space` becomes a map).' },
    changeLines: [0, 6],
    explanation: {
      pt: 'A assinatura (linha 0) troca `space: number` por algo como `spaceByTask: Map<number, number>`. O cálculo de `earliest` (linha 6) passa a ler o cooldown daquela task específica: `lastDone.get(task)! + (spaceByTask.get(task) ?? 0) + 1`. O resto — o mapa `lastDone`, o `day++`, a comparação e o retorno — não muda, porque a lógica de "quando uma task pode rodar de novo" é a mesma, só a fonte do cooldown muda.',
      en: 'The signature (line 0) swaps `space: number` for something like `spaceByTask: Map<number, number>`. The `earliest` calculation (line 6) now reads that specific task\'s cooldown: `lastDone.get(task)! + (spaceByTask.get(task) ?? 0) + 1`. Everything else — the `lastDone` map, `day++`, the comparison, and the return — stays the same, because the "when can this task run again" logic is identical, only the cooldown source changes.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'Posso reordenar as tasks para evitar espera?', en: 'Can I reorder the tasks to avoid waiting?' }, reply: { pt: 'Não, as tasks devem ser executadas na ordem dada.', en: 'No, tasks must be executed in the given order.' } },
    { kind: 'good', cost: 20, text: { pt: 'O que exatamente `space` significa — dias de espera, ou o total entre execuções?', en: 'What exactly does `space` mean — days of wait, or the total between runs?' }, reply: { pt: '`space` é o número de dias completos de espera entre execuções da mesma task.', en: '`space` is the number of full days of wait between runs of the same task.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Quantas tasks podem existir no máximo?', en: 'How many tasks can there be at most?' }, reply: { pt: 'Está nas constraints: até 100000.', en: 'It is in the constraints: up to 100000.' } },
    { kind: 'stated', cost: 15, text: { pt: '`space` pode ser 0?', en: 'Can `space` be 0?' }, reply: { pt: 'Está nas constraints: 0 <= space <= 10^9.', en: 'It is in the constraints: 0 <= space <= 10^9.' } },
    { kind: 'stated', cost: 10, text: { pt: 'Cada dia executa no máximo uma task?', en: 'Does each day execute at most one task?' }, reply: { pt: 'O enunciado diz isso: a lista é executada em ordem, um item por dia (ou dia ocioso).', en: 'The statement says so: the list runs in order, one item per day (or an idle day).' } },
    { kind: 'noise', cost: 30, text: { pt: 'As tasks têm prioridade entre si?', en: 'Do tasks have priority over each other?' }, reply: { pt: 'Não, não existe prioridade nesse problema.', en: 'No, there is no priority in this problem.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Preciso lidar com múltiplos processadores em paralelo?', en: 'Do I need to handle multiple processors in parallel?' }, reply: { pt: 'Não, é uma única linha do tempo sequencial.', en: 'No, it is a single sequential timeline.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'zero_cooldown',
      text: { pt: 'space = 0 (sem cooldown real)', en: 'space = 0 (no real cooldown)' },
      why: { pt: 'Com space = 0 cada task só precisa de um dia novo; a resposta deve ser exatamente o tamanho da lista.', en: 'With space = 0 each task only needs a fresh day; the answer should be exactly the length of the list.' },
      followUp: { question: { pt: 'Quanto retorna para [1,1,1] com space=0?', en: 'What does it return for [1,1,1] with space=0?' }, options: ['3', '4', '0'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'large_gap',
      text: { pt: 'space enorme (ex.: 100) para só duas tasks iguais', en: 'huge space (e.g. 100) for just two equal tasks' },
      why: { pt: 'Testa o +1: o resultado é space + 2, não space + 1 nem space.', en: 'Tests the +1: the result is space + 2, not space + 1 or space.' },
      followUp: { question: { pt: 'Quanto retorna para [1,1] com space=100?', en: 'What does it return for [1,1] with space=100?' }, options: ['102', '101', '100'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'alternating_repeats',
      text: { pt: 'Tasks alternadas, ex.: [1,2,1,2]', en: 'Alternating tasks, e.g. [1,2,1,2]' },
      why: { pt: 'Cada tipo de task precisa do seu próprio último dia rastreado separadamente; misturar os dois dá resposta errada.', en: 'Each task type needs its own last day tracked separately; mixing the two gives the wrong answer.' },
      followUp: { question: { pt: 'Quanto retorna para [1,2,1,2] com space=2?', en: 'What does it return for [1,2,1,2] with space=2?' }, options: ['5', '4', '6'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'all_unique',
      text: { pt: 'Nenhuma task se repete', en: 'No task repeats' },
      why: { pt: 'Sem repetição, o cooldown nunca entra em jogo; a resposta é só o número de tasks.', en: 'With no repeats, the cooldown never kicks in; the answer is just the number of tasks.' },
      followUp: { question: { pt: 'Quanto retorna para [1,2,3,4] com space=99?', en: 'What does it return for [1,2,3,4] with space=99?' }, options: ['4', '99', '396'], correct: 0 },
    },
    {
      relevant: false,
      text: { pt: 'Lista de tasks vazia', en: 'Empty task list' },
      why: { pt: 'As constraints garantem pelo menos uma task.', en: 'The constraints guarantee at least one task.' },
    },
    {
      relevant: false,
      text: { pt: 'IDs de task negativos', en: 'Negative task IDs' },
      why: { pt: 'IDs são só chaves de mapa; o sinal não importa para o algoritmo.', en: 'IDs are just map keys; the sign does not matter to the algorithm.' },
    },
    {
      relevant: false,
      text: { pt: 'Dias ociosos custam algum recurso extra?', en: 'Do idle days cost any extra resource?' },
      why: { pt: 'Não há custo associado a dias ociosos no enunciado; eles só avançam o contador.', en: 'There is no cost tied to idle days in the statement; they just advance the counter.' },
    },
    {
      relevant: false,
      text: { pt: 'space próximo de 2^31', en: 'space near 2^31' },
      why: { pt: 'Cabe num number de JS; a soma não dá overflow dentro dos limites do problema.', en: 'It fits in a JS number; the sum does not overflow within the problem bounds.' },
    },
  ],

  pattern: { correct: 'greedy', distractors: ['dp', 'hash-map-count', 'heap'] },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Uma passada guardando o último dia de cada task', en: 'Single pass tracking the last day of each task' },
      time: 'O(n)',
      space: 'O(k)',
      why: { pt: 'n = número de tasks, k = tipos distintos. Cada task é processada uma vez só, com lookup O(1) no mapa.', en: 'n = number of tasks, k = distinct types. Each task is processed exactly once, with an O(1) map lookup.' },
    },
    {
      chosen: false,
      name: { pt: 'Simular o calendário dia a dia até a próxima task caber', en: 'Simulate the calendar day by day until the next task fits' },
      time: 'O(n + maxDay)',
      space: 'O(k)',
      why: { pt: 'Com space até 10^9 e 100k tasks, avançar um dia por iteração explode bem além de O(n); o enunciado espera O(n).', en: 'With space up to 10^9 and 100k tasks, advancing one day per iteration blows far past O(n); the problem expects O(n).' },
    },
    {
      chosen: false,
      name: { pt: 'Guardar todas as ocorrências passadas de cada task e buscar a última', en: 'Store every past occurrence of each task and search for the latest' },
      time: 'O(n²)',
      space: 'O(n)',
      why: { pt: 'Procurar a ocorrência anterior em uma lista em vez de guardar só o último dia reprocessa histórico a cada task.', en: 'Searching a list for the previous occurrence instead of keeping just the last day re-scans history on every task.' },
    },
  ],
}

export default content
