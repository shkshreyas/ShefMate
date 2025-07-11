export async function uploadImage(imageFile: File): Promise<string> {
  try {
    console.log('Starting image upload, file size:', Math.round(imageFile.size / 1024), 'KB');
    
    // Try multiple image hosting services in parallel for better reliability
    const uploadPromises = [
      uploadToImgBB(imageFile).catch(error => ({ service: 'ImgBB', error })),
      uploadToCloudinary(imageFile).catch(error => ({ service: 'Cloudinary', error })),
      uploadToImgur(imageFile).catch(error => ({ service: 'Imgur', error })),
      uploadToFreeImageHost(imageFile).catch(error => ({ service: 'FreeImageHost', error })),
      uploadToPostImages(imageFile).catch(error => ({ service: 'PostImages', error }))
    ];

    // Wait for all uploads to complete (success or failure)
    const results = await Promise.allSettled(uploadPromises);
    
    // Find the first successful upload
    for (const result of results) {
      if (result.status === 'fulfilled' && typeof result.value === 'string') {
        console.log('Image upload succeeded with URL:', result.value);
        return result.value;
      }
    }

    // If all failed, log the errors and throw
    const errors = results
      .map((result, index) => {
        if (result.status === 'rejected') {
          return `Service ${index + 1}: ${result.reason}`;
        }
        if (result.status === 'fulfilled' && typeof result.value === 'object' && 'error' in result.value) {
          return `${result.value.service}: ${result.value.error}`;
        }
        return null;
      })
      .filter(Boolean);

    console.error('All image upload services failed:', errors);
    throw new Error('All image upload services failed. Please try again later.');
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// ImgBB upload (free)
async function uploadToImgBB(imageFile: File): Promise<string> {
  console.log('Starting ImgBB upload, file size:', Math.round(imageFile.size / 1024), 'KB');
  
  // Create a FormData object to send the file
  const formData = new FormData();
  formData.append('image', imageFile);
  
  // Use ImgBB free API with the provided API key
  const apiKey = 'b9409d197d650cf07172a9814f0b19b9';
  const apiUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;
  
  console.log('Sending request to ImgBB at:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    console.log('ImgBB response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ImgBB error response:', errorText);
      throw new Error(`ImgBB upload failed with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('ImgBB response data received');
    
    if (data.success) {
      // ImgBB provides different URL options, using display_url for better quality
      console.log('ImgBB upload successful');
      console.log('Image URL:', data.data.display_url);
      console.log('Thumbnail URL:', data.data.thumb.url);
      console.log('Delete URL:', data.data.delete_url);
      
      // Return the display URL which is typically best quality
      return data.data.display_url;
    } else {
      console.error('ImgBB reported failure:', data);
      throw new Error('ImgBB upload failed: ' + (data.error?.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error in ImgBB upload function:', error);
    throw error;
  }
}

// Cloudinary upload (free tier)
async function uploadToCloudinary(imageFile: File): Promise<string> {
  console.log('Starting Cloudinary upload, file size:', Math.round(imageFile.size / 1024), 'KB');
  
  // Create a FormData object to send the file
  const formData = new FormData();
  formData.append('file', imageFile);
  
  // Using the provided Cloudinary credentials
  formData.append('upload_preset', 'ml_default');
  formData.append('api_key', '456884833162782');
  
  const cloudName = 'dcb3ssrse';
  const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
  console.log('Sending request to Cloudinary');
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    console.log('Cloudinary response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error response:', errorText);
      throw new Error(`Cloudinary upload failed with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Cloudinary response data received:', data);
    
    if (data.secure_url) {
      console.log('Cloudinary upload successful, URL:', data.secure_url);
      return data.secure_url;
    } else {
      console.error('Cloudinary failed to return a secure URL:', data);
      throw new Error('Cloudinary upload failed: No secure URL in response');
    }
  } catch (error) {
    console.error('Error in Cloudinary upload function:', error);
    throw error;
  }
}

// Imgur upload (free)
async function uploadToImgur(imageFile: File): Promise<string> {
  console.log('Starting Imgur upload, file size:', Math.round(imageFile.size / 1024), 'KB');
  
  // Create a FormData object to send the file
  const formData = new FormData();
  formData.append('image', imageFile);
  
  // Replace with your Imgur client ID - Get one at https://api.imgur.com/oauth2/addclient
  const clientId = '546c25a59c58ad7';
  
  const response = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Client-ID ${clientId}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Imgur upload failed with status: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Imgur upload successful, URL:', data.data.link);
    return data.data.link;
  } else {
    throw new Error('Imgur upload failed: ' + (data.data?.error || 'Unknown error'));
  }
}

// FreeImage.host upload (free)
async function uploadToFreeImageHost(imageFile: File): Promise<string> {
  console.log('Starting FreeImage.host upload, file size:', Math.round(imageFile.size / 1024), 'KB');
  
  // Create a FormData object to send the file
  const formData = new FormData();
  formData.append('source', imageFile);
  formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
  formData.append('action', 'upload');
  formData.append('format', 'json');
  
  const apiUrl = 'https://freeimage.host/api/1/upload';
  
  console.log('Sending request to FreeImage.host');
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    console.log('FreeImage.host response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('FreeImage.host error response:', errorText);
      throw new Error(`FreeImage.host upload failed with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('FreeImage.host response data received:', data);
    
    if (data.status_code === 200 && data.success) {
      console.log('FreeImage.host upload successful, URL:', data.image.url);
      return data.image.url;
    } else {
      console.error('FreeImage.host reported failure:', data);
      throw new Error('FreeImage.host upload failed: ' + (data.status_txt || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error in FreeImage.host upload function:', error);
    throw error;
  }
}

// PostImages.cc upload (free)
async function uploadToPostImages(imageFile: File): Promise<string> {
  console.log('Starting PostImages upload, file size:', Math.round(imageFile.size / 1024), 'KB');
  
  // Create a FormData object to send the file
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const apiUrl = 'https://postimages.org/json/rr';
  
  console.log('Sending request to PostImages');
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    console.log('PostImages response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('PostImages error response:', errorText);
      throw new Error(`PostImages upload failed with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('PostImages response data received:', data);
    
    if (data.status === 200 && data.url) {
      console.log('PostImages upload successful, URL:', data.url);
      return data.url;
    } else {
      console.error('PostImages reported failure:', data);
      throw new Error('PostImages upload failed: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error in PostImages upload function:', error);
    throw error;
  }
}

// Export the FreeImage.host function for backward compatibility
export async function uploadImageToFreeImageHost(imageFile: File): Promise<string> {
  return uploadToFreeImageHost(imageFile);
} 