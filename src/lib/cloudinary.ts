// Uploads an image file to the /api/upload endpoint and returns the Cloudinary URL
export async function uploadImage(file: File, folder?: string, token?: string): Promise<string> {
  const formData = new FormData();
  formData.append('files', file);
  if (folder) formData.append('folder', folder);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const data = await response.json();
  if (!data.url && !data.files?.[0]?.url) {
    throw new Error('No image URL returned from upload');
  }
  // Support both single and multiple file responses
  return data.url || data.files[0].url;
} 