import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Some features will be disabled.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Analysis result type
export interface AnalysisRecord {
  id: string;
  user_id?: string;
  file_name: string;
  file_type: 'image' | 'video';
  file_size: number;
  emotion: string;
  confidence: number;
  interpretation: string;
  recommendations: string[];
  image_url?: string;
  created_at: string;
  data_collection_consent: boolean;
}

// Annotated image type
export interface AnnotationRecord {
  id: string;
  user_id?: string;
  file_name: string;
  emotion: string;
  confidence: number;
  notes?: string;
  created_at: string;
}

// Save analysis result
export async function saveAnalysisResult(data: Omit<AnalysisRecord, 'id' | 'created_at'>) {
  try {
    const { data: result, error } = await supabase
      .from('analyses')
      .insert([
        {
          ...data,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return result?.[0];
  } catch (error) {
    console.error('Error saving analysis result:', error);
    throw error;
  }
}

// Get analysis history
export async function getAnalysisHistory(limit = 10, offset = 0) {
  try {
    const { data, error, count } = await supabase
      .from('analyses')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    throw error;
  }
}

// Delete analysis result
export async function deleteAnalysisResult(id: string) {
  try {
    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting analysis result:', error);
    throw error;
  }
}

// Save annotation
export async function saveAnnotation(data: Omit<AnnotationRecord, 'id' | 'created_at'>) {
  try {
    const { data: result, error } = await supabase
      .from('annotations')
      .insert([
        {
          ...data,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return result?.[0];
  } catch (error) {
    console.error('Error saving annotation:', error);
    throw error;
  }
}

// Get annotations
export async function getAnnotations(limit = 100, offset = 0) {
  try {
    const { data, error, count } = await supabase
      .from('annotations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  } catch (error) {
    console.error('Error fetching annotations:', error);
    throw error;
  }
}

// Upload file to Supabase Storage
export async function uploadFile(bucket: string, path: string, file: File) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Get public URL for file
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl;
}

export async function saveFeedback(analysisId: string, isAccurate: boolean, correctEmotion?: string) {
  const { error } = await supabase.from('feedback').insert([{
    analysis_id: analysisId,
    is_accurate: isAccurate,
    correct_emotion: correctEmotion || null,
    created_at: new Date().toISOString(),
  }]);
  if (error) throw error;
}

// Save mood match feedback (user disagrees with AI emotion mapping)
export async function saveMoodFeedback(moodText: string, aiEmotion: string, userEmotion: string) {
  const { error } = await supabase.from('mood_feedback').insert([{
    mood_text: moodText,
    ai_emotion: aiEmotion,
    user_emotion: userEmotion,
    created_at: new Date().toISOString(),
  }]);
  if (error) console.error('mood feedback save failed:', error);
}

// Update a cat image's emotion label (user correction)
export async function updateCatEmotion(catId: string, newEmotion: string) {
  console.log('[updateCatEmotion] updating', catId, '->', newEmotion);
  const { data, error } = await supabase
    .from('cat_images')
    .update({ emotion_label: newEmotion })
    .eq('id', catId)
    .select();
  if (error) {
    console.error('[updateCatEmotion] FAILED:', error.message, error.details);
  } else {
    console.log('[updateCatEmotion] success:', data);
  }
}

// Auth functions
export async function signUp(email: string, password: string) {
  console.log('[signUp] supabaseUrl:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING');
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    throw new Error('Supabase URL 未配置，请联系管理员');
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  console.log('[signIn] supabaseUrl:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING');
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    throw new Error('Supabase URL 未配置，请联系管理员');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}


// Cat Signature types
export interface CatSignature {
  id: string;
  user_id: string;
  personality_id: string;
  personality_name: string;
  emoji: string;
  mood_input: string;
  emotion_vector: {
    energy: 'low' | 'medium' | 'high';
    emotion: 'positive' | 'neutral' | 'negative';
    socialNeed: 'alone' | 'together';
    control: 'high' | 'low';
  };
  created_at: string;
  updated_at: string;
}

// Save cat signature
export async function saveCatSignature(
  userId: string,
  personalityId: string,
  personalityName: string,
  emoji: string,
  moodInput: string,
  emotionVector: any
) {
  try {
    const { data, error } = await supabase
      .from('cat_signatures')
      .insert([
        {
          user_id: userId,
          personality_id: personalityId,
          personality_name: personalityName,
          emoji: emoji,
          mood_input: moodInput,
          emotion_vector: emotionVector,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Error saving cat signature:', error);
    throw error;
  }
}

// Get user's cat signatures
export async function getUserCatSignatures(userId: string, limit = 30, offset = 0) {
  try {
    const { data, error, count } = await supabase
      .from('cat_signatures')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  } catch (error) {
    console.error('Error fetching cat signatures:', error);
    throw error;
  }
}

// Get user's signature statistics
export async function getUserSignatureStats(userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('get_signature_stats', { user_id_param: userId });

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Error fetching signature stats:', error);
    throw error;
  }
}

// Get this week's signatures
export async function getThisWeekSignatures(userId: string) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('cat_signatures')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching this week signatures:', error);
    throw error;
  }
}
