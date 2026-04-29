# nim
> Based on: Nim

## Game Design

**Rules:** Standard multi-pile Nim. Three piles start with 3, 5, and 7 objects. On each turn a player picks one pile and removes at least 1 object (up to the entire pile). The player who takes the last object wins.

**Players:** 1 (vs computer) or 2 (local vs friend)

**Modes / variants:**
- vs Computer — player goes first, computer responds; Normal or Hard difficulty
- vs Friend — two human players alternate on the same device; no difficulty selector

**Win / draw conditions:** The player who takes the last remaining object across all piles wins. There are no draws.

**Special rules / one-off mechanics:**
- A player must take at least 1 object per turn.
- A player must take from exactly one pile per turn.
- A pile at 0 is exhausted; players cannot select it.
- The game ends immediately once all piles reach 0 after a take action.

**UI flow:**
1. Home screen — select mode (vs Computer / vs Friend), difficulty (Normal / Hard, visible only in vs Computer mode), New Game / Resume buttons, records display.
2. Play screen — three piles rendered as rows of token circles, current player label, selected count indicator, Take button, header with close/help/theme/donate buttons.
3. Player clicks a token in a pile — all tokens from that token to the end of the pile are highlighted as "selected"; clicking a different pile clears the selection and starts a new one in the new pile. Clicking the same token again or a token further right reduces/adjusts the selection within that pile.
4. Take button is enabled when at least 1 token is selected; clicking it removes selected tokens with an animation, then passes turn.
5. After the take that empties the last pile, the game over overlay appears.
6. Game over overlay — shows winner, win record (vs Computer only), Play Again and Return to Menu buttons.

**Edge cases:**
- All piles reach 0 in one take (player takes the last objects from the last non-empty pile) — trigger game over immediately.
- Computer turn with only one pile remaining — computer takes all objects and wins; show "Computer wins" overlay after a brief delay.
- Computer turn on Hard when nim-sum is already 0 (losing position for computer) — computer falls back to taking 1 from the largest pile.
- Player tries to take 0 objects — Take button remains disabled, no action.
- Resume with a saved game where current player is Computer — auto-trigger computer move after a short delay on load.
- Pile shows 0 tokens — render it greyed out with "Empty" label; clicking it does nothing.

---

## Data Model

**Board / grid:** Three independent piles. No spatial grid needed.

**Piece / token types:** Identical circular tokens. No face-up/face-down states.

**Game state shape:**
```js
{
  piles: [number, number, number],   // current object counts, e.g. [3, 5, 7]
  currentPlayer: 'human' | 'computer' | 'p1' | 'p2',
  mode: 'vs-computer' | 'vs-friend',
  difficulty: 'normal' | 'hard',     // only relevant in vs-computer mode
  selectedPile: number | null,       // index 0-2, or null
  selectedCount: number,             // how many tokens selected in selectedPile
  status: 'playing' | 'game-over',
  winner: 'human' | 'computer' | 'p1' | 'p2' | null,
  records: {
    normal: { wins: number },        // human wins vs computer on Normal
    hard: { wins: number }           // human wins vs computer on Hard
  }
}
```

**State flags:**
- `status` — controls whether game over overlay is visible
- `selectedPile` / `selectedCount` — drives token highlight rendering and Take button enable state
- `currentPlayer` — determines whose turn label shows and whether computer move fires

**Turn structure:** Human acts via UI interaction → Take button → `applyTake(pileIndex, count)` → check win → if vs-computer and not game-over → `triggerComputerMove()` after 600ms delay.

**Move validation approach:** `isValidTake(pileIndex, count)` — returns true if `pileIndex` is 0-2, `piles[pileIndex] > 0`, and `count >= 1 && count <= piles[pileIndex]`.

**Invalid move handling:** Take button is disabled unless `selectedCount >= 1`. Clicking an empty pile does nothing. No error messages needed — UI prevents invalid input by construction.

---

## AI / Computer Player

**Strategy approach:**

Hard — Nim-sum (XOR) strategy:
1. Compute `nimSum = piles[0] ^ piles[1] ^ piles[2]`.
2. If `nimSum !== 0`, find a pile where `pile ^ nimSum < pile`; reduce that pile to `pile ^ nimSum` (this leaves the opponent in a losing position).
3. If `nimSum === 0` (already losing position for computer), fall back: take 1 from the largest non-empty pile.

Normal — Weighted random:
1. Build list of all valid (pileIndex, count) moves.
2. 70% of the time pick randomly from that list.
3. 30% of the time apply the Hard strategy (gives Normal a chance to play well without being reliable).

**Difficulty levels:**
- Normal — beatable; makes random moves most of the time
- Hard — plays optimally; only loses if given a position with nim-sum 0

**Performance constraints:** Nim has at most ~3 piles × max 7 tokens = trivial computation; no memoization needed.

---

## Help & Strategy Guide

**Objective:** Take the last object to win.

**Rules summary:** Three piles (3, 5, 7). On your turn pick any one pile and remove 1 or more objects from it. The player who takes the very last object wins.

**Key strategies:**
- The winning strategy is to always leave a position where the XOR (nim-sum) of all pile sizes equals zero. Your opponent then has no winning reply.
- Starting position (3, 5, 7) has nim-sum 3 XOR 5 XOR 7 = 1, so the first player wins with optimal play.
- With one pile left, always take the whole pile to win.
- With two piles left, make them equal — your opponent must unbalance them and you rebalance each turn.
- Hard mode plays perfectly. To beat it, you need it to face a zero nim-sum position on its turn — which means starting from a bad first move by the computer, or playing Normal difficulty.

**Common mistakes:**
- Taking too many from a large pile early and handing the opponent a simple two-pile equal position.
- Forgetting that you must take from exactly one pile — you can't split across piles.
- Leaving a single-pile position for the opponent (they take it all and win).

**Tips for beginners:**
- Start by learning the two-pile rule: equal piles = loser for the player whose turn it is.
- Practice spotting nim-sum 0 positions — (1,2,3), (1,4,5), (2,4,6) are all losing for the player to move.
- Against Normal mode, focus on reducing piles to small balanced sizes early.

---

## Game Logic
- [x] `initState(mode, difficulty)` — returns fresh game state with piles [3,5,7], currentPlayer set to 'human'/'p1', status 'playing', selectedPile null, selectedCount 0
- [x] `applyTake(state, pileIndex, count)` — returns new state with piles updated, selectedPile/selectedCount cleared, currentPlayer toggled, and status/winner set if all piles are 0
- [x] `isGameOver(piles)` — returns true when every pile is 0
- [x] `togglePlayer(state)` — returns next player string based on mode ('human'/'computer' or 'p1'/'p2')
- [x] `computeNimSum(piles)` — returns `piles[0] ^ piles[1] ^ piles[2]`
- [x] `hardMove(piles)` — returns `{pileIndex, count}` using XOR strategy; falls back to take-1-from-largest if nimSum === 0
- [x] `normalMove(piles)` — 70% random valid move, 30% `hardMove(piles)`
- [x] `getComputerMove(piles, difficulty)` — dispatches to `hardMove` or `normalMove`
- [x] `triggerComputerMove(state)` — called after 600ms delay post human turn; calls `getComputerMove`, then `applyTake`, then re-renders
- [x] `handleTokenClick(pileIndex, tokenIndex)` — if pile is empty, do nothing; if a different pile was selected, clear and start new selection in this pile with selectedCount = pile.length - tokenIndex; if same pile, update selectedCount = pile.length - tokenIndex
- [x] `handleTakeClick()` — validates selectedCount >= 1, calls `applyTake`, then checks if vs-computer and triggers computer move
- [x] `saveGame(state)` — serializes state (excluding selectedPile/selectedCount) to localStorage key `nim_state`
- [x] `loadGame()` — returns parsed state from localStorage or null
- [x] `saveRecords(records)` — writes records object to localStorage key `nim_records`
- [x] `loadRecords()` — returns records from localStorage or `{normal:{wins:0}, hard:{wins:0}}`
- [x] `savePrefs(mode, difficulty)` — writes mode and difficulty to localStorage key `nim_prefs`
- [x] `loadPrefs()` — returns `{mode, difficulty}` from localStorage or defaults
- [x] `loadTheme()` — reads `nim_theme` from localStorage ('light' | 'dark'), defaults to 'light'; applies `.light-palette` or `.dark-palette` to `<body>`
- [x] `handleThemeToggle()` — toggles theme, saves to localStorage, swaps palette class on `<body>`, updates sun/moon icon visibility

---

## UI & Rendering
- [x] Home screen — title "Nim", mode selector (vs Computer / vs Friend tabs or toggle), difficulty selector (Normal / Hard, visible only when vs Computer selected), records display (Wins vs Normal, Wins vs Hard), New Game button, Resume button (shown only if saved game exists in localStorage); header: help, theme, donate icon buttons
- [x] Play screen — centered container, header row with close icon, help icon, theme icon, donate icon; horizontal rule; turn label ("Your turn" / "Computer thinking..." / "Player 1's turn" etc.); three pile columns each showing token circles stacked horizontally; selected-count badge above the active pile; Take button (disabled when selectedCount === 0); no separate score display needed
- [x] `renderPiles(piles, selectedPile, selectedCount)` — renders 3 pile containers; each pile shows `piles[i]` token circles; tokens from index `(pile.length - selectedCount)` onward in the selected pile get class `token--selected`; empty piles get class `pile--empty` with greyed tokens hidden and "Empty" label
- [x] `renderTurnLabel(state)` — shows "Your turn", "Computer is thinking...", "Player 1's turn", "Player 2's turn" based on state
- [x] Game over overlay — animates in with fade + scale; shows "You win!" / "Computer wins!" / "Player 1 wins!" / "Player 2 wins!"; shows win record if vs-computer mode; Play Again button (resets to fresh game, same mode/difficulty) and Return to Menu button (triggers confirm modal if mid-game, but game is over so no confirm needed — go directly)
- [x] HelpModal — accessible via help button on all screens; covers rules, valid moves, and strategy tips from Help & Strategy Guide above
- [x] ConfirmModal — appears when player clicks close (X) or Return to Menu mid-game; message: "Quit this game? Your progress will be lost."; Confirm and Cancel buttons
- [x] Accessibility — all token buttons have `aria-label="Take [n] from pile [i]"` updated on selection; Take button has `aria-label="Take [n] objects from pile [i]"` and `aria-disabled` when count is 0; icon buttons have aria-labels (Close, Help, Toggle theme, Donate); HelpModal and ConfirmModal use `role="dialog"` and `aria-modal="true"`; focus trapped inside open modals; Escape key closes modals
- [x] Keyboard navigation — Tab moves through pile tokens and buttons; Enter/Space activates focused token or button; when a pile token is focused, arrow keys (Left/Right) adjust selection within the same pile

---

## Styling
- [x] All colors use semantic variables — no hardcoded values
- [x] All spacing uses `--space-*` variables
- [x] Numbers, scores, and timers use `--font-mono`
- [x] Main container: `--shadow-lg`, inset box-shadow border, min-width 420px, centered
- [x] All interactive elements have hover, active, and disabled states with transitions — nothing snaps
- [x] Status text: win=`--color-success`, loss=`--color-danger`, neutral=`--color-accent`
- [x] Game over overlay animates in with fade + scale
- [x] Responsive at 375px
- [x] Light theme verified — surfaces have visible depth and contrast
- [x] Token circles: `--color-accent` fill, `--border-radius-full`, fixed size (32px × 32px), gap between them; selected tokens: `--color-danger` fill to show "about to be removed"
- [x] Pile container: vertical label at bottom showing count, highlighted border when that pile is selected
- [x] Take button: prominent, full-width or wide, disabled state visually distinct (opacity + cursor: not-allowed)
- [x] Computer "thinking" state: turn label pulses with a subtle opacity animation
- [x] Empty pile: tokens area shows faint placeholder circles (not clickable), "Empty" label in muted color

---

## Polish
- [x] Token removal animation: selected tokens scale down and fade out before state updates (CSS transition, ~300ms), then pile re-renders
- [x] Computer move animation: selected tokens briefly highlight (blue → red) before disappearing, so player can see what the computer took
- [x] Take button shake animation when clicked while disabled (in case user tries)
- [x] Smooth pile re-render — tokens slide/fade in on game reset
- [x] "Computer is thinking..." label shows during the 600ms delay before computer acts
