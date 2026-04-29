# Update create-game Skill

## Goal
Standardize game output by baking the header, modals, theme, and storage patterns into the boilerplate so the agent copies rather than invents.

---

## Boilerplate (boilerplate-react)

- [x] Add `src/components/Header.tsx` — accepts `variant` ('home' | 'game'), `center` slot (string or node), `onHelp`, `onThemeToggle`, `onClose` (game only); renders help/theme/donate buttons using SVG icons
- [x] Add `src/components/Header.css` — home variant: flex-end, gap space-1, padding space-3, border-bottom; game variant: space-between, left min-width 32px, center flex-1 text-align center, right flex gap space-1; icon-btn styles (transparent, 32px, radius-sm, 16px SVG, checkers hover)
- [x] Add `src/components/Modal.tsx` — overlay + panel, focus trap, fade+scale animate in, close on backdrop click and Escape; accepts `title`, `children`, `onClose`
- [x] Add `src/components/Modal.css` — overlay, panel (min-width 420px, radius-lg, shadow-lg), header, animate styles
- [x] Add `src/components/ConfirmModal.tsx` — wraps Modal, accepts `message`, `onConfirm`, `onCancel`
- [x] Add `src/components/HelpModal.tsx` — wraps Modal, accepts `children` for game-specific content
- [x] Add `src/hooks/useTheme.ts` — loads theme from localStorage, applies light-palette/dark-palette to body, returns `[theme, toggleTheme]`
- [x] Add `src/hooks/useStorage.ts` — generic `saveState`, `loadState`, `clearState` keyed by game name
- [x] Update `src/App.tsx` — scaffold screen switching pattern (home/game phases), useTheme wired up, Header used on both screens
- [x] Update `src/App.css` — layout only (centering, min-height); remove placeholder content

---

## SKILL.md

- [x] Remove boilerplate choice logic (simple vs React) — React only
- [x] Update Step 3 to only describe React boilerplate copy + npm install
- [x] Add note: pre-built components and hooks are already in the boilerplate — use them, do not reimplement

---

## PLAN_TEMPLATE_REACT.md

- [x] Remove "horizontal rule below the header" from play screen spec
- [x] Add max-width guidance: simple/turn-based games 560px, complex board games up to 900px
- [x] Update Components section to reference pre-built Header, Modal, ConfirmModal, HelpModal
- [x] Update Styling checklist to remove items now handled by pre-built components

---

## SKILL.md — plan spec (Step 4b)

- [x] Remove "horizontal rule below the header" from home and play screen specs
- [x] Reference Header component in home and play screen specs
- [x] Add max-width guidance per game type

---

## GAME_CODER.md

- [x] Add instruction to use pre-built Header, Modal, ConfirmModal, HelpModal, useTheme, useStorage — do not reimplement
- [x] Add instruction to use Header component on every screen with correct variant and props
