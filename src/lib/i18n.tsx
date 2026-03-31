import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'en' | 'zh';

const LangContext = createContext<{ lang: Lang; toggle: () => void }>({
  lang: 'en',
  toggle: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() =>
    (localStorage.getItem('lang') as Lang) || 'en'
  );
  const toggle = () => {
    const next: Lang = lang === 'en' ? 'zh' : 'en';
    setLang(next);
    localStorage.setItem('lang', next);
  };
  return <LangContext.Provider value={{ lang, toggle }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

// All UI strings
export const t = {
  // Nav
  moodMatch:    { en: 'Mood Match', zh: '心情匹配' },
  analyze:      { en: 'Analyze', zh: '分析猫咪' },
  calendar:     { en: 'Calendar', zh: '日历' },
  collection:   { en: 'Collection', zh: '图鉴' },
  lootbox:      { en: 'Loot Box', zh: '盲盒' },
  sameMood:     { en: 'Same Mood', zh: '同心情' },
  signIn:       { en: 'Sign In', zh: '登录' },
  guest:        { en: 'Guest', zh: '游客' },

  // Home
  howFeeling:   { en: 'How are you feeling?', zh: '你今天心情怎么样？' },
  moodSubtitle: { en: "Tell us your mood — we'll find the cat that gets you 🐾", zh: '告诉我们你的心情，我们帮你找到懂你的猫 🐾' },
  moodPlaceholder: { en: "I'm exhausted and done with everything...", zh: '今天心情很烦躁... / I feel exhausted...' },
  findCat:      { en: '🔮 Find My Mood Cat', zh: '🔮 找到我的心情猫' },
  findingCat:   { en: 'Finding your cat...', zh: '寻找中...' },

  // Calendar
  calendarTitle:  { en: 'Mood Calendar', zh: '情绪日历' },
  streakDays:     { en: (n: number) => `🔥 ${n} day streak`, zh: (n: number) => `🔥 已连续记录 ${n} 天` },
  calendarHint:   { en: 'Auto check-in after each mood match', zh: '每次心情匹配后自动打卡记录' },
  manualCheckin:  { en: "Haven't checked in today? Pick a mood:", zh: '今天还没打卡？选一个心情手动记录：' },

  // Collection
  collectionTitle: { en: 'Collection', zh: '情绪图鉴' },
  collectionSub:   { en: (u: number, t: number, total: number) => `Unlocked ${u}/${t} emotions · ${total} collected`, zh: (u: number, t: number, total: number) => `已解锁 ${u}/${t} 种情绪 · 共收集 ${total} 张` },

  // Lootbox
  lootboxTitle:   { en: 'Loot Box', zh: '情绪盲盒' },
  lootboxSub:     { en: 'Get a box every check-in · Keep forever', zh: '每次打卡获得一个盲盒 · 永久收藏' },
  unopened:       { en: 'Unopened', zh: '未开启' },
  openedHistory:  { en: 'History', zh: '已开启历史' },
  openBtn:        { en: 'Open', zh: '开启' },
  opening:        { en: 'Opening...', zh: '开启中...' },
  noBoxes:        { en: 'No boxes yet — check in to get one', zh: '暂无盲盒，打卡后自动获得' },
  openSuccess:    { en: '🎉 Box opened!', zh: '🎉 开盒成功！' },
  addedToCollection: { en: 'Added to your collection ✓', zh: '已自动加入你的图鉴 ✓' },

  // Same mood
  sameMoodTitle:  { en: 'Same Mood Plaza', zh: '同心情广场' },
  sameMoodSub:    { en: "Find people who feel the same today", zh: '找到今天和你一样心情的人' },
  pickMood:       { en: "Pick today's mood:", zh: '选择今天的心情：' },
  sameMoodCount:  { en: (n: number, e: string) => `${n} people feel ${e} today`, zh: (n: number, e: string) => `今天有 ${n} 人和你一样感到 ${e}` },
  firstPerson:    { en: (e: string) => `You're the first ${e} person today`, zh: (e: string) => `你是今天第一个 ${e} 的人` },
  checkinFirst:   { en: 'Check in first, then wait for others', zh: '先去打卡，等待同心情的朋友出现' },

  // Login
  welcomeBack:    { en: 'Welcome back 👋', zh: '欢迎回来 👋' },
  createAccount:  { en: 'Create account 🐱', zh: '创建账号 🐱' },
  loginSub:       { en: 'Sign in to unlock calendar, collection & more', zh: '登录解锁日历、图鉴、盲盒等功能' },
  signupSub:      { en: 'Sign up to unlock all social features', zh: '注册后解锁全部社交功能' },
  continueGuest:  { en: '👻 Continue as Guest', zh: '👻 游客模式（基础功能）' },
  noAccount:      { en: "No account? Sign up", zh: '没有账号？点击注册' },
  hasAccount:     { en: 'Already have an account? Sign in', zh: '已有账号？点击登录' },
};
