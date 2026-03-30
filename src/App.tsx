import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { Layout } from './components/Layout';
import { Upload } from './components/Upload';
import { Results } from './components/Results';
import { DataAnnotation } from './components/DataAnnotation';
import { Privacy } from './components/Privacy';
import { AnalysisResult } from './types';
import { saveAnalysisResult } from './lib/supabase';
import { createClient } from '@supabase/supabase-js';

type AppView = 'upload' | 'preview' | 'results' | 'history' | 'annotate' | 'privacy' | 'mood';

const PROMPT = `You are an expert in cat behavior and feline body language. Analyze the cat in this photo.

CRITICAL: The "emotion" field MUST be exactly one of these 15 values:
happy, calm, sleepy, curious, annoyed, anxious, resigned, dramatic, sassy, clingy, zoomies, suspicious, smug, confused, hangry

Return ONLY valid JSON:
{
  "emotion": "exactly one of the 15 labels",
  "confidence": 85,
  "body_language": "body language description",
  "health_note": "health observation",
  "advice": "owner advice",
  "summary": "one sentence summary",
  "description": "fun, witty one-liner about this cat's vibe"
}`;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

async function callClaude(base64: string, mediaType: string, saveToGallery: boolean, petName: string, socialLink: string) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (apiKey) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType as any, data: base64 } },
        { type: 'text', text: PROMPT },
      ]}],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Cannot parse result');
    return JSON.parse(jsonMatch[0]);
  } else {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, mediaType, save_to_gallery: saveToGallery, pet_name: petName || undefined, social_link: socialLink || undefined }),
    });
    if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Analysis failed'); }
    return response.json();
  }
}

const EMOTION_EMOJI: Record<string, string> = {
  happy: '😸', calm: '😌', sleepy: '😴', curious: '🐱', annoyed: '😾',
  anxious: '🙀', resigned: '😑', dramatic: '💀', sassy: '💅', clingy: '🥺',
  zoomies: '⚡', suspicious: '🤨', smug: '😏', confused: '😵', hangry: '🍽️',
};

function CatCard({ cat, onLike, onTip }: { cat: any; onLike: (id: string) => void; onTip: (cat: any) => void }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(cat.likes || 0);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount((n: number) => n + 1);
      onLike(cat.id);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(cat.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cat.pet_name || 'mood-cat'}-${cat.emotion_label}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(cat.image_url, '_blank');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-purple-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="relative">
        <img src={cat.image_url} alt={cat.pet_name || 'A cat'} className="w-full h-56 object-cover" />
        <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 rounded-full px-2 py-1 text-xs font-bold text-purple-600">
          {EMOTION_EMOJI[cat.emotion_label] || '🐱'} {cat.emotion_label}
        </div>
      </div>
      <div className="p-4 space-y-3">
        {cat.pet_name && <p className="font-bold text-gray-900 dark:text-gray-50 text-lg">🐱 {cat.pet_name}</p>}
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{cat.description}"</p>
        {cat.social_link && (
          <a href={cat.social_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 font-medium">
            📱 Follow the owner →
          </a>
        )}
        <div className="flex gap-2 pt-1">
          <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium transition-all ${liked ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-pink-50 hover:text-pink-500'}`}>
            {liked ? '❤️' : '🤍'} {likeCount > 0 ? likeCount : 'Like'}
          </button>
          <button onClick={() => onTip(cat)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-sm font-medium hover:bg-yellow-200 transition-colors">
            🪙 Tip
          </button>
          <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-200 transition-colors">
            ⬇️ Save
          </button>
        </div>
      </div>
    </div>
  );
}

function TipModal({ cat, onClose }: { cat: any; onClose: () => void }) {
  const [tipped, setTipped] = useState(false);
  const amounts = ['£1', '£2', '£5', '£10'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center space-y-3">
          <div className="text-4xl">🪙</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">Tip {cat.pet_name || 'this cat'}!</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Show some love to the cat owner</p>
          {!tipped ? (
            <>
              <div className="grid grid-cols-4 gap-2 pt-2">
                {amounts.map(amount => (
                  <button key={amount} onClick={() => setTipped(true)} className="py-3 bg-yellow-100 text-yellow-700 rounded-xl font-bold hover:bg-yellow-200 transition-colors">
                    {amount}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 pt-1">💡 Payment coming soon — this is a demo</p>
            </>
          ) : (
            <div className="py-4 space-y-2">
              <div className="text-3xl">🎉</div>
              <p className="font-bold text-green-600">Thank you for the tip!</p>
              <p className="text-xs text-gray-400">Payment processing coming soon</p>
            </div>
          )}
          <button onClick={onClose} className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState<AppView>('mood');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataCollectionConsent, setDataCollectionConsent] = useState(true);
  const [moodText, setMoodText] = useState('');
  const [moodResult, setMoodResult] = useState<any>(null);
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodError, setMoodError] = useState<string | null>(null);
  const [petName, setPetName] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [saveToGallery, setSaveToGallery] = useState(true);
  const [tipCat, setTipCat] = useState<any>(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/privacy') setCurrentView('privacy');
    else if (path === '/history') setCurrentView('history');
    else setCurrentView('mood');
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (currentView === 'privacy') window.history.pushState({}, '', '/privacy');
    else if (currentView === 'history') window.history.pushState({}, '', '/history');
    else window.history.pushState({}, '', '/');
  }, [currentView]);

  const handleLike = async (catId: string) => {
    if (!supabase) return;
    void supabase.rpc('increment_likes', { cat_id: catId });
  };

  const handleMoodMatch = async () => {
    if (!moodText.trim()) { setMoodError('Tell me how you feel 💭'); return; }
    setMoodLoading(true); setMoodError(null); setMoodResult(null);
    try {
      const response = await fetch('/api/mood-match', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood_text: moodText.trim() }),
      });
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Match failed'); }
      const data = await response.json();
      setMoodResult(data.data);
    } catch (err) {
      setMoodError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setMoodLoading(false); }
  };

  const handleFileSelect = (file: File, previewData: string) => {
    setSelectedFile(file); setPreview(previewData); setError(null); setCurrentView('preview');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsLoading(true); setError(null);
    try {
      if (!selectedFile.type.startsWith('image/')) throw new Error('Please upload an image file.');
      const base64 = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(selectedFile);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxSize = 1600;
          if (width > maxSize || height > maxSize) {
            if (width > height) { height = Math.round(height * maxSize / width); width = maxSize; }
            else { width = Math.round(width * maxSize / height); height = maxSize; }
          }
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
        };
        img.onerror = reject; img.src = url;
      });
      const claudeResult = await callClaude(base64, 'image/jpeg', saveToGallery, petName, socialLink);
      const result: AnalysisResult = {
        id: Math.random().toString(36).substring(2, 11), fileType: 'image',
        fileName: selectedFile.name, fileSize: selectedFile.size,
        uploadedAt: new Date().toISOString(),
        emotions: [{ type: claudeResult.emotion, confidence: claudeResult.confidence }],
        interpretation: claudeResult.summary,
        recommendations: [claudeResult.body_language, claudeResult.health_note, claudeResult.advice].filter(Boolean),
        thumbnailUrl: preview || '', originalFileUrl: preview || '',
      };
      setAnalysisResult(result); setCurrentView('results');
      if (dataCollectionConsent) {
        saveAnalysisResult({ file_name: selectedFile.name, file_type: 'image', file_size: selectedFile.size, emotion: claudeResult.emotion, confidence: claudeResult.confidence, interpretation: claudeResult.summary, recommendations: [claudeResult.body_language, claudeResult.health_note, claudeResult.advice].filter(Boolean), data_collection_consent: true }).catch(console.error);
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Analysis failed'); }
    finally { setIsLoading(false); }
  };

  const handleAnalyzeAnother = () => {
    setSelectedFile(null); setPreview(null); setAnalysisResult(null);
    setError(null); setPetName(''); setSocialLink(''); setCurrentView('mood');
  };

  return (
    <Provider store={store}>
      <Layout onNavigate={(view) => setCurrentView(view as AppView)}>
        <div className="space-y-6">

          {/* Tab Nav */}
          {(currentView === 'upload' || currentView === 'mood') && (
            <div className="flex justify-center gap-3">
              <button onClick={() => setCurrentView('mood')} className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm ${currentView === 'mood' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-50 border border-gray-200 dark:border-gray-700'}`}>
                💭 Match My Mood
              </button>
              <button onClick={() => setCurrentView('upload')} className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm ${currentView === 'upload' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-200' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 border border-gray-200 dark:border-gray-700'}`}>
                🐱 Analyze My Cat
              </button>
            </div>
          )}

          {/* Mood Match View */}
          {currentView === 'mood' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">How are you feeling?</h2>
                <p className="text-gray-500 dark:text-gray-400">Tell us your mood — we'll find the cat that gets you 🐾</p>
              </div>
              <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4 border border-purple-100 dark:border-gray-700">
                <textarea value={moodText} onChange={(e) => setMoodText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleMoodMatch(); }}} placeholder="I'm exhausted and done with everything... / 今天心情很烦躁..." className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 resize-none focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none" rows={3} />
                {moodError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{moodError}</p>}
                <button onClick={handleMoodMatch} disabled={moodLoading} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-200 dark:shadow-none">
                  {moodLoading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Finding your cat...</>) : '🔮 Find My Mood Cat'}
                </button>
              </div>

              {moodResult && (
                <div className="max-w-3xl mx-auto space-y-5">
                  <div className="text-center">
                    <span className="inline-block px-5 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">
                      {EMOTION_EMOJI[moodResult.emotion_label] || '🐱'} Your vibe: <strong>{moodResult.emotion_label}</strong> — {moodResult.reasoning}
                    </span>
                  </div>
                  {moodResult.cats.length === 0 ? (
                    <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl shadow border border-dashed border-purple-200 dark:border-gray-700">
                      <div className="text-5xl mb-3">🐱</div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">No cats match this mood yet.</p>
                      <p className="text-sm text-gray-400 mt-1">Be the first to upload one!</p>
                      <button onClick={() => setCurrentView('upload')} className="mt-4 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-200 dark:shadow-none">
                        Upload a Cat Photo
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {moodResult.cats.map((cat: any) => (
                        <CatCard key={cat.id} cat={cat} onLike={handleLike} onTip={setTipCat} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upload View */}
          {currentView === 'upload' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">How is your cat feeling?</h2>
                <p className="text-gray-500 dark:text-gray-400">Upload a photo and AI will decode your cat's mood 🔍</p>
              </div>
              <Upload onFileSelect={handleFileSelect} />
            </div>
          )}

          {/* Preview View */}
          {currentView === 'preview' && selectedFile && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Ready to analyze?</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Review your photo before we read your cat's mind</p>
              </div>
              <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-5 border border-blue-100 dark:border-gray-700">
                <img src={preview || ''} alt="Preview" className="w-full h-auto rounded-xl max-h-[80vh] object-contain bg-gray-50 dark:bg-gray-900" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                    <p className="text-gray-400 text-xs mb-1">File name</p>
                    <p className="font-medium text-gray-900 dark:text-gray-50 truncate">{selectedFile.name}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                    <p className="text-gray-400 text-xs mb-1">File size</p>
                    <p className="font-medium text-gray-900 dark:text-gray-50">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={saveToGallery} onChange={(e) => setSaveToGallery(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-400" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">✨ Add to mood gallery (help others find their cat match)</span>
                  </label>
                  {saveToGallery && (
                    <div className="space-y-2 pl-7">
                      <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="Your cat's name (optional)" className="w-full px-3 py-2 text-sm border border-purple-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-purple-400 outline-none" />
                      <input type="text" value={socialLink} onChange={(e) => setSocialLink(e.target.value)} placeholder="Your social media link (optional)" className="w-full px-3 py-2 text-sm border border-purple-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-purple-400 outline-none" />
                    </div>
                  )}
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={dataCollectionConsent} onChange={(e) => setDataCollectionConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">I consent to anonymous data collection to help improve the model</span>
                </label>
                {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={handleAnalyzeAnother} disabled={isLoading} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50">Cancel</button>
                  <button onClick={handleAnalyze} disabled={isLoading} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none">
                    {isLoading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing...</>) : '🔍 Analyze'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentView === 'results' && analysisResult && (
            <Results result={analysisResult} onAnalyzeAnother={handleAnalyzeAnother} onViewHistory={() => setCurrentView('history')} />
          )}

          {currentView === 'history' && (
            <div className="text-center space-y-4 py-10">
              <div className="text-5xl">📚</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">History</h2>
              <p className="text-gray-500">Coming soon</p>
              <button onClick={handleAnalyzeAnother} className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">Back to Home</button>
            </div>
          )}

          {currentView === 'annotate' && <DataAnnotation />}
          {currentView === 'privacy' && <Privacy />}
        </div>

        {tipCat && <TipModal cat={tipCat} onClose={() => setTipCat(null)} />}
      </Layout>
    </Provider>
  );
}

export default App;
