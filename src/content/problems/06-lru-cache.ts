import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 class LRUCache {                     12 return value
//  1   capacity: number                   13 }
//  2   map: Map<number, number>           14 put(key, value): void {
//  3   constructor(capacity) {            15   if (this.map.has(key)) {
//  4     this.capacity = capacity          16     this.map.delete(key)
//  5     this.map = new Map()              17   } else if (this.map.size >= this.capacity) {
//  6   }                                   18     const oldest = this.map.keys().next().value
//  7   get(key): number {                 19     this.map.delete(oldest)
//  8     if (!this.map.has(key)) return -1  20   }
//  9     const value = this.map.get(key)!   21   if (this.capacity > 0) this.map.set(key, value)
// 10     this.map.delete(key)                22 }
// 11     this.map.set(key, value)             23 }

const content: ProblemContent = {
  id: 6,
  source: `class LRUCache {
  capacity: number
  map: Map<number, number>
  constructor(capacity: number) {
    this.capacity = capacity
    this.map = new Map<number, number>()
  }
  get(key: number): number {
    if (!this.map.has(key)) return -1
    const value = this.map.get(key)!
    this.map.delete(key)
    this.map.set(key, value)
    return value
  }
  put(key: number, value: number): void {
    if (this.map.has(key)) {
      this.map.delete(key)
    } else if (this.map.size >= this.capacity) {
      const oldest = this.map.keys().next().value
      this.map.delete(oldest)
    }
    if (this.capacity > 0) this.map.set(key, value)
  }
}`,

  steps: [
    { indent: 0, text: { pt: 'constructor: guarda capacity e cria this.map como um Map vazio', en: 'constructor: store capacity and create this.map as an empty Map' } },
    { indent: 0, text: { pt: 'get(key):', en: 'get(key):' } },
    { indent: 1, text: { pt: 'Se a chave não existe no Map, retorna -1', en: 'If the key does not exist in the Map, return -1' } },
    { indent: 1, text: { pt: 'Lê value = map.get(key)', en: 'Read value = map.get(key)' } },
    { indent: 1, text: { pt: 'Remove a chave e reinsere com o mesmo valor (ela passa a ser a mais recente, pois Map preserva ordem de inserção)', en: 'Delete the key and re-insert it with the same value (it becomes the most recent, since Map preserves insertion order)' } },
    { indent: 1, text: { pt: 'Retorna value', en: 'Return value' } },
    { indent: 0, text: { pt: 'put(key, value):', en: 'put(key, value):' } },
    { indent: 1, text: { pt: 'Se a chave já existe no Map: remove a entrada antiga dela', en: 'If the key already exists in the Map: delete its old entry' } },
    { indent: 1, text: { pt: 'Senão, se map.size já alcançou capacity: remove a entrada mais antiga (map.keys().next().value)', en: 'Otherwise, if map.size has already reached capacity: remove the oldest entry (map.keys().next().value)' } },
    { indent: 1, text: { pt: 'Se capacity > 0: insere key com value (entra como a mais recente)', en: 'If capacity > 0: insert key with value (it enters as the most recent)' } },
  ],

  stepDistractors: [
    {
      indent: 1,
      text: { pt: 'Em get, só retorna value sem remover/reinserir a chave', en: 'In get, just return value without deleting/re-inserting the key' },
      why: { pt: 'Sem mover a chave para o fim do Map, ela continua marcada como a mais ANTIGA; uma eviction futura pode descartá-la mesmo tendo sido usada agora.', en: 'Without moving the key to the end of the Map, it stays marked as the OLDEST; a future eviction can discard it even though it was just used.' },
    },
    {
      indent: 1,
      text: { pt: 'Em put, se a chave já existe, soma o novo valor ao valor antigo', en: 'In put, if the key already exists, add the new value to the old one' },
      why: { pt: 'put deve SUBSTITUIR o valor armazenado, não acumular; a chave existente só precisa ser atualizada e marcada como recente.', en: 'put must REPLACE the stored value, not accumulate; an existing key only needs to be updated and marked recent.' },
    },
    {
      indent: 1,
      text: { pt: 'Remove a entrada mais antiga usando map.values().next().value', en: 'Remove the oldest entry using map.values().next().value' },
      why: { pt: 'Isso pega o VALOR da entrada mais antiga, não a CHAVE; map.delete precisa receber a chave para funcionar.', en: 'This grabs the VALUE of the oldest entry, not the KEY; map.delete needs the key to work.' },
    },
  ],

  blanks: [
    { line: 8, token: '!this.map.has(key)', options: ['this.map.has(key)', 'this.map.size === 0'] },
    { line: 17, token: '>=', options: ['<=', '>'] },
    { line: 18, token: '.keys().next().value', options: ['.values().next().value', '.entries().next().value'] },
    { line: 21, token: 'this.capacity > 0', options: ['this.capacity >= 0', 'this.map.size > 0'] },
    { line: 10, token: 'this.map.delete(key)', options: ['this.map.clear()', 'this.map.delete(value)'] },
  ],

  codeDistractors: [
    {
      code: '  } else if (this.map.size > this.capacity) {',
      why: { pt: 'Com `>`, a eviction só acontece depois de já estourar a capacidade em 1; o cache fica temporariamente maior do que deveria.', en: 'With `>`, eviction only happens after capacity has already been exceeded by 1; the cache temporarily grows larger than it should.' },
    },
    {
      code: '    this.map.delete(this.map.size)',
      why: { pt: '`size` é um número de controle do Map, não uma chave armazenada; isso tenta apagar uma entrada que quase certamente não existe.', en: '`size` is the Map\'s own bookkeeping number, not a stored key; this tries to delete an entry that almost certainly does not exist.' },
    },
    {
      code: '  get(key: number): number { return this.map.get(key) ?? -1 }',
      why: { pt: 'Resolve a chave ausente com ??, mas nunca marca a chave encontrada como recentemente usada; a recência para de ser atualizada em get.', en: 'Handles the missing key with ??, but never marks the found key as recently used; recency stops being updated on get.' },
    },
  ],

  bugs: [
    {
      id: 'ignores-zero-capacity',
      line: 21,
      code: '    this.map.set(key, value)',
      failsTest: 'zero_capacity',
      why: { pt: 'Remove a checagem de capacity > 0; com capacity 0 o Map passa a aceitar uma entrada mesmo que o cache devesse ficar sempre vazio.', en: 'Removes the capacity > 0 guard; with capacity 0 the Map ends up accepting an entry even though the cache should always stay empty.' },
      logLine: 21,
      logWhy: { pt: 'Logar this.capacity e this.map.size nessa linha mostra capacity=0 mas size=1 depois do put, o que nunca deveria acontecer.', en: 'Logging this.capacity and this.map.size here shows capacity=0 but size=1 after the put, which should never happen.' },
    },
    {
      id: 'strict-capacity-check',
      line: 17,
      code: '  } else if (this.map.size > this.capacity) {',
      failsTest: 'capacity_one',
      why: { pt: 'Com `>` em vez de `>=`, o cache só evict depois de já ter estourado a capacidade; com capacity 1, duas chaves acabam convivendo no Map ao mesmo tempo.', en: 'With `>` instead of `>=`, the cache only evicts after already exceeding capacity; with capacity 1, two keys end up coexisting in the Map at once.' },
      logLine: 17,
      logWhy: { pt: 'Logar this.map.size e this.capacity nessa linha, ao inserir a segunda chave, mostra size=1, capacity=1, e a condição ainda dá falso.', en: 'Logging this.map.size and this.capacity here, when inserting the second key, shows size=1, capacity=1, and the condition still comes out false.' },
    },
    {
      id: 'get-does-not-refresh',
      line: 10,
      code: '    this.map.get(key)',
      failsTest: 'get_refreshes_recency',
      why: { pt: 'Troca o delete pela mesma leitura de novo; o set seguinte numa chave já existente NÃO move sua posição no Map, então a chave continua marcada como antiga mesmo depois do get.', en: 'Swaps the delete for the same read again; the following set on an already-existing key does NOT move its position in the Map, so the key stays marked as old even after the get.' },
      logLine: 11,
      logWhy: { pt: 'Logar a ordem das chaves do Map (Array.from(this.map.keys())) antes e depois do get mostra que ela não muda.', en: 'Logging the Map\'s key order (Array.from(this.map.keys())) before and after the get shows it does not change.' },
    },
    {
      id: 'skip-update-on-existing',
      line: 16,
      code: '      return',
      failsTest: 'update_existing',
      why: { pt: 'Sai da função assim que vê que a chave já existe, sem nunca chegar à linha que de fato grava o novo valor; put(1,9) sobre uma chave já existente deixa de atualizar nada.', en: 'Exits the function as soon as it sees the key already exists, never reaching the line that actually stores the new value; put(1,9) on an already-existing key ends up updating nothing.' },
      logLine: 16,
      logWhy: { pt: 'Logar quando esse ramo é tomado mostra que, para a chave repetida, a função retorna aqui sem nunca chamar map.set com o valor novo.', en: 'Logging when this branch is taken shows that, for the repeated key, the function returns here without ever calling map.set with the new value.' },
    },
  ],

  followUp: {
    task: { pt: 'Adicione um TTL — entradas expiram `t` segundos depois do último put (o clock é injetado).', en: 'Add a TTL — entries expire `t` seconds after their last put (clock is injected).' },
    changeLines: [1, 3, 8, 14, 21],
    explanation: {
      pt: 'Acrescenta um campo (linha 1) `expiry: Map<number, number>` e o constructor (linha 3) passa a receber `clock: () => number` e `t: number` além de capacity. Em get (linha 8), antes de checar has(key), confere se clock() já passou de expiry.get(key); se passou, trata como ausente e remove a chave. Em put (linha 14 em diante), ao inserir o valor (linha 21) também grava expiry.set(key, clock() + t). A lógica de recência do Map continua a mesma.',
      en: 'Add a field (line 1) `expiry: Map<number, number>`, and the constructor (line 3) now also takes `clock: () => number` and `t: number` besides capacity. In get (line 8), before checking has(key), check whether clock() has already passed expiry.get(key); if so, treat it as missing and remove the key. In put (line 14 onward), when inserting the value (line 21) also record expiry.set(key, clock() + t). The Map\'s recency logic stays exactly the same.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'O que get() retorna para uma chave que não existe?', en: 'What does get() return for a key that does not exist?' }, reply: { pt: '-1.', en: '-1.' } },
    { kind: 'good', cost: 20, text: { pt: 'put() numa chave que já existe atualiza a recência dela?', en: 'Does put() on an already-existing key refresh its recency?' }, reply: { pt: 'Sim, atualizar uma chave existente também marca ela como recentemente usada.', en: 'Yes, updating an existing key also marks it as recently used.' } },
    { kind: 'good', cost: 20, text: { pt: 'capacity pode ser 0?', en: 'Can capacity be zero?' }, reply: { pt: 'Sim; nesse caso o cache nunca guarda nada e get sempre retorna -1.', en: 'Yes; in that case the cache never stores anything and get always returns -1.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Quantas operações no máximo?', en: 'How many operations at most?' }, reply: { pt: 'Está nas constraints: até 200000.', en: 'It is in the constraints: up to 200000.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Chaves e valores cabem em inteiro de 32 bits?', en: 'Do keys and values fit in a 32-bit integer?' }, reply: { pt: 'Está nas constraints: sim.', en: 'It is in the constraints: yes.' } },
    { kind: 'noise', cost: 30, text: { pt: 'O cache precisa persistir em disco entre execuções?', en: 'Does the cache need to persist to disk across runs?' }, reply: { pt: 'Não; é uma estrutura só em memória.', en: 'No; it is an in-memory structure only.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Nesta fase o cache precisa ser thread-safe?', en: 'Does the cache need to be thread-safe at this stage?' }, reply: { pt: 'Não para esta versão; isso fica para a conversa de design, não para o código agora.', en: 'Not for this version; that is for the design discussion, not for the code right now.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'capacity_one',
      text: { pt: 'O cache tem capacidade para guardar só uma chave', en: 'The cache has capacity for only a single key' },
      why: { pt: 'Toda nova chave, exceto a primeira, dispara uma eviction imediata; é o caso mais simples onde um off-by-one no limite se revela.', en: 'Every new key except the first triggers an immediate eviction; it is the simplest case where an off-by-one in the limit shows up.' },
      followUp: { question: { pt: 'Depois de put(1,1) e put(2,2), get(1) retorna...', en: 'After put(1,1) and put(2,2), get(1) returns...' }, options: ['-1', '1', '2'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'update_existing',
      text: { pt: 'put() é chamado numa chave que já existe no cache', en: 'put() is called on a key that already exists in the cache' },
      why: { pt: 'Precisa trocar o valor armazenado E marcar a chave como recentemente usada, sem contar como uma inserção nova (não deve disparar eviction).', en: 'Must replace the stored value AND mark the key as recently used, without counting as a new insertion (it must not trigger an eviction).' },
      followUp: { question: { pt: 'put(1,1) depois put(1,9); get(1) retorna...', en: 'put(1,1) then put(1,9); get(1) returns...' }, options: ['9', '1', '10'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'get_refreshes_recency',
      text: { pt: 'Um get() no meio da sequência deveria salvar uma chave de ser removida depois', en: 'A get() in the middle of the sequence should save a key from being evicted later' },
      why: { pt: 'Testa se get() de fato reordena a chave para "mais recente", e não só devolve o valor sem efeito colateral.', en: 'Tests whether get() actually reorders the key to "most recent", not just returns the value with no side effect.' },
      followUp: { question: { pt: 'put(1,1),put(2,2),get(1),put(3,3) com capacity 2: get(2) depois retorna...', en: 'put(1,1),put(2,2),get(1),put(3,3) with capacity 2: get(2) afterwards returns...' }, options: ['-1', '2', '1'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'zero_capacity',
      text: { pt: 'capacity é 0 desde o início', en: 'capacity is 0 from the start' },
      why: { pt: 'A condição map.size >= capacity já é verdadeira (0 >= 0) antes de qualquer put; precisa impedir a inserção em vez de evict uma entrada que não existe.', en: 'The condition map.size >= capacity is already true (0 >= 0) before any put; it must prevent the insertion rather than evict a nonexistent entry.' },
      followUp: { question: { pt: 'put(1,1) depois get(1) com capacity 0: get(1) retorna...', en: 'put(1,1) then get(1) with capacity 0: get(1) returns...' }, options: ['-1', '1', 'lança erro'], correct: 0 },
    },
    {
      relevant: false,
      text: { pt: 'Chaves ou valores negativos', en: 'Negative keys or values' },
      why: { pt: 'As constraints só falam de inteiros de 32 bits; o sinal não importa para um Map usado como estrutura de chave-valor.', en: 'The constraints only mention 32-bit integers; the sign does not matter for a Map used as a key-value structure.' },
    },
    {
      relevant: false,
      text: { pt: 'Valores repetidos em chaves diferentes', en: 'Repeated values across different keys' },
      why: { pt: 'Só as CHAVES precisam ser únicas no cache; valores podem se repetir livremente sem afetar a lógica de LRU.', en: 'Only the KEYS need to be unique in the cache; values can repeat freely without affecting the LRU logic.' },
    },
    {
      relevant: false,
      text: { pt: 'Mais de 200000 operações na mesma execução', en: 'More than 200000 operations in the same run' },
      why: { pt: 'As constraints limitam a 200000 operações; não é um caso que o código precisa tratar.', en: 'The constraints cap it at 200000 operations; it is not a case the code needs to handle.' },
    },
  ],

  pattern: {
    correct: 'hash-map-linked-list',
    distractors: ['queue-window', 'heap', 'binary-search'],
  },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Map nativo (preserva ordem de inserção) + delete/set para mover a chave', en: 'Native Map (preserves insertion order) + delete/set to move the key' },
      time: 'O(1) esperado por operação',
      space: 'O(capacity)',
      why: { pt: 'Map do JS já mantém ordem de inserção e dá get/set/delete em O(1) esperado; delete seguido de set move a chave para o fim sem precisar implementar nós manualmente.', en: 'JS Map already maintains insertion order and gives O(1) expected get/set/delete; delete followed by set moves the key to the end without hand-rolling any nodes.' },
    },
    {
      chosen: false,
      name: { pt: 'Array ordenado por uso, com busca e deslocamento lineares', en: 'Array ordered by usage, with linear search and shifting' },
      time: 'O(capacity) por operação',
      space: 'O(capacity)',
      why: { pt: 'O fixture de performance rejeita exatamente esse padrão: scan de lista ou shift de array por operação, que não escala para 200000 operações.', en: 'The performance fixture rejects exactly this pattern: a list scan or array shift per operation, which does not scale to 200000 operations.' },
    },
    {
      chosen: false,
      name: { pt: 'Hash map + lista duplamente ligada implementada manualmente', en: 'Hash map + a hand-rolled doubly linked list' },
      time: 'O(1) por operação',
      space: 'O(capacity)',
      why: { pt: 'Mesma complexidade do Map nativo, mas exige escrever e manter nós, ponteiros prev/next e a lógica de mover nó para a cauda à mão — o Map do JS já garante essa mesma garantia de ordem de forma pronta.', en: 'Same complexity as the native Map, but requires writing and maintaining nodes, prev/next pointers, and the move-to-tail logic by hand — JS\'s Map already provides that same ordering guarantee out of the box.' },
    },
  ],
}

export default content
