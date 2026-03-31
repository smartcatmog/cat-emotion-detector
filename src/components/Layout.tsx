import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate?: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { view: 'mood', emoji: '💭', label: 'Mood Match' },
    { view: 'upload', emoji: '🐱', label: 'Analyze' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-purple-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button
              onClick={() => onNavigate?.('mood')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl">🐱</span>
              <span className="text-lg font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                MoodCat
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map(({ view, emoji, label }) => (
                <button
                  key={view}
                  onClick={() => onNavigate?.(view)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
              <a
                href="https://github.com/smartcatmog/cat-emotion-detector"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity shadow-sm shadow-purple-200"
              >
                ⭐ Star us
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-1">
              {navItems.map(({ view, emoji, label }) => (
                <button
                  key={view}
                  onClick={() => { onNavigate?.(view); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium"
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
              <button
                onClick={() => { onNavigate?.('privacy'); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 w-full text-left px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-sm"
              >
                🔒 Privacy
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐱</span>
              <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">MoodCat</span>
              <span className="text-gray-400 text-sm">— AI-powered cat emotion detector</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <button onClick={() => onNavigate?.('annotate')} className="hover:text-purple-500 transition-colors">📸 Annotate Data</button>
              <button onClick={() => onNavigate?.('history')} className="hover:text-purple-500 transition-colors">📚 History</button>
              <button onClick={() => onNavigate?.('privacy')} className="hover:text-purple-500 transition-colors">🔒 Privacy</button>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span>© 2024 MoodCat</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
