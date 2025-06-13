const CLOUDINARY_CONFIG = {
  cloud_name: 'dldtb68nn',
  upload_preset: 'prayers_upload',
  api_key: '265883586684898'
};

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  error?: {
    message: string;
  };
}

export const uploadAudio = async (uri: string): Promise<string> => {
  try {
    const filename = uri.split('/').pop() || 'audio.m4a';
    
    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'audio/m4a',
      name: filename,
    } as any);
    formData.append('upload_preset', CLOUDINARY_CONFIG.upload_preset);
    formData.append('resource_type', 'video'); // Cloudinary uses 'video' for audio files

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json() as CloudinaryResponse;
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload audio file');
  }
};
