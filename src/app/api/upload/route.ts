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

    // Convert files to base64 for Cloudinary
    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      const dataURI = `data:${file.type};base64,${base64}`;
      
      return CloudinaryService.uploadImage(dataURI, folder);
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
    return NextResponse.json(
      { error: 'Failed to upload files' },
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