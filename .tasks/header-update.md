# Header Update

## Goal
Standardize the header across all games to match gomoku's design. Each game has two screens - a menu screen and a game screen. The menu screen header has help, theme, and donate buttons aligned right with a bottom border. The game screen header is a 3-column layout: close button left, status text center (or game title when no status), help/theme/donate right with a bottom border. Icon buttons have a raised gradient background, border, shadow, and a subtle lift on hover.

Do not change game logic, layout, or anything outside the header. Use gomoku as the visual reference. Check off each game when done.

## Reference: gomoku

### Menu screen
- `.home-top-btns`: flex row, justify-content flex-end, gap var(--space-1), padding var(--space-3), border-bottom var(--border-default)
- Buttons: help, theme, donate (right-aligned)

### Game screen
- `.top-bar`: 3-column grid (1fr auto 1fr), align-items center, gap var(--space-2), padding var(--space-2) 0, border-bottom var(--border-default)
- Left col: close/quit button
- Center col: status text (e.g. "Dark's turn", "You win") — use game title when no status
- Right col: help, theme, donate buttons

### Button style (.btn-icon)
- Background: linear-gradient(135deg, var(--color-surface-raised) 0%, var(--color-surface) 100%)
- Border: var(--border-default)
- Box-shadow: var(--shadow-sm)
- Color: var(--color-text-secondary)
- Padding: var(--space-2) var(--space-3)
- Hover: translateY(-1px), color var(--color-text-primary), box-shadow var(--shadow-md)
- Active: translateY(0), box-shadow inset 0 1px 3px rgba(0,0,0,0.2)
- SVG: 14x14px, display block, pointer-events none
- Donate button: color var(--yellow-gold)

---

## Vanilla JS games

- [ ] dots-and-boxes
- [ ] shut-the-box
- [ ] nim
- [ ] dominoes
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
