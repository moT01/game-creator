// ─── State ───────────────────────────────────────────────────────────────────

let state = null;

function initState(mode, difficulty) {
  return {
    piles: [3, 5, 7],
    currentPlayer: mode === 'vs-computer' ? 'human' : 'p1',
    mode,
    difficulty,
    selectedPile: null,
    selectedCount: 0,
    status: 'playing',
    winner: null,
  };
}

function isGameOver(piles) {
  return piles.every(p => p === 0);
}

function togglePlayer(st) {
  if (st.mode === 'vs-computer') {
    return st.currentPlayer === 'human' ? 'computer' : 'human';
  }
  return st.currentPlayer === 'p1' ? 'p2' : 'p1';
}

function applyTake(st, pileIndex, count) {
  const newPiles = st.piles.slice();
  newPiles[pileIndex] = newPiles[pileIndex] - count;
  const over = isGameOver(newPiles);
  const nextPlayer = over ? st.currentPlayer : togglePlayer(st);
  const winner = over ? st.currentPlayer : null;
  return {
    ...st,
    piles: newPiles,
    selectedPile: null,
    selectedCount: 0,
    currentPlayer: nextPlayer,
    status: over ? 'game-over' : 'playing',
    winner,
  };
}

// ─── AI ──────────────────────────────────────────────────────────────────────

function computeNimSum(piles) {
  return piles[0] ^ piles[1] ^ piles[2];
}

function hardMove(piles) {
  const nimSum = computeNimSum(piles);
  if (nimSum !== 0) {
    for (let i = 0; i < piles.length; i++) {
      const target = piles[i] ^ nimSum;
      if (target < piles[i]) {
        return { pileIndex: i, count: piles[i] - target };
      }
    }
  }
  // Losing position — take 1 from the largest non-empty pile
  let maxIdx = 0;
  for (let i = 1; i < piles.length; i++) {
    if (piles[i] > piles[maxIdx]) maxIdx = i;
  }
  return { pileIndex: maxIdx, count: 1 };
}

function normalMove(piles) {
  if (Math.random() < 0.3) {
    return hardMove(piles);
  }
  const moves = [];
  for (let i = 0; i < piles.length; i++) {
    for (let c = 1; c <= piles[i]; c++) {
      moves.push({ pileIndex: i, count: c });
    }
  }
  return moves[Math.floor(Math.random() * moves.length)];
}

function getComputerMove(piles, difficulty) {
  return difficulty === 'hard' ? hardMove(piles) : normalMove(piles);
}

// ─── Local Storage ───────────────────────────────────────────────────────────

function saveGame(st) {
  const toSave = {
    piles: st.piles,
    currentPlayer: st.currentPlayer,
    mode: st.mode,
    difficulty: st.difficulty,
    status: st.status,
    winner: st.winner,
  };
  localStorage.setItem('nim_state', JSON.stringify(toSave));
}

function loadGame() {
  try {
    const raw = localStorage.getItem('nim_state');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.status === 'game-over') return null;
    return { ...parsed, selectedPile: null, selectedCount: 0 };
  } catch {
    return null;
  }
}

function saveRecords(records) {
  localStorage.setItem('nim_records', JSON.stringify(records));
}

function loadRecords() {
  try {
    const raw = localStorage.getItem('nim_records');
    return raw ? JSON.parse(raw) : { normal: { wins: 0 }, hard: { wins: 0 } };
  } catch {
    return { normal: { wins: 0 }, hard: { wins: 0 } };
  }
}

function savePrefs(mode, difficulty) {
  localStorage.setItem('nim_prefs', JSON.stringify({ mode, difficulty }));
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem('nim_prefs');
    return raw ? JSON.parse(raw) : { mode: 'vs-computer', difficulty: 'normal' };
  } catch {
    return { mode: 'vs-computer', difficulty: 'normal' };
  }
}

function loadTheme() {
  const theme = localStorage.getItem('nim_theme') || 'dark';
  applyTheme(theme);
}

function applyTheme(theme) {
  document.body.classList.remove('light-palette', 'dark-palette');
  document.body.classList.add(theme === 'light' ? 'light-palette' : 'dark-palette');
  const sunEl = document.getElementById('icon-sun');
  const moonEl = document.getElementById('icon-moon');
  const sunEl2 = document.getElementById('icon-sun-home');
  const moonEl2 = document.getElementById('icon-moon-home');
  if (sunEl) sunEl.style.display = theme === 'light' ? 'none' : 'block';
  if (moonEl) moonEl.style.display = theme === 'light' ? 'block' : 'none';
  if (sunEl2) sunEl2.style.display = theme === 'light' ? 'none' : 'block';
  if (moonEl2) moonEl2.style.display = theme === 'light' ? 'block' : 'none';
}

function handleThemeToggle() {
  const current = localStorage.getItem('nim_theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('nim_theme', next);
  applyTheme(next);
}

// ─── Move Handling ───────────────────────────────────────────────────────────

function isValidTake(piles, pileIndex, count) {
  return pileIndex >= 0 && pileIndex <= 2 && piles[pileIndex] > 0 && count >= 1 && count <= piles[pileIndex];
}

function handleTokenClick(pileIndex, tokenIndex) {
  if (!state || state.status !== 'playing') return;
  if (state.mode === 'vs-computer' && state.currentPlayer === 'computer') return;
  if (state.piles[pileIndex] === 0) return;
  const count = state.piles[pileIndex] - tokenIndex;
  state = { ...state, selectedPile: pileIndex, selectedCount: count };
  renderPlay();
}

function handleTakeClick() {
  if (!state || state.selectedCount < 1) return;
  if (!isValidTake(state.piles, state.selectedPile, state.selectedCount)) return;

  const pileIndex = state.selectedPile;
  const count = state.selectedCount;

  animateRemoval(pileIndex, count, () => {
    state = applyTake(state, pileIndex, count);
    if (state.status === 'game-over') {
      if (state.mode === 'vs-computer' && state.winner === 'human') {
        const records = loadRecords();
        records[state.difficulty].wins += 1;
        saveRecords(records);
      }
      localStorage.removeItem('nim_state');
      renderPlay();
      showGameOver();
    } else {
      saveGame(state);
      renderPlay();
      if (state.mode === 'vs-computer' && state.currentPlayer === 'computer') {
        triggerComputerMove();
      }
    }
  });
}

function triggerComputerMove() {
  setTimeout(() => {
    if (!state || state.status !== 'playing' || state.currentPlayer !== 'computer') return;
    const move = getComputerMove(state.piles, state.difficulty);
    animateComputerMove(move.pileIndex, move.count, () => {
      state = applyTake(state, move.pileIndex, move.count);
      if (state.status === 'game-over') {
        localStorage.removeItem('nim_state');
        renderPlay();
        showGameOver();
      } else {
        saveGame(state);
        renderPlay();
      }
    });
  }, 600);
}

// ─── Keyboard Handling ───────────────────────────────────────────────────────

function handleTokenKeydown(e, pileIndex, tokenIndex) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleTokenClick(pileIndex, tokenIndex);
    return;
  }
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    e.preventDefault();
    if (state.selectedPile !== pileIndex) return;
    const pileLen = state.piles[pileIndex];
    const currentTokenIdx = pileLen - state.selectedCount;
    let nextIdx = e.key === 'ArrowLeft'
      ? Math.max(0, currentTokenIdx - 1)
      : Math.min(pileLen - 1, currentTokenIdx + 1);
    handleTokenClick(pileIndex, nextIdx);
  }
}

// ─── Animations ──────────────────────────────────────────────────────────────

function animateRemoval(pileIndex, count, callback) {
  const pileEl = document.querySelector(`.pile[data-pile="${pileIndex}"]`);
  if (!pileEl) { callback(); return; }
  const tokens = pileEl.querySelectorAll('.token:not(.token--placeholder)');
  const pileSize = state.piles[pileIndex];
  const startIdx = pileSize - count;
  tokens.forEach((tok, i) => {
    if (i >= startIdx) {
      tok.classList.add('token--removing');
    }
  });
  setTimeout(callback, 320);
}

function animateComputerMove(pileIndex, count, callback) {
  const pileEl = document.querySelector(`.pile[data-pile="${pileIndex}"]`);
  if (!pileEl) { callback(); return; }
  const tokens = pileEl.querySelectorAll('.token:not(.token--placeholder)');
  const pileSize = state.piles[pileIndex];
  const startIdx = pileSize - count;
  tokens.forEach((tok, i) => {
    if (i >= startIdx) {
      tok.classList.add('token--computer-selecting');
    }
  });
  setTimeout(() => {
    tokens.forEach((tok, i) => {
      if (i >= startIdx) {
        tok.classList.remove('token--computer-selecting');
        tok.classList.add('token--removing');
      }
    });
    setTimeout(callback, 320);
  }, 500);
}

// ─── Rendering ───────────────────────────────────────────────────────────────

function renderTurnLabel(st) {
  if (st.mode === 'vs-computer') {
    if (st.currentPlayer === 'computer') return 'Computer is thinking...';
    return 'Your turn';
  }
  return st.currentPlayer === 'p1' ? 'Player 1\'s turn' : 'Player 2\'s turn';
}

function renderPiles(piles, selectedPile, selectedCount) {
  return piles.map((count, i) => {
    const isEmpty = count === 0;
    const isSelected = selectedPile === i;
    const selectedStart = isSelected ? count - selectedCount : -1;

    const tokens = [];
    for (let t = 0; t < count; t++) {
      const isSelectedToken = isSelected && t >= selectedStart;
      const label = isSelected
        ? (t >= selectedStart ? `Remove from pile ${i + 1}` : `Take ${count - t} from pile ${i + 1}`)
        : `Take ${count - t} from pile ${i + 1}`;
      tokens.push(`
        <button
          class="token${isSelectedToken ? ' token--selected' : ''}"
          data-pile="${i}"
          data-token="${t}"
          aria-label="${label}"
          tabindex="0"
        ></button>
      `);
    }

    return `
      <div class="pile${isEmpty ? ' pile--empty' : ''}${isSelected ? ' pile--active' : ''}" data-pile="${i}">
        <div class="pile__label">${isSelected ? `<span class="pile__count">${selectedCount} selected</span>` : ''}</div>
        <div class="pile__tokens">
          ${isEmpty
            ? '<div class="token token--placeholder" aria-hidden="true"></div>'
            : tokens.join('')
          }
        </div>
        <div class="pile__name">${isEmpty ? 'Empty' : `Pile ${i + 1} (${count})`}</div>
      </div>
    `;
  }).join('');
}

function renderPlay() {
  const app = document.getElementById('app');
  const isThinking = state.mode === 'vs-computer' && state.currentPlayer === 'computer';
  const turnLabel = renderTurnLabel(state);
  const canTake = state.selectedCount > 0 && !isThinking;
  const takeLabel = state.selectedCount > 0
    ? `Take ${state.selectedCount} from pile ${state.selectedPile + 1}`
    : 'Select tokens to take';

  app.innerHTML = `
    <div class="screen screen--play">
      <div class="container">
        <header class="header">
          <button class="icon-btn" id="btn-close" aria-label="Quit to menu">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/></svg>
          </button>
          <div class="header__icons">
            <button class="icon-btn" id="btn-help-play" aria-label="Help">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M64 160c0-53 43-96 96-96s96 43 96 96c0 42.7-27.9 78.9-66.5 91.4-28.4 9.2-61.5 35.3-61.5 76.6l0 24c0 17.7 14.3 32 32 32s32-14.3 32-32l0-24c0-1.7 .6-4.1 3.5-7.3 3-3.3 7.9-6.5 13.7-8.4 64.3-20.7 110.8-81 110.8-152.3 0-88.4-71.6-160-160-160S0 71.6 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm96 352c22.1 0 40-17.9 40-40s-17.9-40-40-40-40 17.9-40 40 17.9 40 40 40z"/></svg>
            </button>
            <button class="icon-btn" id="btn-theme-play" aria-label="Toggle theme">
              <span id="icon-sun">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M288-32c8.4 0 16.3 4.4 20.6 11.7L364.1 72.3 468.9 46c8.2-2 16.9 .4 22.8 6.3S500 67 498 75.1l-26.3 104.7 92.7 55.5c7.2 4.3 11.7 12.2 11.7 20.6s-4.4 16.3-11.7 20.6L471.7 332.1 498 436.8c2 8.2-.4 16.9-6.3 22.8S477 468 468.9 466l-104.7-26.3-55.5 92.7c-4.3 7.2-12.2 11.7-20.6 11.7s-16.3-4.4-20.6-11.7L211.9 439.7 107.2 466c-8.2 2-16.8-.4-22.8-6.3S76 445 78 436.8l26.2-104.7-92.6-55.5C4.4 272.2 0 264.4 0 256s4.4-16.3 11.7-20.6L104.3 179.9 78 75.1c-2-8.2 .3-16.8 6.3-22.8S99 44 107.2 46l104.7 26.2 55.5-92.6 1.8-2.6c4.5-5.7 11.4-9.1 18.8-9.1zm0 144a144 144 0 1 0 0 288 144 144 0 1 0 0-288zm0 240a96 96 0 1 1 0-192 96 96 0 1 1 0 192z"/></svg>
              </span>
              <span id="icon-moon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 0C114.6 0 0 114.6 0 256S114.6 512 256 512c68.8 0 131.3-27.2 177.3-71.4 7.3-7 9.4-17.9 5.3-27.1s-13.7-14.9-23.8-14.1c-4.9 .4-9.8 .6-14.8 .6-101.6 0-184-82.4-184-184 0-72.1 41.5-134.6 102.1-164.8 9.1-4.5 14.3-14.3 13.1-24.4S322.6 8.5 312.7 6.3C294.4 2.2 275.4 0 256 0z"/></svg>
              </span>
            </button>
            <button class="icon-btn" id="btn-donate-play" aria-label="Donate">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z"/></svg>
            </button>
          </div>
        </header>
        <hr class="divider" />
        <div class="play-area">
          <div class="turn-label${isThinking ? ' turn-label--thinking' : ''}" aria-live="polite">${turnLabel}</div>
          <div class="piles" id="piles-container">
            ${renderPiles(state.piles, state.selectedPile, state.selectedCount)}
          </div>
          <button
            class="btn btn--take"
            id="btn-take"
            ${canTake ? '' : 'disabled'}
            aria-label="${takeLabel}"
            aria-disabled="${canTake ? 'false' : 'true'}"
          >
            ${state.selectedCount > 0 ? `Take ${state.selectedCount}` : 'Take'}
          </button>
        </div>
      </div>
    </div>
  `;

  bindPlayEvents();
  applyTheme(localStorage.getItem('nim_theme') || 'dark');
}

function bindPlayEvents() {
  document.getElementById('btn-close').addEventListener('click', () => {
    if (state && state.status === 'playing') {
      showConfirmModal('Quit this game? Your progress will be lost.', () => {
        localStorage.removeItem('nim_state');
        renderHome();
      });
    } else {
      renderHome();
    }
  });

  document.getElementById('btn-help-play').addEventListener('click', showHelpModal);
  document.getElementById('btn-theme-play').addEventListener('click', handleThemeToggle);
  document.getElementById('btn-donate-play').addEventListener('click', () => {
    window.open('https://www.freecodecamp.org/donate', '_blank');
  });

  document.getElementById('btn-take').addEventListener('click', () => {
    if (state.selectedCount < 1) {
      const btn = document.getElementById('btn-take');
      btn.classList.add('btn--shake');
      setTimeout(() => btn.classList.remove('btn--shake'), 400);
      return;
    }
    handleTakeClick();
  });

  document.querySelectorAll('.token:not(.token--placeholder)').forEach(tok => {
    const pileIndex = parseInt(tok.dataset.pile, 10);
    const tokenIndex = parseInt(tok.dataset.token, 10);
    tok.addEventListener('click', () => handleTokenClick(pileIndex, tokenIndex));
    tok.addEventListener('keydown', e => handleTokenKeydown(e, pileIndex, tokenIndex));
  });
}

function showGameOver() {
  const records = loadRecords();
  const winner = state.winner;
  let resultText = '';
  let resultClass = '';
  if (state.mode === 'vs-computer') {
    resultText = winner === 'human' ? 'You win!' : 'Computer wins!';
    resultClass = winner === 'human' ? 'result--win' : 'result--loss';
  } else {
    resultText = winner === 'p1' ? 'Player 1 wins!' : 'Player 2 wins!';
    resultClass = 'result--win';
  }

  const recordsHtml = state.mode === 'vs-computer' ? `
    <div class="gameover__records">
      <span>Normal wins: <strong>${records.normal.wins}</strong></span>
      <span>Hard wins: <strong>${records.hard.wins}</strong></span>
    </div>
  ` : '';

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.id = 'gameover-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Game over');
  overlay.innerHTML = `
    <div class="overlay__panel">
      <div class="gameover__result ${resultClass}">${resultText}</div>
      ${recordsHtml}
      <div class="overlay__actions">
        <button class="btn btn--primary" id="btn-play-again">Play Again</button>
        <button class="btn btn--secondary" id="btn-return-menu">Return to Menu</button>
      </div>
    </div>
  `;
  document.querySelector('.screen--play').appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('overlay--visible'));

  document.getElementById('btn-play-again').addEventListener('click', () => {
    state = initState(state.mode, state.difficulty);
    saveGame(state);
    renderPlay();
  });
  document.getElementById('btn-return-menu').addEventListener('click', () => {
    renderHome();
  });
}

function showHelpModal() {
  const existing = document.getElementById('help-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'overlay';
  modal.id = 'help-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Help');
  modal.innerHTML = `
    <div class="overlay__panel overlay__panel--help">
      <div class="modal__header">
        <h2 class="modal__title">How to Play Nim</h2>
        <button class="icon-btn" id="btn-close-help" aria-label="Close help">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/></svg>
        </button>
      </div>
      <div class="modal__body">
        <section class="help-section">
          <h3>Objective</h3>
          <p>Take the last object to win.</p>
        </section>
        <section class="help-section">
          <h3>Rules</h3>
          <ul>
            <li>Three piles start with 3, 5, and 7 objects.</li>
            <li>On your turn, pick any one pile and remove 1 or more objects from it.</li>
            <li>You must take at least 1 object and from exactly one pile.</li>
            <li>The player who takes the very last object wins.</li>
          </ul>
        </section>
        <section class="help-section">
          <h3>Strategy</h3>
          <ul>
            <li>The winning move always leaves a position where the XOR of all pile sizes equals zero. Your opponent then has no winning reply.</li>
            <li>The starting position (3, 5, 7) has nim-sum = 1, so the first player wins with optimal play.</li>
            <li>With one pile left, take the whole pile to win.</li>
            <li>With two piles left, make them equal in size.</li>
            <li>Key losing positions: (1,2,3), (1,4,5), (2,4,6).</li>
          </ul>
        </section>
        <section class="help-section">
          <h3>Common Mistakes</h3>
          <ul>
            <li>Taking too many from a large pile early and handing the opponent a balanced two-pile position.</li>
            <li>Forgetting you can only take from one pile per turn.</li>
            <li>Leaving a single pile for the opponent.</li>
          </ul>
        </section>
        <section class="help-section">
          <h3>Tips</h3>
          <ul>
            <li>Learn the two-pile rule first: equal piles means the player to move loses.</li>
            <li>Hard mode plays perfectly. Play Normal to practice.</li>
          </ul>
        </section>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('overlay--visible'));

  document.getElementById('btn-close-help').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  modal.addEventListener('keydown', e => { if (e.key === 'Escape') modal.remove(); });

  trapFocus(modal);
  document.getElementById('btn-close-help').focus();
}

function showConfirmModal(message, onConfirm) {
  const existing = document.getElementById('confirm-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'overlay';
  modal.id = 'confirm-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Confirm');
  modal.innerHTML = `
    <div class="overlay__panel overlay__panel--confirm">
      <p class="confirm__message">${message}</p>
      <div class="overlay__actions">
        <button class="btn btn--primary" id="btn-confirm-yes">Quit</button>
        <button class="btn btn--secondary" id="btn-confirm-no">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('overlay--visible'));

  document.getElementById('btn-confirm-yes').addEventListener('click', () => {
    modal.remove();
    onConfirm();
  });
  document.getElementById('btn-confirm-no').addEventListener('click', () => modal.remove());
  modal.addEventListener('keydown', e => { if (e.key === 'Escape') modal.remove(); });

  trapFocus(modal);
  document.getElementById('btn-confirm-no').focus();
}

function trapFocus(el) {
  const focusable = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  el.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

// ─── Home Screen ─────────────────────────────────────────────────────────────

function renderHome() {
  const prefs = loadPrefs();
  const records = loadRecords();
  const savedGame = loadGame();
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="screen screen--home">
      <div class="container">
        <header class="header header--home">
          <button class="icon-btn" id="btn-help-home" aria-label="Help">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M64 160c0-53 43-96 96-96s96 43 96 96c0 42.7-27.9 78.9-66.5 91.4-28.4 9.2-61.5 35.3-61.5 76.6l0 24c0 17.7 14.3 32 32 32s32-14.3 32-32l0-24c0-1.7 .6-4.1 3.5-7.3 3-3.3 7.9-6.5 13.7-8.4 64.3-20.7 110.8-81 110.8-152.3 0-88.4-71.6-160-160-160S0 71.6 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm96 352c22.1 0 40-17.9 40-40s-17.9-40-40-40-40 17.9-40 40 17.9 40 40 40z"/></svg>
          </button>
          <button class="icon-btn" id="btn-theme-home" aria-label="Toggle theme">
            <span id="icon-sun-home">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M288-32c8.4 0 16.3 4.4 20.6 11.7L364.1 72.3 468.9 46c8.2-2 16.9 .4 22.8 6.3S500 67 498 75.1l-26.3 104.7 92.7 55.5c7.2 4.3 11.7 12.2 11.7 20.6s-4.4 16.3-11.7 20.6L471.7 332.1 498 436.8c2 8.2-.4 16.9-6.3 22.8S477 468 468.9 466l-104.7-26.3-55.5 92.7c-4.3 7.2-12.2 11.7-20.6 11.7s-16.3-4.4-20.6-11.7L211.9 439.7 107.2 466c-8.2 2-16.8-.4-22.8-6.3S76 445 78 436.8l26.2-104.7-92.6-55.5C4.4 272.2 0 264.4 0 256s4.4-16.3 11.7-20.6L104.3 179.9 78 75.1c-2-8.2 .3-16.8 6.3-22.8S99 44 107.2 46l104.7 26.2 55.5-92.6 1.8-2.6c4.5-5.7 11.4-9.1 18.8-9.1zm0 144a144 144 0 1 0 0 288 144 144 0 1 0 0-288zm0 240a96 96 0 1 1 0-192 96 96 0 1 1 0 192z"/></svg>
            </span>
            <span id="icon-moon-home">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 0C114.6 0 0 114.6 0 256S114.6 512 256 512c68.8 0 131.3-27.2 177.3-71.4 7.3-7 9.4-17.9 5.3-27.1s-13.7-14.9-23.8-14.1c-4.9 .4-9.8 .6-14.8 .6-101.6 0-184-82.4-184-184 0-72.1 41.5-134.6 102.1-164.8 9.1-4.5 14.3-14.3 13.1-24.4S322.6 8.5 312.7 6.3C294.4 2.2 275.4 0 256 0z"/></svg>
            </span>
          </button>
          <button class="icon-btn" id="btn-donate-home" aria-label="Donate">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z"/></svg>
          </button>
        </header>
        <div class="home__content">
          <h1 class="home__title">Nim</h1>
          <div class="mode-selector" role="group" aria-label="Game mode">
            <button class="mode-btn${prefs.mode === 'vs-computer' ? ' mode-btn--active' : ''}" data-mode="vs-computer">vs Computer</button>
            <button class="mode-btn${prefs.mode === 'vs-friend' ? ' mode-btn--active' : ''}" data-mode="vs-friend">vs Friend</button>
          </div>
          <div class="difficulty-selector${prefs.mode === 'vs-friend' ? ' difficulty-selector--hidden' : ''}" role="group" aria-label="Difficulty" id="difficulty-selector">
            <button class="diff-btn${prefs.difficulty === 'normal' ? ' diff-btn--active' : ''}" data-diff="normal">Normal</button>
            <button class="diff-btn${prefs.difficulty === 'hard' ? ' diff-btn--active' : ''}" data-diff="hard">Hard</button>
          </div>
          <div class="records" aria-label="Win records">
            <div class="records__row">
              <span class="records__label">Normal wins</span>
              <span class="records__value" style="font-family: var(--font-mono)">${records.normal.wins}</span>
            </div>
            <div class="records__row">
              <span class="records__label">Hard wins</span>
              <span class="records__value" style="font-family: var(--font-mono)">${records.hard.wins}</span>
            </div>
          </div>
          <div class="home__actions">
            <button class="btn btn--primary" id="btn-new-game">New Game</button>
            ${savedGame ? '<button class="btn btn--secondary" id="btn-resume">Resume</button>' : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  let currentMode = prefs.mode;
  let currentDiff = prefs.difficulty;

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentMode = btn.dataset.mode;
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('mode-btn--active'));
      btn.classList.add('mode-btn--active');
      const diffSel = document.getElementById('difficulty-selector');
      if (currentMode === 'vs-friend') {
        diffSel.classList.add('difficulty-selector--hidden');
      } else {
        diffSel.classList.remove('difficulty-selector--hidden');
      }
      savePrefs(currentMode, currentDiff);
    });
  });

  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentDiff = btn.dataset.diff;
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('diff-btn--active'));
      btn.classList.add('diff-btn--active');
      savePrefs(currentMode, currentDiff);
    });
  });

  document.getElementById('btn-new-game').addEventListener('click', () => {
    state = initState(currentMode, currentDiff);
    saveGame(state);
    renderPlay();
  });

  const resumeBtn = document.getElementById('btn-resume');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      state = loadGame();
      if (!state) { renderHome(); return; }
      renderPlay();
      if (state.mode === 'vs-computer' && state.currentPlayer === 'computer') {
        triggerComputerMove();
      }
    });
  }

  document.getElementById('btn-help-home').addEventListener('click', showHelpModal);
  document.getElementById('btn-theme-home').addEventListener('click', handleThemeToggle);
  document.getElementById('btn-donate-home').addEventListener('click', () => {
    window.open('https://www.freecodecamp.org/donate', '_blank');
  });

  applyTheme(localStorage.getItem('nim_theme') || 'dark');
}

// ─── Init ─────────────────────────────────────────────────────────────────────

loadTheme();
renderHome();
