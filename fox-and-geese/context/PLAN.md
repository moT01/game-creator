# fox-and-geese
> Based on: Fox and Geese

## Game Design

**Rules:** Classic English asymmetric board game played on the 33-point cross-shaped board (same as peg solitaire). 1 fox vs 13 geese. Geese move first. Geese move one step orthogonally (down or sideways — not up, not diagonal). Fox moves one step in any of 8 directions or captures exactly one goose per turn by jumping over it to the empty square on the other side (no multi-jump; jump can be in any of 8 directions). Captured geese are removed from the board.

**Players:** 2 (fox side and geese side). Modes: Player vs Computer (choose your side), Player vs Player.

**Modes / variants:**
- vs Computer — human picks fox or geese; computer plays the other side; Normal or Hard difficulty
- vs Player — two humans alternate turns on the same device; no difficulty

**Win / draw conditions:**
- Fox wins: geese count drops to 3 or fewer (not enough to trap the fox)
- Geese win: fox has zero legal moves on its turn (completely surrounded/blocked)
- Draw: it is the geese's turn and every goose has zero legal moves (all pinned against a wall)

**Special rules / one-off mechanics:**
- Geese may NOT move backward (row decreasing, i.e., back toward their starting rows)
- Geese may NOT move diagonally — orthogonal only (left, right, down)
- Fox jump is mandatory only in the sense that it is available — fox may also choose a regular step instead of capturing
- A fox jump removes the jumped goose from the board immediately
- Jump landing square must be empty and valid (on the board)

**UI flow:**
1. Home screen — mode selector, difficulty selector, side selector (fox/geese, vs computer only), records, New Game / Resume
2. Play screen — board, turn indicator, capture count, header with close/help/theme/donate
3. Game over overlay (on top of play screen) — result, records, Play Again / Menu buttons
4. Help modal — accessible from home and play screens
5. Confirm modal — "quit to menu" and "new game" while a game is in progress

**Edge cases:**
- Fox tries to jump but landing square is off-board or occupied — move is invalid
- Fox can jump diagonally — valid as long as a goose is exactly at the midpoint and landing is empty and on-board
- If the fox has captures available, it is NOT forced to take them (player's choice)
- If the geese reduce to 4 but cannot trap the fox, the game continues; win triggers only at exactly ≤ 3
- If it is the geese's turn and ALL geese have no legal moves (all blocked against a wall with no forward/sideways path), that is a draw — display "No moves — draw"
- Computer move should not be triggered if the game is already over

---

## Data Model

**Board / grid:** 7×7 2D array (`board[row][col]`). Invalid squares hold `null`; valid empty squares hold `'empty'`; occupied squares hold `'fox'` or `'goose'`.

**Valid squares** — the 33-point cross:
- Row 0: cols 2,3,4
- Row 1: cols 2,3,4
- Row 2: cols 0–6
- Row 3: cols 0–6
- Row 4: cols 0–6
- Row 5: cols 2,3,4
- Row 6: cols 2,3,4

**Piece / token types:** `'fox'`, `'goose'`, `'empty'`, `null` (off-board)

**Game state shape:**
```js
{
  board: string[][],       // 7×7, null | 'empty' | 'fox' | 'goose'
  foxPos: [row, col],      // current fox position
  currentTurn: 'fox' | 'geese',
  selected: [row, col] | null,   // currently selected square
  validMoves: [row, col][],      // computed moves for selected piece
  status: 'playing' | 'fox-wins' | 'geese-win' | 'draw',
  capturedGeese: number,         // how many geese the fox has taken
  mode: 'vs-computer' | 'vs-player',
  playerSide: 'fox' | 'geese',   // only relevant in vs-computer
  difficulty: 'normal' | 'hard',
  computerThinking: boolean
}
```

**State flags:**
- `status`: drives which overlay/screen renders
- `computerThinking`: disables board interaction while AI calculates
- `selected`: non-null means a piece is selected and `validMoves` is populated

**Turn structure:** Geese always go first. In vs-computer mode, after the human completes a move, `scheduleComputerMove()` fires after a 500 ms delay.

**Move validation approach:** `getValidMoves(board, row, col)` returns all legal destinations for the piece at `[row, col]`. Called when a square is selected to populate `validMoves`. Move applied only if destination is in `validMoves`.

**Invalid move handling:** Clicking an invalid destination deselects. Clicking own piece reselects it. No visual error — just silently deselect or reselect.

---

## AI / Computer Player

**Strategy approach:** Minimax with alpha-beta pruning, always evaluating from the fox's perspective (positive score = good for fox).

**Evaluation function `evaluateBoard(board, foxPos)`:**
- Base: 0
- +10 per captured goose (13 − current goose count)
- +2 per legal move available to the fox
- −1 per legal move available to any goose (sum across all geese)
- −1000 if fox has 0 moves (geese win — heavily penalise)
- +1000 if geese count ≤ 3 (fox win)

**Difficulty levels:**
- Normal: minimax depth 3, no move ordering
- Hard: minimax depth 6, alpha-beta pruning, order moves by captures first

**Performance constraints:** Geese side has up to ~13×3 = 39 moves per turn; fox side typically 3–12 moves. At depth 6 with alpha-beta this is fast enough for synchronous execution. If a move takes >1 s, fall back to depth 4 (add a timer guard).

---

## Help & Strategy Guide

**Objective:** Fox: capture enough geese (reduce to 3 or fewer). Geese: surround the fox so it cannot move.

**Rules summary:**
- Geese move first, one step at a time — only forward (down) or sideways (left or right)
- Fox moves one step any direction, or jumps over one goose to capture it
- No multi-jump: fox may capture only once per turn
- Fox wins when 10+ geese are captured (3 or fewer remain)
- Geese win when the fox has no legal move

**Key strategies:**
- Geese: advance in a solid horizontal line and never leave gaps — the fox slips through gaps
- Geese: use the narrow arms (rows 0–1 and 5–6) as a wall to pin the fox
- Geese: never let the fox get behind the main line — once it passes, herding it back is very hard
- Fox: look for a goose positioned alone with an empty square behind it — easy capture
- Fox: break the geese's front line early; a fragmented line is much harder to coordinate
- Fox: aim for the corners and narrow arms of the board where geese have limited lateral movement

**Common mistakes:**
- Geese leaving a single goose isolated in front of the line — easy fox capture
- Fox jumping greedily without checking whether the landing square is a dead end
- Geese advancing so fast they have no moves left (every piece trapped against a wall)
- Fox moving to the center of the top arm where it can be pinned by three geese quickly

**Tips for beginners:**
- Geese: keep your front line flat and advance one row at a time
- Fox: your first move should break toward a wing, not straight up the middle
- Geese need coordination — moving one goose far ahead of the others usually backfires

---

## Game Logic
- [x] `VALID_SQUARES`: `Set<string>` of `"row,col"` keys for all 33 valid positions
- [x] `isValid(r, c)`: returns `VALID_SQUARES.has(r+','+c)`
- [x] `initBoard()`: returns 7×7 grid with `null` for off-board, `'goose'` for rows 0–2 valid squares, `'fox'` at `(3,3)`, `'empty'` elsewhere
- [x] `foxStartPos`: constant `[3, 3]`
- [x] `getAdjacentSteps(r, c)`: returns all 8 neighbors that are valid and exist on-board
- [x] `getValidMoves(board, r, c)`: dispatches to `getFoxMoves` or `getGooseMoves` based on piece at `(r,c)`
- [x] `getFoxMoves(board, r, c)`: adjacent empty valid squares (8 dirs) + jump squares from `getFoxJumps`
- [x] `getFoxJumps(board, r, c)`: for each of 8 directions, if neighbor is `'goose'` and square 2 steps away is `'empty'` and valid, add as capture move
- [x] `getGooseMoves(board, r, c)`: orthogonally adjacent valid empty squares where `dr >= 0` (down or sideways; no `dr < 0`)
- [x] `isFoxJump(from, to)`: returns true if `|fromR - toR| === 2 || |fromC - toC| === 2` (2-step move)
- [x] `getJumpedSquare(from, to)`: returns `[(from[0]+to[0])/2, (from[1]+to[1])/2]`
- [x] `applyMove(board, foxPos, from, to)`: clones board, moves piece; if fox jump calls `getJumpedSquare` and sets that cell to `'empty'`; returns `{ board, foxPos }`
- [x] `countGeese(board)`: counts cells equal to `'goose'`
- [x] `getAllMoves(board, foxPos, side)`: returns `[{from, to}]` for all legal moves for that side
- [x] `checkStatus(board, foxPos, currentTurn)`: returns `'fox-wins'` if `countGeese <= 3`; `'geese-win'` if `currentTurn === 'fox'` and fox has 0 moves; `'draw'` if `currentTurn === 'geese'` and all geese have 0 moves; else `'playing'`
- [x] `evaluateBoard(board, foxPos)`: numeric score from fox's perspective (see AI section)
- [x] `minimax(board, foxPos, depth, isMaximizing, alpha, beta)`: returns best score; leaf nodes call `evaluateBoard`; terminal states return `±1000`
- [x] `getBestMove(board, foxPos, side, difficulty)`: iterates all moves for `side`, calls `minimax` for each, returns the move with highest (fox) or lowest (geese) score; depth = 3 (normal) or 6 (hard)
- [x] `handleSquareClick(r, c)`:
  - If `computerThinking` or status !== 'playing': ignore
  - If `selected` is null: if piece belongs to current player and has moves, set `selected` and `validMoves`
  - If `selected` is not null and `(r,c)` is in `validMoves`: call `applyMove`, advance turn, call `checkStatus`, schedule computer move if needed
  - If `selected` is not null and `(r,c)` holds current player's piece: reselect
  - Else: clear selection
- [x] `scheduleComputerMove()`: sets `computerThinking = true`, renders, then after 500 ms calls `getBestMove`, applies move, checks status, sets `computerThinking = false`, renders
- [x] `saveState()`: writes full game state to `localStorage['fox-and-geese-state']` as JSON
- [x] `loadState()`: parses and restores game state; returns null if absent or corrupt
- [x] `clearState()`: removes `localStorage['fox-and-geese-state']`
- [x] `saveRecords(records)` / `loadRecords()`: persist `{ foxNormal, foxHard, geeseNormal, geeseHard }` win counts to `localStorage['fox-and-geese-records']`
- [x] `savePrefs(prefs)` / `loadPrefs()`: persist `{ mode, difficulty, playerSide, theme }` to `localStorage['fox-and-geese-prefs']`

---

## UI & Rendering
- [x] Home screen — full viewport; game-themed background (earthy green/brown); centered container min-width 420px with border, rounded corners, shadow; header row: help, theme, donate icons; title "Fox and Geese"; mode selector (vs Computer / vs Player); difficulty selector (Normal / Hard) shown only when vs Computer; side selector (Play as Fox / Play as Geese) shown only when vs Computer; records display (Fox wins Normal/Hard, Geese wins Normal/Hard); New Game button always; Resume button only if saved state exists
- [x] Play screen — same themed background; centered container max-width 540px min-width 420px; header: close, help, theme, donate icons; `<hr>` below header; turn indicator ("Fox's Turn" / "Geese's Turn" / "Computer thinking..."); board centered below; capture count ("Captured: N / 13") below board
- [x] Board — rendered as a 7×7 CSS grid; invalid squares are invisible spacers; valid squares are styled cells; pieces rendered as SVG circles inside cells; connecting lines between adjacent valid squares drawn via an SVG overlay behind the grid
- [x] Fox piece — rendered as a styled circle with a distinct color (`--color-danger` or warm orange)
- [x] Goose piece — rendered as a styled circle with a neutral color (`--color-accent` or white)
- [x] Selected piece — glows with `--shadow-accent`; valid move targets shown as small highlighted dots in empty cells
- [x] Game over overlay — dark translucent layer over play screen; panel with result text (win/loss/draw in semantic color), updated records, "Play Again" and "Menu" buttons; animates in with fade + scale
- [x] HelpModal — triggered by help icon on any screen; min-width 420px; sections: Objective, How to Move, Tips; close button
- [x] ConfirmModal — triggered on "close" during active game and "new game" on play screen; min-width 420px; message + Cancel/Confirm buttons
- [x] Computer thinking indicator — "Computer is thinking..." text in turn indicator; board pointer-events disabled

---

## Styling
- [x] All colors use semantic variables — no hardcoded values
- [x] All spacing uses `--space-*` variables
- [x] Numbers, scores, and counters use `--font-mono`
- [x] Main container: `--shadow-lg`, inset box-shadow border, min-width 420px, centered
- [x] All interactive elements have hover, active, and disabled states with transitions — nothing snaps
- [x] Status text: fox win = `--color-success`, geese win = `--color-danger`, draw = `--color-accent`
- [x] Game over overlay animates in with fade + scale
- [x] Responsive at 375px — board scales down, container stays usable
- [x] Light theme verified — surfaces have visible depth and contrast
- [x] Board cells: hover state shows inset border when it's the player's turn; valid-move cells show a pulsing dot indicator
- [x] Selected piece glows with `--shadow-accent` — not just recolored
- [x] Invalid board squares render as invisible (`visibility: hidden`) to maintain grid layout
- [x] SVG overlay for board lines uses `--color-border` and renders behind pieces
- [x] Difficulty and side selector buttons styled as toggle-button group (one active, one inactive)
- [x] Theme: earthy tones for the background (dark green/forest for dark mode, warm parchment for light mode)
- [x] Focus states are custom (`box-shadow` ring) — browser default outlines removed
- [x] All modals have a full-screen translucent overlay behind the panel

---

## Accessibility
- [x] All board squares have `role="button"` and `aria-label` (e.g. "Row 3, Col 3 — Fox", "Row 0, Col 2 — Goose", "Row 4, Col 4 — empty")
- [x] Valid move targets have `aria-label="Move here"` and are focusable
- [x] Selected piece has `aria-pressed="true"`
- [x] Turn indicator has `aria-live="polite"` so screen readers announce turn changes
- [x] Modals trap focus while open; return focus to trigger element on close
- [x] Help and Confirm modals have `role="dialog"` and `aria-modal="true"`
- [x] All icon buttons have `aria-label` (e.g. "Help", "Toggle theme", "Donate", "Close")
- [x] Keyboard: Tab/Shift-Tab to navigate board squares; Enter/Space to select or move; Escape to deselect or close modal

---

## Polish
- [x] Piece selection animates with a brief scale-up
- [x] Valid move dots pulse subtly (opacity keyframe animation)
- [x] Fox capture: jumped goose fades out before board re-renders
- [x] Computer thinking: "thinking" dots animate (ellipsis cycle)
- [x] Game over overlay fades in with scale from 0.9 to 1.0 over 200 ms
- [x] Turn transition: turn indicator fades between values
- [x] Buttons lift on hover with `translateY(-1px)` and stronger shadow
- [x] Board container has a subtle wood-grain or textured background to reinforce the board game feel (CSS `background-image` radial gradient pattern, no external assets)
