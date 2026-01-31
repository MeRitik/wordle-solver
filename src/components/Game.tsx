import { useEffect, useState, useRef } from 'react';
import './Game.css';
import './TileInput.css';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

type TileStatus = 'correct' | 'present' | 'absent';

type GameState = 'playing' | 'won' | 'lost';

export const Game = () => {
  const [allWords, setAllWords] = useState<string[]>([]);
  const [solution, setSolution] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<TileStatus[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>('playing');
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/words.txt')
      .then((response) => response.text())
      .then((text) => {
        const words = text
          .split('\n')
          .map((word) => word.trim().toLowerCase())
          .filter((word) => word.length === WORD_LENGTH);

        setAllWords(words);
        if (words.length > 0) {
          const random = words[Math.floor(Math.random() * words.length)];
          setSolution(random);
        }
      })
      .catch((error) => console.error('Error loading words:', error));
  }, []);

  useEffect(() => {
    sectionRef.current?.focus();
  }, []);

  const startNewGame = () => {
    if (allWords.length === 0) return;

    const random = allWords[Math.floor(Math.random() * allWords.length)];
    setSolution(random);
    setGuesses([]);
    setStatuses([]);
    setCurrentGuess('');
    setMessage('');
    setGameState('playing');
  };

  const computeStatuses = (guess: string, answer: string): TileStatus[] => {
    const result: TileStatus[] = Array(WORD_LENGTH).fill('absent');
    const answerChars = answer.split('');
    const used = Array(WORD_LENGTH).fill(false);

    // First pass: correct positions
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guess[i] === answer[i]) {
        result[i] = 'correct';
        used[i] = true;
      }
    }

    // Second pass: present letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i] === 'correct') continue;
      const char = guess[i];
      const index = answerChars.findIndex((c, j) => !used[j] && c === char);
      if (index !== -1) {
        result[i] = 'present';
        used[index] = true;
      }
    }

    return result;
  };

  const handleLetterInput = (letter: string) => {
    if (gameState !== 'playing') return;

    setCurrentGuess((prev) => {
      if (prev.length >= WORD_LENGTH) return prev;
      return (prev + letter.toUpperCase()).slice(0, WORD_LENGTH);
    });
  };

  const handleBackspace = () => {
    if (gameState !== 'playing') return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  };

  const handleSubmitGuess = () => {
    if (gameState !== 'playing') return;
    if (!solution) return;

    const guess = currentGuess.toLowerCase();

    if (guess.length !== WORD_LENGTH) {
      setMessage('Enter a 5-letter word.');
      return;
    }

    if (!allWords.includes(guess)) {
      setMessage('Not in word list.');
      return;
    }

    const rowStatuses = computeStatuses(guess, solution);

    const newGuesses = [...guesses, guess];
    const newStatuses = [...statuses, rowStatuses];

    setGuesses(newGuesses);
    setStatuses(newStatuses);
    setCurrentGuess('');

    if (guess === solution) {
      setGameState('won');
      setMessage('Nice! You found the word.');
      return;
    }

    if (newGuesses.length >= MAX_GUESSES) {
      setGameState('lost');
      setMessage(`The word was ${solution.toUpperCase()}.`);
      return;
    }

    setMessage('');
  };
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
