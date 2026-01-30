import './Results.css';

interface ResultsProps {
  words: string[];
  criteria: {
    correctPositions: string;
    wrongPositions: string;
    absentLetters: string;
  };
}

export const Results = ({ words, criteria }: ResultsProps) => {
  const hasCriteria = criteria.correctPositions || criteria.wrongPositions || criteria.absentLetters;

  if (!hasCriteria) {
    return null;
  }

  if (words.length === 0) {
    return (
      <div className="results-section">
        <div className="no-results">
          <div className="no-results-icon">🤔</div>
          <p className="no-results-title">No matching words found</p>
          <p className="no-results-text">Try adjusting your letter constraints</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-section">
      <div className="criteria-display">
        {criteria.correctPositions && (
          <div className="criteria-item">
            <span className="criteria-label green">Correct Positions:</span>
            <span className="criteria-value">{criteria.correctPositions}</span>
          </div>
        )}
        {criteria.wrongPositions && (
          <div className="criteria-item">
            <span className="criteria-label yellow">Wrong Positions:</span>
            <span className="criteria-value">{criteria.wrongPositions}</span>
          </div>
        )}
        {criteria.absentLetters && (
          <div className="criteria-item">
            <span className="criteria-label gray">Absent Letters:</span>
            <span className="criteria-value">{criteria.absentLetters}</span>
          </div>
        )}
      </div>

      <div className="result-header">
        Found <span className="result-count">{words.length}</span> matching word{words.length !== 1 ? 's' : ''}
      </div>

      <div className="results-grid">
        {words.map((word, index) => (
          <div key={index} className="word-item">
            {word.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
};
