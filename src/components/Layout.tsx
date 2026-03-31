import React, { useState } from 'react';
import { useLang } from '../lib/i18n';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate?: (view: string) => void;
  currentView?: string;
  user?: { email?: string } | null;
  username?: string | null;
  isAnonymous?: boolean;
  onLoginClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, currentView, user, username, isAnonymous, onLoginClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, toggle } = useLang();

  const navItems = [
    { view: 'mood',      emoji: '💭', label: lang === 'zh' ? '心情匹配' : 'Mood Match' },
    { view: 'upload',    emoji: '🐱', label: lang === 'zh' ? '分析猫咪' : 'Analyze' },
    { view: 'calendar',  emoji: '📅', label: lang === 'zh' ? '日历' : 'Calendar' },
    { view: 'collection',emoji: '🗂️', label: lang === 'zh' ? '图鉴' : 'Collection' },
    { view: 'lootbox',   emoji: '📦', label: lang === 'zh' ? '盲盒' : 'Loot Box' },
    { view: 'same-mood', emoji: '🤝', label: lang === 'zh' ? '同心情' : 'Same Mood' },
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
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all
                    ${currentView === view
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 hover:text-purple-600'
                    }`}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
              {/* Language toggle */}
              <button
                onClick={toggle}
                className="px-3 py-1.5 rounded-full text-sm font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-400 hover:text-purple-600 transition-all"
                title={lang === 'zh' ? 'Switch to English' : '切换中文'}
              >
                {lang === 'zh' ? 'EN' : '中文'}
              </button>

              {user ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-full text-sm font-medium text-purple-600 dark:text-purple-400">
                  <span>👤</span>
                  <span>{username || user.email?.split('@')[0] || 'Me'}</span>
                </div>
              ) : isAnonymous ? (
                <button
                  onClick={onLoginClick}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <span>👻</span>
                  <span>Guest</span>
                </button>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                >
                  <span>🔑</span>
                  <span>Sign In</span>
                </button>
              )}
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
                  className={`flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl transition-colors font-medium
                    ${currentView === view
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
                    }`}
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
              <button
                onClick={toggle}
                className="flex items-center gap-2 w-full text-left px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-sm"
              >
                🌐 {lang === 'zh' ? 'Switch to English' : '切换中文'}
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
              <a href="mailto:vivicui@gmail.com" className="hover:text-purple-500 transition-colors">✉️ Contact</a>
              <a href="https://twitter.com/viviancuicui" target="_blank" rel="noopener noreferrer" className="hover:text-purple-500 transition-colors">🐦 @viviancuicui</a>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span>© 2026 MoodCat</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
