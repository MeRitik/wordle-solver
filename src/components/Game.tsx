import { useEffect, useRef } from 'react';
import './Game.css';
import './TileInput.css';
import { MAX_GUESSES, WORD_LENGTH, useGame } from '../context/GameContext';
import type { TileStatus } from '../context/GameContext';

export const Game = () => {
  const {
    allWords,
    solution,
    guesses,
    statuses,
    currentGuess,
    message,
    gameState,
    handleLetterInput,
    handleBackspace,
    handleSubmitGuess,
    startNewGame,
  } = useGame();
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    sectionRef.current?.focus();
  }, []);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const key = e.key;

    if (gameState !== 'playing') {
      if (key === 'Enter') {
        e.preventDefault();
        startNewGame();
      }
      return;
    }

    if (key === 'Enter') {
      e.preventDefault();
      handleSubmitGuess();
      return;
    }

    if (key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
      return;
    }

    if (/^[a-zA-Z]$/.test(key)) {
      e.preventDefault();
      handleLetterInput(key);
    }
  };

  const keyStatuses = (() => {
    const map: Record<string, TileStatus> = {};
    const priority: Record<TileStatus, number> = {
      absent: 0,
      present: 1,
      correct: 2,
    };

    statuses.forEach((row, rowIndex) => {
      const guess = guesses[rowIndex] || '';
      row.forEach((status, colIndex) => {
        const letter = guess[colIndex]?.toUpperCase();
        if (!letter) return;
        const existing = map[letter];
        if (!existing || priority[status] > priority[existing]) {
          map[letter] = status;
        }
      });
    });

    return map;
  })();

  const rows = Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
    const guess = guesses[rowIndex] || '';
    const isCurrentRow = rowIndex === guesses.length && gameState === 'playing';
    const displayGuess = (isCurrentRow ? currentGuess.toLowerCase() : guess) || '';
    const rowStatuses = statuses[rowIndex] || [];

    return { displayGuess, rowStatuses };
  });

  return (
    <div
      className="game-section"
      ref={sectionRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => sectionRef.current?.focus()}
    >
      <div className="game-grid">
        {rows.map((row, rowIndex) => (
          <div className="guess-row" key={rowIndex}>
            {Array.from({ length: WORD_LENGTH }, (_, colIndex) => {
              const letter = row.displayGuess[colIndex]?.toUpperCase() || '';
              const status = row.rowStatuses[colIndex] || '';

              return (
                <div
                  key={colIndex}
                  className={`tile game-tile ${status}`}
                  aria-label={letter ? `${letter} ${status || 'empty'}` : 'empty'}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="keyboard" aria-label="On-screen keyboard">
        {[
          ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
          ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
          ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
        ].map((row, rowIndex) => (
          <div className="keyboard-row" key={rowIndex}>
            {row.map((keyLabel) => {
              const isEnter = keyLabel === 'ENTER';
              const isBack = keyLabel === 'BACK';
              const letter = !isEnter && !isBack ? keyLabel : '';
              const status = letter ? keyStatuses[letter] : undefined;

              const classes = ['key'];
              if (isEnter || isBack) classes.push('wide-key');
              if (status) classes.push(status);

              return (
                <button
                  key={keyLabel}
                  type="button"
                  className={classes.join(' ')}
                  onClick={() => {
                    if (!solution || gameState !== 'playing') return;
                    if (isEnter) {
                      handleSubmitGuess();
                    } else if (isBack) {
                      handleBackspace();
                    } else if (letter) {
                      handleLetterInput(letter);
                    }
                  }}
                  disabled={!solution || gameState !== 'playing'}
                >
                  {isBack ? '⌫' : keyLabel}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {message && (
        <p className={`game-message ${gameState !== 'playing' ? 'final' : ''}`}>
          {message}
        </p>
      )}

      <div className="game-footer">
        <button
          type="button"
          className="btn btn-reset game-submit"
          onClick={handleSubmitGuess}
          disabled={!solution || gameState !== 'playing'}
        >
          Guess
        </button>
        <button
          type="button"
          className="btn btn-reset game-new"
          onClick={startNewGame}
          disabled={allWords.length === 0}
        >
          New Game
        </button>
      </div>
    </div>
  );
};
