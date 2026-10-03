import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function topKFrequent(...)
//  1 const freq = new Map<number, number>()
//  2 for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1)
//  3 const buckets: number[][] = new Array(nums.length + 1)
//  4 for (let i = 0; i <= nums.length; i++) buckets[i] = []
//  5 const values = [...freq.keys()].sort((a, b) => a - b)
//  6 for (const v of values) buckets[freq.get(v)!].push(v)
//  7 const result: number[] = []
//  8 for (let f = buckets.length - 1; f >= 0 && result.length < k; f--) {
//  9   for (const v of buckets[f]) {
// 10     if (result.length === k) break
// 11     result.push(v)
// 12   }
// 13 }
// 14 return result
// 15 }

const content: ProblemContent = {
  id: 19,
  source: `function topKFrequent(nums: number[], k: number): number[] {
  const freq = new Map<number, number>()
  for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1)
  const buckets: number[][] = new Array(nums.length + 1)
  for (let i = 0; i <= nums.length; i++) buckets[i] = []
  const values = [...freq.keys()].sort((a, b) => a - b)
  for (const v of values) buckets[freq.get(v)!].push(v)
  const result: number[] = []
  for (let f = buckets.length - 1; f >= 0 && result.length < k; f--) {
    for (const v of buckets[f]) {
      if (result.length === k) break
      result.push(v)
    }
  }
  return result
}`,

  steps: [
    { indent: 0, text: { pt: 'Conta a frequência de cada valor num mapa', en: 'Count the frequency of each value in a map' } },
    { indent: 0, text: { pt: 'Cria buckets[0..n], um balde de valores por frequência possível', en: 'Create buckets[0..n], one bucket of values per possible frequency' } },
    { indent: 0, text: { pt: 'Pega os valores distintos ordenados do menor para o maior', en: 'Take the distinct values sorted smallest to largest' } },
    { indent: 0, text: { pt: 'Para cada valor, nessa ordem, põe ele no bucket da sua frequência', en: 'For each value, in that order, drop it into the bucket of its frequency' } },
    { indent: 0, text: { pt: 'Varre os buckets da maior frequência para a menor:', en: 'Scan the buckets from the highest frequency down:' } },
    { indent: 1, text: { pt: 'Para cada valor desse bucket, se já tem k valores, para', en: 'For each value in that bucket, if there are already k values, stop' } },
    { indent: 1, text: { pt: 'Senão, adiciona o valor ao resultado', en: 'Otherwise, add the value to the result' } },
    { indent: 0, text: { pt: 'Retorna o resultado', en: 'Return the result' } },
  ],

  stepDistractors: [
    {
      indent: 0,
      text: { pt: 'Ordena todos os valores (com repetição) pela frequência e pega os k primeiros', en: 'Sort all values (with repeats) by frequency and take the first k' },
      why: { pt: 'Ordenar o array inteiro de n elementos custa O(n log n) à toa; o bucket sort resolve em O(n) porque a frequência máxima é limitada por n.', en: 'Sorting the whole n-element array costs O(n log n) for nothing; bucket sort does it in O(n) because the max frequency is bounded by n.' },
    },
    {
      indent: 0,
      text: { pt: 'Pega os valores distintos ordenados do maior para o menor', en: 'Take the distinct values sorted largest to smallest' },
      why: { pt: 'O desempate exige o menor valor primeiro entre frequências iguais; ordenar decrescente inverte esse critério.', en: 'The tie-break requires the smaller value first among equal frequencies; sorting descending flips that rule.' },
    },
    {
      indent: 1,
      text: { pt: 'Para cada valor desse bucket, adiciona ao resultado só se a frequência for maior que 1', en: 'For each value in that bucket, add to the result only if frequency is greater than 1' },
      why: { pt: 'Um valor com frequência 1 ainda pode fazer parte do top k (ex.: quando todos os valores são distintos); essa condição descarta valores válidos.', en: 'A value with frequency 1 can still be part of the top k (e.g. when all values are distinct); this condition drops valid values.' },
    },
  ],

  blanks: [
    { line: 2, token: '?? 0', options: ['|| 1', '?? 1'] },
    { line: 3, token: 'nums.length + 1', options: ['nums.length', 'nums.length - 1'] },
    { line: 5, token: '(a, b) => a - b', options: ['(a, b) => b - a', '(a, b) => freq.get(a)! - freq.get(b)!'] },
    { line: 6, token: 'freq.get(v)!', options: ['v', 'freq.size'] },
    { line: 10, token: 'result.length === k', options: ['result.length === k - 1', 'result.length === buckets.length'] },
  ],

  codeDistractors: [
    {
      code: '  const buckets: number[][] = new Array(Math.max(...freq.values()) + 1)',
      why: { pt: 'Calcular o máximo das frequências antes de ter o mapa populado é uma dependência de ordem incorreta, além de custar uma varredura extra sem necessidade — o limite seguro já é nums.length.', en: 'Computing the max frequency before the map is populated is a wrong ordering dependency, and it costs an extra scan for nothing — the safe bound is already nums.length.' },
    },
    {
      code: '  for (let i = 0; i < buckets.length; i++) buckets[i] = buckets[i] ?? []',
      why: { pt: 'Reescreve a inicialização de forma redundante e ainda depende de `buckets.length` antes do array existir de fato com esse tamanho.', en: 'Rewrites the initialization redundantly and still depends on `buckets.length` before the array actually has that size.' },
    },
    {
      code: '  for (const v of values) buckets[freq.get(v)! - 1].push(v)',
      why: { pt: 'Desloca o índice do bucket por 1, misturando a frequência f com a frequência f-1 — valores de frequências diferentes acabam no mesmo bucket.', en: 'Shifts the bucket index by 1, mixing frequency f with frequency f-1 — values of different frequencies end up in the same bucket.' },
    },
  ],

  bugs: [
    {
      id: 'off-by-one-bucket-range',
      line: 4,
      code: '  for (let i = 0; i < nums.length; i++) buckets[i] = []',
      why: { pt: 'Troca <= por <; quando um único valor ocupa todo o array (frequência == nums.length), o bucket do topo nunca é inicializado e o push seguinte falha.', en: 'Swaps <= for <; when a single value fills the whole array (frequency == nums.length), the top bucket is never initialized and the next push fails.' },
      failsTest: 'single_distinct',
      logLine: 6,
      logWhy: { pt: 'Logar o índice de bucket e `buckets.length` nessa linha mostra o índice pedido igual a `buckets.length`, fora do array inicializado.', en: 'Logging the bucket index and `buckets.length` on this line shows the requested index equal to `buckets.length`, outside what was initialized.' },
    },
    {
      id: 'value-as-index',
      line: 6,
      code: '  for (const v of values) buckets[v].push(v)',
      why: { pt: 'Usa o valor em si como índice do bucket em vez da sua frequência; para valores negativos isso cria propriedades fora dos índices numéricos reais do array, e o valor nunca aparece na varredura final.', en: 'Uses the value itself as the bucket index instead of its frequency; for negative values this creates properties outside the array\'s real numeric indices, and the value never shows up in the final scan.' },
      failsTest: 'negative_values',
      logLine: 6,
      logWhy: { pt: 'Logar `v` e `freq.get(v)` lado a lado nessa linha mostra o valor negativo sendo usado como índice em vez da frequência.', en: 'Logging `v` and `freq.get(v)` side by side on this line shows the negative value being used as the index instead of the frequency.' },
    },
    {
      id: 'descending-value-sort',
      line: 5,
      code: '  const values = [...freq.keys()].sort((a, b) => b - a)',
      why: { pt: 'Ordena os valores do maior para o menor antes de distribuí-los nos buckets; quando vários valores empatam na mesma frequência, o desempate "menor valor primeiro" sai invertido.', en: 'Sorts values largest to smallest before bucketing them; when several values tie on the same frequency, the "smaller value first" tie-break comes out reversed.' },
      failsTest: 'k_all_distinct',
      logLine: 5,
      logWhy: { pt: 'Logar `values` logo depois do sort mostra a ordem decrescente em vez de crescente.', en: 'Logging `values` right after the sort shows descending order instead of ascending.' },
    },
  ],

  followUp: {
    task: { pt: 'Adicione `add(value)` e faça `topK()` responder repetidamente sem recontar do zero.', en: 'Add `add(value)` and make `topK()` answer repeatedly without recounting from scratch.' },
    changeLines: [0, 1, 3, 6],
    explanation: {
      pt: 'A assinatura (linha 0) passa a ser uma classe com estado entre chamadas. O mapa de frequência (linha 1) vira um campo persistente, atualizado em O(1) a cada `add(value)` em vez de reconstruído do zero. Como o universo de frequências pode crescer sem limite conhecido de antemão, o array fixo de buckets (linha 3) dá lugar a um mapa frequência → conjunto de valores. A distribuição nos buckets (linha 6) deixa de rodar uma vez só no início e passa a mover um único valor entre dois buckets (frequência antiga e nova) a cada `add`.',
      en: 'The signature (line 0) becomes a class with state across calls. The frequency map (line 1) becomes a persistent field, updated in O(1) on every `add(value)` instead of rebuilt from scratch. Since the universe of frequencies can grow without a bound known upfront, the fixed buckets array (line 3) gives way to a frequency → set-of-values map. Bucketing (line 6) stops running once at the start and instead moves a single value between two buckets (old and new frequency) on every `add`.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'Se houver empate na frequência, qual valor vem primeiro?', en: 'If there is a tie in frequency, which value comes first?' }, reply: { pt: 'O menor valor vem primeiro; a saída é, portanto, única.', en: 'The smaller value comes first; the output is therefore unique.' } },
    { kind: 'good', cost: 20, text: { pt: 'k pode ser maior que o número de valores distintos?', en: 'Can k exceed the number of distinct values?' }, reply: { pt: 'Não, k nunca passa do número de valores distintos.', en: 'No, k never exceeds the number of distinct values.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Qual o tamanho máximo de nums?', en: 'What is the maximum size of nums?' }, reply: { pt: 'Está nas constraints: até 200000.', en: 'It is in the constraints: up to 200000.' } },
    { kind: 'stated', cost: 10, text: { pt: 'k pode ser 0?', en: 'Can k be 0?' }, reply: { pt: 'Está nas constraints: k >= 1.', en: 'It is in the constraints: k >= 1.' } },
    { kind: 'good', cost: 20, text: { pt: 'Os valores de nums são inteiros?', en: 'Are the values in nums integers?' }, reply: { pt: 'Sim, são todos inteiros.', en: 'Yes, they are all integers.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Os números podem vir como texto e precisar de parsing?', en: 'Can the numbers arrive as text and need parsing?' }, reply: { pt: 'Não, chegam como array de inteiros já.', en: 'No, they arrive as an array of integers already.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Preciso lidar com entrada chegando em streaming?', en: 'Do I need to handle input arriving as a stream?' }, reply: { pt: 'Não, é um array estático em memória para essa versão.', en: 'No, it is a static in-memory array for this version.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'single_distinct',
      text: { pt: 'Só existe um valor distinto, repetido várias vezes', en: 'Only one distinct value, repeated many times' },
      why: { pt: 'A frequência desse valor é igual a nums.length, o maior índice possível de bucket — testa o limite superior do array.', en: 'That value\'s frequency equals nums.length, the largest possible bucket index — this tests the array\'s upper bound.' },
      followUp: { question: { pt: 'topKFrequent([5,5,5], 1) retorna?', en: 'What does topKFrequent([5,5,5], 1) return?' }, options: ['[5]', '[]', 'erro'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'negative_values',
      text: { pt: 'nums contém valores negativos', en: 'nums contains negative values' },
      why: { pt: 'Nada no enunciado restringe o sinal; qualquer índice derivado diretamente do valor (em vez da frequência) quebra para negativos.', en: 'Nothing in the statement restricts the sign; any index derived directly from the value (instead of the frequency) breaks for negatives.' },
      followUp: { question: { pt: 'topKFrequent([-1,-1,-2,-3,-3,-3], 2) retorna?', en: 'What does topKFrequent([-1,-1,-2,-3,-3,-3], 2) return?' }, options: ['[-3,-1]', '[-1,-3]', '[-3,-2]'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'k_all_distinct',
      text: { pt: 'k é igual ao número de valores distintos', en: 'k equals the number of distinct values' },
      why: { pt: 'A resposta precisa incluir todo mundo, na ordem de desempate certa — testa o critério "menor valor primeiro" quando todas as frequências empatam.', en: 'The answer must include everyone, in the right tie-break order — this tests the "smaller value first" rule when every frequency ties.' },
      followUp: { question: { pt: 'topKFrequent([1,2,3], 3) retorna?', en: 'What does topKFrequent([1,2,3], 3) return?' }, options: ['[1,2,3]', '[3,2,1]', '[1,3,2]'], correct: 0 },
    },
    {
      relevant: false,
      text: { pt: 'nums vazio', en: 'Empty nums' },
      why: { pt: 'As constraints garantem pelo menos um elemento.', en: 'The constraints guarantee at least one element.' },
    },
    {
      relevant: false,
      text: { pt: 'k igual a 0', en: 'k equal to 0' },
      why: { pt: 'As constraints garantem k >= 1.', en: 'The constraints guarantee k >= 1.' },
    },
    {
      relevant: false,
      text: { pt: 'Valores muito grandes, perto do limite de 32 bits', en: 'Very large values, near the 32-bit limit' },
      why: { pt: 'São só chaves de mapa e índices de array de frequência (que é pequena); o valor em si nunca indexa nada.', en: 'They are just map keys and indexes into the (small) frequency array; the value itself never indexes anything.' },
    },
  ],

  pattern: { correct: 'bucket-sort', distractors: ['heap', 'quickselect', 'hash-map-count'] },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Bucket sort por frequência (índice do bucket = frequência)', en: 'Bucket sort by frequency (bucket index = frequency)' },
      time: 'O(n)',
      space: 'O(n)',
      why: { pt: 'A frequência máxima possível é n, então um array de n+1 buckets dá um "sort" por frequência em tempo linear, sem comparação.', en: 'The maximum possible frequency is n, so an array of n+1 buckets gives a frequency "sort" in linear time, with no comparisons.' },
    },
    {
      chosen: false,
      name: { pt: 'Min-heap de tamanho k pelas frequências', en: 'Min-heap of size k keyed by frequency' },
      time: 'O(n log k)',
      space: 'O(n)',
      why: { pt: 'Também correto e é a alternativa citada no raciocínio de performance deste problema; fica melhor que o bucket sort só quando k é muito menor que o número de valores distintos.', en: 'Also correct, and it is the alternative named in this problem\'s performance reasoning; it only beats bucket sort when k is much smaller than the number of distinct values.' },
    },
    {
      chosen: false,
      name: { pt: 'Ordenar todos os valores distintos por frequência com .sort()', en: 'Sort all distinct values by frequency with .sort()' },
      time: 'O(d log d)',
      space: 'O(d)',
      why: { pt: 'd = valores distintos, que pode chegar a 200k; ordenar por comparação é mais lento que o bucket sort sem ganhar nada em troca.', en: 'd = distinct values, which can reach 200k; comparison sort is slower than bucket sort for no benefit in return.' },
    },
  ],
}

export default content
