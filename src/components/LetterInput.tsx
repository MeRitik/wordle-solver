import './LetterInput.css';

interface LetterInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText: string;
  type: 'yellow' | 'gray';
}

export const LetterInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder = 'ENTER LETTERS', 
  helpText,
  type 
}: LetterInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    onChange(sanitized);
  };

  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        <span className={`label-badge ${type}`}>
          {type === 'yellow' ? 'Yellow' : 'Gray'}
        </span>
      </label>
      <input
        type="text"
        className="letter-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="characters"
        maxLength={15}
      />
      <p className="help-text">{helpText}</p>
    </div>
  );
};
