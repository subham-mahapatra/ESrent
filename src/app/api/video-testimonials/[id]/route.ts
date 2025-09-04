import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { VideoTestimonial } from '@/lib/models/videoTestimonialSchema';
import { CloudinaryService } from '@/lib/cloudinary.server';

// GET - Fetch single video testimonial
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await context.params;
    const videoTestimonial = await VideoTestimonial.findById(id);
    
    if (!videoTestimonial) {
      return NextResponse.json(
        { success: false, error: 'Video testimonial not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: videoTestimonial,
      message: 'Video testimonial fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching video testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch video testimonial' },
      { status: 500 }
    );
  }
}

// PUT - Update video testimonial
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const formData = await request.formData();
    
    // Extract form fields
    const userName = formData.get('userName') as string;
    const userRole = formData.get('userRole') as string;
    const userCompany = formData.get('userCompany') as string;
    const rating = parseInt(formData.get('rating') as string);
    const title = formData.get('title') as string;
    const comment = formData.get('comment') as string;
    const videoFile = formData.get('video') as File;
    const thumbnailFile = formData.get('thumbnail') as File;
    
    // Validate required fields
    if (!userName || !title || !comment) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // rating and userRole no longer required (admin-only)
    
    // Find existing testimonial
    const { id } = await context.params;
    const existingTestimonial = await VideoTestimonial.findById(id);
    if (!existingTestimonial) {
      return NextResponse.json(
        { success: false, error: 'Video testimonial not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    const updateData: any = {
      userName,
      // userRole removed
      userCompany: userCompany || undefined,
      // rating removed
      title,
      comment,
    };
    
    // Handle video file upload if provided
    if (videoFile) {
      const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
      const videoResult = await CloudinaryService.uploadVideo(videoBuffer, 'video-testimonials', {
        public_id: `video-${Date.now()}`,
      });
      
      if (!videoResult) {
        return NextResponse.json(
          { success: false, error: 'Failed to upload video' },
          { status: 500 }
        );
      }
      
      updateData.videoUrl = videoResult.secure_url;
      updateData.duration = videoResult.duration;
    }
    
    // Handle thumbnail file upload if provided
    if (thumbnailFile) {
      const thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const thumbnailResult = await CloudinaryService.uploadImage(thumbnailBuffer, 'video-testimonials/thumbnails', {
        public_id: `thumbnail-${Date.now()}`,
      });
      
      if (thumbnailResult) {
        updateData.thumbnailUrl = thumbnailResult.secure_url;
      }
    }
    
    // Update the testimonial
    const updatedTestimonial = await VideoTestimonial.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      data: updatedTestimonial,
      message: 'Video testimonial updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating video testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update video testimonial' },
      { status: 500 }
    );
  }
}

// PATCH - Partial update (for featured status)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { isFeatured } = body;
    
    // Validate that at least one field is provided
    if (isFeatured === undefined) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    // Find existing testimonial
    const { id } = await context.params;
    const existingTestimonial = await VideoTestimonial.findById(id);
    if (!existingTestimonial) {
      return NextResponse.json(
        { success: false, error: 'Video testimonial not found' },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData: any = {};
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    
    // Update the testimonial
    const updatedTestimonial = await VideoTestimonial.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      data: updatedTestimonial,
      message: 'Video testimonial updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating video testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update video testimonial' },
      { status: 500 }
    );
  }
}

// DELETE - Delete video testimonial
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await context.params;
    const videoTestimonial = await VideoTestimonial.findByIdAndDelete(id);
    
    if (!videoTestimonial) {
      return NextResponse.json(
        { success: false, error: 'Video testimonial not found' },
        { status: 404 }
      );
    }
    
    // Note: In a production environment, you might want to also delete the files from Cloudinary
    // This would require additional Cloudinary API calls to remove the uploaded files
    
    return NextResponse.json({
      success: true,
      message: 'Video testimonial deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting video testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete video testimonial' },
      { status: 500 }
    );
  }
}
