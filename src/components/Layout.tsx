import React, { useState } from 'react';
import { useLang } from '../lib/i18n';
import { NotificationBell } from './NotificationBell';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate?: (view: string) => void;
  currentView?: string;
  user?: { email?: string; id?: string } | null;
  username?: string | null;
  isAnonymous?: boolean;
  onLoginClick?: () => void;
  onLogout?: () => void;
  onOpenInbox?: () => void;
  unreadMessages?: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, currentView, user, username, isAnonymous, onLoginClick, onLogout, onOpenInbox, unreadMessages = 0 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, toggle } = useLang();

  // 核心导航 - 精简到最重要的
  const navItems = [
    { view: 'mood',       emoji: '💭', label: lang === 'zh' ? '心情匹配' : 'Mood Match' },
    { view: 'upload',     emoji: '🐱', label: lang === 'zh' ? '分析猫咪' : 'Analyze' },
    { view: 'calendar',   emoji: '📅', label: lang === 'zh' ? '日历' : 'Calendar' },
    { view: 'collection', emoji: '🗂️', label: lang === 'zh' ? '图鉴' : 'Collection' },
    { view: 'lootbox',    emoji: '📦', label: lang === 'zh' ? '盲盒' : 'Loot Box' },
    { view: 'same-mood',  emoji: '🤝', label: lang === 'zh' ? '同心情' : 'Same Mood' },
  ];

  // 显示名称：优先 username，其次 email @ 前缀，最后 Me
  const displayName = username || (user?.email && !user.email.includes('-') ? user.email.split('@')[0] : null) || 'Me';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-purple-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <button onClick={() => onNavigate?.('mood')} className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
              <span className="text-xl">🐱</span>
              <span className="text-base font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                MoodCat
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(({ view, emoji, label }) => (
                <button
                  key={view}
                  onClick={() => onNavigate?.(view)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap
                    ${currentView === view
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 hover:text-purple-600'
                    }`}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* Right side: lang + user */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <button
                onClick={toggle}
                className="px-2.5 py-1.5 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-400 hover:text-purple-600 transition-all"
              >
                {lang === 'zh' ? 'EN' : '中文'}
              </button>

              {user ? (
                <div className="flex items-center gap-1">
                  <NotificationBell userId={user.id!} />
                  {/* Messages inbox button */}
                  <button
                    onClick={onOpenInbox}
                    className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Messages"
                  >
                    <span className="text-xl">💬</span>
                    {unreadMessages > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </button>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-full text-xs font-medium text-purple-600 dark:text-purple-400">
                    <span>👤</span>
                    <span>{displayName}</span>
                  </div>
                  {onLogout && (
                    <button onClick={onLogout} className="px-2.5 py-1.5 rounded-full text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      退出
                    </button>
                  )}
                </div>
              ) : isAnonymous ? (
                <button onClick={onLoginClick} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-all">
                  <span>👻</span><span>Guest</span>
                </button>
              ) : (
                <button onClick={onLoginClick} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-500 text-white hover:bg-purple-600 transition-colors">
                  <span>🔑</span><span>Sign In</span>
                </button>
              )}

              <a href="https://github.com/smartcatmog/cat-emotion-detector" target="_blank" rel="noopener noreferrer"
                className="hidden flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity">
                ⭐ Star
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu">
              <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden pb-4 space-y-1">
              {navItems.map(({ view, emoji, label }) => (
                <button key={view} onClick={() => { onNavigate?.(view); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl transition-colors font-medium
                    ${currentView === view ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700' : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'}`}>
                  <span>{emoji}</span><span>{label}</span>
                </button>
              ))}
              <div className="flex items-center gap-2 px-4 py-2">
                <button onClick={toggle} className="text-sm text-gray-500 hover:text-purple-500">
                  🌐 {lang === 'zh' ? 'Switch to English' : '切换中文'}
                </button>
              </div>
              {user ? (
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-sm text-purple-600 font-medium">👤 {displayName}</span>
                  {onLogout && <button onClick={onLogout} className="text-sm text-red-400 hover:text-red-600">退出</button>}
                </div>
              ) : (
                <button onClick={() => { onLoginClick?.(); setMobileMenuOpen(false); }}
                  className="w-full mx-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-semibold hover:bg-purple-600 transition-colors" style={{width: 'calc(100% - 2rem)'}}>
                  🔑 登录 / 注册
                </button>
              )}
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐱</span>
              <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">MoodCat</span>
              <span className="text-gray-400 text-sm">— AI-powered cat emotion detector</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <button onClick={() => onNavigate?.('privacy')} className="hover:text-purple-500 transition-colors">🔒 Privacy</button>
              <a href="mailto:vivicui@gmail.com" className="hover:text-purple-500 transition-colors">✉️ Contact</a>
              <a href="https://twitter.com/viviancuicui" target="_blank" rel="noopener noreferrer" className="hover:text-purple-500 transition-colors">🐦 @viviancuicui</a>
              <span>© 2026 MoodCat</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
