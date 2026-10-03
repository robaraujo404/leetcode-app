import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function calcEquation(...)                      16 while (queue.length > 0)
//  1 const graph = new Map<string, Map<string, number>>()   17 const [node, acc] = queue.shift()!
//  2 function addEdge(a, b, w)                        18 if (node === dst) return acc
//  3 if (!graph.has(a)) graph.set(a, new Map())        19 for (const [next, weight] of graph.get(node)!)
//  4 graph.get(a)!.set(b, w)                           20 if (!visited.has(next))
//  6 for (let i = 0; ...) build equations             21 visited.add(next)
//  7 const [a, b] = equations[i]                       22 queue.push([next, acc * weight])
//  8 addEdge(a, b, values[i])                          26 return -1 (queue drained, dst unreachable)
//  9 addEdge(b, a, 1 / values[i]) (reverse edge)       28 return queries.map(([a, b]) => query(a, b))
// 11 function query(src, dst)
// 12 if either variable unknown, return -1
// 13 if src === dst, return 1
// 14 const visited = new Set([src])
// 15 const queue: [...][] = [[src, 1]]

const content: ProblemContent = {
  id: 11,
  source: `function calcEquation(equations: string[][], values: number[], queries: string[][]): number[] {
  const graph = new Map<string, Map<string, number>>()
  function addEdge(a: string, b: string, w: number): void {
    if (!graph.has(a)) graph.set(a, new Map())
    graph.get(a)!.set(b, w)
  }
  for (let i = 0; i < equations.length; i++) {
    const [a, b] = equations[i]
    addEdge(a, b, values[i])
    addEdge(b, a, 1 / values[i])
  }
  function query(src: string, dst: string): number {
    if (!graph.has(src) || !graph.has(dst)) return -1
    if (src === dst) return 1
    const visited = new Set<string>([src])
    const queue: [string, number][] = [[src, 1]]
    while (queue.length > 0) {
      const [node, acc] = queue.shift()!
      if (node === dst) return acc
      for (const [next, weight] of graph.get(node)!) {
        if (!visited.has(next)) {
          visited.add(next)
          queue.push([next, acc * weight])
        }
      }
    }
    return -1
  }
  return queries.map(([a, b]) => query(a, b))
}`,

  steps: [
    { indent: 0, text: { pt: 'Monta um grafo ponderado: para cada equação a/b=v, adiciona aresta a→b com peso v e aresta b→a com peso 1/v', en: 'Build a weighted graph: for each equation a/b=v, add edge a→b with weight v and edge b→a with weight 1/v' } },
    { indent: 0, text: { pt: 'Define query(src, dst):', en: 'Define query(src, dst):' } },
    { indent: 1, text: { pt: 'Se src ou dst nunca apareceu em nenhuma equação, retorna -1', en: 'If src or dst never appeared in any equation, return -1' } },
    { indent: 1, text: { pt: 'Se src === dst, retorna 1', en: 'If src === dst, return 1' } },
    { indent: 1, text: { pt: 'BFS a partir de src, acumulando o produto dos pesos no caminho:', en: 'BFS from src, accumulating the product of weights along the path:' } },
    { indent: 2, text: { pt: 'Tira o nó da frente da fila; se é o destino, retorna o produto acumulado', en: 'Pop the node at the front of the queue; if it is the destination, return the accumulated product' } },
    { indent: 2, text: { pt: 'Para cada vizinho não visitado do nó atual: marca visitado e enfileira (vizinho, produto acumulado * peso da aresta)', en: 'For each unvisited neighbor of the current node: mark it visited and enqueue (neighbor, accumulated product * edge weight)' } },
    { indent: 1, text: { pt: 'Se a fila esvaziar sem achar o destino, retorna -1', en: 'If the queue drains without finding the destination, return -1' } },
    { indent: 0, text: { pt: 'Retorna o resultado de query para cada consulta', en: 'Return the result of query for every query' } },
  ],

  stepDistractors: [
    {
      indent: 1,
      text: { pt: 'Olha só os vizinhos diretos de src; se dst não está entre eles, retorna -1', en: 'Only look at src\'s direct neighbors; if dst is not among them, return -1' },
      why: { pt: 'Isso só resolve consultas de um salto; a/c encadeada através de b (multi-hop) nunca seria encontrada.', en: 'This only solves one-hop queries; a/c chained through b (multi-hop) would never be found.' },
    },
    {
      indent: 0,
      text: { pt: 'Pré-computa todos os pares com Floyd-Warshall sobre as variáveis antes de qualquer consulta', en: 'Precompute every pair with Floyd-Warshall over the variables before any query' },
      why: { pt: 'Funciona e responde cada consulta em O(1), mas custa O(V³) de pré-processamento; com até 20000 equações isso é inviável, mesmo sem um fixture de performance para provar.', en: 'It works and answers each query in O(1), but it costs O(V³) of preprocessing; with up to 20000 equations that is infeasible, even without a performance fixture to prove it.' },
    },
    {
      indent: 2,
      text: { pt: 'Para cada vizinho, confere se já é o destino antes de enfileirar, retornando o produto na hora', en: 'For each neighbor, check whether it is already the destination before enqueueing, returning the product right away' },
      why: { pt: 'É uma otimização válida (evita uma volta extra pela fila), mas não é necessária para a corretude: checar ao desenfileirar já funciona.', en: 'It is a valid optimization (saves one extra trip through the queue), but it is not needed for correctness: checking on dequeue already works.' },
    },
  ],

  blanks: [
    { line: 9, token: 'b, a', options: ['a, b', 'a, a'] },
    { line: 14, token: '[src]', options: ['[]', '[dst]'] },
    { line: 18, token: 'return acc', options: ['return acc * weight', 'return 1'] },
    { line: 22, token: 'acc * weight', options: ['weight', 'acc + weight'] },
    { line: 26, token: 'return -1', options: ['return 0', 'return acc'] },
  ],

  codeDistractors: [
    {
      code: '    if (!graph.has(src) && !graph.has(dst)) return -1',
      why: { pt: '`&&` só retorna -1 quando NENHUM dos dois é conhecido; se apenas um deles for desconhecido, o código tenta seguir em frente mesmo assim.', en: '`&&` only returns -1 when NEITHER variable is known; if only one of them is unknown, the code tries to proceed anyway.' },
    },
    {
      code: '      if (graph.get(node)!.has(dst)) return acc * graph.get(node)!.get(dst)!',
      why: { pt: 'Isso só reconhece o destino quando ele é vizinho DIRETO do nó atual; uma conversão em dois ou mais saltos (ex: a→b→c) nunca seria detectada assim.', en: 'This only recognizes the destination when it is a DIRECT neighbor of the current node; a conversion two or more hops away (e.g. a→b→c) would never be detected this way.' },
    },
    {
      code: '    addEdge(a, b, 1 / values[i])',
      why: { pt: 'Isso sobrescreve a aresta a→b com o inverso do peso em vez de criar a aresta b→a; a direção reversa nunca é registrada.', en: 'This overwrites the a→b edge with the inverse weight instead of creating the b→a edge; the reverse direction never gets recorded.' },
    },
  ],

  bugs: [
    {
      id: 'unknown-guard-returns-one',
      line: 12,
      code: '    if (!graph.has(src) || !graph.has(dst)) return 1',
      failsTest: 'unknown_variable',
      why: { pt: 'Quando src ou dst nunca apareceu em nenhuma equação, a resposta correta é -1 (desconhecido), não 1.', en: 'When src or dst never appeared in any equation, the correct answer is -1 (unknown), not 1.' },
      logLine: 12,
      logWhy: { pt: 'Logar `graph.has(src)` e `graph.has(dst)` nessa checagem mostra dst ausente do grafo, mas a função ainda devolve 1.', en: 'Logging `graph.has(src)` and `graph.has(dst)` at this check shows dst missing from the graph, yet the function still returns 1.' },
    },
    {
      id: 'self-query-wrong-value',
      line: 13,
      code: '    if (src === dst) return 0',
      failsTest: 'self_query_known',
      why: { pt: 'Uma variável conhecida dividida por ela mesma é 1, não 0; essa troca quebra todo caso de auto-consulta.', en: 'A known variable divided by itself is 1, not 0; this swap breaks every self-query case.' },
      logLine: 13,
      logWhy: { pt: 'Logar `src`, `dst` e o valor retornado nessa linha mostra src === dst mas o retorno sendo 0 em vez de 1.', en: 'Logging `src`, `dst` and the returned value at this line shows src === dst yet the return is 0 instead of 1.' },
    },
    {
      id: 'no-reverse-edge',
      line: 9,
      code: '    addEdge(a, b, 1 / values[i])',
      failsTest: 'reverse_edge',
      why: { pt: 'Copia e cola a mesma direção a→b (agora com o peso invertido) em vez de criar a aresta b→a; o grafo nunca ganha a direção reversa, então qualquer consulta nesse sentido fica sem caminho.', en: 'Copy-pastes the same a→b direction (now with the inverted weight) instead of creating the b→a edge; the graph never gets the reverse direction, so any query in that direction has no path.' },
      logLine: 4,
      logWhy: { pt: 'Logar `a, b, w` dentro de addEdge mostra o par (a, b) sendo gravado duas vezes e o par (b, a) nunca aparecendo.', en: 'Logging `a, b, w` inside addEdge shows the (a, b) pair being written twice and the (b, a) pair never showing up.' },
    },
    {
      id: 'if-not-while-bfs',
      line: 16,
      code: '    if (queue.length > 0) {',
      failsTest: 'multi_hop',
      why: { pt: 'Troca o laço por uma única execução: só o nó inicial é processado, então qualquer destino que exija mais de um salto nunca chega a ser desenfileirado e comparado.', en: 'Swaps the loop for a single run: only the starting node gets processed, so any destination that needs more than one hop is never dequeued and compared.' },
      logLine: 17,
      logWhy: { pt: 'Logar `node` cada vez que é desenfileirado mostra só uma linha de log mesmo quando o caminho real precisa de dois saltos.', en: 'Logging `node` every time it is dequeued shows only one log line even when the real path needs two hops.' },
    },
  ],

  followUp: {
    task: { pt: 'Adicione addEquation(a, b, value) que rejeita uma equação que contradiga as existentes.', en: 'Add addEquation(a, b, value) that rejects an equation contradicting the existing ones.' },
    changeLines: [1, 2, 11, 28],
    explanation: {
      pt: 'Adicione uma função addEquation(a, b, value) que primeiro roda query(a, b) (linha 11) sobre o grafo já existente (linha 1); se a e b já são conhecidos e o resultado não é -1 nem compatível com value (dentro de uma tolerância numérica), rejeite sem tocar o grafo. Caso contrário, chame addEdge (linha 2) nas duas direções, exatamente como já é feito no laço de construção, e devolva sucesso. O BFS em si (query) não muda; só passa a ser reaproveitado também como checagem de consistência.',
      en: 'Add an addEquation(a, b, value) function that first runs query(a, b) (line 11) over the existing graph (line 1); if a and b are already known and the result is neither -1 nor compatible with value (within a numeric tolerance), reject without touching the graph. Otherwise call addEdge (line 2) in both directions, exactly as the construction loop already does, and report success. The BFS itself (query) does not change; it is just reused as a consistency check too.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'O que eu retorno se uma variável da consulta nunca apareceu em nenhuma equação?', en: 'What do I return if a query variable never appeared in any equation?' }, reply: { pt: 'Retorne -1.0.', en: 'Return -1.0.' } },
    { kind: 'good', cost: 20, text: { pt: 'E se a consulta for X dividido por ele mesmo (X/X)?', en: 'What if the query is X divided by itself (X/X)?' }, reply: { pt: 'Se X é conhecido, retorna 1.0.', en: 'If X is known, return 1.0.' } },
    { kind: 'good', cost: 20, text: { pt: 'As equações-base podem ser inconsistentes entre si (dois caminhos dando valores diferentes)?', en: 'Can the base equations be inconsistent with each other (two paths giving different values)?' }, reply: { pt: 'Não; as equações-base são garantidamente consistentes entre si.', en: 'No; the base equations are guaranteed to be internally consistent.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Qual o tamanho máximo de equations e queries?', en: 'What are the maximum sizes of equations and queries?' }, reply: { pt: 'Está nas constraints: até 20000 cada.', en: 'It is in the constraints: up to 20000 each.' } },
    { kind: 'good', cost: 20, text: { pt: 'O que cada consulta deve retornar quando o valor não pode ser determinado?', en: 'What should each query return when the value cannot be determined?' }, reply: { pt: 'Retorne -1.0.', en: 'Return -1.0.' } },
    { kind: 'noise', cost: 30, text: { pt: 'As equações podem vir de uma API externa que eu preciso chamar?', en: 'Can the equations come from an external API I need to call?' }, reply: { pt: 'Não, tudo já vem como arrays em memória.', en: 'No, everything already comes as in-memory arrays.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Preciso suportar unidades físicas diferentes (metros, pés, etc)?', en: 'Do I need to support different physical units (meters, feet, etc)?' }, reply: { pt: 'Não, é só um grafo abstrato de razões numéricas.', en: 'No, it is just an abstract graph of numeric ratios.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'unknown_variable',
      text: { pt: 'A consulta envolve uma variável que nunca apareceu em nenhuma equação', en: 'The query involves a variable that never appeared in any equation' },
      why: { pt: 'Não há caminho algum para montar; a resposta tem que ser -1, não erro nem 0.', en: 'There is no path to build at all; the answer must be -1, not an error or 0.' },
      followUp: { question: { pt: 'O que a função retorna?', en: 'What does the function return?' }, options: ['-1', '0', 'Lança uma exceção'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'self_query_known',
      text: { pt: 'A consulta é X/X para uma variável X conhecida', en: 'The query is X/X for a known variable X' },
      why: { pt: 'Deveria retornar 1 mesmo sem seguir nenhuma aresta; testa o caso base antes de qualquer busca.', en: 'It should return 1 without following any edge at all; tests the base case before any search.' },
      followUp: { question: { pt: 'Quanto retorna?', en: 'What does it return?' }, options: ['1', '0', '-1'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'reverse_edge',
      text: { pt: 'A consulta pede a razão no sentido inverso de uma equação dada (equação é a/b, consulta é b/a)', en: 'The query asks for the ratio in the reverse direction of a given equation (equation is a/b, query is b/a)' },
      why: { pt: 'Testa se a aresta reversa (peso 1/valor) foi mesmo adicionada ao grafo, não só a direção original da equação.', en: 'Tests whether the reverse edge (weight 1/value) was actually added to the graph, not just the equation\'s original direction.' },
      followUp: { question: { pt: 'Se a/b = 4, quanto é b/a?', en: 'If a/b = 4, what is b/a?' }, options: ['0.25', '4', '-1'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'multi_hop',
      text: { pt: 'A consulta exige encadear duas ou mais equações (a/b e b/c para achar a/c)', en: 'The query requires chaining two or more equations (a/b and b/c to find a/c)' },
      why: { pt: 'Testa se a busca continua além do primeiro vizinho em vez de parar no primeiro salto.', en: 'Tests whether the search keeps going past the first neighbor instead of stopping at the first hop.' },
      followUp: { question: { pt: 'Se a/b=2 e b/c=3, quanto é a/c?', en: 'If a/b=2 and b/c=3, what is a/c?' }, options: ['6', '5', '1.5'], correct: 0 },
    },
    {
      relevant: false,
      text: { pt: 'A mesma equação aparece mais de uma vez na lista', en: 'The same equation appears more than once in the list' },
      why: { pt: 'As equações-base são garantidamente consistentes; um par repetido só reforça o mesmo peso.', en: 'The base equations are guaranteed consistent; a repeated pair just reinforces the same weight.' },
    },
    {
      relevant: false,
      text: { pt: 'Os nomes das variáveis têm mais de uma letra (ex: "USD", "EUR")', en: 'Variable names have more than one letter (e.g. "USD", "EUR")' },
      why: { pt: 'São só strings usadas como chave no grafo; o tamanho do nome não importa.', en: 'They are just strings used as graph keys; the name\'s length does not matter.' },
    },
    {
      relevant: false,
      text: { pt: 'O valor de uma equação é exatamente 1 (a/b = 1)', en: 'An equation\'s value is exactly 1 (a/b = 1)' },
      why: { pt: 'Não é um caso especial: o BFS multiplica pelo peso normalmente; 1 só significa que a e b valem o mesmo.', en: 'Not a special case: the BFS multiplies by the weight normally; 1 just means a and b are equal in value.' },
    },
  ],

  pattern: {
    correct: 'graph-bfs',
    distractors: ['union-find', 'dijkstra', 'multi-source-bfs'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Grafo ponderado montado uma vez; BFS por consulta multiplicando os pesos', en: 'Weighted graph built once; per-query BFS multiplying weights' },
      time: 'O(E) de pré-processamento + O(Q · (V + E)) nas consultas',
      space: 'O(V + E)',
      why: { pt: 'Simples e direto de provar correto; cada consulta é uma busca independente limitada ao tamanho do componente conexo de src. Para até 20000 equações e consultas, os componentes tendem a ser pequenos na prática.', en: 'Simple and straightforward to prove correct; each query is an independent search bounded by the size of src\'s connected component. For up to 20000 equations and queries, components tend to stay small in practice.' },
    },
    {
      chosen: false,
      name: { pt: 'Union-Find com peso: cada nó guarda sua razão até a raiz do próprio conjunto', en: 'Weighted Union-Find: each node keeps its ratio to its set\'s root' },
      time: 'O(E · α(V)) de pré-processamento + O(Q · α(V)) nas consultas',
      space: 'O(V)',
      why: { pt: 'Assintoticamente melhor quando há muito mais consultas do que equações, mas atualizar as razões corretamente durante a compressão de caminho é bem mais fácil de errar do que uma busca direta.', en: 'Asymptotically better when there are far more queries than equations, but correctly updating ratios during path compression is much easier to get wrong than a direct search.' },
    },
    {
      chosen: false,
      name: { pt: 'Para cada consulta, rescanear a lista de equações do zero sem montar um grafo', en: 'For each query, rescan the equations list from scratch without building a graph' },
      time: 'O(Q · E)',
      space: 'O(1) extra',
      why: { pt: 'Nunca materializa a lista de adjacência; cada consulta repete o trabalho de achar vizinhos que já poderia ter sido feito uma única vez no início.', en: 'Never materializes an adjacency structure; every query repeats the work of finding neighbors that could have been done once up front.' },
    },
  ],
}

export default content
