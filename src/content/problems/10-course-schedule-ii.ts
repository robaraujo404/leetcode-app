import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function findOrder(...)                         26 const l = i * 2 + 1
//  1 const adj = ... (adjacency list, req -> course)  27 const r = i * 2 + 2
//  2 const indegree = new Array(n).fill(0)            28 let smallest = i
//  3 for (const [course, req] of pre)                 29 if left child smaller, smallest = l
//  4 adj[req].push(course)                            30 if right child smaller, smallest = r
//  5 indegree[course]++                               31 if smallest === i, break
//  7 const heap: number[] = []                        32-35 swap heap[i] and heap[smallest]; i = smallest
//  8 function push(x) (sift-up, min-heap)              38 return top
//  9 heap.push(x)                                     40 for (let course = 0; ...) seed indegree-0 courses
// 10 let i = heap.length - 1                           41 if (indegree[course] === 0) push(course)
// 11 while parent > current, swap, climb               43 const order: number[] = []
// 19 function pop() (sift-down, min-heap)              44 while (heap.length > 0)
// 20 const top = heap[0]                               45 const course = pop()
// 21 const last = heap.pop()!                          46 order.push(course)
// 22-24 move last element to root if any remain         47 for (const next of adj[course])
// 25 while (true) sift-down loop                        48 indegree[next]--
//                                                       49 if (indegree[next] === 0) push(next)
//                                                       52 return order.length === n ? order : []

const content: ProblemContent = {
  id: 10,
  source: `function findOrder(n: number, pre: number[][]): number[] {
  const adj: number[][] = Array.from({ length: n }, () => [])
  const indegree: number[] = new Array(n).fill(0)
  for (const [course, req] of pre) {
    adj[req].push(course)
    indegree[course]++
  }
  const heap: number[] = []
  function push(x: number): void {
    heap.push(x)
    let i = heap.length - 1
    while (i > 0 && heap[(i - 1) >> 1] > heap[i]) {
      const parent = (i - 1) >> 1
      const tmp = heap[i]
      heap[i] = heap[parent]
      heap[parent] = tmp
      i = parent
    }
  }
  function pop(): number {
    const top = heap[0]
    const last = heap.pop()!
    if (heap.length > 0) {
      heap[0] = last
      let i = 0
      while (true) {
        const l = i * 2 + 1
        const r = i * 2 + 2
        let smallest = i
        if (l < heap.length && heap[l] < heap[smallest]) smallest = l
        if (r < heap.length && heap[r] < heap[smallest]) smallest = r
        if (smallest === i) break
        const tmp = heap[i]
        heap[i] = heap[smallest]
        heap[smallest] = tmp
        i = smallest
      }
    }
    return top
  }
  for (let course = 0; course < n; course++) {
    if (indegree[course] === 0) push(course)
  }
  const order: number[] = []
  while (heap.length > 0) {
    const course = pop()
    order.push(course)
    for (const next of adj[course]) {
      indegree[next]--
      if (indegree[next] === 0) push(next)
    }
  }
  return order.length === n ? order : []
}`,

  steps: [
    { indent: 0, text: { pt: 'Monta a lista de adjacência (pré-requisito → curso) e o indegree de cada curso a partir de pre', en: 'Build the adjacency list (prerequisite → course) and each course\'s indegree from pre' } },
    { indent: 0, text: { pt: 'Cria um min-heap vazio de cursos', en: 'Create an empty min-heap of courses' } },
    { indent: 0, text: { pt: 'Para cada curso de 0 a n-1 com indegree 0, insere no heap', en: 'For each course from 0 to n-1 with indegree 0, insert it into the heap' } },
    { indent: 0, text: { pt: 'order = []', en: 'order = []' } },
    { indent: 0, text: { pt: 'Enquanto o heap não está vazio:', en: 'While the heap is not empty:' } },
    { indent: 1, text: { pt: 'Remove o menor curso do heap; adiciona a order', en: 'Remove the smallest course from the heap; add it to order' } },
    { indent: 1, text: { pt: 'Para cada curso que depende dele:', en: 'For each course that depends on it:' } },
    { indent: 2, text: { pt: 'Decrementa o indegree desse curso', en: 'Decrement that course\'s indegree' } },
    { indent: 2, text: { pt: 'Se o indegree chegou a 0, insere no heap', en: 'If the indegree reached 0, insert it into the heap' } },
    { indent: 0, text: { pt: 'Se order tem n cursos, retorna order; senão retorna [] (havia um ciclo)', en: 'If order has n courses, return order; otherwise return [] (there was a cycle)' } },
  ],

  stepDistractors: [
    {
      indent: 0,
      text: { pt: 'A cada iteração, ordena os cursos prontos (indegree 0) com sort() e tira o menor', en: 'On each iteration, sort the ready (indegree 0) courses with sort() and take the smallest' },
      why: { pt: 'Reordenar a lista inteira de candidatos a cada remoção custa O(V log V) por iteração em vez de O(log V); no total fica O(V² log V), bem acima do que 100k cursos aguentam em 2s.', en: 'Re-sorting the whole candidate list on every removal costs O(V log V) per iteration instead of O(log V); overall that is O(V² log V), far above what 100k courses can take in 2s.' },
    },
    {
      indent: 1,
      text: { pt: 'Usa uma fila comum (FIFO), processando os cursos na ordem em que ficaram prontos', en: 'Use a plain FIFO queue, processing courses in the order they became ready' },
      why: { pt: 'O Kahn clássico com fila dá UMA ordem topológica válida, mas não necessariamente a de menor número primeiro entre cursos prontos ao mesmo tempo; o enunciado exige esse desempate específico.', en: 'Classic Kahn with a queue gives A valid topological order, but not necessarily smallest-number-first among courses ready at the same time; the prompt requires that specific tie-break.' },
    },
    {
      indent: 0,
      text: { pt: 'Faz DFS recursiva com marcação de 3 cores para detectar ciclo e empilha os cursos na pós-ordem', en: 'Do a recursive 3-color DFS to detect cycles and push courses in post-order' },
      why: { pt: 'Funciona e detecta ciclo, mas numa cadeia de até 100k pré-requisitos a recursão profunda arrisca estourar a pilha de chamadas; a versão com heap é iterativa.', en: 'It works and detects cycles, but on a chain of up to 100k prerequisites deep recursion risks a call-stack overflow; the heap version is iterative.' },
    },
  ],

  blanks: [
    { line: 2, token: 'fill(0)', options: ['fill(1)', 'fill(-1)'] },
    { line: 5, token: '++', options: ['--', '+= 2'] },
    { line: 41, token: '=== 0', options: ['> 0', '!== 0'] },
    { line: 49, token: 'push(next)', options: ['pop()', 'push(course)'] },
    { line: 52, token: 'order : []', options: ['[] : order', 'order : null'] },
  ],

  codeDistractors: [
    {
      code: '    indegree[req]++',
      why: { pt: 'Incrementa o indegree do pré-requisito, não do curso que depende dele; indegree deveria contar quantas dependências um curso AINDA tem, não quantos cursos dependem dele.', en: 'Increments the prerequisite\'s indegree, not the dependent course\'s; indegree should count how many dependencies a course still has, not how many courses depend on it.' },
    },
    {
      code: '    const course = heap.shift()',
      why: { pt: '`heap` aqui é o array interno de um heap binário, não uma lista ordenada; `shift()` tira o primeiro elemento inserido, não o menor — ignora toda a estrutura de heap.', en: '`heap` here is the internal array of a binary heap, not a sorted list; `shift()` removes the first inserted element, not the smallest one — it ignores the heap structure entirely.' },
    },
    {
      code: '  return order.length === n ? order : null',
      why: { pt: 'Quando há ciclo, a resposta precisa ser uma lista vazia, não null; retornar null muda o tipo e quebra qualquer código que espere um array.', en: 'When there is a cycle, the answer needs to be an empty list, not null; returning null changes the type and breaks any code expecting an array.' },
    },
  ],

  bugs: [
    {
      id: 'null-on-cycle',
      line: 52,
      code: '  return order.length === n ? order : null',
      failsTest: 'cycle',
      why: { pt: 'Quando um ciclo impede completar todos os cursos, a resposta certa é lista vazia; retornar null muda o tipo do resultado.', en: 'When a cycle prevents finishing all courses, the right answer is an empty list; returning null changes the result\'s type.' },
      logLine: 52,
      logWhy: { pt: 'Logar `order.length` e o valor retornado mostra 0 (correto) virando null (errado) bem no ponto de retorno.', en: 'Logging `order.length` and the returned value shows 0 (correct) turning into null (wrong) right at the return point.' },
    },
    {
      id: 'flip-left-child-compare',
      line: 29,
      code: '        if (l < heap.length && heap[l] > heap[smallest]) smallest = l',
      failsTest: 'no_dependencies',
      why: { pt: 'Inverte a comparação do filho esquerdo no sift-down; o heap para de ser consistentemente mínimo e pop() deixa de devolver sempre o menor curso restante, quebrando a ordem crescente exigida quando não há nenhum pré-requisito.', en: 'Flips the left-child comparison in the sift-down; the heap stops being consistently a min-heap and pop() no longer always returns the smallest remaining course, breaking the ascending order required when there are no prerequisites at all.' },
      logLine: 45,
      logWhy: { pt: 'Logar cada `course` ao sair de pop() mostra a sequência saindo fora de ordem crescente mesmo sem nenhuma dependência entre os cursos.', en: 'Logging each `course` as it comes out of pop() shows the sequence coming out of ascending order even with no dependency between the courses at all.' },
    },
    {
      id: 'swapped-destructure',
      line: 3,
      code: '  for (const [req, course] of pre) {',
      failsTest: 'diamond_dependencies',
      why: { pt: 'Troca os papéis de curso e pré-requisito ao desestruturar; o grafo inteiro é montado ao contrário, então a ordem resultante sai invertida em relação à dependência real.', en: 'Swaps the roles of course and prerequisite when destructuring; the whole graph is built backwards, so the resulting order comes out reversed relative to the real dependency.' },
      logLine: 4,
      logWhy: { pt: 'Logar `req, course` logo após a desestruturação mostra os dois valores trocados em relação ao par original de pre[i].', en: 'Logging `req, course` right after destructuring shows the two values swapped relative to the original pre[i] pair.' },
    },
    {
      id: 'decrement-by-two',
      line: 48,
      code: '      indegree[next] -= 2',
      failsTest: 'disconnected_dag',
      why: { pt: 'Decrementar de 2 em 2 pula o valor exato 0 sempre que o indegree de partida é ímpar; esse curso nunca entra no heap e fica faltando na ordem final mesmo sem nenhum ciclo real.', en: 'Decrementing by 2 skips right past the exact value 0 whenever the starting indegree is odd; that course never enters the heap and ends up missing from the final order even though there is no real cycle.' },
      logLine: 48,
      logWhy: { pt: 'Logar `indegree[next]` logo após o decremento mostra o valor pulando de 1 para -1 sem nunca passar por 0.', en: 'Logging `indegree[next]` right after the decrement shows the value jumping from 1 to -1 without ever landing on 0.' },
    },
  ],

  followUp: {
    task: { pt: 'Com semestres ilimitados em cursos simultâneos, retorne o número mínimo de semestres.', en: 'With unlimited courses per semester, return the minimum number of semesters.' },
    changeLines: [0, 7, 43, 44, 52],
    explanation: {
      pt: 'Troque o heap (linha 7) por uma fila comum: sem exigência de desempate, não precisa mais ordenar por menor curso, só saber quais estão prontos. Troque a remoção um a um (linha 44 em diante) por processar a fronteira atual inteira como um semestre: retire todos os cursos já prontos, decremente os indegrees dos dependentes, acumule os que ficaram prontos numa PRÓXIMA fronteira (sem processá-los ainda nesse mesmo semestre) e só então avance, incrementando um contador de semestres. O retorno (linha 52) passa a ser esse contador quando todos os cursos foram processados, ou -1 se sobrar curso (ciclo). O tipo de retorno muda de number[] para number (linha 0).',
      en: 'Swap the heap (line 7) for a plain queue: with no tie-break requirement, you no longer need to sort by smallest course, only track what is ready. Swap the one-at-a-time removal (line 44 onward) for processing the whole current frontier as one semester: drain every course that is already ready, decrement its dependents\' indegrees, collect whichever become ready into a NEXT frontier (without processing them yet in this same semester), then advance by bumping a semester counter. The return (line 52) becomes that counter once every course is processed, or -1 if any course is left over (a cycle). The return type changes from number[] to number (line 0).',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'O que eu retorno se não existir uma ordem válida (há um ciclo)?', en: 'What do I return if no valid ordering exists (there is a cycle)?' }, reply: { pt: 'Retorne uma lista vazia.', en: 'Return an empty list.' } },
    { kind: 'good', cost: 20, text: { pt: 'Quando mais de um curso pode ser o próximo, qual o critério de desempate?', en: 'When more than one course can be taken next, what is the tie-break?' }, reply: { pt: 'O menor número de curso primeiro; isso torna a saída única.', en: 'The smallest course number first; that makes the output unique.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Qual o tamanho máximo de numCourses e de prerequisites?', en: 'What are the maximum sizes of numCourses and prerequisites?' }, reply: { pt: 'Está nas constraints: até 100000 cursos e 200000 pré-requisitos.', en: 'It is in the constraints: up to 100000 courses and 200000 prerequisites.' } },
    { kind: 'stated', cost: 15, text: { pt: 'O formato de pre[i] é [curso, pré-requisito] ou o contrário?', en: 'Is the format of pre[i] [course, prerequisite] or the other way around?' }, reply: { pt: 'É [curso, pré-requisito]: pre[i] = [a, b] significa que a depende de b.', en: 'It is [course, prerequisite]: pre[i] = [a, b] means a depends on b.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Posso ter cursos sem nenhum pré-requisito?', en: 'Can some courses have no prerequisites at all?' }, reply: { pt: 'Sim; prerequisites.length pode ser 0 e cursos sem pré-requisito já começam prontos.', en: 'Yes; prerequisites.length can be 0 and courses with no prerequisite start out ready.' } },
    { kind: 'noise', cost: 30, text: { pt: 'As notas dos alunos em cada curso afetam a ordem?', en: 'Do students\' grades in each course affect the ordering?' }, reply: { pt: 'Não, não há notas no problema.', en: 'No, there are no grades in this problem.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Preciso lidar com vários alunos fazendo matrículas ao mesmo tempo?', en: 'Do I need to handle multiple students enrolling at the same time?' }, reply: { pt: 'Não, é uma única consulta estática sobre o grafo de cursos.', en: 'No, it is a single static query over the course graph.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'cycle',
      text: { pt: 'Existe um ciclo de dependências (A precisa de B e B precisa de A)', en: 'There is a dependency cycle (A needs B and B needs A)' },
      why: { pt: 'Não existe ordem válida; a resposta tem que ser lista vazia, sem lançar erro nem devolver uma ordem parcial.', en: 'No valid ordering exists; the answer must be an empty list, not an error or a partial order.' },
      followUp: { question: { pt: 'O que a função retorna?', en: 'What does the function return?' }, options: ['Lista vazia', 'null', 'Lança uma exceção'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'no_dependencies',
      text: { pt: 'Nenhum curso tem pré-requisito', en: 'No course has any prerequisite' },
      why: { pt: 'Testa se, sem nenhuma restrição de ordem, a saída ainda sai em ordem crescente de número de curso (desempate puro pelo heap).', en: 'Tests whether, with no ordering constraint at all, the output still comes out in ascending course-number order (pure tie-break via the heap).' },
      followUp: { question: { pt: 'Qual a saída para 3 cursos sem pré-requisitos?', en: 'What is the output for 3 courses with no prerequisites?' }, options: ['[0, 1, 2]', 'Qualquer ordem vale', '[2, 1, 0]'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'diamond_dependencies',
      text: { pt: 'Duas cadeias de pré-requisitos convergem no mesmo curso final (losango)', en: 'Two prerequisite chains converge on the same final course (a diamond)' },
      why: { pt: 'Testa se o heap resolve corretamente quando dois cursos ficam prontos ao mesmo tempo, escolhendo o menor antes de liberar o curso final.', en: 'Tests whether the heap correctly resolves two courses becoming ready at the same time, picking the smallest before unlocking the final course.' },
      followUp: { question: { pt: 'Isso muda o resultado final?', en: 'Does this change the final result?' }, options: ['Não, mas testa o desempate no meio do caminho', 'Sim, o curso final pode vir antes dos outros', 'Sim, gera dois resultados válidos'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'disconnected_dag',
      text: { pt: 'O grafo de pré-requisitos tem duas cadeias completamente separadas', en: 'The prerequisite graph has two completely separate chains' },
      why: { pt: 'Testa se cursos de componentes diferentes se intercalam pelo número do curso, em vez de uma cadeia inteira vir sempre antes da outra.', en: 'Tests whether courses from different components interleave by course number, instead of one whole chain always coming before the other.' },
      followUp: { question: { pt: 'Os cursos das duas cadeias se intercalam na saída?', en: 'Do the two chains\' courses interleave in the output?' }, options: ['Sim, pela ordem de número de curso disponível', 'Não, uma cadeia inteira vem antes da outra', 'Depende da ordem em pre[]'], correct: 0 },
    },
    {
      relevant: false,
      text: { pt: 'numCourses é 1 e não há pré-requisitos', en: 'numCourses is 1 and there are no prerequisites' },
      why: { pt: 'Já é coberto pelo caso geral de "sem dependências"; não é um caso novo.', en: 'Already covered by the general "no dependencies" case; not a new case.' },
    },
    {
      relevant: false,
      text: { pt: 'Pré-requisitos duplicados na lista (o mesmo par repetido)', en: 'Duplicate prerequisites in the list (the same pair repeated)' },
      why: { pt: 'Só infla o indegree de forma consistente nas duas pontas; não muda a ordem final nem quebra o algoritmo.', en: 'It only inflates the indegree consistently on both ends; it does not change the final order or break the algorithm.' },
    },
    {
      relevant: false,
      text: { pt: 'A ordem das duplas dentro de pre[] vem embaralhada', en: 'The pairs inside pre[] come in shuffled order' },
      why: { pt: 'O algoritmo lê todas as arestas antes de começar a ordenar; a ordem de entrada em pre[] não importa para o resultado.', en: 'The algorithm reads every edge before it starts ordering; the input order within pre[] does not matter for the result.' },
    },
  ],

  pattern: {
    correct: 'topo-sort-heap',
    distractors: ['topo-sort', 'dijkstra', 'graph-bfs'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Kahn com min-heap de cursos prontos', en: 'Kahn\'s algorithm with a min-heap of ready courses' },
      time: 'O((V + E) log V)',
      space: 'O(V + E)',
      why: { pt: 'Cada curso entra e sai do heap uma vez (O(log V) cada), cada aresta é percorrida uma vez; o heap garante o desempate de menor curso primeiro exigido pelo enunciado.', en: 'Each course enters and leaves the heap once (O(log V) each), each edge is scanned once; the heap guarantees the smallest-course-first tie-break the prompt requires.' },
    },
    {
      chosen: false,
      name: { pt: 'Kahn com fila comum (FIFO), sem heap', en: 'Kahn\'s algorithm with a plain FIFO queue, no heap' },
      time: 'O(V + E)',
      space: 'O(V + E)',
      why: { pt: 'Mais rápido (sem o fator log) e correto para uma ordenação topológica qualquer, mas devolve os cursos na ordem em que ficaram prontos, não necessariamente a de menor número; falha a exigência de desempate e a saída única do enunciado.', en: 'Faster (no log factor) and correct for any topological ordering, but returns courses in the order they became ready, not necessarily smallest-first; it fails the tie-break requirement and the prompt\'s unique-output guarantee.' },
    },
    {
      chosen: false,
      name: { pt: 'DFS recursiva com marcação de 3 cores e pós-ordem invertida', en: 'Recursive 3-color DFS with reversed post-order' },
      time: 'O(V + E)',
      space: 'O(V) na pilha de chamadas',
      why: { pt: 'Detecta ciclo e dá uma ordem topológica válida, mas não produz naturalmente o desempate de menor curso, e uma cadeia de até 100k pré-requisitos de profundidade arrisca estourar a pilha de chamadas.', en: 'Detects cycles and yields a valid topological order, but does not naturally produce the smallest-course tie-break, and a chain up to 100k prerequisites deep risks overflowing the call stack.' },
    },
  ],
}

export default content
