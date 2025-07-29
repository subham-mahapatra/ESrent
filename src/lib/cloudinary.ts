// Uploads an image file to the /api/upload endpoint and returns the Cloudinary URL
export async function uploadImage(file: File, folder?: string, token?: string): Promise<string> {
  const formData = new FormData();
  formData.append('files', file);
  if (folder) formData.append('folder', folder);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `Upload failed with status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.url && !data.files?.[0]?.url) {
      throw new Error('No image URL returned from upload');
    }
    // Support both single and multiple file responses
    return data.url || data.files[0].url;
  } catch (error) {
    console.error('Upload error:', error);
    if (error instanceof Error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
    throw new Error('Image upload failed: Unknown error');
  }
} 