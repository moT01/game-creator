# Header Update

## Goal
Standardize the header across all games to match gomoku's design. Each game has two screens - a menu screen and a game screen. The menu screen header has help, theme, and donate buttons aligned right with a bottom border. The game screen header is a 3-column layout: close button left, status text center (or game title when no status), help/theme/donate right with a bottom border. Icon buttons have a raised gradient background, border, shadow, and a subtle lift on hover.

Do not change game logic, layout, or anything outside the header. Use gomoku as the visual reference. Check off each game when done.

## Reference: gomoku

### Menu screen
- `.home-top-btns`: flex row, justify-content flex-end, gap var(--space-1), padding var(--space-3) (all sides), border-bottom var(--border-default)
- Border must span full card width — use negative margins: `margin: calc(-1 * <card-padding-top>) calc(-1 * <card-padding-x>) 0` (match the card's padding values), and add `overflow: hidden` to the card container
- Buttons: help, theme, donate (right-aligned)

### Game screen
- `.top-bar`: 3-column grid (1fr auto 1fr), align-items center, gap var(--space-2), padding var(--space-2) var(--space-3), border-bottom var(--border-default)
- Same full-width border treatment as menu screen (negative margins + overflow hidden on card)
- Left col: close/quit button
- Center col: status text (e.g. "Dark's turn", "You win") — use game title when no status
- Right col: help, theme, donate buttons

### Button style (.btn-icon or .icon-btn depending on game)
- Background: linear-gradient(135deg, var(--color-surface-raised) 0%, var(--color-surface) 100%)
- Border: var(--border-default)
- Box-shadow: var(--shadow-sm)
- Color: var(--color-text-secondary)
- Padding: var(--space-2) var(--space-3)
- Hover: translateY(-1px), color var(--color-text-primary), box-shadow var(--shadow-md)
- Active: translateY(0), box-shadow inset 0 1px 3px rgba(0,0,0,0.2)
- Border-radius: var(--radius-md) (8px) — not var(--radius-sm)
- SVG: 14x14px, display block, pointer-events none
- Donate button: same color as other buttons (no special color)

### Icons
Use the SVGs from `.claude/skills/create-game/icons/` — verify each game uses these exact icons:
- Help button: `question-mark.html`
- Theme button: `sun.html` (shown when dark, switches to light) / `moon.html` (shown when light, switches to dark)
- Donate button: `heart.html`
- Close/quit button: `x.html`

---

## Vanilla JS games

- [x] dots-and-boxes
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
