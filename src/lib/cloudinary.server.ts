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

export class CloudinaryService {
  static async uploadImage(
    file: Buffer | string,
    folder: string = 'esrent',
    options: { transformation?: any; public_id?: string } = {}
  ): Promise<UploadResult> {
    const uploadOptions = {
      folder,
      resource_type: 'image' as const,
      transformation: options.transformation || { quality: 'auto', fetch_format: 'auto' },
      ...(options.public_id && { public_id: options.public_id }),
    };
    const result = await cloudinary.uploader.upload(file as string, uploadOptions);
    return {
      url: result.secure_url,
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  }

  static async deleteMultipleImages(public_ids: string[]): Promise<any[]> {
    return Promise.all(public_ids.map(id => this.deleteImage(id)));
  }

  static async deleteImage(public_id: string): Promise<any> {
    return cloudinary.uploader.destroy(public_id);
  }
  // ... (add other methods if needed)
}