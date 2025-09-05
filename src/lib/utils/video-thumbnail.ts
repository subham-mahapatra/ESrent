/**
 * Utility functions for video thumbnail generation
 */

/**
 * Extracts the first frame of a video as a thumbnail
 * @param videoUrl - URL of the video
 * @param time - Time in seconds to capture (default: 1)
 * @returns Promise<string> - Data URL of the thumbnail
 */
export const getVideoThumbnail = (videoUrl: string, time: number = 1): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.currentTime = time;
    video.muted = true;
    
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnailUrl);
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
    
    video.src = videoUrl;
    video.load();
  });
};

/**
 * Creates a video element with thumbnail extraction capability
 * @param videoUrl - URL of the video
 * @param onThumbnailExtracted - Callback when thumbnail is extracted
 * @param time - Time in seconds to capture (default: 1)
 */
export const createVideoWithThumbnail = (
  videoUrl: string,
  onThumbnailExtracted: (thumbnailUrl: string) => void,
  time: number = 1
): HTMLVideoElement => {
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.currentTime = time;
  video.muted = true;
  video.preload = 'metadata';
  
  video.onloadeddata = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
    onThumbnailExtracted(thumbnailUrl);
  };
  
  video.onerror = () => {
    console.error('Failed to load video for thumbnail extraction');
  };
  
  video.src = videoUrl;
  video.load();
  
  return video;
};
