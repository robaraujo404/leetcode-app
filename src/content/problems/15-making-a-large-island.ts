import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function largestIsland(...)                    25 }
//  1 const n = grid.length                           26  }
//  2 const sizes = new Map(...)                       27 }
//  3 let nextId = 2                                    28 let best = 0
//  4 const stack = []                                  29 for (...) best = Math.max(best, size)
//  5 for (r)                                           30 for (r) [water scan]
//  6   for (c)                                         31   for (c)
//  7     if (grid[r][c] === 1) {                       32     if (grid[r][c] === 0) {
//  8       let size = 0                                33       const seen = new Set()
//  9       stack.push([r, c])                          34       for ([dr, dc] of 4 dirs) {
// 10       grid[r][c] = nextId                         35         const nr = r + dr
// 11       while (stack.length > 0) {                  36         const nc = c + dc
// 12         const [cr, cc] = stack.pop()!              37         if (... grid[nr][nc] > 1) {
// 13         size++                                     38           seen.add(grid[nr][nc])
// 14         for ([dr, dc] of 4 dirs) {                  39         }
// 15           const nr = cr + dr                        40       }
// 16           const nc = cc + dc                         41       let total = 1
// 17           if (... grid[nr][nc] === 1) {               42       for (id of seen) total += sizes.get(id)!
// 18             grid[nr][nc] = nextId                      43       best = Math.max(best, total)
// 19             stack.push([nr, nc])                       44     }
// 20           }                                             45   }
// 21         }                                               46 }
// 22       }                                                 47 return best
// 23       sizes.set(nextId, size)                           48 }
// 24       nextId++

const content: ProblemContent = {
  id: 15,
  source: `function largestIsland(grid: number[][]): number {
  const n = grid.length
  const sizes = new Map<number, number>()
  let nextId = 2
  const stack: number[][] = []
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 1) {
        let size = 0
        stack.push([r, c])
        grid[r][c] = nextId
        while (stack.length > 0) {
          const [cr, cc] = stack.pop()!
          size++
          for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nr = cr + dr
            const nc = cc + dc
            if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 1) {
              grid[nr][nc] = nextId
              stack.push([nr, nc])
            }
          }
        }
        sizes.set(nextId, size)
        nextId++
      }
    }
  }
  let best = 0
  for (const size of sizes.values()) best = Math.max(best, size)
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 0) {
        const seen = new Set<number>()
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] > 1) {
            seen.add(grid[nr][nc])
          }
        }
        let total = 1
        for (const id of seen) total += sizes.get(id)!
        best = Math.max(best, total)
      }
    }
  }
  return best
}`,

  steps: [
    { indent: 0, text: { pt: 'n = grid.length; sizes = novo Map; nextId = 2', en: 'n = grid.length; sizes = new Map; nextId = 2' } },
    { indent: 0, text: { pt: 'Para cada célula de terra (valor 1) ainda sem rótulo:', en: 'For each land cell (value 1) not yet labeled:' } },
    { indent: 1, text: { pt: 'Flood fill com uma pilha: rotula cada célula conectada com nextId e conta o tamanho', en: 'Flood fill with a stack: label every connected cell with nextId and count the size' } },
    { indent: 1, text: { pt: 'sizes[nextId] = tamanho; nextId++', en: 'sizes[nextId] = size; nextId++' } },
    { indent: 0, text: { pt: 'best = maior tamanho entre todas as ilhas rotuladas (0 se não houver nenhuma)', en: 'best = the largest size among all labeled islands (0 if there are none)' } },
    { indent: 0, text: { pt: 'Para cada célula de água (valor 0):', en: 'For each water cell (value 0):' } },
    { indent: 1, text: { pt: 'Junta num Set os rótulos de ilha dos vizinhos ortogonais que são terra', en: 'Collect into a Set the island labels of the orthogonal neighbors that are land' } },
    { indent: 1, text: { pt: 'total = 1 + soma dos tamanhos das ilhas desse Set', en: 'total = 1 + the sum of the island sizes in that Set' } },
    { indent: 1, text: { pt: 'best = max(best, total)', en: 'best = max(best, total)' } },
    { indent: 0, text: { pt: 'Retorna best', en: 'Return best' } },
  ],

  stepDistractors: [
    {
      indent: 1,
      text: { pt: 'Para cada célula de água: conta só o vizinho da maior ilha, ignorando os outros', en: 'For each water cell: count only the neighbor with the largest island, ignoring the others' },
      why: { pt: 'Quando a célula de água toca duas ilhas diferentes, as duas devem ser somadas (mais a célula convertida); contar só uma subestima o resultado da fusão.', en: 'When the water cell touches two different islands, both must be added (plus the converted cell); counting only one undercounts the merge.' },
    },
    {
      indent: 1,
      text: { pt: 'Junta os rótulos de ilha dos vizinhos numa lista, não num Set', en: "Collect the neighbors' island labels into a list, not a Set" },
      why: { pt: 'Sem deduplicar, uma ilha que toca a mesma célula de água por dois lados diferentes seria contada duas vezes, inflando o tamanho.', en: 'Without deduplicating, an island touching the same water cell from two different sides would be counted twice, inflating the size.' },
    },
    {
      indent: 0,
      text: { pt: 'Para cada célula de água, converte e refaz o flood fill do grid inteiro para medir a ilha resultante', en: 'For each water cell, flip it and redo a full flood fill of the grid to measure the resulting island' },
      why: { pt: 'Refazer o flood fill do grid inteiro a cada célula candidata é O(n²) por célula, ou seja O(n⁴) no total — exatamente o que deve ser evitado.', en: 'Redoing a full-grid flood fill for every candidate cell is O(n²) per cell, i.e. O(n⁴) overall — exactly what should be avoided.' },
    },
  ],

  blanks: [
    { line: 3, token: '2', options: ['0', '1'] },
    { line: 7, token: '=== 1', options: ['=== 0', '>= 1'] },
    { line: 17, token: 'grid[nr][nc] === 1', options: ['grid[nr][nc] === 0', 'grid[nr][nc] >= 1'] },
    { line: 37, token: 'grid[nr][nc] > 1', options: ['grid[nr][nc] === 1', 'grid[nr][nc] >= 1'] },
    { line: 41, token: '1', options: ['0', '2'] },
  ],

  codeDistractors: [
    {
      code: '      if (grid[r][c] >= 1) {',
      why: { pt: 'Os rótulos de ilha já atribuídos também são >= 1, então células já rotuladas disparariam um novo flood fill, corrompendo os tamanhos.', en: 'Already-assigned island labels are also >= 1, so already-labeled cells would trigger a new flood fill, corrupting the sizes.' },
    },
    {
      code: '        for (const id of seen) total = sizes.get(id)!',
      why: { pt: 'Usa `=` em vez de `+=`; ao tocar duas ilhas, o total final é só o tamanho da última processada, não a soma das duas mais a célula convertida.', en: 'Uses `=` instead of `+=`; when touching two islands, the final total is just the size of the last one processed, not the sum of both plus the converted cell.' },
    },
    {
      code: '  let best = 1',
      why: { pt: 'Assume que sempre existe pelo menos uma célula de terra; num grid totalmente aquático isso infla a resposta antes mesmo do loop de água rodar.', en: 'Assumes there is always at least one land cell; on an all-water grid this inflates the answer before the water loop even runs.' },
    },
  ],

  bugs: [
    {
      id: 'skip-island-peak',
      line: 29,
      code: '  for (const size of sizes.values()) {}',
      failsTest: 'all_land',
      why: { pt: 'Sem essa linha, `best` nunca é atualizado a partir das ilhas existentes; num grid todo terra não há células de água para corrigir isso depois, então o resultado fica 0.', en: 'Without this line, `best` is never updated from the existing islands; on an all-land grid there are no water cells afterward to fix it, so the result stays 0.' },
      logLine: 29,
      logWhy: { pt: 'Logar `best` logo depois dessa linha mostra 0 mesmo havendo uma ilha gigante — a agregação dos tamanhos nunca aconteceu.', en: 'Logging `best` right after this line shows 0 even though a giant island exists — the size aggregation never happened.' },
    },
    {
      id: 'forgot-flip-plus-one',
      line: 41,
      code: '        let total = 0',
      failsTest: 'all_water',
      why: { pt: 'Troca o 1 por 0: esquece de contar a própria célula de água convertida. Num grid todo água, sem ilhas vizinhas, o total fica 0 em vez de 1.', en: 'Changes the 1 to 0: forgets to count the converted water cell itself. On an all-water grid, with no neighboring islands, the total ends up 0 instead of 1.' },
      logLine: 41,
      logWhy: { pt: 'Logar `total` logo após a inicialização mostra 0 em vez de 1, mesmo antes de somar qualquer vizinho.', en: 'Logging `total` right after initialization shows 0 instead of 1, even before summing any neighbor.' },
    },
    {
      id: 'water-scan-two-directions',
      line: 34,
      code: '        for (const [dr, dc] of [[-1, 0], [1, 0]]) {',
      failsTest: 'merge_multiple_components',
      why: { pt: 'Ao checar vizinhos de uma célula de água, olha só cima/baixo, ignorando esquerda/direita; quando duas ilhas se tocam horizontalmente pela mesma célula de água, a fusão nunca é vista.', en: "When checking a water cell's neighbors, it only looks up/down, ignoring left/right; when two islands touch horizontally through the same water cell, the merge is never seen." },
      logLine: 38,
      logWhy: { pt: 'Logar `seen` depois desse loop, para a célula de água entre as duas ilhas, mostra o Set vazio em vez de conter as duas ilhas vizinhas.', en: 'Logging `seen` after this loop, for the water cell between the two islands, shows an empty Set instead of containing both neighboring islands.' },
    },
    {
      id: 'water-scan-skips-last-row',
      line: 30,
      code: '  for (let r = 0; r < n - 1; r++) {',
      failsTest: 'single_cell_zero',
      why: { pt: 'Encurta o laço de varredura de água em uma linha; num grid 1x1, `n - 1 = 0`, o laço nunca executa e a única célula de água jamais é considerada como candidata a flip.', en: 'Shortens the water-scan loop by one row; on a 1x1 grid, `n - 1 = 0`, the loop never runs, and the single water cell is never considered as a flip candidate.' },
      logLine: 30,
      logWhy: { pt: 'Logar o limite do laço (`n - 1`) antes de rodar mostra 0 para um grid 1x1, revelando que o corpo do laço nunca é alcançado.', en: 'Logging the loop bound (`n - 1`) before it runs shows 0 for a 1x1 grid, revealing the loop body is never reached.' },
    },
  ],

  followUp: {
    task: { pt: 'Retorne qual célula converter, não só o tamanho resultante.', en: 'Return which cell to flip, not just the resulting size.' },
    changeLines: [28, 29, 43, 47],
    explanation: {
      pt: 'Acompanhe `bestCell: [number, number] | null` junto de `best` (linha 28). Quando nenhuma célula de água supera a maior ilha já existente (caso todo-terra, resolvido na linha 29), `bestCell` continua null — nenhum flip melhora a resposta. Durante a varredura de água, sempre que `total` bater um novo máximo (linha 43), grave `[r, c]` em `bestCell`. Retorne `{ size: best, cell: bestCell }` em vez de só `best` (linha 47).',
      en: 'Track `bestCell: [number, number] | null` alongside `best` (line 28). When no water cell beats the already-existing largest island (the all-land case, handled at line 29), `bestCell` stays null — no flip improves the answer. During the water scan, whenever `total` sets a new max (line 43), record `[r, c]` as `bestCell`. Return `{ size: best, cell: bestCell }` instead of just `best` (line 47).',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'Sou obrigado a converter uma célula, ou posso optar por não converter nenhuma?', en: 'Do I have to flip a cell, or can I choose to flip none?' }, reply: { pt: 'Pode converter zero ou uma célula.', en: 'You may flip zero or one cell.' } },
    { kind: 'good', cost: 15, text: { pt: 'E se o grid já for inteiramente terra?', en: 'What if the grid is already entirely land?' }, reply: { pt: 'Grid todo terra retorna a área total do grid.', en: 'All-land returns total grid area.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Qual o tamanho máximo do grid?', en: 'What is the maximum grid size?' }, reply: { pt: 'Está nas constraints: n até 500.', en: 'It is in the constraints: n up to 500.' } },
    { kind: 'stated', cost: 15, text: { pt: 'O grid é garantidamente quadrado?', en: 'Is the grid guaranteed to be square?' }, reply: { pt: 'As constraints usam um único n para as duas dimensões: é n x n.', en: 'The constraints use a single n for both dimensions: it is n x n.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Posso converter uma célula de terra em água para encolher ilhas estrategicamente?', en: 'Can I flip a land cell to water to strategically shrink islands?' }, reply: { pt: 'Não; a única operação é converter no máximo uma célula de água em terra.', en: 'No; the only operation is flipping at most one water cell to land.' } },
    { kind: 'noise', cost: 30, text: { pt: 'As ilhas dão a volta nas bordas do grid (toroidal)?', en: 'Do islands wrap around the grid edges (toroidal)?' }, reply: { pt: 'Não; é um grid comum, sem wrap-around.', en: 'No; it is a plain grid, no wrap-around.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'all_land',
      text: { pt: 'O grid inteiro é terra', en: 'The entire grid is land' },
      why: { pt: 'Não há água para converter; a resposta é a área total do grid, lida direto do tamanho da única ilha.', en: 'There is no water to convert; the answer is the total grid area, read straight from the one island\'s size.' },
      followUp: { question: { pt: 'Grid 2x2 todo terra: qual a resposta?', en: 'A 2x2 all-land grid: what is the answer?' }, options: ['2', '4'], correct: 1 },
    },
    {
      relevant: true,
      concept: 'all_water',
      text: { pt: 'O grid inteiro é água', en: 'The entire grid is water' },
      why: { pt: 'Não há ilha para crescer; o melhor possível é converter uma única célula, formando uma ilha de tamanho 1.', en: 'There is no island to grow; the best possible outcome is flipping a single cell, forming an island of size 1.' },
      followUp: { question: { pt: 'Qual o maior tamanho possível?', en: 'What is the largest size possible?' }, options: ['0', '1'], correct: 1 },
    },
    {
      relevant: true,
      concept: 'merge_multiple_components',
      text: { pt: 'Uma célula de água toca duas ilhas diferentes', en: 'One water cell touches two different islands' },
      why: { pt: 'Converter essa célula funde as duas ilhas numa só; a resposta soma os tamanhos das duas mais a própria célula convertida.', en: 'Flipping that cell merges both islands into one; the answer sums both sizes plus the flipped cell itself.' },
      followUp: { question: { pt: 'Duas ilhas de tamanho 2 se tocam por uma célula de água; qual o total ao converter?', en: 'Two size-2 islands touch through one water cell; what is the total after flipping it?' }, options: ['4', '5'], correct: 1 },
    },
    {
      relevant: true,
      concept: 'single_cell_zero',
      text: { pt: 'Grid 1x1 com uma única célula, que é água', en: '1x1 grid with a single cell, which is water' },
      why: { pt: 'Caso mínimo do grid todo-água; converter a única célula dá uma ilha de tamanho 1, mas um laço com limite errado pode nunca alcançá-la.', en: 'The minimal case of an all-water grid; flipping the single cell gives an island of size 1, but a loop with the wrong bound may never reach it.' },
      followUp: { question: { pt: 'Qual a resposta?', en: 'What is the answer?' }, options: ['0', '1'], correct: 1 },
    },
    {
      relevant: false,
      text: { pt: 'Grid retangular (não quadrado)', en: 'Rectangular (non-square) grid' },
      why: { pt: 'As constraints usam um único n para as duas dimensões; o grid é sempre quadrado.', en: 'The constraints use a single n for both dimensions; the grid is always square.' },
    },
    {
      relevant: false,
      text: { pt: 'Valores de célula diferentes de 0 e 1', en: 'Cell values other than 0 and 1' },
      why: { pt: 'O grid é estritamente binário; nenhum outro valor aparece na entrada.', en: 'The grid is strictly binary; no other value appears in the input.' },
    },
    {
      relevant: false,
      text: { pt: 'Mais de uma célula pode ser convertida', en: 'More than one cell may be converted' },
      why: { pt: 'A clarificação limita a conversão a no máximo uma célula; não é um caso real nesta versão.', en: 'The clarification limits the flip to at most one cell; it is not a real case in this version.' },
    },
  ],

  pattern: {
    correct: 'dfs-flood-fill',
    distractors: ['candidate-enumeration', 'union-find', 'grid-bfs'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Rotular ilhas com flood fill (pilha), depois varrer células de água somando ilhas vizinhas distintas + 1', en: 'Label islands with flood fill (stack), then scan water cells summing distinct neighboring islands + 1' },
      time: 'O(n²)',
      space: 'O(n²)',
      why: { pt: 'Cada célula é rotulada uma vez; cada célula de água olha um número constante de vizinhos. Bate com o esperado: O(n²), sem refazer flood fill por candidato.', en: 'Each cell is labeled once; each water cell looks at a constant number of neighbors. Matches the expected reasoning: O(n²), without redoing a flood fill per candidate.' },
    },
    {
      chosen: false,
      name: { pt: 'Para cada célula de água, converter e refazer o flood fill do grid inteiro', en: 'For each water cell, flip it and redo a full-grid flood fill' },
      time: 'O(n⁴)',
      space: 'O(n²)',
      why: { pt: 'Até n² células de água candidatas, cada uma disparando um flood fill O(n²): a armadilha exata que o enunciado da performance avisa para evitar num checkerboard 500x500.', en: 'Up to n² candidate water cells, each triggering an O(n²) flood fill: exactly the trap the performance note warns against on a 500x500 checkerboard.' },
    },
    {
      chosen: false,
      name: { pt: 'Union-Find sobre células de terra, unindo vizinhos; depois, para cada água, unir as raízes dos vizinhos', en: 'Union-Find over land cells, unioning neighbors; then, for each water cell, union the roots of its neighbors' },
      time: 'O(n²)',
      space: 'O(n²)',
      why: { pt: 'Também correto e com a mesma complexidade, mas soma a estrutura de union-find (compressão de caminho, rank) sem ganho real sobre um simples flood fill aqui.', en: 'Also correct and with the same complexity, but adds union-find bookkeeping (path compression, rank) with no real benefit over a plain flood fill here.' },
    },
  ],
}

export default content
