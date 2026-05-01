// ─── Constants ───────────────────────────────────────────────────────────────

const VALID_SQUARES = new Set();
(function () {
  const rows = [
    [0, [2, 3, 4]],
    [1, [2, 3, 4]],
    [2, [0, 1, 2, 3, 4, 5, 6]],
    [3, [0, 1, 2, 3, 4, 5, 6]],
    [4, [0, 1, 2, 3, 4, 5, 6]],
    [5, [2, 3, 4]],
    [6, [2, 3, 4]],
  ];
  for (const [r, cols] of rows) {
    for (const c of cols) {
      VALID_SQUARES.add(r + ',' + c);
    }
  }
})();

const FOX_START_POS = [3, 3];

// ─── Board helpers ────────────────────────────────────────────────────────────

function isValid(r, c) {
  return VALID_SQUARES.has(r + ',' + c);
}

function initBoard() {
  const board = [];
  for (let r = 0; r < 7; r++) {
    board.push([]);
    for (let c = 0; c < 7; c++) {
      if (!isValid(r, c)) {
        board[r].push(null);
      } else if (r <= 2) {
        board[r].push('goose');
      } else if (r === 3 && c === 3) {
        board[r].push('fox');
      } else {
        board[r].push('empty');
      }
    }
  }
  return board;
}

function getAdjacentSteps(r, c) {
  const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  const result = [];
  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (isValid(nr, nc)) result.push([nr, nc]);
  }
  return result;
}

function getFoxJumps(board, r, c) {
  const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  const result = [];
  for (const [dr, dc] of dirs) {
    const mr = r + dr;
    const mc = c + dc;
    const lr = r + dr * 2;
    const lc = c + dc * 2;
    if (isValid(mr, mc) && board[mr][mc] === 'goose' &&
        isValid(lr, lc) && board[lr][lc] === 'empty') {
      result.push([lr, lc]);
    }
  }
  return result;
}

function getFoxMoves(board, r, c) {
  const steps = getAdjacentSteps(r, c)
    .filter(([nr, nc]) => board[nr][nc] === 'empty');
  const jumps = getFoxJumps(board, r, c);
  return [...steps, ...jumps];
}

function getGooseMoves(board, r, c) {
  const dirs = [[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  // dr >= 0: down or sideways; no diagonal up
  // orthogonal only: filter out diagonals for sideways — wait, plan says orthogonal only
  // "orthogonally adjacent valid empty squares where dr >= 0"
  const orthoDirs = [[0,-1],[0,1],[1,0]];
  const result = [];
  for (const [dr, dc] of orthoDirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (isValid(nr, nc) && board[nr][nc] === 'empty') {
      result.push([nr, nc]);
    }
  }
  return result;
}

function getValidMoves(board, r, c) {
  const piece = board[r][c];
  if (piece === 'fox') return getFoxMoves(board, r, c);
  if (piece === 'goose') return getGooseMoves(board, r, c);
  return [];
}

function isFoxJump(from, to) {
  return Math.abs(from[0] - to[0]) === 2 || Math.abs(from[1] - to[1]) === 2;
}

function getJumpedSquare(from, to) {
  return [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
}

function applyMove(board, foxPos, from, to) {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from[0]][from[1]];
  newBoard[from[0]][from[1]] = 'empty';
  newBoard[to[0]][to[1]] = piece;
  let newFoxPos = foxPos;
  if (piece === 'fox') {
    newFoxPos = [to[0], to[1]];
    if (isFoxJump(from, to)) {
      const [jr, jc] = getJumpedSquare(from, to);
      newBoard[jr][jc] = 'empty';
    }
  }
  return { board: newBoard, foxPos: newFoxPos };
}

function countGeese(board) {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === 'goose') count++;
    }
  }
  return count;
}

function getAllMoves(board, foxPos, side) {
  const moves = [];
  if (side === 'fox') {
    const [fr, fc] = foxPos;
    for (const to of getFoxMoves(board, fr, fc)) {
      moves.push({ from: [fr, fc], to });
    }
  } else {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (board[r][c] === 'goose') {
          for (const to of getGooseMoves(board, r, c)) {
            moves.push({ from: [r, c], to });
          }
        }
      }
    }
  }
  return moves;
}

function checkStatus(board, foxPos, currentTurn) {
  if (countGeese(board) <= 3) return 'fox-wins';
  if (currentTurn === 'fox' && getAllMoves(board, foxPos, 'fox').length === 0) return 'geese-win';
  if (currentTurn === 'geese' && getAllMoves(board, foxPos, 'geese').length === 0) return 'fox-wins';
  return 'playing';
}

// ─── AI ───────────────────────────────────────────────────────────────────────

function evaluateBoard(board, foxPos) {
  const geeseCount = countGeese(board);
  if (geeseCount <= 3) return 1000;
  const foxMoves = getAllMoves(board, foxPos, 'fox');
  if (foxMoves.length === 0) return -1000;

  const [fr, fc] = foxPos;
  const captured = 13 - geeseCount;

  let score = captured * 10 + foxMoves.length * 3;

  // Collect goose data in one pass
  let isolated = 0;
  let totalDist = 0;
  let minRow = 7, maxRow = 0;
  const columns = new Set();
  const geesePositions = [];

  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (board[r][c] === 'goose') {
        geesePositions.push([r, c]);
        totalDist += Math.abs(r - fr) + Math.abs(c - fc);
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        columns.add(c);
        const hasNeighbor = getAdjacentSteps(r, c).some(([nr, nc]) => board[nr][nc] === 'goose');
        if (!hasNeighbor) isolated++;
      }
    }
  }

  // Proximity to fox: geese close to fox are surrounding it
  score += totalDist * 0.5;

  // Isolated geese are easy captures
  score += isolated * 5;

  // Tight row spread = good coordinated formation
  score += (maxRow - minRow) * 3;

  // Back pieces lagging: reward when the most backward goose is advancing
  score -= minRow * 2;

  // Column coverage: spread across columns = no escape lanes
  score -= columns.size * 2;

  // Front line gaps: holes in the most advanced row let fox through
  const frontGeeseCols = geesePositions.filter(([r]) => r === maxRow).map(([, c]) => c);
  if (frontGeeseCols.length > 1) {
    const left = Math.min(...frontGeeseCols);
    const right = Math.max(...frontGeeseCols);
    let gaps = 0;
    for (let c = left + 1; c < right; c++) {
      if (isValid(maxRow, c) && board[maxRow][c] !== 'goose') gaps++;
    }
    score += gaps * 3;
  }

  // Immediate capture threats
  score += getFoxJumps(board, fr, fc).length * 15;

  // Fork setup: squares fox can reach where it would have 2+ jumps
  const dirs8 = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  let forkThreat = 0;
  for (const [dr, dc] of dirs8) {
    const nr = fr + dr, nc = fc + dc;
    if (isValid(nr, nc) && board[nr][nc] === 'empty') {
      const jumpsFromThere = getFoxJumps(board, nr, nc);
      if (jumpsFromThere.length >= 2) forkThreat += jumpsFromThere.length;
    }
  }
  score += forkThreat * 8;

  // Encirclement: the main objective — block all fox escapes
  let blocked = 0;
  for (const [dr, dc] of dirs8) {
    const nr = fr + dr, nc = fc + dc;
    if (!isValid(nr, nc) || board[nr][nc] === 'goose') blocked++;
  }
  score -= blocked * 12;

  return score;
}

function quiescence(board, foxPos, alpha, beta) {
  const standPat = evaluateBoard(board, foxPos);
  if (standPat >= beta) return beta;
  alpha = Math.max(alpha, standPat);

  const jumps = getFoxJumps(board, foxPos[0], foxPos[1]);
  for (const to of jumps) {
    const { board: nb, foxPos: nf } = applyMove(board, foxPos, foxPos, to);
    const score = quiescence(nb, nf, alpha, beta);
    if (score >= beta) return beta;
    alpha = Math.max(alpha, score);
  }
  return alpha;
}

function minimax(board, foxPos, depth, isMaximizing, alpha, beta) {
  const geeseCount = countGeese(board);
  if (geeseCount <= 3) return 1000;

  if (isMaximizing) {
    const foxMoves = getAllMoves(board, foxPos, 'fox')
      .sort((a, b) => (isFoxJump(b.from, b.to) ? 1 : 0) - (isFoxJump(a.from, a.to) ? 1 : 0));
    if (foxMoves.length === 0) return -1000;
    if (depth === 0) return quiescence(board, foxPos, alpha, beta);
    let best = -Infinity;
    for (const move of foxMoves) {
      const { board: nb, foxPos: nf } = applyMove(board, foxPos, move.from, move.to);
      const score = minimax(nb, nf, depth - 1, false, alpha, beta);
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    const geeseMoves = getGeeseCandidateMoves(board, foxPos);
    if (geeseMoves.length === 0) return 1000;
    if (depth === 0) return evaluateBoard(board, foxPos);
    let best = Infinity;
    for (const move of geeseMoves) {
      const { board: nb, foxPos: nf } = applyMove(board, foxPos, move.from, move.to);
      const score = minimax(nb, nf, depth - 1, true, alpha, beta);
      best = Math.min(best, score);
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function getGeeseCandidateMoves(board, foxPos) {
  const [fr, fc] = foxPos;
  const dirs8 = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

  // Identify immediately threatened geese
  const immediateThreat = new Set(
    getFoxJumps(board, fr, fc).map(dest => {
      const [jr, jc] = getJumpedSquare(foxPos, dest);
      return jr + ',' + jc;
    })
  );

  // Identify geese in fork setups (fox one step from double capture)
  const forkThreat = new Set();
  for (const [dr, dc] of dirs8) {
    const nr = fr + dr, nc = fc + dc;
    if (isValid(nr, nc) && board[nr][nc] === 'empty') {
      const potJumps = getFoxJumps(board, nr, nc);
      if (potJumps.length >= 2) {
        for (const dest of potJumps) {
          const [jr, jc] = getJumpedSquare([nr, nc], dest);
          forkThreat.add(jr + ',' + jc);
        }
      }
    }
  }

  // Only consider geese that have legal moves available
  const movingGeese = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (board[r][c] !== 'goose') continue;
      const gooseMoves = getGooseMoves(board, r, c);
      if (gooseMoves.length === 0) continue;
      const key = r + ',' + c;
      const priority = immediateThreat.has(key) ? 0 : forkThreat.has(key) ? 1 : 2;
      const dist = Math.abs(r - fr) + Math.abs(c - fc);
      movingGeese.push({ r, c, key, priority, dist, gooseMoves });
    }
  }

  // If 8 or fewer geese can move, use all of them — no pruning needed
  let selected = movingGeese;

  if (movingGeese.length > 8) {
    const sel = new Map();
    for (const g of movingGeese) {
      if (g.priority < 2) sel.set(g.key, g);
    }
    const unselected = () => movingGeese.filter(g => !sel.has(g.key));

    // 2 most backward moveable geese
    const byRow = unselected().sort((a, b) => a.r - b.r);
    for (let i = 0; i < Math.min(2, byRow.length); i++) sel.set(byRow[i].key, byRow[i]);

    // fill to 8 with geese closest to fox
    const byDist = unselected().sort((a, b) => a.dist - b.dist);
    for (const g of byDist) {
      if (sel.size >= 8) break;
      sel.set(g.key, g);
    }
    selected = [...sel.values()];
  }

  // Generate moves for selected geese
  const moves = [];
  for (const { r, c, gooseMoves } of selected) {
    for (const to of gooseMoves) {
      moves.push({ from: [r, c], to });
    }
  }

  // Order: threatened first, fork second, then closest to fox
  moves.sort((a, b) => {
    const aKey = a.from[0] + ',' + a.from[1];
    const bKey = b.from[0] + ',' + b.from[1];
    const aPri = immediateThreat.has(aKey) ? 0 : forkThreat.has(aKey) ? 1 : 2;
    const bPri = immediateThreat.has(bKey) ? 0 : forkThreat.has(bKey) ? 1 : 2;
    if (aPri !== bPri) return aPri - bPri;
    const aDist = Math.abs(a.to[0] - fr) + Math.abs(a.to[1] - fc);
    const bDist = Math.abs(b.to[0] - fr) + Math.abs(b.to[1] - fc);
    return aDist - bDist;
  });

  return moves;
}

function getBestMove(board, foxPos, side, difficulty) {
  const depth = difficulty === 'hard' ? 7 : 5;
  const isMaximizing = side === 'fox';
  const moves = side === 'fox'
    ? getAllMoves(board, foxPos, 'fox').sort((a, b) => (isFoxJump(b.from, b.to) ? 1 : 0) - (isFoxJump(a.from, a.to) ? 1 : 0))
    : getGeeseCandidateMoves(board, foxPos);

  const start = Date.now();
  let bestMove = moves[0];
  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const move of moves) {
    if (Date.now() - start > 1500) break;

    const { board: nb, foxPos: nf } = applyMove(board, foxPos, move.from, move.to);
    const score = minimax(nb, nf, depth - 1, !isMaximizing, -Infinity, Infinity);
    if (isMaximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

// ─── Persistence ──────────────────────────────────────────────────────────────

function saveState(state) {
  try {
    localStorage.setItem('fox-and-geese-state', JSON.stringify(state));
  } catch (_) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem('fox-and-geese-state');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function clearState() {
  localStorage.removeItem('fox-and-geese-state');
}

function saveRecords(records) {
  try {
    localStorage.setItem('fox-and-geese-records', JSON.stringify(records));
  } catch (_) {}
}

function loadRecords() {
  try {
    const raw = localStorage.getItem('fox-and-geese-records');
    if (!raw) return { foxNormal: 0, foxHard: 0, geeseNormal: 0, geeseHard: 0 };
    return JSON.parse(raw);
  } catch (_) {
    return { foxNormal: 0, foxHard: 0, geeseNormal: 0, geeseHard: 0 };
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem('fox-and-geese-prefs', JSON.stringify(prefs));
  } catch (_) {}
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem('fox-and-geese-prefs');
    if (!raw) return { mode: 'vs-computer', difficulty: 'normal', playerSide: 'geese', theme: 'dark' };
    return JSON.parse(raw);
  } catch (_) {
    return { mode: 'vs-computer', difficulty: 'normal', playerSide: 'geese', theme: 'dark' };
  }
}

// ─── State ────────────────────────────────────────────────────────────────────

let state = null;

function newGame(mode, playerSide, difficulty) {
  const board = initBoard();
  state = {
    board,
    foxPos: [...FOX_START_POS],
    currentTurn: 'geese',
    selected: null,
    validMoves: [],
    status: 'playing',
    capturedGeese: 0,
    mode,
    playerSide,
    difficulty,
    computerThinking: false,
  };
  clearState();
  render();
  if (shouldComputerMove()) scheduleComputerMove();
}

function shouldComputerMove() {
  if (!state || state.mode !== 'vs-computer') return false;
  if (state.status !== 'playing') return false;
  if (state.computerThinking) return false;
  return state.currentTurn !== state.playerSide;
}

function completeMove(from, to, isFoxCapture) {
  const { board: newBoard, foxPos: newFoxPos } = applyMove(state.board, state.foxPos, from, to);
  state.capturedGeese = 13 - countGeese(newBoard);
  state.board = newBoard;
  state.foxPos = newFoxPos;
  state.currentTurn = state.currentTurn === 'fox' ? 'geese' : 'fox';
  state.selected = null;
  state.validMoves = [];
  state.status = checkStatus(state.board, state.foxPos, state.currentTurn);

  if (state.status === 'playing') {
    saveState(state);
  } else {
    clearState();
    updateRecordsOnGameOver();
  }

  render();

  if (state.status === 'playing' && shouldComputerMove()) {
    scheduleComputerMove();
  }
}

function handleSquareClick(r, c) {
  if (!state) return;
  if (state.computerThinking || state.status !== 'playing') return;

  const piece = state.board[r][c];
  const currentPiece = state.currentTurn === 'fox' ? 'fox' : 'goose';

  // If in vs-computer and it's not player's turn, ignore
  if (state.mode === 'vs-computer' && state.currentTurn !== state.playerSide) return;

  if (state.selected === null) {
    if (piece === currentPiece) {
      const moves = getValidMoves(state.board, r, c);
      if (moves.length > 0) {
        state.selected = [r, c];
        state.validMoves = moves;
        render();
      }
    }
  } else {
    const [sr, sc] = state.selected;
    const isValidDest = state.validMoves.some(([mr, mc]) => mr === r && mc === c);

    if (isValidDest) {
      const from = state.selected;
      const to = [r, c];
      const isFoxCapture = state.board[from[0]][from[1]] === 'fox' && isFoxJump(from, to);

      if (isFoxCapture) {
        const [jr, jc] = getJumpedSquare(from, to);
        const boardGrid = document.querySelector('.board-grid');
        const capturedCell = boardGrid
          ? boardGrid.querySelector(`.board-cell:nth-child(${jr * 7 + jc + 1})`)
          : null;
        if (capturedCell) {
          const piece = capturedCell.querySelector('.piece--goose');
          if (piece) {
            piece.classList.add('piece--capturing');
          }
        }
        setTimeout(() => completeMove(from, to, isFoxCapture), 180);
      } else {
        completeMove(from, to, false);
      }
    } else if (piece === currentPiece && !(r === sr && c === sc)) {
      // Reselect
      const moves = getValidMoves(state.board, r, c);
      if (moves.length > 0) {
        state.selected = [r, c];
        state.validMoves = moves;
        render();
      }
    } else {
      state.selected = null;
      state.validMoves = [];
      render();
    }
  }
}

function scheduleComputerMove() {
  state.computerThinking = true;
  render();
  setTimeout(() => {
    if (!state || state.status !== 'playing') return;
    const side = state.currentTurn;
    const move = getBestMove(state.board, state.foxPos, side, state.difficulty);
    if (!move) {
      state.computerThinking = false;
      render();
      return;
    }
    const { board: newBoard, foxPos: newFoxPos } = applyMove(state.board, state.foxPos, move.from, move.to);
    state.capturedGeese = 13 - countGeese(newBoard);
    state.board = newBoard;
    state.foxPos = newFoxPos;
    state.currentTurn = state.currentTurn === 'fox' ? 'geese' : 'fox';
    state.selected = null;
    state.validMoves = [];
    state.computerThinking = false;
    state.status = checkStatus(state.board, state.foxPos, state.currentTurn);

    if (state.status === 'playing') {
      saveState(state);
    } else {
      clearState();
      updateRecordsOnGameOver();
    }

    render();
  }, 500);
}

function updateRecordsOnGameOver() {
  if (!state || state.mode !== 'vs-computer') return;
  const records = loadRecords();
  const diff = state.difficulty;
  const playerWon = (state.status === 'fox-wins' && state.playerSide === 'fox') ||
                    (state.status === 'geese-win' && state.playerSide === 'geese');
  if (playerWon) {
    if (state.playerSide === 'fox') {
      if (diff === 'normal') records.foxNormal++;
      else records.foxHard++;
    } else {
      if (diff === 'normal') records.geeseNormal++;
      else records.geeseHard++;
    }
    saveRecords(records);
  }
}

// ─── UI / Rendering ───────────────────────────────────────────────────────────

const ICON_HEART = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z"/></svg>`;
const ICON_MOON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 0C114.6 0 0 114.6 0 256S114.6 512 256 512c68.8 0 131.3-27.2 177.3-71.4 7.3-7 9.4-17.9 5.3-27.1s-13.7-14.9-23.8-14.1c-4.9 .4-9.8 .6-14.8 .6-101.6 0-184-82.4-184-184 0-72.1 41.5-134.6 102.1-164.8 9.1-4.5 14.3-14.3 13.1-24.4S322.6 8.5 312.7 6.3C294.4 2.2 275.4 0 256 0z"/></svg>`;
const ICON_SUN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M288-32c8.4 0 16.3 4.4 20.6 11.7L364.1 72.3 468.9 46c8.2-2 16.9 .4 22.8 6.3S500 67 498 75.1l-26.3 104.7 92.7 55.5c7.2 4.3 11.7 12.2 11.7 20.6s-4.4 16.3-11.7 20.6L471.7 332.1 498 436.8c2 8.2-.4 16.9-6.3 22.8S477 468 468.9 466l-104.7-26.3-55.5 92.7c-4.3 7.2-12.2 11.7-20.6 11.7s-16.3-4.4-20.6-11.7L211.9 439.7 107.2 466c-8.2 2-16.8-.4-22.8-6.3S76 445 78 436.8l26.2-104.7-92.6-55.5C4.4 272.2 0 264.4 0 256s4.4-16.3 11.7-20.6L104.3 179.9 78 75.1c-2-8.2 .3-16.8 6.3-22.8S99 44 107.2 46l104.7 26.2 55.5-92.6 1.8-2.6c4.5-5.7 11.4-9.1 18.8-9.1zm0 144a144 144 0 1 0 0 288 144 144 0 1 0 0-288zm0 240a96 96 0 1 1 0-192 96 96 0 1 1 0 192z"/></svg>`;
const ICON_QUESTION = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M64 160c0-53 43-96 96-96s96 43 96 96c0 42.7-27.9 78.9-66.5 91.4-28.4 9.2-61.5 35.3-61.5 76.6l0 24c0 17.7 14.3 32 32 32s32-14.3 32-32l0-24c0-1.7 .6-4.1 3.5-7.3 3-3.3 7.9-6.5 13.7-8.4 64.3-20.7 110.8-81 110.8-152.3 0-88.4-71.6-160-160-160S0 71.6 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm96 352c22.1 0 40-17.9 40-40s-17.9-40-40-40-40 17.9-40 40 17.9 40 40 40z"/></svg>`;
const ICON_X = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/></svg>`;

let currentTheme = 'dark';
let helpOpen = false;
let confirmOpen = false;
let confirmCallback = null;
let currentScreen = 'home'; // 'home' | 'play'
let helpTriggerEl = null;
let confirmTriggerEl = null;

function applyTheme(theme) {
  currentTheme = theme;
  document.body.classList.remove('dark-palette', 'light-palette');
  document.body.classList.add(theme === 'dark' ? 'dark-palette' : 'light-palette');
}

function toggleTheme() {
  const next = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  const prefs = loadPrefs();
  prefs.theme = next;
  savePrefs(prefs);
  render();
}

function openHelp() {
  helpTriggerEl = document.activeElement;
  helpOpen = true;
  render();
}

function closeHelp() {
  helpOpen = false;
  render();
  if (helpTriggerEl) { helpTriggerEl.focus(); helpTriggerEl = null; }
}

function openConfirm(message, onConfirm) {
  confirmTriggerEl = document.activeElement;
  confirmOpen = true;
  confirmCallback = onConfirm;
  render();
}

function closeConfirm() {
  confirmOpen = false;
  confirmCallback = null;
  render();
  if (confirmTriggerEl) { confirmTriggerEl.focus(); confirmTriggerEl = null; }
}

function iconBtn(icon, label, onclick, extraClass) {
  return `<button class="icon-btn${extraClass ? ' ' + extraClass : ''}" aria-label="${label}" onclick="${onclick}">${icon}</button>`;
}

function renderHeader(closeAction) {
  const themeIcon = currentTheme === 'dark' ? ICON_SUN : ICON_MOON;
  const themeLabel = currentTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  return `
    <div class="game-header">
      ${closeAction ? iconBtn(ICON_X, 'Close', closeAction) : '<span></span>'}
      <div class="header-actions">
        ${iconBtn(ICON_QUESTION, 'Help', 'openHelp()')}
        ${iconBtn(themeIcon, themeLabel, 'toggleTheme()')}
        <a href="https://www.freecodecamp.org/donate" target="_blank" rel="noopener" class="icon-btn" aria-label="Donate">${ICON_HEART}</a>
      </div>
    </div>`;
}

// Board rendering

function buildBoardLines() {
  // SVG lines between adjacent valid squares at 64px cell size
  const CELL = 64;
  const OFFSET = CELL / 2;
  const dirs = [[0,1],[1,0],[1,1],[1,-1]]; // right, down, diag-r, diag-l
  let lines = '';
  for (const key of VALID_SQUARES) {
    const [r, c] = key.split(',').map(Number);
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (isValid(nr, nc)) {
        const x1 = c * CELL + OFFSET;
        const y1 = r * CELL + OFFSET;
        const x2 = nc * CELL + OFFSET;
        const y2 = nr * CELL + OFFSET;
        lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--color-board-line)" stroke-width="2"/>`;
      }
    }
  }
  return lines;
}

const BOARD_LINES_SVG = buildBoardLines();

function renderBoard() {
  if (!state) return '';
  const { board, selected, validMoves, currentTurn, computerThinking, status } = state;
  const isPlayerTurn = status === 'playing' && !computerThinking &&
    (state.mode === 'vs-player' || currentTurn === state.playerSide);

  const CELL = 64;
  const SIZE = 7 * CELL;

  let cells = '';
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const cell = board[r][c];
      if (cell === null) {
        cells += `<div class="board-cell board-cell--invalid" aria-hidden="true"></div>`;
        continue;
      }

      const isSelected = selected && selected[0] === r && selected[1] === c;
      const isValidMove = validMoves.some(([mr, mc]) => mr === r && mc === c);
      const isFoxCell = cell === 'fox';
      const isGooseCell = cell === 'goose';

      let ariaLabel;
      if (isValidMove && cell === 'empty') ariaLabel = 'Move here';
      else if (isFoxCell) ariaLabel = `Row ${r}, Col ${c} - Fox`;
      else if (isGooseCell) ariaLabel = `Row ${r}, Col ${c} - Goose`;
      else ariaLabel = `Row ${r}, Col ${c} - empty`;

      let classes = 'board-cell';
      if (isSelected) classes += ' board-cell--selected';
      if (isValidMove && cell === 'empty') classes += ' board-cell--valid-move';
      if (isPlayerTurn && !isSelected) classes += ' board-cell--hoverable';
      if (computerThinking || status !== 'playing') classes += ' board-cell--disabled';

      const ariaPressedAttr = isSelected ? 'aria-pressed="true"' : '';
      const tabIndex = (isValidMove || (cell !== 'empty' && isPlayerTurn)) ? '0' : '-1';

      let pieceHtml = '';
      if (isFoxCell) {
        pieceHtml = `<div class="piece piece--fox${isSelected ? ' piece--selected' : ''}"></div>`;
      } else if (isGooseCell) {
        pieceHtml = `<div class="piece piece--goose${isSelected ? ' piece--selected' : ''}"></div>`;
      } else if (isValidMove) {
        const selectedPiece = selected ? board[selected[0]][selected[1]] : 'fox';
        pieceHtml = `<div class="valid-move-dot valid-move-dot--${selectedPiece}"></div>`;
      }

      cells += `<div class="${classes}" role="button" aria-label="${ariaLabel}" ${ariaPressedAttr} tabindex="${tabIndex}"
        onclick="handleSquareClick(${r},${c})"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();handleSquareClick(${r},${c})}"
        >${pieceHtml}</div>`;
    }
  }

  return `
    <div class="board-wrapper" role="grid" aria-label="Fox and Geese board">
      <svg class="board-lines" viewBox="0 0 ${SIZE} ${SIZE}" aria-hidden="true">
        ${BOARD_LINES_SVG}
      </svg>
      <div class="board-grid">${cells}</div>
    </div>`;
}

function renderTurnIndicator() {
  if (!state) return '';
  const { currentTurn, status, computerThinking } = state;
  if (status !== 'playing') return '';
  if (computerThinking) {
    return `<div class="turn-indicator" aria-live="polite">Computer is thinking<span class="thinking-dots"></span></div>`;
  }
  const label = currentTurn === 'fox' ? "Fox's Turn" : "Geese's Turn";
  return `<div class="turn-indicator" aria-live="polite">${label}</div>`;
}

function renderRecords() {
  const r = loadRecords();
  return `
    <div class="records">
      <div class="records-grid">
        <span class="records-title">Wins</span>
        <span class="records-col-header">Normal</span>
        <span class="records-col-header">Hard</span>
        <span class="records-label">Fox</span>
        <span class="records-value">${r.foxNormal}</span>
        <span class="records-value">${r.foxHard}</span>
        <span class="records-label">Geese</span>
        <span class="records-value">${r.geeseNormal}</span>
        <span class="records-value">${r.geeseHard}</span>
      </div>
    </div>`;
}

function renderHomeScreen() {
  const prefs = loadPrefs();
  const savedState = loadState();
  const isVsComputer = prefs.mode === 'vs-computer';

  return `
    <div class="game-container home-screen" id="home-screen">
      ${renderHeader(null)}
      <h1 class="game-title">Fox and Geese</h1>

      <div class="selector-group">
        <div class="selector-label">Mode</div>
        <div class="toggle-group">
          <button class="toggle-btn${prefs.mode === 'vs-computer' ? ' active' : ''}"
            onclick="setMode('vs-computer')">vs Computer</button>
          <button class="toggle-btn${prefs.mode === 'vs-player' ? ' active' : ''}"
            onclick="setMode('vs-player')">2 Player</button>
        </div>
      </div>

      ${isVsComputer ? `
      <div class="selector-group">
        <div class="selector-label">Difficulty</div>
        <div class="toggle-group">
          <button class="toggle-btn${prefs.difficulty === 'normal' ? ' active' : ''}"
            onclick="setDifficulty('normal')">Normal</button>
          <button class="toggle-btn${prefs.difficulty === 'hard' ? ' active' : ''}"
            onclick="setDifficulty('hard')">Hard</button>
        </div>
      </div>

      <div class="selector-group">
        <div class="selector-label">Play as</div>
        <div class="toggle-group">
          <button class="toggle-btn${prefs.playerSide === 'fox' ? ' active' : ''}"
            onclick="setPlayerSide('fox')">Fox</button>
          <button class="toggle-btn${prefs.playerSide === 'geese' ? ' active' : ''}"
            onclick="setPlayerSide('geese')">Geese</button>
        </div>
      </div>` : ''}

      ${isVsComputer ? renderRecords() : ''}

      <div class="home-actions">
        <button class="btn btn--primary" onclick="startNewGame()">New Game</button>
        ${savedState ? `<button class="btn btn--secondary" onclick="resumeGame()">Resume</button>` : ''}
      </div>
    </div>`;
}

function renderPlayScreen() {
  if (!state) return '';
  const { capturedGeese, status } = state;

  return `
    <div class="game-container play-screen" id="play-screen">
      ${renderHeader('onClosePlay()')}
      <hr class="header-divider" />
      ${renderTurnIndicator()}
      ${renderBoard()}
      <div class="capture-count" aria-live="polite">
        Captured: <span class="mono">${capturedGeese} / 13</span>
      </div>
      ${status !== 'playing' ? renderGameOver() : ''}
    </div>`;
}

function renderGameOver() {
  if (!state) return '';
  const { status } = state;
  const records = loadRecords();

  let resultText, resultClass;
  if (status === 'fox-wins') {
    resultText = 'Fox Wins!';
    resultClass = state.mode === 'vs-computer' && state.playerSide === 'fox' ? 'result--win' : 'result--lose';
  } else if (status === 'geese-win') {
    resultText = 'Geese Win!';
    resultClass = state.mode === 'vs-computer' && state.playerSide === 'geese' ? 'result--win' : 'result--lose';
  } else {
    resultText = 'No moves - Draw';
    resultClass = 'result--draw';
  }

  if (state.mode === 'vs-player') {
    resultClass = status === 'draw' ? 'result--draw' : 'result--win';
  }

  return `
    <div class="overlay" role="dialog" aria-modal="true" aria-label="Game over">
      <div class="overlay-panel">
        <div class="result-text ${resultClass}">${resultText}</div>
        <div class="overlay-actions">
          <button class="btn btn--primary" onclick="startNewGame()">Play Again</button>
          <button class="btn btn--secondary" onclick="goToMenu()">Menu</button>
        </div>
      </div>
    </div>`;
}

function renderHelpModal() {
  return `
    <div class="overlay" role="dialog" aria-modal="true" aria-label="Help" onclick="closeHelpOnOverlay(event)">
      <div class="modal-panel" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">How to Play</h2>
          <button class="icon-btn" aria-label="Close" onclick="closeHelp()">${ICON_X}</button>
        </div>
        <div class="modal-body">
          <h3>Objective</h3>
          <p>Geese: advance as a group and trap the fox so it has no legal move.</p>
          <p>Fox: break through the geese by capturing them until only 3 remain.</p>

          <h3>How to Move</h3>
          <ul>
            <li>Geese move first. They can only step down or sideways — never up or diagonally.</li>
            <li>Fox moves one step in any direction, or jumps over one goose to capture it.</li>
            <li>No multi-jump: fox may capture only once per turn.</li>
            <li>Fox wins when 10 or more geese are captured (3 or fewer remain), or when the geese have no legal move.</li>
            <li>Geese win when the fox has no legal move.</li>
          </ul>

          <h3>Key Strategies</h3>
          <ul>
            <li>Geese: advance in a solid line and never leave gaps.</li>
            <li>Geese: use the narrow arms of the board to pin the fox.</li>
            <li>Fox: look for an isolated goose with an empty square behind it.</li>
            <li>Fox: break the geese's front line early.</li>
          </ul>

          <h3>Tips</h3>
          <ul>
            <li>Geese: keep your front line flat and advance one row at a time.</li>
            <li>Fox: move toward a wing on your first move, not straight up the middle.</li>
            <li>Geese need coordination — moving one piece far ahead usually backfires.</li>
          </ul>
        </div>
      </div>
    </div>`;
}

function renderConfirmModal() {
  return `
    <div class="overlay" role="dialog" aria-modal="true" aria-label="Confirm">
      <div class="modal-panel">
        <div class="modal-header">
          <h2 class="modal-title">Quit to Menu?</h2>
        </div>
        <div class="modal-body">
          <p>Your current game will be saved and you can resume it later.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn--secondary" onclick="closeConfirm()">Cancel</button>
          <button class="btn btn--danger" onclick="confirmQuit()">Quit</button>
        </div>
      </div>
    </div>`;
}

// ─── Focus management ─────────────────────────────────────────────────────────

function trapFocus(el) {
  if (!el) return;
  const focusable = el.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  focusable[0].focus();

  function onKeyDown(e) {
    if (e.key !== 'Tab') return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  el.addEventListener('keydown', onKeyDown);
  el._removeTrap = () => el.removeEventListener('keydown', onKeyDown);
}

function removeFocusTrap(el) {
  if (el && el._removeTrap) { el._removeTrap(); delete el._removeTrap; }
}

// ─── Global keyboard handler ──────────────────────────────────────────────────

document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  if (helpOpen) { closeHelp(); return; }
  if (confirmOpen) { closeConfirm(); return; }
  if (state && state.selected !== null) {
    state.selected = null;
    state.validMoves = [];
    render();
  }
});

function render() {
  const app = document.getElementById('app');
  let html = '';

  if (currentScreen === 'home') {
    html += renderHomeScreen();
  } else {
    html += renderPlayScreen();
  }

  if (helpOpen) html += renderHelpModal();
  if (confirmOpen) html += renderConfirmModal();

  app.innerHTML = html;

  if (helpOpen) trapFocus(document.querySelector('.overlay[aria-label="Help"]'));
  else if (confirmOpen) trapFocus(document.querySelector('.overlay[aria-label="Confirm"]'));
}

// ─── Actions ──────────────────────────────────────────────────────────────────

function setMode(mode) {
  const prefs = loadPrefs();
  prefs.mode = mode;
  savePrefs(prefs);
  render();
}

function setDifficulty(diff) {
  const prefs = loadPrefs();
  prefs.difficulty = diff;
  savePrefs(prefs);
  render();
}

function setPlayerSide(side) {
  const prefs = loadPrefs();
  prefs.playerSide = side;
  savePrefs(prefs);
  render();
}

function startNewGame() {
  const prefs = loadPrefs();
  clearState();
  currentScreen = 'play';
  newGame(prefs.mode, prefs.playerSide, prefs.difficulty);
}

function resumeGame() {
  const saved = loadState();
  if (!saved) return;
  state = saved;
  currentScreen = 'play';
  render();
  if (state.status === 'playing' && shouldComputerMove()) scheduleComputerMove();
}

function goToMenu() {
  currentScreen = 'home';
  state = null;
  render();
}

function onClosePlay() {
  if (state && state.status === 'playing') {
    saveState(state);
    openConfirm('Quit to Menu?', () => {
      goToMenu();
    });
  } else {
    goToMenu();
  }
}

function confirmQuit() {
  closeConfirm();
  goToMenu();
}

function closeHelpOnOverlay(event) {
  if (event.target === event.currentTarget) closeHelp();
}

// ─── Init ─────────────────────────────────────────────────────────────────────

(function init() {
  const prefs = loadPrefs();
  applyTheme(prefs.theme || 'dark');
  render();
})();
