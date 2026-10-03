import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 class HitCounter {                      14 } else {
//  1 times: number[]                         15   this.times.push(timestamp)
//  2 counts: number[]                        16   this.counts.push(1)
//  3 head: number                            17 }
//  4 total: number                           18 this.total++
//  5 constructor() {                         19 }
//  6 this.times = []                         20 getHits(timestamp: number): number {
//  7 this.counts = []                        21 while (this.head < ... <= timestamp - 300) {
//  8 this.head = 0                           22   this.total -= this.counts[this.head]
//  9 this.total = 0                          23   this.head++
// 10 }                                       24 }
// 11 hit(timestamp: number): void {          25 return this.total
// 12 if (this.times.length > 0 && ...) {     26 }
// 13 this.counts[this.counts.length-1]++     27 }

const content: ProblemContent = {
  id: 14,
  source: `class HitCounter {
  times: number[]
  counts: number[]
  head: number
  total: number
  constructor() {
    this.times = []
    this.counts = []
    this.head = 0
    this.total = 0
  }
  hit(timestamp: number): void {
    if (this.times.length > 0 && this.times[this.times.length - 1] === timestamp) {
      this.counts[this.counts.length - 1]++
    } else {
      this.times.push(timestamp)
      this.counts.push(1)
    }
    this.total++
  }
  getHits(timestamp: number): number {
    while (this.head < this.times.length && this.times[this.head] <= timestamp - 300) {
      this.total -= this.counts[this.head]
      this.head++
    }
    return this.total
  }
}`,

  steps: [
    { indent: 0, text: { pt: 'Estado: times[] (timestamps distintos em ordem), counts[] (hits por timestamp), head = 0, total = 0', en: 'State: times[] (distinct timestamps in order), counts[] (hits per timestamp), head = 0, total = 0' } },
    { indent: 0, text: { pt: 'hit(timestamp):', en: 'hit(timestamp):' } },
    { indent: 1, text: { pt: 'Se o último timestamp em times já é este timestamp: incrementa o counts correspondente', en: 'If the last timestamp in times already equals this timestamp: increment its counts entry' } },
    { indent: 1, text: { pt: 'Senão: adiciona o timestamp ao fim de times e 1 ao fim de counts', en: 'Else: append the timestamp to times and 1 to counts' } },
    { indent: 1, text: { pt: 'total++', en: 'total++' } },
    { indent: 0, text: { pt: 'getHits(timestamp):', en: 'getHits(timestamp):' } },
    { indent: 1, text: { pt: 'Enquanto o timestamp em head é <= timestamp - 300 (saiu da janela): subtrai seu counts de total e avança head', en: 'While the timestamp at head is <= timestamp - 300 (outside the window): subtract its counts from total and advance head' } },
    { indent: 1, text: { pt: 'Retorna total', en: 'Return total' } },
  ],

  stepDistractors: [
    {
      indent: 1,
      text: { pt: 'Enquanto o timestamp em head é < timestamp - 300: subtrai e avança head', en: 'While the timestamp at head is < timestamp - 300: subtract and advance head' },
      why: { pt: 'A janela é (t-300, t], fechada em t-300 como limite de exclusão; usar `<` em vez de `<=` deixa um timestamp exatamente em t-300 contando quando já deveria ter saído.', en: 'The window is (t-300, t], closed at t-300 as the exclusion boundary; using `<` instead of `<=` leaves a timestamp at exactly t-300 still counting when it should already be out.' },
    },
    {
      indent: 1,
      text: { pt: 'getHits percorre todos os timestamps guardados somando os que estão na janela', en: 'getHits scans every stored timestamp, summing the ones inside the window' },
      why: { pt: 'Funciona, mas é O(n) por chamada; o ponteiro `head` evita rever timestamps já expirados, tornando cada chamada O(1) amortizado.', en: 'This works, but it is O(n) per call; the `head` pointer avoids rescanning timestamps already expired, making each call O(1) amortized.' },
    },
    {
      indent: 1,
      text: { pt: 'hit(timestamp): sempre adiciona um novo par (timestamp, 1), nunca funde com o anterior', en: 'hit(timestamp): always appends a new (timestamp, 1) pair, never merges with the previous one' },
      why: { pt: 'Também chega à resposta certa, mas desperdiça memória com um bucket por hit em vez de um por timestamp distinto quando hits se repetem no mesmo instante.', en: 'This also reaches the right answer, but wastes memory with one bucket per hit instead of one per distinct timestamp when hits repeat at the same instant.' },
    },
  ],

  blanks: [
    { line: 8, token: 'this.head = 0', options: ['this.head = 1', 'this.head = -1'] },
    { line: 12, token: 'this.times.length - 1', options: ['this.times.length', 'this.times.length - 2'] },
    { line: 18, token: 'this.total++', options: ['this.total--', 'this.total += this.times.length'] },
    { line: 21, token: 'timestamp - 300', options: ['timestamp - 299', 'timestamp + 300'] },
    { line: 22, token: '-=', options: ['+=', '='] },
  ],

  codeDistractors: [
    {
      code: '    while (this.head < this.times.length && this.times[this.head] < timestamp - 300) {',
      why: { pt: 'Usa `<` em vez de `<=`; um hit exatamente no limite t-300 deveria sair da janela, mas essa versão o mantém contando.', en: 'Uses `<` instead of `<=`; a hit at exactly t-300 should leave the window, but this version keeps counting it.' },
    },
    {
      code: '    this.total = this.counts.length',
      why: { pt: 'Troca o total de hits pelo número de buckets distintos; hits repetidos no mesmo timestamp deixam de ser contados corretamente.', en: 'Swaps the hit total for the number of distinct buckets; repeated hits at the same timestamp stop being counted correctly.' },
    },
    {
      code: '      this.counts[this.counts.length - 1] = 1',
      why: { pt: 'Reseta o contador do bucket para 1 em vez de incrementá-lo; hits repetidos no mesmo timestamp deixam de ser contados.', en: 'Resets the bucket\'s counter to 1 instead of incrementing it; repeated hits at the same timestamp stop being counted.' },
    },
  ],

  bugs: [
    {
      id: 'window-closes-early',
      line: 21,
      code: '    while (this.head < this.times.length && this.times[this.head] <= timestamp - 299) {',
      failsTest: 'window_boundary',
      why: { pt: 'A janela é (t-300, t]; usar -299 fecha a janela um segundo antes da hora, expulsando um hit que ainda deveria contar.', en: 'The window is (t-300, t]; using -299 closes the window one second too early, evicting a hit that should still count.' },
      logLine: 21,
      logWhy: { pt: 'Logar o valor de corte (`timestamp - 299`) nessa linha mostra que ele fica um segundo adiantado em relação ao esperado, exatamente quando get(300) expulsa o hit de t=1 antes da hora.', en: 'Logging the cutoff value (`timestamp - 299`) on this line shows it sits one second ahead of where it should be, exactly when get(300) evicts the t=1 hit too early.' },
    },
    {
      id: 'merge-skips-total',
      line: 13,
      code: '      this.counts[this.counts.length - 1]++; return',
      failsTest: 'same_timestamp',
      why: { pt: 'O `return` extra sai da função assim que funde com o bucket anterior, pulando o `total++` do final; hits repetidos no mesmo timestamp deixam de contar depois do primeiro.', en: 'The extra `return` exits the function as soon as it merges into the previous bucket, skipping the final `total++`; repeated hits at the same timestamp stop counting after the first.' },
      logLine: 13,
      logWhy: { pt: 'Logar `this.total` logo antes do `return` mostra que ele não muda do segundo hit em diante, mesmo com mais hits no mesmo timestamp chegando.', en: 'Logging `this.total` right before the `return` shows it never changes from the second hit onward, even as more hits at the same timestamp arrive.' },
    },
    {
      id: 'evict-forgets-total',
      line: 22,
      code: '      this.total',
      failsTest: 'expired_all',
      why: { pt: 'Avança `head` mas nunca subtrai o bucket de `total`; quando a janela inteira expira, o contador deveria cair a 0 mas fica travado no valor acumulado.', en: 'Advances `head` but never subtracts the bucket from `total`; when the whole window expires, the counter should drop to 0 but stays stuck at the accumulated value.' },
      logLine: 23,
      logWhy: { pt: 'Logar `head` e `total` a cada volta do while mostra `head` avançando normalmente enquanto `total` nunca diminui, mesmo depois que tudo devia ter expirado.', en: 'Logging `head` and `total` on each pass through the while shows `head` advancing normally while `total` never shrinks, even after everything should have expired.' },
    },
    {
      id: 'window-closes-late',
      line: 21,
      code: '    while (this.head < this.times.length && this.times[this.head] <= timestamp - 301) {',
      failsTest: 'mixed_expiry',
      why: { pt: 'Usar -301 mantém a janela aberta um segundo além da hora; hits que já deveriam ter expirado continuam sendo contados.', en: 'Using -301 keeps the window open one second too long; hits that should already have expired keep being counted.' },
      logLine: 21,
      logWhy: { pt: 'Logar o valor de corte (`timestamp - 301`) mostra que ele fica um segundo atrasado, exatamente o suficiente para o hit de t=100 continuar na janela em get(400) quando já devia ter saído.', en: 'Logging the cutoff value (`timestamp - 301`) shows it sits one second late, just enough for the t=100 hit to stay in the window at get(400) when it should already be gone.' },
    },
  ],

  followUp: {
    task: { pt: 'Torne a janela configurável e adicione `getHits(timestamp, window)`.', en: 'Make the window configurable and add `getHits(timestamp, window)`.' },
    changeLines: [20, 21],
    explanation: {
      pt: 'Adicione um segundo parâmetro `window: number = 300` à assinatura de getHits (linha 20) e troque o `300` fixo na comparação de corte (linha 21) por `window`. Nada mais muda: `hit()` continua só anexando timestamps, e a lógica de evicção com o ponteiro `head` é agnóstica ao tamanho da janela.',
      en: 'Add a second parameter `window: number = 300` to the getHits signature (line 20) and replace the hardcoded `300` in the cutoff comparison (line 21) with `window`. Nothing else changes: `hit()` still just appends timestamps, and the head-pointer eviction logic is window-size agnostic.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'A janela é inclusiva ou exclusiva nas pontas?', en: 'Is the window inclusive or exclusive at the edges?' }, reply: { pt: 'A janela é (t-300, t].', en: 'The window is (t-300, t].' } },
    { kind: 'good', cost: 15, text: { pt: 'Vários hits podem acontecer no mesmo timestamp?', en: 'Can multiple hits happen at the same timestamp?' }, reply: { pt: 'Sim, vários hits podem compartilhar um timestamp.', en: 'Yes, multiple hits may share a timestamp.' } },
    { kind: 'good', cost: 15, text: { pt: 'Os timestamps sempre chegam em ordem crescente, ou podem voltar no tempo?', en: 'Do timestamps always arrive in increasing order, or can they go backwards?' }, reply: { pt: 'Os timestamps de base chegam em ordem não decrescente.', en: 'Base timestamps arrive in nondecreasing order.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Qual o número máximo de operações?', en: 'What is the maximum number of operations?' }, reply: { pt: 'Está nas constraints: até 200.000.', en: 'It is in the constraints: up to 200,000.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Os timestamps são sempre inteiros positivos?', en: 'Are timestamps always positive integers?' }, reply: { pt: 'Sim, está nas constraints.', en: 'Yes, it is in the constraints.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Preciso persistir os hits entre processos ou instâncias diferentes?', en: 'Do I need to persist hits across different processes or instances?' }, reply: { pt: 'Não; é um contador único em memória.', en: 'No; it is a single in-memory counter.' } },
    { kind: 'noise', cost: 30, text: { pt: 'getHits também deve registrar um log em arquivo para auditoria?', en: 'Should getHits also write a log file for auditing?' }, reply: { pt: 'Não há esse requisito aqui.', en: 'There is no such requirement here.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'window_boundary',
      text: { pt: 'get() chamado exatamente 300s depois de um hit', en: 'get() called exactly 300s after a hit' },
      why: { pt: 'Testa o limite (t-300, t]: um hit exatamente no limite inferior deve sair da janela só no segundo seguinte, não no mesmo instante.', en: 'Tests the (t-300, t] boundary: a hit exactly at the lower edge should leave the window only on the following second, not at that same instant.' },
      followUp: { question: { pt: 'No teste, get(300) ainda conta o hit feito em t=1?', en: 'In the test, does get(300) still count the hit made at t=1?' }, options: ['Sim', 'Não'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'same_timestamp',
      text: { pt: 'Vários hits no mesmo timestamp', en: 'Several hits at the same timestamp' },
      why: { pt: 'O mesmo instante pode receber hits repetidos; cada um deve contar individualmente, mesmo que sejam agrupados internamente num só bucket.', en: 'The same instant can receive repeated hits; each one must count individually, even if they are grouped internally into a single bucket.' },
      followUp: { question: { pt: '3 hits em t=5, depois get(5): quantos?', en: '3 hits at t=5, then get(5): how many?' }, options: ['1', '3'], correct: 1 },
    },
    {
      relevant: true,
      concept: 'expired_all',
      text: { pt: 'Todos os hits já saíram da janela', en: 'All hits have aged out of the window' },
      why: { pt: 'Quando a janela inteira expira, o contador deve cair para 0, não manter o valor acumulado anterior.', en: 'When the whole window expires, the counter should drop to 0, not keep the previously accumulated value.' },
      followUp: { question: { pt: 'Quantos hits restam contando?', en: 'How many hits are still counted?' }, options: ['0', 'O total acumulado antes'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'mixed_expiry',
      text: { pt: 'Alguns hits expiraram, outros não', en: 'Some hits expired, others did not' },
      why: { pt: 'A expiração é parcial e por timestamp individual, não tudo ou nada; testa se o ponteiro head avança só até onde deve.', en: 'Expiry is partial and per individual timestamp, not all-or-nothing; tests whether the head pointer advances only as far as it should.' },
      followUp: { question: { pt: 'Hits em 100 e 200 expiraram, 350 não; quantos contam?', en: 'Hits at 100 and 200 expired, 350 did not; how many count?' }, options: ['1', '2', '3'], correct: 1 },
    },
    {
      relevant: false,
      text: { pt: 'Hits chegam fora de ordem (um timestamp menor depois de um maior)', en: 'Hits arrive out of order (a smaller timestamp after a larger one)' },
      why: { pt: 'As constraints garantem que os timestamps de base chegam em ordem não decrescente; não é um caso a tratar.', en: 'The constraints guarantee base timestamps arrive in nondecreasing order; it is not a case to handle.' },
    },
    {
      relevant: false,
      text: { pt: 'Timestamps extremamente grandes, perto do limite seguro de precisão', en: 'Extremely large timestamps, near the safe precision limit' },
      why: { pt: 'Cabem num number de JS sem perda de precisão; nada especial a fazer.', en: 'They fit in a JS number without losing precision; nothing special to do.' },
    },
    {
      relevant: false,
      text: { pt: 'getHits chamado antes de qualquer hit', en: 'getHits called before any hit' },
      why: { pt: 'A estrutura começa vazia; o loop de expiração simplesmente não roda e o total já é 0, sem caso especial.', en: 'The structure starts empty; the eviction loop simply does not run and the total is already 0, with no special case.' },
    },
  ],

  pattern: {
    correct: 'queue-window',
    distractors: ['hash-map-count', 'monotonic-deque', 'prefix-sum'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Fila de buckets (timestamp, count) com total corrente e ponteiro head', en: 'Queue of (timestamp, count) buckets with a running total and head pointer' },
      time: 'O(1) amortizado por operação',
      space: 'O(n) hits guardados',
      why: { pt: 'Cada hit funde ou anexa em O(1); cada getHits só avança head para frente, então o trabalho total de evicção, somado por toda a vida do contador, é no máximo o número de hits. Bate com o esperado: O(1) amortizado ou buckets de tamanho fixo.', en: 'Each hit merges or appends in O(1); each getHits only moves head forward, so the total eviction work across the counter\'s whole lifetime is at most the number of hits. Matches the expected reasoning: amortized O(1) or fixed-size buckets.' },
    },
    {
      chosen: false,
      name: { pt: 'Guardar todo timestamp de hit num array; getHits percorre tudo a cada chamada', en: 'Store every hit timestamp in an array; getHits scans it on every call' },
      time: 'O(n) por chamada de getHits',
      space: 'O(n)',
      why: { pt: 'Com 200k operações intercaladas, isso degrada para O(n^2) no pior caso: varrer todos os hits guardados a cada get é muito mais lento do que necessário.', en: 'With 200k interleaved operations, this degrades to O(n^2) in the worst case: scanning every stored hit on every get call is far slower than needed.' },
    },
    {
      chosen: false,
      name: { pt: '300 buckets circulares de tamanho fixo, um por segundo da janela', en: '300 fixed-size circular buckets, one per second of the window' },
      time: 'O(1) por operação',
      space: 'O(300)',
      why: { pt: 'Também válido e usa menos memória, mas assume hits alinhados a segundos inteiros e complica mais a implementação correta desta versão do problema.', en: 'Also valid and uses less memory, but assumes hits align to whole seconds and makes a correct implementation of this version of the problem more complex.' },
    },
  ],
}

export default content
