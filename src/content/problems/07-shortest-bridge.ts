import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function shortestBridge(...)                 24 startFound = true (breaks outer scan)
//  1 const rows = grid.length                      27 let steps = 0
//  2 const cols = grid[0].length                   28 while (frontier.length > 0)
//  3 const dirs = [...] (4-directional)             29 const next: [...][] = []
//  4 const visited = grid.map(...)                  30 for (const [r, c] of frontier)
//  5 let frontier: [...][] = []                     31 for (const [dr, dc] of dirs)
//  6 let startFound = false                         32 const nr = r + dr
//  7 for (let i = 0; ...)                           33 const nc = c + dc
//  8 for (let j = 0; ...)                           34 if out of bounds, continue
//  9 if (grid[i][j] !== 1) continue                 35 if (visited[nr][nc]) continue
// 10 const stack: [...][] = [[i, j]]                36 if (grid[nr][nc] === 1) return steps
// 11 visited[i][j] = true (seed marked)             37 visited[nr][nc] = true
// 12 while (stack.length > 0)                       38 next.push([nr, nc])
// 13 const [r, c] = stack.pop()!                    41 frontier = next
// 14 frontier.push([r, c])                          42 steps++
// 15 for (const [dr, dc] of dirs)                   44 return -1
// 16 const nr = r + dr
// 17 const nc = c + dc
// 18 if out of bounds, continue
// 19 if (visited[nr][nc] || grid[nr][nc] !== 1) continue
// 20 visited[nr][nc] = true
// 21 stack.push([nr, nc])

const content: ProblemContent = {
  id: 7,
  source: `function shortestBridge(grid: number[][]): number {
  const rows = grid.length
  const cols = grid[0].length
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  const visited: boolean[][] = grid.map((row) => row.map(() => false))
  let frontier: [number, number][] = []
  let startFound = false
  for (let i = 0; i < rows && !startFound; i++) {
    for (let j = 0; j < cols && !startFound; j++) {
      if (grid[i][j] !== 1) continue
      const stack: [number, number][] = [[i, j]]
      visited[i][j] = true
      while (stack.length > 0) {
        const [r, c] = stack.pop()!
        frontier.push([r, c])
        for (const [dr, dc] of dirs) {
          const nr = r + dr
          const nc = c + dc
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
          if (visited[nr][nc] || grid[nr][nc] !== 1) continue
          visited[nr][nc] = true
          stack.push([nr, nc])
        }
      }
      startFound = true
    }
  }
  let steps = 0
  while (frontier.length > 0) {
    const next: [number, number][] = []
    for (const [r, c] of frontier) {
      for (const [dr, dc] of dirs) {
        const nr = r + dr
        const nc = c + dc
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
        if (visited[nr][nc]) continue
        if (grid[nr][nc] === 1) return steps
        visited[nr][nc] = true
        next.push([nr, nc])
      }
    }
    frontier = next
    steps++
  }
  return -1
}`,

  steps: [
    { indent: 0, text: { pt: 'Encontra a primeira ilha com flood fill iterativo (pilha), marcando as células como visitadas', en: 'Find the first island with an iterative (stack-based) flood fill, marking its cells visited' } },
    { indent: 0, text: { pt: 'Usa todas as células dessa ilha como fronteira inicial da BFS multi-origem; steps = 0', en: 'Seed the multi-source BFS frontier with every cell of that island; steps = 0' } },
    { indent: 0, text: { pt: 'Enquanto a fronteira não está vazia:', en: 'While the frontier is not empty:' } },
    { indent: 1, text: { pt: 'próxima fronteira = []', en: 'next = []' } },
    { indent: 1, text: { pt: 'Para cada célula da fronteira:', en: 'For each cell in the frontier:' } },
    { indent: 2, text: { pt: 'Para cada um dos 4 vizinhos (cima, baixo, esquerda, direita):', en: 'For each of the 4 neighbors (up, down, left, right):' } },
    { indent: 3, text: { pt: 'Se está fora da grade ou já visitado, pula', en: 'If out of bounds or already visited, skip' } },
    { indent: 3, text: { pt: 'Se o vizinho é terra, retorna steps (achou a segunda ilha)', en: 'If the neighbor is land, return steps (the second island was reached)' } },
    { indent: 3, text: { pt: 'Senão, marca como visitado e põe em próxima fronteira', en: 'Otherwise mark it visited and add it to next' } },
    { indent: 1, text: { pt: 'fronteira = próxima fronteira; steps++', en: 'frontier = next; steps++' } },
    { indent: 0, text: { pt: 'Retorna -1 (inalcançável; não deveria ocorrer com exatamente duas ilhas)', en: 'Return -1 (unreachable; should not happen with exactly two islands)' } },
  ],

  stepDistractors: [
    {
      indent: 2,
      text: { pt: 'Para cada um dos 8 vizinhos, incluindo diagonais', en: 'For each of the 8 neighbors, including diagonals' },
      why: { pt: 'Vizinhos diagonais não contam como adjacentes no enunciado; considerá-los funde duas ilhas que só se tocam no canto em uma só, zerando a resposta.', en: 'Diagonal neighbors do not count as adjacent per the prompt; treating them as such merges two islands that only touch at a corner into one, zeroing out the answer.' },
    },
    {
      indent: 0,
      text: { pt: 'Faz flood fill da primeira ilha com uma função recursiva que chama a si mesma por célula', en: 'Flood-fill the first island with a recursive function that calls itself per cell' },
      why: { pt: 'DFS recursiva pode explodir a pilha de chamadas numa ilha grande e conexa (mesmo risco do problema 8 com a ilha em forma de cobra); uma pilha explícita e iterativa evita isso.', en: 'Recursive DFS can blow the call stack on one large connected island (same risk as problem 8\'s snake-shaped island); an explicit iterative stack avoids it.' },
    },
    {
      indent: 1,
      text: { pt: 'Roda uma BFS nova a partir de cada célula da primeira ilha até a segunda, guarda o mínimo', en: 'Run a fresh BFS from each cell of the first island to the second, keep the minimum' },
      why: { pt: 'Correto, mas redundante: repete a mesma água várias vezes em vez de uma BFS multi-origem compartilhada; o fixture de performance rejeita essa abordagem.', en: 'Correct but redundant: it re-explores the same water repeatedly instead of one shared multi-source BFS; the performance fixture rejects this approach.' },
    },
  ],

  blanks: [
    { line: 1, token: 'grid.length', options: ['grid[0].length', 'grid.length - 1'] },
    { line: 6, token: 'false', options: ['true', 'null'] },
    { line: 9, token: 'continue', options: ['break', 'return -1'] },
    { line: 27, token: '0', options: ['1', '-1'] },
    { line: 44, token: '-1', options: ['0', 'steps'] },
  ],

  codeDistractors: [
    {
      code: '      if (grid[i][j] !== 1) break',
      why: { pt: '`break` sai do laço de colunas inteiro ao ver a primeira água na linha, deixando de escanear o resto da linha e podendo nunca achar a ilha.', en: '`break` abandons the whole column loop on the first water cell in the row, so the rest of the row is never scanned and the island may never be found.' },
    },
    {
      code: '        if (grid[nr][nc] === 1) return steps + 1',
      why: { pt: '`steps` já foi incrementado para o nível atual antes desta checagem; somar +1 conta uma conversão de água que não existe.', en: '`steps` was already incremented for the current level before this check; adding +1 counts one water conversion that was never made.' },
    },
    {
      code: '          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break',
      why: { pt: '`break` aqui abandona as outras direções do mesmo vizinho em vez de só pular a direção fora da grade.', en: '`break` here abandons the other directions for this neighbor instead of just skipping the out-of-bounds one.' },
    },
  ],

  bugs: [
    {
      id: 'diagonal-dirs-merge-islands',
      line: 3,
      code: '  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]]',
      failsTest: 'adjacent_diagonal_islands',
      why: { pt: 'Adicionar a diagonal principal faz o flood fill da primeira ilha atravessar o canto e engolir a segunda ilha também; sem segunda ilha sobrando, a BFS nunca encontra terra e retorna -1.', en: 'Adding the main diagonal lets the first island\'s flood fill cross the corner and swallow the second island too; with no island left to find, the BFS never hits land and returns -1.' },
      logLine: 24,
      logWhy: { pt: 'Logar `frontier.length` assim que o flood fill termina mostra 2 células em vez de 1: a diagonal foi engolida junto.', en: 'Logging `frontier.length` right after the flood fill finishes shows 2 cells instead of 1: the diagonal neighbor got swallowed in too.' },
    },
    {
      id: 'if-not-while-partial-flood',
      line: 12,
      code: '      if (stack.length > 0) {',
      failsTest: 'irregular_shapes',
      why: { pt: 'Troca o laço por uma única execução: a pilha só é esvaziada uma vez, então uma célula de terra descoberta durante o flood fill é marcada visitada mas nunca entra na fronteira da BFS.', en: 'Swaps the loop for a single run: the stack is only drained once, so a land cell discovered during the flood fill gets marked visited but never joins the BFS frontier.' },
      logLine: 24,
      logWhy: { pt: 'Logar `frontier.length` assim que o flood fill termina mostra 1 célula em vez de 2: a segunda célula da primeira ilha ficou de fora.', en: 'Logging `frontier.length` right after the flood fill finishes shows 1 cell instead of 2: the first island\'s second cell got left out.' },
    },
    {
      id: 'col-bound-off-by-one',
      line: 34,
      code: '        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols - 1) continue',
      failsTest: 'one_cell_gap',
      why: { pt: 'Clássico off-by-one: `cols - 1` trata a última coluna como fora da grade durante a expansão da BFS, então nenhuma célula dessa coluna é alcançada — mesmo sendo terra válida.', en: 'Classic off-by-one: `cols - 1` treats the last column as out of bounds during the BFS expansion, so no cell in that column is ever reached — even when it is valid land.' },
      logLine: 34,
      logWhy: { pt: 'Logar `nr, nc` antes da checagem de limites mostra o algoritmo recusando entrar na última coluna mesmo com índice válido.', en: 'Logging `nr, nc` right before the bounds check shows the algorithm refusing to step into the last column even with a valid index.' },
    },
    {
      id: 'off-by-one-steps',
      line: 36,
      code: '        if (grid[nr][nc] === 1) return steps - 1',
      failsTest: 'far_apart',
      why: { pt: '`steps` já reflete a distância do nível atual quando a terra é encontrada; subtrair 1 faz parecer que o primeiro anel de expansão é de graça.', en: '`steps` already reflects the distance of the current level when land is found; subtracting 1 makes the first ring of expansion look free.' },
      logLine: 36,
      logWhy: { pt: 'Logar `steps` bem antes do retorno mostra 3 no caso far_apart, mas a função devolve 2.', en: 'Logging `steps` right before the return shows 3 on the far_apart case, but the function returns 2.' },
    },
  ],

  followUp: {
    task: { pt: 'Retorne as células convertidas, não só a contagem.', en: 'Return the cells that were converted, not just the count.' },
    changeLines: [0, 11, 20, 36, 37],
    explanation: {
      pt: 'Mantenha um mapa `parent: Map<chave-da-célula, chave-ou-null>`, preenchido sempre que uma célula é marcada visitada por primeira vez: null para as células-semente da primeira ilha (linha 11 e, ao empilhar, linha 20) e a célula de origem para cada água recém-descoberta na BFS (linha 37). Ao achar a terra (linha 36), em vez de retornar `steps`, suba a cadeia de `parent` a partir da célula atual da fronteira até a raiz, coletando as células de água no caminho, e retorne essa lista. O tipo de retorno muda (linha 0, number → number[][]). A estrutura da BFS continua igual.',
      en: 'Keep a `parent: Map<cell-key, key-or-null>` map, filled the first time a cell is marked visited: null for the seed cells of the first island (line 11 and, when pushed, line 20) and the originating cell for every newly discovered water cell in the BFS (line 37). On finding land (line 36), instead of returning `steps`, walk the `parent` chain from the current frontier cell up to the root, collecting the water cells along the way, and return that list. The return type changes (line 0, number → number[][]). The BFS structure itself is untouched.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'Posso assumir que há exatamente duas ilhas na grade?', en: 'Can I assume there are exactly two islands in the grid?' }, reply: { pt: 'Sim, sempre exatamente duas.', en: 'Yes, always exactly two.' } },
    { kind: 'good', cost: 20, text: { pt: 'A adjacência é 4 ou 8 direções (diagonal conta)?', en: 'Is adjacency 4- or 8-directional (does diagonal count)?' }, reply: { pt: 'Só quatro direções.', en: 'Four-directional only.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Qual o tamanho máximo da grade?', en: 'What is the maximum grid size?' }, reply: { pt: 'Está nas constraints: até 500x500.', en: 'It is in the constraints: up to 500x500.' } },
    { kind: 'stated', cost: 15, text: { pt: 'O que a função deve retornar?', en: 'What should the function return?' }, reply: { pt: 'O enunciado diz: o número mínimo de células de água convertidas.', en: 'The prompt says: the minimum number of water cells converted.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Posso converter terra em água também?', en: 'Can I convert land into water too?' }, reply: { pt: 'Não; o enunciado só fala de converter água em terra.', en: 'No; the prompt only talks about converting water to land.' } },
    { kind: 'noise', cost: 30, text: { pt: 'A grade vem como array 2D ou como string com quebras de linha?', en: 'Does the grid come as a 2D array or a newline-delimited string?' }, reply: { pt: 'Irrelevante: é um array 2D de números em memória.', en: 'Irrelevant: it is an in-memory 2D array of numbers.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Preciso lidar com múltiplas threads lendo a grade ao mesmo tempo?', en: 'Do I need to handle multiple threads reading the grid concurrently?' }, reply: { pt: 'Não há concorrência nesse problema.', en: 'There is no concurrency in this problem.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'adjacent_diagonal_islands',
      text: { pt: 'As duas ilhas se tocam só no canto (diagonal)', en: 'The two islands touch only at a corner (diagonal)' },
      why: { pt: 'Testa se o código trata diagonal como não-adjacente; ainda precisa de 1 conversão.', en: 'Tests whether the code treats diagonal as non-adjacent; it still needs 1 conversion.' },
      followUp: { question: { pt: 'Quantas conversões?', en: 'How many conversions?' }, options: ['1', '0', '2'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'one_cell_gap',
      text: { pt: 'Exatamente uma célula de água separa as duas ilhas', en: 'Exactly one water cell separates the two islands' },
      why: { pt: 'Caso mínimo não-trivial; bom para pegar off-by-one na distância.', en: 'Minimal non-trivial case; good at catching an off-by-one in the distance.' },
      followUp: { question: { pt: 'Quantas conversões?', en: 'How many conversions?' }, options: ['1', '0', '2'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'far_apart',
      text: { pt: 'As ilhas estão várias células de água distantes uma da outra', en: 'The islands are several water cells apart' },
      why: { pt: 'A resposta cresce com a distância; testa se a BFS multi-origem conta níveis corretamente.', en: 'The answer grows with the distance; tests whether the multi-source BFS counts levels correctly.' },
      followUp: { question: { pt: 'Como a resposta escala?', en: 'How does the answer scale?' }, options: ['Cresce com a largura do vão de água', 'É sempre 1, não importa a distância', 'É igual ao tamanho das ilhas'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'irregular_shapes',
      text: { pt: 'A primeira ilha encontrada tem formato irregular, não uma célula única ou retângulo', en: 'The first island found has an irregular shape, not a single cell or a rectangle' },
      why: { pt: 'O flood fill precisa visitar toda a ilha conexa, não só a primeira célula de terra encontrada.', en: 'The flood fill must visit the whole connected island, not just the first land cell found.' },
      followUp: { question: { pt: 'O que o flood fill precisa fazer?', en: 'What must the flood fill do?' }, options: ['Visitar toda célula de terra conectada antes de iniciar a BFS', 'Usar só a primeira célula de terra encontrada como semente', 'Ordenar as células da ilha por coordenada'], correct: 0 },
    },
    {
      relevant: false,
      text: { pt: 'A grade tem só uma linha', en: 'The grid has only one row' },
      why: { pt: 'Já é tratado: BFS e flood fill funcionam em qualquer grade retangular, 1xN não é especial.', en: 'Already handled: BFS and the flood fill work on any rectangular grid; 1xN is not special.' },
    },
    {
      relevant: false,
      text: { pt: 'Os valores da água vêm como booleanos em vez de 0/1', en: 'Water values come as booleans instead of 0/1' },
      why: { pt: 'A assinatura fixa o tipo como int[][]; isso nunca acontece aqui.', en: 'The signature fixes the type as int[][]; this never happens here.' },
    },
    {
      relevant: false,
      text: { pt: 'A grade é bem mais larga do que alta (ex: 500x2)', en: 'The grid is much wider than it is tall (e.g. 500x2)' },
      why: { pt: 'As constraints só limitam linhas e colunas entre 2 e 500; a proporção não muda o algoritmo.', en: 'The constraints only bound rows and cols between 2 and 500; the aspect ratio does not change the algorithm.' },
    },
  ],

  pattern: {
    correct: 'multi-source-bfs',
    distractors: ['grid-bfs', 'dfs-flood-fill', 'union-find'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Flood fill iterativo da ilha 1, depois BFS multi-origem até achar a ilha 2', en: 'Iterative flood fill of island 1, then multi-source BFS until island 2 is found' },
      time: 'O(rows · cols)',
      space: 'O(rows · cols)',
      why: { pt: 'Cada célula é visitada no máximo uma vez em cada fase; a BFS expande em anéis a partir de todas as células da primeira ilha ao mesmo tempo, o que dá a menor distância direto.', en: 'Each cell is visited at most once per phase; the BFS expands in rings from every cell of the first island at once, which gives the shortest distance directly.' },
    },
    {
      chosen: false,
      name: { pt: 'BFS separada a partir de cada célula da ilha 1 até a ilha 2, guardar o mínimo', en: 'Separate BFS from each cell of island 1 to island 2, keep the minimum' },
      time: 'O(S · rows · cols)',
      space: 'O(rows · cols)',
      why: { pt: 'S = tamanho da primeira ilha. Correto, mas repete a mesma água várias vezes; no fixture de 500x500 com ilhas de ~190x190, são ~36k buscas separadas sobre 250k células — passa longe do limite de 2s.', en: 'S = size of the first island. Correct, but it re-explores the same water repeatedly; on the 500x500 fixture with ~190x190 islands that is ~36k separate searches over 250k cells — far past the 2s budget.' },
    },
    {
      chosen: false,
      name: { pt: 'Flood fill recursivo (DFS) da ilha 1 em vez de pilha explícita', en: 'Recursive (DFS) flood fill of island 1 instead of an explicit stack' },
      time: 'O(rows · cols)',
      space: 'O(rows · cols) na pilha de chamadas',
      why: { pt: 'Funciona em grades pequenas, mas uma ilha grande e conexa (como a em forma de cobra do problema 8) empilha uma chamada por célula e arrisca estourar a pilha de chamadas; a pilha explícita e iterativa não tem esse limite.', en: 'Works on small grids, but one large connected island (like problem 8\'s snake-shaped one) stacks one call per cell and risks a call-stack overflow; the explicit iterative stack has no such limit.' },
    },
  ],
}

export default content
