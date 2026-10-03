import type { ProblemContent } from '../schema'

// Line numbers (0-based) used below refer to `source.split('\n')`:
//  0 class FileSystem {
//  1   root: { children: Map<string, any>; content: string | null }
//  2   constructor() {
//  3     this.root = { children: new Map(), content: null }
//  4   }
//  5   resolve(path, create) {
//  6     const parts = path.split('/').filter((p) => p.length > 0)
//  7     let node = this.root
//  8     for (const part of parts) {
//  9       if (!node.children.has(part)) {
// 10         if (!create) return null
// 11         node.children.set(part, { children: new Map(), content: null })
// 12       }
// 13       node = node.children.get(part)
// 14     }
// 15     return node
// 16   }
// 17   mkdir(path) {
// 18     this.resolve(path, true)
// 19   }
// 20   addContentToFile(path, content) {
// 21     const node = this.resolve(path, true)
// 22     node.content = (node.content ?? '') + content
// 23   }
// 24   readContentFromFile(path) {
// 25     return this.resolve(path, false).content
// 26   }
// 27   ls(path) {
// 28     const node = this.resolve(path, false)
// 29     if (node.content !== null) {
// 30       const parts = path.split('/').filter((p) => p.length > 0)
// 31       return [parts[parts.length - 1]]
// 32     }
// 33     return [...node.children.keys()].sort()
// 34   }
// 35 }

const content: ProblemContent = {
  id: 20,
  source: `class FileSystem {
  root: { children: Map<string, any>; content: string | null }
  constructor() {
    this.root = { children: new Map(), content: null }
  }
  resolve(path: string, create: boolean): any {
    const parts = path.split('/').filter((p) => p.length > 0)
    let node = this.root
    for (const part of parts) {
      if (!node.children.has(part)) {
        if (!create) return null
        node.children.set(part, { children: new Map(), content: null })
      }
      node = node.children.get(part)
    }
    return node
  }
  mkdir(path: string): void {
    this.resolve(path, true)
  }
  addContentToFile(path: string, content: string): void {
    const node = this.resolve(path, true)
    node.content = (node.content ?? '') + content
  }
  readContentFromFile(path: string): string {
    return this.resolve(path, false).content
  }
  ls(path: string): string[] {
    const node = this.resolve(path, false)
    if (node.content !== null) {
      const parts = path.split('/').filter((p) => p.length > 0)
      return [parts[parts.length - 1]]
    }
    return [...node.children.keys()].sort()
  }
}`,

  steps: [
    { indent: 0, text: { pt: 'root = um nó diretório vazio (children = mapa vazio, content = null)', en: 'root = an empty directory node (children = empty map, content = null)' } },
    { indent: 0, text: { pt: 'resolve(path, create): quebra o path em partes e desce a partir de root', en: 'resolve(path, create): split path into parts and walk down from root' } },
    { indent: 1, text: { pt: 'Para cada parte do caminho, se o filho não existe:', en: 'For each path part, if the child does not exist:' } },
    { indent: 2, text: { pt: 'Se create é falso, retorna null (não existe e não é para criar)', en: 'If create is false, return null (does not exist and should not be created)' } },
    { indent: 2, text: { pt: 'Senão, cria um novo nó filho (diretório vazio por padrão)', en: 'Otherwise, create a new child node (empty directory by default)' } },
    { indent: 1, text: { pt: 'Desce para esse filho', en: 'Descend into that child' } },
    { indent: 0, text: { pt: 'mkdir(path): chama resolve(path, true) e descarta o retorno', en: 'mkdir(path): call resolve(path, true) and discard the return value' } },
    { indent: 0, text: { pt: 'addContentToFile(path, content): resolve(path, true) e concatena content ao conteúdo atual (ou "" se não tinha)', en: 'addContentToFile(path, content): resolve(path, true) and append content to whatever is already there (or "" if none)' } },
    { indent: 0, text: { pt: 'readContentFromFile(path): resolve(path, false) e retorna o content do nó', en: 'readContentFromFile(path): resolve(path, false) and return the node\'s content' } },
    { indent: 0, text: { pt: 'ls(path): se o nó resolvido tem content != null, é um arquivo — retorna [último segmento do path]', en: 'ls(path): if the resolved node has content != null, it is a file — return [the path\'s last segment]' } },
    { indent: 0, text: { pt: 'Senão é um diretório — retorna as chaves dos filhos ordenadas', en: 'Otherwise it is a directory — return the children\'s keys, sorted' } },
  ],

  stepDistractors: [
    {
      indent: 0,
      text: { pt: 'ls(path): sempre retorna as chaves dos filhos ordenadas, sem checar se é arquivo', en: 'ls(path): always return the children\'s keys, sorted, without checking whether it is a file' },
      why: { pt: 'Quando o path aponta para um arquivo ele não tem filhos; ls precisa devolver o nome do próprio arquivo nesse caso, não uma lista vazia.', en: 'When the path points to a file it has no children; ls needs to return the file\'s own name in that case, not an empty list.' },
    },
    {
      indent: 0,
      text: { pt: 'addContentToFile(path, content): resolve(path, true) e sobrescreve o content com o novo valor', en: 'addContentToFile(path, content): resolve(path, true) and overwrite content with the new value' },
      why: { pt: 'Chamadas repetidas em um arquivo existente devem concatenar, não substituir o conteúdo anterior.', en: 'Repeated calls on an existing file should concatenate, not replace the previous content.' },
    },
    {
      indent: 1,
      text: { pt: 'Para cada parte do caminho, cria sempre um novo nó filho, mesmo se já existir', en: 'For each path part, always create a new child node, even if one already exists' },
      why: { pt: 'Recriar um nó existente apaga qualquer conteúdo ou subárvore que ele já tinha; é preciso reaproveitar o nó quando ele já existe.', en: 'Recreating an existing node wipes out any content or subtree it already had; an existing node needs to be reused, not replaced.' },
    },
  ],

  blanks: [
    { line: 3, token: 'children: new Map(), content: null', options: ['children: [], content: ""', 'children: new Map(), content: undefined'] },
    { line: 6, token: '(p) => p.length > 0', options: ['(p) => p.length >= 0', '(p) => p !== undefined'] },
    { line: 10, token: 'return null', options: ['return undefined', 'continue'] },
    { line: 22, token: '(node.content ?? \'\') + content', options: ['content', '(node.content ?? \'\') + \' \' + content'] },
    { line: 31, token: 'parts[parts.length - 1]', options: ['parts[0]', 'path'] },
    { line: 33, token: '.sort()', options: ['.reverse()', ''] },
  ],

  codeDistractors: [
    {
      code: '    if (node.children.has(part)) node.children.set(part, { children: new Map(), content: null })',
      why: { pt: 'Inverte a condição: recria o nó exatamente quando ele JÁ existe, apagando conteúdo e subárvore em qualquer segundo acesso ao mesmo caminho.', en: 'Flips the condition: recreates the node exactly when it ALREADY exists, wiping content and subtree on any second access to the same path.' },
    },
    {
      code: '    return [...this.root.children.keys()].sort()',
      why: { pt: 'Ignora o nó resolvido e sempre lista os filhos de root, em vez do nó correspondente ao path pedido.', en: 'Ignores the resolved node and always lists root\'s children, instead of the node the requested path points to.' },
    },
    {
      code: '    return this.resolve(path, true).content',
      why: { pt: 'Usa create=true numa leitura; ler um caminho inexistente passaria a criá-lo silenciosamente em vez de representar "não existe".', en: 'Uses create=true on a read; reading a nonexistent path would silently create it instead of representing "does not exist".' },
    },
  ],

  bugs: [
    {
      id: 'overwrite-not-append',
      line: 22,
      code: '    node.content = content',
      why: { pt: 'Substitui o conteúdo em vez de concatenar; a segunda chamada em um arquivo existente perde tudo que foi escrito antes.', en: 'Replaces the content instead of concatenating; the second call on an existing file loses everything written before.' },
      failsTest: 'append_existing_file',
      logLine: 22,
      logWhy: { pt: 'Logar `node.content` antes e depois dessa linha mostra o valor anterior desaparecendo em vez de ganhar o novo texto no final.', en: 'Logging `node.content` before and after this line shows the previous value disappearing instead of gaining the new text at the end.' },
    },
    {
      id: 'ls-never-detects-file',
      line: 29,
      code: '    if (false) {',
      why: { pt: 'A checagem de "é arquivo" nunca dispara; ls tenta listar os filhos de um arquivo, que não tem nenhum, e devolve lista vazia em vez do nome do arquivo.', en: 'The "is this a file" check never fires; ls tries to list a file\'s children, which it has none of, and returns an empty list instead of the file\'s name.' },
      failsTest: 'ls_file_path',
      logLine: 29,
      logWhy: { pt: 'Logar `node.content` e qual branch foi tomado mostra um arquivo (content != null) caindo no branch de diretório.', en: 'Logging `node.content` and which branch was taken shows a file (content != null) falling into the directory branch.' },
    },
    {
      id: 'no-sort',
      line: 33,
      code: '    return [...node.children.keys()]',
      why: { pt: 'Devolve as chaves na ordem de inserção do Map, não em ordem lexicográfica; a ordem de criação dos diretórios passa a determinar a listagem.', en: 'Returns the keys in the Map\'s insertion order, not lexicographic order; the order directories were created ends up determining the listing.' },
      failsTest: 'sorted_directory_listing',
      logLine: 33,
      logWhy: { pt: 'Logar o array antes do (ausente) sort mostra "z" antes de "a", na ordem em que os diretórios foram criados.', en: 'Logging the array before the (missing) sort shows "z" before "a", in the order the directories were created.' },
    },
    {
      id: 'ls-wrong-segment',
      line: 31,
      code: '      return [parts[0]]',
      why: { pt: 'Pega o primeiro segmento do caminho em vez do último; para um arquivo em subpasta, devolve o nome de um diretório ancestral, não o nome do arquivo.', en: 'Grabs the first path segment instead of the last; for a file inside a subfolder, it returns an ancestor directory\'s name, not the file\'s name.' },
      failsTest: 'ls_file_path',
      logLine: 31,
      logWhy: { pt: 'Logar `parts` e o índice usado mostra `parts[0]` sendo escolhido em vez de `parts[parts.length - 1]`.', en: 'Logging `parts` and the index used shows `parts[0]` being picked instead of `parts[parts.length - 1]`.' },
    },
  ],

  followUp: {
    task: { pt: 'Adicione permissões e dono (ownership) a arquivos e diretórios.', en: 'Add permissions and ownership to files and directories.' },
    changeLines: [1, 3, 11, 17, 20, 24, 27],
    explanation: {
      pt: 'O formato de nó (linha 1) ganha campos como `owner` e `mode`. O root (linha 3) precisa de um dono padrão na criação. Todo novo nó (linha 11, dentro de resolve) passa a registrar quem o criou. Cada método público — mkdir (17), addContentToFile (20), readContentFromFile (24), ls (27) — ganha uma checagem de permissão antes de agir, usando o chamador atual contra o dono/modo do nó resolvido. resolve e a estrutura de travessia em si não mudam.',
      en: 'The node shape (line 1) gains fields like `owner` and `mode`. The root (line 3) needs a default owner at creation. Every new node (line 11, inside resolve) now records who created it. Each public method — mkdir (17), addContentToFile (20), readContentFromFile (24), ls (27) — gains a permission check before acting, comparing the current caller against the resolved node\'s owner/mode. resolve and the traversal structure itself do not change.',
    },
  },

  questions: [
    { kind: 'good', cost: 20, text: { pt: 'Se eu chamar addContentToFile num arquivo que já existe, o conteúdo é sobrescrito ou concatenado?', en: 'If I call addContentToFile on a file that already exists, is the content overwritten or concatenated?' }, reply: { pt: 'Concatenado ao conteúdo que já existia.', en: 'Concatenated to whatever content already existed.' } },
    { kind: 'good', cost: 20, text: { pt: 'O que ls retorna se o path apontar para um arquivo, não um diretório?', en: 'What does ls return if the path points to a file, not a directory?' }, reply: { pt: 'Uma lista com só o nome do arquivo.', en: 'A list containing only the file\'s name.' } },
    { kind: 'good', cost: 15, text: { pt: 'A listagem de um diretório precisa estar em alguma ordem específica?', en: 'Does a directory listing need to be in any specific order?' }, reply: { pt: 'Sim, ordenada lexicograficamente.', en: 'Yes, sorted lexicographically.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Qual o número máximo de operações?', en: 'What is the maximum number of operations?' }, reply: { pt: 'Está nas constraints: até 100000.', en: 'It is in the constraints: up to 100000.' } },
    { kind: 'stated', cost: 15, text: { pt: 'Qual o tamanho máximo de um path?', en: 'What is the maximum length of a path?' }, reply: { pt: 'Está nas constraints: até 1000 caracteres.', en: 'It is in the constraints: up to 1000 characters.' } },
    { kind: 'noise', cost: 30, text: { pt: 'O sistema de arquivos precisa persistir em disco entre execuções?', en: 'Does the filesystem need to persist to disk between runs?' }, reply: { pt: 'Não, é tudo em memória.', en: 'No, it is all in memory.' } },
    { kind: 'noise', cost: 30, text: { pt: 'Preciso suportar múltiplos usuários acessando ao mesmo tempo?', en: 'Do I need to support multiple users accessing it at the same time?' }, reply: { pt: 'Não faz parte deste problema.', en: 'That is not part of this problem.' } },
  ],

  edgeCards: [
    {
      relevant: true,
      concept: 'append_existing_file',
      text: { pt: 'addContentToFile chamado duas vezes no mesmo arquivo', en: 'addContentToFile called twice on the same file' },
      why: { pt: 'O resultado precisa ser a concatenação das duas chamadas, não só a mais recente.', en: 'The result needs to be the concatenation of both calls, not just the most recent one.' },
      followUp: { question: { pt: 'add("/f","a") depois add("/f","b"): read("/f") retorna?', en: 'add("/f","a") then add("/f","b"): what does read("/f") return?' }, options: ['"ab"', '"b"', '"a"'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'ls_file_path',
      text: { pt: 'ls chamado num caminho de arquivo, não de diretório', en: 'ls called on a file path, not a directory path' },
      why: { pt: 'Um arquivo não tem filhos para listar; a resposta certa é uma lista de um elemento com o nome do próprio arquivo.', en: 'A file has no children to list; the right answer is a one-element list with the file\'s own name.' },
      followUp: { question: { pt: 'ls("/a/b.txt") retorna?', en: 'What does ls("/a/b.txt") return?' }, options: ['["b.txt"]', '[]', '["a"]'], correct: 0 },
    },
    {
      relevant: true,
      concept: 'sorted_directory_listing',
      text: { pt: 'Diretórios criados fora de ordem alfabética', en: 'Directories created out of alphabetical order' },
      why: { pt: 'A ordem de criação (ordem de inserção no mapa de filhos) não é a ordem exigida; ls precisa ordenar explicitamente.', en: 'Creation order (the children map\'s insertion order) is not the required order; ls must sort explicitly.' },
      followUp: { question: { pt: 'mkdir("/z") então mkdir("/a"): ls("/") retorna?', en: 'mkdir("/z") then mkdir("/a"): what does ls("/") return?' }, options: ['["a","z"]', '["z","a"]', '["a","z","/"]'], correct: 0 },
    },
    {
      relevant: false,
      text: { pt: 'Path termina com uma barra redundante, como "/a/b/"', en: 'Path ends with a redundant slash, like "/a/b/"' },
      why: { pt: 'O split por "/" seguido de filtrar strings vazias já absorve isso sem tratamento especial.', en: 'Splitting on "/" followed by filtering out empty strings already absorbs this with no special handling.' },
    },
    {
      relevant: false,
      text: { pt: 'mkdir chamado num path que já existe', en: 'mkdir called on a path that already exists' },
      why: { pt: 'resolve reaproveita o nó existente em vez de recriar; é uma operação idempotente por construção.', en: 'resolve reuses the existing node instead of recreating it; it is idempotent by construction.' },
    },
    {
      relevant: false,
      text: { pt: 'readContentFromFile num path que nunca foi criado', en: 'readContentFromFile on a path that was never created' },
      why: { pt: 'Não aparece em nenhum teste e não está nas clarifications; o enunciado assume chamadas bem formadas.', en: 'It does not show up in any test and is not in the clarifications; the statement assumes well-formed calls.' },
    },
  ],

  pattern: { correct: 'trie', distractors: ['trie-dfs', 'union-find', 'tree-recursion'] },

  approaches: [
    {
      chosen: true,
      name: { pt: 'Árvore de nós por segmento de path (como um trie)', en: 'Tree of nodes keyed by path segment (like a trie)' },
      time: 'O(L)',
      space: 'O(tamanho total armazenado)',
      why: { pt: 'L = número de segmentos do path na operação. Cada operação só percorre os segmentos do caminho pedido, não o sistema de arquivos inteiro.', en: 'L = number of segments in the operation\'s path. Each operation only walks the segments of the requested path, not the whole filesystem.' },
    },
    {
      chosen: false,
      name: { pt: 'Um mapa plano de path completo → nó, com varredura por prefixo em ls', en: 'A flat map of full path → node, scanning by prefix for ls' },
      time: 'O(total de entradas) por ls',
      space: 'O(total de entradas)',
      why: { pt: 'ls precisaria varrer todas as chaves do mapa procurando o prefixo do diretório; o custo passa a depender do tamanho do sistema de arquivos inteiro, não do tamanho do path — o contrário do que se espera aqui.', en: 'ls would need to scan every map key looking for the directory\'s prefix; the cost ends up depending on the whole filesystem\'s size, not the path\'s length — the opposite of what is expected here.' },
    },
    {
      chosen: false,
      name: { pt: 'Árvore de nós, mas ls recalcula recursivamente toda a subárvore', en: 'Tree of nodes, but ls recursively recomputes the whole subtree' },
      time: 'O(tamanho da subárvore)',
      space: 'O(tamanho total armazenado)',
      why: { pt: 'ls só precisa dos filhos diretos; descer recursivamente por toda a subárvore para montar a listagem custa muito mais do que o necessário em diretórios grandes.', en: 'ls only needs the direct children; recursively walking the whole subtree to build the listing costs far more than needed on large directories.' },
    },
  ],
}

export default content
