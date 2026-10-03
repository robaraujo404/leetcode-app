import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function shortestPathBinaryMatrix(...)          13 const nc = c + dc
//  1 const n = grid.length                           14 const key = `${nr},${nc}`
//  2 if (grid[0][0] === 1 || ...) return -1           15 if (nr >= 0 && ... !visited.has(key)) {
//  3 const dirs = [8 directions]                      16   visited.add(key)
//  4 const visited = new Set(['0,0'])                 17   next.push([nr, nc])
//  5 let frontier = [[0, 0]]                           18 }
//  6 let dist = 1                                      19 }
//  7 while (frontier.length > 0) {                     20 }
//  8 const next: number[][] = []                       21 frontier = next
//  9 for (const [r, c] of frontier) {                  22 dist++
// 10 if (r === n - 1 && c === n - 1) return dist        23 }
// 11 for (const [dr, dc] of dirs) {                     24 return -1
// 12 const nr = r + dr                                  25 }

const content: ProblemContent = {
  id: 13,
  source: `function shortestPathBinaryMatrix(grid: number[][]): number {
  const n = grid.length
  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1
  const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
  const visited = new Set<string>(['0,0'])
  let frontier = [[0, 0]]
  let dist = 1
  while (frontier.length > 0) {
    const next: number[][] = []
    for (const [r, c] of frontier) {
      if (r === n - 1 && c === n - 1) return dist
      for (const [dr, dc] of dirs) {
        const nr = r + dr
        const nc = c + dc
        const key = \`\${nr},\${nc}\`
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 0 && !visited.has(key)) {
          visited.add(key)
          next.push([nr, nc])
        }
      }
    }
    frontier = next
    dist++
  }
  return -1
}`,

  steps: [
    { indent: 0, text: { pt: 'n = grid.length', en: 'n = grid.length' } },
    { indent: 0, text: { pt: 'Se a célula inicial ou a final é bloqueada, retorna -1', en: 'If the start or end cell is blocked, return -1' } },
    { indent: 0, text: { pt: 'Define as 8 direções vizinhas (incluindo diagonais)', en: 'Define the 8 neighbor directions (including diagonals)' } },
    { indent: 0, text: { pt: 'visited = {(0,0)}; fronteira = [(0,0)]; dist = 1', en: 'visited = {(0,0)}; frontier = [(0,0)]; dist = 1' } },
    { indent: 0, text: { pt: 'Enquanto a fronteira não está vazia:', en: 'While the frontier is not empty:' } },
    { indent: 1, text: { pt: 'Para cada célula (r, c) da fronteira:', en: 'For each cell (r, c) in the frontier:' } },
    { indent: 2, text: { pt: 'Se (r, c) é a célula final, retorna dist', en: 'If (r, c) is the final cell, return dist' } },
    { indent: 2, text: { pt: 'Para cada uma das 8 direções: se o vizinho está dentro do grid, é célula livre (0) e não foi visitado, marca e põe na próxima fronteira', en: 'For each of the 8 directions: if the neighbor is in bounds, open (0), and unvisited, mark it and add it to the next frontier' } },
    { indent: 1, text: { pt: 'fronteira = próxima fronteira; dist++', en: 'frontier = next frontier; dist++' } },
    { indent: 0, text: { pt: 'Retorna -1', en: 'Return -1' } },
  ],

  stepDistractors: [
    {
      indent: 2,
      text: { pt: 'Para cada uma das 4 direções ortogonais (sem diagonais)', en: 'For each of the 4 orthogonal directions (no diagonals)' },
      why: { pt: 'O enunciado permite movimento para qualquer uma das 8 células vizinhas; ignorar as diagonais torna caminhos mais curtos inatingíveis ou inexistentes.', en: 'The prompt allows movement to any of the 8 neighboring cells; dropping diagonals makes shorter paths unreachable or nonexistent.' },
    },
    {
      indent: 2,
      text: { pt: 'Marca a célula final como visitada e continua o loop em vez de retornar na hora', en: 'Mark the final cell visited and keep looping instead of returning immediately' },
      why: { pt: 'Atrasar o retorno não muda o resultado aqui, mas desperdiça trabalho explorando vizinhos de uma célula que já é a resposta.', en: 'Delaying the return does not change the result here, but wastes work exploring neighbors of a cell that is already the answer.' },
    },
    {
      indent: 0,
      text: { pt: 'Usa Dijkstra com um heap mínimo de distâncias', en: 'Use Dijkstra with a min-heap of distances' },
      why: { pt: 'Também correto, mas o heap é desnecessário quando todo passo custa 1; BFS simples já garante a ordem certa de distâncias.', en: 'Also correct, but the heap is unnecessary when every step costs 1; plain BFS already guarantees the right distance order.' },
    },
  ],

  blanks: [
    { line: 2, token: 'return -1', options: ['return 0', 'return 1'] },
    { line: 6, token: 'let dist = 1', options: ['let dist = 0', 'let dist = -1'] },
    { line: 10, token: 'return dist', options: ['return dist + 1', 'return dist - 1'] },
    { line: 15, token: 'grid[nr][nc] === 0', options: ['grid[nr][nc] === 1', 'grid[r][c] === 0'] },
    { line: 24, token: 'return -1', options: ['return 0', 'return dist'] },
  ],

  codeDistractors: [
    {
      code: '  if (grid[n - 1][n - 1] === 1) return -1',
      why: { pt: 'Só verifica a célula final; se a inicial for bloqueada, o BFS segue como se ela fosse livre.', en: 'Only checks the final cell; if the start cell is blocked, the BFS proceeds as if it were open.' },
    },
    {
      code: '  const dirs = [[-1, 0], [0, -1], [0, 1], [1, 0]]',
      why: { pt: 'Só as 4 direções ortogonais; o problema permite as 8, incluindo diagonais.', en: 'Only the 4 orthogonal directions; the problem allows all 8, including diagonals.' },
    },
    {
      code: '      if (r === n - 1 && c === n - 1) return dist + 1',
      why: { pt: '`dist` já conta a célula atual ao entrar neste nível; somar 1 conta a célula final duas vezes.', en: '`dist` already counts the current cell on entering this level; adding 1 double-counts the final cell.' },
    },
  ],

  bugs: [
    {
      id: 'only-checks-destination',
      line: 2,
      code: '  if (grid[n - 1][n - 1] === 1) return -1',
      failsTest: 'blocked_start',
      why: { pt: 'Remove a checagem da célula inicial; se ela for 1 (bloqueada), o BFS parte dela como se fosse livre.', en: 'Drops the check on the start cell; if it is 1 (blocked), the BFS departs from it as if it were open.' },
      logLine: 2,
      logWhy: { pt: 'Logar grid[0][0] e grid[n-1][n-1] antes do BFS mostra que o início é 1 mas a função não retornou -1 ali.', en: 'Logging grid[0][0] and grid[n-1][n-1] before the BFS starts shows the start is 1 but the function never returned -1 there.' },
    },
    {
      id: 'dist-starts-at-zero',
      line: 6,
      code: '  let dist = 0',
      failsTest: 'single_cell',
      why: { pt: 'O comprimento do caminho conta as duas extremidades; um grid 1x1 já é um caminho de tamanho 1, não 0.', en: 'Path length counts both endpoints; a 1x1 grid is already a path of length 1, not 0.' },
      logLine: 6,
      logWhy: { pt: 'Logar `dist` logo após a inicialização mostra 0 em vez de 1 antes de qualquer iteração.', en: 'Logging `dist` right after initialization shows 0 instead of 1 before any iteration runs.' },
    },
    {
      id: 'no-path-returns-zero',
      line: 24,
      code: '  return 0',
      failsTest: 'no_path',
      why: { pt: 'Esgotar a fronteira sem alcançar a célula final significa que não há caminho: deve retornar -1, não 0.', en: 'Exhausting the frontier without reaching the final cell means no path exists: it should return -1, not 0.' },
      logLine: 21,
      logWhy: { pt: 'Logar o tamanho da fronteira a cada nível mostra que ela chega a 0 sem a célula final jamais aparecer, então o retorno final é o problema.', en: 'Logging the frontier size each level shows it reaches 0 without the final cell ever appearing, so the final return is the issue.' },
    },
    {
      id: 'no-diagonals',
      line: 3,
      code: '  const dirs = [[-1, 0], [0, -1], [0, 1], [1, 0]]',
      failsTest: 'diagonal_shortcut',
      why: { pt: 'Restringe o movimento a 4 direções ortogonais; sem diagonais, um atalho que dependia de mover na diagonal fica inatingível.', en: 'Restricts movement to 4 orthogonal directions; without diagonals, a shortcut that relied on moving diagonally becomes unreachable.' },
      logLine: 3,
      logWhy: { pt: 'Logar `dirs.length` mostra 4 em vez de 8, explicando por que a busca não encontra o atalho diagonal.', en: 'Logging `dirs.length` shows 4 instead of 8, explaining why the search misses the diagonal shortcut.' },
    },
  ],

  followUp: {
    task: { pt: 'Células têm custo de travessia.', en: 'Cells have traversal costs.' },
    changeLines: [4, 5, 6, 9, 10, 15, 16, 22],
    explanation: {
      pt: 'Troque `visited` (linha 4) por um array `dist` inicializado em Infinity, e a fronteira por nível (linhas 5–6) por um heap mínimo de `(custoAcumulado, r, c)`. O loop sobre a fronteira (linha 9) passa a ser um pop do heap; a checagem da célula final (linha 10) só é segura ao ser retirada do heap, não ao ser enfileirada. A condição de relaxamento (linha 15) compara `dist[r][c] + custo(vizinho)` contra a melhor distância conhecida do vizinho, atualizando-a (linha 16) e reinserindo no heap quando melhora. O incremento uniforme `dist++` por nível (linha 22) desaparece: o custo passa a ser por caminho, não por camada de BFS.',
      en: 'Replace `visited` (line 4) with a `dist` array initialized to Infinity, and the per-level frontier (lines 5–6) with a min-heap of `(accumulatedCost, r, c)`. The loop over the frontier (line 9) becomes a heap pop; checking the final cell (line 10) is only safe once it is popped, not once it is enqueued. The relaxation check (line 15) compares `dist[r][c] + cost(neighbor)` against the neighbor\'s best known distance, updating it (line 16) and re-pushing onto the heap when it improves. The uniform per-level `dist++` (line 22) disappears entirely: cost is now tracked per path, not per BFS layer.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'E se a célula inicial ou a final estiver bloqueada?', en: 'What if the start or end cell is blocked?' }, reply: { pt: 'Célula inicial ou final bloqueada significa que não há caminho.', en: 'A blocked start or destination means no path.' } },
    { kind: 'good', cost: 15, text: { pt: 'O comprimento do caminho inclui a célula inicial e a final?', en: 'Does the path length include the start and end cells themselves?' }, reply: { pt: 'Sim, o comprimento do caminho conta as duas extremidades.', en: 'Yes, path length counts both endpoints.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Qual o tamanho máximo do grid?', en: 'What is the maximum grid size?' }, reply: { pt: 'Está nas constraints: n até 1000.', en: 'It is in the constraints: n up to 1000.' } },
    { kind: 'good', cost: 20, text: { pt: 'Posso me mover nas 8 direções ou só nas 4 ortogonais?', en: 'Can I move in all 8 directions or just the 4 orthogonal ones?' }, reply: { pt: 'Movimento é 8-direcional.', en: 'Movement is 8-directional.' } },
    { kind: 'noise', cost: 30, text: { pt: 'O grid tem bordas que dão a volta (toroidal)?', en: 'Does the grid wrap around at the edges (toroidal)?' }, reply: { pt: 'Não; é um grid limitado comum, sem wrap-around.', en: 'No; it is a plain bounded grid, no wrap-around.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Movimentos diagonais custam mais que os ortogonais?', en: 'Do diagonal moves cost more than orthogonal ones?' }, reply: { pt: 'Não nesta versão; todo passo custa o mesmo.', en: 'Not in this version; every step costs the same.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'blocked_start',
      text: { pt: 'A célula inicial (ou a final) é bloqueada', en: 'The start cell (or the end cell) is blocked' },
      why: { pt: 'Não existe caminho possível se qualquer uma das extremidades já for parede; precisa ser checado antes do BFS.', en: 'No path is possible if either endpoint is already a wall; must be checked before the BFS even starts.' },
      followUp: { question: { pt: 'O que retorna?', en: 'What does it return?' }, options: ['-1', '0', '1'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'single_cell',
      text: { pt: 'Grid 1x1', en: '1x1 grid' },
      why: { pt: 'Início e fim são a mesma célula; ainda assim conta como um caminho de tamanho 1, pela regra de contar as duas extremidades.', en: 'Start and end are the same cell; it still counts as a path of length 1, per the rule of counting both endpoints.' },
      followUp: { question: { pt: 'Qual o tamanho do caminho?', en: 'What is the path length?' }, options: ['0', '1'], correct: 1 },
    },
    {
      relevant: true,
      concept: 'no_path',
      text: { pt: 'Não existe nenhum caminho entre início e fim', en: 'No path exists between start and end' },
      why: { pt: 'O BFS esgota a fronteira sem jamais alcançar a célula final; precisa de um retorno de falha definido.', en: 'The BFS exhausts the frontier without ever reaching the final cell; it needs a defined failure return.' },
      followUp: { question: { pt: 'O que retorna?', en: 'What does it return?' }, options: ['-1', 'Infinity', '0'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'diagonal_shortcut',
      text: { pt: 'Um atalho diagonal é mais curto que contornar pelas ortogonais', en: 'A diagonal shortcut is shorter than going around orthogonally' },
      why: { pt: 'O movimento é 8-direcional; se as diagonais não forem incluídas, o caminho mais curto real é subestimado ou nem é encontrado.', en: 'Movement is 8-directional; if diagonals are left out, the real shortest path is overestimated or missed entirely.' },
      followUp: { question: { pt: 'Quantas direções de movimento existem?', en: 'How many movement directions are there?' }, options: ['4', '8'], correct: 1 },
    },
    {
      relevant: false,
      text: { pt: 'Grid não quadrado (retangular)', en: 'Non-square (rectangular) grid' },
      why: { pt: 'As constraints garantem um grid n x n quadrado; não há caso retangular a tratar.', en: 'The constraints guarantee a square n x n grid; there is no rectangular case to handle.' },
    },
    {
      relevant: false,
      text: { pt: 'Valores de célula diferentes de 0 e 1', en: 'Cell values other than 0 and 1' },
      why: { pt: 'O grid é estritamente binário; nenhum outro valor aparece na entrada.', en: 'The grid is strictly binary; no other value appears in the input.' },
    },
    {
      relevant: false,
      text: { pt: 'Grid gigante perto do limite de memória', en: 'A grid near the memory limit' },
      why: { pt: 'Um grid 1000x1000 cabe com folga em memória; não é uma preocupação real aqui.', en: 'A 1000x1000 grid fits comfortably in memory; it is not a real concern here.' },
    },
  ],

  pattern: {
    correct: 'grid-bfs',
    distractors: ['dfs-flood-fill', 'dijkstra', 'multi-source-bfs'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'BFS a partir de (0,0), 8-direcional', en: 'BFS from (0,0), 8-directional' },
      time: 'O(n^2)',
      space: 'O(n^2)',
      why: { pt: 'Cada uma das n² células é visitada no máximo uma vez; pesos iguais (1 passo), então BFS já garante a menor distância.', en: 'Each of the n² cells is visited at most once; equal weights (1 step), so BFS alone guarantees the shortest distance.' },
    },
    {
      chosen: false,
      name: { pt: 'DFS com memorização da menor distância por célula', en: 'DFS with memoized shortest distance per cell' },
      time: 'O(n^2)',
      space: 'O(n^2)',
      why: { pt: 'Também correto, mas o DFS não visita células em ordem de distância; precisa revisitar células quando encontra um caminho melhor, o que o BFS evita de graça.', en: 'Also correct, but DFS does not visit cells in distance order; it must revisit cells when a better path is found, which BFS avoids for free.' },
    },
    {
      chosen: false,
      name: { pt: 'Dijkstra com heap mínimo por distância', en: 'Dijkstra with a min-heap by distance' },
      time: 'O(n^2 log n)',
      space: 'O(n^2)',
      why: { pt: 'Correto, mas o fator log do heap é overhead desnecessário quando todo passo custa o mesmo. Ele se torna a ferramenta certa no follow-up com custos de célula diferentes.', en: 'Correct, but the heap\'s log factor is unnecessary overhead when every step costs the same. It becomes the right tool in the follow-up with different cell costs.' },
    },
  ],
}

export default content
