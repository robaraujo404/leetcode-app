import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function numBusesToDestination(...)          17 for (const r of stopToRoutes.get(stop) ?? [])
//  1 if (source === target) return 0              18 if (visitedRoutes.has(r)) continue
//  2 const stopToRoutes = new Map()               19 visitedRoutes.add(r)
//  3 for (let r = 0; ...)                         20 for (const s of routes[r])
//  4 for (const stop of routes[r])                21 if (s === target) return buses
//  5 if (!stopToRoutes.has(stop)) ...set          22 if (!visitedStops.has(s))
//  6 stopToRoutes.get(stop)!.push(r)              23 visitedStops.add(s)
//  9 const visitedRoutes = new Set()              24 next.push(s)
// 10 const visitedStops = new Set([source])       29 frontier = next
// 11 let frontier = [source]                      31 return -1
// 12 let buses = 0
// 13 while (frontier.length > 0)
// 14 buses++
// 15 const next = []
// 16 for (const stop of frontier)

const content: ProblemContent = {
  id: 1,
  source: `function numBusesToDestination(routes: number[][], source: number, target: number): number {
  if (source === target) return 0
  const stopToRoutes = new Map<number, number[]>()
  for (let r = 0; r < routes.length; r++) {
    for (const stop of routes[r]) {
      if (!stopToRoutes.has(stop)) stopToRoutes.set(stop, [])
      stopToRoutes.get(stop)!.push(r)
    }
  }
  const visitedRoutes = new Set<number>()
  const visitedStops = new Set<number>([source])
  let frontier: number[] = [source]
  let buses = 0
  while (frontier.length > 0) {
    buses++
    const next: number[] = []
    for (const stop of frontier) {
      for (const r of stopToRoutes.get(stop) ?? []) {
        if (visitedRoutes.has(r)) continue
        visitedRoutes.add(r)
        for (const s of routes[r]) {
          if (s === target) return buses
          if (!visitedStops.has(s)) {
            visitedStops.add(s)
            next.push(s)
          }
        }
      }
    }
    frontier = next
  }
  return -1
}`,

  steps: [
    { indent: 0, text: { pt: 'Se source == target, retorna 0', en: 'If source == target, return 0' } },
    { indent: 0, group: 1, text: { pt: 'Monta o mapa parada → rotas que passam nela', en: 'Build the map stop → routes that visit it' } },
    { indent: 0, group: 1, text: { pt: 'Fronteira = [source]; marca source como parada visitada; buses = 0', en: 'Frontier = [source]; mark source as a visited stop; buses = 0' } },
    { indent: 0, text: { pt: 'Enquanto a fronteira não está vazia:', en: 'While the frontier is not empty:' } },
    { indent: 1, text: { pt: 'buses++; próxima fronteira = []', en: 'buses++; next frontier = []' } },
    { indent: 1, text: { pt: 'Para cada parada da fronteira:', en: 'For each stop in the frontier:' } },
    { indent: 2, text: { pt: 'Para cada rota ainda não visitada que passa na parada: marca a rota como visitada', en: 'For each not-yet-visited route through the stop: mark the route visited' } },
    { indent: 3, text: { pt: 'Para cada parada dessa rota: se é o target retorna buses; senão, se não visitada, marca e põe na próxima fronteira', en: 'For each stop of that route: if it is the target return buses; else if unvisited, mark it and add to the next frontier' } },
    { indent: 1, text: { pt: 'fronteira = próxima fronteira', en: 'frontier = next frontier' } },
    { indent: 0, text: { pt: 'Retorna -1', en: 'Return -1' } },
  ],

  stepDistractors: [
    {
      indent: 2,
      text: { pt: 'Marca a rota como visitada só depois de percorrer todas as paradas dela', en: 'Mark the route visited only after scanning all of its stops' },
      why: { pt: 'Marcar depois deixa a mesma rota ser enfileirada de novo a partir de outra parada da fronteira: trabalho repetido e, pior, contagem errada de ônibus.', en: 'Marking late lets the same route be re-expanded from another frontier stop: duplicated work and, worse, wrong bus counts.' },
    },
    {
      indent: 0,
      text: { pt: 'Faz BFS sobre paradas, com uma aresta entre paradas consecutivas da mesma rota', en: 'BFS over stops, with an edge between consecutive stops of the same route' },
      why: { pt: 'BFS por paradas minimiza paradas percorridas, não trocas de ônibus. O que se minimiza aqui são rotas usadas.', en: 'Stop-level BFS minimizes stops traveled, not bus changes. What is minimized here is routes used.' },
    },
    {
      indent: 0,
      text: { pt: 'Ordena as rotas por tamanho antes de começar', en: 'Sort the routes by length before starting' },
      why: { pt: 'A ordem das rotas não muda a BFS nem o resultado; só gasta O(R log R).', en: 'Route order does not change the BFS or its answer; it only costs O(R log R).' },
    },
  ],

  blanks: [
    { line: 1, token: 'return 0', options: ['return 1', 'return -1'] },
    { line: 10, token: '[source]', options: ['[]', '[target]'] },
    { line: 18, token: 'continue', options: ['break', 'return -1'] },
    { line: 21, token: 'return buses', options: ['return buses + 1', 'return buses - 1'] },
    { line: 31, token: 'return -1', options: ['return 0', 'return buses'] },
  ],

  codeDistractors: [
    {
      code: '        if (visitedRoutes.has(r)) break',
      why: { pt: '`break` abandona as outras rotas que passam nessa parada; `continue` pula só a rota já vista.', en: '`break` abandons the other routes through this stop; `continue` skips only the route already seen.' },
    },
    {
      code: '          if (visitedStops.has(s)) return buses',
      why: { pt: 'Uma parada já visitada não é o target; isso retorna cedo demais.', en: 'A visited stop is not the target; this returns far too early.' },
    },
    {
      code: '  const visitedRoutes = new Set<number>([0])',
      why: { pt: 'Marca a rota 0 como visitada antes de começar, então ela nunca é explorada.', en: 'Marks route 0 visited before starting, so it is never explored.' },
    },
  ],

  bugs: [
    {
      id: 'same-stop-returns-1',
      line: 1,
      code: '  if (source === target) return 1',
      failsTest: 'source_equals_target',
      why: { pt: 'Já estar no destino não gasta ônibus nenhum.', en: 'Already being at the destination costs zero buses.' },
      logLine: 1,
      logWhy: { pt: 'O teste retorna 1 com source == target; logar os argumentos na entrada mostra que o caso especial está errado.', en: 'The test returns 1 with source == target; logging the arguments on entry shows the special case is wrong.' },
    },
    {
      id: 'unreachable-returns-0',
      line: 31,
      code: '  return 0',
      failsTest: 'disconnected_graph',
      why: { pt: 'Esgotar a fronteira sem achar o target significa que não há caminho: -1.', en: 'Exhausting the frontier without finding the target means no path: -1.' },
      logLine: 29,
      logWhy: { pt: 'Logar a fronteira a cada nível mostra que ela esvazia sem o target aparecer, então o problema é o retorno final.', en: 'Logging the frontier each level shows it empties without the target ever appearing, so the final return is the problem.' },
    },
    {
      id: 'off-by-one-buses',
      line: 21,
      code: '          if (s === target) return buses + 1',
      failsTest: 'direct_route',
      why: { pt: '`buses` já foi incrementado ao entrar no nível; +1 conta um ônibus a mais.', en: '`buses` was already incremented when entering the level; +1 counts one bus too many.' },
      logLine: 14,
      logWhy: { pt: 'Logar `buses` ao entrar em cada nível mostra que o primeiro nível já é 1, então o +1 no retorno é duplo.', en: 'Logging `buses` when entering each level shows the first level is already 1, so the +1 in the return double counts.' },
    },
    {
      id: 'break-instead-of-continue',
      line: 18,
      code: '        if (visitedRoutes.has(r)) break',
      failsTest: 'duplicate_stop_inside_route',
      why: { pt: 'Uma parada repetida gera a mesma rota duas vezes no mapa; ao encontrar a repetição, `break` descarta as rotas restantes dessa parada.', en: 'A duplicated stop puts the same route twice in the map; on hitting the repeat, `break` drops the remaining routes of that stop.' },
      logLine: 17,
      logWhy: { pt: 'Logar cada rota `r` visitada por parada mostra que a rota 1 nunca é visitada a partir da parada 2.', en: 'Logging each route `r` visited per stop shows route 1 is never visited from stop 2.' },
    },
  ],

  followUp: {
    task: { pt: 'Retorne a sequência de índices de rota usados, não só a contagem.', en: 'Return the sequence of route indexes taken, not just the count.' },
    changeLines: [0, 19, 21],
    explanation: {
      pt: 'Guarde `parentRoute: Map<rota, rotaAnterior>` no momento em que a rota é marcada visitada (linha 19), passando a rota pela qual a parada foi alcançada. Ao achar o target (linha 21), caminhe pelos pais até a origem. O tipo de retorno muda (linha 0). A BFS em si não muda.',
      en: 'Keep `parentRoute: Map<route, previousRoute>` set where the route is marked visited (line 19), carrying the route through which the stop was reached. On finding the target (line 21), walk the parents back to the start. The return type changes (line 0). The BFS itself is untouched.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'E se source for igual a target?', en: 'What if source equals target?' }, reply: { pt: 'Retorne 0.', en: 'Return 0.' } },
    { kind: 'good', cost: 20, text: { pt: 'O que retorno se o target for inalcançável?', en: 'What do I return if the target is unreachable?' }, reply: { pt: 'Retorne -1.', en: 'Return -1.' } },
    { kind: 'good', cost: 20, text: { pt: 'Uma rota pode listar a mesma parada mais de uma vez?', en: 'Can a route list the same stop more than once?' }, reply: { pt: 'Pode; não tem significado especial.', en: 'Yes; it has no special meaning.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Quantas rotas podem existir no máximo?', en: 'How many routes can there be at most?' }, reply: { pt: 'Está nas constraints: até 500.', en: 'It is in the constraints: up to 500.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Os IDs das paradas são inteiros?', en: 'Are stop IDs integers?' }, reply: { pt: 'Está nas constraints: inteiros de 32 bits.', en: 'It is in the constraints: 32-bit integers.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Minimizo ônibus ou paradas percorridas?', en: 'Do I minimize buses or stops traveled?' }, reply: { pt: 'O enunciado diz: número mínimo de ônibus.', en: 'The statement says: minimum number of buses.' } },
    { kind: 'noise', cost: 30, text: { pt: 'As rotas têm horários? Preciso considerar o tempo de espera?', en: 'Do routes have schedules? Should I consider waiting time?' }, reply: { pt: 'Não há tempo nem horários no problema.', en: 'There is no time or schedule in this problem.' } },
    { kind: 'noise', cost: 30, text: { pt: 'A entrada vem como JSON ou CSV?', en: 'Does the input come as JSON or CSV?' }, reply: { pt: 'Irrelevante: é um array em memória.', en: 'Irrelevant: it is an in-memory array.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'source_equals_target',
      text: { pt: 'source e target são a mesma parada', en: 'source and target are the same stop' },
      why: { pt: 'Caso especial que o loop não cobre: a resposta é 0 antes de qualquer BFS.', en: 'Special case the loop does not cover: the answer is 0 before any BFS.' },
      followUp: { question: { pt: 'Quanto retorna?', en: 'What does it return?' }, options: ['0', '1', '-1'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'disconnected_graph',
      text: { pt: 'Nenhuma rota conecta source ao target', en: 'No route connects source to target' },
      why: { pt: 'A BFS esgota a fronteira; precisa de um retorno de falha definido.', en: 'The BFS exhausts the frontier; it needs a defined failure return.' },
      followUp: { question: { pt: 'Quanto retorna?', en: 'What does it return?' }, options: ['0', '-1', 'Infinity'], correct: 1 },
    },
    {
      relevant: true,
      concept: 'duplicate_stop_inside_route',
      text: { pt: 'A mesma parada aparece duas vezes na mesma rota', en: 'The same stop appears twice in one route' },
      why: { pt: 'O mapa parada → rotas ganha a mesma rota duas vezes; o código tem que tolerar isso.', en: 'The stop → routes map gets the same route twice; the code must tolerate it.' },
      followUp: { question: { pt: 'Muda a resposta?', en: 'Does it change the answer?' }, options: ['Não, é só ruído', 'Sim, conta como transferência', 'Sim, a rota é inválida'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'direct_route',
      text: { pt: 'Uma única rota contém source e target', en: 'A single route contains both source and target' },
      why: { pt: 'Testa o off-by-one: a resposta é 1, não 0 nem 2.', en: 'Tests the off-by-one: the answer is 1, not 0 or 2.' },
      followUp: { question: { pt: 'Quanto retorna?', en: 'What does it return?' }, options: ['1', '0', '2'], correct: 0 },
    },
    {
      relevant: false,
      text: { pt: 'IDs de parada negativos', en: 'Negative stop IDs' },
      why: { pt: 'IDs são só chaves de mapa; o sinal não importa.', en: 'IDs are just map keys; the sign is irrelevant.' },
    },
    {
      relevant: false,
      text: { pt: 'Lista de rotas vazia', en: 'Empty routes list' },
      why: { pt: 'As constraints garantem pelo menos uma rota.', en: 'The constraints guarantee at least one route.' },
    },
    {
      relevant: false,
      text: { pt: 'Rotas fora de ordem na entrada', en: 'Routes out of order in the input' },
      why: { pt: 'A BFS não depende da ordem das rotas.', en: 'The BFS does not depend on route order.' },
    },
    {
      relevant: false,
      text: { pt: 'IDs de parada perto de 2^31', en: 'Stop IDs near 2^31' },
      why: { pt: 'Cabem num number de JS; nada a tratar.', en: 'They fit in a JS number; nothing to handle.' },
    },
  ],

  pattern: {
    correct: 'graph-bfs',
    distractors: ['dijkstra', 'union-find', 'dfs-flood-fill'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'BFS onde cada nó é uma rota', en: 'BFS where each node is a route' },
      time: 'O(S)',
      space: 'O(S)',
      why: { pt: 'S = total de paradas em todas as rotas. Cada rota é expandida uma vez, cada parada enfileirada uma vez. Pesos iguais (1 ônibus), então BFS basta.', en: 'S = total stop occurrences. Each route expands once, each stop is enqueued once. Equal weights (1 bus), so BFS is enough.' },
    },
    {
      chosen: false,
      name: { pt: 'BFS sobre paradas com arestas entre todas as paradas de cada rota', en: 'BFS over stops with edges among all stops of each route' },
      time: 'O(Σ len²)',
      space: 'O(Σ len²)',
      why: { pt: 'Cada rota de tamanho L vira L² arestas; uma rota de 100k paradas explode. E ainda contaria paradas, não ônibus.', en: 'Each route of length L becomes L² edges; a 100k-stop route explodes. And it would count stops, not buses.' },
    },
    {
      chosen: false,
      name: { pt: 'Dijkstra com custo 1 por troca de rota', en: 'Dijkstra with cost 1 per route change' },
      time: 'O(S log S)',
      space: 'O(S)',
      why: { pt: 'Correto, mas o heap é desnecessário quando todos os pesos são iguais. Vira a resposta certa no follow-up de custos diferentes.', en: 'Correct, but the heap is unnecessary when all weights are equal. It becomes the right answer in the different-costs follow-up.' },
    },
  ],
}

export default content
