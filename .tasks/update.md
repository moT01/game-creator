# Status Text Update

## Goal
Standardize status text shown in the game screen header across all games. Check each game and update any text that doesn't match the standard below. Do not change game logic or anything outside of status text strings.

## Casing Rules

- **Buttons**: title case — "New Game", "Go First", "Go Second"
- **Status / move indicators**: sentence case — "Your turn", "Thinking...", "Player 1's turn"

---

## Vanilla JS Games

### [x] dots-and-boxes
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn | "Your turn" | |
| vs computer | Computer's turn | "Thinking..." | |
| vs computer | Win | "You win!" | |
| vs computer | Lose | "You lose!" | "Computer wins" |
| vs computer | Draw | "Draw!" | |
| vs computer | Extra turn | "Go again!" | |
| 2 player | Player 1's turn | "Dark's turn" | "Player 1's turn" |
| 2 player | Player 2's turn | "Light's turn" | "Player 2's turn" |
| 2 player | Win | "Dark wins!" / "Light wins!" | "Player 1 wins!" / "Player 2 wins!" |
| 2 player | Draw | "Draw!" | |
| 2 player | Extra turn | "Go again!" | "Player 1: Go again" / "Player 2: Go again" |
| vs computer | In-game score labels | "Dark:" / "Light:" | "You:" / "Computer:" |
| 2 player | In-game score labels | "Dark:" / "Light:" | "Player 1:" / "Player 2:" |
| vs computer | Game over score | "Dark: X \| Light: X" | "You: X \| Computer: X" |
| 2 player | Game over score | "Dark: X \| Light: X" | "Player 1: X \| Player 2: X" |
| menu | Mode toggle | "vs Computer" / "2 Player" | |
| menu | Go first toggle | "Go First" / "Go Second" | |
| menu | Start button | "New Game" | |

### [ ] shut-the-box
| Location | State | Current | New |
|---|---|---|---|
| gameplay | Waiting to roll | "Roll the dice" | |
| gameplay | Tiles phase | "Select tiles that add up to X" | |
| gameplay | Round complete | "Round X complete. Running total: X" | |
| gameplay | Win | "Match complete. Final total: X" | |
| gameplay | Lose | "Run over. Final total: X" | "No moves. Final total: X" |
| between-rounds overlay | Heading | "Round X Complete" | |
| between-rounds overlay | Button | "Continue" | |
| game over overlay | Heading (win) | "Match Complete" | |
| game over overlay | Heading (lose) | "Game Over" | |
| game over overlay | Banner (win) | "Shut the Box!" | |
| game over overlay | Button | "Play Again" | |
| menu | Round mode buttons | "1 Round" / "5 Rounds" / "Endless" | |
| menu | Start button | "New Game" | |

### [ ] gomoko
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn | "Dark's turn" / "Light's turn" | "Your turn" |
| vs computer | Computer's turn | "Thinking..." | |
| vs computer | Win | "You win!" | |
| vs computer | Lose | "You lose" | "You lose!" |
| vs computer | Draw | "Draw!" | |
| 2 player | Player 1's turn | "Dark's turn" | "Player 1's turn" |
| 2 player | Player 2's turn | "Light's turn" | "Player 2's turn" |
| 2 player | Win | "Dark wins!" / "Light wins!" | "Player 1 wins!" / "Player 2 wins!" |
| 2 player | Draw | "Draw!" | |
| menu | Mode buttons | "vs Computer" / "2 Players" | "2 Player" |
| menu | Go first toggle | "Go First" / "Go Second" | |
| menu | Start button | "New Game" / "Start Game" | "New Game" |

### [ ] nim
| State | Current | Desired |
|---|---|---|

### [ ] dominoes
| State | Current | Desired |
|---|---|---|

### [ ] fox-and-geese
| State | Current | Desired |
|---|---|---|

### [ ] nine-mens-morris
| State | Current | Desired |
|---|---|---|

### [ ] oware
| State | Current | Desired |
|---|---|---|

### [ ] congkak
| State | Current | Desired |
|---|---|---|

### [ ] shape-shooter
| State | Current | Desired |
|---|---|---|

### [ ] pool
| State | Current | Desired |
|---|---|---|

### [ ] reversi
| State | Current | Desired |
|---|---|---|

### [ ] tower-of-hanoi
| State | Current | Desired |
|---|---|---|

---

## React Games

### [ ] chess
| State | Current | Desired |
|---|---|---|

### [ ] checkers
| State | Current | Desired |
|---|---|---|

### [ ] backgammon
| State | Current | Desired |
|---|---|---|

### [ ] hearts
| State | Current | Desired |
|---|---|---|

### [ ] cribbage
| State | Current | Desired |
|---|---|---|

### [ ] five-dice
| State | Current | Desired |
|---|---|---|

### [ ] solitaire
| State | Current | Desired |
|---|---|---|

### [ ] block-stacker
| State | Current | Desired |
|---|---|---|

### [ ] bomb-buster
| State | Current | Desired |
|---|---|---|

### [ ] grid-connect
| State | Current | Desired |
|---|---|---|

### [ ] number-tiles
| State | Current | Desired |
|---|---|---|

### [ ] codetrivia
| State | Current | Desired |
|---|---|---|

### [ ] variable-sorter
| State | Current | Desired |
|---|---|---|

### [ ] rock-paper-scissors
| State | Current | Desired |
|---|---|---|

### [ ] tic-tac-toe
| State | Current | Desired |
|---|---|---|

### [ ] picaria
| State | Current | Desired |
|---|---|---|

### [ ] achi
| State | Current | Desired |
|---|---|---|

### [ ] dara
| State | Current | Desired |
|---|---|---|

### [ ] shisima
| State | Current | Desired |
|---|---|---|

### [ ] fanorona
| State | Current | Desired |
|---|---|---|
