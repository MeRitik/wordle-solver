import { useState, useRef, useEffect } from 'react';
import './TileInput.css';

interface TileInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export const TileInput = ({ value, onChange }: TileInputProps) => {
  const [tiles, setTiles] = useState<string[]>(value);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setTiles(value);
  }, [value]);

  const handleTileChange = (index: number, val: string) => {
    const sanitized = val.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1);
    const newTiles = [...tiles];
    newTiles[index] = sanitized;
    setTiles(newTiles);
    onChange(newTiles);

    // Auto-focus next tile
    if (sanitized && index < 4) {
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
    const letters = text.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5).split('');
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
        Correct Positions
        <span className="label-badge green">Green</span>
      </label>
      <div className="tiles-container" onPaste={handlePaste}>
        {[0, 1, 2, 3, 4].map((index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            className={`tile ${tiles[index] ? 'filled' : ''}`}
            value={tiles[index] || ''}
            onChange={(e) => handleTileChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            maxLength={1}
            autoComplete="off"
            autoCapitalize="characters"
            aria-label={`Position ${index + 1}`}
          />
        ))}
      </div>
      <p className="help-text">Enter known letters in their correct positions</p>
    </div>
  );
};
