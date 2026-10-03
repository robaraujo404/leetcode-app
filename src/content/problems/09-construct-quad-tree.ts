import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function construct(...)                         12 const total = sum(r, c, r + size, c + size)
//  1 const n = grid.length                            13 if total is 0, leaf val 0
//  2 const prefix = (n+1)x(n+1) zeros                 14 if total is size*size, leaf val 1
//  3 for (let i ...)                                  15 const half = size / 2
//  4 for (let j ...)                                  16 const topLeft = build(r, c, half)
//  5 prefix[i+1][j+1] = ... (2D prefix sum, inclusion-exclusion)   17 const topRight = build(r, c + half, half)
//  8 function sum(r1, c1, r2, c2)                     18 const bottomLeft = build(r + half, c, half)
//  9 return prefix[r2][c2] - prefix[r1][c2] - prefix[r2][c1] + prefix[r1][c1]   19 const bottomRight = build(r + half, c + half, half)
// 11 function build(r, c, size)                       20 return internal node with 4 children
//                                                      22 return build(0, 0, n)

const content: ProblemContent = {
  id: 9,
  source: `function construct(grid: number[][]): QuadNode {
  const n = grid.length
  const prefix: number[][] = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      prefix[i + 1][j + 1] = prefix[i][j + 1] + prefix[i + 1][j] - prefix[i][j] + grid[i][j]
    }
  }
  function sum(r1: number, c1: number, r2: number, c2: number): number {
    return prefix[r2][c2] - prefix[r1][c2] - prefix[r2][c1] + prefix[r1][c1]
  }
  function build(r: number, c: number, size: number): QuadNode {
    const total = sum(r, c, r + size, c + size)
    if (total === 0) return { isLeaf: true, val: 0 }
    if (total === size * size) return { isLeaf: true, val: 1 }
    const half = size / 2
    const topLeft = build(r, c, half)
    const topRight = build(r, c + half, half)
    const bottomLeft = build(r + half, c, half)
    const bottomRight = build(r + half, c + half, half)
    return { isLeaf: false, val: 0, topLeft, topRight, bottomLeft, bottomRight }
  }
  return build(0, 0, n)
}`,

  steps: [
    { indent: 0, text: { pt: 'n = tamanho do lado da grade', en: 'n = side length of the grid' } },
    { indent: 0, text: { pt: 'Monta uma tabela de prefix sums 2D ((n+1) x (n+1)) para somar qualquer sub-região em O(1)', en: 'Build a 2D prefix-sum table ((n+1) x (n+1)) to sum any sub-region in O(1)' } },
    { indent: 0, text: { pt: 'Define sum(r1, c1, r2, c2) por inclusão-exclusão sobre a tabela de prefixos', en: 'Define sum(r1, c1, r2, c2) via inclusion-exclusion over the prefix table' } },
    { indent: 0, text: { pt: 'Define build(r, c, size) recursivamente:', en: 'Define build(r, c, size) recursively:' } },
    { indent: 1, text: { pt: 'total = sum da região de (r, c) até (r+size, c+size)', en: 'total = sum of the region from (r, c) to (r+size, c+size)' } },
    { indent: 1, text: { pt: 'Se total é 0, retorna folha com val 0', en: 'If total is 0, return a leaf with val 0' } },
    { indent: 1, text: { pt: 'Se total é size*size, retorna folha com val 1', en: 'If total is size*size, return a leaf with val 1' } },
    { indent: 1, text: { pt: 'Senão, divide em 4 quadrantes de lado size/2 e chama build em cada um', en: 'Otherwise split into 4 quadrants of side size/2 and call build on each' } },
    { indent: 1, text: { pt: 'Retorna um nó interno com os 4 filhos', en: 'Return an internal node with the 4 children' } },
    { indent: 0, text: { pt: 'Retorna build(0, 0, n)', en: 'Return build(0, 0, n)' } },
  ],

  stepDistractors: [
    {
      indent: 1,
      text: { pt: 'Para cada região, escaneia célula por célula para checar se é uniforme (sem prefix sums)', en: 'For each region, scan cell by cell to check uniformity (no prefix sums)' },
      why: { pt: 'Funciona, mas sem prefix sums cada nó re-escaneia sua região inteira; o custo total sobe de O(n²) para O(n² log n), exatamente a re-varredura repetida que a nota de performance pede para evitar.', en: 'It works, but without prefix sums every node rescans its whole region; total cost goes from O(n²) to O(n² log n), exactly the repeated rescanning the performance note warns against.' },
    },
    {
      indent: 0,
      text: { pt: 'Constrói a quadtree de baixo para cima, começando pelas células 1x1 e mesclando quadrantes iguais', en: 'Build the quadtree bottom-up, starting from 1x1 cells and merging equal quadrants' },
      why: { pt: 'Também funciona, mas inverte a ordem natural da recursão de cima para baixo e precisa de lógica extra para decidir quando quatro folhas iguais podem virar um nó-folha maior.', en: 'Also works, but it inverts the natural top-down recursion and needs extra logic to decide when four equal leaves can collapse back into one bigger leaf.' },
    },
    {
      indent: 1,
      text: { pt: 'Copia a sub-grade relevante para um novo array antes de cada chamada recursiva', en: 'Copy the relevant sub-grid into a new array before each recursive call' },
      why: { pt: 'Copiar a sub-grade a cada nível custa alocação O(size²) por chamada; isso também degrada para O(n² log n) de trabalho que a tabela de prefixos evita.', en: 'Copying the sub-grid at every level costs O(size²) of allocation per call; this also degrades to the O(n² log n) of work the prefix table avoids.' },
    },
  ],

  blanks: [
    { line: 1, token: 'grid.length', options: ['grid[0].length', 'grid.length - 1'] },
    { line: 13, token: 'val: 0', options: ['val: 1', 'val: total'] },
    { line: 14, token: 'size * size', options: ['size', 'size + size'] },
    { line: 15, token: '/ 2', options: ['* 2', '/ 4'] },
    { line: 22, token: '0, 0, n', options: ['n, n, 0', '0, 0, 0'] },
  ],

  codeDistractors: [
    {
      code: '      prefix[i + 1][j + 1] = prefix[i][j] + grid[i][j]',
      why: { pt: 'Falta somar as faixas de linha e coluna da tabela de prefixos (os dois termos com +1 num índice só); isso subconta toda célula fora da primeira linha e primeira coluna.', en: 'This drops the row-strip and column-strip terms of the prefix table; it undercounts every cell outside the first row and first column.' },
    },
    {
      code: '    const topRight = build(r + half, c, half)',
      why: { pt: 'Essa é a região do quadrante inferior-esquerdo (desloca a linha), não a do superior-direito (que desloca a coluna).', en: 'That is the bottom-left quadrant\'s region (row offset), not the top-right one (which needs a column offset).' },
    },
    {
      code: '    if (total === size * size) return { isLeaf: true, val: total }',
      why: { pt: 'val deveria ser o booleano 1 para um bloco todo-terra; guardar o total bruto só coincide com 1 quando size é 1.', en: 'val should be the boolean 1 for an all-land block; storing the raw total only happens to equal 1 when size is 1.' },
    },
  ],

  bugs: [
    {
      id: 'zero-leaf-wrong-val',
      line: 13,
      code: '    if (total === 0) return { isLeaf: true, val: 1 }',
      failsTest: 'single_cell',
      why: { pt: 'Quando a região é toda água (total 0), a folha deveria guardar val 0; essa troca grava val 1, invertendo o resultado.', en: 'When the region is all water (total 0), the leaf should hold val 0; this swap stores val 1 instead, inverting the result.' },
      logLine: 12,
      logWhy: { pt: 'Logar `total` junto com o val retornado mostra total === 0 mas val === 1 — a condição está certa, o valor gravado está errado.', en: 'Logging `total` alongside the returned val shows total === 0 but val === 1 — the condition is right, the stored value is wrong.' },
    },
    {
      id: 'missing-inclusion-exclusion-term',
      line: 5,
      code: '      prefix[i + 1][j + 1] = prefix[i][j + 1] + prefix[i + 1][j] + grid[i][j]',
      failsTest: 'uniform_large',
      why: { pt: 'Sem subtrair `prefix[i][j]`, o canto compartilhado entre a faixa de cima e a faixa da esquerda é contado duas vezes; a soma de qualquer região com mais de uma linha e coluna fica inflada e para de bater com size*size, então a recursão nunca encontra um size que seja potência de 2 e acaba acessando um índice fracionário.', en: 'Without subtracting `prefix[i][j]`, the corner shared by the row strip and column strip is double-counted; the sum of any region with more than one row and column gets inflated and stops matching size*size, so the recursion never lands on a power-of-two size and ends up indexing a fractional one.' },
      logLine: 5,
      logWhy: { pt: 'Logar `prefix[i + 1][j + 1]` a cada passo mostra os valores crescendo mais rápido do que deveriam a partir da segunda linha.', en: 'Logging `prefix[i + 1][j + 1]` on every step shows the values growing faster than they should from the second row on.' },
    },
    {
      id: 'copy-paste-top-right',
      line: 17,
      code: '    const topRight = build(r, c, half)',
      failsTest: 'one_quadrant_diff',
      why: { pt: 'Copia e cola do topLeft: reconstrói a região superior-esquerda de novo em vez de deslocar a coluna por `half` para chegar à região superior-direita.', en: 'Copy-pasted from topLeft: it rebuilds the top-left region again instead of offsetting the column by `half` to reach the top-right region.' },
      logLine: 17,
      logWhy: { pt: 'Logar `r, c` passados para build() em cada quadrante mostra topLeft e topRight recebendo exatamente o mesmo (r, c).', en: 'Logging the `r, c` passed into build() for each quadrant shows topLeft and topRight receiving the exact same (r, c).' },
    },
    {
      id: 'size-not-squared',
      line: 14,
      code: '    if (total === size) return { isLeaf: true, val: 1 }',
      failsTest: 'one_quadrant_diff',
      why: { pt: 'Para uma região toda-terra de lado size, a soma é size*size, não size; comparar com size só funciona por coincidência quando size é 1, então regiões maiores todo-terra deixam de ser reconhecidas como folha.', en: 'For an all-land region of side size, the sum is size*size, not size; comparing against size only works by coincidence when size is 1, so larger all-land regions stop being recognized as leaves.' },
      logLine: 14,
      logWhy: { pt: 'Logar `total` e `size` nesse if mostra total=4 e size=2 numa região toda-terra: a condição `total === size` é falsa quando deveria ser verdadeira.', en: 'Logging `total` and `size` at this if shows total=4 and size=2 on an all-land region: the `total === size` condition is false when it should be true.' },
    },
  ],

  followUp: {
    task: { pt: 'Suporte atualizações pontuais de célula e consultas repetidas de região.', en: 'Support point updates to a cell plus repeated region queries.' },
    changeLines: [1, 2, 5, 8, 9, 22],
    explanation: {
      pt: 'Troque a tabela de prefix sums estática (linhas 1, 2 e 5) por uma Fenwick tree (BIT) 2D com update(i, j, delta) e query(r1, c1, r2, c2), ambos O(log² n). A função sum (linhas 8-9) passa a delegar para a query da BIT em vez de ler o array de prefixos fixo. Como cada consulta de região já é respondida direto por sum(), não há mais motivo para materializar a quadtree inteira de uma vez (linha 22 deixa de chamar build(0, 0, n) eagerly); construa o nó relevante só quando uma consulta de região pedir por ele.',
      en: 'Swap the static prefix-sum table (lines 1, 2 and 5) for a 2D Fenwick tree (BIT) with update(i, j, delta) and query(r1, c1, r2, c2), both O(log² n). The sum function (lines 8-9) now delegates to the BIT\'s query instead of reading the fixed prefix array. Since every region query is already answered directly by sum(), there is no more reason to eagerly materialize the whole quadtree up front (line 22 stops calling build(0, 0, n) eagerly); build the relevant node only when a region query asks for it.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'O valor guardado numa folha importa quando o nó NÃO é folha?', en: 'Does the value stored at a leaf matter when the node is NOT a leaf?' }, reply: { pt: 'Não; o valor só importa em nós-folha.', en: 'No; the value only matters for leaf nodes.' } },
    { kind: 'good', cost: 20, text: { pt: 'Posso assumir que o lado da grade é sempre uma potência de 2?', en: 'Can I assume the grid side is always a power of two?' }, reply: { pt: 'Sim, sempre é.', en: 'Yes, always.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Qual o tamanho máximo de n?', en: 'What is the maximum value of n?' }, reply: { pt: 'Está nas constraints: até 1024.', en: 'It is in the constraints: up to 1024.' } },
    { kind: 'stated', cost: 15, text: { pt: 'A grade é sempre quadrada?', en: 'Is the grid always square?' }, reply: { pt: 'O enunciado já diz: é uma matriz binária quadrada.', en: 'The prompt already says so: it is a square binary matrix.' } },
    { kind: 'good', cost: 20, text: { pt: 'O que a função deve retornar, exatamente?', en: 'What exactly should the function return?' }, reply: { pt: 'Serialize assim: L<val> para folha, N(tl,tr,bl,br) para nó interno.', en: 'Serialize it as: L<val> for a leaf, N(tl,tr,bl,br) for an internal node.' } },
    { kind: 'noise', cost: 30, text: { pt: 'A grade pode vir como uma imagem PNG codificada em base64?', en: 'Can the grid come in as a base64-encoded PNG image?' }, reply: { pt: 'Irrelevante: é uma matriz de inteiros em memória.', en: 'Irrelevant: it is an in-memory matrix of integers.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Os valores da grade podem ser negativos?', en: 'Can the grid values be negative?' }, reply: { pt: 'Não; por definição é uma matriz binária, só 0 ou 1.', en: 'No; by definition it is a binary matrix, only 0 or 1.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'single_cell',
      text: { pt: 'A grade é 1x1 (n = 1)', en: 'The grid is 1x1 (n = 1)' },
      why: { pt: 'Caso base mínimo: nunca entra na recursão de divisão, só testa a checagem de folha.', en: 'Minimal base case: it never enters the splitting recursion, only exercises the leaf check.' },
      followUp: { question: { pt: 'O que a função retorna?', en: 'What does the function return?' }, options: ['Uma folha com o valor da célula', 'Um nó interno vazio', 'Erro: n precisa ser par'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'uniform_large',
      text: { pt: 'Uma grade grande (ex: 4x4) é inteiramente uniforme (tudo 0 ou tudo 1)', en: 'A large grid (e.g. 4x4) is entirely uniform (all 0 or all 1)' },
      why: { pt: 'Testa se a checagem de uniformidade para a recursão de imediato em vez de dividir sem necessidade.', en: 'Tests whether the uniformity check stops the recursion right away instead of splitting needlessly.' },
      followUp: { question: { pt: 'Quantos nós a árvore resultante tem?', en: 'How many nodes does the resulting tree have?' }, options: ['Só 1 (uma folha)', '4 folhas', 'Uma árvore completa de profundidade log n'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'one_quadrant_diff',
      text: { pt: 'Só um dos quatro quadrantes de topo é diferente dos outros três', en: 'Only one of the four top-level quadrants differs from the other three' },
      why: { pt: 'Testa se cada quadrante recebe a região certa (offsets de linha e coluna corretos) e se quadrantes uniformes não são divididos de novo sem necessidade.', en: 'Tests whether each quadrant gets the right region (correct row/column offsets) and whether uniform quadrants are not needlessly split again.' },
      followUp: { question: { pt: 'Os 4 filhos diretos da raiz são folhas ou nós internos?', en: 'Are the root\'s 4 direct children leaves or internal nodes?' }, options: ['Todos folhas, apesar da raiz não ser folha', 'Só o quadrante diferente é folha', 'Nenhum é folha'], correct: 0 },
    },
    {
      relevant: false,
      text: { pt: 'n = 0 (grade vazia)', en: 'n = 0 (empty grid)' },
      why: { pt: 'As constraints garantem n >= 1; isso nunca ocorre.', en: 'The constraints guarantee n >= 1; this never happens.' },
    },
    {
      relevant: false,
      text: { pt: 'Os valores da grade vêm como true/false em vez de 0/1', en: 'Grid values come as true/false instead of 0/1' },
      why: { pt: 'A assinatura fixa o tipo como int[][]; isso nunca acontece aqui.', en: 'The signature fixes the type as int[][]; this never happens here.' },
    },
    {
      relevant: false,
      text: { pt: 'Grade de 1024x1024 densamente não uniforme (estresse de performance)', en: 'A densely non-uniform 1024x1024 grid (performance stress)' },
      why: { pt: 'Não é um caso de corretude; é desempenho, já coberto pela escolha de prefix sums O(n²) em vez de rescanear cada região.', en: 'Not a correctness case; it is a performance concern, already covered by choosing O(n²) prefix sums instead of rescanning each region.' },
    },
  ],

  pattern: {
    correct: 'tree-recursion',
    distractors: ['prefix-sum', 'dfs-flood-fill', 'backtracking'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Prefix sums 2D + divisão recursiva em quadrantes', en: '2D prefix sums + recursive quadrant splitting' },
      time: 'O(n²)',
      space: 'O(n²)',
      why: { pt: 'A tabela de prefixos é montada uma vez em O(n²); depois, cada chamada de build faz uma checagem de uniformidade em O(1), então o custo total da recursão é proporcional ao número de nós da árvore, que é O(n²) no pior caso.', en: 'The prefix table is built once in O(n²); after that, every build call does its uniformity check in O(1), so the recursion\'s total cost is proportional to the number of tree nodes, which is O(n²) in the worst case.' },
    },
    {
      chosen: false,
      name: { pt: 'Em cada chamada de build, escanear a sub-região célula por célula para checar uniformidade e soma', en: 'At each build call, scan the sub-region cell by cell to check uniformity and sum' },
      time: 'O(n² log n)',
      space: 'O(log n)',
      why: { pt: 'Sem prefix sums, cada nível da recursão re-escaneia O(n²) células no total; multiplicado pelos O(log n) níveis de profundidade, isso é exatamente a "re-varredura repetida" que a nota de performance pede para evitar — ainda termina para n=1024, mas desperdiça trabalho sem necessidade.', en: 'Without prefix sums, every level of the recursion rescans O(n²) cells in total; multiplied by the O(log n) levels of depth, that is exactly the "repeated rescanning" the performance note warns against — it still finishes for n=1024, but it wastes work for no reason.' },
    },
  ],
}

export default content
