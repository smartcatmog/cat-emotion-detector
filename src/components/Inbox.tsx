import { useState, useEffect } from 'react';
import { useLang } from '../lib/i18n';
import { DirectMessage } from './DirectMessage';

interface InboxProps {
  myUserId: string;
  initialPartnerId?: string; // open a specific conversation directly
  onClose: () => void;
}

export function Inbox({ myUserId, initialPartnerId, onClose }: InboxProps) {
  const { lang } = useLang();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPartner, setOpenPartner] = useState<any | null>(null);

  const load = async () => {
    const res = await fetch(`/api/social/messages?user_id=${myUserId}`);
    const d = await res.json();
    const convs = d.data || [];
    setConversations(convs);
    setLoading(false);

    // Auto-open if initialPartnerId provided
    if (initialPartnerId && !openPartner) {
      const found = convs.find((c: any) => c.partner_id === initialPartnerId);
      if (found) setOpenPartner(found.partner);
      else setOpenPartner({ id: initialPartnerId });
    }
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUserId]);

  if (openPartner) {
    return (
      <DirectMessage
        myUserId={myUserId}
        partner={openPartner}
        onClose={() => { setOpenPartner(null); load(); }}
      />
    );
  }

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl flex flex-col shadow-2xl"
        style={{ height: '70vh', maxHeight: '500px' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-50">
              💬 {lang === 'zh' ? '消息' : 'Messages'}
            </h3>
            {totalUnread > 0 && (
              <p className="text-xs text-purple-500">{totalUnread} {lang === 'zh' ? '条未读' : 'unread'}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">✕</button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center text-gray-400 text-sm py-8">{lang === 'zh' ? '加载中...' : 'Loading...'}</div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-12 space-y-2">
              <div className="text-4xl">💬</div>
              <p>{lang === 'zh' ? '还没有消息' : 'No messages yet'}</p>
              <p className="text-xs">{lang === 'zh' ? '去同心情广场找人聊聊吧' : 'Go to Same Mood Plaza to connect'}</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.partner_id}
                onClick={() => setOpenPartner(conv.partner)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(conv.partner?.display_name || conv.partner?.username || '?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-gray-50 text-sm">
                      {conv.partner?.display_name || conv.partner?.username || '用户'}
                    </p>
                    <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {new Date(conv.created_at).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {conv.from_user_id === myUserId ? (lang === 'zh' ? '你：' : 'You: ') : ''}{conv.content}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
