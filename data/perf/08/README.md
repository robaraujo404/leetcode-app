# Problem 8 — Number of Islands

- Shape: 1000×1000: one snake-shaped island of ~300k cells (rows 0–599) plus ~20k isolated singletons
- Time limit: 2 s
- Rejects: recursive DFS (depth ≈ 300k overflows the stack)
- Same input shape as `tests.json`.
