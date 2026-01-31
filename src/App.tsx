import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Analytics } from '@vercel/analytics/react';
import { TileInput } from './components/TileInput';
import { LetterInput } from './components/LetterInput';
import { Results } from './components/Results';
import { Game } from './components/Game';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function WordleSolver() {
  const [correctPositions, setCorrectPositions] = useState<string[]>(['', '', '', '', '']);
  const [wrongPositions, setWrongPositions] = useState<string[]>(['', '', '', '', '']);
  const [absentLetters, setAbsentLetters] = useState<string>('');
  const [matchingWords, setMatchingWords] = useState<string[]>([]);
  const [allWords, setAllWords] = useState<string[]>([]);

  // Load word list
  useEffect(() => {
    fetch('/words.txt')
      .then(response => response.text())
      .then(text => {
        const words = text.split('\n')
          .map(word => word.trim().toLowerCase())
          .filter(word => word.length === 5);
        setAllWords(words);
      })
      .catch(error => console.error('Error loading words:', error));
  }, []);

  const handleAbsentChange = (raw: string) => {
    const presentLetters = new Set(
      (correctPositions.join('') + wrongPositions.join(''))
        .toUpperCase()
        .split('')
        .filter(Boolean),
    );

    const filteredUnique = Array.from(new Set(
      raw
        .toUpperCase()
        .split('')
        .filter((ch) => !presentLetters.has(ch))
    )).join('');

    setAbsentLetters(filteredUnique);
  };

  // Find matching words
  useEffect(() => {
    if (allWords.length === 0) return;

    const pattern = correctPositions.map(letter => letter || '_').join('');
    // Flatten all wrong position letters to check if any exist (so we can skip search if empty)
    const hasWrong = wrongPositions.some(p => p.length > 0);
    const absent = absentLetters.toLowerCase();

    // Only search if we have at least one criteria
    if (pattern === '_____' && !hasWrong && !absent) {
      setMatchingWords([]);
      return;
    }

    const filtered = allWords.filter(word => {
      // Check correct positions
      for (let i = 0; i < 5; i++) {
        const patternChar = correctPositions[i].toLowerCase();
        if (patternChar && word[i] !== patternChar) {
          return false;
        }
      }

      // Check wrong positions (yellow)
      // For each index, any letter entered there CANNOT be at that index.
      // (We intentionally do NOT require that these letters appear elsewhere
      // in the word, per your requested behavior.)
      for (let i = 0; i < 5; i++) {
        const wrongChars = wrongPositions[i].toLowerCase();
        if (wrongChars) {
          for (const char of wrongChars) {
            if (word[i] === char) {
              return false;
            }
          }
        }
      }

      // Check absent letters (gray) - must not contain these
      if (absent) {
        for (const letter of absent) {
          if (word.includes(letter)) {
            return false;
          }
        }
      }

      return true;
    });

    setMatchingWords(filtered.slice(0, 100)); // Limit to 100 results
  }, [correctPositions, wrongPositions, absentLetters, allWords]);

  const handleReset = () => {
    setCorrectPositions(['', '', '', '', '']);
    setWrongPositions(['', '', '', '', '']);
    setAbsentLetters('');
    setMatchingWords([]);
  };

  return (
    <>
      <div className="form-section">
        <TileInput
          value={correctPositions}
          onChange={setCorrectPositions}
          blockedLetters={absentLetters}
        />

        <TileInput
          value={wrongPositions}
          onChange={setWrongPositions}
          label="Wrong Position Letters"
          badgeType="yellow"
          maxLength={1}
          blockedLetters={absentLetters}
        />

        <LetterInput
          label="Absent Letters"
          value={absentLetters}
          onChange={handleAbsentChange}
          helpText="Letters that do not exist in the word"
          type="gray"
        />

        <div className="button-group">
          <button className="btn btn-reset" onClick={handleReset}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <polyline points="23 20 23 14 17 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            Clear All
          </button>
        </div>
      </div>

      <Results
        words={matchingWords}
        criteria={{
          correctPositions: correctPositions.filter(l => l).join('').toUpperCase(),
          wrongPositions: wrongPositions.join('').toUpperCase(), // Display flattened list for now
          absentLetters: absentLetters.toUpperCase(),
        }}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <div className="container">
          <Header />
          <Routes>
            <Route path="/play" element={<Game />} />
            <Route path="/solve" element={<WordleSolver />} />
            <Route path="/" element={<Navigate to="/play" replace />} />
            <Route path="*" element={<Navigate to="/play" replace />} />
          </Routes>
        </div>
      </div>
      <Analytics />
    </ThemeProvider>
  );
}

export default App;
