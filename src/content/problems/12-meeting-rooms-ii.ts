import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 function minMeetingRooms(...)                   10   rooms++
//  1 if (intervals.length === 0) return 0             11   i++
//  2 const starts = ...sort(...)                      12 } else {
//  3 const ends = ...sort(...)                         13   rooms--
//  4 let rooms = 0                                     14   j++
//  5 let maxRooms = 0                                  15 }
//  6 let i = 0                                         16 maxRooms = Math.max(maxRooms, rooms)
//  7 let j = 0                                         17 }
//  8 while (i < starts.length) {                       18 return maxRooms
//  9 if (starts[i] < ends[j]) {                         19 }

const content: ProblemContent = {
  id: 12,
  source: `function minMeetingRooms(intervals: number[][]): number {
  if (intervals.length === 0) return 0
  const starts = intervals.map((iv) => iv[0]).sort((a, b) => a - b)
  const ends = intervals.map((iv) => iv[1]).sort((a, b) => a - b)
  let rooms = 0
  let maxRooms = 0
  let i = 0
  let j = 0
  while (i < starts.length) {
    if (starts[i] < ends[j]) {
      rooms++
      i++
    } else {
      rooms--
      j++
    }
    maxRooms = Math.max(maxRooms, rooms)
  }
  return maxRooms
}`,

  steps: [
    { indent: 0, text: { pt: 'Se não há reuniões, retorna 0', en: 'If there are no meetings, return 0' } },
    { indent: 0, text: { pt: 'Monta `starts`: todos os horários de início, ordenados', en: 'Build `starts`: every start time, sorted ascending' } },
    { indent: 0, text: { pt: 'Monta `ends`: todos os horários de término, ordenados', en: 'Build `ends`: every end time, sorted ascending' } },
    { indent: 0, text: { pt: 'rooms = 0, maxRooms = 0, i = 0, j = 0', en: 'rooms = 0, maxRooms = 0, i = 0, j = 0' } },
    { indent: 0, text: { pt: 'Enquanto i < starts.length:', en: 'While i < starts.length:' } },
    { indent: 1, text: { pt: 'Se starts[i] < ends[j]: uma reunião começa antes da mais antiga em uso terminar → precisa de sala nova; rooms++, i++', en: 'If starts[i] < ends[j]: a meeting starts before the oldest in-use one ends → needs a new room; rooms++, i++' } },
    { indent: 1, text: { pt: 'Senão: a mais antiga em uso já terminou → libera a sala; rooms--, j++', en: 'Else: the oldest in-use meeting already ended → free that room; rooms--, j++' } },
    { indent: 1, text: { pt: 'maxRooms = max(maxRooms, rooms)', en: 'maxRooms = max(maxRooms, rooms)' } },
    { indent: 0, text: { pt: 'Retorna maxRooms', en: 'Return maxRooms' } },
  ],

  stepDistractors: [
    {
      indent: 1,
      text: { pt: 'Se starts[i] <= ends[j]: precisa de sala nova', en: 'If starts[i] <= ends[j]: needs a new room' },
      why: { pt: 'Isso conta a reunião que termina e a que começa no mesmo instante como simultâneas, violando a regra de que a sala fica livre exatamente quando a anterior termina.', en: 'This counts the ending meeting and the starting one as simultaneous, violating the rule that a room frees up at the exact instant the prior meeting ends.' },
    },
    {
      indent: 1,
      text: { pt: 'Se starts[i] < ends[j]: libera uma sala (rooms--)', en: 'If starts[i] < ends[j]: free a room (rooms--)' },
      why: { pt: 'Inverter as ações faz uma reunião que ainda se sobrepõe liberar uma sala em vez de ocupar uma, subestimando o número de salas.', en: 'Swapping the actions makes a meeting that still overlaps free a room instead of taking one, undercounting the rooms needed.' },
    },
    {
      indent: 0,
      text: { pt: 'Ordena os intervalos originais por início e varre com um heap mínimo de términos', en: 'Sort the original intervals by start and sweep with a min-heap of end times' },
      why: { pt: 'Também funciona, mas o heap é desnecessário aqui: dois arrays ordenados e dois ponteiros já bastam, sem custo de inserção/remoção em heap.', en: 'This also works, but a heap is unnecessary here: two sorted arrays and two pointers already suffice, with no heap push/pop overhead.' },
    },
  ],

  blanks: [
    { line: 1, token: 'return 0', options: ['return 1', 'return -1'] },
    { line: 2, token: 'iv[0]', options: ['iv[1]', 'iv.length'] },
    { line: 3, token: 'iv[1]', options: ['iv[0]', 'iv.length'] },
    { line: 9, token: '<', options: ['<=', '>'] },
    { line: 16, token: 'Math.max', options: ['Math.min', 'Math.abs'] },
  ],

  codeDistractors: [
    {
      code: '  if (starts[i] <= ends[j]) {',
      why: { pt: '`<=` trata um término e um início no mesmo instante como sobreposição; a sala deveria estar livre nesse exato momento.', en: '`<=` treats an end and a start at the same instant as overlapping; the room should be free at that exact moment.' },
    },
    {
      code: '    rooms = Math.max(rooms, maxRooms)',
      why: { pt: 'Troca o contador corrente pelo pico registrado; `rooms` deixa de refletir as salas em uso agora.', en: 'Swaps the running counter for the recorded peak; `rooms` stops reflecting the rooms in use right now.' },
    },
    {
      code: '  const starts = intervals.map((iv) => iv[1]).sort((a, b) => a - b)',
      why: { pt: 'Copia e cola `iv[1]` para `starts`; os horários de início passam a ser, na verdade, horários de término.', en: 'Copy-pastes `iv[1]` into `starts`; the "start" times are actually end times now.' },
    },
  ],

  bugs: [
    {
      id: 'empty-returns-minus-one',
      line: 1,
      code: '  if (intervals.length === 0) return -1',
      failsTest: 'empty_input',
      why: { pt: 'Sem reuniões, a resposta é 0 salas, não -1; -1 é o sentinela de "inalcançável" de problemas de grafo, não deste.', en: 'With no meetings, the answer is 0 rooms, not -1; -1 is the "unreachable" sentinel from graph problems, not this one.' },
      logLine: 1,
      logWhy: { pt: 'Logar o valor retornado nessa linha mostra -1 saindo direto para uma entrada vazia, antes de qualquer sort ou loop.', en: 'Logging the returned value on this line shows -1 coming straight out for an empty input, before any sort or loop runs.' },
    },
    {
      id: 'touching-uses-lte',
      line: 9,
      code: '    if (starts[i] <= ends[j]) {',
      failsTest: 'touching_meetings',
      why: { pt: 'Com `<=`, uma reunião que começa exatamente quando a anterior termina ainda conta como precisando de sala nova.', en: 'With `<=`, a meeting that starts exactly when the previous one ends still counts as needing a new room.' },
      logLine: 9,
      logWhy: { pt: 'Logar `starts[i]` e `ends[j]` nessa comparação mostra os dois valores iguais entrando no ramo "sala nova", quando deveriam liberar uma.', en: 'Logging `starts[i]` and `ends[j]` at this comparison shows the two equal values entering the "new room" branch when they should free one.' },
    },
    {
      id: 'rooms-starts-at-one',
      line: 4,
      code: '  let rooms = 1',
      failsTest: 'all_overlap',
      why: { pt: 'Começar com uma sala fantasma soma 1 a cada pico; com 3 reuniões totalmente sobrepostas o resultado vira 4 em vez de 3.', en: 'Starting with a phantom room adds 1 to every peak; with 3 fully overlapping meetings the result becomes 4 instead of 3.' },
      logLine: 4,
      logWhy: { pt: 'Logar `rooms` logo após a inicialização, antes do loop, mostra 1 em vez de 0.', en: 'Logging `rooms` right after initialization, before the loop, shows 1 instead of 0.' },
    },
    {
      id: 'free-branch-increments',
      line: 13,
      code: '      rooms++',
      failsTest: 'nested_and_sequential',
      why: { pt: 'Copiar/colar `rooms++` no ramo de liberação faz o contador só crescer; depois que as reuniões aninhadas terminam, as sequenciais somam salas que já deveriam ter sido liberadas.', en: 'Copy-pasting `rooms++` into the free branch makes the counter only grow; once the nested meetings end, the sequential ones keep adding rooms that should already be free.' },
      logLine: 13,
      logWhy: { pt: 'Logar `rooms` logo depois dessa linha a cada iteração mostra o contador subindo sem parar em vez de cair quando uma reunião termina.', en: 'Logging `rooms` right after this line each iteration shows the counter climbing nonstop instead of dropping when a meeting ends.' },
    },
  ],

  followUp: {
    task: { pt: 'Retorne a sala atribuída a cada reunião, não só a contagem.', en: 'Return the room assigned to each meeting.' },
    changeLines: [2, 3, 8, 9, 10, 13, 18],
    explanation: {
      pt: 'Em vez de separar `starts`/`ends` (linhas 2–3), ordene os índices originais das reuniões por horário de início, mantendo o índice. Troque o loop (linhas 8–9) por uma varredura dessas reuniões ordenadas com um heap mínimo de `{end, room}`: se o fim do topo do heap ≤ início atual, reuse essa sala (substitui a linha 13); senão, atribua uma sala nova (substitui a linha 10). Grave a sala por índice original e retorne esse array em vez de `maxRooms` (linha 18). A ideia de varrer em ordem de início não muda — só passa a carregar a identidade de cada reunião.',
      en: 'Instead of splitting into `starts`/`ends` (lines 2–3), sort the meetings\' original indexes by start time, keeping the index. Replace the loop (lines 8–9) with a sweep over those sorted meetings using a min-heap of `{end, room}`: if the heap top\'s end ≤ the current start, reuse that room (replaces line 13); otherwise assign a new room (replaces line 10). Record the room per original index and return that array instead of `maxRooms` (line 18). The start-order sweep itself is unchanged — it just now carries each meeting\'s identity.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'O que acontece quando uma reunião termina exatamente quando outra começa?', en: 'What happens when one meeting ends exactly when another starts?' }, reply: { pt: 'A sala fica livre no instante exato em que a reunião anterior termina.', en: 'A room is free at the exact time a prior meeting ends.' } },
    { kind: 'good', cost: 15, text: { pt: 'O que retorno se a lista de reuniões vier vazia?', en: 'What do I return if the meetings list is empty?' }, reply: { pt: 'Entrada vazia exige zero salas.', en: 'Empty input requires zero rooms.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Quantas reuniões podem existir no máximo?', en: 'How many meetings can there be at most?' }, reply: { pt: 'Está nas constraints: até 100.000.', en: 'It is in the constraints: up to 100,000.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Uma reunião pode ter início igual ao término (duração zero)?', en: 'Can a meeting have start equal to end (zero duration)?' }, reply: { pt: 'Não; as constraints garantem start < end.', en: 'No; the constraints guarantee start < end.' } },
    { kind: 'noise', cost: 30, text: { pt: 'As reuniões têm prioridade e não podem ser remanejadas?', en: 'Do meetings have priority and can they not be reshuffled?' }, reply: { pt: 'Não há prioridades; é só contar quantas salas são necessárias.', en: 'There are no priorities; it is only about counting rooms needed.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Preciso rotular as salas com nomes específicos?', en: 'Do I need to label the rooms with specific names?' }, reply: { pt: 'Não nesta versão; só o número mínimo.', en: 'Not in this version; just the minimum count.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'empty_input',
      text: { pt: 'Lista de reuniões vazia', en: 'Empty meetings list' },
      why: { pt: 'Sem reuniões não há sobreposição possível; a resposta é 0, não um sentinela de erro.', en: 'With no meetings there is no possible overlap; the answer is 0, not an error sentinel.' },
      followUp: { question: { pt: 'Quantas salas?', en: 'How many rooms?' }, options: ['0', '1', '-1'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'touching_meetings',
      text: { pt: 'Uma reunião termina exatamente quando a próxima começa', en: 'One meeting ends exactly when the next starts' },
      why: { pt: 'Testa a regra "sala livre no instante exato do término"; não deve contar como sobreposição.', en: 'Tests the "room free at the exact instant it ends" rule; it must not count as overlap.' },
      followUp: { question: { pt: 'Precisa de quantas salas?', en: 'How many rooms are needed?' }, options: ['1', '2'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'all_overlap',
      text: { pt: 'Todas as reuniões se sobrepõem no mesmo instante', en: 'All meetings overlap at the same instant' },
      why: { pt: 'O pico de concorrência é igual ao total de reuniões; testa se o contador parte do valor certo.', en: 'The concurrency peak equals the total number of meetings; tests whether the counter starts at the right value.' },
      followUp: { question: { pt: 'Com 3 reuniões todas ativas ao mesmo tempo, quantas salas?', en: 'With 3 meetings all active at once, how many rooms?' }, options: ['1', '3'], correct: 1 },
    },
    {
      relevant: true,
      concept: 'nested_and_sequential',
      text: { pt: 'Reuniões aninhadas seguidas de reuniões sequenciais', en: 'Nested meetings followed by sequential ones' },
      why: { pt: 'O pico de salas ocorre no meio da linha do tempo, não no início nem no fim; testa se o máximo é rastreado a cada passo.', en: 'The room peak happens in the middle of the timeline, not at the start or end; tests whether the max is tracked every step.' },
      followUp: { question: { pt: 'Onde ocorre o pico de salas?', en: 'Where does the room peak occur?' }, options: ['No início', 'No meio', 'No fim'], correct: 1 },
    },
    {
      relevant: false,
      text: { pt: 'Horários de início negativos', en: 'Negative start times' },
      why: { pt: 'As constraints garantem 0 <= start; não há caso negativo a tratar.', en: 'The constraints guarantee 0 <= start; there is no negative case to handle.' },
    },
    {
      relevant: false,
      text: { pt: 'Duas reuniões idênticas (mesmo início e fim) duplicadas', en: 'Two identical duplicate meetings (same start and end)' },
      why: { pt: 'Duplicatas são tratadas como qualquer sobreposição; o algoritmo não precisa de caso especial.', en: 'Duplicates are handled like any other overlap; the algorithm needs no special case.' },
    },
    {
      relevant: false,
      text: { pt: 'Reuniões chegam fora de ordem na entrada', en: 'Meetings arrive out of order in the input' },
      why: { pt: 'O algoritmo ordena explicitamente; a ordem de entrada nunca importa.', en: 'The algorithm sorts explicitly; input order never matters.' },
    },
  ],

  pattern: {
    correct: 'sort-intervals',
    distractors: ['sweep-line', 'heap', 'two-pointers'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Ordenar starts e ends separadamente, varrer com dois ponteiros', en: 'Sort starts and ends separately, sweep with two pointers' },
      time: 'O(n log n)',
      space: 'O(n)',
      why: { pt: 'O sort domina o custo; a varredura com dois ponteiros depois é O(n). Para 100k reuniões isso roda bem dentro do limite.', en: 'The sort dominates the cost; the two-pointer sweep afterward is O(n). For 100k meetings this comfortably fits the time limit.' },
    },
    {
      chosen: false,
      name: { pt: 'Heap mínimo de términos, processando reuniões ordenadas por início', en: 'Min-heap of end times, processing meetings sorted by start' },
      time: 'O(n log n)',
      space: 'O(n)',
      why: { pt: 'Mesma complexidade e também correto; é a base natural do follow-up de atribuir salas, mas aqui o heap só adiciona overhead sem ganho.', en: 'Same complexity and also correct; it is the natural base for the room-assignment follow-up, but here the heap only adds overhead with no gain.' },
    },
    {
      chosen: false,
      name: { pt: 'Comparar cada par de reuniões por sobreposição', en: 'Compare every pair of meetings for overlap' },
      time: 'O(n^2)',
      space: 'O(1)',
      why: { pt: 'Com até 100k reuniões, O(n^2) explode muito além do limite de 2 segundos; a complexidade esperada é O(n log n), não quadrática.', en: 'With up to 100k meetings, O(n^2) blows far past the 2-second limit; the expected complexity is O(n log n), not quadratic.' },
    },
  ],
}

export default content
