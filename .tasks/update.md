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

### [x] shut-the-box
| Location | State | Current | New |
|---|---|---|---|
| gameplay | Waiting to roll | "Roll the dice" | |
| gameplay | Tiles phase | "Select tiles that add up to X" | |
| gameplay | Round complete | "Round X complete. Running total: X" | |
| gameplay | Win | "Match complete. Final total: X" | |
| gameplay | Lose | "Run over. Final total: X" | "No moves left. Final total: X" |
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
| help modal | Rules text | "Dark always goes first" | remove |
| help modal | Tips text | "Start at the center every game as dark" | "Start at the center every game" |

### [ ] nim
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn | "Your turn" | |
| vs computer | Computer's turn | "Computer thinking" | "Thinking..." |
| vs computer | Win | "You Win!" | "You win!" |
| vs computer | Lose | "Computer Wins" | "Computer wins" |
| 2 player | Player's turn | "Player 1's turn" / "Player 2's turn" | |
| 2 player | Win | "Player 1 Wins!" / "Player 2 Wins!" | "Player 1 wins!" / "Player 2 wins!" |
| game over modal | Button | "Play Again" | |
| game over modal | Button | "Return to Menu" | |
| menu | Mode toggle | "vs Computer" / "2 Player" | |
| menu | Go first toggle | "Go First" / "Go Second" | |
| menu | Start button | "New Game" | |

### [ ] dominoes
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn | "Your turn" | |
| vs computer | No moves | "No moves - pass your turn" | |
| vs computer | Computer's turn | "Computer is thinking..." | "Thinking..." |
| vs computer | Computer no moves | "Computer passes" | |
| vs computer | Win | "You win!" | |
| vs computer | Lose | "Computer wins" | |
| vs computer | Draw | "Draw" | "Draw!" |
| vs computer | Win reason | "You cleared your hand!" | |
| vs computer | Lose reason | "Computer cleared its hand." | |
| vs computer | Draw reason | "Blocked - You: X pips, Computer: X pips" | |
| menu | Start button | "New Game" | |
| menu | Go first toggle | "Go First" / "Go Second" | |

### [ ] fox-and-geese
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn | "Your turn" | |
| vs computer | Computer's turn | "Thinking..." | |
| vs computer | Win | "Fox Wins!" / "Geese Win!" | "You win!" |
| vs computer | Lose | "Fox Wins!" / "Geese Win!" | "Computer wins" |
| 2 player | Player's turn | "Player 1's turn" / "Player 2's turn" | |
| 2 player | Win | "Fox Wins!" / "Geese Win!" | |
| 2 player | Draw | "No moves - Draw" | |
| menu | Mode toggle | "vs Computer" / "2 Player" | |
| menu | Play as toggle | "Fox" / "Geese" | |
| menu | Start button | "New Game" | |

### [ ] nine-mens-morris
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn (place) | "Your turn: Place a piece" | |
| vs computer | Player's turn (move) | "Your turn: Move a piece" | |
| vs computer | Player's turn (remove) | "Your turn: Remove an opponent piece" | |
| vs computer | Computer's turn | "Computer is thinking..." | "Thinking..." |
| vs computer | Win | "You Win!" | "You win!" |
| vs computer | Lose | "Computer Wins" | "Computer wins" |
| vs computer | Draw | "Draw by repetition" | |
| 2 player | Player's turn (place) | "Player 1's turn: Place a piece" | |
| 2 player | Player's turn (move) | "Player 1's turn: Move a piece" | |
| 2 player | Player's turn (remove) | "Player 1's turn: Remove an opponent piece" | |
| 2 player | Win | "Blue Wins!" / "Gold Wins!" | "Player 1 wins!" / "Player 2 wins!" |
| 2 player | Draw | "Draw" | "Draw!" |
| game over overlay | Win | "You Win!" / "Computer Wins" / "Blue Wins!" / "Gold Wins!" | same as above |
| menu | Mode toggle | "vs Computer" / "2 Player" | |
| menu | Go first toggle | "Go First" / "Go Second" | |
| menu | Start button | "New Game" | |
| help modal | Color references | "Blue" / "Gold" | "Player 1" / "Player 2" |

### [ ] oware
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn | "Your turn" | |
| vs computer | Opponent's turn | "Opponent's turn" | |
| vs computer | Computer thinking | "Thinking..." | |
| vs computer | Win | "You win!" | |
| vs computer | Lose | "You lose." | "You lose!" |
| vs computer | Draw | "Draw!" | |
| vs computer | In-game score labels | "You" / "Opp" | |
| vs computer | Game over score | "You" / "Opp" | |
| 2 player | Player's turn | "Player 1's turn" / "Player 2's turn" | |
| 2 player | Win | "Player X wins!" | |
| 2 player | Draw | "Draw!" | |
| 2 player | In-game score labels | "P1" / "P2" | |
| menu | Mode toggle | "vs Computer" / "vs Player" | "2 Player" |
| menu | Start button | "New Game" | |

### [ ] congkak
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn | "Your turn" | |
| vs computer | Opponent's turn | "Opponent's turn" | |
| vs computer | Computer thinking | "Thinking..." | |
| vs computer | Win | "You win!" | |
| vs computer | Lose | "You lose." | "You lose!" |
| vs computer | Draw | "Draw!" | |
| vs computer | In-game labels | "You" / "Opponent" | |
| 2 player | Opening (P1) | "Player 1: choose your opening house" | |
| 2 player | Pass prompt | "Pass to Player 2" | |
| 2 player | Opening (P2) | "Player 2: choose your opening house" | |
| 2 player | Player's turn | "Player 1's turn" / "Player 2's turn" | |
| 2 player | Win | "Player X wins!" | |
| 2 player | Draw | "Draw!" | |
| 2 player | Pass screen text | "Player 1 has chosen. Pass the device to Player 2." | |
| 2 player | Pass screen button | "Continue" | |
| menu | Mode toggle | "vs Computer" / "2 Players" | "2 Player" |
| menu | Start button | "New Game" | |

### [ ] shape-shooter
Skip

### [ ] pool
Skip

### [ ] reversi
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn | "Dark's turn" / "Light's turn" | "Your turn" |
| vs computer | Computer's turn | "Thinking..." | |
| vs computer | Win | "Dark wins!" / "Light wins!" | "You win!" |
| vs computer | Lose | "Dark wins!" / "Light wins!" | "Computer wins" |
| vs computer | Draw | "Draw!" | |
| vs computer | In-game score labels | "Dark:" / "Light:" | "You:" / "Computer:" |
| vs computer | Game over score | "Dark X - Light Y" | "You X - Computer Y" |
| 2 player | Player's turn | "Dark's turn" / "Light's turn" | "Player 1's turn" / "Player 2's turn" |
| 2 player | Win | "Dark wins!" / "Light wins!" | "Player 1 wins!" / "Player 2 wins!" |
| 2 player | Draw | "Draw!" | |
| 2 player | In-game score labels | "Dark:" / "Light:" | "Player 1:" / "Player 2:" |
| 2 player | Game over score | "Dark X - Light Y" | "Player 1 X - Player 2 Y" |
| menu | Mode toggle | "vs Computer" / "2 Players" | "2 Player" |
| menu | Go first toggle | "Go First" / "Go Second" | |
| menu | Start button | "New Game" | |
| help modal | Color references | "Dark" / "Light" | "Player 1" / "Player 2" |

### [x] tower-of-hanoi
| Location | State | Current | New |
|---|---|---|---|
| gameplay | Move counter | "Moves: X" | |
| gameplay | Optimal label | "Optimal: X" | |
| game over | Result | "Puzzle Solved!" | |
| game over | Button | "Play Again" | |
| menu | Disk selector | "3 Disks" / "5 Disks" / "7 Disks" | |
| menu | Start button | "New Game" | |

---

## React Games

### [ ] chess
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn | "White's turn" / "Black's turn" | "Your turn" |
| vs computer | Computer's turn | "Thinking..." | |
| vs computer | Check | "White is in check!" / "Black is in check!" | "You are in check!" |
| vs computer | Win | "White wins by checkmate!" | "You win!" |
| vs computer | Lose | "Black wins by checkmate!" | "Computer wins" |
| vs computer | Draw | "Stalemate — Draw" / "Draw" | |
| 2 player | Player's turn | "White's turn" / "Black's turn" | "Player 1's turn" / "Player 2's turn" |
| 2 player | Check | "White is in check!" / "Black is in check!" | "Player 1 is in check!" / "Player 2 is in check!" |
| 2 player | Win | "White wins by checkmate!" / "Black wins by checkmate!" | "Player 1 wins!" / "Player 2 wins!" |
| 2 player | Draw | "Stalemate — Draw" / "Draw" | |
| menu | Mode toggle | "vs Computer" / "2 Players" | "2 Player" |
| menu | Color picker | "Light (goes first)" / "Dark" | "Go First" / "Go Second" |
| menu | Start button | "New Game" / "Resume Game" | |

### [ ] checkers
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn | "Your turn" | |
| vs computer | Computer's turn | "Thinking..." | |
| vs computer | Win | "You win!" | |
| vs computer | Lose | "Computer wins" | |
| 2 player | Player's turn | "Player 1's turn" / "Player 2's turn" | |
| 2 player | Win | "Light wins!" / "Dark wins!" | "Player 1 wins!" / "Player 2 wins!" |
| 2 player | Win reason | "All Light pieces captured" / "No valid moves for Dark" | "All Player 1 pieces captured" / etc. |
| menu | Mode toggle | "vs Computer" / "2 Players" | "2 Player" |
| menu | Go first toggle | "Go First" / "Go Second" | |
| menu | Start button | "New Game" / "Resume Game" | |
| help modal | Color reference | "Light moves first." | remove or rephrase |

### [ ] backgammon
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn | "White's turn" | "Your turn" |
| vs computer | Computer's turn | "Black's turn" | "Thinking..." |
| vs computer | No moves | "White — No legal moves" | |
| vs computer | Win | "Light wins!" | "You win!" |
| vs computer | Lose | "Dark wins!" | "Computer wins" |
| 2 player | Player's turn | "White's turn" / "Black's turn" | "Player 1's turn" / "Player 2's turn" |
| 2 player | No moves | "— No legal moves" | |
| 2 player | Win | "Light wins!" / "Dark wins!" | "Player 1 wins!" / "Player 2 wins!" |
| menu | Mode toggle | "vs AI" / "2 Players" | "vs Computer" / "2 Player" |
| menu | Start button | "New Game" / "Resume Game" | |
| game over modal | Button | "Main Menu" | "Menu" |

### [ ] hearts
| Mode | State | Current | New |
|---|---|---|---|
| single player | Passing phase | "Pass Left" / "Pass Right" / "Pass Across" / "Keep All" | |
| single player | Trick counter | "Trick X of 13" | |
| single player | Win | "You Win!" | "You win!" |
| single player | Lose | "{position} Wins" (e.g. "West Wins") | "{position} wins" |
| single player | Tie | "Tie Game" | |
| single player | In-game button | "New" | "New Game" |
| menu | Start button | "Start Game" | "New Game" |

### [ ] cribbage
| Mode | State | Current | New |
|---|---|---|---|
| single player | Dealing | "Dealing..." | |
| single player | Discard prompt | "Select 2 cards to discard" | |
| single player | Opponent discard | "Opponent is discarding..." | |
| single player | Cut prompt | "Cut the deck to reveal the starter card" | |
| single player | Opponent cut | "Opponent is cutting the deck..." | |
| single player | Win | "You Win!" | "You win!" |
| single player | Lose | "Opponent Wins" | "Opponent wins" |
| menu | Start button | "Play" | "New Game" |

### [ ] five-dice
| Mode | State | Current | New |
|---|---|---|---|
| single player | Start of turn | "Roll to start turn X / 13" | |
| single player | Mid-turn | "Click dice to hold, then roll again or pick a category" | |
| single player | Final roll | "Pick a category to score" | |
| single player | Game over | "Game Over" | |
| menu | Start button | "Play" | "New Game" |
| menu | Resume button | "Resume Game" | |

### [ ] solitaire
| Mode | State | Current | New |
|---|---|---|---|
| single player | Win | "You Win!" | "You win!" |
| menu | Start button | "New Game" | |
| menu | Draw mode buttons | "Draw 1" / "Draw 3" | |

### [ ] block-stacker
Skip

### [ ] bomb-buster
Skip

### [ ] grid-connect
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn | "Red's turn" / "Yellow's turn" | "Your turn" |
| vs computer | Computer's turn | "Red's turn" / "Yellow's turn" | "Thinking..." |
| vs computer | Win | "Red wins!" / "Yellow wins!" | "You win!" |
| vs computer | Lose | "Red wins!" / "Yellow wins!" | "Computer wins" |
| vs computer | Draw | "It's a draw!" | "Draw!" |
| 2 player | Player's turn | "Red's turn" / "Yellow's turn" | "Player 1's turn" / "Player 2's turn" |
| 2 player | Win | "Red wins!" / "Yellow wins!" | "Player 1 wins!" / "Player 2 wins!" |
| 2 player | Draw | "It's a draw!" | "Draw!" |
| menu | Mode toggle | "vs Computer" / "vs Player" | "2 Player" |
| menu | Play as toggle | "Play as Red" / "Play as Yellow" | |
| menu | Start button | "Start Game" | "New Game" |

### [ ] number-tiles
| Location | State | Current | New |
|---|---|---|---|
| gameplay | Move counter | "Moves" | |
| gameplay | Timer | "Time" | |
| game over | Result | "Puzzle Solved!" | |
| game over | Achievement | "New best!" | |
| menu | Start button | "Play" | "New Game" |
| menu | Resume button | "Resume {mode}" | |

### [ ] codetrivia
Skip

### [ ] variable-sorter
Skip

### [ ] rock-paper-scissors
Skip

### [ ] tic-tac-toe
Skip

### [ ] picaria
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn (place) | "Your turn: place a piece" | |
| vs computer | Player's turn (move) | "Your turn" | |
| vs computer | Computer's turn | "Computer thinking..." | "Thinking..." |
| vs computer | No moves | "No moves - turn skipped" | |
| vs computer | Win | "You Win!" | "You win!" |
| vs computer | Lose | "Computer Wins" | "Computer wins" |
| vs computer | Draw | "Draw" | "Draw!" |
| 2 player | Player's turn (place) | "Player 1: place a piece" / "Player 2: place a piece" | |
| 2 player | Player's turn (move) | "Player 1's turn" / "Player 2's turn" | |
| 2 player | Win | "Player 1 Wins" / "Player 2 Wins" | "Player 1 wins!" / "Player 2 wins!" |
| 2 player | Draw | "Draw" | "Draw!" |
| menu | Mode toggle | "vs Computer" / "2 Player" | |
| menu | Go first toggle | "Go First" / "Go Second" | |
| menu | Start button | "New Game" / "Resume Game" | |

### [ ] achi
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn (place) | "Your turn: place a piece" | |
| vs computer | Player's turn (pick) | "Your turn: pick a piece" | |
| vs computer | Player's turn (dest) | "Your turn: pick a destination" | |
| vs computer | Computer's turn | "Computer is thinking..." | "Thinking..." |
| vs computer | Win | "You win!" | |
| vs computer | Lose | "Computer wins" | |
| vs computer | Draw | "Draw!" | |
| 2 player | Player's turn (place) | "Player 1: place a piece" / "Player 2: place a piece" | |
| 2 player | Player's turn (pick) | "Player 1: pick a piece" / "Player 2: pick a piece" | |
| 2 player | Player's turn (dest) | "Player 1: pick a destination" / "Player 2: pick a destination" | |
| 2 player | Win | "P1 wins!" / "P2 wins!" | "Player 1 wins!" / "Player 2 wins!" |
| 2 player | Draw | "Draw!" | |
| menu | Mode toggle | "vs Computer" / "2 Player" | |
| menu | Go first toggle | "Go first" / "Go second" | "Go First" / "Go Second" |
| menu | Start button | "New Game" / "Resume Game" | |

### [ ] dara
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn (place) | "Place a piece" | |
| vs computer | Player's turn (move) | "Select a piece to move" | |
| vs computer | Player's turn (dest) | "Select where to move" | |
| vs computer | Player's turn (capture) | "Select a piece to capture" | |
| vs computer | Computer placing | "Computer placing..." | |
| vs computer | Computer thinking | "Computer thinking..." | "Thinking..." |
| vs computer | Win | "You win!" | |
| vs computer | Lose | "Computer wins" | |
| 2 player | Player's turn (place) | "Player 1: place a piece" / "Player 2: place a piece" | |
| 2 player | Player's turn (move) | "Player 1: select a piece to move" / "Player 2: select a piece to move" | |
| 2 player | Player's turn (capture) | "Player 1: select a piece to capture" / "Player 2: select a piece to capture" | |
| 2 player | Win | "Player 1 wins!" / "Player 2 wins!" | |
| menu | Mode toggle | "vs Computer" / "2 Player" | |
| menu | Go first toggle | "Go First" / "Go Second" | |
| menu | Start button | "New Game" / "Resume Game" | |

### [ ] shisima
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn | "Your turn" | |
| vs computer | Computer's turn | "Computer thinking..." | "Thinking..." |
| vs computer | No moves | "No moves — turn skipped" | |
| vs computer | Win | "You Win!" | "You win!" |
| vs computer | Lose | "Computer Wins" | "Computer wins" |
| vs computer | Draw | "Draw" | "Draw!" |
| 2 player | Player's turn | "Player 1's turn" / "Player 2's turn" | |
| 2 player | Win | "Player 1 Wins" / "Player 2 Wins" | "Player 1 wins!" / "Player 2 wins!" |
| 2 player | Draw | "Draw" | "Draw!" |
| menu | Mode toggle | "vs Computer" / "2 Player" | |
| menu | Go first toggle | "Go First" / "Go Second" | |
| menu | Start button | "New Game" / "Resume Game" | |

### [ ] fanorona
| Mode | State | Current | New |
|---|---|---|---|
| vs computer | Player's turn | "Your turn" | |
| vs computer | Computer's turn | "Computer thinking..." | "Thinking..." |
| vs computer | Win | "You Win!" | "You win!" |
| vs computer | Lose | "Computer Wins!" | "Computer wins" |
| vs computer | No moves note | "No legal moves remaining" | |
| 2 player | Player 1's turn | "Dark's turn" | "Player 1's turn" |
| 2 player | Player 2's turn | "Light's turn" | "Player 2's turn" |
| 2 player | Win | "Dark Wins!" / "Light Wins!" | "Player 1 wins!" / "Player 2 wins!" |
| menu | Mode toggle | "vs Computer" / "2 Player" | |
| menu | Start button | "New Game" | |
