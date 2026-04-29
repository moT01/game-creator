// ─── Game Logic ───────────────────────────────────────────────────────────────

function generateTiles() {
  const tiles = [];
  for (let a = 0; a <= 6; a++) {
    for (let b = a; b <= 6; b++) {
      tiles.push({ a, b });
    }
  }
  return tiles;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dealTiles() {
  const tiles = shuffle(generateTiles());
  return {
    playerHand: tiles.slice(0, 7),
    computerHand: tiles.slice(7, 14),
    boneyard: tiles.slice(14),
  };
}

function generateBoneyardPositions(count) {
  const rotations = [-5, 4, -3, 6, -4, 3, -6, 5, -2, 7, -4, 3, -6, 4];
  const yOffsets = [0, 3, -4, 5, -2, 4, -3, 2, -5, 4, -3, 6, -2, 3];
  return Array.from({ length: count }, (_, i) => ({
    rot: String(rotations[i % rotations.length]),
    yOffset: yOffsets[i % yOffsets.length],
  }));
}

function determineFirstPlayer(playerHand, computerHand) {
  // Find highest double (6|6 down to 0|0)
  for (let v = 6; v >= 0; v--) {
    if (playerHand.some(t => t.a === v && t.b === v)) {
      return { firstPlayer: 'player', openingTile: { a: v, b: v } };
    }
    if (computerHand.some(t => t.a === v && t.b === v)) {
      return { firstPlayer: 'computer', openingTile: { a: v, b: v } };
    }
  }
  // No doubles — highest pip sum tile across both hands
  let best = null;
  let bestOwner = 'computer';
  for (const t of playerHand) {
    const s = t.a + t.b;
    if (best === null || s > best) { best = s; bestOwner = 'player'; }
  }
  for (const t of computerHand) {
    const s = t.a + t.b;
    if (s > best) { best = s; bestOwner = 'computer'; }
  }
  // Find the actual tile for openingTile (first match in owner's hand)
  const ownerHand = bestOwner === 'player' ? playerHand : computerHand;
  const openingTile = ownerHand.find(t => (t.a + t.b) === best);
  return { firstPlayer: bestOwner, openingTile };
}

function getValidMoves(hand, leftEnd, rightEnd) {
  if (leftEnd === null) {
    // Empty chain — all tiles valid
    return hand.map((_, i) => ({ tileIndex: i, end: 'both' }));
  }
  const moves = [];
  hand.forEach((tile, i) => {
    const matchLeft = tile.a === leftEnd || tile.b === leftEnd;
    const matchRight = tile.a === rightEnd || tile.b === rightEnd;
    if (matchLeft && matchRight) {
      moves.push({ tileIndex: i, end: 'both' });
    } else if (matchLeft) {
      moves.push({ tileIndex: i, end: 'left' });
    } else if (matchRight) {
      moves.push({ tileIndex: i, end: 'right' });
    }
  });
  return moves;
}

function resolveFlipped(tile, end, endValue) {
  if (tile.a === tile.b) return false; // double — never flipped
  if (end === 'left') {
    // b-end is the new outer if tile.a matches (tile.a connects to chain)
    return tile.a === endValue;
  } else {
    // right: a-end is the new outer if tile.b matches (tile.b connects to chain)
    return tile.b === endValue;
  }
}

function computeNewEnd(tile, flipped, side) {
  if (side === 'left') {
    return flipped ? tile.b : tile.a;
  } else {
    return flipped ? tile.a : tile.b;
  }
}

function placeTile(tileIndex, hand, end, chain, leftEnd, rightEnd) {
  const tile = hand[tileIndex];
  const newHand = hand.filter((_, i) => i !== tileIndex);

  let newChain, newLeft, newRight;

  if (leftEnd === null) {
    // Empty chain — first tile placed
    const isDouble = tile.a === tile.b;
    const chainTile = { a: tile.a, b: tile.b, flipped: false };
    newChain = [chainTile];
    newLeft = tile.a;
    newRight = isDouble ? tile.a : tile.b;
  } else if (end === 'left') {
    const flipped = resolveFlipped(tile, 'left', leftEnd);
    const chainTile = { a: tile.a, b: tile.b, flipped };
    newChain = [chainTile, ...chain];
    newLeft = computeNewEnd(tile, flipped, 'left');
    newRight = rightEnd;
  } else {
    // right
    const flipped = resolveFlipped(tile, 'right', rightEnd);
    const chainTile = { a: tile.a, b: tile.b, flipped };
    newChain = [...chain, chainTile];
    newLeft = leftEnd;
    newRight = computeNewEnd(tile, flipped, 'right');
  }

  return { hand: newHand, chain: newChain, leftEnd: newLeft, rightEnd: newRight };
}

function resolveBlockedGame(playerHand, computerHand) {
  const playerPips = playerHand.reduce((s, t) => s + t.a + t.b, 0);
  const computerPips = computerHand.reduce((s, t) => s + t.a + t.b, 0);
  let winner;
  if (playerPips < computerPips) winner = 'player';
  else if (computerPips < playerPips) winner = 'computer';
  else winner = 'draw';
  return { winner, playerPips, computerPips };
}

function computeComputerMove(state) {
  const { computerHand, playerHand, leftEnd, rightEnd, chain, boneyard } = state;
  const moves = getValidMoves(computerHand, leftEnd, rightEnd);
  if (moves.length === 0) return null;

  // Count tiles that have been played (visible to all)
  const playedCounts = Array(7).fill(0);
  chain.forEach(ct => { playedCounts[ct.a]++; playedCounts[ct.b]++; });

  function scoreMove(move) {
    const tile = computerHand[move.tileIndex];
    let score = 0;

    // Prefer doubles (hard to play later)
    if (tile.a === tile.b) score += 3;

    // Determine what the new ends would be after this move
    let newLeft = leftEnd, newRight = rightEnd;
    if (leftEnd === null) {
      newLeft = tile.a;
      newRight = tile.a === tile.b ? tile.a : tile.b;
    } else if (move.end === 'left' || move.end === 'both') {
      const flipped = resolveFlipped(tile, 'left', leftEnd);
      newLeft = computeNewEnd(tile, flipped, 'left');
    } else {
      const flipped = resolveFlipped(tile, 'right', rightEnd);
      newRight = computeNewEnd(tile, flipped, 'right');
    }

    // +1 for each remaining hand tile still playable after move
    const remaining = computerHand.filter((_, i) => i !== move.tileIndex);
    const stillPlayable = getValidMoves(remaining, newLeft, newRight).length;
    score += stillPlayable;

    // Prefer ends that leave opponent fewer options (estimate from played counts)
    const playerMatchLeft = playerHand.filter(t => t.a === newLeft || t.b === newLeft).length;
    const playerMatchRight = playerHand.filter(t => t.a === newRight || t.b === newRight).length;
    score -= (playerMatchLeft + playerMatchRight) * 0.5;

    // Tiebreak: unload heavy tiles
    score += (tile.a + tile.b) * 0.01;

    return score;
  }

  let best = moves[0];
  let bestScore = scoreMove(moves[0]);
  for (let i = 1; i < moves.length; i++) {
    const s = scoreMove(moves[i]);
    if (s > bestScore) { bestScore = s; best = moves[i]; }
  }
  return best;
}

function checkWin(hand) {
  return hand.length === 0;
}

// ─── Persistence ──────────────────────────────────────────────────────────────

function saveGame(state) {
  const toSave = {
    boneyard: state.boneyard,
    playerHand: state.playerHand,
    computerHand: state.computerHand,
    chain: state.chain,
    leftEnd: state.leftEnd,
    rightEnd: state.rightEnd,
    turn: state.turn,
    consecutivePasses: state.consecutivePasses,
    zoom: state.zoom,
  };
  localStorage.setItem('dominoes-saved-game', JSON.stringify(toSave));
}

function loadGame() {
  try {
    const raw = localStorage.getItem('dominoes-saved-game');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveWins(wins) {
  localStorage.setItem('dominoes-wins', String(wins));
}

function loadWins() {
  const raw = localStorage.getItem('dominoes-wins');
  return raw ? parseInt(raw, 10) : 0;
}

function saveTheme(theme) {
  localStorage.setItem('dominoes-theme', theme);
}

function loadTheme() {
  return localStorage.getItem('dominoes-theme') || 'dark';
}

function saveGoFirst(val) {
  localStorage.setItem('dominoes-go-first', String(val));
}

function loadGoFirst() {
  const raw = localStorage.getItem('dominoes-go-first');
  return raw === null ? true : raw === 'true';
}

// ─── State ────────────────────────────────────────────────────────────────────

let state = {
  phase: 'home',
  boneyard: [],
  playerHand: [],
  computerHand: [],
  chain: [],
  leftEnd: null,
  rightEnd: null,
  turn: 'player',
  selectedTileIndex: null,
  consecutivePasses: 0,
  isAnimating: false,
  zoom: 1.0,
  result: null,
  wins: loadWins(),
  goFirst: loadGoFirst(),
  panX: 0,
  panY: 0,
  boneyardPositions: [],
};

// ─── Turn Logic ───────────────────────────────────────────────────────────────

function startTurn() {
  const hand = state.turn === 'player' ? state.playerHand : state.computerHand;
  const moves = getValidMoves(hand, state.leftEnd, state.rightEnd);

  if (moves.length > 0) {
    if (state.turn === 'computer') {
      state.isAnimating = true;
      render();
      setTimeout(() => {
        doComputerTurn();
      }, 800);
    } else {
      state.isAnimating = false;
      render();
    }
    return;
  }

  // No valid moves
  if (state.boneyard.length > 0) {
    drawFromBoneyard();
    return;
  }

  // Pass
  state.consecutivePasses++;
  if (state.consecutivePasses >= 2) {
    const res = resolveBlockedGame(state.playerHand, state.computerHand);
    state.result = { winner: res.winner, reason: 'blocked', playerPips: res.playerPips, computerPips: res.computerPips };
    if (res.winner === 'player') {
      state.wins++;
      saveWins(state.wins);
    }
    state.phase = 'gameover';
    clearSavedGame();
    render();
    return;
  }

  const passer = state.turn;
  state.turn = state.turn === 'player' ? 'computer' : 'player';
  showPassMessage(passer, () => {
    saveGame(state);
    startTurn();
  });
}

function drawFromBoneyard() {
  if (state.boneyard.length === 0) return;

  const tile = state.boneyard.pop();
  if (state.boneyardPositions.length > 0) state.boneyardPositions.pop();
  if (state.turn === 'player') {
    state.playerHand = [...state.playerHand, tile];
  } else {
    state.computerHand = [...state.computerHand, tile];
  }
  state.consecutivePasses = 0;

  // Pulse boneyard count
  pulseBoneyard();
  render();

  // Check if now playable
  const hand = state.turn === 'player' ? state.playerHand : state.computerHand;
  const moves = getValidMoves(hand, state.leftEnd, state.rightEnd);
  if (moves.length > 0) {
    if (state.turn === 'computer') {
      state.isAnimating = true;
      render();
      setTimeout(() => {
        doComputerTurn();
      }, 400);
    } else {
      state.isAnimating = false;
      render();
    }
    return;
  }

  // Still can't play — draw another if boneyard not empty
  if (state.boneyard.length > 0) {
    setTimeout(() => drawFromBoneyard(), 300);
    return;
  }

  // Boneyard exhausted — pass
  state.consecutivePasses++;
  if (state.consecutivePasses >= 2) {
    const res = resolveBlockedGame(state.playerHand, state.computerHand);
    state.result = { winner: res.winner, reason: 'blocked', playerPips: res.playerPips, computerPips: res.computerPips };
    if (res.winner === 'player') {
      state.wins++;
      saveWins(state.wins);
    }
    state.phase = 'gameover';
    clearSavedGame();
    render();
    return;
  }

  const passer = state.turn;
  state.turn = state.turn === 'player' ? 'computer' : 'player';
  showPassMessage(passer, () => {
    saveGame(state);
    startTurn();
  });
}

function doComputerTurn() {
  const move = computeComputerMove(state);
  if (!move) {
    // Should not happen here but guard anyway
    state.isAnimating = false;
    return;
  }

  const result = placeTile(move.tileIndex, state.computerHand, move.end, state.chain, state.leftEnd, state.rightEnd);
  state.computerHand = result.hand;
  state.chain = result.chain;
  state.leftEnd = result.leftEnd;
  state.rightEnd = result.rightEnd;
  state.consecutivePasses = 0;
  state.isAnimating = false;
  state.lastComputerTileIndex = move.end === 'right' ? result.chain.length - 1 : 0;

  if (checkWin(state.computerHand)) {
    const playerPips = state.playerHand.reduce((s, t) => s + t.a + t.b, 0);
    state.result = { winner: 'computer', reason: 'empty-hand', playerPips, computerPips: 0 };
    state.phase = 'gameover';
    clearSavedGame();
    render();
    return;
  }

  state.turn = 'player';
  saveGame(state);
  startTurn();
}

function handlePlayerPlace(tileIndex, end) {
  if (state.isAnimating || state.turn !== 'player') return;

  const result = placeTile(tileIndex, state.playerHand, end, state.chain, state.leftEnd, state.rightEnd);
  state.playerHand = result.hand;
  state.chain = result.chain;
  state.leftEnd = result.leftEnd;
  state.rightEnd = result.rightEnd;
  state.consecutivePasses = 0;
  state.selectedTileIndex = null;
  state.lastComputerTileIndex = null;

  if (checkWin(state.playerHand)) {
    const computerPips = state.computerHand.reduce((s, t) => s + t.a + t.b, 0);
    state.result = { winner: 'player', reason: 'empty-hand', playerPips: 0, computerPips };
    state.wins++;
    saveWins(state.wins);
    state.phase = 'gameover';
    clearSavedGame();
    render();
    return;
  }

  state.turn = 'computer';
  saveGame(state);
  startTurn();
}

function clearSavedGame() {
  localStorage.removeItem('dominoes-saved-game');
}

// ─── New Game ─────────────────────────────────────────────────────────────────

function newGame() {
  const dealt = dealTiles();
  const firstPlayer = state.goFirst ? 'player' : 'computer';

  state = {
    phase: 'playing',
    boneyard: dealt.boneyard,
    playerHand: dealt.playerHand,
    computerHand: dealt.computerHand,
    chain: [],
    leftEnd: null,
    rightEnd: null,
    turn: firstPlayer,
    selectedTileIndex: null,
    consecutivePasses: 0,
    isAnimating: false,
    zoom: 1.0,
    result: null,
    wins: state.wins,
    goFirst: state.goFirst,
    panX: 0,
    panY: 0,
    boneyardPositions: generateBoneyardPositions(dealt.boneyard.length),
  };

  render();
  startTurn();
}

function resumeGame() {
  const saved = loadGame();
  if (!saved) return;
  state = {
    ...state,
    ...saved,
    phase: 'playing',
    selectedTileIndex: null,
    isAnimating: false,
    result: null,
    openingTile: null,
  };
  state.boneyardPositions = generateBoneyardPositions(state.boneyard.length);
  render();
  startTurn();
}

// ─── Zoom ─────────────────────────────────────────────────────────────────────

function zoomIn() {
  state.zoom = Math.min(2.0, parseFloat((state.zoom + 0.1).toFixed(1)));
  renderBoard();
  scrollChainToCenter();
}

function zoomOut() {
  state.zoom = Math.max(0.4, parseFloat((state.zoom - 0.1).toFixed(1)));
  renderBoard();
  scrollChainToCenter();
}

function scrollChainToCenter() {
  state.panX = 0;
  state.panY = 0;
  renderBoard();
}

// ─── Pip Rendering ────────────────────────────────────────────────────────────

// Standard pip positions for 0-6 on a 3x3 grid (row, col) zero-indexed
const PIP_POSITIONS = {
  0: [],
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

function renderPips(n) {
  const grid = document.createElement('div');
  grid.className = 'pip-grid';
  const positions = PIP_POSITIONS[n] || [];
  const posSet = new Set(positions.map(([r, c]) => `${r},${c}`));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = document.createElement('div');
      cell.className = 'pip-cell';
      if (posSet.has(`${r},${c}`)) {
        const dot = document.createElement('div');
        dot.className = 'pip-dot';
        cell.appendChild(dot);
      }
      grid.appendChild(cell);
    }
  }
  return grid;
}

// ─── Domino Element ───────────────────────────────────────────────────────────

function makeDominoEl(a, b, isDouble, extra = '') {
  const el = document.createElement('div');
  el.className = 'domino' + (isDouble ? ' domino--double' : ' domino--horizontal') + (extra ? ' ' + extra : '');

  const half1 = document.createElement('div');
  half1.className = 'domino-half';
  half1.appendChild(renderPips(a));

  const divider = document.createElement('div');
  divider.className = 'domino-divider';

  const half2 = document.createElement('div');
  half2.className = 'domino-half';
  half2.appendChild(renderPips(b));

  el.appendChild(half1);
  el.appendChild(divider);
  el.appendChild(half2);
  return el;
}

// ─── Chain Rendering ──────────────────────────────────────────────────────────

function renderChain() {
  const { chain, leftEnd, rightEnd, selectedTileIndex, playerHand } = state;
  const validMoves = state.turn === 'player'
    ? getValidMoves(playerHand, leftEnd, rightEnd)
    : [];

  const wrapper = document.querySelector('.chain-wrapper');
  if (!wrapper) return;
  wrapper.innerHTML = '';

  const selectedMove = selectedTileIndex !== null
    ? validMoves.find(m => m.tileIndex === selectedTileIndex)
    : null;

  // Left end target — hidden on empty chain
  if (chain.length > 0) {
    const leftTarget = document.createElement('button');
    leftTarget.className = 'chain-end chain-end-left';
    leftTarget.setAttribute('aria-label', 'Play left');
    const showLeft = selectedMove && (selectedMove.end === 'left' || selectedMove.end === 'both');
    leftTarget.setAttribute('aria-disabled', String(!showLeft));
    if (showLeft) {
      leftTarget.classList.add('end--highlight');
      leftTarget.addEventListener('click', () => handlePlayerPlace(selectedTileIndex, 'left'));
    }
    wrapper.appendChild(leftTarget);
  }

  if (chain.length === 0) {
    const canPlace = selectedMove !== null;
    const empty = document.createElement(canPlace ? 'button' : 'div');
    empty.className = 'chain-empty' + (canPlace ? ' chain-empty--highlight' : '');
    empty.textContent = 'Place the first tile';
    if (canPlace) {
      empty.addEventListener('click', () => handlePlayerPlace(selectedTileIndex, 'left'));
    }
    wrapper.appendChild(empty);
  } else {
    chain.forEach((ct, idx) => {
      const isDouble = ct.a === ct.b;
      // When flipped, the displayed tile shows (b, a) visually
      const displayA = ct.flipped ? ct.b : ct.a;
      const displayB = ct.flipped ? ct.a : ct.b;
      const isLastComputer = idx === state.lastComputerTileIndex;
      const el = makeDominoEl(displayA, displayB, isDouble, 'chain-tile' + (isLastComputer ? ' chain-tile--computer' : ''));
      if (idx === 0 || idx === chain.length - 1) {
        el.dataset.chainIdx = idx;
      }
      wrapper.appendChild(el);
    });
  }

  // Right end target — hidden on empty chain
  if (chain.length > 0) {
    const rightTarget = document.createElement('button');
    rightTarget.className = 'chain-end chain-end-right';
    rightTarget.setAttribute('aria-label', 'Play right');
    const showRight = selectedMove && (selectedMove.end === 'right' || selectedMove.end === 'both');
    rightTarget.setAttribute('aria-disabled', String(!showRight));
    if (showRight) {
      rightTarget.classList.add('end--highlight');
      rightTarget.addEventListener('click', () => handlePlayerPlace(selectedTileIndex, 'right'));
    }
    wrapper.appendChild(rightTarget);
  }

  const content = document.querySelector('.board-content');
  if (content) content.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
}

// ─── Board Rendering ──────────────────────────────────────────────────────────

function renderBoard() {
  renderChain();
}

// ─── Hand Rendering ───────────────────────────────────────────────────────────

function renderPlayerHand() {
  const { playerHand, selectedTileIndex, turn, isAnimating } = state;
  const validMoves = (turn === 'player' && !isAnimating)
    ? getValidMoves(playerHand, state.leftEnd, state.rightEnd)
    : [];
  const validIndices = new Set(validMoves.map(m => m.tileIndex));

  const container = document.querySelector('.player-hand');
  if (!container) return;
  container.innerHTML = '';

  const label = document.createElement('div');
  label.className = 'player-hand-label';
  label.textContent = `You: ${playerHand.length} tiles`;
  container.appendChild(label);

  playerHand.forEach((tile, i) => {
    const isDouble = tile.a === tile.b;
    const isSelected = i === selectedTileIndex;
    const isDisabled = !validIndices.has(i);

    const btn = document.createElement('button');
    btn.className = 'domino domino--hand' + (isDouble ? ' domino--double' : ' domino--horizontal');
    if (isSelected) btn.classList.add('domino--selected');
    if (isDisabled) btn.classList.add('domino--disabled');
    btn.setAttribute('aria-label', `Tile ${tile.a}|${tile.b}`);
    btn.setAttribute('aria-pressed', String(isSelected));
    if (isDisabled) btn.setAttribute('aria-disabled', 'true');

    const half1 = document.createElement('div');
    half1.className = 'domino-half';
    half1.appendChild(renderPips(tile.a));

    const divider = document.createElement('div');
    divider.className = 'domino-divider';

    const half2 = document.createElement('div');
    half2.className = 'domino-half';
    half2.appendChild(renderPips(tile.b));

    btn.appendChild(half1);
    btn.appendChild(divider);
    btn.appendChild(half2);

    if (!isDisabled && turn === 'player' && !isAnimating) {
      btn.addEventListener('click', () => {
        if (state.selectedTileIndex === i) {
          state.selectedTileIndex = null;
        } else {
          state.selectedTileIndex = i;
        }
        renderPlayerHand();
        renderChain();
      });
    }

    container.appendChild(btn);
  });
}

function renderComputerHand() {
  const container = document.querySelector('.computer-hand');
  if (!container) return;
  const count = state.computerHand.length;
  container.innerHTML = '';

  const label = document.createElement('div');
  label.className = 'computer-hand-label';
  label.textContent = `Computer: ${count} tiles`;
  container.appendChild(label);

  const tiles = document.createElement('div');
  tiles.className = 'computer-hand-tiles';
  for (let i = 0; i < count; i++) {
    const back = document.createElement('div');
    back.className = 'domino domino--back domino--horizontal';
    tiles.appendChild(back);
  }
  container.appendChild(tiles);
}

// ─── Status Bar ───────────────────────────────────────────────────────────────

function renderStatus() {
  const bar = document.querySelector('.status-bar');
  if (!bar) return;
  const { turn, isAnimating, boneyard } = state;

  let msg = '';
  if (turn === 'player' && !isAnimating) msg = 'Your turn';
  else if (turn === 'computer' || isAnimating) msg = 'Computer is thinking...';

  const turnEl = bar.querySelector('.status-turn');
  if (turnEl) {
    turnEl.textContent = msg;
    turnEl.className = 'status-turn';
    if (turn === 'player' && !isAnimating) turnEl.classList.add('status-turn--player');
    else turnEl.classList.add('status-turn--computer');
  }
}

// ─── Pass Toast ───────────────────────────────────────────────────────────────

let passToastTimeout = null;

function showPassMessage(passer, callback) {
  const msg = passer === 'player' ? 'You pass' : 'Computer passes';
  let toast = document.querySelector('.pass-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'pass-toast';
    document.querySelector('#app').appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('pass-toast--visible');

  clearTimeout(passToastTimeout);
  passToastTimeout = setTimeout(() => {
    toast.classList.remove('pass-toast--visible');
    if (callback) callback();
  }, 1500);
}

function pulseBoneyard() {
  document.querySelectorAll('.boneyard-scattered-tile').forEach(el => {
    el.classList.remove('pulse');
    void el.offsetWidth;
    el.classList.add('pulse');
  });
}

// ─── Screens ──────────────────────────────────────────────────────────────────

function renderHomeScreen() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'container';

  // Header
  const header = document.createElement('div');
  header.className = 'header header--home';

  const helpBtn = document.createElement('button');
  helpBtn.className = 'icon-btn';
  helpBtn.setAttribute('aria-label', 'Help');
  helpBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M64 160c0-53 43-96 96-96s96 43 96 96c0 42.7-27.9 78.9-66.5 91.4-28.4 9.2-61.5 35.3-61.5 76.6l0 24c0 17.7 14.3 32 32 32s32-14.3 32-32l0-24c0-1.7 .6-4.1 3.5-7.3 3-3.3 7.9-6.5 13.7-8.4 64.3-20.7 110.8-81 110.8-152.3 0-88.4-71.6-160-160-160S0 71.6 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm96 352c22.1 0 40-17.9 40-40s-17.9-40-40-40-40 17.9-40 40 17.9 40 40 40z"/></svg>`;
  helpBtn.addEventListener('click', openHelp);
  header.appendChild(helpBtn);

  const themeBtn = document.createElement('button');
  themeBtn.className = 'icon-btn';
  themeBtn.setAttribute('aria-label', 'Toggle theme');
  themeBtn.innerHTML = `<span class="icon-sun"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M288-32c8.4 0 16.3 4.4 20.6 11.7L364.1 72.3 468.9 46c8.2-2 16.9 .4 22.8 6.3S500 67 498 75.1l-26.3 104.7 92.7 55.5c7.2 4.3 11.7 12.2 11.7 20.6s-4.4 16.3-11.7 20.6L471.7 332.1 498 436.8c2 8.2-.4 16.9-6.3 22.8S477 468 468.9 466l-104.7-26.3-55.5 92.7c-4.3 7.2-12.2 11.7-20.6 11.7s-16.3-4.4-20.6-11.7L211.9 439.7 107.2 466c-8.2 2-16.8-.4-22.8-6.3S76 445 78 436.8l26.2-104.7-92.6-55.5C4.4 272.2 0 264.4 0 256s4.4-16.3 11.7-20.6L104.3 179.9 78 75.1c-2-8.2 .3-16.8 6.3-22.8S99 44 107.2 46l104.7 26.2 55.5-92.6 1.8-2.6c4.5-5.7 11.4-9.1 18.8-9.1zm0 144a144 144 0 1 0 0 288 144 144 0 1 0 0-288zm0 240a96 96 0 1 1 0-192 96 96 0 1 1 0 192z"/></svg></span><span class="icon-moon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 0C114.6 0 0 114.6 0 256S114.6 512 256 512c68.8 0 131.3-27.2 177.3-71.4 7.3-7 9.4-17.9 5.3-27.1s-13.7-14.9-23.8-14.1c-4.9 .4-9.8 .6-14.8 .6-101.6 0-184-82.4-184-184 0-72.1 41.5-134.6 102.1-164.8 9.1-4.5 14.3-14.3 13.1-24.4S322.6 8.5 312.7 6.3C294.4 2.2 275.4 0 256 0z"/></svg></span>`;
  themeBtn.addEventListener('click', toggleTheme);
  header.appendChild(themeBtn);

  const donateBtn = document.createElement('a');
  donateBtn.className = 'icon-btn';
  donateBtn.href = 'https://www.freecodecamp.org/donate';
  donateBtn.target = '_blank';
  donateBtn.rel = 'noopener noreferrer';
  donateBtn.setAttribute('aria-label', 'Donate');
  donateBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z"/></svg>`;
  header.appendChild(donateBtn);

  container.appendChild(header);

  // Title
  const title = document.createElement('h1');
  title.className = 'game-title';
  title.textContent = 'Dominoes';
  container.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'game-subtitle';
  subtitle.textContent = 'Draw Dominoes - Double 6';
  container.appendChild(subtitle);

  // Wins
  const winsSection = document.createElement('div');
  winsSection.className = 'wins-section';
  const winsLabel = document.createElement('div');
  winsLabel.className = 'wins-section__label';
  winsLabel.textContent = 'WINS';
  winsSection.appendChild(winsLabel);
  const winsRow = document.createElement('div');
  winsRow.className = 'wins-section__row';
  const winsCount = document.createElement('span');
  winsCount.className = 'wins-count';
  winsCount.textContent = state.wins;
  winsRow.appendChild(winsCount);
  winsSection.appendChild(winsRow);
  container.appendChild(winsSection);

  // Go First / Go Second
  const optionTabs = document.createElement('div');
  optionTabs.className = 'option-tabs';

  const goFirstTab = document.createElement('button');
  goFirstTab.className = 'option-tab' + (state.goFirst ? ' option-tab--active' : '');
  goFirstTab.textContent = 'Go First';
  goFirstTab.addEventListener('click', () => {
    state.goFirst = true;
    saveGoFirst(true);
    renderHomeScreen();
  });
  optionTabs.appendChild(goFirstTab);

  const goSecondTab = document.createElement('button');
  goSecondTab.className = 'option-tab' + (!state.goFirst ? ' option-tab--active' : '');
  goSecondTab.textContent = 'Go Second';
  goSecondTab.addEventListener('click', () => {
    state.goFirst = false;
    saveGoFirst(false);
    renderHomeScreen();
  });
  optionTabs.appendChild(goSecondTab);
  container.appendChild(optionTabs);

  // Buttons
  const btnGroup = document.createElement('div');
  btnGroup.className = 'btn-group';

  const newBtn = document.createElement('button');
  newBtn.className = 'btn btn--primary';
  newBtn.textContent = 'New Game';
  newBtn.addEventListener('click', newGame);
  btnGroup.appendChild(newBtn);

  const saved = loadGame();
  if (saved) {
    const resumeBtn = document.createElement('button');
    resumeBtn.className = 'btn btn--secondary';
    resumeBtn.textContent = 'Resume';
    resumeBtn.addEventListener('click', resumeGame);
    btnGroup.appendChild(resumeBtn);
  }

  container.appendChild(btnGroup);
  app.appendChild(container);
}

function renderPlayScreen() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'container container--play';

  // Header
  const header = document.createElement('div');
  header.className = 'header';

  const headerLeft = document.createElement('div');
  headerLeft.className = 'header__left';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/></svg>`;
  closeBtn.addEventListener('click', openConfirmQuit);
  headerLeft.appendChild(closeBtn);
  header.appendChild(headerLeft);

  const headerCenter = document.createElement('div');
  headerCenter.className = 'header__center';
  const statusBar = document.createElement('div');
  statusBar.className = 'status-bar';
  statusBar.setAttribute('role', 'status');
  statusBar.setAttribute('aria-live', 'polite');
  const turnEl = document.createElement('span');
  turnEl.className = 'status-turn';
  const boneEl = document.createElement('span');
  boneEl.className = 'status-boneyard';
  statusBar.appendChild(turnEl);
  statusBar.appendChild(boneEl);
  headerCenter.appendChild(statusBar);
  header.appendChild(headerCenter);

  const headerRight = document.createElement('div');
  headerRight.className = 'header__right';

  const helpBtn = document.createElement('button');
  helpBtn.className = 'icon-btn';
  helpBtn.setAttribute('aria-label', 'Help');
  helpBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M64 160c0-53 43-96 96-96s96 43 96 96c0 42.7-27.9 78.9-66.5 91.4-28.4 9.2-61.5 35.3-61.5 76.6l0 24c0 17.7 14.3 32 32 32s32-14.3 32-32l0-24c0-1.7 .6-4.1 3.5-7.3 3-3.3 7.9-6.5 13.7-8.4 64.3-20.7 110.8-81 110.8-152.3 0-88.4-71.6-160-160-160S0 71.6 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm96 352c22.1 0 40-17.9 40-40s-17.9-40-40-40-40 17.9-40 40 17.9 40 40 40z"/></svg>`;
  helpBtn.addEventListener('click', openHelp);
  headerRight.appendChild(helpBtn);

  const themeBtn = document.createElement('button');
  themeBtn.className = 'icon-btn';
  themeBtn.setAttribute('aria-label', 'Toggle theme');
  themeBtn.innerHTML = `<span class="icon-sun"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M288-32c8.4 0 16.3 4.4 20.6 11.7L364.1 72.3 468.9 46c8.2-2 16.9 .4 22.8 6.3S500 67 498 75.1l-26.3 104.7 92.7 55.5c7.2 4.3 11.7 12.2 11.7 20.6s-4.4 16.3-11.7 20.6L471.7 332.1 498 436.8c2 8.2-.4 16.9-6.3 22.8S477 468 468.9 466l-104.7-26.3-55.5 92.7c-4.3 7.2-12.2 11.7-20.6 11.7s-16.3-4.4-20.6-11.7L211.9 439.7 107.2 466c-8.2 2-16.8-.4-22.8-6.3S76 445 78 436.8l26.2-104.7-92.6-55.5C4.4 272.2 0 264.4 0 256s4.4-16.3 11.7-20.6L104.3 179.9 78 75.1c-2-8.2 .3-16.8 6.3-22.8S99 44 107.2 46l104.7 26.2 55.5-92.6 1.8-2.6c4.5-5.7 11.4-9.1 18.8-9.1zm0 144a144 144 0 1 0 0 288 144 144 0 1 0 0-288zm0 240a96 96 0 1 1 0-192 96 96 0 1 1 0 192z"/></svg></span><span class="icon-moon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 0C114.6 0 0 114.6 0 256S114.6 512 256 512c68.8 0 131.3-27.2 177.3-71.4 7.3-7 9.4-17.9 5.3-27.1s-13.7-14.9-23.8-14.1c-4.9 .4-9.8 .6-14.8 .6-101.6 0-184-82.4-184-184 0-72.1 41.5-134.6 102.1-164.8 9.1-4.5 14.3-14.3 13.1-24.4S322.6 8.5 312.7 6.3C294.4 2.2 275.4 0 256 0z"/></svg></span>`;
  themeBtn.addEventListener('click', toggleTheme);
  headerRight.appendChild(themeBtn);

  const donateBtn = document.createElement('a');
  donateBtn.className = 'icon-btn';
  donateBtn.href = 'https://www.freecodecamp.org/donate';
  donateBtn.target = '_blank';
  donateBtn.rel = 'noopener noreferrer';
  donateBtn.setAttribute('aria-label', 'Donate');
  donateBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z"/></svg>`;
  headerRight.appendChild(donateBtn);

  header.appendChild(headerRight);
  container.appendChild(header);

  // Computer hand
  const compHand = document.createElement('div');
  compHand.className = 'computer-hand';
  container.appendChild(compHand);

  // Board area
  const boardArea = document.createElement('div');
  boardArea.className = 'board-area';
  boardArea.addEventListener('wheel', e => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  }, { passive: false });

  // Drag to pan
  let drag = null;
  const onDragMove = e => {
    state.panX = drag.startPanX + (e.clientX - drag.startX);
    state.panY = drag.startPanY + (e.clientY - drag.startY);
    const content = boardArea.querySelector('.board-content');
    if (content) content.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
  };
  const onDragEnd = () => {
    drag = null;
    boardArea.classList.remove('board-area--dragging');
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
  };
  boardArea.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    e.preventDefault();
    drag = { startX: e.clientX, startY: e.clientY, startPanX: state.panX, startPanY: state.panY };
    boardArea.classList.add('board-area--dragging');
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
  });

  const boardContent = document.createElement('div');
  boardContent.className = 'board-content';
  boardArea.appendChild(boardContent);

  const chainWrapper = document.createElement('div');
  chainWrapper.className = 'chain-wrapper';
  boardContent.appendChild(chainWrapper);

  // Zoom controls
  const zoomControls = document.createElement('div');
  zoomControls.className = 'zoom-controls';

  const zoomIn_btn = document.createElement('button');
  zoomIn_btn.className = 'zoom-btn zoom-btn--in';
  zoomIn_btn.textContent = '+';
  zoomIn_btn.setAttribute('aria-label', 'Zoom in');
  zoomIn_btn.addEventListener('click', zoomIn);

  const zoomOut_btn = document.createElement('button');
  zoomOut_btn.className = 'zoom-btn zoom-btn--out';
  zoomOut_btn.textContent = '-';
  zoomOut_btn.setAttribute('aria-label', 'Zoom out');
  zoomOut_btn.addEventListener('click', zoomOut);

  zoomControls.appendChild(zoomIn_btn);
  zoomControls.appendChild(zoomOut_btn);
  boardArea.appendChild(zoomControls);
  container.appendChild(boardArea);

  // Pass button
  const actionRow = document.createElement('div');
  actionRow.className = 'action-row';

  const passBtn = document.createElement('button');
  passBtn.className = 'btn btn--secondary pass-btn';
  passBtn.textContent = 'Pass';
  passBtn.setAttribute('aria-label', 'Pass your turn');
  passBtn.addEventListener('click', () => {
    if (state.turn === 'player' && !state.isAnimating && state.boneyard.length === 0) {
      state.consecutivePasses++;
      if (state.consecutivePasses >= 2) {
        const res = resolveBlockedGame(state.playerHand, state.computerHand);
        state.result = { winner: res.winner, reason: 'blocked', playerPips: res.playerPips, computerPips: res.computerPips };
        if (res.winner === 'player') { state.wins++; saveWins(state.wins); }
        state.phase = 'gameover';
        clearSavedGame();
        render();
        return;
      }
      const passer = 'player';
      state.turn = 'computer';
      showPassMessage(passer, () => {
        saveGame(state);
        startTurn();
      });
    }
  });
  actionRow.appendChild(passBtn);
  container.appendChild(actionRow);

  // Player hand
  const playerHand = document.createElement('div');
  playerHand.className = 'player-hand';
  container.appendChild(playerHand);

  app.appendChild(container);

  renderComputerHand();
  renderChain();
  renderPlayerHand();
  renderStatus();
  updateActionButtons();
  scrollChainToCenter();
}

function renderBoneyard() {
  const boardContent = document.querySelector('.board-content');
  if (!boardContent) return;

  boardContent.querySelectorAll('.boneyard-row').forEach(el => el.remove());

  const { boneyard, boneyardPositions, turn, isAnimating, playerHand, leftEnd, rightEnd } = state;

  const moves = turn === 'player' && !isAnimating
    ? getValidMoves(playerHand, leftEnd, rightEnd)
    : [];
  const canDraw = moves.length === 0 && turn === 'player' && !isAnimating;

  const aboveRow = document.createElement('div');
  aboveRow.className = 'boneyard-row boneyard-row--above';
  const belowRow = document.createElement('div');
  belowRow.className = 'boneyard-row boneyard-row--below';

  const half = Math.ceil(boneyard.length / 2);
  boneyard.forEach((_, i) => {
    const pos = boneyardPositions[i] || { rot: '0', yOffset: 0 };
    const el = document.createElement(canDraw ? 'button' : 'div');
    el.className = 'boneyard-scattered-tile domino domino--back domino--horizontal' +
      (canDraw ? ' boneyard-scattered-tile--drawable' : '');
    el.style.setProperty('--tile-rot', `${pos.rot}deg`);
    el.style.setProperty('--tile-y', `${pos.yOffset}px`);
    if (canDraw) {
      el.setAttribute('aria-label', 'Draw from boneyard');
      el.addEventListener('click', () => drawFromBoneyard());
    }
    (i < half ? aboveRow : belowRow).appendChild(el);
  });

  const chainWrapper = boardContent.querySelector('.chain-wrapper');
  if (boneyard.length > 0) {
    boardContent.insertBefore(aboveRow, chainWrapper);
    chainWrapper.after(belowRow);
  }
}

function updateActionButtons() {
  const { turn, isAnimating, playerHand, boneyard, leftEnd, rightEnd } = state;
  const passBtn = document.querySelector('.pass-btn');

  const moves = turn === 'player' && !isAnimating
    ? getValidMoves(playerHand, leftEnd, rightEnd)
    : [];
  const noMoves = moves.length === 0 && turn === 'player' && !isAnimating;
  const showPass = noMoves && boneyard.length === 0;

  if (passBtn) passBtn.style.display = showPass ? 'inline-flex' : 'none';
  const actionRow = document.querySelector('.action-row');
  if (actionRow) actionRow.style.display = showPass ? 'flex' : 'none';

  renderBoneyard();
}

function renderGameOver() {
  // Remove existing overlay if any
  const existing = document.querySelector('.gameover-overlay');
  if (existing) existing.remove();

  const { result, wins } = state;
  if (!result) return;

  const overlay = document.createElement('div');
  overlay.className = 'gameover-overlay';

  const panel = document.createElement('div');
  panel.className = 'gameover-panel';

  const resultTitle = document.createElement('h2');
  resultTitle.className = 'gameover-title';
  if (result.winner === 'player') {
    resultTitle.textContent = 'You win!';
    resultTitle.classList.add('result--win');
  } else if (result.winner === 'computer') {
    resultTitle.textContent = 'Computer wins';
    resultTitle.classList.add('result--loss');
  } else {
    resultTitle.textContent = 'Draw';
    resultTitle.classList.add('result--draw');
  }
  panel.appendChild(resultTitle);

  const reason = document.createElement('p');
  reason.className = 'gameover-reason';
  if (result.reason === 'empty-hand') {
    reason.textContent = result.winner === 'player' ? 'You cleared your hand!' : 'Computer cleared its hand.';
  } else {
    reason.textContent = `Blocked - You: ${result.playerPips} pips, Computer: ${result.computerPips} pips`;
  }
  panel.appendChild(reason);

  const winsEl = document.createElement('p');
  winsEl.className = 'gameover-wins';
  winsEl.innerHTML = `Total wins: <span class="wins-count">${wins}</span>`;
  panel.appendChild(winsEl);

  const btnRow = document.createElement('div');
  btnRow.className = 'btn-group';

  const againBtn = document.createElement('button');
  againBtn.className = 'btn btn--primary';
  againBtn.textContent = 'Play Again';
  againBtn.addEventListener('click', newGame);
  btnRow.appendChild(againBtn);

  const menuBtn = document.createElement('button');
  menuBtn.className = 'btn btn--secondary';
  menuBtn.textContent = 'Return to Menu';
  menuBtn.addEventListener('click', () => {
    state.phase = 'home';
    render();
  });
  btnRow.appendChild(menuBtn);
  panel.appendChild(btnRow);

  overlay.appendChild(panel);
  const container = document.querySelector('.container--play') || document.getElementById('app');
  container.appendChild(overlay);

  // Trigger animation
  requestAnimationFrame(() => {
    overlay.classList.add('gameover-overlay--visible');
  });
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function makeIconBtn(icon, label, onClick) {
  const btn = document.createElement('button');
  btn.className = 'icon-btn';
  btn.setAttribute('aria-label', label);
  btn.textContent = icon;
  btn.addEventListener('click', onClick);
  return btn;
}

function openHelp() {
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Help');

  const closeBtn = makeIconBtn('X', 'Close', closeModal);
  closeBtn.className = 'icon-btn modal-close';
  modal.appendChild(closeBtn);

  const title = document.createElement('h2');
  title.className = 'modal-title';
  title.textContent = 'How to Play';
  modal.appendChild(title);

  const content = [
    { heading: 'Objective', body: 'Be the first to play all tiles from your hand, or have the lowest pip count when the game is blocked.' },
    { heading: 'Rules', body: '28 tiles (0|0 through 6|6). Each player gets 7, 14 go to the boneyard. Match one of your tile halves to an open end of the chain. Cannot play? Draw from the boneyard until you can, or pass if it is empty. First to empty their hand wins; if blocked, lowest pips remaining wins.' },
    { heading: 'Key Strategies', body: 'Play doubles early - they are the hardest to place. Control the open ends: keep ends that match tiles you still hold. Track which numbers have been heavily played. When behind, unload high-pip tiles aggressively.' },
    { heading: 'Tips', body: 'Click a tile in your hand to select it, then click the highlighted left or right end of the chain to place it. Use +/- or scroll to zoom the board. The boneyard count is in the status bar.' },
  ];

  content.forEach(({ heading, body }) => {
    const h = document.createElement('h3');
    h.className = 'modal-section-title';
    h.textContent = heading;
    modal.appendChild(h);
    const p = document.createElement('p');
    p.className = 'modal-section-body';
    p.textContent = body;
    modal.appendChild(p);
  });

  overlay.appendChild(modal);
  document.getElementById('app').appendChild(overlay);
  trapFocus(modal);
}

function openConfirmQuit() {
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Quit to menu?');

  const title = document.createElement('h2');
  title.className = 'modal-title';
  title.textContent = 'Quit to menu?';
  modal.appendChild(title);

  const p = document.createElement('p');
  p.className = 'modal-section-body';
  p.textContent = 'Your current game will be saved.';
  modal.appendChild(p);

  const btnRow = document.createElement('div');
  btnRow.className = 'btn-group';

  const confirm = document.createElement('button');
  confirm.className = 'btn btn--primary';
  confirm.textContent = 'Confirm';
  confirm.addEventListener('click', () => {
    saveGame(state);
    closeModal();
    state.phase = 'home';
    render();
  });
  btnRow.appendChild(confirm);

  const cancel = document.createElement('button');
  cancel.className = 'btn btn--secondary';
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', closeModal);
  btnRow.appendChild(cancel);

  modal.appendChild(btnRow);
  overlay.appendChild(modal);
  document.getElementById('app').appendChild(overlay);
  trapFocus(modal);
}

function closeModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) overlay.remove();
}

function trapFocus(el) {
  const focusable = el.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  first.focus();
  el.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

// ─── Theme ────────────────────────────────────────────────────────────────────

function toggleTheme() {
  const current = document.body.classList.contains('light-palette') ? 'light' : 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  saveTheme(next);
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-palette');
    document.body.classList.remove('dark-palette');
  } else {
    document.body.classList.add('dark-palette');
    document.body.classList.remove('light-palette');
  }
}

// ─── Main Render ──────────────────────────────────────────────────────────────

function render() {
  const { phase } = state;
  if (phase === 'home') {
    renderHomeScreen();
  } else if (phase === 'playing') {
    renderPlayScreen();
  } else if (phase === 'gameover') {
    renderPlayScreen();
    renderGameOver();
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

applyTheme(loadTheme());
render();
