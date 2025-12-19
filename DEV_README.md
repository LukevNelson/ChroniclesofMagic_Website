Dev notes — Firebase init safety and conflict-resolution

- Per-page opt-in: `ALLOW_FIREBASE_INIT`

  Historically the site guarded Firebase initialization globally via `window.ALLOW_FIREBASE_INIT = false` to avoid accidental production writes. The pattern is now per-page: pages that should initialize Firebase set `window.ALLOW_FIREBASE_INIT = true` inline (before `js/firebase-init.js` loads). Example: `database.html` opts in by setting the flag in an inline script so the DB page initializes automatically.

  - To enable Firebase init for other pages during local testing, set the flag in the browser console before the shared init script runs (or add a short inline script to the page while testing):

    ```
    window.ALLOW_FIREBASE_INIT = true; // then reload the page
    ```

  - IMPORTANT: the repository continues to include a CI check (`.github/workflows/check-allow-firebase-init.yml`) that fails the build if `ALLOW_FIREBASE_INIT = true` appears in committed JS source. This prevents accidentally shipping a repo-level opt-in.

- Conflict resolution toggle: `REQUIRE_CONFLICT_RESOLUTION`

  There is now a runtime toggle to control whether the UI blocks cloud overwrites when local profiles are detected as newer. Default behavior is ON for the database page and persisted per-browser via `localStorage.REQUIRE_CONFLICT_RESOLUTION`.

  - Toggle name: `REQUIRE_CONFLICT_RESOLUTION` (boolean). When `true` the page will:
    - Prefer local copies for display when conflicts are recorded in `localStorage.quizProfilesConflicts`.
    - Show a blocking modal overlay listing conflicts (with per-field diffs) that requires manual resolution (Keep Local / Keep Cloud / Merge) before the UI accepts cloud changes for those profiles.
  - The toggle UI appears on the database page (top-left). You can turn it OFF to allow cloud updates to show without blocking.

- Diagnostics and localStorage keys

  - `quizProfiles`: local mirror/upserts of profiles saved locally or by the adapter.
  - `spProfiles`: legacy key (migrated by reconciler when present).
  - `quizProfilesConflicts`: array of recorded conflicts with entries like `{ id, detectedAt, local, cloud }`.
  - `REQUIRE_CONFLICT_RESOLUTION`: `'1'` or `'0'` in `localStorage` reflecting the toggle state.
  - `_lastUpdate_client`: client-side timestamp preserved alongside server-sent `_lastUpdate` sentinels for diagnostics.

- Server timestamps

  - Cloud writes now use the RTDB server timestamp sentinel: `_lastUpdate: {'.sv':'timestamp'}` and also store `_lastUpdate_client` as the client fallback. This improves conflict detection across devices with different clocks.

- Files changed / new

  - `js/firebase-config.js` — removed the floating global toggle UI; pages opt-in explicitly.
  - `database.html` — now sets `window.ALLOW_FIREBASE_INIT = true` inline so the DB page initializes Firebase by default.
  - `js/database.js` — added `REQUIRE_CONFLICT_RESOLUTION` support, a small toggle UI, enhanced blocking conflict resolver modal with per-field diffs, and `admin-conflicts.html` launcher.
  - `js/firebase-database.js` — conflict recording logic and server-sentinel writes retained/expanded.
  - `admin-conflicts.html` — new persistent admin page to inspect and resolve `quizProfilesConflicts`.

- Testing notes

  - Run a local static server (e.g. `npx http-server -p 8000`) and open `http://localhost:8000/database.html`.
  - Confirm the conflict toggle (top-left) and the modal behavior when conflicts exist. Inspect `localStorage.quizProfiles` and `localStorage.quizProfilesConflicts` for diagnostics.

- Recommended practice

  - Keep `ALLOW_FIREBASE_INIT` off globally in source. Use per-page opt-in only for pages that must initialize Firebase (like `database.html`).
  - Use the conflict resolver UI or `admin-conflicts.html` to review and resolve conflicts; prefer server timestamps to avoid false-positives due to clock skew.


