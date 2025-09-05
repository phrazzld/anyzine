# TODO (Merge Blockers)

- [x] [BLOCKER] [TESTING] Add a global `window.matchMedia` mock in `tests/setup.ts` to support components that read reduced-motion preferences (CheckerLoadingState). Prevents `window.matchMedia is not a function` test failures.
- [x] [BLOCKER] [UX/TESTS] Align the default loading message across implementation, docs, and tests. Decide on a single string (e.g., "CRAFTING YOUR DIGITAL ZINE..." or "GENERATING...") and update:
  - CheckerLoadingState implementation or tests accordingly
  - SubjectForm tests that assert loading text
  ```
  Work Log:
  - Standardized on "CRAFTING YOUR DIGITAL ZINE..." as the default message
  - Updated CheckerLoadingState default from 'GENERATING...' to 'CRAFTING YOUR DIGITAL ZINE...'
  - Updated SubjectForm.test.tsx assertions to use regex pattern /CRAFTING YOUR DIGITAL ZINE/i
  - Fixed CheckerLoadingState.test.tsx to use new default message
  - Result: 6 more tests passing (165 vs 159), 24 tests still failing (down from 30)
  ```
- [ ] [BLOCKER] [TESTS] Update CheckerLoadingState tests to reflect the actual DOM structure and classes:
  - Do not assume all 240 cells have the same class; accept variant classes (checker-pulse/shimmer/static)
  - Avoid brittle assertions on Tailwind class names not present in the component (e.g., border-2, mx-auto, p-6)
  - Assert high-level behavior (overlay presence, 240 grid items, fade-out on error, reduced-motion spinner)
- [ ] [BLOCKER] [TESTS] Update SubjectForm tests for the new empty-state and loading UX:
  - Remove legacy empty-state copy assertions (e.g., "no zine yet...")
  - Assert presence of the floating top form and the SubjectCarousel in empty state
  - Update loading assertions to check the full-screen checker overlay message (or ARIA role="status" once added)

