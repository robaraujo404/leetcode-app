# Problem 6 — LRU Cache

- Shape: capacity 5000, 200k mixed put/get over 20k keys
- Time limit: 2 s
- Rejects: O(capacity) eviction or recency update per operation (list scan / array shift)
- Same input shape as `tests.json`.
