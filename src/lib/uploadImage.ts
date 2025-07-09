import { supabase } from './supabase';

export async function uploadImageToSupabaseStorage(file: File, userId: string): Promise<string | null> {
  const filePath = `chefs/${userId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('chef-profiles')
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.error('Supabase Storage upload failed:', error);
    return null;
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from('chef-profiles')
    .getPublicUrl(filePath);

  return publicUrlData?.publicUrl || null;
}

export async function uploadImageToFreeImageHost(file: File): Promise<string | null> {
  const apiKey = '6d207e02198a847aa98d0a2a901485a5';
  const formData = new FormData();
  formData.append('key', apiKey);
  formData.append('action', 'upload');
  formData.append('source', file);
  formData.append('format', 'json');

  try {
    const response = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (result.status_code === 200 && result.image && result.image.url) {
      return result.image.url;
    } else {
      console.error('Freeimage.host upload failed:', result);
      return null;
    }
  } catch (error) {
    console.error('Freeimage.host upload error:', error);
    return null;
  }
} 