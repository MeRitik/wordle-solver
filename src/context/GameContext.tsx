import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export type TileStatus = 'correct' | 'present' | 'absent';

export type GameState = 'playing' | 'won' | 'lost';

interface SavedGameState {
  solution: string | null;
  guesses: string[];
  statuses: TileStatus[][];
  currentGuess: string;
  message: string;
  gameState: GameState;
}

const PLAY_STORAGE_KEY = 'wordle-buddy-play-v1';

const encodeState = (state: SavedGameState): string => {
  try {
    const json = JSON.stringify(state);
    return window.btoa(json);
  } catch {
    return '';
  }
};

const decodeState = (raw: string): SavedGameState | null => {
  try {
    // First try base64-decoding (new format)
    const json = window.atob(raw);
    const parsed = JSON.parse(json) as Partial<SavedGameState>;
    return {
      solution: parsed.solution ?? null,
      guesses: parsed.guesses ?? [],
      statuses: parsed.statuses ?? [],
      currentGuess: parsed.currentGuess ?? '',
      message: parsed.message ?? '',
      gameState: parsed.gameState ?? 'playing',
    };
  } catch {
    try {
      // Fallback for any existing plain-JSON data from older versions
      const parsed = JSON.parse(raw) as Partial<SavedGameState>;
      return {
        solution: parsed.solution ?? null,
        guesses: parsed.guesses ?? [],
        statuses: parsed.statuses ?? [],
        currentGuess: parsed.currentGuess ?? '',
        message: parsed.message ?? '',
        gameState: parsed.gameState ?? 'playing',
      };
    } catch {
      return null;
    }
  }
};

interface GameContextValue {
  allWords: string[];
  solution: string | null;
  guesses: string[];
  statuses: TileStatus[][];
  currentGuess: string;
  message: string;
  gameState: GameState;
  handleLetterInput: (letter: string) => void;
  handleBackspace: () => void;
  handleSubmitGuess: () => void;
  startNewGame: () => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [allWords, setAllWords] = useState<string[]>([]);
  const [solution, setSolution] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<TileStatus[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>('playing');

  useEffect(() => {
    const loadGame = async () => {
      let saved: SavedGameState | null = null;

      try {
        const raw = window.localStorage.getItem(PLAY_STORAGE_KEY);
        if (raw) {
          saved = decodeState(raw);
        }
      } catch {
        // ignore bad stored data
      }

      try {
        const response = await fetch('/words.txt');
        const text = await response.text();
        const words = text
          .split('\n')
          .map((word) => word.trim().toLowerCase())
          .filter((word) => word.length === WORD_LENGTH);

        setAllWords(words);

        if (words.length === 0) return;

        if (saved && saved.solution && words.includes(saved.solution)) {
          setSolution(saved.solution);
          setGuesses(saved.guesses);
          setStatuses(saved.statuses);
          setCurrentGuess(saved.currentGuess);
          setMessage(saved.message);
          setGameState(saved.gameState);
        } else {
          const random = words[Math.floor(Math.random() * words.length)];
          setSolution(random);
        }
      } catch (error) {
        console.error('Error loading words:', error);
      }
    };

    void loadGame();
  }, []);

  useEffect(() => {
    if (!solution) return;

    const payload: SavedGameState = {
      solution,
      guesses,
      statuses,
      currentGuess,
      message,
      gameState,
    };

    try {
      const encoded = encodeState(payload);
      if (encoded) {
        window.localStorage.setItem(PLAY_STORAGE_KEY, encoded);
      }
    } catch {
      // ignore write errors
    }
  }, [solution, guesses, statuses, currentGuess, message, gameState]);

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

  const value: GameContextValue = {
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
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return ctx;
};
