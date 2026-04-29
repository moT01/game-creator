# Update create-game Skill

## Goal
Standardize game output by baking the header, modals, theme, and storage patterns into the boilerplate so the agent copies rather than invents.

---

## Boilerplate (boilerplate-react)

- [ ] Add `src/components/Header.tsx` — accepts `variant` ('home' | 'game'), `center` slot (string or node), `onHelp`, `onThemeToggle`, `onClose` (game only); renders help/theme/donate buttons using SVG icons
- [ ] Add `src/components/Header.css` — home variant: flex-end, gap space-1, padding space-3, border-bottom; game variant: space-between, left min-width 32px, center flex-1 text-align center, right flex gap space-1; icon-btn styles (transparent, 32px, radius-sm, 16px SVG, checkers hover)
- [ ] Add `src/components/Modal.tsx` — overlay + panel, focus trap, fade+scale animate in, close on backdrop click and Escape; accepts `title`, `children`, `onClose`
- [ ] Add `src/components/Modal.css` — overlay, panel (min-width 420px, radius-lg, shadow-lg), header, animate styles
- [ ] Add `src/components/ConfirmModal.tsx` — wraps Modal, accepts `message`, `onConfirm`, `onCancel`
- [ ] Add `src/components/HelpModal.tsx` — wraps Modal, accepts `children` for game-specific content
- [ ] Add `src/hooks/useTheme.ts` — loads theme from localStorage, applies light-palette/dark-palette to body, returns `[theme, toggleTheme]`
- [ ] Add `src/hooks/useStorage.ts` — generic `saveState`, `loadState`, `clearState` keyed by game name
- [ ] Update `src/App.tsx` — scaffold screen switching pattern (home/game phases), useTheme wired up, Header used on both screens
- [ ] Update `src/App.css` — layout only (centering, min-height); remove placeholder content

---

## SKILL.md

- [ ] Remove boilerplate choice logic (simple vs React) — React only
- [ ] Update Step 3 to only describe React boilerplate copy + npm install
- [ ] Add note: pre-built components and hooks are already in the boilerplate — use them, do not reimplement

---

## PLAN_TEMPLATE_REACT.md

- [ ] Remove "horizontal rule below the header" from play screen spec
- [ ] Add max-width guidance: simple/turn-based games 560px, complex board games up to 900px
- [ ] Update Components section to reference pre-built Header, Modal, ConfirmModal, HelpModal
- [ ] Update Styling checklist to remove items now handled by pre-built components

---

## SKILL.md — plan spec (Step 4b)

- [ ] Remove "horizontal rule below the header" from home and play screen specs
- [ ] Reference Header component in home and play screen specs
- [ ] Add max-width guidance per game type

---

## GAME_CODER.md

- [ ] Add instruction to use pre-built Header, Modal, ConfirmModal, HelpModal, useTheme, useStorage — do not reimplement
- [ ] Add instruction to use Header component on every screen with correct variant and props
