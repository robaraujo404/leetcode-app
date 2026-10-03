import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 class MyCalendar {                    15 return true
//  1   root: any                           16 }
//  2   constructor() {                     17 node = node.left
//  3     this.root = null                  18 } else if (start >= node.end) {
//  4   }                                    19 if (node.right === null) {
//  5   book(start, end): boolean {          20 node.right = { ... }
//  6     if (this.root === null) {          21 return true
//  7       this.root = { ... }              22 }
//  8       return true                      23 node = node.right
//  9     }                                  24 } else {
// 10     let node = this.root               25 return false
// 11     while (true) {                     26 }
// 12       if (end <= node.start) {         27 }
// 13         if (node.left === null) {      28 }
// 14           node.left = { ... }          29 }

const content: ProblemContent = {
  id: 3,
  source: `class MyCalendar {
  root: any
  constructor() {
    this.root = null
  }
  book(start: number, end: number): boolean {
    if (this.root === null) {
      this.root = { start, end, left: null, right: null }
      return true
    }
    let node = this.root
    while (true) {
      if (end <= node.start) {
        if (node.left === null) {
          node.left = { start, end, left: null, right: null }
          return true
        }
        node = node.left
      } else if (start >= node.end) {
        if (node.right === null) {
          node.right = { start, end, left: null, right: null }
          return true
        }
        node = node.right
      } else {
        return false
      }
    }
  }
}`,

  steps: [
    { indent: 0, text: { pt: 'Se ainda não há raiz, cria o nó raiz com [start, end) e aceita', en: 'If there is no root yet, create the root node from [start, end) and accept' } },
    { indent: 0, text: { pt: 'Senão, começa a busca a partir da raiz', en: 'Otherwise, start the search from the root' } },
    { indent: 0, text: { pt: 'Enquanto verdadeiro:', en: 'While true:' } },
    { indent: 1, text: { pt: 'Se end <= node.start: o novo intervalo cabe à esquerda', en: 'If end <= node.start: the new interval fits to the left' } },
    { indent: 2, text: { pt: 'Se não há filho esquerdo, cria o nó ali e aceita', en: 'If there is no left child, create the node there and accept' } },
    { indent: 2, text: { pt: 'Senão, desce para o filho esquerdo e repete', en: 'Otherwise, descend into the left child and repeat' } },
    { indent: 1, text: { pt: 'Senão, se start >= node.end: o novo intervalo cabe à direita', en: 'Otherwise, if start >= node.end: the new interval fits to the right' } },
    { indent: 2, text: { pt: 'Se não há filho direito, cria o nó ali e aceita', en: 'If there is no right child, create the node there and accept' } },
    { indent: 2, text: { pt: 'Senão, desce para o filho direito e repete', en: 'Otherwise, descend into the right child and repeat' } },
    { indent: 1, text: { pt: 'Senão: os dois intervalos se sobrepõem, rejeita', en: 'Otherwise: the two intervals overlap, reject' } },
  ],

  stepDistractors: [
    {
      indent: 2,
      text: { pt: 'Se não há filho esquerdo, substitui a raiz inteira pelo novo nó', en: 'If there is no left child, replace the entire root with the new node' },
      why: { pt: 'Substituir a raiz descarta todas as reservas já aceitas; o novo intervalo precisa entrar como FILHO, não como raiz.', en: 'Replacing the root discards every booking already accepted; the new interval must enter as a CHILD, not as the root.' },
    },
    {
      indent: 1,
      text: { pt: 'Se end <= node.end: o novo intervalo cabe à esquerda', en: 'If end <= node.end: the new interval fits to the left' },
      why: { pt: 'Compara com node.end em vez de node.start; isso aceitaria reservas que na verdade começam dentro do intervalo já guardado.', en: 'Compares against node.end instead of node.start; this would accept bookings that actually start inside the already-stored interval.' },
    },
    {
      indent: 0,
      text: { pt: 'Antes de cada book(), ordena todas as reservas já aceitas', en: 'Before each book(), sort all already-accepted bookings' },
      why: { pt: 'Não existe uma lista para ordenar: as reservas já estão organizadas pela própria árvore, e cada book() precisa responder de imediato.', en: 'There is no list to sort: bookings are already organized by the tree itself, and each book() must answer immediately.' },
    },
  ],

  blanks: [
    { line: 12, token: '<=', options: ['>=', '<'] },
    { line: 18, token: '>=', options: ['<=', '>'] },
    { line: 25, token: 'false', options: ['true', 'null'] },
    { line: 7, token: 'left: null, right: null', options: ['left: undefined, right: undefined', 'left: node, right: node'] },
    { line: 10, token: 'this.root', options: ['this.root.left', 'null'] },
  ],

  codeDistractors: [
    {
      code: '      if (end < node.start) {',
      why: { pt: 'Com `<` estrito, dois intervalos que só se tocam (end igual ao start do outro) seriam tratados como sobreposição e rejeitados.', en: 'With a strict `<`, two intervals that merely touch (end equal to the other\'s start) would be treated as overlapping and rejected.' },
    },
    {
      code: '    } else if (start > node.start) {',
      why: { pt: 'Compara com o start do próprio nó em vez do end; ignora o tamanho real do intervalo guardado e aceita reservas que caem no meio dele.', en: 'Compares against the node\'s own start instead of its end; ignores the stored interval\'s real length and accepts bookings that fall inside it.' },
    },
    {
      code: '      this.root = { start, end }',
      why: { pt: 'Sem `left`/`right`, a próxima inserção que precisar descer por esse nó lê undefined em vez de null e quebra a busca.', en: 'Without `left`/`right`, the next insertion that needs to walk through this node reads undefined instead of null and breaks the search.' },
    },
  ],

  bugs: [
    {
      id: 'strict-right-boundary',
      line: 18,
      code: '    } else if (start > node.end) {',
      failsTest: 'touching_intervals',
      why: { pt: 'Com `>` estrito, um intervalo que começa exatamente onde o outro termina (start === node.end) cai no `else` e é rejeitado, mas intervalos que só se tocam não se sobrepõem.', en: 'With a strict `>`, an interval that starts exactly where the other ends (start === node.end) falls into the `else` and is rejected, but merely-touching intervals do not overlap.' },
      logLine: 18,
      logWhy: { pt: 'Logar start e node.end nessa linha mostra 20 e 20: a condição deveria ser verdadeira (tocam, não sobrepõem) mas com `>` dá falso.', en: 'Logging start and node.end here shows 20 and 20: the condition should be true (touching, not overlapping) but with `>` it is false.' },
    },
    {
      id: 'always-accept-overlap',
      line: 25,
      code: '        return true',
      failsTest: 'nested_overlap',
      why: { pt: 'Troca o retorno de rejeição por aceitação: qualquer sobreposição real passa a ser aceita, inclusive um intervalo inteiramente contido em outro.', en: 'Swaps the rejection return for acceptance: any real overlap now gets accepted, including an interval entirely nested inside another.' },
      logLine: 25,
      logWhy: { pt: 'Logar quando o código chega nesse `else` mostra que ele é alcançado para [15,20) dentro de [10,30), mas o retorno não rejeita.', en: 'Logging whenever the code reaches this `else` shows it is reached for [15,20) inside [10,30), but the return does not reject.' },
    },
    {
      id: 'inverted-right-boundary',
      line: 18,
      code: '    } else if (start <= node.end) {',
      failsTest: 'gap_booking',
      why: { pt: 'Inverte a direção da comparação: uma reserva que de fato cabe à direita (start bem maior que node.end) ainda pode cair num `else` incorreto mais adiante na árvore, rejeitando um intervalo em um buraco válido.', en: 'Flips the comparison direction: a booking that genuinely fits to the right (start well past node.end) can still fall into the wrong `else` further down the tree, rejecting an interval that fits a valid gap.' },
      logLine: 18,
      logWhy: { pt: 'Logar start, node.end e qual ramo foi tomado mostra a segunda reserva de gap_booking caindo no ramo errado.', en: 'Logging start, node.end and which branch was taken shows gap_booking\'s second call falling into the wrong branch.' },
    },
  ],

  followUp: {
    task: { pt: 'Agora atribua uma de N salas, não só aceite/rejeite.', en: 'Now assign one of N rooms, not just accept/reject.' },
    changeLines: [1, 2, 3, 6],
    explanation: {
      pt: 'Troca o campo único `root` (linha 1) por um array `roots: any[]` de tamanho N, inicializado no constructor (linhas 2-3). book() reaproveita exatamente a mesma busca em árvore de hoje, mas tentando cada `roots[i]` em ordem (a checagem de raiz vazia da linha 6 passa a rodar por sala); a primeira sala que aceitar o intervalo retorna seu índice, e se nenhuma aceitar retorna -1. A lógica de comparação start/end dentro da árvore não muda nada.',
      en: 'Replace the single `root` field (line 1) with an array `roots: any[]` of size N, initialized in the constructor (lines 2-3). book() reuses the exact same tree search as today, but tries each `roots[i]` in order (the empty-root check on line 6 now runs per room); the first room that accepts the interval returns its index, and if none accept it returns -1. The start/end comparison logic inside the tree does not change at all.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'Os intervalos são fechados ou meio-abertos?', en: 'Are intervals closed or half-open?' }, reply: { pt: 'Meio-abertos: [start, end).', en: 'Half-open: [start, end).' } },
    { kind: 'good', cost: 20, text: { pt: 'Dois intervalos que só se tocam (um termina onde o outro começa) contam como sobreposição?', en: 'Do two intervals that merely touch (one ends where the other starts) count as overlapping?' }, reply: { pt: 'Não; intervalos que só se tocam não se sobrepõem.', en: 'No; touching intervals do not overlap.' } },
    { kind: 'good', cost: 20, text: { pt: 'Pode haver pedidos de reserva duplicados?', en: 'Can there be duplicate booking requests?' }, reply: { pt: 'Sim, duplicatas são possíveis e devem ser rejeitadas como qualquer sobreposição.', en: 'Yes, duplicates are possible and should be rejected like any overlap.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Qual o intervalo de valores de start e end?', en: 'What is the range of start and end values?' }, reply: { pt: 'Está nas constraints: 0 <= start < end <= 10^9.', en: 'It is in the constraints: 0 <= start < end <= 10^9.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Quantas chamadas de book() no máximo?', en: 'How many book() calls at most?' }, reply: { pt: 'Está nas constraints: até 100000.', en: 'It is in the constraints: up to 100000.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Preciso guardar um nome ou ID para cada reserva?', en: 'Do I need to store a name or ID for each booking?' }, reply: { pt: 'Não; book() só retorna true/false.', en: 'No; book() only returns true/false.' } },
    { kind: 'noise', cost: 30, text: { pt: 'As reservas têm fuso horário?', en: 'Do bookings have a timezone?' }, reply: { pt: 'Irrelevante: start e end são só números inteiros.', en: 'Irrelevant: start and end are just plain integers.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'touching_intervals',
      text: { pt: 'Uma reserva termina exatamente onde a próxima começa', en: 'One booking ends exactly where the next one starts' },
      why: { pt: 'O limite compartilhado não deve ser tratado como sobreposição; precisa de >= / <= nos dois lados, não < / > estritos.', en: 'The shared boundary must not be treated as overlap; it needs >= / <= on both sides, not strict < / >.' },
      followUp: { question: { pt: 'book(20,30) depois de book(10,20): aceita?', en: 'book(20,30) after book(10,20): accepted?' }, options: ['Sim', 'Não', 'Depende da ordem'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'nested_overlap',
      text: { pt: 'Uma reserva cabe inteira dentro de outra já aceita', en: 'A booking fits entirely inside one already accepted' },
      why: { pt: 'Não basta comparar só os starts; mesmo um intervalo totalmente contido precisa cair no ramo "else" de rejeição.', en: 'Comparing only the starts is not enough; even a fully contained interval must fall into the rejecting "else" branch.' },
      followUp: { question: { pt: 'book(15,20) depois de book(10,30): aceita?', en: 'book(15,20) after book(10,30): accepted?' }, options: ['Não', 'Sim', 'Só se for idêntico'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'same_interval_twice',
      text: { pt: 'O mesmo pedido de reserva chega duas vezes', en: 'The exact same booking request arrives twice' },
      why: { pt: 'É só um caso particular de sobreposição; a segunda chamada deve ser rejeitada mesmo sendo idêntica à primeira.', en: 'It is just a special case of overlap; the second call must be rejected even though it is identical to the first.' },
      followUp: { question: { pt: 'A segunda chamada idêntica é aceita?', en: 'Is the second, identical call accepted?' }, options: ['Não', 'Sim', 'Só a terceira em diante'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'gap_booking',
      text: { pt: 'Uma nova reserva cabe exatamente no buraco entre duas já aceitas', en: 'A new booking fits exactly in the gap between two already accepted' },
      why: { pt: 'Exercita descer os dois ramos da árvore (direita, depois esquerda) até achar um nó vazio.', en: 'Exercises descending both branches of the tree (right, then left) until finding an empty node.' },
      followUp: { question: { pt: 'Quantos nós a busca visita antes de inserir?', en: 'How many nodes does the search visit before inserting?' }, options: ['Mais de um', 'Sempre só a raiz', 'Sempre todos os nós'], correct: 0 },
    },
    {
      relevant: false,
      text: { pt: 'start igual a 0', en: 'start equal to 0' },
      why: { pt: 'As constraints já permitem start = 0; a árvore trata isso como qualquer outro inteiro.', en: 'The constraints already allow start = 0; the tree treats it like any other integer.' },
    },
    {
      relevant: false,
      text: { pt: 'start igual a end', en: 'start equal to end' },
      why: { pt: 'As constraints garantem start < end estritamente; esse caso nunca chega como entrada.', en: 'The constraints guarantee start < end strictly; this case never arrives as input.' },
    },
    {
      relevant: false,
      text: { pt: 'Mais de 100000 chamadas de book()', en: 'More than 100000 book() calls' },
      why: { pt: 'As constraints limitam a 100000 chamadas; não é um caso a tratar no código.', en: 'The constraints cap it at 100000 calls; it is not a case to handle in code.' },
    },
  ],

  pattern: {
    correct: 'binary-search',
    distractors: ['sort-intervals', 'sweep-line', 'heap'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Árvore binária de busca não balanceada, um nó por reserva', en: 'Unbalanced binary search tree, one node per booking' },
      time: 'O(log n) esperado por chamada (starts aleatórios mantêm a árvore rasa); O(n) no pior caso adversarial',
      space: 'O(n)',
      why: { pt: 'Cada comparação corta a busca pela metade do intervalo coberto por um nó; com entradas aleatórias a árvore fica balanceada na prática.', en: 'Each comparison cuts the search by the interval a node covers; with random input the tree stays balanced in practice.' },
    },
    {
      chosen: false,
      name: { pt: 'Escanear todos os intervalos já aceitos a cada chamada', en: 'Scan every already-accepted interval on each call' },
      time: 'O(n) por chamada, O(n²) no total',
      space: 'O(n)',
      why: { pt: 'Com 100000 reservas isso dá 10^10 comparações — o fixture de performance rejeita exatamente esse padrão de scan completo.', en: 'With 100000 bookings this gives 10^10 comparisons — the performance fixture rejects exactly this full-scan pattern.' },
    },
    {
      chosen: false,
      name: { pt: 'Array ordenado por start + busca binária para checar conflito, splice para inserir', en: 'Array sorted by start + binary search to check conflicts, splice to insert' },
      time: 'Busca binária O(log n), mas splice desloca elementos: O(n) por inserção, O(n²) no total',
      space: 'O(n)',
      why: { pt: 'A busca parece rápida, mas inserir num array ordenado ainda custa O(n) por deslocamento; cai na mesma classe de complexidade do scan completo.', en: 'The lookup looks fast, but inserting into a sorted array still costs O(n) to shift elements; it falls into the same complexity class as the full scan.' },
    },
  ],
}

export default content
