export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export interface Selection {
  source: 'tableau' | 'waste';
  colIndex: number | null;
  cardIndex: number | null;
  cards: Card[];
}

export interface GameOptions {
  drawCount: 1 | 3;
}

export interface GameState {
  tableau: Card[][];
  foundations: Card[][];
  stock: Card[];
  waste: Card[];
  selected: Selection | null;
  phase: 'playing' | 'won';
  drawCount: 1 | 3;
  moves: number;
  elapsedSeconds: number;
  timerActive: boolean;
  autoCompleting: boolean;
}

export function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  return suits.flatMap(suit =>
    ranks.map(rank => ({ id: `${suit}-${rank}`, suit, rank, faceUp: false }))
  );
}

export function shuffle(deck: Card[]): Card[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function dealInitialState(options: GameOptions): GameState {
  const deck = shuffle(createDeck());
  const tableau: Card[][] = [];
  let idx = 0;

  for (let col = 0; col < 7; col++) {
    const column: Card[] = [];
    for (let row = 0; row <= col; row++) {
      column.push({ ...deck[idx++], faceUp: row === col });
    }
    tableau.push(column);
  }

  return {
    tableau,
    foundations: [[], [], [], []],
    stock: deck.slice(idx).map(c => ({ ...c, faceUp: false })),
    waste: [],
    selected: null,
    phase: 'playing',
    drawCount: options.drawCount,
    moves: 0,
    elapsedSeconds: 0,
    timerActive: true,
    autoCompleting: false,
  };
}

export function getCardColor(card: Card): 'red' | 'black' {
  return card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black';
}

export function canPlaceOnTableau(cards: Card[], targetCol: Card[]): boolean {
  if (cards.length === 0) return false;
  const card = cards[0];
  if (targetCol.length === 0) return card.rank === 13;
  const top = targetCol[targetCol.length - 1];
  return top.faceUp && card.rank === top.rank - 1 && getCardColor(card) !== getCardColor(top);
}

export function canPlaceOnFoundation(card: Card, foundation: Card[]): boolean {
  if (foundation.length === 0) return card.rank === 1;
  const top = foundation[foundation.length - 1];
  return card.suit === top.suit && card.rank === top.rank + 1;
}

export function getFoundationIndex(suit: Suit): number {
  return (['hearts', 'diamonds', 'clubs', 'spades'] as Suit[]).indexOf(suit);
}

export function drawFromStock(state: GameState): GameState {
  const { stock, waste, drawCount, moves } = state;

  if (stock.length > 0) {
    const count = Math.min(drawCount, stock.length);
    // Reverse so original top of stock ends up deepest in the waste batch (correct deal order)
    const drawn = stock.slice(-count).reverse().map(c => ({ ...c, faceUp: true }));
    return {
      ...state,
      stock: stock.slice(0, stock.length - count),
      waste: [...waste, ...drawn],
      moves: moves + 1,
    };
  }

  if (waste.length > 0) {
    // Flip waste face-down back to stock: waste[last] (top) -> stock[0] (bottom), waste[0] (bottom) -> stock[last] (top, drawn first)
    return {
      ...state,
      stock: [...waste].reverse().map(c => ({ ...c, faceUp: false })),
      waste: [],
      moves: moves + 1,
    };
  }

  return state;
}

function autoFlipExposed(state: GameState): GameState {
  let changed = false;
  const newTableau = state.tableau.map(col => {
    if (col.length === 0 || col[col.length - 1].faceUp) return col;
    changed = true;
    return [...col.slice(0, -1), { ...col[col.length - 1], faceUp: true }];
  });
  return changed ? { ...state, tableau: newTableau } : state;
}

export function checkWin(state: GameState): boolean {
  return state.foundations.every(f => f.length === 13);
}

export function canAutoComplete(state: GameState): boolean {
  if (state.stock.length > 0 || state.waste.length > 0) return false;
  return state.tableau.every(col => col.every(card => card.faceUp));
}

export function autoCompleteStep(state: GameState): GameState {
  type Candidate = { card: Card; source: 'tableau' | 'waste'; colIdx: number; foundIdx: number };
  const candidates: Candidate[] = [];

  if (state.waste.length > 0) {
    const card = state.waste[state.waste.length - 1];
    const foundIdx = getFoundationIndex(card.suit);
    if (canPlaceOnFoundation(card, state.foundations[foundIdx])) {
      candidates.push({ card, source: 'waste', colIdx: -1, foundIdx });
    }
  }

  state.tableau.forEach((col, colIdx) => {
    if (col.length === 0) return;
    const card = col[col.length - 1];
    if (!card.faceUp) return;
    const foundIdx = getFoundationIndex(card.suit);
    if (canPlaceOnFoundation(card, state.foundations[foundIdx])) {
      candidates.push({ card, source: 'tableau', colIdx, foundIdx });
    }
  });

  if (candidates.length === 0) return { ...state, autoCompleting: false };

  candidates.sort((a, b) => a.card.rank - b.card.rank);
  const { card, source, colIdx, foundIdx } = candidates[0];

  const newFoundations = state.foundations.map((f, i) => i === foundIdx ? [...f, card] : f);
  const newTableau = source === 'tableau'
    ? state.tableau.map((col, i) => i === colIdx ? col.slice(0, -1) : col)
    : state.tableau;
  const newWaste = source === 'waste' ? state.waste.slice(0, -1) : state.waste;
  const newState = { ...state, tableau: newTableau, foundations: newFoundations, waste: newWaste, moves: state.moves + 1 };

  if (checkWin(newState)) {
    return { ...newState, phase: 'won', timerActive: false, autoCompleting: false };
  }
  return newState;
}

export function attemptMove(
  state: GameState,
  target: 'tableau' | 'foundation',
  targetIndex: number
): GameState {
  const { selected, tableau, foundations, moves } = state;
  if (!selected) return state;

  if (target === 'foundation') {
    if (selected.cards.length !== 1) return { ...state, selected: null };
    const card = selected.cards[0];
    if (!canPlaceOnFoundation(card, foundations[targetIndex])) return { ...state, selected: null };

    const newFoundations = foundations.map((f, i) => i === targetIndex ? [...f, card] : f);
    const newTableau = selected.source === 'tableau' && selected.colIndex !== null
      ? tableau.map((col, i) => i === selected.colIndex ? col.slice(0, -1) : col)
      : tableau;
    const newWaste = selected.source === 'waste' ? state.waste.slice(0, -1) : state.waste;

    let next = autoFlipExposed({ ...state, tableau: newTableau, foundations: newFoundations, waste: newWaste, selected: null, moves: moves + 1 });
    if (checkWin(next)) return { ...next, phase: 'won', timerActive: false };
    if (canAutoComplete(next)) return { ...next, autoCompleting: true };
    return next;
  }

  if (target === 'tableau') {
    if (!canPlaceOnTableau(selected.cards, tableau[targetIndex])) return { ...state, selected: null };

    const newTableau = tableau.map((col, i) => {
      if (i === targetIndex) return [...col, ...selected.cards];
      if (selected.source === 'tableau' && i === selected.colIndex && selected.cardIndex !== null) {
        return col.slice(0, selected.cardIndex);
      }
      return col;
    });
    const newWaste = selected.source === 'waste' ? state.waste.slice(0, -1) : state.waste;

    let next = autoFlipExposed({ ...state, tableau: newTableau, waste: newWaste, selected: null, moves: moves + 1 });
    if (canAutoComplete(next)) return { ...next, autoCompleting: true };
    return next;
  }

  return state;
}

export function selectCard(
  state: GameState,
  source: 'tableau' | 'waste',
  colIndex: number | null,
  cardIndex: number | null
): GameState {
  const { selected, tableau, waste } = state;

  if (source === 'waste') {
    if (waste.length === 0) return state;
    if (selected?.source === 'waste') return { ...state, selected: null };
    const topCard = waste[waste.length - 1];
    return { ...state, selected: { source: 'waste', colIndex: null, cardIndex: null, cards: [topCard] } };
  }

  if (colIndex === null || cardIndex === null) return state;
  const col = tableau[colIndex];
  const card = col[cardIndex];
  if (!card?.faceUp) return state;

  if (selected?.source === 'tableau' && selected.colIndex === colIndex && selected.cardIndex === cardIndex) {
    return { ...state, selected: null };
  }

  if (selected && canPlaceOnTableau(selected.cards, col)) {
    return attemptMove(state, 'tableau', colIndex);
  }

  return { ...state, selected: { source: 'tableau', colIndex, cardIndex, cards: col.slice(cardIndex) } };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
