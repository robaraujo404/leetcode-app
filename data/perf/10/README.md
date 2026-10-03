# Problem 10 — Course Schedule II

- Shape: 100k courses, 200k prerequisites, random DAG
- Time limit: 2 s
- Rejects: recursive DFS (deep chains) and O(V·E) re-scanning
- Same input shape as `tests.json`.
- `input_cycle.json` adds one edge that closes a cycle → expected `[]`.
