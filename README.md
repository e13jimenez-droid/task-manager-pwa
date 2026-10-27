# Task Manager PWA

ADHD-friendly task manager — installable PWA fork of the desktop work version.

## What This Is

Fork of `~/projects/task-manager/task-manager.html` (v6.12) with PWA scaffolding:
- `manifest.json` — app identity for browsers
- `sw.js` — service worker for offline use (cache-first CDN, network-first app shell)
- `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` — app icons
- `index.html` — the app (clean copy of v6.12 + PWA meta tags + SW registration)

## Relationship to Work Version

- **Work version** (`~/projects/task-manager/`) is the source of truth for features.
- **PWA fork** (this repo) diverges for mobile UX: bottom nav, visible save button, file picker, responsive breakpoints.
- **Sync is manual port**, not git merge. When updating the PWA: diff work version against `index.html`, port feature changes, preserve mobile UX diffs.
- Work version stays local-only (no git). PWA is on GitHub Pages.

## Hosting

GitHub Pages. Push to `main`, enable Pages in repo settings → Source: main / root.

## Current Status

- v6.12 clean copy + Pass 2 mobile UX
- PWA scaffolding: manifest, service worker, icons, meta tags, SW registration
- Mobile UX: bottom nav bar, header overflow menu, safe area insets, HUD hidden on mobile, responsive breakpoints, modal slide-up
- Desktop layout unchanged — all mobile changes gated behind @media (max-width: 700px)
- Live on GitHub Pages: https://e13jimenez-droid.github.io/task-manager-pwa/
- Browser-verified: 0 console errors, mobile + desktop layouts confirmed