const ROUND_MODES = {
  single: { label: '1 Round', shortLabel: '1', totalRounds: 1 },
  five: { label: '5 Rounds', shortLabel: '5', totalRounds: 5 },
  endless: { label: 'Endless', shortLabel: '∞', totalRounds: Infinity },
};

const ROUND_MODE_STORAGE_KEY = 'stb-round-mode';
const SAVE_KEY = 'stb-saved-game';
const BEST_SCORE_KEY_PREFIX = 'stb-best-score-';

// --- Game Logic ---

function createFreshBoardState() {
  return {
    tiles: [true, true, true, true, true, true, true, true, true],
    dice: [],
    diceTotal: 0,
    selectedTiles: [],
    canRollOneDie: false,
    diceCount: 2,
  };
}

function initGame(roundMode = getSelectedRoundMode()) {
  return {
    ...createFreshBoardState(),
    roundMode,
    currentRound: 1,
    totalScore: 0,
    lastRoundScore: 0,
    finalScore: null,
    result: null,
    phase: 'rolling',
  };
}

function normalizeLoadedState(savedState) {
  if (!savedState || !Array.isArray(savedState.tiles) || savedState.phase === 'game-over') {
    return null;
  }

  const roundMode = ROUND_MODES[savedState.roundMode] ? savedState.roundMode : 'single';
  const normalizedState = {
    ...createFreshBoardState(),
    ...savedState,
    roundMode,
    currentRound: Number.isInteger(savedState.currentRound) && savedState.currentRound > 0 ? savedState.currentRound : 1,
    totalScore: Number.isFinite(savedState.totalScore) ? savedState.totalScore : 0,
    lastRoundScore: Number.isFinite(savedState.lastRoundScore) ? savedState.lastRoundScore : 0,
    finalScore: Number.isFinite(savedState.finalScore) ? savedState.finalScore : null,
    result: savedState.result === 'won' || savedState.result === 'lost' ? savedState.result : null,
  };

  if (!['rolling', 'selecting', 'between-rounds'].includes(normalizedState.phase)) {
    normalizedState.phase = 'rolling';
  }

  normalizedState.canRollOneDie = !normalizedState.tiles[6] && !normalizedState.tiles[7] && !normalizedState.tiles[8];
  if (!normalizedState.canRollOneDie) {
    normalizedState.diceCount = 2;
  } else if (normalizedState.diceCount !== 1) {
    normalizedState.diceCount = 2;
  }

  return normalizedState;
}

function getValidCombinations(openTileIndices, target) {
  const results = [];

  function search(start, remaining, current) {
    if (remaining === 0) {
      results.push([...current]);
      return;
    }

    for (let i = start; i < openTileIndices.length; i++) {
      const val = openTileIndices[i] + 1;
      if (val > remaining) break;
      current.push(openTileIndices[i]);
      search(i + 1, remaining - val, current);
      current.pop();
    }
  }

  search(0, target, []);
  return results;
}

function checkNoMoves(state) {
  const openIndices = state.tiles
    .map((open, i) => (open ? i : -1))
    .filter(i => i !== -1);
  const combos = getValidCombinations(openIndices, state.diceTotal);
  return combos.length === 0;
}

function rollDice(state) {
  const dice = [];
  for (let i = 0; i < state.diceCount; i++) {
    dice.push(Math.floor(Math.random() * 6) + 1);
  }

  state.dice = dice;
  state.diceTotal = dice.reduce((sum, value) => sum + value, 0);

  if (checkNoMoves(state)) {
    finishRound(state);
  } else {
    state.phase = 'selecting';
  }
}

function toggleTileSelection(state, tileIndex) {
  if (!state.tiles[tileIndex]) return;

  const selectedIndex = state.selectedTiles.indexOf(tileIndex);
  if (selectedIndex !== -1) {
    state.selectedTiles.splice(selectedIndex, 1);
    return;
  }

  const currentSum = state.selectedTiles.reduce((sum, i) => sum + (i + 1), 0);
  const tileValue = tileIndex + 1;
  if (currentSum + tileValue > state.diceTotal) {
    return 'shake';
  }

  state.selectedTiles.push(tileIndex);
}

function confirmSelection(state) {
  const selectedSum = state.selectedTiles.reduce((sum, i) => sum + (i + 1), 0);
  if (selectedSum !== state.diceTotal) return;

  for (const tileIndex of state.selectedTiles) {
    state.tiles[tileIndex] = false;
  }

  state.selectedTiles = [];
  updateCanRollOneDie(state);

  if (state.tiles.every(tile => !tile)) {
    finishMatch(state, state.totalScore, 'won', 0);
    return;
  }

  state.phase = 'rolling';
}

function updateCanRollOneDie(state) {
  state.canRollOneDie = !state.tiles[6] && !state.tiles[7] && !state.tiles[8];
  if (!state.canRollOneDie) {
    state.diceCount = 2;
  }
}

function setDiceCount(state, count) {
  if (state.canRollOneDie && state.phase === 'rolling' && (count === 1 || count === 2)) {
    state.diceCount = count;
  }
}

function calcScore(tiles) {
  return tiles.reduce((sum, open, i) => sum + (open ? i + 1 : 0), 0);
}

function getRoundLimit(roundMode) {
  return ROUND_MODES[roundMode].totalRounds;
}

function hasMoreRounds(state) {
  return state.roundMode === 'endless' || state.currentRound < getRoundLimit(state.roundMode);
}

function finishRound(state) {
  const roundScore = calcScore(state.tiles);
  state.lastRoundScore = roundScore;

  if (state.roundMode !== 'single' && hasMoreRounds(state)) {
    state.totalScore += roundScore;
    state.phase = 'between-rounds';
    state.selectedTiles = [];
    return;
  }

  finishMatch(state, state.totalScore + roundScore, 'lost', roundScore);
}

function finishMatch(state, finalScore, result, lastRoundScore = 0) {
  state.lastRoundScore = lastRoundScore;
  state.finalScore = finalScore;
  state.result = result;
  state.phase = 'game-over';

  saveBestScore(state.roundMode, finalScore);

  clearSavedGame();
}

function startNextRound(state) {
  state.currentRound += 1;
  Object.assign(state, createFreshBoardState());
  state.phase = 'rolling';
  state.lastRoundScore = 0;
}

function saveGame(state) {
  if (!state || state.phase === 'game-over') {
    clearSavedGame();
    return;
  }

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (error) {}
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const normalizedState = normalizeLoadedState(JSON.parse(raw));
    if (!normalizedState) {
      clearSavedGame();
      return null;
    }
    return normalizedState;
  } catch (error) {
    return null;
  }
}

function clearSavedGame() {
  localStorage.removeItem(SAVE_KEY);
}

function getBestScoreKey(roundMode) {
  return `${BEST_SCORE_KEY_PREFIX}${roundMode}`;
}

function saveBestScore(roundMode, score) {
  const existing = localStorage.getItem(getBestScoreKey(roundMode));
  if (existing === null || score < parseInt(existing, 10)) {
    localStorage.setItem(getBestScoreKey(roundMode), String(score));
  }
}

// --- UI State ---

let state = null;
let shakingTile = null;
let selectedRoundMode = 'single';

// --- Rendering ---

function getBestScore(roundMode) {
  const raw = localStorage.getItem(getBestScoreKey(roundMode));
  return raw !== null ? parseInt(raw, 10) : null;
}

function getSelectedRoundMode() {
  return selectedRoundMode;
}

function setSelectedRoundMode(roundMode) {
  if (!ROUND_MODES[roundMode]) return;
  selectedRoundMode = roundMode;
  localStorage.setItem(ROUND_MODE_STORAGE_KEY, roundMode);
  renderRoundModeButtons();
}

function loadSelectedRoundMode() {
  const savedMode = localStorage.getItem(ROUND_MODE_STORAGE_KEY);
  selectedRoundMode = ROUND_MODES[savedMode] ? savedMode : 'single';
}

function hasSavedGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  return typeof raw === 'string' && raw.length > 0;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function getRoundProgressText(activeState) {
  if (activeState.roundMode === 'endless') {
    return `${activeState.currentRound}`;
  }
  return `${activeState.currentRound}/${getRoundLimit(activeState.roundMode)}`;
}

function renderRoundModeButtons() {
  const mappings = [
    ['btn-round-single', 'single'],
    ['btn-round-five', 'five'],
    ['btn-round-endless', 'endless'],
  ];

  mappings.forEach(([id, roundMode]) => {
    const button = document.getElementById(id);
    const isActive = selectedRoundMode === roundMode;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function renderHome() {
  document.getElementById('home-best-single').textContent = formatBestScore(getBestScore('single'));
  document.getElementById('home-best-five').textContent = formatBestScore(getBestScore('five'));
  document.getElementById('home-best-endless').textContent = formatBestScore(getBestScore('endless'));
  renderRoundModeButtons();

  const resumeBtn = document.getElementById('btn-resume');
  resumeBtn.classList.toggle('visible', hasSavedGame());
  resumeBtn.hidden = !hasSavedGame();

  showScreen('screen-home');
}

function formatBestScore(score) {
  return score !== null ? score : '--';
}

function renderPlay() {
  renderMatchStats();
  renderTiles();
  renderDice();
  renderStatus();
  renderScore();
  renderButtons();
  renderDiceCountToggle();
  renderOverlay();
  showScreen('screen-play');
}

function renderMatchStats() {
  const roundMeta = document.getElementById('play-round-meta');
  const liveScoreLabel = document.getElementById('live-score-label');
  const totalScoreLabel = document.getElementById('total-score-label');
  const totalScore = document.getElementById('total-score');

  if (state.roundMode === 'single') {
    roundMeta.hidden = true;
    totalScoreLabel.hidden = true;
    totalScore.hidden = true;
    liveScoreLabel.textContent = 'Score';
    return;
  }

  roundMeta.hidden = false;
  totalScoreLabel.hidden = false;
  totalScore.hidden = false;
  document.getElementById('round-progress').textContent = getRoundProgressText(state);
  totalScore.textContent = state.totalScore;
  liveScoreLabel.textContent = 'Round Score';
}

function renderTiles() {
  const container = document.getElementById('tile-row');
  container.innerHTML = '';

  for (let i = 0; i < 9; i++) {
    const tile = document.createElement('button');
    const isOpen = state.tiles[i];
    const isSelected = state.selectedTiles.indexOf(i) !== -1;

    tile.className = 'tile';
    tile.dataset.index = i;
    tile.textContent = i + 1;
    tile.setAttribute('aria-label', `Tile ${i + 1}, ${isOpen ? 'open' : 'shut'}`);
    tile.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

    if (!isOpen) tile.classList.add('shut');
    if (isSelected) tile.classList.add('selected');
    if (shakingTile === i) tile.classList.add('shake');
    if (state.phase !== 'selecting' || !isOpen) tile.disabled = true;

    tile.addEventListener('click', () => onTileClick(i));
    container.appendChild(tile);
  }
}

function renderDice() {
  const container = document.getElementById('dice-area');
  container.innerHTML = '';

  if (state.dice.length === 0) {
    const placeholder = document.createElement('div');
    placeholder.className = 'dice-placeholder';
    placeholder.textContent = state.phase === 'between-rounds' ? 'Continue to start the next round' : 'Roll the dice';
    container.appendChild(placeholder);
    return;
  }

  for (const value of state.dice) {
    const die = document.createElement('div');
    die.className = 'die';
    die.setAttribute('aria-label', `Die showing ${value}`);
    die.innerHTML = getDiePips(value);
    container.appendChild(die);
  }
}

function getDiePips(value) {
  const layouts = {
    1: [false, false, false, false, true, false, false, false, false],
    2: [true, false, false, false, false, false, false, false, true],
    3: [true, false, false, false, true, false, false, false, true],
    4: [true, false, true, false, false, false, true, false, true],
    5: [true, false, true, false, true, false, true, false, true],
    6: [true, false, true, true, false, true, true, false, true],
  };
  const pips = layouts[value] || layouts[1];
  return pips.map(active => `<span class="pip${active ? ' pip-on' : ''}"></span>`).join('');
}

function renderStatus() {
  const statusLine = document.getElementById('status-line');

  if (state.phase === 'rolling') {
    statusLine.textContent = 'Roll the dice to begin your turn.';
    return;
  }

  if (state.phase === 'selecting') {
    const selectedSum = state.selectedTiles.reduce((sum, i) => sum + (i + 1), 0);
    statusLine.textContent = `Dice total: ${state.diceTotal}   Selected: ${selectedSum}`;
    return;
  }

  if (state.phase === 'between-rounds') {
    statusLine.textContent = `Round ${state.currentRound} complete. Running total: ${state.totalScore}`;
    return;
  }

  const finalScore = state.finalScore !== null ? state.finalScore : state.totalScore;
  statusLine.textContent = state.result === 'won'
    ? `Match complete. Final total: ${finalScore}`
    : `Run over. Final total: ${finalScore}`;
}

function renderScore() {
  document.getElementById('live-score').textContent = calcScore(state.tiles);
}

function renderButtons() {
  const rollBtn = document.getElementById('btn-roll');
  const confirmBtn = document.getElementById('btn-confirm');
  const selectedSum = state.selectedTiles.reduce((sum, i) => sum + (i + 1), 0);

  rollBtn.disabled = state.phase !== 'rolling';
  confirmBtn.disabled = state.phase !== 'selecting' || selectedSum !== state.diceTotal;
}

function renderDiceCountToggle() {
  const toggleEl = document.getElementById('dice-count-toggle');
  if (state.canRollOneDie && state.phase === 'rolling') {
    toggleEl.classList.add('visible');
    document.getElementById('btn-one-die').setAttribute('aria-pressed', state.diceCount === 1 ? 'true' : 'false');
    document.getElementById('btn-two-dice').setAttribute('aria-pressed', state.diceCount === 2 ? 'true' : 'false');
    document.getElementById('btn-one-die').classList.toggle('active', state.diceCount === 1);
    document.getElementById('btn-two-dice').classList.toggle('active', state.diceCount === 2);
    return;
  }

  toggleEl.classList.remove('visible');
}

function renderOverlay() {
  const overlay = document.getElementById('gameover-overlay');
  if (state.phase !== 'between-rounds' && state.phase !== 'game-over') {
    overlay.classList.remove('visible');
    return;
  }

  const heading = document.getElementById('gameover-heading');
  const banner = document.getElementById('gameover-banner');
  const message = document.getElementById('gameover-message');
  const scoreLabel = document.getElementById('gameover-score-label');
  const scoreValue = document.getElementById('gameover-score');
  const metaRow = document.getElementById('gameover-meta-row');
  const metaLabel = document.getElementById('gameover-meta-label');
  const metaValue = document.getElementById('gameover-meta-value');
  const primaryButton = document.getElementById('btn-play-again');

  if (state.phase === 'between-rounds') {
    const nextRound = state.currentRound + 1;
    heading.textContent = `Round ${state.currentRound} Complete`;
    banner.textContent = '';
    banner.style.display = 'none';
    message.textContent = `You scored ${state.lastRoundScore} this round.`;
    message.hidden = false;
    scoreLabel.textContent = 'Running Total';
    scoreValue.textContent = state.totalScore;
    metaRow.hidden = false;
    metaLabel.textContent = 'Up Next';
    metaValue.textContent = state.roundMode === 'endless' ? `Round ${nextRound}` : `Round ${nextRound} of ${getRoundLimit(state.roundMode)}`;
    primaryButton.textContent = 'Continue';
  } else {
    const finalScore = state.finalScore !== null ? state.finalScore : state.totalScore;
    const isWin = state.result === 'won';

    heading.textContent = isWin ? 'Match Complete' : 'Game Over';
    banner.textContent = isWin ? 'Shut the Box!' : '';
    banner.style.display = isWin ? '' : 'none';
    message.hidden = true;
    metaRow.hidden = true;
    scoreLabel.textContent = 'Final Score';
    scoreValue.textContent = finalScore;
    primaryButton.textContent = 'Play Again';
  }

  overlay.classList.add('visible');

  if (state.phase === 'game-over' && state.result === 'won') {
    const container = document.querySelector('.play-container');
    if (container) {
      container.classList.add('celebrate');
      setTimeout(() => container.classList.remove('celebrate'), 500);
    }
  }

  overlay.querySelector('[data-first-focus]').focus();
}

// --- Event Handlers ---

function onTileClick(tileIndex) {
  if (state.phase !== 'selecting') return;

  const result = toggleTileSelection(state, tileIndex);
  if (result === 'shake') {
    shakingTile = tileIndex;
    renderTiles();
    setTimeout(() => {
      shakingTile = null;
      renderTiles();
    }, 200);
    return;
  }

  saveGame(state);
  renderTiles();
  renderStatus();
  renderButtons();
}

function onRoll() {
  rollDice(state);
  saveGame(state);
  renderPlay();

  document.querySelectorAll('.die').forEach(die => {
    die.classList.add('rolling');
    setTimeout(() => die.classList.remove('rolling'), 350);
  });
}

function onConfirm() {
  const justShut = [...state.selectedTiles];
  confirmSelection(state);
  saveGame(state);
  renderPlay();

  justShut.forEach(tileIndex => {
    const tile = document.querySelector(`.tile[data-index="${tileIndex}"]`);
    if (tile) tile.classList.add('shutting');
  });
}

function onNewGame() {
  clearSavedGame();
  startNewGame();
}

function startNewGame(roundMode = getSelectedRoundMode()) {
  state = initGame(roundMode);
  setSelectedRoundMode(roundMode);
  saveGame(state);
  renderPlay();
}

function onResume() {
  const saved = loadGame();
  if (saved) {
    state = saved;
    setSelectedRoundMode(saved.roundMode);
    renderPlay();
    return;
  }

  startNewGame();
}

function onClosePlay() {
  showConfirmModal('Return to menu? Your game will be saved.', () => {
    state = null;
    renderHome();
  });
}

function onOverlayPrimary() {
  document.getElementById('gameover-overlay').classList.remove('visible');

  if (state.phase === 'between-rounds') {
    startNextRound(state);
    saveGame(state);
    renderPlay();
    return;
  }

  clearSavedGame();
  startNewGame(state ? state.roundMode : getSelectedRoundMode());
}

function onMenuFromOverlay() {
  document.getElementById('gameover-overlay').classList.remove('visible');

  if (state.phase === 'game-over') {
    clearSavedGame();
  }

  state = null;
  renderHome();
}

// --- Help Modal ---

function showHelpModal() {
  const modal = document.getElementById('help-modal');
  modal.classList.add('visible');
  modal.querySelector('[data-first-focus]').focus();
}

function closeHelpModal() {
  document.getElementById('help-modal').classList.remove('visible');
}

// --- Confirm Modal ---

let confirmCallback = null;

function showConfirmModal(message, onConfirm) {
  confirmCallback = onConfirm;
  document.getElementById('confirm-message').textContent = message;
  const modal = document.getElementById('confirm-modal');
  modal.classList.add('visible');
  modal.querySelector('[data-first-focus]').focus();
}

function closeConfirmModal() {
  document.getElementById('confirm-modal').classList.remove('visible');
  confirmCallback = null;
}

function onConfirmModalQuit() {
  const callback = confirmCallback;
  closeConfirmModal();
  if (callback) callback();
}

// --- Theme ---

function initTheme() {
  const saved = localStorage.getItem('stb-theme');
  document.body.classList.toggle('light-palette', saved === 'light');
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-palette');
  localStorage.setItem('stb-theme', isLight ? 'light' : 'dark');
}

// --- Focus Trap ---

function trapFocus(modal) {
  const focusable = modal.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  modal.addEventListener('keydown', function handleKeydown(event) {
    if (event.key === 'Escape') {
      if (modal.id === 'help-modal') {
        closeHelpModal();
      } else if (modal.id === 'confirm-modal') {
        closeConfirmModal();
      }
      return;
    }

    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

// --- Init ---

document.addEventListener('DOMContentLoaded', () => {
  loadSelectedRoundMode();
  initTheme();

  // Home screen
  document.getElementById('btn-new-game-home').addEventListener('click', onNewGame);
  document.getElementById('btn-resume').addEventListener('click', onResume);
  document.getElementById('btn-help-home').addEventListener('click', showHelpModal);
  document.getElementById('btn-theme-home').addEventListener('click', toggleTheme);
  document.getElementById('btn-round-single').addEventListener('click', () => setSelectedRoundMode('single'));
  document.getElementById('btn-round-five').addEventListener('click', () => setSelectedRoundMode('five'));
  document.getElementById('btn-round-endless').addEventListener('click', () => setSelectedRoundMode('endless'));

  // Play screen
  document.getElementById('btn-roll').addEventListener('click', onRoll);
  document.getElementById('btn-confirm').addEventListener('click', onConfirm);
  document.getElementById('btn-close-play').addEventListener('click', onClosePlay);
  document.getElementById('btn-help-play').addEventListener('click', showHelpModal);
  document.getElementById('btn-theme-play').addEventListener('click', toggleTheme);
  document.getElementById('btn-one-die').addEventListener('click', () => {
    setDiceCount(state, 1);
    saveGame(state);
    renderDiceCountToggle();
  });
  document.getElementById('btn-two-dice').addEventListener('click', () => {
    setDiceCount(state, 2);
    saveGame(state);
    renderDiceCountToggle();
  });

  // Overlay
  document.getElementById('btn-play-again').addEventListener('click', onOverlayPrimary);
  document.getElementById('btn-menu').addEventListener('click', onMenuFromOverlay);

  // Help modal
  document.getElementById('btn-close-help').addEventListener('click', closeHelpModal);

  // Confirm modal
  document.getElementById('btn-confirm-cancel').addEventListener('click', closeConfirmModal);
  document.getElementById('btn-confirm-quit').addEventListener('click', onConfirmModalQuit);

  // Focus traps
  trapFocus(document.getElementById('help-modal'));
  trapFocus(document.getElementById('confirm-modal'));
  trapFocus(document.getElementById('gameover-overlay'));

  renderHome();
});
