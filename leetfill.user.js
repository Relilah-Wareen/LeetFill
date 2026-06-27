// ==UserScript==
// @name         LeetFill
// @namespace    https://github.com/Relilah-Wareen/LeetFill
// @version      1.0.0
// @description  Context-aware code completion for LeetCode's Monaco editor. Supports C++, Java, Python — container methods, algorithm snippets (for/while/dfs/bfs), variable type tracking, #include headers, and function signature hints.
// @author       Relilah-Wareen
// @license      MIT
// @match        https://leetcode.com/problems/*
// @match        https://leetcode.cn/problems/*
// @match        https://www.leetcode.com/problems/*
// @match        https://www.leetcode.cn/problems/*
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // ============================================================
    //  SECTION 1: API Dictionaries
    //  Each entry: { label, methods: [...], signatures: {...} }
    //  signatures: methodName -> { params: [...], return: '...' }
    // ============================================================

    // --- C++ STL Member Methods ---
    const CPP_API = {
        'vector': {
            methods: ['push_back', 'pop_back', 'size', 'empty', 'clear', 'resize', 'reserve',
                      'begin', 'end', 'rbegin', 'rend', 'front', 'back', 'insert', 'erase',
                      'emplace_back', 'emplace', 'shrink_to_fit', 'capacity', 'data', 'at', 'swap'],
            signatures: {
                'push_back':    { params: ['const T& value'], ret: 'void' },
                'pop_back':     { params: [], ret: 'void' },
                'size':         { params: [], ret: 'size_t' },
                'empty':        { params: [], ret: 'bool' },
                'clear':        { params: [], ret: 'void' },
                'resize':       { params: ['size_t count', 'const T& value = T()'], ret: 'void' },
                'reserve':      { params: ['size_t new_cap'], ret: 'void' },
                'front':        { params: [], ret: 'T&' },
                'back':         { params: [], ret: 'T&' },
                'insert':       { params: ['iterator pos', 'const T& value'], ret: 'iterator' },
                'erase':        { params: ['iterator pos'], ret: 'iterator' },
                'emplace_back': { params: ['Args&&... args'], ret: 'void' },
                'at':           { params: ['size_t index'], ret: 'T&' },
                'data':         { params: [], ret: 'T*' },
                'capacity':     { params: [], ret: 'size_t' },
                'swap':         { params: ['vector& other'], ret: 'void' }
            }
        },
        'string': {
            methods: ['length', 'size', 'substr', 'find', 'rfind', 'push_back', 'pop_back',
                      'empty', 'clear', 'c_str', 'append', 'replace', 'insert', 'erase',
                      'compare', 'starts_with', 'ends_with', 'at', 'front', 'back', 'resize'],
            signatures: {
                'substr':     { params: ['size_t pos = 0', 'size_t count = npos'], ret: 'string' },
                'find':       { params: ['const string& str', 'size_t pos = 0'], ret: 'size_t' },
                'rfind':      { params: ['const string& str', 'size_t pos = npos'], ret: 'size_t' },
                'append':     { params: ['const string& str'], ret: 'string&' },
                'replace':    { params: ['size_t pos', 'size_t count', 'const string& str'], ret: 'string&' },
                'compare':    { params: ['const string& str'], ret: 'int' },
                'starts_with':{ params: ['const string& prefix'], ret: 'bool' },
                'ends_with':  { params: ['const string& suffix'], ret: 'bool' },
                'c_str':      { params: [], ret: 'const char*' }
            }
        },
        'stack': {
            methods: ['push', 'pop', 'top', 'empty', 'size', 'emplace', 'swap'],
            signatures: {
                'push':    { params: ['const T& value'], ret: 'void' },
                'pop':     { params: [], ret: 'void' },
                'top':     { params: [], ret: 'T&' },
                'empty':   { params: [], ret: 'bool' },
                'size':    { params: [], ret: 'size_t' },
                'emplace': { params: ['Args&&... args'], ret: 'void' }
            }
        },
        'queue': {
            methods: ['push', 'pop', 'front', 'back', 'empty', 'size', 'emplace', 'swap'],
            signatures: {
                'push':  { params: ['const T& value'], ret: 'void' },
                'pop':   { params: [], ret: 'void' },
                'front': { params: [], ret: 'T&' },
                'back':  { params: [], ret: 'T&' },
                'empty': { params: [], ret: 'bool' },
                'size':  { params: [], ret: 'size_t' }
            }
        },
        'deque': {
            methods: ['push_back', 'push_front', 'pop_back', 'pop_front', 'front', 'back',
                      'empty', 'size', 'clear', 'insert', 'erase', 'at', 'begin', 'end'],
            signatures: {
                'push_back':  { params: ['const T& value'], ret: 'void' },
                'push_front': { params: ['const T& value'], ret: 'void' },
                'pop_back':   { params: [], ret: 'void' },
                'pop_front':  { params: [], ret: 'void' },
                'front':      { params: [], ret: 'T&' },
                'back':       { params: [], ret: 'T&' },
                'at':         { params: ['size_t index'], ret: 'T&' }
            }
        },
        'priority_queue': {
            methods: ['push', 'pop', 'top', 'empty', 'size', 'emplace', 'swap'],
            signatures: {
                'push':  { params: ['const T& value'], ret: 'void' },
                'pop':   { params: [], ret: 'void' },
                'top':   { params: [], ret: 'const T&' },
                'empty': { params: [], ret: 'bool' },
                'size':  { params: [], ret: 'size_t' }
            }
        },
        'set': {
            methods: ['insert', 'erase', 'find', 'count', 'begin', 'end', 'size', 'empty',
                      'clear', 'lower_bound', 'upper_bound', 'emplace', 'swap', 'contains'],
            signatures: {
                'insert':       { params: ['const T& value'], ret: 'pair<iterator,bool>' },
                'erase':        { params: ['const T& value'], ret: 'size_t' },
                'find':         { params: ['const T& value'], ret: 'iterator' },
                'count':        { params: ['const T& value'], ret: 'size_t' },
                'lower_bound':  { params: ['const T& value'], ret: 'iterator' },
                'upper_bound':  { params: ['const T& value'], ret: 'iterator' },
                'contains':     { params: ['const T& value'], ret: 'bool' }
            }
        },
        'unordered_set': {
            methods: ['insert', 'erase', 'find', 'count', 'begin', 'end', 'size', 'empty',
                      'clear', 'emplace', 'swap', 'contains', 'bucket_count', 'load_factor'],
            signatures: {
                'insert':   { params: ['const T& value'], ret: 'pair<iterator,bool>' },
                'erase':    { params: ['const T& value'], ret: 'size_t' },
                'find':     { params: ['const T& value'], ret: 'iterator' },
                'count':    { params: ['const T& value'], ret: 'size_t' },
                'contains': { params: ['const T& value'], ret: 'bool' }
            }
        },
        'map': {
            methods: ['insert', 'erase', 'find', 'count', 'begin', 'end', 'size', 'empty',
                      'clear', 'lower_bound', 'upper_bound', 'emplace', 'swap', 'contains', 'at'],
            signatures: {
                'insert':      { params: ['const pair<K,V>& value'], ret: 'pair<iterator,bool>' },
                'erase':       { params: ['const K& key'], ret: 'size_t' },
                'find':        { params: ['const K& key'], ret: 'iterator' },
                'count':       { params: ['const K& key'], ret: 'size_t' },
                'at':          { params: ['const K& key'], ret: 'V&' },
                'lower_bound': { params: ['const K& key'], ret: 'iterator' },
                'upper_bound': { params: ['const K& key'], ret: 'iterator' },
                'contains':    { params: ['const K& key'], ret: 'bool' }
            }
        },
        'unordered_map': {
            methods: ['insert', 'erase', 'find', 'count', 'begin', 'end', 'size', 'empty',
                      'clear', 'emplace', 'swap', 'contains', 'at', 'bucket_count'],
            signatures: {
                'insert':   { params: ['const pair<K,V>& value'], ret: 'pair<iterator,bool>' },
                'erase':    { params: ['const K& key'], ret: 'size_t' },
                'find':     { params: ['const K& key'], ret: 'iterator' },
                'count':    { params: ['const K& key'], ret: 'size_t' },
                'at':       { params: ['const K& key'], ret: 'V&' },
                'contains': { params: ['const K& key'], ret: 'bool' }
            }
        },
        'pair': {
            methods: ['first', 'second'],
            signatures: {}
        },
        // LeetCode-specific
        'TreeNode': {
            methods: ['val', 'left', 'right'],
            signatures: {}
        },
        'ListNode': {
            methods: ['val', 'next'],
            signatures: {}
        }
    };

    // --- C++ Global Snippets ---
    const CPP_SNIPPETS = [
        {
            label: 'for',
            snippet: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ++${1:i}) {\n\t${0}\n}',
            detail: 'For loop (index-based)'
        },
        {
            label: 'for-range',
            snippet: 'for (auto& ${1:x} : ${2:container}) {\n\t${0}\n}',
            detail: 'Range-based for loop'
        },
        {
            label: 'for-iter',
            snippet: 'for (auto it = ${1:container}.begin(); it != ${1:container}.end(); ++it) {\n\t${0}\n}',
            detail: 'Iterator-based for loop'
        },
        {
            label: 'while',
            snippet: 'while (${1:condition}) {\n\t${0}\n}',
            detail: 'While loop'
        },
        {
            label: 'if',
            snippet: 'if (${1:condition}) {\n\t${0}\n}',
            detail: 'If statement'
        },
        {
            label: 'if-else',
            snippet: 'if (${1:condition}) {\n\t${0}\n} else {\n\t\n}',
            detail: 'If-else statement'
        },
        {
            label: 'dfs',
            snippet: 'function<void(int)> dfs = [&](int ${1:u}) {\n\tif (${1:u} == ${2:target}) return;\n\tvisited[${1:u}] = true;\n\tfor (auto& ${3:v} : adj[${1:u}]) {\n\t\tif (!visited[${3:v}]) dfs(${3:v});\n\t}\n};',
            detail: 'DFS Template (lambda recursion)'
        },
        {
            label: 'bfs',
            snippet: 'queue<int> q;\nq.push(${1:start});\nvisited[${1:start}] = true;\nwhile (!q.empty()) {\n\tint ${2:u} = q.front(); q.pop();\n\t${0}\n\tfor (auto& ${3:v} : adj[${2:u}]) {\n\t\tif (!visited[${3:v}]) {\n\t\t\tvisited[${3:v}] = true;\n\t\t\tq.push(${3:v});\n\t\t}\n\t}\n}',
            detail: 'BFS Template'
        },
        {
            label: 'binary_search',
            snippet: 'int l = 0, r = ${1:n} - 1;\nwhile (l <= r) {\n\tint mid = l + (r - l) / 2;\n\tif (${2:check}(mid)) {\n\t\tl = mid + 1;\n\t} else {\n\t\tr = mid - 1;\n\t}\n}',
            detail: 'Binary Search Template'
        },
        {
            label: 'lower_bound',
            snippet: 'int idx = lower_bound(${1:container}.begin(), ${1:container}.end(), ${2:target}) - ${1:container}.begin();',
            detail: 'lower_bound usage'
        },
        {
            label: 'upper_bound',
            snippet: 'int idx = upper_bound(${1:container}.begin(), ${1:container}.end(), ${2:target}) - ${1:container}.begin();',
            detail: 'upper_bound usage'
        },
        {
            label: 'sort',
            snippet: 'sort(${1:container}.begin(), ${1:container}.end());',
            detail: 'Sort ascending'
        },
        {
            label: 'sort-desc',
            snippet: 'sort(${1:container}.begin(), ${1:container}.end(), greater<int>());',
            detail: 'Sort descending'
        },
        {
            label: 'sort-cmp',
            snippet: 'sort(${1:container}.begin(), ${1:container}.end(), [&](auto& a, auto& b) {\n\treturn ${0};\n});',
            detail: 'Sort with custom comparator'
        },
        {
            label: 'memset',
            snippet: 'memset(${1:arr}, ${2:0}, sizeof(${1:arr}));',
            detail: 'Zero-initialize array'
        },
        {
            label: 'accumulate',
            snippet: 'accumulate(${1:container}.begin(), ${1:container}.end(), ${2:0LL})',
            detail: 'Sum of elements'
        },
        {
            label: 'max',
            snippet: 'max(${1:a}, ${2:b})',
            detail: 'Maximum of two values'
        },
        {
            label: 'min',
            snippet: 'min(${1:a}, ${2:b})',
            detail: 'Minimum of two values'
        },
        {
            label: 'reverse',
            snippet: 'reverse(${1:container}.begin(), ${1:container}.end());',
            detail: 'Reverse a range'
        },
        {
            label: 'lambda',
            snippet: 'auto ${1:name} = [&](${2:params}) {\n\t${0}\n};',
            detail: 'Lambda function'
        },
        {
            label: 'gcd',
            snippet: 'gcd(${1:a}, ${2:b})',
            detail: 'Greatest common divisor (C++17)'
        },
        {
            label: 'swap',
            snippet: 'swap(${1:a}, ${2:b});',
            detail: 'Swap two values'
        }
    ];

    // --- C++ Standard Utility Functions ---
    const CPP_UTIL_FUNCTIONS = ['sort', 'reverse', 'max', 'min', 'abs', 'swap', 'gcd',
        'accumulate', 'lower_bound', 'upper_bound', 'binary_search', 'unique', 'find',
        'count', 'fill', 'memset', 'memcpy', 'iota', 'next_permutation', 'prev_permutation'];

    // --- C++ Standard Library Headers (for #include completion) ---
    const CPP_HEADERS = [
        { label: 'algorithm',    detail: 'sort, lower_bound, upper_bound, max, min, reverse, fill, next_permutation, unique' },
        { label: 'vector',       detail: 'Dynamic array container' },
        { label: 'string',       detail: 'std::string class' },
        { label: 'map',          detail: 'Ordered key-value map (Red-Black Tree)' },
        { label: 'unordered_map',detail: 'Hash table key-value map' },
        { label: 'set',          detail: 'Ordered unique element set' },
        { label: 'unordered_set',detail: 'Hash table element set' },
        { label: 'queue',        detail: 'FIFO queue adapter' },
        { label: 'stack',        detail: 'LIFO stack adapter' },
        { label: 'deque',        detail: 'Double-ended queue' },
        { label: 'priority_queue',detail: 'Heap-based priority queue' },
        { label: 'list',         detail: 'Doubly linked list' },
        { label: 'numeric',      detail: 'accumulate, gcd, lcm, iota' },
        { label: 'cmath',        detail: 'sqrt, pow, abs, ceil, floor, log, sin, cos' },
        { label: 'iostream',     detail: 'cin, cout, cerr' },
        { label: 'functional',   detail: 'std::function, std::hash, std::greater, std::less' },
        { label: 'utility',      detail: 'std::pair, std::move, std::swap, std::exchange' },
        { label: 'tuple',        detail: 'std::tuple, std::get, std::tie' },
        { label: 'array',        detail: 'Fixed-size array container' },
        { label: 'bitset',       detail: 'Fixed-size bitset for bit manipulation' },
        { label: 'cstring',      detail: 'memset, memcpy, strlen, strcmp (C string functions)' },
        { label: 'climits',      detail: 'INT_MAX, INT_MIN, LLONG_MAX' },
        { label: 'cstdint',      detail: 'int64_t, uint32_t, INT32_MAX' },
        { label: 'iterator',     detail: 'begin, end, rbegin, rend, iterator_traits' },
        { label: 'memory',       detail: 'shared_ptr, unique_ptr, make_shared, allocator' },
        { label: 'sstream',      detail: 'stringstream, istringstream, ostringstream' },
        { label: 'cstdlib',      detail: 'qsort, bsearch, rand, srand, atoi, malloc, free' },
        { label: 'regex',        detail: 'Regular expression matching' },
    ];

    // --- Java Collections Methods ---
    const JAVA_API = {
        'ArrayList': {
            methods: ['add', 'get', 'set', 'remove', 'size', 'isEmpty', 'clear', 'contains',
                      'indexOf', 'lastIndexOf', 'toArray', 'addAll', 'removeAll', 'retainAll',
                      'subList', 'iterator', 'forEach', 'stream', 'sort', 'ensureCapacity', 'trimToSize'],
            signatures: {
                'add':    { params: ['E element'], ret: 'boolean' },
                'addAt':  { params: ['int index', 'E element'], ret: 'void' },
                'get':    { params: ['int index'], ret: 'E' },
                'set':    { params: ['int index', 'E element'], ret: 'E' },
                'remove': { params: ['int index'], ret: 'E' },
                'size':   { params: [], ret: 'int' },
                'contains': { params: ['Object o'], ret: 'boolean' },
                'indexOf': { params: ['Object o'], ret: 'int' },
                'isEmpty': { params: [], ret: 'boolean' },
                'clear':  { params: [], ret: 'void' }
            }
        },
        'LinkedList': {
            methods: ['add', 'get', 'set', 'remove', 'size', 'isEmpty', 'clear', 'contains',
                      'addFirst', 'addLast', 'getFirst', 'getLast', 'removeFirst', 'removeLast',
                      'peek', 'peekFirst', 'peekLast', 'poll', 'pollFirst', 'pollLast',
                      'push', 'pop', 'offer', 'offerFirst', 'offerLast', 'indexOf', 'iterator'],
            signatures: {
                'addFirst':    { params: ['E element'], ret: 'void' },
                'addLast':     { params: ['E element'], ret: 'void' },
                'getFirst':    { params: [], ret: 'E' },
                'getLast':     { params: [], ret: 'E' },
                'removeFirst': { params: [], ret: 'E' },
                'removeLast':  { params: [], ret: 'E' },
                'peek':        { params: [], ret: 'E' },
                'poll':        { params: [], ret: 'E' },
                'push':        { params: ['E element'], ret: 'void' },
                'pop':         { params: [], ret: 'E' },
                'offer':       { params: ['E element'], ret: 'boolean' }
            }
        },
        'HashMap': {
            methods: ['put', 'get', 'remove', 'containsKey', 'containsValue', 'size', 'isEmpty',
                      'clear', 'keySet', 'values', 'entrySet', 'getOrDefault', 'putIfAbsent',
                      'replace', 'forEach', 'computeIfAbsent', 'compute', 'merge'],
            signatures: {
                'put':          { params: ['K key', 'V value'], ret: 'V' },
                'get':          { params: ['Object key'], ret: 'V' },
                'remove':       { params: ['Object key'], ret: 'V' },
                'containsKey':  { params: ['Object key'], ret: 'boolean' },
                'containsValue':{ params: ['Object value'], ret: 'boolean' },
                'getOrDefault': { params: ['Object key', 'V defaultValue'], ret: 'V' },
                'putIfAbsent':  { params: ['K key', 'V value'], ret: 'V' },
                'keySet':       { params: [], ret: 'Set<K>' },
                'values':       { params: [], ret: 'Collection<V>' },
                'entrySet':     { params: [], ret: 'Set<Map.Entry<K,V>>' }
            }
        },
        'HashSet': {
            methods: ['add', 'remove', 'contains', 'size', 'isEmpty', 'clear', 'iterator',
                      'addAll', 'removeAll', 'retainAll', 'toArray', 'forEach', 'stream'],
            signatures: {
                'add':      { params: ['E element'], ret: 'boolean' },
                'remove':   { params: ['Object o'], ret: 'boolean' },
                'contains': { params: ['Object o'], ret: 'boolean' },
                'size':     { params: [], ret: 'int' },
                'isEmpty':  { params: [], ret: 'boolean' },
                'clear':    { params: [], ret: 'void' }
            }
        },
        'Stack': {
            methods: ['push', 'pop', 'peek', 'empty', 'search', 'size'],
            signatures: {
                'push':   { params: ['E item'], ret: 'E' },
                'pop':    { params: [], ret: 'E' },
                'peek':   { params: [], ret: 'E' },
                'empty':  { params: [], ret: 'boolean' },
                'search': { params: ['Object o'], ret: 'int' },
                'size':   { params: [], ret: 'int' }
            }
        },
        'Queue': {
            methods: ['offer', 'poll', 'peek', 'element', 'size', 'isEmpty', 'add', 'remove'],
            signatures: {
                'offer':  { params: ['E element'], ret: 'boolean' },
                'poll':   { params: [], ret: 'E' },
                'peek':   { params: [], ret: 'E' },
                'element':{ params: [], ret: 'E' },
                'add':    { params: ['E element'], ret: 'boolean' },
                'remove': { params: [], ret: 'E' }
            }
        },
        'Deque': {
            methods: ['addFirst', 'addLast', 'offerFirst', 'offerLast', 'removeFirst', 'removeLast',
                      'pollFirst', 'pollLast', 'getFirst', 'getLast', 'peekFirst', 'peekLast',
                      'push', 'pop', 'size', 'isEmpty'],
            signatures: {
                'addFirst':    { params: ['E element'], ret: 'void' },
                'addLast':     { params: ['E element'], ret: 'void' },
                'pollFirst':   { params: [], ret: 'E' },
                'pollLast':    { params: [], ret: 'E' },
                'peekFirst':   { params: [], ret: 'E' },
                'peekLast':    { params: [], ret: 'E' }
            }
        },
        'PriorityQueue': {
            methods: ['offer', 'poll', 'peek', 'size', 'isEmpty', 'clear', 'add', 'remove',
                      'contains', 'iterator', 'toArray'],
            signatures: {
                'offer':  { params: ['E element'], ret: 'boolean' },
                'poll':   { params: [], ret: 'E' },
                'peek':   { params: [], ret: 'E' },
                'add':    { params: ['E element'], ret: 'boolean' },
                'remove': { params: ['Object o'], ret: 'boolean' }
            }
        },
        'TreeMap': {
            methods: ['put', 'get', 'remove', 'containsKey', 'firstKey', 'lastKey', 'floorKey',
                      'ceilingKey', 'higherKey', 'lowerKey', 'size', 'isEmpty', 'clear', 'keySet'],
            signatures: {
                'put':        { params: ['K key', 'V value'], ret: 'V' },
                'get':        { params: ['Object key'], ret: 'V' },
                'firstKey':   { params: [], ret: 'K' },
                'lastKey':    { params: [], ret: 'K' },
                'floorKey':   { params: ['K key'], ret: 'K' },
                'ceilingKey': { params: ['K key'], ret: 'K' }
            }
        },
        'TreeSet': {
            methods: ['add', 'remove', 'contains', 'first', 'last', 'floor', 'ceiling', 'higher',
                      'lower', 'size', 'isEmpty', 'clear', 'iterator'],
            signatures: {
                'add':     { params: ['E element'], ret: 'boolean' },
                'first':   { params: [], ret: 'E' },
                'last':    { params: [], ret: 'E' },
                'floor':   { params: ['E element'], ret: 'E' },
                'ceiling': { params: ['E element'], ret: 'E' }
            }
        },
        'String': {
            methods: ['length', 'charAt', 'substring', 'indexOf', 'lastIndexOf', 'contains',
                      'startsWith', 'endsWith', 'replace', 'replaceAll', 'split', 'trim',
                      'toLowerCase', 'toUpperCase', 'toCharArray', 'equals', 'compareTo',
                      'isEmpty', 'isBlank', 'matches', 'join'],
            signatures: {
                'charAt':    { params: ['int index'], ret: 'char' },
                'substring': { params: ['int beginIndex', 'int endIndex'], ret: 'String' },
                'indexOf':   { params: ['String str'], ret: 'int' },
                'contains':  { params: ['CharSequence s'], ret: 'boolean' },
                'replace':   { params: ['CharSequence target', 'CharSequence replacement'], ret: 'String' },
                'split':     { params: ['String regex'], ret: 'String[]' },
                'equals':    { params: ['Object obj'], ret: 'boolean' }
            }
        },
        'StringBuilder': {
            methods: ['append', 'insert', 'delete', 'deleteCharAt', 'replace', 'reverse',
                      'length', 'charAt', 'setCharAt', 'toString', 'substring'],
            signatures: {
                'append':      { params: ['String str'], ret: 'StringBuilder' },
                'insert':      { params: ['int offset', 'String str'], ret: 'StringBuilder' },
                'delete':      { params: ['int start', 'int end'], ret: 'StringBuilder' },
                'deleteCharAt':{ params: ['int index'], ret: 'StringBuilder' },
                'reverse':     { params: [], ret: 'StringBuilder' },
                'toString':    { params: [], ret: 'String' }
            }
        },
        'TreeNode': {
            methods: ['val', 'left', 'right'],
            signatures: {}
        },
        'ListNode': {
            methods: ['val', 'next'],
            signatures: {}
        }
    };

    // --- Java Snippets ---
    const JAVA_SNIPPETS = [
        {
            label: 'for',
            snippet: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${0}\n}',
            detail: 'For loop (index-based)'
        },
        {
            label: 'for-each',
            snippet: 'for (${1:Type} ${2:x} : ${3:collection}) {\n\t${0}\n}',
            detail: 'Enhanced for-each loop'
        },
        {
            label: 'while',
            snippet: 'while (${1:condition}) {\n\t${0}\n}',
            detail: 'While loop'
        },
        {
            label: 'if',
            snippet: 'if (${1:condition}) {\n\t${0}\n}',
            detail: 'If statement'
        },
        {
            label: 'dfs',
            snippet: 'private void dfs(int ${1:u}, boolean[] visited, List<Integer>[] adj) {\n\tif (visited[${1:u}]) return;\n\tvisited[${1:u}] = true;\n\tfor (int ${2:v} : adj[${1:u}]) {\n\t\tdfs(${2:v}, visited, adj);\n\t}\n}',
            detail: 'DFS Template'
        },
        {
            label: 'bfs',
            snippet: 'Queue<Integer> q = new LinkedList<>();\nq.offer(${1:start});\nvisited[${1:start}] = true;\nwhile (!q.isEmpty()) {\n\tint ${2:u} = q.poll();\n\t${0}\n\tfor (int ${3:v} : adj[${2:u}]) {\n\t\tif (!visited[${3:v}]) {\n\t\t\tvisited[${3:v}] = true;\n\t\t\tq.offer(${3:v});\n\t\t}\n\t}\n}',
            detail: 'BFS Template'
        },
        {
            label: 'binary_search',
            snippet: 'int l = 0, r = ${1:n} - 1;\nwhile (l <= r) {\n\tint mid = l + (r - l) / 2;\n\tif (${2:check}(mid)) {\n\t\tl = mid + 1;\n\t} else {\n\t\tr = mid - 1;\n\t}\n}',
            detail: 'Binary Search Template'
        },
        {
            label: 'sort',
            snippet: 'Arrays.sort(${1:arr});',
            detail: 'Sort array ascending'
        },
        {
            label: 'sort-cmp',
            snippet: 'Arrays.sort(${1:arr}, (a, b) -> ${2:Integer.compare(a, b)});',
            detail: 'Sort with comparator'
        },
        {
            label: 'sort-list',
            snippet: 'Collections.sort(${1:list});',
            detail: 'Sort List'
        },
        {
            label: 'sout',
            snippet: 'System.out.println(${1:msg});',
            detail: 'Print to stdout'
        }
    ];

    // --- Python Built-in Type Methods ---
    const PYTHON_API = {
        'list': {
            methods: ['append', 'extend', 'insert', 'remove', 'pop', 'clear', 'index',
                      'count', 'sort', 'reverse', 'copy'],
            signatures: {
                'append':  { params: ['object'], ret: 'None' },
                'extend':  { params: ['iterable'], ret: 'None' },
                'insert':  { params: ['index', 'object'], ret: 'None' },
                'remove':  { params: ['object'], ret: 'None' },
                'pop':     { params: ['index=-1'], ret: 'object' },
                'clear':   { params: [], ret: 'None' },
                'index':   { params: ['object', 'start=0', 'stop=len(list)'], ret: 'int' },
                'count':   { params: ['object'], ret: 'int' },
                'sort':    { params: ['key=None', 'reverse=False'], ret: 'None' },
                'reverse': { params: [], ret: 'None' },
                'copy':    { params: [], ret: 'list' }
            }
        },
        'dict': {
            methods: ['get', 'keys', 'values', 'items', 'pop', 'popitem', 'update',
                      'clear', 'copy', 'setdefault', 'fromkeys'],
            signatures: {
                'get':       { params: ['key', 'default=None'], ret: 'value' },
                'keys':      { params: [], ret: 'dict_keys' },
                'values':    { params: [], ret: 'dict_values' },
                'items':     { params: [], ret: 'dict_items' },
                'pop':       { params: ['key', 'default'], ret: 'value' },
                'popitem':   { params: [], ret: 'tuple' },
                'update':    { params: ['other_dict'], ret: 'None' },
                'clear':     { params: [], ret: 'None' },
                'setdefault':{ params: ['key', 'default=None'], ret: 'value' }
            }
        },
        'set': {
            methods: ['add', 'remove', 'discard', 'pop', 'clear', 'copy', 'union',
                      'intersection', 'difference', 'symmetric_difference', 'issubset',
                      'issuperset', 'isdisjoint', 'update', 'intersection_update',
                      'difference_update', 'symmetric_difference_update'],
            signatures: {
                'add':       { params: ['element'], ret: 'None' },
                'remove':    { params: ['element'], ret: 'None' },
                'discard':   { params: ['element'], ret: 'None' },
                'pop':       { params: [], ret: 'element' },
                'union':     { params: ['*others'], ret: 'set' },
                'intersection': { params: ['*others'], ret: 'set' },
                'difference':   { params: ['*others'], ret: 'set' },
                'issubset':     { params: ['other'], ret: 'bool' }
            }
        },
        'str': {
            methods: ['strip', 'lstrip', 'rstrip', 'split', 'join', 'replace', 'find',
                      'rfind', 'index', 'rindex', 'count', 'startswith', 'endswith',
                      'lower', 'upper', 'capitalize', 'title', 'swapcase', 'isalpha',
                      'isdigit', 'isalnum', 'islower', 'isupper', 'isspace', 'format',
                      'encode', 'partition', 'rpartition', 'splitlines', 'zfill'],
            signatures: {
                'strip':     { params: ['chars=None'], ret: 'str' },
                'split':     { params: ['sep=None', 'maxsplit=-1'], ret: 'list' },
                'join':      { params: ['iterable'], ret: 'str' },
                'replace':   { params: ['old', 'new', 'count=-1'], ret: 'str' },
                'find':      { params: ['sub', 'start=0', 'end=len(str)'], ret: 'int' },
                'startswith':{ params: ['prefix', 'start=0', 'end=len(str)'], ret: 'bool' },
                'endswith':  { params: ['suffix', 'start=0', 'end=len(str)'], ret: 'bool' }
            }
        },
        'tuple': {
            methods: ['count', 'index'],
            signatures: {
                'count': { params: ['value'], ret: 'int' },
                'index': { params: ['value', 'start=0', 'end=len(tuple)'], ret: 'int' }
            }
        },
        'deque': {
            methods: ['append', 'appendleft', 'pop', 'popleft', 'extend', 'extendleft',
                      'rotate', 'clear', 'copy', 'count', 'index', 'remove', 'reverse'],
            signatures: {
                'append':     { params: ['x'], ret: 'None' },
                'appendleft': { params: ['x'], ret: 'None' },
                'pop':        { params: [], ret: 'element' },
                'popleft':    { params: [], ret: 'element' },
                'rotate':     { params: ['n=1'], ret: 'None' }
            }
        },
        'TreeNode': {
            methods: ['val', 'left', 'right'],
            signatures: {}
        },
        'ListNode': {
            methods: ['val', 'next'],
            signatures: {}
        }
    };

    // --- Python Snippets ---
    const PYTHON_SNIPPETS = [
        {
            label: 'for-range',
            snippet: 'for ${1:i} in range(${2:n}):\n\t${0}',
            detail: 'For loop with range()'
        },
        {
            label: 'for-each',
            snippet: 'for ${1:x} in ${2:iterable}:\n\t${0}',
            detail: 'For-each loop'
        },
        {
            label: 'for-enumerate',
            snippet: 'for ${1:i}, ${2:x} in enumerate(${3:iterable}):\n\t${0}',
            detail: 'For loop with index'
        },
        {
            label: 'for-zip',
            snippet: 'for ${1:a}, ${2:b} in zip(${3:list1}, ${4:list2}):\n\t${0}',
            detail: 'Parallel iteration with zip'
        },
        {
            label: 'while',
            snippet: 'while ${1:condition}:\n\t${0}',
            detail: 'While loop'
        },
        {
            label: 'if',
            snippet: 'if ${1:condition}:\n\t${0}',
            detail: 'If statement'
        },
        {
            label: 'if-else',
            snippet: 'if ${1:condition}:\n\t${0}\nelse:\n\t',
            detail: 'If-else statement'
        },
        {
            label: 'dfs',
            snippet: 'def dfs(${1:u}):\n\tif ${1:u} == ${2:target}:\n\t\treturn\n\tvisited.add(${1:u})\n\tfor ${3:v} in adj[${1:u}]:\n\t\tif ${3:v} not in visited:\n\t\t\tdfs(${3:v})',
            detail: 'DFS Template (recursive)'
        },
        {
            label: 'bfs',
            snippet: 'from collections import deque\nq = deque([${1:start}])\nvisited = set([${1:start}])\nwhile q:\n\t${2:u} = q.popleft()\n\t${0}\n\tfor ${3:v} in adj[${2:u}]:\n\t\tif ${3:v} not in visited:\n\t\t\tvisited.add(${3:v})\n\t\t\tq.append(${3:v})',
            detail: 'BFS Template'
        },
        {
            label: 'binary_search',
            snippet: 'l, r = 0, ${1:n} - 1\nwhile l <= r:\n\tmid = l + (r - l) // 2\n\tif ${2:check}(mid):\n\t\tl = mid + 1\n\telse:\n\t\tr = mid - 1',
            detail: 'Binary Search Template'
        },
        {
            label: 'sort',
            snippet: '${1:arr}.sort()',
            detail: 'Sort in place'
        },
        {
            label: 'sort-key',
            snippet: '${1:arr}.sort(key=lambda x: x${2:[0]})',
            detail: 'Sort with key function'
        },
        {
            label: 'sorted',
            snippet: 'sorted(${1:iterable}, key=lambda x: ${2:x})',
            detail: 'Return sorted copy'
        },
        {
            label: 'list-comp',
            snippet: '[${1:expr} for ${2:x} in ${3:iterable}]',
            detail: 'List comprehension'
        },
        {
            label: 'list-comp-if',
            snippet: '[${1:expr} for ${2:x} in ${3:iterable} if ${4:condition}]',
            detail: 'List comprehension with filter'
        },
        {
            label: 'dict-comp',
            snippet: '{${1:k}: ${2:v} for ${3:item} in ${4:iterable}}',
            detail: 'Dict comprehension'
        },
        {
            label: 'lambda',
            snippet: 'lambda ${1:x}: ${2:expr}',
            detail: 'Lambda function'
        },
        {
            label: 'defaultdict',
            snippet: 'from collections import defaultdict\n${1:d} = defaultdict(${2:list})',
            detail: 'Default dict import'
        },
        {
            label: 'Counter',
            snippet: 'from collections import Counter\n${1:cnt} = Counter(${2:iterable})',
            detail: 'Counter for frequency counting'
        },
        {
            label: 'print',
            snippet: 'print(${1:msg})',
            detail: 'Print to stdout'
        }
    ];

    // --- Python Module Functions (not tied to a variable) ---
    const PYTHON_MODULE_FUNCTIONS = [
        { label: 'len', detail: 'Get length of container' },
        { label: 'range', detail: 'Generate number sequence' },
        { label: 'enumerate', detail: 'Iterate with index' },
        { label: 'zip', detail: 'Parallel iteration' },
        { label: 'map', detail: 'Apply function to iterable' },
        { label: 'filter', detail: 'Filter iterable by predicate' },
        { label: 'sum', detail: 'Sum of elements' },
        { label: 'max', detail: 'Maximum element' },
        { label: 'min', detail: 'Minimum element' },
        { label: 'abs', detail: 'Absolute value' },
        { label: 'sorted', detail: 'Return sorted list' },
        { label: 'reversed', detail: 'Return reversed iterator' },
        { label: 'any', detail: 'True if any element is truthy' },
        { label: 'all', detail: 'True if all elements are truthy' },
        { label: 'isinstance', detail: 'Check instance type' },
        { label: 'chr', detail: 'Integer to character' },
        { label: 'ord', detail: 'Character to integer' },
        { label: 'int', detail: 'Convert to integer' },
        { label: 'str', detail: 'Convert to string' },
        { label: 'float', detail: 'Convert to float' },
        { label: 'list', detail: 'Convert to list' },
        { label: 'set', detail: 'Convert to set' },
        { label: 'dict', detail: 'Create dictionary' },
        { label: 'tuple', detail: 'Create tuple' }
    ];

    // ============================================================
    //  SECTION 2: Utility Functions
    // ============================================================

    function normalizeType(rawType) {
        if (!rawType) return '';
        let t = rawType.trim();
        // Remove leading qualifiers
        t = t.replace(/^(const|static|unsigned|signed|volatile|final)\s+/, '');
        // Remove pointers and references
        t = t.replace(/[&*]+/g, '').trim();
        // Remove trailing const qualifier
        t = t.replace(/\s+const$/, '').trim();
        // Extract template base name: e.g. "vector<int>" -> "vector"
        const m = /^([a-zA-Z_]\w*)\s*<.+>/.exec(t);
        if (m) return m[1];
        // Remove array brackets: e.g. "int[]" -> "int"
        t = t.replace(/\[\s*\]/g, '');
        return t;
    }

    function debounce(fn, ms) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), ms);
        };
    }

    function getRange(position, word) {
        return {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
        };
    }

    // ============================================================
    //  SECTION 3: Variable Type Extraction
    // ============================================================

    const KEYWORD_BLOCKLIST = new Set([
        'return', 'class', 'struct', 'if', 'else', 'while', 'for', 'do',
        'switch', 'case', 'default', 'public', 'private', 'protected',
        'new', 'delete', 'try', 'catch', 'throw', 'throws', 'finally',
        'const', 'static', 'void', 'int', 'long', 'double', 'float',
        'char', 'bool', 'boolean', 'String', 'auto', 'short', 'byte',
        'sizeof', 'typeof', 'true', 'false', 'null', 'nullptr', 'None',
        'True', 'False', 'and', 'or', 'not', 'is', 'in', 'import', 'from',
        'def', 'class', 'pass', 'continue', 'break', 'yield', 'with', 'as'
    ]);

    function buildCppVarTable(code, model, position) {
        const varTable = new Map();
        // Match: [const/static] Type<...> *& varName [= init];
        const re = /(?:(?:const|static|unsigned|signed)\s+)*(?:unsigned\s+)?([a-zA-Z_]\w*(?:\s*<[^>]*>)?)\s*[*&]*\s+([a-zA-Z_]\w*)\s*(?:\[[^\]]*\])?\s*(?:=|;|,|\)|\{)/g;

        let m;
        while ((m = re.exec(code)) !== null) {
            const rawType = m[1].trim();
            const name = m[2];
            if (KEYWORD_BLOCKLIST.has(name)) continue;
            // Skip function definitions: name followed by (
            const after = code.substring(m.index + m[0].length);
            if (/^\s*\(/.test(after)) continue;
            varTable.set(name, {
                type: rawType,
                normalizedType: normalizeType(rawType)
            });
        }

        // Parse function parameters
        const paramsRe = /\(([^)]*)\)/g;
        let pm;
        const codeUpToCursor = getCodeUpToCursor(code, model, position);
        while ((pm = paramsRe.exec(codeUpToCursor)) !== null) {
            const params = pm[1].split(',');
            for (const param of params) {
                const parts = param.trim().split(/\s+/);
                if (parts.length >= 2) {
                    const pName = parts[parts.length - 1].replace(/[*&]/g, '');
                    if (pName && !KEYWORD_BLOCKLIST.has(pName) && !varTable.has(pName)) {
                        const pType = parts.slice(0, -1).join(' ');
                        varTable.set(pName, {
                            type: pType.trim(),
                            normalizedType: normalizeType(pType)
                        });
                    }
                }
            }
        }

        return varTable;
    }

    function buildJavaVarTable(code, model, position) {
        const varTable = new Map();
        // Pattern: Type<...> varName = ...; or Type varName;
        const re = /([a-zA-Z_]\w*(?:\s*<[^>]*>)?(?:\s*\[\s*\])*)\s+([a-zA-Z_]\w*)\s*(?:=|;|,|\))/g;

        let m;
        while ((m = re.exec(code)) !== null) {
            const rawType = m[1].trim();
            const name = m[2];
            if (KEYWORD_BLOCKLIST.has(name)) continue;
            // Skip function definitions
            const after = code.substring(m.index + m[0].length);
            if (/^\s*\(/.test(after)) continue;
            varTable.set(name, {
                type: rawType,
                normalizedType: normalizeType(rawType)
            });
        }

        // Parse enhanced for-loop variables: for (Type var : collection)
        const forEachRe = /for\s*\(\s*([a-zA-Z_]\w*(?:\s*<[^>]*>)?)\s+([a-zA-Z_]\w*)\s*:/g;
        while ((m = forEachRe.exec(code)) !== null) {
            const rawType = m[1].trim();
            const name = m[2];
            if (!varTable.has(name)) {
                varTable.set(name, {
                    type: rawType,
                    normalizedType: normalizeType(rawType)
                });
            }
        }

        return varTable;
    }

    function buildPythonVarTable(code, model, position) {
        const varTable = new Map();
        // Python type hints: var: Type = value
        const hintRe = /([a-zA-Z_]\w*)\s*:\s*([a-zA-Z_]\w*(?:\[[^\]]*\])?)\s*(?:=)/g;
        let m;
        while ((m = hintRe.exec(code)) !== null) {
            const name = m[1];
            const rawType = m[2].trim();
            if (KEYWORD_BLOCKLIST.has(name)) continue;
            varTable.set(name, {
                type: rawType,
                normalizedType: normalizeType(rawType)
            });
        }

        // Common patterns without type hints
        // nums = [], list(), set(), dict(), {}
        const inferRe = /([a-zA-Z_]\w*)\s*=\s*(\[\s*\]|list\s*\(|set\s*\(|dict\s*\(|\{\s*\}|deque\s*\()/g;
        while ((m = inferRe.exec(code)) !== null) {
            const name = m[1];
            const init = m[2];
            if (KEYWORD_BLOCKLIST.has(name)) continue;
            let inferredType = 'list';
            if (/set\s*\(/.test(init)) inferredType = 'set';
            else if (/dict\s*\(/.test(init)) inferredType = 'dict';
            else if (/\{\s*\}/.test(init)) inferredType = 'dict';
            else if (/deque\s*\(/.test(init)) inferredType = 'deque';
            if (!varTable.has(name)) {
                varTable.set(name, {
                    type: inferredType,
                    normalizedType: inferredType
                });
            }
        }

        return varTable;
    }

    function getCodeUpToCursor(code, model, position) {
        const lines = code.split('\n');
        const prevLines = lines.slice(0, position.lineNumber - 1);
        const curLine = lines[position.lineNumber - 1];
        const curLineUpToCursor = curLine ? curLine.substring(0, position.column - 1) : '';
        return prevLines.concat(curLineUpToCursor).join('\n');
    }

    // ============================================================
    //  SECTION 4: Monaco Instance Acquisition
    // ============================================================

    function getMonaco() {
        return new Promise((resolve) => {
            // Fast path: already available
            if (unsafeWindow.monaco && unsafeWindow.monaco.editor && unsafeWindow.monaco.editor.getModels) {
                resolve(unsafeWindow.monaco);
                return;
            }

            let attempts = 0;
            const maxAttempts = 150; // 30 seconds at 200ms intervals

            const interval = setInterval(() => {
                attempts++;
                if (unsafeWindow.monaco && unsafeWindow.monaco.editor && unsafeWindow.monaco.editor.getModels) {
                    clearInterval(interval);
                    resolve(unsafeWindow.monaco);
                    return;
                }
                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    console.warn('[LeetFill] Monaco editor not found after', maxAttempts * 200, 'ms. Giving up.');
                    resolve(null);
                }
            }, 200);
        });
    }

    // ============================================================
    //  SECTION 5: Suggestion Factories
    // ============================================================

    function makeMemberSuggestions(methods, monaco, range) {
        return methods.map(m => ({
            label: m,
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: m,
            sortText: '00_' + m,
            range: range
        }));
    }

    function makeSnippetSuggestions(snippets, monaco, range) {
        return snippets.map(s => ({
            label: s.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: s.snippet,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: s.detail || '',
            sortText: '10_' + s.label,
            range: range
        }));
    }

    function makeVariableSuggestions(varTable, monaco, range) {
        const suggestions = [];
        varTable.forEach((info, name) => {
            suggestions.push({
                label: name,
                kind: monaco.languages.CompletionItemKind.Variable,
                detail: info.type,
                insertText: name,
                sortText: '20_' + name,
                range: range
            });
        });
        return suggestions;
    }

    function makeTypeSuggestions(apiDict, monaco, range) {
        return Object.keys(apiDict).map(name => ({
            label: name,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: name,
            sortText: '30_' + name,
            range: range
        }));
    }

    // ============================================================
    //  SECTION 6: Completion Providers (per language)
    // ============================================================

    function registerCppCompletion(monaco) {
        let varTable = new Map();

        const buildIndex = (model) => {
            try {
                const code = model.getValue();
                varTable = buildCppVarTable(code, model, { lineNumber: 99999, column: 1 });
            } catch (e) { /* ignore parse errors during live editing */ }
        };

        const debouncedBuild = debounce(buildIndex, 600);

        monaco.languages.registerCompletionItemProvider('cpp', {
            triggerCharacters: ['.', '>', ':', '<', '"'],
            provideCompletionItems: (model, position) => {
                try {
                    const word = model.getWordUntilPosition(position);
                    const range = getRange(position, word);

                    const textUntil = model.getValueInRange({
                        startLineNumber: position.lineNumber, startColumn: 1,
                        endLineNumber: position.lineNumber, endColumn: position.column
                    });

                    // --- #include header completion ---
                    const includeMatch = textUntil.trim().match(/#include\s*([<"])([^>"]*)$/);
                    if (includeMatch) {
                        const quote = includeMatch[1];
                        const prefix = includeMatch[2] ? includeMatch[2].toLowerCase() : '';
                        const closeChar = quote === '<' ? '>' : '"';
                        const suggestions = CPP_HEADERS
                            .filter(h => h.label.toLowerCase().startsWith(prefix))
                            .map(h => ({
                                label: h.label,
                                kind: monaco.languages.CompletionItemKind.Module,
                                insertText: h.label + closeChar,
                                detail: h.detail,
                                sortText: '00_' + h.label,
                                range: range
                            }));
                        return { suggestions };
                    }

                    // --- Member access: var. or var-> or var:: ---
                    const memberMatch = textUntil.trim().match(/([a-zA-Z_]\w*)\s*(\.|->|::)$/);
                    if (memberMatch) {
                        const varName = memberMatch[1];
                        const varInfo = varTable.get(varName);
                        if (varInfo) {
                            const api = CPP_API[varInfo.normalizedType];
                            if (api && api.methods) {
                                return { suggestions: makeMemberSuggestions(api.methods, monaco, range) };
                            }
                        }
                        // If var not in table, try matching against known types directly
                        // e.g. "vector<int> nums; nums." -> should still work
                        const knownType = CPP_API[memberMatch[1]];
                        if (knownType) {
                            return { suggestions: makeMemberSuggestions(knownType.methods, monaco, range) };
                        }
                        return { suggestions: [] };
                    }

                    // Check for :: scope access (e.g. std::)
                    const scopeMatch = textUntil.trim().match(/([a-zA-Z_]\w*)::$/);
                    if (scopeMatch) {
                        const nsName = scopeMatch[1];
                        if (nsName === 'std') {
                            // Return C++ utility functions
                            const suggestions = CPP_UTIL_FUNCTIONS.map(f => ({
                                label: f,
                                kind: monaco.languages.CompletionItemKind.Function,
                                insertText: f,
                                sortText: '05_' + f,
                                range: range
                            }));
                            return { suggestions };
                        }
                        return { suggestions: [] };
                    }

                    // No trigger character: global suggestions
                    const suggestions = [];
                    const seen = new Set();

                    // Variable name suggestions
                    for (const s of makeVariableSuggestions(varTable, monaco, range)) {
                        if (!seen.has(s.label)) { suggestions.push(s); seen.add(s.label); }
                    }
                    // Snippet suggestions
                    for (const s of makeSnippetSuggestions(CPP_SNIPPETS, monaco, range)) {
                        if (!seen.has(s.label)) { suggestions.push(s); seen.add(s.label); }
                    }
                    // Type name suggestions
                    for (const s of makeTypeSuggestions(CPP_API, monaco, range)) {
                        if (!seen.has(s.label)) { suggestions.push(s); seen.add(s.label); }
                    }

                    return { suggestions };
                } catch (e) {
                    return { suggestions: [] };
                }
            }
        });

        const initModel = () => {
            const models = monaco.editor.getModels();
            if (models.length > 0) {
                buildIndex(models[0]);
                models[0].onDidChangeContent(() => debouncedBuild(models[0]));
            }
        };

        // Wire model change listener to rebuild index
        monaco.editor.onDidCreateEditor((editor) => {
            setTimeout(() => {
                try {
                    editor.updateOptions({ suggestOnTriggerCharacters: true });
                    editor.updateOptions({ quickSuggestions: { comments: 'on', strings: 'on', other: 'on' } });
                } catch (_) {}
                const model = editor.getModel();
                if (model && model.getLanguageId() === 'cpp') {
                    buildIndex(model);
                    model.onDidChangeContent(() => debouncedBuild(model));
                }
            }, 300);
        });

        initModel();
    }

    function registerJavaCompletion(monaco) {
        let varTable = new Map();

        const buildIndex = (model) => {
            try {
                const code = model.getValue();
                varTable = buildJavaVarTable(code, model, { lineNumber: 99999, column: 1 });
            } catch (e) {}
        };

        const debouncedBuild = debounce(buildIndex, 600);

        monaco.languages.registerCompletionItemProvider('java', {
            triggerCharacters: ['.'],
            provideCompletionItems: (model, position) => {
                try {
                    const word = model.getWordUntilPosition(position);
                    const range = getRange(position, word);

                    const textUntil = model.getValueInRange({
                        startLineNumber: position.lineNumber, startColumn: 1,
                        endLineNumber: position.lineNumber, endColumn: position.column
                    });

                    const memberMatch = textUntil.trim().match(/([a-zA-Z_]\w*)\.$/);
                    if (memberMatch) {
                        const varName = memberMatch[1];
                        const varInfo = varTable.get(varName);
                        if (varInfo) {
                            const api = JAVA_API[varInfo.normalizedType];
                            if (api && api.methods) {
                                return { suggestions: makeMemberSuggestions(api.methods, monaco, range) };
                            }
                        }
                        // Check if it's a static class name directly
                        const knownType = JAVA_API[varName];
                        if (knownType) {
                            return { suggestions: makeMemberSuggestions(knownType.methods, monaco, range) };
                        }
                        return { suggestions: [] };
                    }

                    // Global suggestions
                    const suggestions = [];
                    const seen = new Set();

                    for (const s of makeVariableSuggestions(varTable, monaco, range)) {
                        if (!seen.has(s.label)) { suggestions.push(s); seen.add(s.label); }
                    }
                    for (const s of makeSnippetSuggestions(JAVA_SNIPPETS, monaco, range)) {
                        if (!seen.has(s.label)) { suggestions.push(s); seen.add(s.label); }
                    }
                    for (const s of makeTypeSuggestions(JAVA_API, monaco, range)) {
                        if (!seen.has(s.label)) { suggestions.push(s); seen.add(s.label); }
                    }

                    return { suggestions };
                } catch (e) {
                    return { suggestions: [] };
                }
            }
        });

        monaco.editor.onDidCreateEditor((editor) => {
            setTimeout(() => {
                try {
                    editor.updateOptions({ suggestOnTriggerCharacters: true });
                    editor.updateOptions({ quickSuggestions: { comments: 'on', strings: 'on', other: 'on' } });
                } catch (_) {}
                const model = editor.getModel();
                if (model && model.getLanguageId() === 'java') {
                    buildIndex(model);
                    model.onDidChangeContent(() => debouncedBuild(model));
                }
            }, 300);
        });

        const models = monaco.editor.getModels();
        if (models.length > 0) {
            buildIndex(models[0]);
            models[0].onDidChangeContent(() => debouncedBuild(models[0]));
        }
    }

    function registerPythonCompletion(monaco) {
        let varTable = new Map();

        const buildIndex = (model) => {
            try {
                const code = model.getValue();
                varTable = buildPythonVarTable(code, model, { lineNumber: 99999, column: 1 });
            } catch (e) {}
        };

        const debouncedBuild = debounce(buildIndex, 600);

        monaco.languages.registerCompletionItemProvider('python', {
            triggerCharacters: ['.'],
            provideCompletionItems: (model, position) => {
                try {
                    const word = model.getWordUntilPosition(position);
                    const range = getRange(position, word);

                    const textUntil = model.getValueInRange({
                        startLineNumber: position.lineNumber, startColumn: 1,
                        endLineNumber: position.lineNumber, endColumn: position.column
                    });

                    const memberMatch = textUntil.trim().match(/([a-zA-Z_]\w*)\.$/);
                    if (memberMatch) {
                        const varName = memberMatch[1];
                        const varInfo = varTable.get(varName);
                        if (varInfo) {
                            const api = PYTHON_API[varInfo.normalizedType];
                            if (api && api.methods) {
                                return { suggestions: makeMemberSuggestions(api.methods, monaco, range) };
                            }
                        }
                        // Check if it's a known type name used as a literal
                        const knownType = PYTHON_API[varName];
                        if (knownType) {
                            return { suggestions: makeMemberSuggestions(knownType.methods, monaco, range) };
                        }
                        return { suggestions: [] };
                    }

                    // Global suggestions
                    const suggestions = [];
                    const seen = new Set();

                    for (const s of makeVariableSuggestions(varTable, monaco, range)) {
                        if (!seen.has(s.label)) { suggestions.push(s); seen.add(s.label); }
                    }
                    for (const s of makeSnippetSuggestions(PYTHON_SNIPPETS, monaco, range)) {
                        if (!seen.has(s.label)) { suggestions.push(s); seen.add(s.label); }
                    }
                    for (const s of makeTypeSuggestions(PYTHON_API, monaco, range)) {
                        if (!seen.has(s.label)) { suggestions.push(s); seen.add(s.label); }
                    }
                    for (const f of PYTHON_MODULE_FUNCTIONS) {
                        if (!seen.has(f.label)) {
                            suggestions.push({
                                label: f.label,
                                kind: monaco.languages.CompletionItemKind.Function,
                                detail: f.detail,
                                insertText: f.label,
                                sortText: '15_' + f.label,
                                range: range
                            });
                            seen.add(f.label);
                        }
                    }

                    return { suggestions };
                } catch (e) {
                    return { suggestions: [] };
                }
            }
        });

        monaco.editor.onDidCreateEditor((editor) => {
            setTimeout(() => {
                try {
                    editor.updateOptions({ suggestOnTriggerCharacters: true });
                    editor.updateOptions({ quickSuggestions: { comments: 'on', strings: 'on', other: 'on' } });
                } catch (_) {}
                const model = editor.getModel();
                if (model && model.getLanguageId() === 'python') {
                    buildIndex(model);
                    model.onDidChangeContent(() => debouncedBuild(model));
                }
            }, 300);
        });

        const models = monaco.editor.getModels();
        if (models.length > 0) {
            buildIndex(models[0]);
            models[0].onDidChangeContent(() => debouncedBuild(models[0]));
        }
    }

    // ============================================================
    //  SECTION 7: Hover Provider
    // ============================================================

    function registerHoverProviders(monaco) {
        const languages = ['cpp', 'java', 'python'];
        const apis = { cpp: CPP_API, java: JAVA_API, python: PYTHON_API };

        for (const lang of languages) {
            monaco.languages.registerHoverProvider(lang, {
                provideHover: (model, position) => {
                    try {
                        const word = model.getWordAtPosition(position);
                        if (!word) return null;

                        // Check API dictionaries for this word
                        const api = apis[lang];
                        if (api && api[word.word]) {
                            const methods = api[word.word].methods || [];
                            const methodList = methods.slice(0, 15).join(', ');
                            const more = methods.length > 15 ? ` (+${methods.length - 15} more)` : '';
                            return {
                                range: {
                                    startLineNumber: position.lineNumber,
                                    startColumn: word.startColumn,
                                    endLineNumber: position.lineNumber,
                                    endColumn: word.endColumn
                                },
                                contents: [
                                    { value: `**${word.word}** — ${lang} type` },
                                    { value: `Methods: ${methodList}${more}` }
                                ]
                            };
                        }
                    } catch (_) {}
                    return null;
                }
            });
        }
    }

    // ============================================================
    //  SECTION 8: Signature Help Provider
    // ============================================================

    function registerSignatureProviders(monaco) {
        // C++ Signature Help
        monaco.languages.registerSignatureHelpProvider('cpp', {
            signatureHelpTriggerCharacters: ['(', ','],
            provideSignatureHelp: (model, position) => {
                try {
                    const textUntil = model.getValueInRange({
                        startLineNumber: position.lineNumber, startColumn: 1,
                        endLineNumber: position.lineNumber, endColumn: position.column
                    });

                    // Find function name before the last (
                    const m = textUntil.match(/([a-zA-Z_]\w*)\s*\(([^)]*)$/);
                    if (!m) return null;

                    const funcName = m[1];

                    // Search through CPP_API for matching method signatures
                    for (const [typeName, typeInfo] of Object.entries(CPP_API)) {
                        if (typeInfo.signatures && typeInfo.signatures[funcName]) {
                            const sig = typeInfo.signatures[funcName];
                            return {
                                activeSignature: 0,
                                activeParameter: m[2].split(',').length - 1,
                                signatures: [{
                                    label: `${typeName}::${funcName}(${sig.params.join(', ')}) -> ${sig.ret}`,
                                    documentation: `${typeName} member function`,
                                    parameters: sig.params.map(p => ({ label: p }))
                                }]
                            };
                        }
                    }

                    // Check C++ utility functions
                    const utilSigs = {
                        'sort': { params: ['iterator first', 'iterator last', 'Compare comp = less<>()'], ret: 'void' },
                        'reverse': { params: ['iterator first', 'iterator last'], ret: 'void' },
                        'max': { params: ['const T& a', 'const T& b'], ret: 'const T&' },
                        'min': { params: ['const T& a', 'const T& b'], ret: 'const T&' },
                        'accumulate': { params: ['iterator first', 'iterator last', 'T init'], ret: 'T' },
                        'lower_bound': { params: ['iterator first', 'iterator last', 'const T& value'], ret: 'iterator' },
                        'upper_bound': { params: ['iterator first', 'iterator last', 'const T& value'], ret: 'iterator' },
                        'find': { params: ['iterator first', 'iterator last', 'const T& value'], ret: 'iterator' },
                        'swap': { params: ['T& a', 'T& b'], ret: 'void' },
                        'memset': { params: ['void* ptr', 'int value', 'size_t num'], ret: 'void*' }
                    };

                    if (utilSigs[funcName]) {
                        const sig = utilSigs[funcName];
                        return {
                            activeSignature: 0,
                            activeParameter: m[2].split(',').length - 1,
                            signatures: [{
                                label: `${funcName}(${sig.params.join(', ')}) -> ${sig.ret}`,
                                parameters: sig.params.map(p => ({ label: p }))
                            }]
                        };
                    }
                } catch (_) {}
                return null;
            }
        });

        // Python Signature Help
        monaco.languages.registerSignatureHelpProvider('python', {
            signatureHelpTriggerCharacters: ['(', ','],
            provideSignatureHelp: (model, position) => {
                try {
                    const textUntil = model.getValueInRange({
                        startLineNumber: position.lineNumber, startColumn: 1,
                        endLineNumber: position.lineNumber, endColumn: position.column
                    });

                    const m = textUntil.match(/([a-zA-Z_]\w*)\s*\(([^)]*)$/);
                    if (!m) return null;

                    const funcName = m[1];

                    for (const [typeName, typeInfo] of Object.entries(PYTHON_API)) {
                        if (typeInfo.signatures && typeInfo.signatures[funcName]) {
                            const sig = typeInfo.signatures[funcName];
                            return {
                                activeSignature: 0,
                                activeParameter: m[2].split(',').length - 1,
                                signatures: [{
                                    label: `${typeName}.${funcName}(${sig.params.join(', ')}) -> ${sig.ret}`,
                                    parameters: sig.params.map(p => ({ label: p }))
                                }]
                            };
                        }
                    }

                    // Python builtins
                    const builtinSigs = {
                        'len': { params: ['obj'], ret: 'int' },
                        'range': { params: ['start', 'stop', 'step=1'], ret: 'range' },
                        'enumerate': { params: ['iterable', 'start=0'], ret: 'enumerate' },
                        'zip': { params: ['*iterables'], ret: 'zip' },
                        'sum': { params: ['iterable', 'start=0'], ret: 'number' },
                        'sorted': { params: ['iterable', 'key=None', 'reverse=False'], ret: 'list' },
                        'max': { params: ['iterable', 'key=None'], ret: 'element' },
                        'min': { params: ['iterable', 'key=None'], ret: 'element' },
                        'print': { params: ['*objects', 'sep=" "', 'end="\\n"'], ret: 'None' }
                    };

                    if (builtinSigs[funcName]) {
                        const sig = builtinSigs[funcName];
                        return {
                            activeSignature: 0,
                            activeParameter: m[2].split(',').length - 1,
                            signatures: [{
                                label: `${funcName}(${sig.params.join(', ')}) -> ${sig.ret}`,
                                parameters: sig.params.map(p => ({ label: p }))
                            }]
                        };
                    }
                } catch (_) {}
                return null;
            }
        });
    }

    // ============================================================
    //  SECTION 9: Bootstrap & Initialization
    // ============================================================

    async function init() {
        try {
            const monaco = await getMonaco();
            if (!monaco) {
                console.warn('[LeetFill] Could not find Monaco editor. Aborting.');
                return;
            }

            // Enable trigger characters globally for all editors
            monaco.editor.onDidCreateEditor((editor) => {
                setTimeout(() => {
                    try {
                        editor.updateOptions({
                            suggestOnTriggerCharacters: true,
                            quickSuggestions: { comments: 'on', strings: 'on', other: 'on' }
                        });
                    } catch (e) {
                        console.warn('[LeetFill] Failed to update editor options:', e.message);
                    }
                }, 500);
            });

            // Also update existing editor(s)
            const models = monaco.editor.getModels();
            if (models.length > 0) {
                const editors = monaco.editor.getEditors ? monaco.editor.getEditors() : [];
                for (const editor of editors) {
                    try {
                        editor.updateOptions({
                            suggestOnTriggerCharacters: true,
                            quickSuggestions: { comments: 'on', strings: 'on', other: 'on' }
                        });
                    } catch (_) {}
                }
            }

            // Register completion providers
            try { registerCppCompletion(monaco); } catch (e) {
                console.warn('[LeetFill] Failed to register C++ completion:', e.message);
            }
            try { registerJavaCompletion(monaco); } catch (e) {
                console.warn('[LeetFill] Failed to register Java completion:', e.message);
            }
            try { registerPythonCompletion(monaco); } catch (e) {
                console.warn('[LeetFill] Failed to register Python completion:', e.message);
            }

            // Register hover providers
            try { registerHoverProviders(monaco); } catch (e) {
                console.warn('[LeetFill] Failed to register hover providers:', e.message);
            }

            // Register signature help providers
            try { registerSignatureProviders(monaco); } catch (e) {
                console.warn('[LeetFill] Failed to register signature providers:', e.message);
            }

            console.log('%c[LeetFill] v1.0.0 %cC++ | Java | Python — method completion, snippets, headers, signatures loaded.',
                'background:#1a1a2e;color:#e94560;padding:2px 6px;font-weight:bold',
                'color:#aaa');
        } catch (e) {
            console.error('[LeetFill] Initialization error:', e.message);
        }
    }

    // Start when page is ready
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
    } else {
        setTimeout(init, 500);
    }

})();
