import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function findItinerary(...)                     10   const node = stack[stack.length - 1]
//  1 const graph = new Map(...)                       11   const dests = graph.get(node)
//  2 for (const [from, to] of tickets) {               12   if (dests && dests.length > 0) {
//  3   if (!graph.has(from)) graph.set(from, [])        13     stack.push(dests.pop()!)
//  4   graph.get(from)!.push(to)                         14   } else {
//  5 }                                                    15     route.push(stack.pop()!)
//  6 for (dests of graph.values()) dests.sort().reverse() 16   }
//  7 const route: string[] = []                           17 }
//  8 const stack = ['JFK']                                 18 return route.reverse()
//  9 while (stack.length > 0) {                             19 }

const content: ProblemContent = {
  id: 16,
  source: `function findItinerary(tickets: string[][]): string[] {
  const graph = new Map<string, string[]>()
  for (const [from, to] of tickets) {
    if (!graph.has(from)) graph.set(from, [])
    graph.get(from)!.push(to)
  }
  for (const dests of graph.values()) dests.sort().reverse()
  const route: string[] = []
  const stack = ['JFK']
  while (stack.length > 0) {
    const node = stack[stack.length - 1]
    const dests = graph.get(node)
    if (dests && dests.length > 0) {
      stack.push(dests.pop()!)
    } else {
      route.push(stack.pop()!)
    }
  }
  return route.reverse()
}`,

  steps: [
    { indent: 0, text: { pt: 'Monta o grafo: para cada ticket [from, to], acrescenta `to` na lista de destinos de `from`', en: 'Build the graph: for each ticket [from, to], append `to` to from\'s destination list' } },
    { indent: 0, text: { pt: 'Ordena cada lista de destinos alfabeticamente e inverte (para pop() tirar sempre o menor primeiro)', en: 'Sort each destination list alphabetically and reverse it (so pop() always takes the smallest first)' } },
    { indent: 0, text: { pt: 'route = []; pilha = [\'JFK\']', en: 'route = []; stack = [\'JFK\']' } },
    { indent: 0, text: { pt: 'Enquanto a pilha não está vazia:', en: 'While the stack is not empty:' } },
    { indent: 1, text: { pt: 'Olha o topo da pilha (node) sem remover; busca os destinos restantes de node', en: 'Peek the top of the stack (node); look up node\'s remaining destinations' } },
    { indent: 1, text: { pt: 'Se ainda há destino não usado: tira o menor (pop) e empilha', en: 'If there is still an unused destination: pop the smallest and push it' } },
    { indent: 1, text: { pt: 'Senão: desempilha node e acrescenta ao final de route', en: 'Else: pop node off the stack and append it to the end of route' } },
    { indent: 0, text: { pt: 'Retorna route invertido', en: 'Return route reversed' } },
  ],

  stepDistractors: [
    {
      indent: 1,
      text: { pt: 'Se ainda há destino: tira o maior da lista ordenada crescente e empilha', en: 'If there is still a destination: take the largest from the ascending-sorted list and push it' },
      why: { pt: 'Inverte a prioridade; o destino lexicograficamente menor deve ser tentado primeiro, não o maior.', en: 'Inverts the priority; the lexicographically smallest destination must be tried first, not the largest.' },
    },
    {
      indent: 0,
      text: { pt: 'Usa recursão comum (a função chama a si mesma) em vez de uma pilha explícita', en: 'Use plain recursion (the function calls itself) instead of an explicit stack' },
      why: { pt: 'Com até 300.000 tickets formando uma única cadeia, a recursão pode estourar o limite de profundidade da call stack do JS; a pilha explícita evita esse risco.', en: 'With up to 300,000 tickets forming a single chain, recursion can blow past the JS call stack depth limit; the explicit stack avoids that risk.' },
    },
    {
      indent: 1,
      text: { pt: 'Senão: desempilha node e insere no INÍCIO de route (unshift)', en: 'Else: pop node off the stack and insert it at the FRONT of route (unshift)' },
      why: { pt: '`unshift` é O(n) por chamada; com E tickets isso degrada para O(E²), enquanto `push` seguido de um reverse final é O(E) no total.', en: '`unshift` is O(n) per call; with E tickets this degrades to O(E²), while `push` followed by one final reverse is O(E) overall.' },
    },
  ],

  blanks: [
    { line: 3, token: 'graph.has(from)', options: ['graph.has(to)', 'graph.get(from)'] },
    { line: 6, token: '.reverse()', options: ['.pop()', '.shift()'] },
    { line: 8, token: "'JFK'", options: ["'SFO'", 'tickets[0][0]'] },
    { line: 12, token: 'dests &&', options: ['dests ||', '!dests &&'] },
    { line: 18, token: '.reverse()', options: ['.sort()', '.slice()'] },
  ],

  codeDistractors: [
    {
      code: '  for (const dests of graph.values()) dests.sort()',
      why: { pt: 'Sem `.reverse()`, pop() tiraria o maior destino restante primeiro em vez do menor, invertendo a prioridade lexicográfica pretendida.', en: 'Without `.reverse()`, pop() would take the largest remaining destination first instead of the smallest, inverting the intended lexicographic priority.' },
    },
    {
      code: '  const stack = [tickets[0][0]]',
      why: { pt: 'Assume que o itinerário começa no aeroporto do primeiro ticket da entrada; o início é sempre JFK, independente da ordem dos tickets.', en: 'Assumes the itinerary starts at the first ticket\'s airport in the input; the start is always JFK, regardless of ticket order.' },
    },
    {
      code: '  while (stack.length > 1) {',
      why: { pt: 'Para um elemento antes do fim, deixando o último nó travado na pilha sem nunca ser lançado em route.', en: 'Stops one element short of the end, leaving the last node stuck on the stack and never pushed into route.' },
    },
  ],

  bugs: [
    {
      id: 'dedup-duplicate-tickets',
      line: 4,
      code: '    if (!graph.get(from)!.includes(to)) graph.get(from)!.push(to)',
      failsTest: 'duplicate_ticket',
      why: { pt: 'Tratar `to` repetido como algo a evitar descarta um ticket duplicado real; cada ticket é uma aresta distinta que precisa ser usada, mesmo que o par origem-destino se repita.', en: 'Treating a repeated `to` as something to avoid drops a real duplicate ticket; each ticket is a distinct edge that must be used, even if the origin-destination pair repeats.' },
      logLine: 4,
      logWhy: { pt: 'Logar `graph.get(from)` logo depois dessa linha mostra a lista de JFK ganhando só um \'A\', mesmo processando dois tickets JFK→A.', en: 'Logging `graph.get(from)` right after this line shows JFK\'s list gaining only one \'A\', even while processing two JFK→A tickets.' },
    },
    {
      id: 'missing-undefined-guard',
      line: 12,
      code: '    if (dests.length > 0) {',
      failsTest: 'lexical_choice',
      why: { pt: 'Sem o `dests &&`, assim que a pilha alcança um aeroporto que nunca aparece como origem de nenhum ticket, `graph.get(node)` é undefined e `.length` estoura.', en: 'Without `dests &&`, as soon as the stack reaches an airport that never appears as a ticket origin, `graph.get(node)` is undefined and `.length` throws.' },
      logLine: 11,
      logWhy: { pt: 'Logar `dests` logo depois de buscá-lo mostra `undefined` no instante exato em que a pilha chega a um destino final, pouco antes do erro.', en: 'Logging `dests` right after fetching it shows `undefined` at the exact moment the stack reaches a final destination, right before the crash.' },
    },
    {
      id: 'checks-wrong-key',
      line: 3,
      code: '    if (!graph.has(to)) graph.set(from, [])',
      failsTest: 'simple_cycle',
      why: { pt: 'Checa a existência de `to` em vez de `from` antes de inicializar; num ciclo, um aeroporto que já apareceu como destino de outro ticket faz essa checagem pular a inicialização de `from`, e o próximo push falha.', en: 'Checks for the existence of `to` instead of `from` before initializing; in a cycle, an airport that already appeared as some other ticket\'s destination makes this check skip initializing `from`, and the next push fails.' },
      logLine: 4,
      logWhy: { pt: 'Logar `from` e `graph.get(from)` logo antes do push mostra `undefined` justamente porque a chave errada (`to`) foi checada na linha anterior.', en: 'Logging `from` and `graph.get(from)` right before the push shows `undefined`, precisely because the wrong key (`to`) was checked on the previous line.' },
    },
    {
      id: 'no-final-reverse',
      line: 18,
      code: '  return route',
      failsTest: 'duplicate_ticket',
      why: { pt: 'route é construído em pós-ordem (o nó que termina de explorar primeiro entra primeiro); sem o reverse final, o itinerário sai de trás para frente.', en: 'route is built in post-order (the node that finishes exploring first goes in first); without the final reverse, the itinerary comes out backwards.' },
      logLine: 18,
      logWhy: { pt: 'Logar `route` logo antes desse return mostra a sequência de trás para frente, terminando em JFK em vez de começar nele.', en: 'Logging `route` right before this return shows the sequence backwards, ending at JFK instead of starting there.' },
    },
  ],

  followUp: {
    task: { pt: 'O aeroporto de partida é desconhecido.', en: 'The starting airport is unknown.' },
    changeLines: [1, 4, 8],
    explanation: {
      pt: 'Acompanhe o grau de saída e de entrada de cada aeroporto enquanto monta o grafo (estenda a linha 1 com dois maps extras, atualizando-os junto do push na linha 4). O aeroporto de partida é aquele cujo grau de saída excede o de entrada em exatamente 1 (o início natural de um caminho euleriano); se todos os graus empatam, é um circuito e qualquer nó com tickets saindo serve, convencionalmente o menor em ordem alfabética. Troque o `[\'JFK\']` fixo (linha 8) por esse início calculado. O resto do algoritmo (ordenação, pilha, reverse final) não muda.',
      en: "Track each airport's out-degree and in-degree while building the graph (extend line 1 with two extra maps, updating them alongside the push on line 4). The starting airport is the one whose out-degree exceeds its in-degree by exactly 1 (the natural start of an Eulerian path); if all degrees balance, it's a circuit and any node with outgoing tickets works, conventionally the alphabetically smallest. Replace the hardcoded `['JFK']` (line 8) with this computed start. The rest of the algorithm (sorting, the stack, the final reverse) is unchanged.",
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'Preciso usar todo ticket, ou só achar algum caminho válido?', en: 'Do I have to use every ticket, or just find some valid path?' }, reply: { pt: 'Todo ticket deve ser usado exatamente uma vez.', en: 'Every ticket must be used exactly once.' } },
    { kind: 'good', cost: 15, text: { pt: 'Se o mesmo par origem-destino aparece duas vezes na entrada, são dois tickets separados que preciso usar os dois?', en: 'If the same origin-destination pair appears twice in the input, are they two separate tickets I need to use both of?' }, reply: { pt: 'Tickets duplicados são distintos.', en: 'Duplicate tickets are distinct.' } },
    { kind: 'good', cost: 15, text: { pt: 'É garantido que existe um itinerário válido usando todos os tickets?', en: 'Is it guaranteed that a valid itinerary using all tickets exists?' }, reply: { pt: 'Sim, um itinerário base válido existe.', en: 'Yes, a valid base itinerary exists.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Onde o itinerário precisa começar?', en: 'Where does the itinerary have to start?' }, reply: { pt: 'Já está no enunciado: sempre começa em JFK.', en: 'It is already in the prompt: it always starts at JFK.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Qual o número máximo de tickets?', en: 'What is the maximum number of tickets?' }, reply: { pt: 'Está nas constraints: até 300.000.', en: 'It is in the constraints: up to 300,000.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Os voos têm horário de partida que preciso respeitar?', en: 'Do flights have departure times I need to respect?' }, reply: { pt: 'Não há horários aqui; é só a ordem de travessia do grafo.', en: 'There are no schedules here; it is just graph traversal order.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Os códigos de aeroporto podem vir em letras minúsculas?', en: 'Can airport codes come in lowercase letters?' }, reply: { pt: 'Não; as constraints garantem strings curtas em maiúsculas.', en: 'No; the constraints guarantee short uppercase strings.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'lexical_choice',
      text: { pt: 'Mais de uma rota completa é possível; precisa escolher a menor', en: 'More than one complete route is possible; must pick the lexicographically smallest' },
      why: { pt: 'Numa bifurcação, a escolha errada de ordem pode levar a um beco sem saída que nem usa todos os tickets, não só a uma resposta "diferente".', en: 'At a fork, the wrong order choice can lead to a dead end that does not even use every ticket, not just a "different" answer.' },
      followUp: { question: { pt: 'Entre NRT e KUL, qual é lexicograficamente menor?', en: 'Between NRT and KUL, which is lexicographically smaller?' }, options: ['NRT', 'KUL'], correct: 1 },
    },
    {
      relevant: true,
      concept: 'duplicate_ticket',
      text: { pt: 'O mesmo par origem-destino aparece duas vezes na entrada', en: 'The same origin-destination pair appears twice in the input' },
      why: { pt: 'Cada ticket duplicado é uma aresta distinta que precisa ser usada; uma estrutura que deduplica destinos perde uma passagem real.', en: 'Each duplicate ticket is a distinct edge that must be used; a structure that deduplicates destinations drops a real leg.' },
      followUp: { question: { pt: '2 tickets JFK→A idênticos: quantas vezes o trecho JFK→A aparece no itinerário final?', en: '2 identical JFK→A tickets: how many times does the JFK→A leg appear in the final itinerary?' }, options: ['1', '2'], correct: 1 },
    },
    {
      relevant: true,
      concept: 'simple_cycle',
      text: { pt: 'Os tickets formam um ciclo simples que volta ao início', en: 'The tickets form a simple cycle that returns to the start' },
      why: { pt: 'Testa a reconstrução numa cadeia sem nenhuma bifurcação, só a ordem certa de ida e volta pela pilha.', en: 'Tests the reconstruction on a chain with no fork at all, just the right back-and-forth order through the stack.' },
      followUp: { question: { pt: 'JFK→A→B→JFK: qual a última cidade do itinerário?', en: 'JFK→A→B→JFK: what is the last city in the itinerary?' }, options: ['B', 'JFK'], correct: 1 },
    },
    {
      relevant: false,
      text: { pt: 'Tickets formam mais de um componente desconectado', en: 'Tickets form more than one disconnected component' },
      why: { pt: 'A clarificação garante um itinerário base válido usando todos os tickets a partir de JFK; componentes desconectados tornariam isso impossível, então não é um caso real aqui.', en: 'The clarification guarantees a valid base itinerary using all tickets from JFK; disconnected components would make that impossible, so it is not a real case here.' },
    },
    {
      relevant: false,
      text: { pt: 'Códigos de aeroporto com letras minúsculas', en: 'Airport codes with lowercase letters' },
      why: { pt: 'As constraints garantem strings curtas e em maiúsculas; não há caso misto a tratar.', en: 'The constraints guarantee short, uppercase strings; there is no mixed-case input to handle.' },
    },
    {
      relevant: false,
      text: { pt: 'Apenas um ticket na entrada', en: 'Only a single ticket in the input' },
      why: { pt: 'É só o caso trivial de uma rota direta JFK→destino; não exige nenhuma lógica especial de bifurcação ou ciclo.', en: 'It is just the trivial case of a direct JFK→destination route; it needs no special fork or cycle logic.' },
    },
  ],

  pattern: {
    correct: 'hierholzer',
    distractors: ['topo-sort', 'graph-bfs', 'backtracking'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Hierholzer iterativo com pilha explícita (ordena + inverte por nó, pop() sempre tira o menor destino restante)', en: 'Iterative Hierholzer with an explicit stack (sort + reverse per node, pop() always takes the smallest remaining destination)' },
      time: 'O(E log E)',
      space: 'O(E)',
      why: { pt: 'Ordenar os destinos de cada nó domina o custo; a travessia em si é O(E). A pilha explícita (array), em vez da call stack, evita qualquer limite de profundidade de recursão.', en: 'Sorting each node\'s destinations dominates the cost; the traversal itself is O(E). The explicit stack (array), instead of the call stack, avoids any recursion-depth limit.' },
    },
    {
      chosen: false,
      name: { pt: 'Hierholzer recursivo (a função chama a si mesma, anexando à rota em pós-ordem)', en: 'Recursive Hierholzer (the function calls itself, appending to the route in post-order)' },
      time: 'O(E log E)',
      space: 'O(E) + profundidade da call stack',
      why: { pt: 'Mesma complexidade no papel, mas com até 300.000 tickets formando uma única cadeia, a recursão pode chegar a 300.000 níveis de profundidade — quase certo de estourar o limite padrão da call stack do JS. A versão iterativa evita esse risco por completo.', en: 'Same complexity on paper, but with up to 300,000 tickets forming a single chain, recursion can reach 300,000 levels deep — nearly certain to blow past JS\'s default call stack limit. The iterative version avoids this risk entirely.' },
    },
    {
      chosen: false,
      name: { pt: 'Backtracking: tenta cada ticket não usado em ordem, desfaz se travar antes de usar todos', en: 'Backtracking: try each unused ticket in order, undo if stuck before using them all' },
      time: 'O(E!) no pior caso',
      space: 'O(E)',
      why: { pt: 'Sem a garantia estrutural do Hierholzer, o backtracking pode re-explorar exponencialmente muitas ordens antes de achar (ou descartar) uma rota válida — inviável para E grande.', en: 'Without Hierholzer\'s structural guarantee, backtracking can re-explore exponentially many orderings before finding (or discarding) a valid route — infeasible for large E.' },
    },
  ],
}

export default content
