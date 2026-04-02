import { onResonance } from './notify';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { cat_image_id } = req.body;
  if (!cat_image_id) return res.status(400).json({ error: 'Missing cat_image_id' });
  await onResonance(cat_image_id).catch(console.error);
  return res.status(200).json({ success: true });
}
