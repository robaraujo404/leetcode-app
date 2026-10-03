import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function alienOrder(words) {                  22 if (!found && a.length > b.length) return ''
//  1 const adj = new Map()                          23 }
//  2 const indegree = new Map()                     24 const heap: string[] = []
//  3 for (const w of words) {                        25 for (...) if (deg === 0) heap.push(ch)
//  4   for (const ch of w) {                          26 heap.sort()
//  5     if (!adj.has(ch)) adj.set(ch, new Set())      27 const order: string[] = []
//  6     if (!indegree.has(ch)) indegree.set(ch, 0)     28 while (heap.length > 0) {
//  7   }                                                 29   const ch = heap.shift()!
//  8 }                                                    30   order.push(ch)
//  9 for (let i = 0; ...) {                                31   for (const next of adj.get(ch)!) {
// 10   const a = words[i]                                    32     indegree.set(next, ... - 1)
// 11   const b = words[i + 1]                                 33     if (indegree.get(next) === 0) {
// 12   const len = Math.min(...)                               34       heap.push(next)
// 13   let found = false                                        35       heap.sort()
// 14   for (let j = 0; j < len; j++) {                           36     }
// 15     if (a[j] !== b[j]) {                                     37   }
// 16       if (!adj.get(a[j])!.has(b[j])) {                        38 }
// 17         adj.get(a[j])!.add(b[j])                               39 if (order.length < indegree.size) return ''
// 18         indegree.set(b[j], ... + 1)                            40 return order.join('')
// 19       }                                                         41 }
// 20       found = true
// 21       break

const content: ProblemContent = {
  id: 5,
  source: `function alienOrder(words: string[]): string {
  const adj = new Map<string, Set<string>>()
  const indegree = new Map<string, number>()
  for (const w of words) {
    for (const ch of w) {
      if (!adj.has(ch)) adj.set(ch, new Set())
      if (!indegree.has(ch)) indegree.set(ch, 0)
    }
  }
  for (let i = 0; i < words.length - 1; i++) {
    const a = words[i]
    const b = words[i + 1]
    const len = Math.min(a.length, b.length)
    let found = false
    for (let j = 0; j < len; j++) {
      if (a[j] !== b[j]) {
        if (!adj.get(a[j])!.has(b[j])) {
          adj.get(a[j])!.add(b[j])
          indegree.set(b[j], indegree.get(b[j])! + 1)
        }
        found = true
        break
      }
    }
    if (!found && a.length > b.length) return ''
  }
  const heap: string[] = []
  for (const [ch, deg] of indegree) if (deg === 0) heap.push(ch)
  heap.sort()
  const order: string[] = []
  while (heap.length > 0) {
    const ch = heap.shift()!
    order.push(ch)
    for (const next of adj.get(ch)!) {
      indegree.set(next, indegree.get(next)! - 1)
      if (indegree.get(next) === 0) {
        heap.push(next)
        heap.sort()
      }
    }
  }
  if (order.length < indegree.size) return ''
  return order.join('')
}`,

  steps: [
    { indent: 0, text: { pt: 'Para cada palavra, garante que todo caractere dela existe em adj e indegree (indegree inicial 0)', en: 'For every word, make sure each of its characters exists in adj and indegree (initial indegree 0)' } },
    { indent: 0, text: { pt: 'Para cada par de palavras consecutivas:', en: 'For each pair of consecutive words:' } },
    { indent: 1, text: { pt: 'Acha o primeiro índice onde os caracteres diferem', en: 'Find the first index where the characters differ' } },
    { indent: 2, text: { pt: 'Se existe diferença: adiciona a aresta char_a → char_b (se ainda não existir) e soma 1 no indegree de char_b', en: 'If there is a difference: add the edge char_a → char_b (if it does not exist yet) and add 1 to char_b\'s indegree' } },
    { indent: 2, text: { pt: 'Se não existe diferença nenhuma e a palavra anterior é mais longa que a próxima: retorna "" (prefixo inválido)', en: 'If there is no difference at all and the earlier word is longer than the next one: return "" (invalid prefix)' } },
    { indent: 0, text: { pt: 'Monta um heap com todos os caracteres de indegree 0, ordenado alfabeticamente', en: 'Build a heap with every character of indegree 0, sorted alphabetically' } },
    { indent: 0, text: { pt: 'Enquanto o heap não está vazio:', en: 'While the heap is not empty:' } },
    { indent: 1, text: { pt: 'Remove o menor caractere do heap e acrescenta ao resultado', en: 'Remove the smallest character from the heap and append it to the result' } },
    { indent: 1, text: { pt: 'Para cada vizinho na lista de adjacência: decrementa seu indegree; se chegar a 0, insere no heap e reordena', en: 'For each neighbor in the adjacency list: decrement its indegree; if it reaches 0, insert it into the heap and re-sort' } },
    { indent: 0, text: { pt: 'Se o resultado não cobre todos os caracteres, retorna "" (há um ciclo); senão retorna o resultado', en: 'If the result does not cover every character, return "" (there is a cycle); otherwise return the result' } },
  ],

  stepDistractors: [
    {
      indent: 2,
      text: { pt: 'Se existe diferença: adiciona arestas entre TODOS os pares de caracteres restantes das duas palavras', en: 'If there is a difference: add edges between EVERY remaining pair of characters from the two words' },
      why: { pt: 'Só o primeiro caractere diferente carrega informação de ordem; comparar os caracteres depois dele inventaria restrições que o enunciado não garante.', en: 'Only the first differing character carries ordering information; comparing the characters after it would invent constraints the statement does not guarantee.' },
    },
    {
      indent: 0,
      text: { pt: 'Compara cada palavra com TODAS as outras, não só com a vizinha seguinte', en: 'Compare each word with ALL the others, not just the next neighbor' },
      why: { pt: 'A ordem só garante que palavras ADJACENTES na lista respeitam o alfabeto; comparar pares não-adjacentes não tem significado e custa O(n²).', en: 'The ordering only guarantees that ADJACENT words in the list respect the alphabet; comparing non-adjacent pairs is meaningless and costs O(n²).' },
    },
    {
      indent: 1,
      text: { pt: 'Remove o maior caractere do heap e acrescenta ao resultado', en: 'Remove the largest character from the heap and append it to the result' },
      why: { pt: 'O desempate do enunciado pede o menor em ordem alfabética normal entre os disponíveis, não o maior.', en: 'The statement\'s tie-break asks for the smallest in normal alphabet order among the available ones, not the largest.' },
    },
  ],

  blanks: [
    { line: 6, token: 'indegree.set(ch, 0)', options: ['indegree.set(ch, 1)', 'indegree.delete(ch)'] },
    { line: 16, token: 'adj.get(a[j])!.has(b[j])', options: ['adj.get(b[j])!.has(a[j])', 'adj.get(a[j])!.has(a[j])'] },
    { line: 24, token: 'a.length > b.length', options: ['a.length < b.length', 'a.length === b.length'] },
    { line: 35, token: 'indegree.get(next) === 0', options: ['indegree.get(next) > 0', 'indegree.get(next) === 1'] },
    { line: 41, token: 'order.length < indegree.size', options: ['order.length > indegree.size', 'order.length !== indegree.size'] },
  ],

  codeDistractors: [
    {
      code: '      if (adj.has(ch)) adj.set(ch, new Set())',
      why: { pt: 'Inverte a condição: toda vez que a letra reaparece em outra palavra, seu Set de arestas é recriado vazio, apagando conexões já aprendidas.', en: 'Inverts the condition: every time the letter reappears in another word, its edge Set is recreated empty, erasing connections already learned.' },
    },
    {
      code: '  for (let i = 0; i < words.length; i++) {',
      why: { pt: 'Itera até o último índice; na última volta, words[i + 1] é undefined e a comparação quebra.', en: 'Iterates through the last index; on the final pass, words[i + 1] is undefined and the comparison breaks.' },
    },
    {
      code: '  return order.sort().join(\'\')',
      why: { pt: 'Ordena o resultado final em ordem alfabética comum, destruindo a ordem topológica calculada; o sample wrt,wrf,er,ett,rftt deixaria de dar "wertf".', en: 'Sorts the final result in plain alphabetical order, destroying the computed topological order; the sample wrt,wrf,er,ett,rftt would stop giving "wertf".' },
    },
  ],

  bugs: [
    {
      id: 'inverted-prefix-check',
      line: 24,
      code: '    if (!found && a.length < b.length) return \'\'',
      failsTest: 'prefix_conflict',
      why: { pt: 'Inverte a direção: só rejeitaria quando a palavra anterior fosse MAIS CURTA, mas o caso inválido é justamente a anterior ser mais LONGA que seu próprio prefixo.', en: 'Flips the direction: it would only reject when the earlier word is SHORTER, but the invalid case is exactly the earlier word being LONGER than its own prefix.' },
      logLine: 24,
      logWhy: { pt: 'Logar found, a.length e b.length nessa linha mostra found=false, a.length=3, b.length=2 para ["abc","ab"], e mesmo assim não retorna "".', en: 'Logging found, a.length and b.length here shows found=false, a.length=3, b.length=2 for ["abc","ab"], and yet it does not return "".' },
    },
    {
      id: 'swapped-has-check',
      line: 16,
      code: '        if (!adj.get(b[j])!.has(a[j])) {',
      failsTest: 'cycle',
      why: { pt: 'Checa se a aresta reversa já existe em vez da aresta que está tentando adicionar; quando as duas palavras já têm uma aresta entre si na direção oposta, a nova aresta deixa de ser registrada e o ciclo real desaparece do grafo.', en: 'Checks whether the reverse edge already exists instead of the edge it is trying to add; once the two words already have an edge between them in the opposite direction, the new edge never gets recorded and the real cycle disappears from the graph.' },
      logLine: 17,
      logWhy: { pt: 'Logar cada aresta de fato adicionada em adj mostra que a aresta x → z nunca aparece para ["z","x","z"], só z → x.', en: 'Logging every edge actually added to adj shows the edge x → z never appears for ["z","x","z"], only z → x.' },
    },
    {
      id: 'reverse-instead-of-sort',
      line: 28,
      code: '  heap.reverse()',
      failsTest: 'single_word',
      why: { pt: 'Troca o sort alfabético do heap inicial por um simples reverse da ordem de inserção; funciona por acaso quando a ordem de inserção já é alfabética, mas falha quando não é.', en: 'Swaps the initial heap\'s alphabetical sort for a plain reverse of insertion order; it works by coincidence when insertion order happens to be alphabetical, but fails when it is not.' },
      logLine: 28,
      logWhy: { pt: 'Logar o heap logo após essa linha mostra [c, b, a] para a palavra única "abc", quando deveria ser [a, b, c].', en: 'Logging the heap right after this line shows [c, b, a] for the single word "abc", when it should be [a, b, c].' },
    },
  ],

  followUp: {
    task: { pt: 'Usando a ordem inferida, implemente um comparador e ordene uma nova lista de palavras.', en: 'Using the inferred order, implement a comparator and sort a new list of words.' },
    changeLines: [29, 41, 42, 43],
    explanation: {
      pt: 'Antes de order.join (linha 42), constrói `rank = new Map(order.map((ch, i) => [ch, i]))` a partir do array order (linha 29) já calculado. O comparador compara duas palavras caractere a caractere usando rank.get(ch) em vez do código ASCII; se uma é prefixo exato da outra, a mais curta vem primeiro (igual à ordem alfabética comum). Depois, newWords.slice().sort(comparator) devolve a lista ordenada pelo alfabeto alienígena. A checagem de ciclo (linha 41) e o resto do algoritmo não mudam.',
      en: 'Before order.join (line 42), build `rank = new Map(order.map((ch, i) => [ch, i]))` from the already-computed order array (line 29). The comparator compares two words character by character using rank.get(ch) instead of ASCII codes; if one is an exact prefix of the other, the shorter one comes first (same as plain alphabetical order). Then newWords.slice().sort(comparator) returns the list sorted by the alien alphabet. The cycle check (line 41) and the rest of the algorithm are untouched.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'O que retorno se as restrições forem contraditórias?', en: 'What do I return if the constraints are contradictory?' }, reply: { pt: 'Um resultado vazio.', en: 'An empty result.' } },
    { kind: 'good', cost: 20, text: { pt: 'Uma palavra mais longa aparecendo antes do seu próprio prefixo é válido?', en: 'Is a longer word appearing before its own exact prefix valid?' }, reply: { pt: 'Não, isso é inválido.', en: 'No, that is invalid.' } },
    { kind: 'good', cost: 20, text: { pt: 'Quando há mais de um caractere possível para vir a seguir, como desempato?', en: 'When more than one character could come next, how do I break the tie?' }, reply: { pt: 'Escolho o menor em ordem alfabética normal; isso torna a saída única.', en: 'I pick the smallest in normal alphabet order; that makes the output unique.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Quantas palavras no máximo?', en: 'How many words at most?' }, reply: { pt: 'Está nas constraints: até 10000.', en: 'It is in the constraints: up to 10000.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Os caracteres são sempre letras minúsculas?', en: 'Are the characters always lowercase letters?' }, reply: { pt: 'Está nas constraints: letras minúsculas do inglês.', en: 'It is in the constraints: lowercase English letters.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Preciso suportar acentos ou caracteres unicode?', en: 'Do I need to support accents or unicode characters?' }, reply: { pt: 'Não; os caracteres são sempre letras minúsculas simples.', en: 'No; characters are always plain lowercase letters.' } },
    { kind: 'noise', cost: 30, text: { pt: 'A lista de palavras já chega ordenada por tamanho?', en: 'Does the list of words already arrive sorted by length?' }, reply: { pt: 'Irrelevante: a única garantia é que palavras adjacentes respeitam o alfabeto alienígena.', en: 'Irrelevant: the only guarantee is that adjacent words respect the alien alphabet.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'prefix_conflict',
      text: { pt: 'Uma palavra mais longa vem antes do seu próprio prefixo exato', en: 'A longer word comes before its own exact prefix' },
      why: { pt: 'Nenhum alfabeto válido permite isso; precisa ser detectado mesmo sem nenhum caractere diferente entre as duas palavras.', en: 'No valid alphabet allows this; it must be detected even with no differing character between the two words.' },
      followUp: { question: { pt: '["abc","ab"] retorna...', en: '["abc","ab"] returns...' }, options: ['""', '"abc"', '"ab"'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'cycle',
      text: { pt: 'As restrições inferidas formam um ciclo (a < b e b < a)', en: 'The inferred constraints form a cycle (a < b and b < a)' },
      why: { pt: 'Um ciclo no grafo de ordem significa que nenhuma ordenação linear é consistente; a ordenação topológica nunca processa todos os caracteres.', en: 'A cycle in the order graph means no linear ordering is consistent; the topological sort never processes every character.' },
      followUp: { question: { pt: '["z","x","z"] retorna...', en: '["z","x","z"] returns...' }, options: ['""', '"zx"', '"xz"'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'single_word',
      text: { pt: 'A lista tem só uma palavra, sem nenhum par para comparar', en: 'The list has only one word, with no pair to compare' },
      why: { pt: 'Sem nenhuma aresta, o desempate alfabético sozinho decide a ordem de todos os caracteres.', en: 'With no edges at all, the alphabetical tie-break alone decides the order of every character.' },
      followUp: { question: { pt: '["abc"] retorna...', en: '["abc"] returns...' }, options: ['"abc"', '""', 'qualquer permutação'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'independent_characters',
      text: { pt: 'Um caractere não tem nenhuma restrição em relação a outro', en: 'One character has no constraint relative to another' },
      why: { pt: 'Caracteres sem aresta entre si não devem ser artificialmente ordenados um em relação ao outro alem do desempate alfabético.', en: 'Characters with no edge between them must not be artificially ordered relative to each other beyond the alphabetical tie-break.' },
      followUp: { question: { pt: '["za","zb"] retorna...', en: '["za","zb"] returns...' }, options: ['"abz"', '"zab"', '"zba"'], correct: 0 },
    },
    {
      relevant: false,
      text: { pt: 'Lista de palavras vazia', en: 'Empty list of words' },
      why: { pt: 'As constraints garantem pelo menos uma palavra; não é um caso a tratar.', en: 'The constraints guarantee at least one word; it is not a case to handle.' },
    },
    {
      relevant: false,
      text: { pt: 'A mesma palavra se repete idêntica na lista', en: 'The same word repeats identically in the list' },
      why: { pt: 'Comparar uma palavra com ela mesma não encontra nenhum caractere diferente e não é mais longa que a outra; não gera nem conflito nem informação nova.', en: 'Comparing a word with itself finds no differing character and is not longer than the other; it creates neither a conflict nor new information.' },
    },
    {
      relevant: false,
      text: { pt: 'Palavras muito longas, com milhares de caracteres cada', en: 'Very long words, with thousands of characters each' },
      why: { pt: 'O algoritmo só olha o primeiro caractere diferente de cada par; o comprimento da palavra não muda a lógica, só o tempo de achar essa diferença.', en: 'The algorithm only looks at the first differing character of each pair; word length does not change the logic, only the time to find that difference.' },
    },
  ],

  pattern: {
    correct: 'topo-sort-heap',
    distractors: ['topo-sort', 'graph-bfs', 'greedy'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Kahn com heap para o desempate alfabético, comparando só palavras adjacentes', en: 'Kahn\'s algorithm with a heap for the alphabetical tie-break, comparing only adjacent words' },
      time: 'O(C + V + E) (C = total de caracteres, V/E limitados pelo tamanho do alfabeto)',
      space: 'O(V + E)',
      why: { pt: 'Só palavras adjacentes na lista carregam informação de ordem; o heap garante que a saída respeita o desempate exigido pelo enunciado.', en: 'Only adjacent words in the list carry ordering information; the heap guarantees the output respects the tie-break the statement requires.' },
    },
    {
      chosen: false,
      name: { pt: 'Comparar todo par de palavras, não só as adjacentes', en: 'Compare every pair of words, not just adjacent ones' },
      time: 'O(n² × L)',
      space: 'O(V + E)',
      why: { pt: 'O fixture de performance rejeita exatamente esse padrão O(n²); além disso, pares não-adjacentes podem sugerir arestas que não têm garantia nenhuma de serem válidas.', en: 'The performance fixture rejects exactly this O(n²) pattern; moreover, non-adjacent pairs can suggest edges that have no guarantee of being valid.' },
    },
    {
      chosen: false,
      name: { pt: 'DFS pós-ordem (topological sort clássico) e inverter o resultado', en: 'Post-order DFS (classic topological sort) and reverse the result' },
      time: 'O(V + E)',
      space: 'O(V + E)',
      why: { pt: 'Mesma complexidade, mas a ordem de visita da DFS não escolhe naturalmente o menor caractere entre os disponíveis; garantir o desempate do enunciado exigiria o mesmo heap de qualquer forma.', en: 'Same complexity, but DFS visitation order does not naturally pick the smallest available character; guaranteeing the statement\'s tie-break would need the same heap anyway.' },
    },
  ],
}

export default content
