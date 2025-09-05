"use client";

import { useState, useEffect } from 'react';
import { Video, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoThumbnailProps {
  videoUrl: string;
  thumbnailUrl?: string;
  alt?: string;
  className?: string;
  time?: number;
  fallbackIcon?: React.ReactNode;
  onThumbnailExtracted?: (thumbnailUrl: string) => void;
}

export const VideoThumbnail = ({
  videoUrl,
  thumbnailUrl,
  alt = "Video thumbnail",
  className,
  time = 1,
  fallbackIcon,
  onThumbnailExtracted,
}: VideoThumbnailProps) => {
  const [extractedThumbnail, setExtractedThumbnail] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (thumbnailUrl) {
      setExtractedThumbnail(null);
      return;
    }

    if (!videoUrl) return;

    const extractThumbnail = async () => {
      setIsExtracting(true);
      setError(null);

      try {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.currentTime = time;
        video.muted = true;
        video.preload = 'metadata';

        await new Promise<void>((resolve, reject) => {
          video.onloadeddata = () => resolve();
          video.onerror = () => reject(new Error('Failed to load video'));
          video.src = videoUrl;
          video.load();
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setExtractedThumbnail(thumbnailDataUrl);
        onThumbnailExtracted?.(thumbnailDataUrl);
      } catch (err) {
        console.error('Failed to extract video thumbnail:', err);
        setError(err instanceof Error ? err.message : 'Failed to extract thumbnail');
      } finally {
        setIsExtracting(false);
      }
    };

    extractThumbnail();
  }, [videoUrl, thumbnailUrl, time, onThumbnailExtracted]);

  const displayThumbnail = thumbnailUrl || extractedThumbnail;

  if (isExtracting) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-muted", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (displayThumbnail) {
    return (
      <img
        src={displayThumbnail}
        alt={alt}
        className={cn("w-full h-full object-cover", className)}
      />
    );
  }

  if (error) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-muted", className)}>
        {fallbackIcon || <Video className="h-8 w-8 text-muted-foreground" />}
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full flex items-center justify-center bg-muted", className)}>
      {fallbackIcon || <Video className="h-8 w-8 text-muted-foreground" />}
    </div>
  );
};
