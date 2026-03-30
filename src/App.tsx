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

interface CatMatch {
  id: string;
  image_url: string;
  emotion_label: string;
  description: string;
  pet_name: string | null;
  social_link: string | null;
}

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

async function callClaude(base64: string, mediaType: string, petName?: string, socialLink?: string) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (apiKey) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
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
    if (!jsonMatch) throw new Error('Unable to parse analysis result');
    return JSON.parse(jsonMatch[0]);
  } else {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64,
        mediaType,
        save_to_gallery: true,
        pet_name: petName || null,
        social_link: socialLink || null,
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
  const [petName, setPetName] = useState('');
  const [socialLink, setSocialLink] = useState('');

  // Mood match state
  const [moodText, setMoodText] = useState('');
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodError, setMoodError] = useState<string | null>(null);
  const [matchedCats, setMatchedCats] = useState<CatMatch[]>([]);
  const [matchedEmotion, setMatchedEmotion] = useState('');
  const [matchReasoning, setMatchReasoning] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/privacy') setCurrentView('privacy');
    else if (path === '/history') setCurrentView('history');
    else if (path === '/mood') setCurrentView('mood');
    else setCurrentView('upload');
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const pathMap: Record<string, string> = {
      privacy: '/privacy', history: '/history', mood: '/mood', upload: '/',
    };
    const newPath = pathMap[currentView] || '/';
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
  }, [currentView]);

  const handleMoodMatch = async () => {
    if (!moodText.trim()) {
      setMoodError('Please describe your mood');
      return;
    }
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
        throw new Error('Video analysis coming soon. Please upload an image.');
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

      const claudeResult = await callClaude(base64, 'image/jpeg', petName, socialLink);

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
      setError(err instanceof Error ? err.message : 'Analysis failed, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodMatch = async () => {
    if (!moodText.trim()) {
      setMoodError('Please describe your mood');
      return;
    }
    setMoodLoading(true);
    setMoodError(null);
    setMatchedCats([]);
    setSelectedCatId(null);

    try {
      const response = await fetch('/api/mood-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood_text: moodText.trim() }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Mood matching failed');
      }

      const result = await response.json();
      setMatchedCats(result.data.cats);
      setMatchedEmotion(result.data.emotion_label);
      setMatchReasoning(result.data.reasoning);
    } catch (err) {
      setMoodError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setMoodLoading(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysisResult(null);
    setError(null);
    setPetName('');
    setSocialLink('');
    setCurrentView('upload');
  };

  const emotionEmoji: Record<string, string> = {
    happy: '😸', calm: '😺', sleepy: '😴', curious: '🐱', annoyed: '��', anxious: '🙀',
  };

  return (
    <Provider store={store}>
      <Layout onNavigate={(view) => setCurrentView(view as AppView)}>
        <div className="space-y-8">
