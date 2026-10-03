import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function merge(...)
//  1 if (intervals.length === 0) return []
//  2 const sorted = [...intervals].sort((a, b) => a[0] - b[0])
//  3 const result: number[][] = [sorted[0]]
//  4 for (let i = 1; i < sorted.length; i++) {
//  5   const last = result[result.length - 1]
//  6   const [start, end] = sorted[i]
//  7   if (start <= last[1]) {
//  8     last[1] = Math.max(last[1], end)
//  9   } else {
// 10     result.push([start, end])
// 11   }
// 12 }
// 13 return result
// 14 }

const content: ProblemContent = {
  id: 18,
  source: `function merge(intervals: number[][]): number[][] {
  if (intervals.length === 0) return []
  const sorted = [...intervals].sort((a, b) => a[0] - b[0])
  const result: number[][] = [sorted[0]]
  for (let i = 1; i < sorted.length; i++) {
    const last = result[result.length - 1]
    const [start, end] = sorted[i]
    if (start <= last[1]) {
      last[1] = Math.max(last[1], end)
    } else {
      result.push([start, end])
    }
  }
  return result
}`,

  steps: [
    { indent: 0, text: { pt: 'Se a lista de intervalos está vazia, retorna []', en: 'If the interval list is empty, return []' } },
    { indent: 0, text: { pt: 'Ordena uma cópia dos intervalos pelo início', en: 'Sort a copy of the intervals by start' } },
    { indent: 0, text: { pt: 'result = [primeiro intervalo ordenado]', en: 'result = [first sorted interval]' } },
    { indent: 0, text: { pt: 'Para cada intervalo restante, na ordem ordenada:', en: 'For each remaining interval, in sorted order:' } },
    { indent: 1, text: { pt: 'last = último intervalo já colocado em result', en: 'last = last interval already placed in result' } },
    { indent: 1, text: { pt: 'Se o início do atual é <= o fim de last, eles se tocam ou sobrepõem:', en: 'If the current start is <= the end of last, they touch or overlap:' } },
    { indent: 2, text: { pt: 'Estende o fim de last para o maior dos dois fins', en: 'Extend the end of last to the larger of the two ends' } },
    { indent: 1, text: { pt: 'Senão, começa um novo intervalo em result', en: 'Otherwise, start a new interval in result' } },
    { indent: 0, text: { pt: 'Retorna result', en: 'Return result' } },
  ],

  stepDistractors: [
    {
      indent: 2,
      text: { pt: 'Estende o fim de last para o fim do intervalo atual', en: 'Extend the end of last to the current interval\'s end' },
      why: { pt: 'Um intervalo atual totalmente contido em last tem fim menor; copiar seu fim direto encolhe o intervalo já mesclado, perdendo dados.', en: 'A current interval fully nested inside last has a smaller end; copying its end directly shrinks the already-merged interval, losing data.' },
    },
    {
      indent: 1,
      text: { pt: 'Se o início do atual é estritamente menor que o fim de last, eles se sobrepõem:', en: 'If the current start is strictly less than the end of last, they overlap:' },
      why: { pt: 'Nessa versão intervalos que só se tocam (start == end anterior) também mesclam; usar < em vez de <= deixa esse caso escapar.', en: 'In this version touching intervals (start == previous end) also merge; using < instead of <= lets that case slip through.' },
    },
    {
      indent: 0,
      text: { pt: 'Varre os intervalos originais, sem ordenar, e mescla os que já estão lado a lado', en: 'Scan the original intervals, unsorted, merging the ones already side by side' },
      why: { pt: 'A entrada pode vir em qualquer ordem; sem ordenar por início, intervalos que se sobrepõem podem estar bem distantes um do outro na lista.', en: 'The input can arrive in any order; without sorting by start, overlapping intervals can be far apart in the list.' },
    },
  ],

  blanks: [
    { line: 1, token: 'return []', options: ['return [[]]', 'return intervals'] },
    { line: 2, token: '(a, b) => a[0] - b[0]', options: ['(a, b) => a[1] - b[1]', '(a, b) => b[0] - a[0]'] },
    { line: 7, token: 'start <= last[1]', options: ['start < last[1]', 'start <= last[0]'] },
    { line: 8, token: 'Math.max(last[1], end)', options: ['end', 'Math.min(last[1], end)'] },
    { line: 10, token: 'result.push([start, end])', options: ['result.push(sorted[i])', 'last.push([start, end])'] },
  ],

  codeDistractors: [
    {
      code: '    if (start < last[1] + 1) {',
      why: { pt: 'Uma forma estranha de simular "<=", mas quebra para números não inteiros e é muito menos claro que o original.', en: 'A convoluted way to simulate "<=", but it breaks for non-integer numbers and is far less clear than the original.' },
    },
    {
      code: '  const sorted = intervals.sort((a, b) => a[0] - b[0])',
      why: { pt: 'Ordena o array original em vez de uma cópia; isso muda a lista do chamador como efeito colateral, algo que a assinatura não promete.', en: 'Sorts the original array instead of a copy; this mutates the caller\'s list as a side effect, which the signature never promises.' },
    },
    {
      code: '  if (intervals.length <= 1) return intervals',
      why: { pt: 'Parece um atalho razoável para listas de 0 ou 1 elemento, mas devolve a referência original (não ordenada/copiada) em vez do formato esperado.', en: 'Looks like a reasonable shortcut for 0- or 1-element lists, but it returns the original reference (unsorted/uncopied) instead of the expected shape.' },
    },
  ],

  bugs: [
    {
      id: 'empty-guard-typo',
      line: 1,
      code: '  if (intervals.length === 1) return []',
      why: { pt: 'Troca "lista vazia" por "lista de um elemento"; com 0 intervalos o guard nunca dispara e o código segue para `sorted[0]`, que é undefined.', en: 'Swaps "empty list" for "single-element list"; with 0 intervals the guard never fires and the code falls through to `sorted[0]`, which is undefined.' },
      failsTest: 'empty_input',
      logLine: 3,
      logWhy: { pt: 'Logar `sorted[0]` mostra `undefined` entrando em result em vez de o guard ter retornado [] antes.', en: 'Logging `sorted[0]` shows `undefined` entering result instead of the guard having returned [] earlier.' },
    },
    {
      id: 'strict-touching',
      line: 7,
      code: '    if (start < last[1]) {',
      why: { pt: 'Troca <= por <; intervalos que só se tocam (start == fim anterior) deixam de mesclar, mas essa versão do problema exige que mesclem.', en: 'Swaps <= for <; intervals that merely touch (start == previous end) stop merging, but this version of the problem requires them to.' },
      failsTest: 'touching_intervals',
      logLine: 7,
      logWhy: { pt: 'Logar `start` e `last[1]` na comparação mostra os dois iguais e, ainda assim, nenhuma mesclagem acontecendo.', en: 'Logging `start` and `last[1]` at the comparison shows them equal, yet no merge happening.' },
    },
    {
      id: 'overwrite-end',
      line: 8,
      code: '      last[1] = end',
      why: { pt: 'Sobrescreve o fim em vez de pegar o maior dos dois; um intervalo totalmente contido em last (fim menor) encolhe o intervalo já mesclado.', en: 'Overwrites the end instead of taking the larger of the two; an interval fully nested inside last (smaller end) shrinks the already-merged interval.' },
      failsTest: 'nested_intervals',
      logLine: 8,
      logWhy: { pt: 'Logar `last[1]` antes e depois dessa linha mostra o fim caindo de 10 para 3 ao processar o intervalo encaixado.', en: 'Logging `last[1]` before and after this line shows the end dropping from 10 to 3 while processing the nested interval.' },
    },
    {
      id: 'descending-sort',
      line: 2,
      code: '  const sorted = [...intervals].sort((a, b) => b[0] - a[0])',
      why: { pt: 'Ordena do maior início para o menor; a varredura assume ordem crescente, então intervalos que deveriam abrir novos grupos acabam sendo "engolidos" pelo intervalo de maior início.', en: 'Sorts from the largest start to the smallest; the scan assumes ascending order, so intervals that should start new groups get "swallowed" by the interval with the largest start.' },
      failsTest: 'unsorted_input',
      logLine: 2,
      logWhy: { pt: 'Logar `sorted` logo depois do sort mostra os inícios em ordem decrescente em vez de crescente.', en: 'Logging `sorted` right after the sort shows starts in descending order instead of ascending.' },
    },
  ],

  followUp: {
    task: { pt: 'Adicione `insert(interval)` que mantém a lista mesclada e ordenada.', en: 'Add `insert(interval)` that keeps the merged list sorted and merged.' },
    changeLines: [0, 2, 7, 10],
    explanation: {
      pt: 'A assinatura (linha 0) passa a ser um método de uma classe com o resultado mesclado guardado como estado entre chamadas. Como esse estado já está ordenado e sem sobreposições, o `.sort()` completo (linha 2) é substituído por uma busca binária só para achar onde o novo intervalo se encaixa, em vez de reordenar tudo. A decisão de mesclar-ou-abrir-novo-grupo (linhas 7 e 10) é reaproveitada, mas agora aplicada nos vizinhos à esquerda e à direita do ponto de inserção.',
      en: 'The signature (line 0) becomes a class method with the merged result kept as state across calls. Since that state is already sorted and overlap-free, the full `.sort()` (line 2) is replaced by a binary search just to find where the new interval fits, instead of re-sorting everything. The merge-or-start-new-group decision (lines 7 and 10) is reused, but now applied to the neighbors on both sides of the insertion point.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'Intervalos que só se tocam (fim de um == início do outro) contam como sobrepostos?', en: 'Do intervals that merely touch (one\'s end == the other\'s start) count as overlapping?' }, reply: { pt: 'Sim, nessa versão intervalos que se tocam mesclam.', en: 'Yes, in this version touching intervals merge.' } },
    { kind: 'good', cost: 20, text: { pt: 'O resultado precisa vir em alguma ordem específica?', en: 'Does the result need to come in any specific order?' }, reply: { pt: 'Sim, ordenado pelo início.', en: 'Yes, sorted by start.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Quantos intervalos pode haver no máximo?', en: 'How many intervals can there be at most?' }, reply: { pt: 'Está nas constraints: até 100000.', en: 'It is in the constraints: up to 100000.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Os valores de início e fim cabem em que faixa?', en: 'What range do the start and end values fit in?' }, reply: { pt: 'Está nas constraints: inteiros de 32 bits.', en: 'It is in the constraints: 32-bit integers.' } },
    { kind: 'stated', cost: 10, text: { pt: 'Posso receber a lista de intervalos vazia?', en: 'Can I receive an empty interval list?' }, reply: { pt: 'Sim, as constraints permitem length 0.', en: 'Yes, the constraints allow length 0.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Os intervalos representam datas com fuso horário?', en: 'Do the intervals represent dates with a timezone?' }, reply: { pt: 'Não, são só pares de inteiros.', en: 'No, they are just pairs of integers.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Preciso persistir o resultado mesclado em disco?', en: 'Do I need to persist the merged result to disk?' }, reply: { pt: 'Não, é uma função pura em memória.', en: 'No, it is a pure in-memory function.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'empty_input',
      text: { pt: 'Lista de intervalos vazia', en: 'Empty interval list' },
      why: { pt: 'Caso especial que precisa de um guard explícito antes de acessar sorted[0].', en: 'A special case that needs an explicit guard before accessing sorted[0].' },
      followUp: { question: { pt: 'O que retorna para []?', en: 'What does it return for []?' }, options: ['[]', '[[]]', 'erro'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'touching_intervals',
      text: { pt: 'Um intervalo termina exatamente onde o outro começa', en: 'One interval ends exactly where the other begins' },
      why: { pt: 'Testa <= versus <: essa versão do problema exige que intervalos que se tocam mesclem.', en: 'Tests <= versus <: this version of the problem requires touching intervals to merge.' },
      followUp: { question: { pt: '[[1,4],[4,5]] mescla?', en: 'Does [[1,4],[4,5]] merge?' }, options: ['Sim, vira [[1,5]]', 'Não, ficam separados', 'Só se forem iguais'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'nested_intervals',
      text: { pt: 'Um intervalo cai inteiramente dentro de outro', en: 'One interval falls entirely inside another' },
      why: { pt: 'Testa se o fim mesclado usa o máximo dos dois fins, não só o fim do intervalo mais recente.', en: 'Tests whether the merged end takes the max of the two ends, not just the most recent interval\'s end.' },
      followUp: { question: { pt: '[[1,10],[2,3]] mescla para?', en: 'What does [[1,10],[2,3]] merge into?' }, options: ['[1,10]', '[1,3]', '[2,10]'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'unsorted_input',
      text: { pt: 'Intervalos chegam fora de ordem', en: 'Intervals arrive out of order' },
      why: { pt: 'A varredura de mescla assume ordem crescente por início; sem ordenar primeiro, o resultado fica errado.', en: 'The merge scan assumes ascending order by start; without sorting first, the result comes out wrong.' },
      followUp: { question: { pt: 'Preciso ordenar antes de varrer?', en: 'Do I need to sort before scanning?' }, options: ['Sim, por início', 'Não, a ordem não importa', 'Sim, por fim'], correct: 0 },
    },
    {
      relevant: false,
      text: { pt: 'Intervalo com início maior que fim', en: 'Interval with start greater than end' },
      why: { pt: 'As constraints garantem intervalos válidos (início <= fim); não precisa validar isso.', en: 'The constraints guarantee valid intervals (start <= end); no need to validate this.' },
    },
    {
      relevant: false,
      text: { pt: 'Valores negativos de início ou fim', en: 'Negative start or end values' },
      why: { pt: 'A comparação numérica funciona igual para negativos; nada de especial a tratar.', en: 'The numeric comparison works the same for negatives; nothing special to handle.' },
    },
    {
      relevant: false,
      text: { pt: 'Todos os intervalos são idênticos', en: 'All intervals are identical' },
      why: { pt: 'É só um caso particular de sobreposição; mescla em um único intervalo sem lógica extra.', en: 'It is just a special case of overlap; it merges into a single interval with no extra logic.' },
    },
    {
      relevant: false,
      text: { pt: 'A lista tem um único intervalo', en: 'The list has a single interval' },
      why: { pt: 'Não há nada para mesclar; o laço nem executa e o resultado é o próprio intervalo.', en: 'There is nothing to merge; the loop never runs and the result is the interval itself.' },
    },
  ],

  pattern: { correct: 'sort-intervals', distractors: ['sweep-line', 'two-pointers', 'greedy'] },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Ordenar pelo início e varrer mesclando com o anterior', en: 'Sort by start and scan merging with the previous one' },
      time: 'O(n log n)',
      space: 'O(n)',
      why: { pt: 'Depois de ordenar, intervalos que se sobrepõem ficam vizinhos; uma varredura linear decide mesclar ou abrir novo grupo.', en: 'Once sorted, overlapping intervals end up adjacent; a single linear scan decides to merge or start a new group.' },
    },
    {
      chosen: false,
      name: { pt: 'Força bruta: comparar cada intervalo com todos os outros até estabilizar', en: 'Brute force: compare every interval against all others until it stabilizes' },
      time: 'O(n²)',
      space: 'O(n)',
      why: { pt: 'Com 100k intervalos em ordem reversa, O(n²) passa de 10 bilhões de comparações; o esperado é O(n log n).', en: 'With 100k intervals in reverse order, O(n²) blows past 10 billion comparisons; O(n log n) is expected.' },
    },
    {
      chosen: false,
      name: { pt: 'Sweep line com eventos +1/-1 nos extremos', en: 'Sweep line with +1/-1 events at the endpoints' },
      time: 'O(n log n)',
      space: 'O(n)',
      why: { pt: 'Mesma complexidade, mas mais máquina do que o necessário aqui; vira a estrutura certa quando o follow-up pede inserções e remoções dinâmicas.', en: 'Same complexity, but more machinery than needed here; it becomes the right structure once the follow-up asks for dynamic inserts and deletes.' },
    },
  ],
}

export default content
