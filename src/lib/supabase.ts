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
