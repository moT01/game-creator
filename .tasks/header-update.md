# Header Update

## Goal
Standardize the header across all games to match checkers' design. Each game has two screens - a menu screen and a game screen. The menu screen header has help, theme, and donate buttons aligned right with a bottom border. The game screen header has a close button left, status text center (or game title when no status), help/theme/donate right with a bottom border. Icon buttons are flat with a border, filling on hover.

Do not change game logic, layout, or anything outside the header. Use checkers as the visual reference. Check off each game when done.

## Reference: checkers

### Before starting each game
Read the game's existing CSS and JS/TSX to understand:
- What the card/screen container class is called and what padding it has
- What the existing header element is called (do not rename it — update it in place)
- Whether the game has a shared header component (React) or renders it inline (vanilla JS)

### Menu screen header
- Flex row, justify-content flex-end, gap var(--space-1), padding var(--space-3) on all sides, border-bottom var(--border-default)
- The border must span the full width of the card. To achieve this without negative margins: the card container must have no top padding and no horizontal padding. If the card currently has padding on those sides, remove it and add equivalent padding directly to each child element below the header instead. Add `overflow: hidden` to the card container so the header corners clip to the card's border-radius.
- Buttons: help, theme, donate — right-aligned

### Game screen header
- Flex row, justify-content space-between, align-items center, padding var(--space-3), border-bottom var(--border-default)
- Same full-width border treatment as menu screen
- Left: close/quit button (min-width 32px to keep center balanced)
- Center: flex 1, text-align center — status text (e.g. "Dark's turn", "You win") or game title when no status
- Right: help, theme, donate buttons (flex row, gap var(--space-1))

### Icon button style
- Background: transparent
- Border: var(--border-default)
- Border-radius: var(--radius-sm)
- Color: var(--color-text-secondary)
- Width: 32px, height: 32px
- Hover: color var(--color-text-primary), background var(--color-surface-raised), border-color var(--color-text-muted)
- SVG: 16x16px, display block, pointer-events none
- All buttons same color — no special color on donate

### Icons
Use the SVGs from `.claude/skills/create-game/icons/` — verify each game uses these exact icons:
- Help button: `question-mark.html`
- Theme button: `sun.html` (shown when dark) / `moon.html` (shown when light)
- Donate button: `heart.html`
- Close/quit button: `x.html`

---

## Vanilla JS games

- [x] dots-and-boxes
- [x] shut-the-box
- [ ] gomoku
- [x] nim
- [x] dominoes
- [ ] fox-and-geese
- [ ] nine-mens-morris
- [ ] oware
- [ ] congkak
- [ ] shape-shooter
- [ ] pool
- [ ] reversi
- [ ] tower-of-hanoi

## React games

- [ ] chess
- [ ] checkers
- [ ] backgammon
- [ ] hearts
- [ ] cribbage
- [ ] five-dice
- [ ] solitaire
- [ ] block-stacker
- [ ] bomb-buster
- [ ] grid-connect
- [ ] number-tiles
- [ ] codetrivia
- [ ] variable-sorter
- [ ] rock-paper-scissors
- [ ] tic-tac-toe
