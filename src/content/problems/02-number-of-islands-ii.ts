import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function numIslands2(...)                    22 if (sa < sb) {
//  1 const parent = new Map()                     23   parent.set(ra, rb)
//  2 const size = new Map()                        24   size.set(rb, sa + sb)
//  3 let count = 0                                 25 } else {
//  4 const result: number[] = []                   26   parent.set(rb, ra)
//  5 const find = (x) => {                          27   size.set(ra, sa + sb)
//  6   let root = x                                 28 }
//  7   while (parent.get(root) !== root) ...        29 count--
//  8   let cur = x                                  30 }
//  9   while (cur !== root) {                       31 for (const [r, c] of positions) {
// 10     const next = parent.get(cur)!               32   const key = `${r},${c}`
// 11     parent.set(cur, root)                        33   if (!parent.has(key)) {
// 12     cur = next                                    34     parent.set(key, key)
// 13   }                                                35     size.set(key, 1)
// 14   return root                                      36     count++
// 15 }                                                   37     for (const [nr, nc] of [4 deltas]) {
// 16 const union = (a, b) => {                            38       const nkey = `${nr},${nc}`
// 17   const ra = find(a)                                  39       if (parent.has(nkey)) union(key, nkey)
// 18   const rb = find(b)                                  40     }
// 19   if (ra === rb) return                               41   }
// 20   const sa = size.get(ra) ?? 1                       42   result.push(count)
// 21   const sb = size.get(rb) ?? 1                      43 }
//                                                        44 return result
//                                                        45 }

const content: ProblemContent = {
  id: 2,
  source: `function numIslands2(m: number, n: number, positions: number[][]): number[] {
  const parent = new Map<string, string>()
  const size = new Map<string, number>()
  let count = 0
  const result: number[] = []
  const find = (x: string): string => {
    let root = x
    while (parent.get(root) !== root) root = parent.get(root)!
    let cur = x
    while (cur !== root) {
      const next = parent.get(cur)!
      parent.set(cur, root)
      cur = next
    }
    return root
  }
  const union = (a: string, b: string) => {
    const ra = find(a)
    const rb = find(b)
    if (ra === rb) return
    const sa = size.get(ra) ?? 1
    const sb = size.get(rb) ?? 1
    if (sa < sb) {
      parent.set(ra, rb)
      size.set(rb, sa + sb)
    } else {
      parent.set(rb, ra)
      size.set(ra, sa + sb)
    }
    count--
  }
  for (const [r, c] of positions) {
    const key = \`\${r},\${c}\`
    if (!parent.has(key)) {
      parent.set(key, key)
      size.set(key, 1)
      count++
      for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
        const nkey = \`\${nr},\${nc}\`
        if (parent.has(nkey)) union(key, nkey)
      }
    }
    result.push(count)
  }
  return result
}`,

  steps: [
    { indent: 0, text: { pt: 'Cria union-find esparso: parent e size são Maps indexados pela chave "linha,coluna" (nunca aloca a grade m×n)', en: 'Build a sparse union-find: parent and size are Maps keyed by the "row,col" string (never allocate the m×n grid)' } },
    { indent: 0, text: { pt: 'count = 0; result = []', en: 'count = 0; result = []' } },
    { indent: 0, text: { pt: 'Para cada posição [r, c] a adicionar:', en: 'For each position [r, c] to add:' } },
    { indent: 1, text: { pt: 'Se a chave já existe no mapa, não faz nada (já é terra)', en: 'If the key already exists in the map, do nothing (already land)' } },
    { indent: 1, text: { pt: 'Senão: registra a célula como seu próprio pai, tamanho 1, count++', en: 'Otherwise: register the cell as its own parent, size 1, count++' } },
    { indent: 2, text: { pt: 'Para cada um dos 4 vizinhos (cima, baixo, esquerda, direita) que já é terra: faz union com ele', en: 'For each of the 4 neighbors (up, down, left, right) that is already land: union with it' } },
    { indent: 3, text: { pt: 'union: acha as raízes; se forem diferentes, pendura a menor na maior (por tamanho) e count--', en: 'union: find the roots; if different, hang the smaller under the bigger (by size) and count--' } },
    { indent: 1, text: { pt: 'Acrescenta o count atual em result', en: 'Push the current count onto result' } },
    { indent: 0, text: { pt: 'Retorna result', en: 'Return result' } },
  ],

  stepDistractors: [
    {
      indent: 0,
      text: { pt: 'Aloca uma grade m×n de booleanos e marca cada adição nela', en: 'Allocate an m×n boolean grid and mark each addition on it' },
      why: { pt: 'm e n podem ser 10^9; uma grade desse tamanho não cabe na memória. O union-find esparso só guarda as células realmente adicionadas.', en: 'm and n can be 10^9; a grid that size does not fit in memory. The sparse union-find only stores cells that were actually added.' },
    },
    {
      indent: 1,
      text: { pt: 'Se a chave já existe, soma 1 ao count de novo', en: 'If the key already exists, add 1 to count again' },
      why: { pt: 'A clarificação diz que adicionar terra a uma célula já-terra não muda a contagem; isso contaria a mesma célula duas vezes.', en: 'The clarification says adding land to an already-land cell does not change the count; this would count the same cell twice.' },
    },
    {
      indent: 2,
      text: { pt: 'Faz union com os 4 vizinhos mesmo que ainda não sejam terra', en: 'Union with all 4 neighbors even when they are not land yet' },
      why: { pt: 'union(a, b) chama find em ambos; se o vizinho nunca foi adicionado ao Map, find entra em loop infinito procurando uma chave que não existe.', en: 'union(a, b) calls find on both; if the neighbor was never added to the Map, find loops forever looking for a key that does not exist.' },
    },
  ],

  blanks: [
    { line: 19, token: 'return', options: ['continue', 'break'] },
    { line: 22, token: 'sa < sb', options: ['sa > sb', 'sa <= sb'] },
    { line: 33, token: '!parent.has(key)', options: ['parent.has(key)', 'parent.get(key) == null'] },
    { line: 37, token: '[[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]', options: ['[[r - 1, c], [r + 1, c], [r, c - 1]]', '[[r - 1, c - 1], [r + 1, c + 1]]'] },
    { line: 39, token: 'union(key, nkey)', options: ['union(nkey, key)', 'find(nkey)'] },
  ],

  codeDistractors: [
    {
      code: '  const key = r * n + c',
      why: { pt: 'm e n chegam a 10^9; r*n passa de Number.MAX_SAFE_INTEGER e colide chaves diferentes no mesmo índice.', en: 'm and n reach 10^9; r*n overflows Number.MAX_SAFE_INTEGER and collides distinct cells onto the same index.' },
    },
    {
      code: '      size.set(key, size.get(key)! + 1)',
      why: { pt: 'A chave é nova aqui; size.get(key) ainda é undefined, então isso produz NaN em vez de inicializar com 1.', en: 'The key is brand new here; size.get(key) is still undefined, so this produces NaN instead of initializing to 1.' },
    },
    {
      code: '        if (!parent.has(nkey)) union(key, nkey)',
      why: { pt: 'Inverte a condição: só uniria com vizinhos que AINDA NÃO são terra, exatamente o contrário do que queremos.', en: 'Inverts the condition: it would only union with neighbors that are NOT land yet, the exact opposite of what we want.' },
    },
  ],

  bugs: [
    {
      id: 'skip-duplicate-check',
      line: 33,
      code: '    {',
      failsTest: 'duplicate_addition',
      why: { pt: 'Remove a checagem de "já é terra"; adicionar a mesma célula duas vezes reseta seu size para 1 e incrementa count de novo.', en: 'Removes the "already land" guard; adding the same cell twice resets its size to 1 and increments count again.' },
      logLine: 33,
      logWhy: { pt: 'Logar parent.has(key) nessa linha mostra que na segunda adição da mesma célula ele já era true, mas o código entrou no bloco de novo.', en: 'Logging parent.has(key) here shows it was already true on the second addition of the same cell, yet the code entered the block again.' },
    },
    {
      id: 'missing-right-neighbor',
      line: 37,
      code: '      for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c - 1]]) {',
      failsTest: 'merge_two_islands',
      why: { pt: 'Duplica o vizinho da esquerda em vez de checar o da direita; uma célula nova que deveria ligar duas ilhas só liga com a da esquerda.', en: 'Duplicates the left neighbor instead of checking the right one; a new cell that should bridge two islands only merges with the one on its left.' },
      logLine: 37,
      logWhy: { pt: 'Logar a lista de vizinhos usada em cada chamada mostra que (r, c+1) nunca aparece, só (r, c-1) repetido.', en: 'Logging the neighbor list used on each call shows (r, c+1) never appears, only (r, c-1) repeated.' },
    },
    {
      id: 'missing-up-neighbor',
      line: 37,
      code: '      for (const [nr, nc] of [[r + 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {',
      failsTest: 'chain_merge',
      why: { pt: 'Duplica o vizinho de baixo em vez de checar o de cima; uma célula que deveria conectar com a ilha acima nunca a encontra.', en: 'Duplicates the neighbor below instead of checking the one above; a cell that should connect to the island above never finds it.' },
      logLine: 37,
      logWhy: { pt: 'Logar os 4 deltas iterados por chamada mostra (r-1, c) ausente da lista.', en: 'Logging the 4 deltas iterated per call shows (r-1, c) missing from the list.' },
    },
  ],

  followUp: {
    task: { pt: 'Depois de cada adição, também retorne o tamanho da maior ilha.', en: 'After each addition, also return the size of the largest island.' },
    changeLines: [3, 24, 27, 35, 42],
    explanation: {
      pt: 'Mantém uma variável `maxSize` ao lado de `count` (linha 3). Toda vez que `size` de uma raiz é atualizado — ao criar a célula com tamanho 1 (linha 35) e nos dois ramos do union (linhas 24 e 27) — compara com `maxSize` e atualiza se for maior. Em result.push (linha 42), empilha `[count, maxSize]` em vez de só `count`. Nenhuma outra parte do union-find muda.',
      en: 'Keep a `maxSize` variable alongside `count` (line 3). Every time a root\'s `size` is updated — when the cell is created with size 1 (line 35) and in both union branches (lines 24 and 27) — compare against `maxSize` and update if larger. At result.push (line 42), push `[count, maxSize]` instead of just `count`. Nothing else in the union-find changes.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'Adicionar terra numa célula que já é terra muda a contagem?', en: 'Does adding land to an already-land cell change the count?' }, reply: { pt: 'Não; a contagem permanece a mesma.', en: 'No; the count stays the same.' } },
    { kind: 'good', cost: 20, text: { pt: 'A conectividade é só 4-direcional ou também diagonal?', en: 'Is connectivity 4-directional only, or also diagonal?' }, reply: { pt: 'Só 4-direcional: cima, baixo, esquerda, direita.', en: 'Four-directional only: up, down, left, right.' } },
    { kind: 'good', cost: 20, text: { pt: 'As coordenadas de entrada podem estar fora da grade ou duplicadas de forma inválida?', en: 'Can input coordinates be out of bounds or invalidly duplicated?' }, reply: { pt: 'As coordenadas de entrada são sempre válidas.', en: 'Input coordinates are always valid.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Qual o tamanho máximo de m e n?', en: 'What is the maximum size of m and n?' }, reply: { pt: 'Está nas constraints: até 10^9.', en: 'It is in the constraints: up to 10^9.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Quantas adições no máximo?', en: 'How many additions at most?' }, reply: { pt: 'Está nas constraints: até 100000.', en: 'It is in the constraints: up to 100000.' } },
    { kind: 'noise', cost: 30, text: { pt: 'A grade precisa ser desenhada ou visualizada de algum jeito?', en: 'Does the grid need to be drawn or visualized somehow?' }, reply: { pt: 'Não há visualização; é só contagem de componentes.', en: 'There is no visualization; it is just component counting.' } },
    { kind: 'noise', cost: 30, text: { pt: 'As posições chegam ordenadas por linha ou coluna?', en: 'Do positions arrive sorted by row or column?' }, reply: { pt: 'Irrelevante: o algoritmo não depende da ordem de chegada além de ser sequencial.', en: 'Irrelevant: the algorithm does not depend on arrival order beyond being sequential.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'duplicate_addition',
      text: { pt: 'A mesma coordenada é adicionada duas vezes', en: 'The same coordinate is added twice' },
      why: { pt: 'Precisa detectar que a célula já está no Map e não contar de novo nem resetar seu tamanho.', en: 'Must detect the cell is already in the Map and neither recount it nor reset its size.' },
      followUp: { question: { pt: 'A contagem muda na segunda adição?', en: 'Does the count change on the second addition?' }, options: ['Não', 'Sim, soma 1', 'Sim, zera'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'merge_two_islands',
      text: { pt: 'Uma nova célula liga duas ilhas que eram separadas', en: 'A new cell bridges two islands that were separate' },
      why: { pt: 'O union precisa achar as DUAS raízes diferentes (uma por vizinho) e decrementar count uma vez para cada merge real.', en: 'union must find the TWO different roots (one per neighbor) and decrement count once per real merge.' },
      followUp: { question: { pt: 'Quanto muda count nesse passo?', en: 'How much does count change on this step?' }, options: ['-1 (duas ilhas viram uma)', '0', '-2'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'isolated_additions',
      text: { pt: 'Várias adições longe umas das outras, sem nenhum vizinho em comum', en: 'Several additions far apart, with no shared neighbor' },
      why: { pt: 'Nenhuma deve causar union; count só deve crescer, nunca cair.', en: 'None of them should trigger a union; count should only grow, never drop.' },
      followUp: { question: { pt: 'A sequência de counts é sempre...', en: 'Is the count sequence always...' }, options: ['Estritamente crescente (1, 2, 3, ...)', 'Pode cair', 'Fica constante'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'chain_merge',
      text: { pt: 'Uma célula nova fecha uma corrente, ligando ilhas que já formavam duas metades', en: 'A new cell closes a chain, joining islands that already formed two halves' },
      why: { pt: 'Testa o union-find encadeado: a raiz encontrada por find pode já ter sido repassada por um union anterior na mesma rodada.', en: 'Tests chained union-find: the root found by find may have already been re-parented by an earlier union in the same round.' },
      followUp: { question: { pt: 'Depois de fechar a corrente, quantas ilhas restam?', en: 'After closing the chain, how many islands remain?' }, options: ['1', '2', 'Depende da ordem dos vizinhos'], correct: 0 },
    },
    {
      relevant: false,
      text: { pt: 'IDs de linha ou coluna negativos', en: 'Negative row or column IDs' },
      why: { pt: 'As coordenadas de entrada são garantidas válidas; chaves de string funcionam com qualquer inteiro.', en: 'Input coordinates are guaranteed valid; string keys work with any integer.' },
    },
    {
      relevant: false,
      text: { pt: 'm ou n igual a 1 (grade é uma única linha ou coluna)', en: 'm or n equal to 1 (grid is a single row or column)' },
      why: { pt: 'O union-find esparso nunca olha para m ou n; só usa as coordenadas das células adicionadas.', en: 'The sparse union-find never looks at m or n; it only uses the coordinates of added cells.' },
    },
    {
      relevant: false,
      text: { pt: 'Lista de adições vazia', en: 'Empty list of additions' },
      why: { pt: 'As constraints garantem pelo menos uma adição; o loop simplesmente não executaria e result ficaria vazio, sem bug nenhum.', en: 'The constraints guarantee at least one addition; the loop would simply not run and result would stay empty, no bug involved.' },
    },
  ],

  pattern: {
    correct: 'union-find',
    distractors: ['grid-bfs', 'dfs-flood-fill', 'multi-source-bfs'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Union-Find esparso (Map de string "r,c" → pai)', en: 'Sparse Union-Find (Map of "r,c" string → parent)' },
      time: 'O(k) amortizado (k = número de adições, union por tamanho + compressão de caminho)',
      space: 'O(k)',
      why: { pt: 'Só guarda as células realmente adicionadas; nunca aloca a grade m×n, que pode ter 10^18 células.', en: 'Only stores the cells that were actually added; never allocates the m×n grid, which can have 10^18 cells.' },
    },
    {
      chosen: false,
      name: { pt: 'Reflooda a grade com BFS/DFS após cada adição', en: 'Re-flood the grid with BFS/DFS after every addition' },
      time: 'O(k²) no total',
      space: 'O(k) (se representar a grade de forma esparsa) ou impraticável se densa',
      why: { pt: 'Com 100k adições, refazer uma busca completa a cada uma dá 10^10 operações — muito além dos 2s do fixture de performance.', en: 'With 100k additions, redoing a full search after each one gives 10^10 operations — far past the 2s performance fixture limit.' },
    },
    {
      chosen: false,
      name: { pt: 'Alocar a grade m×n inteira como matriz booleana', en: 'Allocate the entire m×n grid as a boolean matrix' },
      time: 'O(m·n) só para alocar',
      space: 'O(m·n)',
      why: { pt: 'm, n até 10^9 tornam m·n até 10^18; nenhuma máquina real tem essa memória.', en: 'm, n up to 10^9 make m·n up to 10^18; no real machine has that much memory.' },
    },
  ],
}

export default content
