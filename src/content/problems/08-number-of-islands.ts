import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function numIslands(...)                       14 const [r, c] = stack.pop()!
//  1 if empty grid, return 0                         15 for (const [dr, dc] of dirs)
//  2 const rows = grid.length                        16 const nr = r + dr
//  3 const cols = grid[0].length                     17 const nc = c + dc
//  4 const dirs = [...] (4-directional)               18 if out of bounds, continue
//  5 const visited = grid.map(...)                   19 if (visited[nr][nc] || grid[nr][nc] !== '1') continue
//  6 let count = 0                                   20 visited[nr][nc] = true
//  7 for (let i ...)                                 21 stack.push([nr, nc])
//  8 for (let j ...)                                 26 return count
//  9 if not land or already visited, continue
// 10 count++
// 11 const stack: [...][] = [[i, j]]
// 12 visited[i][j] = true
// 13 while (stack.length > 0)

const content: ProblemContent = {
  id: 8,
  source: `function numIslands(grid: string[][]): number {
  if (grid.length === 0 || grid[0].length === 0) return 0
  const rows = grid.length
  const cols = grid[0].length
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  const visited: boolean[][] = grid.map((row) => row.map(() => false))
  let count = 0
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] !== '1' || visited[i][j]) continue
      count++
      const stack: [number, number][] = [[i, j]]
      visited[i][j] = true
      while (stack.length > 0) {
        const [r, c] = stack.pop()!
        for (const [dr, dc] of dirs) {
          const nr = r + dr
          const nc = c + dc
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
          if (visited[nr][nc] || grid[nr][nc] !== '1') continue
          visited[nr][nc] = true
          stack.push([nr, nc])
        }
      }
    }
  }
  return count
}`,

  steps: [
    { indent: 0, text: { pt: 'Se a grade está vazia (0 linhas ou 0 colunas), retorna 0', en: 'If the grid is empty (0 rows or 0 columns), return 0' } },
    { indent: 0, text: { pt: 'count = 0; marca nenhuma célula como visitada ainda', en: 'count = 0; mark no cell visited yet' } },
    { indent: 0, text: { pt: 'Para cada célula (i, j) da grade, em ordem:', en: 'For each cell (i, j) of the grid, in order:' } },
    { indent: 1, text: { pt: 'Se não é terra ou já foi visitada, pula para a próxima', en: 'If it is not land or already visited, skip to the next one' } },
    { indent: 1, text: { pt: 'count++ (achou uma nova ilha); põe (i, j) numa pilha e marca visitada', en: 'count++ (found a new island); push (i, j) onto a stack and mark it visited' } },
    { indent: 1, text: { pt: 'Enquanto a pilha não está vazia:', en: 'While the stack is not empty:' } },
    { indent: 2, text: { pt: 'Tira uma célula da pilha', en: 'Pop a cell off the stack' } },
    { indent: 2, text: { pt: 'Para cada um dos 4 vizinhos:', en: 'For each of the 4 neighbors:' } },
    { indent: 3, text: { pt: 'Se está fora da grade, já visitado, ou é água, pula', en: 'If it is out of bounds, already visited, or water, skip' } },
    { indent: 3, text: { pt: 'Senão, marca visitado e empilha', en: 'Otherwise mark it visited and push it onto the stack' } },
    { indent: 0, text: { pt: 'Retorna count', en: 'Return count' } },
  ],

  stepDistractors: [
    {
      indent: 2,
      text: { pt: 'Chama floodFill(nr, nc) recursivamente para cada vizinho de terra', en: 'Recursively call floodFill(nr, nc) for each land neighbor' },
      why: { pt: 'Uma ilha grande e conexa gera uma chamada por célula; numa grade de 2000x2000 com uma ilha em forma de cobra (~300k células), a recursão estoura a pilha de chamadas. A pilha explícita (iterativa) não tem esse limite.', en: 'One large connected island means one call per cell; on a 2000x2000 grid with a ~300k-cell snake-shaped island, recursion overflows the call stack. An explicit (iterative) stack has no such limit.' },
    },
    {
      indent: 1,
      text: { pt: 'Para cada vizinho de terra, cria uma nova grade marcando essa célula como visitada', en: 'For each land neighbor, create a new grid marking that cell visited' },
      why: { pt: 'Copiar a grade a cada passo custa O(rows·cols) por célula visitada; o flood fill vira O((rows·cols)²) no total em vez de O(rows·cols).', en: 'Copying the grid at every step costs O(rows·cols) per visited cell; the flood fill becomes O((rows·cols)²) overall instead of O(rows·cols).' },
    },
    {
      indent: 1,
      text: { pt: 'count++ depois de esvaziar a pilha, não antes de começar o flood fill', en: 'count++ after draining the stack, not before starting the flood fill' },
      why: { pt: 'Não muda o resultado aqui (é a mesma ilha de qualquer forma), mas é um passo a mais sem motivo — incrementar ao achar a semente já é suficiente e mais simples de acompanhar.', en: 'It does not change the result here (it is the same island either way), but it is an extra step with no benefit — incrementing when the seed is found is already enough and easier to follow.' },
    },
  ],

  blanks: [
    { line: 1, token: 'grid.length === 0', options: ['grid.length === 1', 'grid.length <= 1'] },
    { line: 6, token: 'count = 0', options: ['count = 1', 'count = -1'] },
    { line: 9, token: "!== '1'", options: ["=== '1'", "!== '0'"] },
    { line: 12, token: 'true', options: ['false', '!visited[i][j]'] },
    { line: 26, token: 'count', options: ['count - 1', 'count + 1'] },
  ],

  codeDistractors: [
    {
      code: "      if (grid[i][j] !== '1') continue",
      why: { pt: 'Sem checar `visited[i][j]`, uma ilha com mais de uma célula é recontada: o laço externo revisita células já flood-filladas e trata cada uma como uma nova ilha.', en: 'Without checking `visited[i][j]`, a multi-cell island gets recounted: the outer loop revisits already flood-filled cells and treats each one as a brand-new island.' },
    },
    {
      code: "          if (visited[nr][nc] && grid[nr][nc] !== '1') continue",
      why: { pt: '`&&` em vez de `||` deixa água nunca visitada entrar na pilha mesmo não sendo terra; o flood fill engole a grade inteira como se fosse uma ilha só.', en: '`&&` instead of `||` lets never-visited water slip onto the stack even though it is not land; the flood fill swallows the whole grid as if it were one island.' },
    },
    {
      code: '  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]]',
      why: { pt: 'Isso trata vizinhos diagonais como conectados; o enunciado deixa claro que diagonais não contam.', en: 'This treats diagonal neighbors as connected; the prompt makes clear diagonals do not count.' },
    },
  ],

  bugs: [
    {
      id: 'count-starts-at-one',
      line: 6,
      code: '  let count = 1',
      failsTest: 'all_water',
      why: { pt: 'Inicializar count em 1 assume que já existe uma ilha antes de olhar a grade; numa grade só de água a resposta correta é 0.', en: 'Initializing count at 1 assumes an island already exists before looking at the grid; on an all-water grid the correct answer is 0.' },
      logLine: 26,
      logWhy: { pt: 'Logar `count` antes do retorno mostra 1 numa grade sem nenhuma célula de terra.', en: 'Logging `count` right before the return shows 1 on a grid with no land cells at all.' },
    },
    {
      id: 'diagonal-dirs',
      line: 4,
      code: '  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]',
      failsTest: 'diagonal_not_connected',
      why: { pt: 'Adicionar as diagonais faz o flood fill tratar células que só se tocam no canto como a mesma ilha, contrariando a clarificação de que diagonal não conecta.', en: 'Adding the diagonals makes the flood fill treat corner-touching cells as the same island, contradicting the clarification that diagonals do not connect.' },
      logLine: 10,
      logWhy: { pt: 'Logar `count` a cada incremento mostra que ele só chega a 1, nunca a 2, porque as duas células de terra foram fundidas na primeira busca.', en: 'Logging `count` on every increment shows it only ever reaches 1, never 2, because both land cells got merged in the first search.' },
    },
    {
      id: 'empty-guard-off-by-one',
      line: 1,
      code: '  if (grid.length <= 1 || grid[0].length === 0) return 0',
      failsTest: 'single_cell_land',
      why: { pt: '`<= 1` confunde "grade vazia" com "grade de uma linha"; uma grade 1x1 com uma única célula de terra é descartada como vazia e a função retorna 0 em vez de 1.', en: '`<= 1` confuses "empty grid" with "one-row grid"; a 1x1 grid with a single land cell is discarded as empty and the function returns 0 instead of 1.' },
      logLine: 1,
      logWhy: { pt: 'Logar `grid.length` na guarda de entrada mostra 1, não 0, e a função já retornou antes de olhar qualquer célula.', en: 'Logging `grid.length` at the entry guard shows 1, not 0, and the function already returned before looking at any cell.' },
    },
    {
      id: 'and-instead-of-or-skip',
      line: 19,
      code: "          if (visited[nr][nc] && grid[nr][nc] !== '1') continue",
      failsTest: 'multiple_components',
      why: { pt: '`&&` só pula quando a célula já foi visitada E é água; uma célula de água nunca visitada passa direto e é engolida pelo flood fill, fundindo todas as ilhas isoladas do tabuleiro em uma só.', en: '`&&` only skips when a cell is both already visited and water; a never-visited water cell slips through and gets swallowed by the flood fill, merging every isolated island on the checkerboard into one.' },
      logLine: 20,
      logWhy: { pt: 'Logar `nr, nc, grid[nr][nc]` ao marcar visitado mostra células de água (\'0\') sendo marcadas e empilhadas, o que nunca deveria acontecer.', en: 'Logging `nr, nc, grid[nr][nc]` when marking visited shows water cells (\'0\') being marked and pushed, which should never happen.' },
    },
  ],

  followUp: {
    task: { pt: 'Também retorne o tamanho da maior ilha e quantas ilhas tocam a borda.', en: 'Also return the size of the largest island and how many islands touch the border.' },
    changeLines: [0, 10, 14, 26],
    explanation: {
      pt: 'O tipo de retorno muda para um objeto com count, maiorIlha e tocaBorda (linha 0). Ao achar a semente (linha 10), abra um contador `size = 1` e uma flag `touchesBorder = i === 0 || j === 0 || ...`. Dentro do while, a cada célula tirada da pilha (linha 14), incremente `size` e atualize a flag se (r, c) está na borda. Ao fechar a ilha, atualize o máximo global e o contador de ilhas na borda antes de retornar (linha 26). A mecânica do flood fill não muda.',
      en: 'The return type becomes an object with count, largestIsland and touchingBorder (line 0). When the seed is found (line 10), start a `size = 1` counter and a `touchesBorder = i === 0 || j === 0 || ...` flag. Inside the while loop, every time a cell is popped (line 14), bump `size` and update the flag if (r, c) sits on the border. When the island closes, fold into the running maximum and border count before returning (line 26). The flood fill mechanics themselves do not change.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'Células diagonais contam como conectadas?', en: 'Do diagonal cells count as connected?' }, reply: { pt: 'Não; só vertical e horizontal.', en: 'No; only vertical and horizontal.' } },
    { kind: 'good', cost: 20, text: { pt: 'E se a entrada vier vazia (sem linhas ou sem colunas)?', en: 'What if the input comes in empty (no rows or no columns)?' }, reply: { pt: 'Trate como zero ilhas.', en: 'Treat it as zero islands.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Qual o tamanho máximo da grade?', en: 'What is the maximum grid size?' }, reply: { pt: 'Está nas constraints: até 2000x2000.', en: 'It is in the constraints: up to 2000x2000.' } },
    { kind: 'stated', cost: 15, text: { pt: 'As células são números 0/1 ou strings "0"/"1"?', en: 'Are cells numbers 0/1 or strings "0"/"1"?' }, reply: { pt: 'Strings, conforme a assinatura: "0" e "1".', en: 'Strings, per the signature: "0" and "1".' } },
    { kind: 'stated', cost: 15, text: { pt: 'O que a função deve retornar?', en: 'What should the function return?' }, reply: { pt: 'O enunciado diz: o número de componentes de terra conectados.', en: 'The prompt says: the number of connected land components.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Preciso colorir as ilhas de cores diferentes na saída?', en: 'Do I need to color the islands differently in the output?' }, reply: { pt: 'Não; só a contagem importa.', en: 'No; only the count matters.' } },
    { kind: 'noise', cost: 30, text: { pt: 'A grade pode mudar enquanto a função roda (escrita concorrente)?', en: 'Can the grid change while the function runs (concurrent writes)?' }, reply: { pt: 'Não, é uma entrada estática e imutável.', en: 'No, it is a static, immutable input.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'all_water',
      text: { pt: 'A grade inteira é água', en: 'The entire grid is water' },
      why: { pt: 'Nenhuma célula dispara o flood fill; a resposta correta é 0, não 1.', en: 'No cell ever triggers the flood fill; the correct answer is 0, not 1.' },
      followUp: { question: { pt: 'Quantas ilhas?', en: 'How many islands?' }, options: ['0', '1', '-1'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'diagonal_not_connected',
      text: { pt: 'Duas células de terra se tocam só na diagonal', en: 'Two land cells touch only diagonally' },
      why: { pt: 'Testa se o código usa só as 4 direções; diagonal não conecta aqui.', en: 'Tests whether the code uses only the 4 directions; diagonal does not connect here.' },
      followUp: { question: { pt: 'Quantas ilhas?', en: 'How many islands?' }, options: ['2', '1', '4'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'single_cell_land',
      text: { pt: 'A grade é 1x1 com uma única célula de terra', en: 'The grid is 1x1 with a single land cell' },
      why: { pt: 'Caso mínimo; bom para pegar uma guarda de "grade vazia" escrita com off-by-one.', en: 'Minimal case; good at catching an off-by-one in an "empty grid" guard.' },
      followUp: { question: { pt: 'Quantas ilhas?', en: 'How many islands?' }, options: ['1', '0', 'erro'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'multiple_components',
      text: { pt: 'Um tabuleiro em xadrez: cada célula de terra é isolada das outras', en: 'A checkerboard pattern: every land cell is isolated from the others' },
      why: { pt: 'Testa contagem de muitos componentes pequenos sem fundir nenhum por engano.', en: 'Tests counting many small components without accidentally merging any of them.' },
      followUp: { question: { pt: 'Quantas ilhas num tabuleiro 3x3?', en: 'How many islands on a 3x3 checkerboard?' }, options: ['5', '9', '1'], correct: 0 },
    },
    {
      relevant: false,
      text: { pt: 'A grade tem só uma linha', en: 'The grid has only one row' },
      why: { pt: 'Já é tratado: o flood fill funciona em qualquer grade retangular, não há regra especial para 1 linha.', en: 'Already handled: the flood fill works on any rectangular grid; there is no special rule for one row.' },
    },
    {
      relevant: false,
      text: { pt: 'As strings de célula têm espaços em branco ao redor, como " 1 "', en: 'Cell strings have surrounding whitespace, like " 1 "' },
      why: { pt: 'A assinatura garante que as células são exatamente "0" ou "1"; isso não ocorre.', en: 'The signature guarantees cells are exactly "0" or "1"; this never happens.' },
    },
    {
      relevant: false,
      text: { pt: 'A grade é bem mais larga do que alta', en: 'The grid is much wider than it is tall' },
      why: { pt: 'As constraints só limitam linhas e colunas até 2000; a proporção não muda o algoritmo.', en: 'The constraints only bound rows and columns up to 2000; the aspect ratio does not change the algorithm.' },
    },
  ],

  pattern: {
    correct: 'dfs-flood-fill',
    distractors: ['grid-bfs', 'union-find', 'multi-source-bfs'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Flood fill com pilha explícita (iterativa) a partir de cada semente de terra não visitada', en: 'Flood fill with an explicit (iterative) stack from each unvisited land seed' },
      time: 'O(rows · cols)',
      space: 'O(rows · cols)',
      why: { pt: 'Cada célula é visitada no máximo uma vez; a pilha explícita evita qualquer limite de profundidade de recursão, inclusive na ilha em forma de cobra de ~300k células do fixture de performance.', en: 'Each cell is visited at most once; the explicit stack avoids any recursion-depth limit, including on the ~300k-cell snake-shaped island in the performance fixture.' },
    },
    {
      chosen: false,
      name: { pt: 'Flood fill recursivo (DFS que chama a si mesmo por célula)', en: 'Recursive flood fill (DFS calling itself per cell)' },
      time: 'O(rows · cols)',
      space: 'O(rows · cols) na pilha de chamadas',
      why: { pt: 'Mesma complexidade assintótica, mas uma única ilha de ~300k células gera ~300k chamadas aninhadas; isso estoura a pilha de chamadas do runtime — exatamente o que o fixture de 2000x2000 com a ilha em cobra rejeita.', en: 'Same asymptotic cost, but a single ~300k-cell island produces ~300k nested calls; that overflows the runtime call stack — exactly what the 2000x2000 snake-shaped-island fixture rejects.' },
    },
    {
      chosen: false,
      name: { pt: 'Union-Find sobre todas as células, unindo vizinhos de terra', en: 'Union-Find over every cell, unioning land neighbors' },
      time: 'O(rows · cols · α(rows · cols))',
      space: 'O(rows · cols)',
      why: { pt: 'Também correto e livre de recursão, mas é mais código (union-find com compressão de caminho) para resolver um problema que uma busca simples já resolve em tempo linear.', en: 'Also correct and recursion-free, but it is more code (union-find with path compression) to solve a problem that a plain search already solves in linear time.' },
    },
  ],
}

export default content
