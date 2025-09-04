"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Upload, 
  Play, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  Video,
  User,
  MessageSquare,
  Calendar,
  Star,
  ShieldCheck,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { toast } from '@/components/hooks/use-toast';
import { FormErrorDisplay } from '@/components/ui/form-error';
import { useApiError } from '@/hooks/useApiError';

interface VideoTestimonial {
  _id: string;
  userName: string;
  userCompany?: string;
  title: string;
  comment: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VideoTestimonialForm {
  userName: string;
  userCompany: string;
  title: string;
  comment: string;
  videoFile?: File;
  thumbnailFile?: File;
}

export default function VideoTestimonialsPage() {
  const [videoTestimonials, setVideoTestimonials] = useState<VideoTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<VideoTestimonial | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | undefined>(undefined);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState<VideoTestimonialForm>({
    userName: '',
    userCompany: '',
    title: '',
    comment: '',
  });
  const { error: apiError, handleApiError, clearError: clearApiError } = useApiError();

  // Fetch video testimonials
  const fetchVideoTestimonials = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/video-testimonials');
      if (response.ok) {
        const data = await response.json();
        setVideoTestimonials(data.data || []);
      } else {
        throw new Error('Failed to fetch video testimonials');
      }
    } catch (error) {
      console.error('Error fetching video testimonials:', error);
      const apiError = handleApiError(error);
      toast({
        title: "Error",
        description: apiError.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoTestimonials();
  }, []);

  // Handle form input changes
  const handleInputChange = (field: keyof VideoTestimonialForm, value: string | number | File) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file selection
  const handleFileSelect = (field: 'videoFile' | 'thumbnailFile', file: File) => {
    if (field === 'videoFile') {
      // Validate video file
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid video file (MP4, WebM, OGG, or MOV)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video file must be smaller than 100MB",
          variant: "destructive",
        });
        return;
      }
    }

    if (field === 'thumbnailFile') {
      // Validate thumbnail file
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file (JPEG, PNG, or WebP)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Thumbnail file must be smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
    }

    // Create local preview and store file
    if (field === 'videoFile') {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(URL.createObjectURL(file));
    } else if (field === 'thumbnailFile') {
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
      setThumbnailPreviewUrl(URL.createObjectURL(file));
    }

    handleInputChange(field, file);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      userName: '',
      userCompany: '',
      title: '',
      comment: '',
    });
    setEditingTestimonial(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    setVideoPreviewUrl(undefined);
    setThumbnailPreviewUrl(undefined);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.videoFile) {
      toast({
        title: "Video required",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('userName', formData.userName);
      // userRole removed
      formDataToSend.append('userCompany', formData.userCompany);
      // rating removed
      formDataToSend.append('title', formData.title);
      formDataToSend.append('comment', formData.comment);
      formDataToSend.append('video', formData.videoFile);
      
      if (formData.thumbnailFile) {
        formDataToSend.append('thumbnail', formData.thumbnailFile);
      }

      const url = editingTestimonial 
        ? `/api/video-testimonials/${editingTestimonial._id}`
        : '/api/video-testimonials';
      
      const method = editingTestimonial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (response.ok) {
        const message = editingTestimonial 
          ? 'Video testimonial updated successfully'
          : 'Video testimonial uploaded successfully';
        
        toast({
          title: "Success",
          description: message,
        });
        
        setIsDialogOpen(false);
        resetForm();
        fetchVideoTestimonials();
      } else {
        throw new Error('Failed to save video testimonial');
      }
    } catch (error) {
      console.error('Error saving video testimonial:', error);
      toast({
        title: "Error",
        description: "Failed to save video testimonial",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle approval toggle
  // Approval no longer needed (admin-only upload)

  // Handle featured toggle
  const handleFeaturedToggle = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/video-testimonials/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFeatured: !currentStatus }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Video testimonial ${currentStatus ? 'unfeatured' : 'featured'} successfully`,
        });
        fetchVideoTestimonials();
      } else {
        throw new Error('Failed to update featured status');
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video testimonial?')) {
      return;
    }

    try {
      const response = await fetch(`/api/video-testimonials/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Video testimonial deleted successfully",
        });
        fetchVideoTestimonials();
      } else {
        throw new Error('Failed to delete video testimonial');
      }
    } catch (error) {
      console.error('Error deleting video testimonial:', error);
      toast({
        title: "Error",
        description: "Failed to delete video testimonial",
        variant: "destructive",
      });
    }
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    };
  }, [videoPreviewUrl, thumbnailPreviewUrl]);

  // Edit testimonial
  const handleEdit = (testimonial: VideoTestimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      userName: testimonial.userName,
      userCompany: testimonial.userCompany || '',
      title: testimonial.title,
      comment: testimonial.comment,
    });
    setIsDialogOpen(true);
  };

  // Open dialog for new testimonial
  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status badge
  const getStatusBadge = (testimonial: VideoTestimonial) => {
    if (testimonial.isFeatured) {
      return (
        <Badge className="bg-primary/10 text-primary border border-primary/20 inline-flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" /> Featured
        </Badge>
      );
    }
    return null;
  };
  

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Video Testimonials</h1>
            <p className="text-muted-foreground">Manage customer video testimonials</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-40 w-full bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-2">
                <div className="h-5 w-2/3 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
                <div className="h-9 w-full bg-muted animate-pulse rounded mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Video Testimonials</h1>
            <p className="text-muted-foreground">Manage customer video testimonials</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Upload Video Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? 'Edit Video Testimonial' : 'Upload Video Testimonial'}
              </DialogTitle>
              <DialogDescription>
                {editingTestimonial 
                  ? 'Update the video testimonial details below'
                  : 'Upload a new video testimonial from your customers'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userName">Customer Name *</Label>
                  <Input
                    id="userName"
                    value={formData.userName}
                    onChange={(e) => handleInputChange('userName', e.target.value)}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="userCompany">Company (Optional)</Label>
                  <Input
                    id="userCompany"
                    value={formData.userCompany}
                    onChange={(e) => handleInputChange('userCompany', e.target.value)}
                    placeholder="Company Name"
                  />
                </div>
              </div>
              
              {/* Role and rating removed */}
              
              
              
              <div>
                <Label htmlFor="title">Testimonial Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  placeholder="Amazing service experience"
                />
              </div>
              
              <div>
                <Label htmlFor="comment">Testimonial Comment *</Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => handleInputChange('comment', e.target.value)}
                  required
                  placeholder="Share your experience..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="video">Video File *</Label>
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 bg-muted/20">
                  {videoPreviewUrl ? (
                    <div className="space-y-3">
                      <video
                        src={videoPreviewUrl}
                        controls
                        className="w-full max-h-64 rounded-md border border-border/50"
                        poster={thumbnailPreviewUrl}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
                            setVideoPreviewUrl(undefined);
                            setFormData(prev => ({ ...prev, videoFile: undefined } as any));
                          }}
                          className="border-border/50"
                        >
                          Remove Video
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('video')?.click()}
                          className="border-border/50"
                        >
                          Replace Video
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to select video file
                      </p>
                      <p className="text-xs text-muted-foreground/80 mb-4">
                        Supported formats: MP4, WebM, OGG, MOV (Max: 100MB)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('video')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                          </>
                        ) : (
                          'Select Video'
                        )}
                      </Button>
                    </div>
                  )}
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect('videoFile', file);
                    }}
                    className="hidden"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="thumbnail">Thumbnail Image (Optional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 bg-muted/20">
                  {thumbnailPreviewUrl ? (
                    <div className="space-y-3">
                      <img
                        src={thumbnailPreviewUrl}
                        alt="Thumbnail preview"
                        className="w-full max-h-48 object-cover rounded-md border border-border/50"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
                            setThumbnailPreviewUrl(undefined);
                            setFormData(prev => ({ ...prev, thumbnailFile: undefined } as any));
                          }}
                          className="border-border/50"
                        >
                          Remove Thumbnail
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('thumbnail')?.click()}
                          className="border-border/50"
                        >
                          Replace Thumbnail
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to select thumbnail
                      </p>
                      <p className="text-xs text-muted-foreground/80 mb-2">
                        Supported formats: JPEG, PNG, WebP (Max: 5MB)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('thumbnail')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Select Thumbnail
                      </Button>
                    </div>
                  )}
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect('thumbnailFile', file);
                    }}
                    className="hidden"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingTestimonial ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : (
                    editingTestimonial ? 'Update Testimonial' : 'Upload Testimonial'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}

        
        {/* Pending card removed */}

      {/* Video Testimonials Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Video Testimonials</CardTitle>
          <CardDescription>
            Manage and review customer video testimonials
          </CardDescription>
        </CardHeader>
        <CardContent>
          {videoTestimonials.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No video testimonials yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by uploading your first video testimonial
              </p>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Upload First Video
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videoTestimonials.map((testimonial) => (
                <Card key={testimonial._id} className="overflow-hidden group border border-border/50 rounded-xl">
                  <div className="relative h-40 w-full bg-muted">
                    {testimonial.thumbnailUrl ? (
                      <img
                        src={testimonial.thumbnailUrl}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/60 rounded-full p-3">
                        <Play className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    {testimonial.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(testimonial.duration)}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{testimonial.title}</h3>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span className="truncate">{testimonial.userName}</span>
                          {testimonial.userCompany && (
                            <>
                              <span>•</span>
                              <span className="truncate">{testimonial.userCompany}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(testimonial)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{testimonial.comment}</p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(testimonial.createdAt).toLocaleDateString()}
                      </span>
                      {testimonial.userCompany && (
                        <>
                          <span>•</span>
                          <span>{testimonial.userCompany}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(testimonial.videoUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(testimonial)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      {/* Approval toggle removed */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeaturedToggle(testimonial._id, testimonial.isFeatured)}
                      >
                        {testimonial.isFeatured ? (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Unfeature
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Feature
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(testimonial._id)}
                        className="col-span-2"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
