import { useState, useEffect, useCallback } from 'react';
import { getVideoThumbnail } from '@/lib/utils/video-thumbnail';

interface UseVideoThumbnailOptions {
  time?: number;
  fallbackUrl?: string;
}

interface UseVideoThumbnailReturn {
  thumbnailUrl: string | null;
  isLoading: boolean;
  error: string | null;
  extractThumbnail: () => Promise<void>;
}

/**
 * Hook to extract video thumbnail from video URL
 */
export const useVideoThumbnail = (
  videoUrl: string | null | undefined,
  options: UseVideoThumbnailOptions = {}
): UseVideoThumbnailReturn => {
  const { time = 1, fallbackUrl } = options;
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractThumbnail = useCallback(async () => {
    if (!videoUrl) {
      setThumbnailUrl(fallbackUrl || null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const thumbnail = await getVideoThumbnail(videoUrl, time);
      setThumbnailUrl(thumbnail);
    } catch (err) {
      console.error('Failed to extract video thumbnail:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract thumbnail');
      setThumbnailUrl(fallbackUrl || null);
    } finally {
      setIsLoading(false);
    }
  }, [videoUrl, time, fallbackUrl]);

  useEffect(() => {
    extractThumbnail();
  }, [extractThumbnail]);

  return {
    thumbnailUrl,
    isLoading,
    error,
    extractThumbnail,
  };
};
