import { useState, useRef, useEffect } from 'react';
import './TileInput.css';
import './TileInput_Yellow.css';

interface TileInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  badgeType?: 'green' | 'yellow';
  maxLength?: number;
  blockedLetters?: string;
}

export const TileInput = ({ 
  value, 
  onChange, 
  label = "Correct Positions", 
  badgeType = "green",
  maxLength = 1,
  blockedLetters,
}: TileInputProps) => {
  const [tiles, setTiles] = useState<string[]>(value);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setTiles(value);
  }, [value]);

  const handleTileChange = (index: number, val: string) => {
    const blockedSet = new Set(
      (blockedLetters || '')
        .toUpperCase()
        .split('')
        .filter(Boolean)
    );

    const sanitized = val
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .split('')
      .filter((ch) => !blockedSet.has(ch))
      .join('')
      .slice(0, maxLength);
    const newTiles = [...tiles];
    newTiles[index] = sanitized;
    setTiles(newTiles);
    onChange(newTiles);

    // Auto-focus next tile only if full (and maxLength is 1)
    if (maxLength === 1 && sanitized && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !tiles[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newTiles = [...tiles];
      newTiles[index - 1] = '';
      setTiles(newTiles);
      onChange(newTiles);
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const blockedSet = new Set(
      (blockedLetters || '')
        .toUpperCase()
        .split('')
        .filter(Boolean)
    );

    const letters = text
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 5)
      .split('')
      .filter((ch) => !blockedSet.has(ch));
    const newTiles = [...tiles];
    letters.forEach((letter, i) => {
      if (i < 5) newTiles[i] = letter;
    });
    setTiles(newTiles);
    onChange(newTiles);
  };

  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        <span className={`label-badge ${badgeType}`}>
          {badgeType === 'yellow' ? 'Yellow' : 'Green'}
        </span>
      </label>
      <div className="tiles-container" onPaste={handlePaste}>
        {[0, 1, 2, 3, 4].map((index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            className={`tile ${tiles[index] ? 'filled' : ''} ${badgeType === 'yellow' ? 'yellow-tile' : ''}`}
            value={tiles[index] || ''}
            onChange={(e) => handleTileChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            maxLength={maxLength}
            autoComplete="off"
            autoCapitalize="characters"
            aria-label={`Position ${index + 1}`}
          />
        ))}
      </div>
      <p className="help-text">
        {badgeType === 'yellow'
          ? 'Letters that are in the word but not in these positions'
          : 'Enter known letters in their correct positions'}
      </p>
    </div>
  );
};
