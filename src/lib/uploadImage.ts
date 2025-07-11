export async function uploadImage(imageFile: File): Promise<string> {
// ...existing code...
  try {
    console.log('Starting image upload, file size:', Math.round(imageFile.size / 1024), 'KB');
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Use ImgBB free API
    // Note: In production, you should use a more reliable service or Firebase Storage
    const apiUrl = 'https://api.imgbb.com/1/upload?key=f1c7fb499c2f3a6c5966b48318d97ff7';
    console.log('Uploading to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed with status:', response.status, errorText);
      throw new Error(`Upload failed with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Upload response:', data);
    
    if (data.success) {
      console.log('Image uploaded successfully, URL:', data.data.url);
      return data.data.url;
    } else {
      console.error('Image upload failed with response:', data);
      throw new Error('Image upload failed: ' + (data.error?.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
} 