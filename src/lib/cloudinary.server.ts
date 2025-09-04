import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

export interface VideoUploadResult {
  url: string;
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  duration: number;
}

export class CloudinaryService {
  static async uploadImage(
    file: Buffer | string,
    folder: string = 'esrent',
    options: { transformation?: Record<string, unknown>; public_id?: string } = {}
  ): Promise<UploadResult> {
    try {
      // Validate Cloudinary configuration
      if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
          !process.env.CLOUDINARY_API_KEY || 
          !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
      }

      const uploadOptions = {
        folder,
        resource_type: 'image' as const,
        transformation: options.transformation || { quality: 'auto', fetch_format: 'auto' },
        ...(options.public_id && { public_id: options.public_id }),
      };

      // console.log('Uploading to Cloudinary with options:', { folder, transformation: uploadOptions.transformation });
      
      // Convert Buffer to data URL if needed
      let uploadData: string;
      if (Buffer.isBuffer(file)) {
        const base64 = file.toString('base64');
        const mimeType = 'image/jpeg'; // Default mime type for images
        uploadData = `data:${mimeType};base64,${base64}`;
      } else {
        uploadData = file as string;
      }
      
      const result = await cloudinary.uploader.upload(uploadData, uploadOptions);
      
      // console.log('Cloudinary upload successful:', { public_id: result.public_id, url: result.secure_url });
      
      return {
        url: result.secure_url,
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      if (error instanceof Error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
      }
      throw new Error('Cloudinary upload failed: Unknown error');
    }
  }

  static async deleteMultipleImages(public_ids: string[]): Promise<unknown[]> {
    return Promise.all(public_ids.map(id => this.deleteImage(id)));
  }

  static async deleteImage(public_id: string): Promise<unknown> {
    return cloudinary.uploader.destroy(public_id);
  }

  static async uploadVideo(
    file: Buffer | string,
    folder: string = 'esrent',
    options: { transformation?: Record<string, unknown>; public_id?: string } = {}
  ): Promise<VideoUploadResult> {
    try {
      // Validate Cloudinary configuration
      if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
          !process.env.CLOUDINARY_API_KEY || 
          !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
      }

      const uploadOptions = {
        folder,
        resource_type: 'video' as const,
        transformation: options.transformation || { quality: 'auto', fetch_format: 'auto' },
        ...(options.public_id && { public_id: options.public_id }),
      };

      // Convert Buffer to data URL if needed
      let uploadData: string;
      if (Buffer.isBuffer(file)) {
        const base64 = file.toString('base64');
        const mimeType = 'video/mp4'; // Default mime type for videos
        uploadData = `data:${mimeType};base64,${base64}`;
      } else {
        uploadData = file as string;
      }

      const result = await cloudinary.uploader.upload(uploadData, uploadOptions);
      
      return {
        url: result.secure_url,
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        duration: result.duration || 0,
      };
    } catch (error) {
      console.error('Cloudinary video upload error:', error);
      if (error instanceof Error) {
        throw new Error(`Cloudinary video upload failed: ${error.message}`);
      }
      throw new Error('Cloudinary video upload failed: Unknown error');
    }
  }
}