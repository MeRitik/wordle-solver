import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Analytics } from "@vercel/analytics/react"
import { TileInput } from './components/TileInput';
import { LetterInput } from './components/LetterInput';
import { Results } from './components/Results';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function WordleSolver() {
  const [correctPositions, setCorrectPositions] = useState<string[]>(['', '', '', '', '']);
  const [wrongPositions, setWrongPositions] = useState<string>('');
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

  // Find matching words
  useEffect(() => {
    if (allWords.length === 0) return;

    const pattern = correctPositions.map(letter => letter || '_').join('');
    const wrong = wrongPositions.toLowerCase();
    const absent = absentLetters.toLowerCase();

    // Only search if we have at least one criteria
    if (pattern === '_____' && !wrong && !absent) {
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

      // Check wrong positions (yellow) - must contain these letters but not in these positions
      if (wrong) {
        for (const letter of wrong) {
          if (!word.includes(letter)) {
            return false;
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
    setWrongPositions('');
    setAbsentLetters('');
    setMatchingWords([]);
  };

  return (
    <div className="app">
      <div className="container">
        <Header />

        <div className="form-section">
          <TileInput
            value={correctPositions}
            onChange={setCorrectPositions}
          />

          <LetterInput
            label="Wrong Position Letters"
            value={wrongPositions}
            onChange={setWrongPositions}
            helpText="Letters that exist but are in wrong positions"
            type="yellow"
          />

          <LetterInput
            label="Absent Letters"
            value={absentLetters}
            onChange={setAbsentLetters}
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
            wrongPositions: wrongPositions.toUpperCase(),
            absentLetters: absentLetters.toUpperCase(),
          }}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <WordleSolver />
      <Analytics />
    </ThemeProvider>
  );
}

export default App;
