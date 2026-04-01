import { useState } from 'react';
import { signIn, signUp, supabase } from '../lib/supabase';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onAnonymous: () => void;
}

export function LoginModal({ onClose, onSuccess, onAnonymous }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateUsername = (v: string) => /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && !validateUsername(username)) {
      setError('用户名 2-20 字符，支持中文、英文、数字、下划线');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const data = await signUp(email, password);
        if (data.user) {
          // 创建用户 profile，用户名重复由数据库 UNIQUE 约束处理
          const { error: insertError } = await supabase.from('users').insert({
            id: data.user.id,
            email,
            username,
            display_name: username,
          });
          if (insertError?.code === '23505') {
            setError('用户名已被占用，换一个试试');
            return;
          }
          onSuccess();
        } else {
          setError('注册成功！请直接登录');
          setMode('login');
        }
      } else {
        await signIn(email, password);
        onSuccess();
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) setError('邮箱或密码错误');
      else if (msg.includes('User already registered')) { setError('该邮箱已注册，请直接登录'); setMode('login'); }
      else setError(msg || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {mode === 'login' ? '欢迎回来 👋' : '创建账号 🐱'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {mode === 'login' ? '登录解锁日历、图鉴、盲盒等功能' : '注册后解锁全部社交功能'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  用户名 <span className="text-gray-400 font-normal">（支持中文/英文，2-20字符）</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="例如：快乐猫咪 / happycat"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-purple-400 outline-none"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-purple-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                密码 <span className="text-gray-400 font-normal">（至少6位）</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-purple-400 outline-none"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-sm text-purple-500 hover:text-purple-700 font-medium"
            >
              {mode === 'login' ? '没有账号？点击注册' : '已有账号？点击登录'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">或者</span>
            </div>
          </div>

          <button
            onClick={onAnonymous}
            className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            👻 游客模式（基础功能）
          </button>

          <button onClick={onClose} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
