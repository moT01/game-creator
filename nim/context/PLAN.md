# nim
> Based on: Nim

## Game Design

**Rules:** Players alternate turns removing objects from heaps. On each turn, a player must choose exactly one heap and remove at least 1 object (up to the entire heap). The player who takes the last object wins (standard Nim rules).

**Players:** 2 — human vs computer, or human vs human (local).

**Modes / variants:**
- `vs-computer` — human is Player 1, AI is Player 2
- `2-player` — two humans alternate on the same device

**Win / draw conditions:**
- Win: you take the last remaining object across all heaps (all heaps become 0 after your move)
- No draw condition exists in standard Nim

**Special rules / one-off mechanics:**
- A player must remove at least 1 object — passing is not allowed
- A player must remove from exactly one heap per turn — splitting across heaps is invalid
- If only a single object remains in the last non-empty heap, the current player is forced to take it and wins

**UI flow:**
1. Home screen — select mode, difficulty (if vs-computer); view records; New Game / Resume
2. Play screen — show 4 heap rows; player selects a heap, then selects count via +/- or direct object clicks; confirms with "Take" button; AI moves auto-play after 600ms delay
3. Game over overlay — show winner, update records, Play Again / Return to Menu

**Edge cases:**
- Starting position (1,3,5,7) has nim-sum = 0, so the first player loses with perfect play — AI on Hard will always win if it goes second (Player 2)
- Player selects a heap, then clicks a different heap — selection switches to new heap, removeCount resets to 1
- Player sets removeCount to 0 — Take button is disabled
- All heaps are 0 before the game starts (impossible by design, but guard anyway)
- Computer's "thinking" delay should be skipped if game is already over when delay fires
- Resume shown only if saved state has at least one non-zero heap and phase is `playing`

---

## Data Model

**Board / grid:** `heaps: number[]` — array of 4 integers representing current count in each heap. Initial: `[1, 3, 5, 7]`.

**Piece / token types:** No pieces — heaps contain undifferentiated objects (rendered as circles/stones).

**Game state shape:**
```ts
type GamePhase = 'playing' | 'game-over'
type Mode = 'vs-computer' | '2-player'
type Difficulty = 'normal' | 'hard'

interface GameState {
  heaps: number[]           // current heap sizes, e.g. [1, 3, 5, 7]
  currentPlayer: 0 | 1     // 0 = Player 1 (human), 1 = Player 2 (human or AI)
  selectedHeap: number | null  // index of heap selected this turn, or null
  removeCount: number       // how many objects marked for removal (1 to heaps[selectedHeap])
  phase: GamePhase
  winner: 0 | 1 | null
  mode: Mode
  difficulty: Difficulty
  humanPlayer: 0 | 1    // which player index the human controls in vs-computer (0 = goes first, 1 = goes second)
}
```

**State flags:**
- `selectedHeap: number | null` — which heap the current player has clicked
- `removeCount: number` — count of objects to remove (clamped 1–heapSize)
- `phase` — `'playing'` | `'game-over'`
- `winner` — set on game over

**Turn structure:**
1. Current player selects a heap (sets `selectedHeap`, `removeCount` resets to 1)
2. Player adjusts `removeCount` (1 to `heaps[selectedHeap]`) via + / - buttons or by clicking objects in the row
3. Player clicks "Take" — `applyMove(state, selectedHeap, removeCount)` runs
4. `heaps[selectedHeap] -= removeCount`, check win: `heaps.every(h => h === 0)` → winner = currentPlayer
5. If not game over, `currentPlayer ^= 1`
6. If now AI's turn, schedule `runAI()` after 600ms

**Move validation approach:** In `applyMove`, assert: `selectedHeap` is 0–3, `removeCount >= 1`, `removeCount <= heaps[selectedHeap]`. UI prevents invalid state — Take button is disabled when `selectedHeap === null` or `removeCount < 1`.

**Invalid move handling:** UI-only prevention — Take button disabled, +/- clamped. No error message needed.

---

## AI / Computer Player

**Strategy approach:**
- `computeNimSum(heaps: number[]): number` — XOR of all heap sizes
- `findOptimalMove(heaps: number[]): { heap: number; count: number }` — find a heap `i` and count `n` such that `heaps[i] - n` gives nim-sum of 0 after the move. If no such move exists (already losing position), take 1 from the largest heap.
- Hard: always calls `findOptimalMove`
- Normal: 60% chance of `findOptimalMove`, 40% chance of a random valid move (random heap with objects, random count 1–size)

**Difficulty levels:**
- Normal — plays optimally 60% of the time, randomly 40%
- Hard — always optimal

**Performance constraints:** Nim AI is O(n) per move — no performance concerns.

---

## Help & Strategy Guide

**Objective:** Take the last object from the table to win.

**Rules summary:**
- 4 heaps start with 1, 3, 5, and 7 objects
- On your turn, pick one heap and remove any number of objects from it (at least 1)
- The player who takes the last object wins

**Key strategies:**
- The winning strategy is to leave your opponent in a "zero nim-sum" position: XOR all heap sizes together; if the result is 0 after your move, you are in control
- If you're in a losing position (nim-sum is already 0 on your turn), any move you make gives the opponent a winning position — minimize losses by keeping as many objects as possible
- With one heap remaining, take all of it to win instantly

**Common mistakes:**
- Removing too many objects from a large heap, leaving a single-object heap that hands the win to the opponent
- Ignoring smaller heaps — every heap contributes to the nim-sum

**Tips for beginners:**
- Start by watching Hard AI play to see optimal strategy in action
- If only one heap has more than 1 object, reduce it to leave an odd number of single-object heaps

---

## Game Logic
- [x] `computeNimSum(heaps: number[]): number` — XOR reduce all heap sizes
- [x] `isGameOver(heaps: number[]): boolean` — `heaps.every(h => h === 0)`
- [x] `applyMove(heaps: number[], heapIndex: number, count: number): number[]` — immutably return new heaps array with `heaps[heapIndex] - count`
- [x] `findOptimalMove(heaps: number[]): { heap: number; count: number }` — iterate heaps, for each non-empty heap try all removal counts, return first that gives nim-sum 0 after; fall back to take 1 from largest heap
- [x] `findRandomMove(heaps: number[]): { heap: number; count: number }` — pick a random non-empty heap, pick a random count 1–size
- [x] `getAIMove(heaps: number[], difficulty: Difficulty): { heap: number; count: number }` — routes to optimal or random based on difficulty and 60/40 chance
- [x] `validateMove(heaps: number[], heapIndex: number, count: number): boolean` — heapIndex 0–3, count >= 1, count <= heaps[heapIndex]
- [x] Win check after every `applyMove` call — if `isGameOver(newHeaps)`, set `winner = currentPlayer`
- [x] Turn switch — only after win check confirms game is still in progress
- [x] AI trigger — after turn switch, if `mode === 'vs-computer'` and `currentPlayer === 1` and `phase === 'playing'`, call `getAIMove` after 600ms; guard the timeout with a `phase` check before applying

---

## Components
- [x] `App` — top-level layout, phase state (`'home' | 'playing'`), `useTheme`, `createStorage('nim-state')`; passes game state down and callbacks up
- [x] `HomeScreen` — mode selector (vs-computer / 2-player toggle), difficulty selector (Normal / Hard, shown only in vs-computer mode), records display, New Game / Resume buttons
- [x] `PlayScreen` — renders 4 `HeapRow` components, turn indicator in header, Take button, handles heap selection and removeCount adjustments; schedules AI moves
- [x] `HeapRow` — renders a single heap row as clickable object circles; selected heap shows highlighted objects up to `removeCount`; disabled when it's AI's turn or heap is empty
- [x] `GameOver` — modal overlay using boilerplate `Modal`; shows winner text, win record; Play Again and Return to Menu buttons
- [x] `HelpModal` — uses boilerplate `HelpModal`; nim-specific rules and strategy content
- [x] `ConfirmModal` — uses boilerplate `ConfirmModal`; for quit-to-menu and new-game-during-play actions

---

## Home Screen

- Full viewport (100vw x 100vh), game-themed background using `--color-bg`
- Centered card: min-width 420px, overflow hidden, no top/horizontal padding
- Uses boilerplate `Header` with `variant="home"` — help, theme, donate buttons; border-bottom spans full card width
- Game title "Nim" and subtitle "The strategy removal game"
- Mode selector: toggle between "vs Computer" and "2 Player"
- When mode is vs-computer, show below the mode toggle (hidden in 2-player mode):
  - One row: "Go First" | "Go Second" segmented toggle on the left + "Hard mode" checkbox on the right (same row, matching vs-computer.png layout)
  - WINS section below that row: label "WINS", then two rows — "Normal  X" and "Hard  X" — counts from local storage
- Buttons: "New Game" always shown; "Resume" shown only if saved state exists with `phase === 'playing'` and at least one heap > 0

---

## Play Screen

- Centered card container on same background; min-width 420px; max-width 480px; responsive
- Uses boilerplate `Header` with `variant="game"` — close (quit to menu) left, status center, help/theme/donate right
- Status text center: "Your turn" (human, `--color-accent`), "Computer thinking..." (AI turn, `--color-text-secondary`), "Player 1 / Player 2's turn" (2-player mode)
- Game area: 4 `HeapRow` components stacked vertically with `--space-4` gap, each labeled "Heap 1–4"
- Each `HeapRow`: row of filled circles (objects), clickable when it's the human's turn; clicking selects the heap and sets `removeCount = 1`; clicking objects within a selected heap adjusts `removeCount` (click nth object = remove n objects from that heap)
- Remove count controls: once a heap is selected, show +/- buttons to adjust `removeCount` from 1 to heap size
- Take button: primary action at bottom of game area; disabled when `selectedHeap === null` or `removeCount < 1` or it's AI's turn
- Heap row visual states: default, selected (accent border + glow), objects-to-remove highlighted in `--color-danger` tint, empty heap grayed out

---

## Game Over

- Overlay on the play screen using boilerplate `Modal`
- Result: "You Win!" (`--color-success`) or "You Lose" (`--color-danger`) in vs-computer mode; "Player 1 Wins!" / "Player 2 Wins!" in 2-player mode
- Records shown: updated win count for the current mode/difficulty
- Buttons: "Play Again" (same settings), "Return to Menu"

---

## Modals

- **Help** — objective, rules summary, key strategies, tips; accessible from all screens
- **Confirm** — for quit-to-menu during a game and new-game-during-play; message: "Start a new game? Your current game will be lost."

---

## Local Storage

- Key: `nim-state` via `createStorage('nim-state')`
- Theme preference (via `useTheme`)
- Last selected mode, difficulty, and go-first/second preference — restore on home screen revisit
- Game state — saved after every move; cleared on game over or quit; Resume shown only if `phase === 'playing'` and `heaps.some(h => h > 0)`
- Records: `wins_normal` and `wins_hard` (vs-computer wins per difficulty); not tracked in 2-player mode

---

## Accessibility

- Keyboard navigation: Tab through heap rows, Enter/Space to select; +/- buttons keyboard accessible; Take button reachable via Tab
- ARIA labels on all heap rows: `aria-label="Heap 2, 3 objects remaining"`
- ARIA label on Take button: `aria-label="Take 2 objects from Heap 3"`
- `aria-disabled` on Take button when inactive
- Object circles in HeapRow: `role="button"` with descriptive label when interactive

---

## Theming

- Light/dark toggle via `useTheme` hook — applies `.light-palette` / `.dark-palette` to body
- Never hardcode colors — use semantic CSS variables from `global.css`

---

## Styling
- [x] All colors use semantic variables — no hardcoded values
- [x] Light mode: game container and its contents use the lightest surface color (`--color-surface`); page background uses the second lightest color (`--color-bg`) — container must be visually lighter than the background
- [x] Object circles use `--piece-blue` for neutral objects, `--color-danger` tint for objects marked for removal
- [x] Selected heap row has `--shadow-accent` glow and accent border
- [x] All spacing uses `--space-*` variables
- [x] Numbers use `--font-mono`
- [x] Card container: min-width 420px, max-width 480px, `overflow: hidden`, no top/horizontal padding
- [x] All interactive elements have hover, active, and disabled states with transitions — nothing snaps
- [x] Status text: win=`--color-success`, loss=`--color-danger`, neutral=`--color-accent`, AI thinking=`--color-text-secondary`
- [x] Game over overlay animates in with fade + scale
- [x] Responsive at 375px — object circles scale down if needed
- [x] Take button lifts on hover, scales down on active, opacity 0.4 when disabled
- [x] Heap rows animate removal: objects fade out on take action before state updates
- [x] Empty heap rows show muted dashed style, not blank

---

## Polish
- [x] Object circles animate out (fade + scale down) when taken, before state updates
- [x] AI "thinking" period: status shows "Computer thinking..." with animated ellipsis
- [x] Selected heap row pulses with `--shadow-accent` glow
- [x] Take button shake animation if pressed when disabled (no heap selected)
- [x] Game over modal animates in with fade + scale
- [x] Heap label updates live as count changes: "Heap 2 - 3 objects"

---

## Testing

**Unit tests — game logic (`src/gameLogic.test.ts`):**
- [x] `computeNimSum([1,3,5,7])` returns 0
- [x] `computeNimSum([1,2,3])` returns 0 (1^2^3 = 0)
- [x] `computeNimSum([0,0,0,1])` returns 1
- [x] `computeNimSum([3,5,7])` returns 1 (3^5^7 = 1)
- [x] `isGameOver([0,0,0,0])` returns true
- [x] `isGameOver([0,0,0,1])` returns false
- [x] `applyMove([1,3,5,7], 1, 2)` returns `[1,1,5,7]`
- [x] `applyMove([0,0,0,1], 3, 1)` returns `[0,0,0,0]`
- [x] `validateMove([1,3,5,7], 1, 3)` returns true
- [x] `validateMove([1,3,5,7], 1, 4)` returns false (count > heap size)
- [x] `validateMove([1,3,5,7], 1, 0)` returns false (count < 1)
- [x] `findOptimalMove([1,3,5,7])` — nim-sum is 0, falls back to take 1 from heap 3 (size 7)
- [x] `findOptimalMove([0,3,5,7])` — nim-sum is 1, returns a move that makes nim-sum 0 (e.g. heap 1 take 2: [0,1,5,7] → 1^5^7=3, not 0; heap 2 take 4: [0,3,1,7] → 3^1^7=5, not 0; heap 3 take 6: [0,3,5,1] → 3^5^1=7, not 0; heap 1 take 1: [0,2,5,7] → 2^5^7=0 ✓)
- [x] `findOptimalMove` result always passes `validateMove`
- [x] Win detected after `applyMove([0,0,0,1], 3, 1)` → `isGameOver` true

**Component tests — (`src/App.test.tsx`):**
- [x] Home screen renders mode selector and New Game button
- [x] Difficulty selector hidden when mode is 2-player
- [x] Resume button hidden when no saved state
- [x] Play screen renders 4 heap rows with correct object counts
- [x] Clicking a heap selects it and enables the Take button
- [x] Take button disabled when no heap selected
- [x] After taking objects, heap count decreases correctly
- [x] Game over modal appears when last object taken
- [x] AI move fires after human move in vs-computer mode
