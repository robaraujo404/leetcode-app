# Problem 3 — My Calendar I

- Shape: 100k bookings, random starts in [0, 1e9), lengths 1–2000 (≈98% accepted)
- Time limit: 2 s
- Rejects: scanning every stored interval per booking (O(n²))
- Same input shape as `tests.json`.
