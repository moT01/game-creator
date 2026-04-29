# dominoes
> Based on: dominoes

## Game Design

**Rules:** Draw Dominoes with a double-6 set (28 tiles). Each player draws 7 tiles at the start; the remaining 14 form the boneyard. The player holding the highest double (6|6, then 5|5, etc.) goes first and must play that tile. If no doubles exist in either hand, the player with the highest pip sum goes first. On each turn, a player places one tile so that one of its halves matches a pip value at either open end of the chain. If the player cannot play, they draw one tile at a time from the boneyard until they can play or the boneyard is exhausted. If the boneyard is empty and the player still cannot play, they pass. Doubles are rendered perpendicular (portrait) to the chain; non-doubles are rendered parallel (landscape).

**Players:** 2 — Human vs Computer.

**Modes / variants:** Single mode — Draw Dominoes vs Computer.

**Win / draw conditions:**
- Win: a player empties their hand.
- Blocked win: both players pass consecutively; the player with the lowest total pip count in hand wins.
- Draw: blocked game where both players have equal pip counts.

**Special rules / one-off mechanics:**
- The opening tile is always the highest double (or highest pip tile if no doubles). The player holding it must play it first — they cannot play a different tile on turn 1.
- When the chain is empty, a tile placed at "center" sets both `leftEnd` and `rightEnd` to the same value (if double) or to tile.a (left) and tile.b (right).
- Drawing from the boneyard does not end the turn — the player draws until playable or boneyard empty.
- `consecutivePasses` resets to 0 any time a tile is successfully played or a tile is drawn from the boneyard.
- If the boneyard has exactly 1 tile left and the player cannot play, they must still attempt to draw it (they cannot skip).

**UI flow:**
1. Home screen — title, records (wins), New Game button, Resume button (if saved game exists)
2. New Game → deal tiles, determine first player → Play screen
3. Play screen — player interacts with hand and board; computer takes turns automatically after a short delay
4. Game over overlay appears over Play screen (result, pip counts, wins)
5. Play Again → new game (skip home), Return to Menu → home screen

**Edge cases:**
- No doubles in any hand at deal: start player is the one with highest pip-sum tile (sum of both halves). In case of tie, computer goes first.
- Boneyard exhausted mid-draw: stop drawing, proceed to play or pass.
- Player draws a playable tile: must immediately play it (or can choose which end to play it on — but for UX, auto-select the drawn tile in hand and let player pick placement end via normal flow).
- Computer has no valid move and boneyard is empty: computer passes automatically with a brief "Computer passes" message.
- Both players pass on the first turn (impossible in Draw Dominoes since both have 7 tiles and boneyard has 14, but guard `consecutivePasses >= 2` regardless).
- A tile can match both ends: player must click which end to place it on (show both ends as highlighted drop targets).

---

## Data Model

**Tile:** `{ a: number, b: number }` — always stored with `a <= b`.

**ChainTile:** `{ a: number, b: number, flipped: boolean }` — `flipped: true` means the tile was placed b-end first (b connects to the chain). `isDouble` is derived: `a === b`.

**Game state shape:**
```js
{
  phase: 'home' | 'playing' | 'gameover',
  boneyard: Tile[],
  playerHand: Tile[],
  computerHand: Tile[],
  chain: ChainTile[],
  leftEnd: number | null,   // pip value at left open end of chain
  rightEnd: number | null,  // pip value at right open end of chain
  turn: 'player' | 'computer',
  selectedTileIndex: number | null,
  consecutivePasses: number,
  isAnimating: boolean,
  zoom: number,             // board scale: 0.4 to 2.0, step 0.1, default 1.0
  result: null | { winner: 'player' | 'computer' | 'draw', reason: 'empty-hand' | 'blocked', playerPips: number, computerPips: number },
  wins: number              // persisted to localStorage
}
```

**State flags:**
- `phase` — controls which screen/overlay is shown
- `selectedTileIndex` — index into `playerHand`; null when nothing selected
- `consecutivePasses` — if reaches 2, trigger blocked-game resolution
- `isAnimating` — locks player input during computer turn delay and animations
- `zoom` — current board zoom level

**Turn structure:**
1. `startTurn(turn)`: check if current player has any valid move via `getValidMoves(hand, leftEnd, rightEnd)`
2. If valid moves exist and turn === 'player': wait for player to select tile and click end
3. If valid moves exist and turn === 'computer': run `computeComputerMove()` after 800ms delay
4. If no valid moves and boneyard not empty: draw one tile, repeat step 1
5. If no valid moves and boneyard empty: pass — increment `consecutivePasses`, switch turn
6. If `consecutivePasses >= 2`: call `resolveBlockedGame()`
7. On successful tile play: call `placeTile(tile, end)`, reset `consecutivePasses = 0`, check win, switch turn

**Move validation approach:**
- `getValidMoves(hand, leftEnd, rightEnd)`: returns array of `{ tileIndex, end: 'left' | 'right' | 'both' }` for every tile in hand that matches at least one open end.
- Empty chain (`leftEnd === null`): all tiles are valid, end = 'both' (places at center).
- Match logic: `tile.a === end || tile.b === end`.

**Invalid move handling:** Player can only click a tile that has valid moves (others are visually dimmed). After selecting a tile, only valid ends on the chain are highlighted as drop targets. Clicks on invalid ends are ignored silently.

---

## AI / Computer Player

**Strategy approach:** `computeComputerMove(computerHand, leftEnd, rightEnd)`:
1. Get all valid moves from `getValidMoves`.
2. If none: draw from boneyard or pass.
3. Score each valid move:
   - +3 if the tile is a double (doubles are hard to play later; prioritize unloading them)
   - +1 for each remaining tile in hand that would still be playable after the move (prefer moves that keep options open)
   - Prefer playing to the end that leaves the opponent fewer matching tiles (count player-visible info: tiles played, so estimate from boneyard + unseen tiles)
4. Play the highest-scoring move. Ties broken by highest pip sum (unload heavy tiles).

**Difficulty levels:** Single difficulty — the above strategy.

**Performance constraints:** All computation is synchronous and fast (hand size max 28 tiles). No performance concerns.

---

## Help & Strategy Guide

**Objective:** Be the first to play all tiles from your hand, or have the lowest pip count when the game is blocked.

**Rules summary:**
- 28 tiles (0|0 through 6|6), each player gets 7, 14 go to the boneyard
- Match one of your tile's halves to an open end of the chain to play
- Can't play? Draw from the boneyard until you can, or pass if it's empty
- First to empty their hand wins; if blocked, lowest pips remaining wins

**Key strategies:**
- Play doubles early — they are the hardest tiles to place because both ends must match the same value
- Control the open ends: try to keep ends that match tiles you still hold
- Track which numbers have been heavily played — the computer cannot play what isn't left
- If you hold many tiles of one number, play to that number to maintain options
- When behind, use high-pip tiles aggressively to reduce your count before the game blocks

**Common mistakes:**
- Holding doubles too long — they can become unplayable if both ends advance away from that value
- Playing randomly instead of tracking open ends and adjusting hand strategy
- Forgetting to account for the boneyard when estimating what the computer might draw
- Playing a tile that closes off an end you hold many tiles for

**Tips for beginners:**
- Click a tile in your hand to select it, then click the highlighted left or right end of the chain to place it
- The boneyard count is shown in the status bar — knowing when it's low changes the strategy
- If both ends on the chain show the same number, you only need tiles with that number to play
- Use zoom out to see the full chain when it gets long

---

## Game Logic
- [x] `generateTiles()`: produce all 28 tiles `{a, b}` where `a <= b`, for `a` in 0..6, `b` in a..6
- [x] `shuffle(arr)`: Fisher-Yates shuffle, returns new array
- [x] `dealTiles()`: shuffle 28 tiles, assign first 7 to playerHand, next 7 to computerHand, remaining 14 to boneyard
- [x] `determineFirstPlayer(playerHand, computerHand)`: find highest double across both hands (6|6 first, down to 0|0). If found, return `{ firstPlayer: 'player'|'computer', openingTile: Tile }`. If no doubles, find tile with highest (a+b) across both hands; return its owner. Tie goes to computer.
- [x] `getValidMoves(hand, leftEnd, rightEnd)`: for each tile in hand, check if `tile.a === leftEnd || tile.b === leftEnd` (can play left) and same for rightEnd; return array of `{ tileIndex, end }`. If chain empty, all tiles valid with end = 'both'.
- [x] `placeTile(tileIndex, hand, end, chain, leftEnd, rightEnd)`: remove tile from hand, compute `flipped` (tile.b connects to chain if `tile.b === leftEnd` for left, etc.), prepend or append ChainTile to chain, update leftEnd / rightEnd, return updated state.
- [x] `resolveFlipped(tile, end, endValue)`: returns `flipped: boolean` — true if tile must be flipped so the matching half connects to the chain. For left: `flipped = tile.a === endValue` (b-end is the new outer). For right: `flipped = tile.b === endValue` (a-end is the new outer). For doubles, flipped is always false (both sides equal).
- [x] `computeNewEnd(tile, flipped, side)`: returns the new open pip value after placement. Left: outer half is `flipped ? tile.b : tile.a`. Right: outer half is `flipped ? tile.a : tile.b`.
- [x] `drawFromBoneyard(state)`: pop one tile from boneyard, push to current player's hand, return updated state; repeat via `startTurn` recursion until playable or empty.
- [x] `resolveBlockedGame(playerHand, computerHand)`: sum pips of each hand (`hand.reduce((s, t) => s + t.a + t.b, 0)`); lower sum wins; equal = draw.
- [x] `computeComputerMove(state)`: score valid moves as described, return `{ tileIndex, end }` or null if no moves.
- [x] `checkWin(hand)`: returns true if hand length === 0.
- [x] `startTurn(state)`: entry point for each turn — runs move availability check, triggers drawing loop or pass, or waits for player.
- [x] `saveGame(state)`: serialize relevant state fields to `localStorage('dominoes-saved-game')`.
- [x] `loadGame()`: deserialize from localStorage; returns null if not found or invalid.
- [x] `saveWins(wins)` / `loadWins()`: persist win count to `localStorage('dominoes-wins')`.
- [x] `saveTheme(theme)` / `loadTheme()`: persist `'dark'|'light'` to `localStorage('dominoes-theme')`.

---

## UI & Rendering
- [x] Home screen — title "Dominoes", subtitle "Draw Dominoes - Double 6", wins record, New Game button, Resume button (only if saved game in localStorage); header: help icon, theme icon, donate icon (top-right of container)
- [x] Play screen — full container with header (close icon left, help/theme/donate icons right), horizontal rule, status bar (whose turn + boneyard count), board area, player hand area
- [x] Board area — scrollable container (`overflow: auto`), inner chain wrapper with `transform: scale(zoom)`, transform-origin center; zoom +/- buttons overlaid bottom-right of board area; mouse wheel on board area also changes zoom
- [x] Chain rendering — `renderChain(chain, leftEnd, rightEnd, selectedTileIndex, validMoves)`: flex row, centered, each tile a `.domino` element; doubles get class `.domino--double` (portrait 32×64px base); non-doubles get `.domino--horizontal` (64×32px base); each half shows pip dots via `renderPips(n)` returning a 3×3 pip grid with active dots
- [x] Left/right end indicators — when a tile is selected, add `.end--highlight` class to `.chain-end-left` and `.chain-end-right` elements (or just one if tile only fits one end); clicking a highlighted end calls `placeTile`
- [x] Player hand area — fixed at bottom inside container; flex row of `.domino` elements; selected tile gets `.domino--selected` (glow with `--shadow-accent`, scale 1.05); dimmed tiles (no valid moves) get `.domino--disabled` (`opacity: 0.4`, `cursor: not-allowed`)
- [x] Computer hand area — top of play area, shows N face-down domino backs with a label "Computer: N tiles"
- [x] Draw button — visible only when player has no valid moves and boneyard not empty; clicking triggers `drawFromBoneyard`
- [x] Pass button — visible only when player has no valid moves and boneyard empty; clicking triggers pass logic
- [x] Status bar — "Your turn" / "Computer is thinking..." / "Computer passes" / "You pass"; boneyard count shown as "Boneyard: N"
- [x] Game over overlay — centered panel over play screen; shows result ("You win!" / "Computer wins" / "Draw"), reason ("Cleared hand" or "Blocked — X pips vs Y pips"), win count, Play Again button, Return to Menu button; animates in with fade + scale
- [x] HelpModal — triggered by ? icon; shows rules summary and key tips; min-width 420px; closeable with X button or overlay click
- [x] ConfirmModal — triggered on close (X) button; "Quit to menu?" with Confirm / Cancel; min-width 420px
- [x] Pip rendering — `renderPips(n)`: returns a 3×3 grid div; dot positions for 1-6 follow standard domino convention: 1=center, 2=top-right+bottom-left, 3=top-right+center+bottom-left, 4=corners, 5=corners+center, 6=left-col+right-col (3 rows)

---

## Zoom Feature
- [x] `state.zoom` default 1.0, min 0.4, max 2.0, step 0.1
- [x] `zoomIn()` / `zoomOut()`: clamp and update `state.zoom`, re-render board
- [x] Chain wrapper: `transform: scale(state.zoom); transform-origin: center center;`
- [x] Board scroll area: after zoom change, call `scrollChainToCenter()` which sets `scrollLeft` to center the chain content
- [x] Mouse wheel listener on board area: `e.preventDefault(); e.deltaY < 0 ? zoomIn() : zoomOut()`
- [x] Zoom +/- buttons: overlaid bottom-right of board area, always visible during play

---

## Styling
- [x] All colors use semantic variables — no hardcoded values
- [x] All spacing uses `--space-*` variables
- [x] Numbers, scores, and counts use `--font-mono`
- [x] Main container: `--shadow-lg`, inset box-shadow border, min-width 420px, max-width 860px, centered
- [x] All interactive elements have hover, active, and disabled states with transitions — nothing snaps
- [x] Status text: your turn = `--color-accent`, computer turn = `--color-text-secondary`, win = `--color-success`, loss = `--color-danger`
- [x] Game over overlay animates in with fade + scale
- [x] Responsive at 375px — board area scrolls horizontally; hand tiles shrink to min size
- [x] Light theme verified — surfaces have visible depth and contrast
- [x] Domino tiles: `--color-surface-raised` background, `--color-border` divider line between halves, `--color-text-primary` pip color; tile border-radius `--radius-sm`
- [x] Selected tile: `box-shadow: var(--shadow-accent)`, `transform: scale(1.05)`, `transition: var(--transition-fast)`
- [x] Computer tile backs: solid `--color-surface-raised` with diagonal stripe pattern using `--color-border`
- [x] Board area background: `--color-surface` with subtle grid pattern using `--color-border` at low opacity
- [x] Chain end indicators: dashed border `--color-accent` when highlighted, pulsing animation when awaiting placement
- [x] Zoom button pair styled as a compact pill button group (+ and -), `--color-surface-raised` background

---

## Accessibility
- [x] All icon buttons have `aria-label` attributes (e.g., "Help", "Toggle theme", "Donate", "Close", "Zoom in", "Zoom out")
- [x] Domino tiles in player hand are `<button>` elements with `aria-label` like "Tile 3|5" and `aria-pressed` when selected
- [x] Chain end targets are `<button>` elements with `aria-label` "Play left" / "Play right", `aria-disabled` when not highlighted
- [x] Draw and Pass buttons have descriptive `aria-label`
- [x] Status bar region has `role="status"` and `aria-live="polite"` so screen readers announce turn changes
- [x] Modals trap focus while open; return focus to triggering element on close
- [x] Keyboard navigation: Tab through hand tiles, Enter/Space to select, Tab to end targets, Enter to place

---

## Polish
- [x] Computer "thinking" delay: 800ms before computer places tile, 400ms between draw actions
- [x] Tile placement: newly placed tile animates in with a quick scale-from-0.8 to 1.0 (`--transition-fast`)
- [x] Drawing from boneyard: each drawn tile slides into the player hand from the right
- [x] Pass message ("Computer passes" / "You pass"): toast-style notification that appears for 1.5s then fades
- [x] Game over overlay: fades in with `opacity: 0 → 1` and `scale: 0.95 → 1.0` over 250ms
- [x] Boneyard count pulses briefly when a tile is drawn from it
- [x] Chain end highlight pulses with a subtle CSS keyframe animation when awaiting player placement
