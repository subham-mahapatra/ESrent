"use client";
import { motion } from "motion/react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";
import {
  Stories,
  StoriesContent,
  Story,
  StoryOverlay,
  StoryVideo,
} from '@/components/ui/stories-carousel';

interface VideoTestimonial {
  _id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  isFeatured: boolean;
  createdAt: string;
  description?: string;
}

interface VideoTestimonialsSectionProps {
  limit?: number;
  featuredOnly?: boolean;
}

const VideoTestimonialsSection = ({ 
  limit = 100, 
  featuredOnly = true 
}: VideoTestimonialsSectionProps) => {
  const [testimonials, setTestimonials] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [carouselApi, setCarouselApi] = useState<any>(null);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);

  // Memoize the API URL to prevent unnecessary re-renders
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (featuredOnly) params.append('featured', 'true');
    params.append('limit', limit.toString());
    return `/api/video-testimonials?${params.toString()}`;
  }, [featuredOnly, limit]);

  // Fetch video testimonials with error handling and caching
  const fetchVideoTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(apiUrl, {
        next: { revalidate: 300 }, // Cache for 5 minutes
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setTestimonials(data.data);
      } else {
        throw new Error(data.error || 'Failed to load video testimonials');
      }
    } catch (err) {
      console.error('Error fetching video testimonials:', err);
      setError(err instanceof Error ? err.message : 'Failed to load video testimonials');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchVideoTestimonials();
  }, [fetchVideoTestimonials]);


  // Modal handlers
  const handleVideoClick = useCallback((testimonial: VideoTestimonial) => {
    setSelectedVideo(testimonial);
    setIsModalOpen(true);
    setIsPlaying(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedVideo(null);
    setIsPlaying(false);
    setIsMuted(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const handleFullscreen = useCallback(() => {
    const videoElement = document.querySelector('#modal-video') as HTMLVideoElement;
    if (videoElement) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      }
    }
  }, []);

  // Handle video play/pause based on state
  useEffect(() => {
    const videoElement = document.querySelector('#modal-video') as HTMLVideoElement;
    if (videoElement) {
      if (isPlaying) {
        videoElement.play().catch(console.error);
      } else {
        videoElement.pause();
      }
    }
  }, [isPlaying]);

  // Handle video mute based on state
  useEffect(() => {
    const videoElement = document.querySelector('#modal-video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.muted = isMuted;
    }
  }, [isMuted]);

  // Auto-scrolling functionality
  useEffect(() => {
    if (!carouselApi || testimonials.length <= 1 || isAutoScrollPaused) return;

    const autoScroll = setInterval(() => {
      try {
        if (carouselApi.canScrollNext()) {
          carouselApi.scrollNext();
        } else {
          // With loop enabled, this should automatically go to the beginning
          carouselApi.scrollTo(0);
        }
      } catch (error) {
        console.warn('Auto-scroll error:', error);
      }
    }, 1500); // Auto-scroll every 2 seconds

    return () => clearInterval(autoScroll);
  }, [carouselApi, testimonials.length, isAutoScrollPaused]);



  // Loading skeleton
  if (loading) {
    return (
      <motion.section
        className="bg-background my-20 relative"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-12"
          >
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-96" />
          </motion.div>
          
          {/* Stories carousel skeleton */}
          <div className="flex justify-center">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0">
                  <Skeleton className="w-[200px] h-[300px] rounded-xl bg-gray-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.section
        className="bg-background my-20 relative"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container z-10 mx-auto px-4">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">Video Testimonials</h3>
            <p className="text-gray-400 mb-4">Unable to load video testimonials</p>
            <button 
              onClick={fetchVideoTestimonials} 
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </motion.section>
    );
  }

  // No testimonials state
  if (testimonials.length === 0) {
    return null; // Don't show the section if no testimonials
  }

  return (
    <>
      <motion.section
        className="bg-background my-20 relative"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-foreground">
              Video Testimonials
            </h2>
            <p className="text-center mt-5 opacity-75 text-foreground">
              Watch our customers share their experiences with our luxury car rental service
            </p>
          </motion.div>
          
          {/* Stories Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <Stories 
              className="w-full max-w-7xl"
              setApi={setCarouselApi}
              onMouseEnter={() => setIsAutoScrollPaused(true)}
              onMouseLeave={() => setIsAutoScrollPaused(false)}
              opts={{
                align: 'start',
                loop: true,
                dragFree: false,
                containScroll: 'trimSnaps',
                skipSnaps: false,
                inViewThreshold: 0.7,
                duration: 20,
                startIndex: 0,
                slidesToScroll: 1,
                breakpoints: {
                  '(min-width: 640px)': { slidesToScroll: 1 }
                }
              }}
            >
              <StoriesContent className="gap-6">
                {testimonials.map((testimonial) => {
                  return (
                    <Story 
                      key={testimonial._id} 
                      className="aspect-[3/4] !w-[250px] cursor-pointer group"
                      onClick={() => handleVideoClick(testimonial)}
                    >
                    <StoryVideo 
                      src={testimonial.videoUrl} 
                      poster={testimonial.thumbnailUrl}
                    />
                    <StoryOverlay side="top" />
                    {/* Play overlay - only show on hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-8 h-8 text-black ml-1" />
                      </div>
                    </div>
                  </Story>
                  );
                })}
              </StoriesContent>
            </Stories>
        
          </motion.div>
        </div>
      </motion.section>

      {/* Video Modal */}
      {isModalOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <motion.div
            className="relative w-full max-w-sm sm:max-w-md mx-4 bg-gray-900 rounded-2xl overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors duration-300"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video */}
            <div className="relative aspect-[3/4] bg-gray-800">
              <video
                id="modal-video"
                className="w-full h-full object-cover"
                poster={selectedVideo.thumbnailUrl}
                muted={isMuted}
                loop
                playsInline
                preload="metadata"
                autoPlay={isPlaying}
                controls={false}
              >
                <source src={selectedVideo.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Video title overlay */}
              <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
                <h3 className="text-white font-semibold text-lg leading-tight drop-shadow-lg">
                  {selectedVideo.description || 'Video Testimonial'}
                </h3>
              </div>

              {/* Video controls overlay */}
              <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-300">
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={togglePlayPause}
                    className="w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors duration-300"
                  >
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-black" />
                    ) : (
                      <Play className="w-10 h-10 text-black ml-1" />
                    )}
                  </button>
                </div>
                
                {/* Video controls */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={toggleMute}
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors duration-300"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={handleFullscreen}
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors duration-300"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </>
  );
};

export default VideoTestimonialsSection;
