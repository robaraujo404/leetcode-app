# Algo Trainer

A phone-first, installable PWA for drilling LeetCode-style interview problems without typing code. Built around the idea that passing hidden tests is the smallest part of a good interview performance — asking the right clarifying questions, planning edge cases, naming an alternative approach with its complexity, and keeping a follow-up change localized all matter more, and all of that is trainable with taps and drags on a phone.

## Modes

- **Build the algorithm** — a Parsons-problem ladder: order and nest prose steps, then real code, with distractors and fill-in-the-blank levels as it gets harder.
- **Interviewer simulator** — pick clarifying questions before coding; each costs mock-interview time.
- **Edge case hunt** — swipe through candidate edge cases, decide which ones actually matter.
- **Pattern flash** — recognize the underlying pattern (BFS, union-find, monotonic deque, ...) from the prompt alone.
- **Complexity buckets** — sort competing approaches by time complexity.
- **Bug hunt** — find the single changed line that breaks a specific hidden test.
- **Where does it change?** — given a follow-up feature request, find exactly which lines a clean implementation touches.
- **Where to log?** — given a failing test, find the fastest place to add a print statement.

Progress uses a simple Leitner-style spaced-repetition scheduler stored in `localStorage`; the "practice 5 min" session pulls whatever is most overdue across all problems and modes.

## Stack

Vite + React + TypeScript + Tailwind v4, `@dnd-kit` for touch drag-and-drop, `vite-plugin-pwa` for the installable/offline shell.

## Content pipeline

Each problem's prompt, constraints, clarifications, and visible/hidden tests live in `data/tests.json`. The training content on top of that (Parsons steps, distractors, bugs, questions, edge cards, ...) lives in `src/content/problems/*.ts`, one file per problem, typed against `src/content/schema.ts`.

`scripts/verify.ts` compiles every problem's reference solution and runs it against every test case (plus the large fixtures in `data/perf/` under a 2s budget), and checks that every authored "bug" patch actually makes its named hidden test fail. Content is only trusted once this passes:

```bash
pnpm verify        # all problems
pnpm verify 7 12   # just these ids
```

## Development

```bash
pnpm install
pnpm dev       # http://localhost:5173
pnpm build     # production build + PWA assets in dist/
pnpm preview   # serve the production build locally
```

Pushing to `main` builds and deploys `dist/` to GitHub Pages via `.github/workflows/deploy.yml`.
