import { useState, useEffect, useRef } from 'react';
import { useLang } from '../lib/i18n';

interface DMProps {
  myUserId: string;
  partner: { id: string; username?: string; display_name?: string };
  onClose: () => void;
}

export function DirectMessage({ myUserId, partner, onClose }: DMProps) {
  const { lang } = useLang();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const partnerName = partner.display_name || partner.username || '用户';

  const load = async () => {
    const res = await fetch(`/api/social/messages?user_id=${myUserId}&with=${partner.id}`);
    const d = await res.json();
    setMessages(d.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000); // poll every 5s
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUserId, partner.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/social/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_user_id: myUserId, to_user_id: partner.id, content: text.trim() }),
      });
      const d = await res.json();
      if (res.ok && d.data) {
        setMessages(prev => [...prev, d.data]);
        setText('');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl flex flex-col shadow-2xl"
        style={{ height: '80vh', maxHeight: '600px' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
            {partnerName[0]}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm">{partnerName}</p>
            <p className="text-xs text-gray-400">{lang === 'zh' ? '私信' : 'Direct Message'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {loading ? (
            <div className="text-center text-gray-400 text-sm py-8">
              {lang === 'zh' ? '加载中...' : 'Loading...'}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8 space-y-2">
              <div className="text-3xl">💬</div>
              <p>{lang === 'zh' ? `和 ${partnerName} 说点什么吧` : `Say something to ${partnerName}`}</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMine = msg.from_user_id === myUserId;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${isMine
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-50 rounded-bl-sm'
                    }`}>
                    {msg.content}
                    <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'en', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={lang === 'zh' ? '发消息...' : 'Message...'}
            maxLength={1000}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-purple-400 outline-none"
          />
          <button
            onClick={send}
            disabled={sending || !text.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {sending ? '...' : (lang === 'zh' ? '发送' : 'Send')}
          </button>
        </div>
      </div>
    </div>
  );
}
