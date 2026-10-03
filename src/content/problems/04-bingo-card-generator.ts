import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function isValid(card) {                    20 function generate(random) {
//  1   if (card.length !== 3) return false        21   const available: number[][] = []
//  2   const seen = new Set()                      22   for (let col = 0; col < 9; col++) {
//  3   for (const row of card) {                    23     const nums: number[] = []
//  4     if (row.length !== 9) return false          24     for (let v = 1; v <= 10; v++) ...
//  5     let filled = 0                               25     available.push(nums)
//  6     for (let col = 0; col < 9; col++) {           26   }
//  7       const v = row[col]                          27   const card: number[][] = []
//  8       if (v === 0) continue                        28   for (let row = 0; row < 3; row++) {
//  9       filled++                                      29     const cols = [0..8]
// 10       const lo = col * 10 + 1                        30     for (let i = cols.length - 1; i > 0; i--) {
// 11       const hi = col * 10 + 10                        31       const j = Math.floor(random() * (i + 1))
// 12       if (v < lo || v > hi) return false               32       const tmp = cols[i]
// 13       if (seen.has(v)) return false                     33       cols[i] = cols[j]
// 14       seen.add(v)                                        34       cols[j] = tmp
// 15     }                                                      35     }
// 16     if (filled !== 5) return false                         36     const chosen = cols.slice(0, 5)
// 17   }                                                          37     const line = new Array(9).fill(0)
// 18   return true                                                38     for (const col of chosen) {
// 19 }                                                              39       const pool = available[col]
//                                                                    40       const pick = Math.floor(random() * pool.length)
//                                                                    41       line[col] = pool[pick]
//                                                                    42       pool.splice(pick, 1)
//                                                                    43     }
//                                                                    44     card.push(line)
//                                                                    45   }
//                                                                    46   return card
//                                                                    47 }

const content: ProblemContent = {
  id: 4,
  source: `function isValid(card: number[][]): boolean {
  if (card.length !== 3) return false
  const seen = new Set<number>()
  for (const row of card) {
    if (row.length !== 9) return false
    let filled = 0
    for (let col = 0; col < 9; col++) {
      const v = row[col]
      if (v === 0) continue
      filled++
      const lo = col * 10 + 1
      const hi = col * 10 + 10
      if (v < lo || v > hi) return false
      if (seen.has(v)) return false
      seen.add(v)
    }
    if (filled !== 5) return false
  }
  return true
}
function generate(random: () => number): number[][] {
  const available: number[][] = []
  for (let col = 0; col < 9; col++) {
    const nums: number[] = []
    for (let v = 1; v <= 10; v++) nums.push(col * 10 + v)
    available.push(nums)
  }
  const card: number[][] = []
  for (let row = 0; row < 3; row++) {
    const cols = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    for (let i = cols.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      const tmp = cols[i]
      cols[i] = cols[j]
      cols[j] = tmp
    }
    const chosen = cols.slice(0, 5)
    const line = new Array(9).fill(0)
    for (const col of chosen) {
      const pool = available[col]
      const pick = Math.floor(random() * pool.length)
      line[col] = pool[pick]
      pool.splice(pick, 1)
    }
    card.push(line)
  }
  return card
}`,

  steps: [
    { indent: 0, text: { pt: 'isValid: se a carta não tem exatamente 3 linhas, retorna false', en: 'isValid: if the card does not have exactly 3 rows, return false' } },
    { indent: 0, text: { pt: 'Mantém um Set `seen` com os números já vistos na carta inteira (não por linha)', en: 'Keep a `seen` Set with the numbers already seen across the whole card (not per row)' } },
    { indent: 0, text: { pt: 'Para cada linha: conta os não-zero; para cada um, confere se cabe no intervalo da sua coluna e se não repete em `seen`', en: 'For each row: count the non-zero cells; for each one, check it fits its column\'s range and is not already in `seen`' } },
    { indent: 1, text: { pt: 'Se a linha não tem exatamente 5 preenchidos, retorna false', en: 'If the row does not have exactly 5 filled cells, return false' } },
    { indent: 0, text: { pt: 'Depois de checar as 3 linhas, retorna true', en: 'After checking all 3 rows, return true' } },
    { indent: 0, text: { pt: 'generate: monta, para cada coluna, o pool com os 10 números possíveis dela', en: 'generate: build, for each column, the pool of its 10 possible numbers' } },
    { indent: 0, text: { pt: 'Para cada uma das 3 linhas:', en: 'For each of the 3 rows:' } },
    { indent: 1, text: { pt: 'Embaralha as 9 colunas (Fisher-Yates) e escolhe as 5 primeiras', en: 'Shuffle the 9 columns (Fisher-Yates) and pick the first 5' } },
    { indent: 1, text: { pt: 'Para cada coluna escolhida: sorteia e remove um número do pool daquela coluna', en: 'For each chosen column: draw and remove one number from that column\'s pool' } },
    { indent: 0, text: { pt: 'Retorna a carta montada', en: 'Return the assembled card' } },
  ],

  stepDistractors: [
    {
      indent: 1,
      text: { pt: 'Se a linha tem menos de 5 preenchidos, retorna false (mas aceita mais de 5)', en: 'If the row has fewer than 5 filled cells, return false (but accept more than 5)' },
      why: { pt: 'Checar só "menos que 5" deixa passar linhas com 6 ou mais números; a regra exige exatamente 5, nem mais nem menos.', en: 'Checking only "fewer than 5" lets rows with 6 or more numbers slip through; the rule requires exactly 5, not more, not fewer.' },
    },
    {
      indent: 0,
      text: { pt: 'Reinicia o Set `seen` a cada linha nova', en: 'Reset the `seen` Set at the start of every new row' },
      why: { pt: 'Reiniciar por linha deixaria o mesmo número aparecer em linhas diferentes da mesma carta; a unicidade é da carta inteira, não de cada linha.', en: 'Resetting per row would let the same number appear in different rows of the same card; uniqueness is card-wide, not per row.' },
    },
    {
      indent: 1,
      text: { pt: 'Em generate, escolhe sempre as colunas 0 a 4, sem embaralhar', en: 'In generate, always pick columns 0 through 4, without shuffling' },
      why: { pt: 'Sem embaralhar, toda carta gerada preenche exatamente as mesmas 5 colunas; perde toda a variabilidade e nunca usa as colunas 5 a 8.', en: 'Without shuffling, every generated card fills exactly the same 5 columns; it loses all variability and never uses columns 5 through 8.' },
    },
  ],

  blanks: [
    { line: 1, token: '!== 3', options: ['=== 3', '> 3'] },
    { line: 12, token: 'v < lo || v > hi', options: ['v < lo && v > hi', 'v <= lo || v >= hi'] },
    { line: 16, token: 'filled !== 5', options: ['filled < 5', 'filled > 5'] },
    { line: 13, token: 'seen.has(v)', options: ['seen.has(col)', 'seen.size > 0'] },
    { line: 40, token: 'pool.length', options: ['pool.length - 1', 'available.length'] },
  ],

  codeDistractors: [
    {
      code: '      if (v <= lo || v >= hi) return false',
      why: { pt: 'Com <= e >=, os próprios extremos válidos da coluna (por exemplo 1 ou 10 na coluna 0) seriam rejeitados.', en: 'With <= and >=, the column\'s own valid endpoints (for example 1 or 10 in column 0) would be rejected.' },
    },
    {
      code: '    if (filled > 5) return false',
      why: { pt: 'Só rejeita linhas com mais de 5 números; uma linha com apenas 2 preenchidos passaria sem ser notada.', en: 'Only rejects rows with more than 5 numbers; a row with just 2 filled cells would slip by unnoticed.' },
    },
    {
      code: '      pool.splice(pick, 2)',
      why: { pt: 'Remove dois números do pool por sorteio em vez de um; esgota o pool da coluna mais rápido do que deveria.', en: 'Removes two numbers from the pool per draw instead of one; drains the column\'s pool faster than it should.' },
    },
  ],

  bugs: [
    {
      id: 'loose-row-fill-check',
      line: 16,
      code: '    if (filled < 5) return false',
      failsTest: 'wrong_row_fill_count',
      why: { pt: 'Só rejeita linhas com menos de 5 números; uma linha com 6 preenchidos (um a mais) passa pelo filtro sem ser detectada.', en: 'Only rejects rows with fewer than 5 numbers; a row with 6 filled cells (one too many) slips through undetected.' },
      logLine: 16,
      logWhy: { pt: 'Logar `filled` ao final de cada linha mostra 6 para a primeira linha, mas o código deixa passar.', en: 'Logging `filled` at the end of each row shows 6 for the first row, yet the code lets it through.' },
    },
    {
      id: 'missing-upper-bound',
      line: 12,
      code: '      if (v < lo) return false',
      failsTest: 'number_in_wrong_column',
      why: { pt: 'Só checa o limite inferior da coluna; um número grande demais para a coluna (acima de `hi`) passa sem ser rejeitado.', en: 'Only checks the column\'s lower bound; a number too large for the column (above `hi`) passes unrejected.' },
      logLine: 12,
      logWhy: { pt: 'Logar v, lo e hi nessa célula mostra v=21 > hi=10 na coluna 0, mas o código não retorna false.', en: 'Logging v, lo and hi at this cell shows v=21 > hi=10 in column 0, yet the code does not return false.' },
    },
    {
      id: 'seen-scoped-per-row',
      line: 4,
      code: '    seen.clear()',
      failsTest: 'duplicate_number',
      why: { pt: 'Limpa `seen` a cada linha nova em vez de checar o comprimento da linha; isso torna a unicidade apenas por linha, não pela carta inteira.', en: 'Clears `seen` on every new row instead of checking the row length; this makes uniqueness per-row instead of card-wide.' },
      logLine: 4,
      logWhy: { pt: 'Logar o tamanho de `seen` no início de cada linha mostra que ele volta a 0, perdendo os números das linhas anteriores.', en: 'Logging the size of `seen` at the start of each row shows it resets to 0, losing the previous rows\' numbers.' },
    },
    {
      id: 'picks-six-columns',
      line: 36,
      code: '    const chosen = cols.slice(0, 6)',
      failsTest: 'generate_seed_11',
      why: { pt: 'Escolhe 6 colunas por linha em vez de 5; toda carta gerada acaba com 6 números por linha, o que isValid rejeita.', en: 'Picks 6 columns per row instead of 5; every generated row ends up with 6 numbers, which isValid rejects.' },
      logLine: 36,
      logWhy: { pt: 'Logar chosen.length em cada linha mostra 6 em vez de 5, para qualquer seed.', en: 'Logging chosen.length for each row shows 6 instead of 5, for any seed.' },
    },
  ],

  followUp: {
    task: { pt: 'Gere uma cartela (strip) de 6 cartas em que cada número de 1 a 90 aparece exatamente uma vez.', en: 'Generate a strip of 6 cards in which every number 1..90 appears exactly once.' },
    changeLines: [20, 21, 28, 36],
    explanation: {
      pt: 'generate() (linha 20) passa a receber/produzir as 6 cartas de uma vez, e `available` (linha 21) deixa de ser recriado por carta: os pools de cada coluna (10 números) são compartilhados pelas 6 cartas, para garantir que cada número só seja usado uma vez no total. O loop de linha (linha 28) vira um loop duplo (6 cartas × 3 linhas = 18 linhas), e a escolha de colunas (linha 36) precisa garantir que, somando as 18 linhas, cada coluna seja preenchida exatamente 10 vezes — não basta sortear 5 colunas por linha de forma independente.',
      en: 'generate() (line 20) now produces all 6 cards at once, and `available` (line 21) stops being recreated per card: each column\'s pool (10 numbers) is shared across the 6 cards, guaranteeing every number is used exactly once overall. The row loop (line 28) becomes a double loop (6 cards × 3 rows = 18 rows), and the column choice (line 36) must guarantee that, summed over the 18 rows, each column is filled exactly 10 times — picking 5 columns per row independently is no longer enough.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: '0 significa célula vazia?', en: 'Does 0 mean an empty cell?' }, reply: { pt: 'Sim, 0 representa célula vazia.', en: 'Yes, 0 represents an empty cell.' } },
    { kind: 'good', cost: 20, text: { pt: 'Os números precisam ser únicos só na linha ou na carta inteira?', en: 'Do numbers need to be unique only within a row, or across the whole card?' }, reply: { pt: 'Únicos na carta inteira.', en: 'Unique across the whole card.' } },
    { kind: 'good', cost: 20, text: { pt: 'Como os testes de generate funcionam, já que é aleatório?', en: 'How do the tests for generate work, given that it is random?' }, reply: { pt: 'A aleatoriedade é injetada; os testes ocultos chamam isValid diretamente e isValid(generate(seededRandom(s))) para várias seeds fixas.', en: 'Randomness is injected; hidden tests call isValid directly and isValid(generate(seededRandom(s))) for several fixed seeds.' } },
    { kind: 'good', cost: 20, text: { pt: 'Toda coluna precisa ter pelo menos um número em cada linha?', en: 'Does every column need at least one number in each row?' }, reply: { pt: 'Não; uma coluna pode ficar vazia numa linha dada.', en: 'No; a column can be empty in a given row.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Quantas linhas e colunas tem a carta?', en: 'How many rows and columns does the card have?' }, reply: { pt: 'Está no enunciado: exatamente 3 linhas e 9 colunas.', en: 'It is in the prompt: exactly 3 rows and 9 columns.' } },
    { kind: 'stated', cost: 15, text: { pt: 'generate precisa terminar rápido ou pode tentar de novo até dar certo?', en: 'Does generate need to finish quickly, or can it retry until it works?' }, reply: { pt: 'Está nas constraints: generate precisa terminar em tempo limitado para qualquer fonte de aleatoriedade.', en: 'It is in the constraints: generate must terminate in bounded time for any random source.' } },
    { kind: 'noise', cost: 30, text: { pt: 'A carta precisa ser impressa em cores diferentes por coluna?', en: 'Does the card need to be printed in different colors per column?' }, reply: { pt: 'Não há renderização; isValid e generate só trabalham com números.', en: 'There is no rendering; isValid and generate only deal with numbers.' } },
    { kind: 'noise', cost: 30, text: { pt: 'A entrada de isValid pode vir como string JSON em vez de array?', en: 'Can isValid\'s input arrive as a JSON string instead of an array?' }, reply: { pt: 'Irrelevante: card é sempre number[][] em memória.', en: 'Irrelevant: card is always an in-memory number[][].' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'valid_card',
      text: { pt: 'Uma carta bem formada deve ser aceita', en: 'A well-formed card must be accepted' },
      why: { pt: 'O caso base: 5 números por linha, cada um na faixa certa, sem repetição — isValid precisa dizer true.', en: 'The base case: 5 numbers per row, each in the right range, no repeats — isValid must say true.' },
      followUp: { question: { pt: 'isValid retorna...', en: 'isValid returns...' }, options: ['true', 'false', 'depende da ordem das linhas'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'wrong_row_fill_count',
      text: { pt: 'Uma linha tem 6 números preenchidos em vez de 5', en: 'A row has 6 filled numbers instead of 5' },
      why: { pt: 'A contagem de preenchidos por linha precisa ser exatamente 5, não "pelo menos 5" nem "no máximo 5".', en: 'The per-row fill count must be exactly 5, not "at least 5" nor "at most 5".' },
      followUp: { question: { pt: 'isValid retorna...', en: 'isValid returns...' }, options: ['false', 'true', 'lança erro'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'number_in_wrong_column',
      text: { pt: 'Um número aparece numa coluna fora do seu intervalo correto', en: 'A number appears in a column outside its correct range' },
      why: { pt: 'Cada coluna tem uma faixa fixa de 10 números; um valor de outra faixa colocado ali invalida a carta.', en: 'Each column has a fixed range of 10 numbers; a value from another range placed there invalidates the card.' },
      followUp: { question: { pt: 'isValid retorna...', en: 'isValid returns...' }, options: ['false', 'true', 'só avisa'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'duplicate_number',
      text: { pt: 'O mesmo número aparece duas vezes, em linhas diferentes', en: 'The same number appears twice, in different rows' },
      why: { pt: 'A unicidade é da carta inteira; checar unicidade só dentro de cada linha deixaria passar essa repetição.', en: 'Uniqueness is card-wide; checking uniqueness only within each row would let this repeat slip through.' },
      followUp: { question: { pt: 'isValid retorna...', en: 'isValid returns...' }, options: ['false', 'true', 'depende da coluna'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'generate_seed_11',
      text: { pt: 'generate precisa produzir carta válida para a seed 11', en: 'generate must produce a valid card for seed 11' },
      why: { pt: 'Não basta funcionar "na maioria das vezes"; precisa ser válido para qualquer sequência de números que random() devolva.', en: 'It is not enough to work "most of the time"; it must be valid for any sequence of numbers random() returns.' },
      followUp: { question: { pt: 'isValid(generate(...)) com seed 11 retorna...', en: 'isValid(generate(...)) with seed 11 returns...' }, options: ['true', 'false', 'depende da seed'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'generate_seed_2024',
      text: { pt: 'generate precisa produzir carta válida também para a seed 2024', en: 'generate must also produce a valid card for seed 2024' },
      why: { pt: 'Testar uma segunda seed diferente garante que o algoritmo é robusto, não que só "deu sorte" numa seed específica.', en: 'Testing a second, different seed confirms the algorithm is robust, not that it just "got lucky" on one specific seed.' },
      followUp: { question: { pt: 'isValid(generate(...)) com seed 2024 retorna...', en: 'isValid(generate(...)) with seed 2024 returns...' }, options: ['true', 'false', 'depende da seed'], correct: 0 },
    },
    {
      relevant: false,
      text: { pt: 'A carta vem como array de arrays ou como string serializada?', en: 'Does the card arrive as an array of arrays or as a serialized string?' },
      why: { pt: 'O formato é sempre number[][]; não há um caso especial de formato a tratar.', en: 'The format is always number[][]; there is no special format case to handle.' },
    },
    {
      relevant: false,
      text: { pt: 'A ordem das colunas no array pode vir embaralhada?', en: 'Can the order of columns in the array be shuffled?' },
      why: { pt: 'O índice da coluna sempre corresponde à sua faixa fixa (coluna 0 = 1..10, etc.); não há reordenação a detectar.', en: 'The column index always corresponds to its fixed range (column 0 = 1..10, etc.); there is no reordering to detect.' },
    },
  ],

  pattern: {
    correct: 'candidate-enumeration',
    distractors: ['backtracking', 'greedy', 'bucket-sort'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Validação direta (27 células) + geração por embaralhar colunas e sortear sem reposição em pools por coluna', en: 'Direct validation (27 cells) + generation by shuffling columns and drawing without replacement from per-column pools' },
      time: 'O(1) por carta (27 células, 9 pools de 10)',
      space: 'O(1) por carta',
      why: { pt: 'Trabalho fixo e pequeno por carta, sem nenhum laço cujo número de repetições dependa da sorte do random().', en: 'Fixed, small work per card, with no loop whose repeat count depends on random() getting lucky.' },
    },
    {
      chosen: false,
      name: { pt: 'Gerar números aleatórios e tentar de novo se a carta ficar inválida (rejection sampling)', en: 'Generate random numbers and retry if the card ends up invalid (rejection sampling)' },
      time: 'Sem limite superior garantido; pode nunca terminar',
      space: 'O(1) por tentativa',
      why: { pt: 'Viola a constraint de generate terminar em tempo limitado para qualquer fonte de aleatoriedade: uma fonte adversarial pode fazer o retry nunca convergir.', en: 'Violates the constraint that generate must terminate in bounded time for any random source: an adversarial source could make the retry never converge.' },
    },
    {
      chosen: false,
      name: { pt: 'Pré-computar todas as cartas válidas possíveis e sortear um índice', en: 'Precompute every possible valid card and draw an index' },
      time: 'Espaço de cartas astronomicamente grande para pré-computar',
      space: 'Impraticável',
      why: { pt: 'O número de combinações de 5 colunas entre 9, com números distintos por coluna, é grande demais para enumerar e guardar de antemão.', en: 'The number of combinations of 5 columns out of 9, with distinct numbers per column, is far too large to enumerate and store upfront.' },
    },
  ],
}

export default content
