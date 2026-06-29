import { useEffect, useRef } from 'react';
import './WinModal.css';
import type { BestScore } from '../App';

interface WinModalProps {
  moves: number;
  seconds: number;
  previousBest: BestScore | undefined;
  onPlayAgain: () => void;
  onHome: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function WinModal({ moves, seconds, previousBest, onPlayAgain, onHome }: WinModalProps) {
  const isNewBest =
    !previousBest ||
    moves < previousBest.moves ||
    (moves === previousBest.moves && seconds < previousBest.seconds);

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable?.length) focusable[0].focus();
    return () => { (triggerRef.current as HTMLElement)?.focus(); };
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )).filter(el => !el.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Puzzle solved">
      <div className="modal-card win-modal" ref={modalRef}>
        <h2 className="win-modal__title">Puzzle Solved!</h2>
        {isNewBest && <p className="win-modal__new-best">New best!</p>}
        <div className="win-modal__stats">
          <div className="win-modal__stat">
            <span className="win-modal__stat-label">Moves</span>
            <span className="win-modal__stat-value">{moves}</span>
          </div>
          <div className="win-modal__stat">
            <span className="win-modal__stat-label">Time</span>
            <span className="win-modal__stat-value">{formatTime(seconds)}</span>
          </div>
        </div>
        {previousBest && !isNewBest && (
          <div className="win-modal__best">
            <span className="win-modal__best-label">Best</span>
            <span className="win-modal__best-value">
              {previousBest.moves} moves · {formatTime(previousBest.seconds)}
            </span>
          </div>
        )}
        <div className="win-modal__actions">
          <button className="btn btn-primary" onClick={onPlayAgain}>
            Play Again
          </button>
          <button className="btn btn-secondary" onClick={onHome}>
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
