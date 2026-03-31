import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// 稀有度映射
const RARITY_MAP: Record<string, 'common' | 'rare' | 'epic' | 'legendary'> = {
  // Legendary (3 种最稀有)
  suspicious: 'legendary',
  dramatic: 'legendary',
  hangry: 'legendary',
  
  // Epic (6 种)
  smug: 'epic',
  sassy: 'epic',
  zoomies: 'epic',
  confused: 'epic',
  resigned: 'epic',
  melancholy: 'epic',
  
  // Rare (6 种)
  curious: 'rare',
  annoyed: 'rare',
  anxious: 'rare',
  clingy: 'rare',
  disappointed: 'rare',
  ashamed: 'rare',
  
  // Common (其余)
  happy: 'common',
  calm: 'common',
  sleepy: 'common',
  sad: 'common',
  angry: 'common',
  scared: 'common',
  disgusted: 'common',
  surprised: 'common',
  loved: 'common',
  bored: 'common',
  tired: 'common',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: 'Supabase configuration missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { cat_image_id } = await req.json();

    if (!cat_image_id) {
      return new Response(JSON.stringify({ error: 'cat_image_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. 检查图片是否存在
    const { data: catImage, error: fetchError } = await supabase
      .from('cat_images')
      .select('*')
      .eq('id', cat_image_id)
      .single();

    if (fetchError || !catImage) {
      return new Response(JSON.stringify({ error: 'Cat image not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. 检查是否已经铸造过
    if (catImage.is_nft) {
      return new Response(JSON.stringify({ 
        error: 'Already minted',
        nft: {
          token_id: catImage.nft_token_id,
          rarity: catImage.nft_rarity,
          minted_at: catImage.nft_minted_at,
        }
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. 生成 Token ID
    const { data: tokenIdData, error: tokenError } = await supabase
      .rpc('get_next_nft_token_id');

    if (tokenError) {
      console.error('Token ID generation failed:', tokenError);
      return new Response(JSON.stringify({ error: 'Failed to generate token ID' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const tokenId = tokenIdData as string;

    // 4. 确定稀有度
    const rarity = RARITY_MAP[catImage.emotion_label] || 'common';

    // 5. 更新数据库
    const { data: updatedImage, error: updateError } = await supabase
      .from('cat_images')
      .update({
        is_nft: true,
        nft_token_id: tokenId,
        nft_minted_at: new Date().toISOString(),
        nft_rarity: rarity,
      })
      .eq('id', cat_image_id)
      .select()
      .single();

    if (updateError) {
      console.error('NFT minting failed:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to mint NFT' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      nft: {
        id: updatedImage.id,
        token_id: updatedImage.nft_token_id,
        rarity: updatedImage.nft_rarity,
        minted_at: updatedImage.nft_minted_at,
        image_url: updatedImage.image_url,
        emotion_label: updatedImage.emotion_label,
        pet_name: updatedImage.pet_name,
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Mint NFT error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
