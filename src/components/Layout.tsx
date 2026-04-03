import React from 'react';
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

// Bottom tab items (most important 5)
const BOTTOM_TABS = (lang: string) => [
  { view: 'mood',       emoji: '💭', label: lang === 'zh' ? '发现' : 'Discover' },
  { view: 'treehouse',  emoji: '🌳', label: lang === 'zh' ? '树洞' : 'Confess' },
  { view: 'upload',     emoji: '🐱', label: lang === 'zh' ? '上传' : 'Upload' },
  { view: 'same-mood',  emoji: '🤝', label: lang === 'zh' ? '同频' : 'Vibe' },
  { view: 'collection', emoji: '🗂️', label: lang === 'zh' ? '我的' : 'Mine' },
];

// Secondary nav (accessible from top)
const MORE_TABS = (lang: string) => [
  { view: 'calendar',  emoji: '📅', label: lang === 'zh' ? '日历' : 'Calendar' },
  { view: 'lootbox',   emoji: '📦', label: lang === 'zh' ? '盲盒' : 'Loot Box' },
];

export const Layout: React.FC<LayoutProps> = ({
  children, onNavigate, currentView, user, username, isAnonymous,
  onLoginClick, onLogout, onOpenInbox,
}) => {
  const { lang, toggle } = useLang();
  const displayName = username || (user?.email && !user.email.includes('-') ? user.email.split('@')[0] : null) || 'Me';
  const bottomTabs = BOTTOM_TABS(lang);
  const moreTabs = MORE_TABS(lang);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff5f7 0%, #fdf4ff 50%, #f0f4ff 100%)' }}>

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <button onClick={() => onNavigate?.('mood')} className="flex items-center gap-1.5">
            <span className="text-2xl">🐱</span>
            <span className="text-lg font-black" style={{ background: 'linear-gradient(90deg, #e879a0, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MoodCat
            </span>
          </button>

          {/* Secondary tabs — calendar, lootbox */}
          <div className="hidden sm:flex items-center gap-1">
            {moreTabs.map(({ view, emoji, label }) => (
              <button key={view} onClick={() => onNavigate?.(view)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${currentView === view
                    ? 'bg-pink-100 text-pink-600'
                    : 'text-gray-500 hover:bg-gray-100'}`}>
                {emoji} {label}
              </button>
            ))}
          </div>

          {/* Right: lang + user actions */}
          <div className="flex items-center gap-1.5">
            <button onClick={toggle}
              className="px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500 transition-all">
              {lang === 'zh' ? 'EN' : '中'}
            </button>

            {user ? (
              <>
                <NotificationBell userId={user.id!} />
                <button onClick={onOpenInbox}
                  className="p-1.5 rounded-full hover:bg-pink-50 transition-colors text-lg">
                  💬
                </button>
                <button onClick={onLogout}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-opacity">
                  {displayName[0].toUpperCase()}
                </button>
              </>
            ) : (
              <button onClick={onLoginClick}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-opacity shadow-sm shadow-pink-200">
                {lang === 'zh' ? '登录' : 'Sign In'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 pb-24">
        {children}
      </main>

      {/* ── Bottom tab bar (mobile-first, always visible) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-pink-100 safe-area-pb">
        <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-2">
          {bottomTabs.map(({ view, emoji, label }) => {
            const isActive = currentView === view;
            return (
              <button key={view} onClick={() => onNavigate?.(view)}
                className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all min-w-0"
                style={isActive ? { background: 'linear-gradient(135deg, #fce7f3, #ede9fe)' } : {}}>
                <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>{emoji}</span>
                <span className={`text-[10px] font-semibold truncate transition-colors
                  ${isActive ? 'text-pink-600' : 'text-gray-400'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
