# <game-name>
> Based on: <known-game>

## Game Design

**Rules:** ...

**Players:** ...

**Modes / variants:** ...

**Win / draw conditions:** ...

**Special rules / one-off mechanics:**
- ...

**UI flow:** _(screen-to-screen path; note sub-states for complex play screens)_
1. ...

**Edge cases:**
- ...

---

## Data Model

**Board / grid:** ...

**Piece / token types:** ...

**Game state shape:** ...

**State flags:** ...

**Turn structure:** ...

**Move validation approach:** ...

**Invalid move handling:** ...

---

## AI / Computer Player

_(Include only if the game has a computer player)_

**Strategy approach:** ...

**Difficulty levels:** ...

**Performance constraints:** ...

---

## Help & Strategy Guide

**Objective:** ...

**Rules summary:** ...

**Key strategies:**
- ...

**Common mistakes:**
- ...

**Tips for beginners:**
- ...

---

## Home Screen

- Full viewport (100vw × 100vh), game-themed background
- Centered card container: min-width 420px, overflow hidden, no top/horizontal padding
- Uses boilerplate `Header` with `variant="home"` — help, theme, donate buttons; border-bottom spans full card width
- Game title and subtitle
- Mode selector (if applicable): ...
- Difficulty selector Normal/Hard (if computer opponent): ...
- Color/side selector (if applicable): ...
- Records: display records from local storage
- Buttons: "New Game" always shown; "Resume" shown only if a valid in-progress game exists

---

## Play Screen

- Centered card container on same background; min-width 420px; max-width ... _(choose based on what the game needs — the board or play area should feel spacious, not cramped)_; responsive
- Uses boilerplate `Header` with `variant="game"` — close left, status text center, help/theme/donate right
- Status text during play: ...
- Game area below header: ...
- Score/status display: ...

---

## Game Over

- Overlay on the play screen — not a separate screen
- Result display: ...
- Records shown: ...
- Buttons: Play Again, Return to Menu

---

## Modals

- **Help** — rules and strategy content specific to this game; accessible from all screens
- **Confirm** — used for: new game, quit to menu; message: ...

---

## Local Storage

- Theme preference
- Last selected mode, difficulty, and color/side
- Game state — save after every move; always start on home screen on reload; show Resume only if valid in-progress game exists; clear on game over or quit
- Records: Save (in all modes) wins against the computer if applicable - or time taken and number of moves if applicable - or just wins in general if applicable.

---

## Accessibility

- Keyboard navigation for all interactive elements
- ARIA labels on all buttons and controls
- ...

---

## Theming

- Light/dark toggle via `useTheme` hook — applies `.light-palette` / `.dark-palette` to body
- Never hardcode colors — use semantic CSS variables from `global.css`

---

## Game Logic
- [ ] ...

---

## Components
- [ ] `App` — top-level layout, phase state, `useTheme`, `createStorage`
- [ ] `HomeScreen` — see Home Screen spec below
- [ ] `PlayScreen` — see Play Screen spec below
- [ ] `GameOver` — overlay with result, best score, play again / return to menu; uses boilerplate `Modal`
- [ ] `HelpModal` — uses boilerplate `HelpModal`; fill in game-specific rules content
- [ ] `ConfirmModal` — uses boilerplate `ConfirmModal`; for destructive actions (new game, quit to menu)
- [ ] ...

---

## Styling
- [ ] All colors use semantic variables — no hardcoded values
- [ ] Pieces use `--piece-blue` and `--piece-gold` for the two players
- [ ] All spacing uses `--space-*` variables
- [ ] Numbers, scores, and timers use `--font-mono`
- [ ] Card container: min-width 420px, max-width sized to the game's needs, `overflow: hidden`, no top/horizontal padding
- [ ] All interactive elements have hover, active, and disabled states with transitions — nothing snaps
- [ ] Status text: win=`--color-success`, loss=`--color-danger`, neutral=`--color-accent`
- [ ] Game over overlay animates in with fade + scale
- [ ] Responsive at 375px
- [ ] ...

---

## Polish
_(animations on key events, piece/card movement, empty state handling)_
- [ ] ...
oc