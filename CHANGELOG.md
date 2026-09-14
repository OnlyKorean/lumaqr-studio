# Changelog

All notable changes to **LumaQR Studio** are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [SemVer](https://semver.org/).

## [1.0.1] — 2026-09-14

### Added
- `CHANGELOG.md` — release history for the project.
- `README.md` § **Repository Status** — a full manifest of the 67 tracked files plus a reproducible
  verification log (`npm ci` → `npm run build` → `npm run smoke`), so completeness can be checked
  from a clean clone at any time.

### Changed
- Version bumped to `1.0.1` in `package.json`, `package-lock.json` and the Settings → About panel.
- Full source tree re-pushed and re-verified against `origin/main` (all 67 blobs identical, tree hash
  `99f9697` unchanged where content did not change).

### Verified
- `npm run build` — TypeScript `tsc -b` clean; Vite production build succeeds (492 kB JS / 48 kB CSS).
- `npm run smoke` — 43 headless unit checks + 31 real-decode round-trip checks: **all pass, 0 failed**.

## [1.0.0] — 2026-09-14

### Added
- **LumaQR Studio** — premium, fully client-side QR design platform (React 18 + TypeScript + Vite + Tailwind).
- 8 content types with live validation: URL, text, email, phone, SMS, Wi-Fi, vCard, iCalendar event.
- Branded rendering engine (`src/lib/render.ts`): custom canvas + SVG output, dot/eye styles,
  gradients, transparent backgrounds, configurable quiet zone and error correction.
- Smart Brand Mode, 8 QR moods, 11 templates, logo placement with scan-safety caps.
- Smart Scanability Score with honest capacity probing, plus real on-device scan testing (jsQR).
- PNG / SVG / clipboard / Web Share / print-sheet export; 20-step undo/redo; localStorage persistence.
- Accessibility pass: semantic landmarks, focus management, `aria-live` toasts, reduced-motion support.

[1.0.1]: https://github.com/OnlyKorean/lumaqr-studio/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/OnlyKorean/lumaqr-studio/releases/tag/v1.0.0
