import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

type View = 'solve' | 'play';

const getViewFromPath = (pathname: string): View => {
  if (pathname.startsWith('/play')) return 'play';
  return 'solve';
};

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const currentView = getViewFromPath(location.pathname);

  return (
    <header className="header">
      <div className="header-content">
        <div className="title-section">
          <div className="logo-mark" aria-hidden="true">
            <span className="logo-tile green">W</span>
            <span className="logo-tile yellow">B</span>
          </div>
          <h1 className="title">Wordle Buddy</h1>
        </div>
        <div className="header-right">
          <div className="view-toggle" role="tablist" aria-label="Select mode">
            <Link
              to="/play"
              className={`view-button ${currentView === 'play' ? 'active' : ''}`}
              role="tab"
              aria-selected={currentView === 'play'}
            >
              Play
            </Link>
            <Link
              to="/solve"
              className={`view-button ${currentView === 'solve' ? 'active' : ''}`}
              role="tab"
              aria-selected={currentView === 'solve'}
            >
              Solve
            </Link>
          </div>

          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
