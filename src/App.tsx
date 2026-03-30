import { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { Layout } from './components/Layout';
import { Upload } from './components/Upload';
import { Results } from './components/Results';
import { DataAnnotation } from './components/DataAnnotation';
import { AnalysisResult } from './types';
import { saveAnalysisResult } from './lib/supabase';

type AppView = 'upload' | 'preview' | 'results' | 'history' | 'annotate';

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

async function callClaude(base64: string, mediaType: string) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (apiKey) {
    // 本地开发：直接调用 Claude API
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: base64,
            },
          },
          { type: 'text', text: PROMPT },
        ],
      }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('无法解析分析结果');
    return JSON.parse(jsonMatch[0]);
  } else {
    // 生产环境：通过 Vercel Edge Function
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, mediaType }),
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
        throw new Error('视频分析即将上线，请先上传图片。');
      }

      // 压缩图片到 4MB 以内
      const base64 = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(selectedFile);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          // 缩放到最大 1600px
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

      const claudeResult = await callClaude(base64, 'image/jpeg');

      const result: AnalysisResult = {
        id: Math.random().toString(36).substring(2, 11),
        fileType: 'image',
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        uploadedAt: new Date().toISOString(),
        emotions: [{ type: claudeResult.emotion, confidence: claudeResult.confidence }],
        interpretation: claudeResult.summary,
        recommendations: [
          claudeResult.body_language,
          claudeResult.health_note,
          claudeResult.advice,
        ].filter(Boolean),
        thumbnailUrl: preview || '',
        originalFileUrl: preview || '',
      };

      setAnalysisResult(result);
      setCurrentView('results');

      if (dataCollectionConsent) {
        saveAnalysisResult({
          file_name: selectedFile.name,
          file_type: 'image',
          file_size: selectedFile.size,
          emotion: claudeResult.emotion,
          confidence: claudeResult.confidence,
          interpretation: claudeResult.summary,
          recommendations: [claudeResult.body_language, claudeResult.health_note, claudeResult.advice].filter(Boolean),
          data_collection_consent: true,
        }).catch(console.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysisResult(null);
    setError(null);
    setCurrentView('upload');
  };

  return (
    <Provider store={store}>
      <Layout>
        <div className="space-y-8">
          {currentView === 'upload' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                  How is your cat feeling?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Upload a photo and AI will read your cat's mood
                </p>
              </div>
              <Upload onFileSelect={handleFileSelect} />
            </div>
          )}

          {currentView === 'preview' && selectedFile && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Preview</h2>
                <p className="text-gray-600 dark:text-gray-400">Review your photo before analysis</p>
              </div>

              <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
                <img
                  src={preview || ''}
                  alt="Preview"
                  className="w-full h-auto rounded-lg max-h-96 object-cover"
                />

                <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">File name</p>
                    <p className="font-medium text-gray-900 dark:text-gray-50 truncate">{selectedFile.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">File size</p>
                    <p className="font-medium text-gray-900 dark:text-gray-50">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dataCollectionConsent}
                      onChange={(e) => setDataCollectionConsent(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      I consent to anonymous data collection to help improve the model
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <button
                    onClick={handleAnalyzeAnother}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Choose Another
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentView === 'results' && analysisResult && (
            <Results
              result={analysisResult}
              onAnalyzeAnother={handleAnalyzeAnother}
              onViewHistory={() => setCurrentView('history')}
            />
          )}

          {currentView === 'history' && (
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">History</h2>
              <p className="text-gray-600 dark:text-gray-400">Coming soon</p>
              <button
                onClick={handleAnalyzeAnother}
                className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Back to Upload
              </button>
            </div>
          )}

          {currentView === 'annotate' && <DataAnnotation />}
        </div>
      </Layout>
    </Provider>
  );
}

export default App;
