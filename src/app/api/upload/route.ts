import { NextRequest, NextResponse } from 'next/server';
import { CloudinaryService } from '@/lib/cloudinary.server';
import { requireAdmin } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAdmin(request);
    if (authResult) return authResult;

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string || 'esrent';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}` },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size: 10MB` },
          { status: 400 }
        );
      }
    }

    // Check Cloudinary configuration
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary environment variables');
      
      // Return a helpful error message with setup instructions
      return NextResponse.json(
        { 
          error: 'Cloudinary configuration is missing',
          setupInstructions: {
            message: 'Please configure Cloudinary environment variables:',
            required: [
              'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
              'CLOUDINARY_API_KEY', 
              'CLOUDINARY_API_SECRET'
            ],
            example: 'Check your .env.local file and ensure all Cloudinary variables are set'
          }
        },
        { status: 500 }
      );
    }

    // Convert files to base64 for Cloudinary
    const uploadPromises = files.map(async (file) => {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64}`;
        
        return await CloudinaryService.uploadImage(dataURI, folder);
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: results.map(result => ({
        url: result.url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      }))
    });
  } catch (error) {
    console.error('Error in POST /api/upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to upload files: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAdmin(request);
    if (authResult) return authResult;

    const body = await request.json();
    const { public_ids } = body;

    if (!public_ids || !Array.isArray(public_ids) || public_ids.length === 0) {
      return NextResponse.json(
        { error: 'Public IDs array is required' },
        { status: 400 }
      );
    }

    const results = await CloudinaryService.deleteMultipleImages(public_ids);

    return NextResponse.json({
      message: 'Files deleted successfully',
      results
    });
  } catch (error) {
    console.error('Error in DELETE /api/upload:', error);
    return NextResponse.json(
      { error: 'Failed to delete files' },
      { status: 500 }
    );
  }
} 

export async function GET(request: NextRequest) {
  // Simple test endpoint to check Cloudinary configuration
  const config = {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY ? '***' : 'MISSING',
    apiSecret: process.env.CLOUDINARY_API_SECRET ? '***' : 'MISSING',
  };
  
  return NextResponse.json({
    message: 'Cloudinary configuration check',
    config,
    isConfigured: !!(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && 
                     process.env.CLOUDINARY_API_KEY && 
                     process.env.CLOUDINARY_API_SECRET)
  });
} 