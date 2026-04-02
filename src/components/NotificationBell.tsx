import { useState, useEffect, useRef } from 'react';
import { useLang } from '../lib/i18n';

const RARITY_COLOR: Record<string, string> = {
  legendary: 'text-yellow-500',
  epic: 'text-purple-500',
  rare: 'text-blue-500',
};

const TYPE_ICON: Record<string, string> = {
  like: '❤️',
  collect: '🗂️',
  resonance: '😸',
  badge: '🏅',
};

export function NotificationBell({ userId }: { userId: string }) {
  const { lang } = useLang();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.is_read).length;

  const load = () => {
    fetch(`/api/social/notify?user_id=${userId}`)
      .then(r => r.json())
      .then(d => setNotifs(d.data || []));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await fetch('/api/social/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(v => !v); if (!open && unread > 0) markAllRead(); }}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-gray-50 text-sm">
              {lang === 'zh' ? '通知' : 'Notifications'}
            </span>
            {notifs.length > 0 && (
              <button onClick={markAllRead} className="text-xs text-purple-500 hover:text-purple-700">
                {lang === 'zh' ? '全部已读' : 'Mark all read'}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                {lang === 'zh' ? '暂无通知' : 'No notifications yet'}
              </div>
            ) : (
              notifs.map(n => (
                <div key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 flex gap-3 items-start
                    ${!n.is_read ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}>
                  <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICON[n.type] || '📢'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50 leading-snug">{n.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.created_at).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1.5" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
