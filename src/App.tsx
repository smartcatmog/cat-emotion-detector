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

type AppView = 'upload' | 'preview' | 'results' | 'history' | 'annotate' | 'privacy' | 'mood';

const PROMPT = `You are an expert in cat behavior and feline body language. Analyze the cat in this photo and provide:
1) Current emotional state (e.g. relaxed, alert, fearful, content, irritated)
2) Key body language signals (ears, eyes, tail, body posture)
3) Health notes (flag anything unusual)
4) Owner advice (what should the owner do right now)

Be friendly and concise. Max two sentences per item.

Return ONLY valid JSON in this exact format:
{
  "emotion": "one word emotion",
  "confidence": 85,
  "body_language": "body language description",
  "health_note": "health observation",
  "advice": "owner advice",
  "summary": "one sentence summary"
}`;

async function callClaude(base64: string, mediaType: string, saveToGallery: boolean, petName: string, socialLink: string) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (apiKey) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType as any, data: base64 } },
          { type: 'text', text: PROMPT },
        ],
      }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Cannot parse result');
    return JSON.parse(jsonMatch[0]);
  } else {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64,
        mediaType,
        save_to_gallery: saveToGallery,
        pet_name: petName || undefined,
        social_link: socialLink || undefined,
      }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Analysis failed');
    }
    return response.json();
  }
}

function App() {
  const [currentView, setCurrentView] = useState<AppView>('upload');
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

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/privacy') setCurrentView('privacy');
    else if (path === '/history') setCurrentView('history');
    else setCurrentView('upload');
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (currentView === 'privacy') window.history.pushState({}, '', '/privacy');
    else if (currentView === 'history') window.history.pushState({}, '', '/history');
    else if (currentView === 'upload' || currentView === 'mood') window.history.pushState({}, '', '/');
  }, [currentView]);

  const handleMoodMatch = async () => {
    if (!moodText.trim()) { setMoodError('Please describe your mood'); return; }
    setMoodLoading(true);
    setMoodError(null);
    setMoodResult(null);
    try {
      const response = await fetch('/api/mood-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood_text: moodText.trim() }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Match failed');
      }
      const data = await response.json();
      setMoodResult(data.data);
    } catch (err) {
      setMoodError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setMoodLoading(false);
    }
  };

  const handleFileSelect = (file: File, previewData: string) => {
    setSelectedFile(file);
    setPreview(previewData);
    setError(null);
    setCurrentView('preview');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    try {
      if (!selectedFile.type.startsWith('image/')) {
        throw new Error('Please upload an image file.');
      }
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
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          URL.revokeObjectURL(url);
          resolve(dataUrl.split(',')[1]);
        };
        img.onerror = reject;
        img.src = url;
      });

      const claudeResult = await callClaude(base64, 'image/jpeg', saveToGallery, petName, socialLink);

      const result: AnalysisResult = {
        id: Math.random().toString(36).substring(2, 11),
        fileType: 'image',
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        uploadedAt: new Date().toISOString(),
        emotions: [{ type: claudeResult.emotion, confidence: claudeResult.confidence }],
        interpretation: claudeResult.summary,
        recommendations: [claudeResult.body_language, claudeResult.health_note, claudeResult.advice].filter(Boolean),
        thumbnailUrl: preview || '',
        originalFileUrl: preview || '',
      };
      setAnalysisResult(result);
      setCurrentView('results');

      if (dataCollectionConsent) {
        saveAnalysisResult({
          file_name: selectedFile.name, file_type: 'image', file_size: selectedFile.size,
          emotion: claudeResult.emotion, confidence: claudeResult.confidence,
          interpretation: claudeResult.summary,
          recommendations: [claudeResult.body_language, claudeResult.health_note, claudeResult.advice].filter(Boolean),
          data_collection_consent: true,
        }).catch(console.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setSelectedFile(null); setPreview(null); setAnalysisResult(null);
    setError(null); setPetName(''); setSocialLink('');
    setCurrentView('upload');
  };

  return (
    <Provider store={store}>
      <Layout onNavigate={(view) => setCurrentView(view as AppView)}>
        <div className="space-y-8">

          {/* Tab Navigation */}
          {(currentView === 'upload' || currentView === 'mood') && (
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setCurrentView('upload')}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${currentView === 'upload' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
              >
                🐱 Analyze Cat
              </button>
              <button
                onClick={() => setCurrentView('mood')}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${currentView === 'mood' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
              >
                💭 Match My Mood
              </button>
            </div>
          )}

          {/* Upload View */}
          {currentView === 'upload' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">How is your cat feeling?</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Upload a photo and AI will read your cat's mood</p>
              </div>
              <Upload onFileSelect={handleFileSelect} />
            </div>
          )}

          {/* Preview View */}
          {currentView === 'preview' && selectedFile && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Preview</h2>
                <p className="text-gray-600 dark:text-gray-400">Review your photo before analysis</p>
              </div>
              <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
                <img src={preview || ''} alt="Preview" className="w-full h-auto rounded-lg max-h-[80vh] object-contain" />
                <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">File name</p>
                    <p className="font-medium text-gray-900 dark:text-gray-50 truncate">{selectedFile.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">File size</p>
                    <p className="font-medium text-gray-900 dark:text-gray-50">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>

                {/* Gallery options */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={saveToGallery} onChange={(e) => setSaveToGallery(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Add to cat gallery (help others find mood-matching cats)</span>
                  </label>
                  {saveToGallery && (
                    <div className="space-y-2 pl-7">
                      <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="Your cat's name (optional)" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50" />
                      <input type="text" value={socialLink} onChange={(e) => setSocialLink(e.target.value)} placeholder="Your social media link (optional)" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50" />
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={dataCollectionConsent} onChange={(e) => setDataCollectionConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">I consent to anonymous data collection to help improve the model</span>
                  </label>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <button onClick={handleAnalyzeAnother} disabled={isLoading} className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">Choose Another</button>
                  <button onClick={handleAnalyze} disabled={isLoading} className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isLoading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing...</>) : 'Analyze'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results View */}
          {currentView === 'results' && analysisResult && (
            <Results result={analysisResult} onAnalyzeAnother={handleAnalyzeAnother} onViewHistory={() => setCurrentView('history')} />
          )}

          {/* Mood Match View */}
          {currentView === 'mood' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">How are you feeling?</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Tell us your mood and we'll find a cat that gets you</p>
              </div>
              <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
                <textarea value={moodText} onChange={(e) => setMoodText(e.target.value)} placeholder="I'm feeling exhausted today... / 今天心情很烦躁..." className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" rows={3} />
                {moodError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{moodError}</p>
                  </div>
                )}
                <button onClick={handleMoodMatch} disabled={moodLoading} className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {moodLoading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Finding your cat...</>) : '🔮 Find My Mood Cat'}
                </button>
              </div>
              {moodResult && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="text-center">
                    <span className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Your mood: {moodResult.emotion_label} — {moodResult.reasoning}</span>
                  </div>
                  {moodResult.cats.length === 0 ? (
                    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                      <p className="text-gray-600 dark:text-gray-400">No matching cats yet. Be the first to upload one!</p>
                      <button onClick={() => setCurrentView('upload')} className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">Upload a Cat Photo</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {moodResult.cats.map((cat: any) => (
                        <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                          <img src={cat.image_url} alt={cat.pet_name || 'A cat'} className="w-full h-auto object-contain max-h-64" />
                          <div className="p-3 space-y-1">
                            {cat.pet_name && <p className="font-medium text-gray-900 dark:text-gray-50">🐱 {cat.pet_name}</p>}
                            <p className="text-sm text-gray-600 dark:text-gray-400">{cat.description}</p>
                            {cat.social_link && <a href={cat.social_link} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-500 hover:text-purple-700">Follow the owner →</a>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Other Views */}
          {currentView === 'history' && (
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">History</h2>
              <p className="text-gray-600 dark:text-gray-400">Coming soon</p>
              <button onClick={handleAnalyzeAnother} className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">Back to Upload</button>
            </div>
          )}

          {currentView === 'annotate' && <DataAnnotation />}
          {currentView === 'privacy' && <Privacy />}

        </div>
      </Layout>
    </Provider>
  );
}

export default App;
