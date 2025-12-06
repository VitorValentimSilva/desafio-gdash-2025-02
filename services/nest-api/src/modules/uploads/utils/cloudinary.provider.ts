import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

function ensureEnv() {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud || !key || !secret) {
    const missing = [
      !cloud ? 'CLOUDINARY_CLOUD_NAME' : null,
      !key ? 'CLOUDINARY_API_KEY' : null,
      !secret ? 'CLOUDINARY_API_SECRET' : null,
    ]
      .filter(Boolean)
      .join(', ');
    throw new Error(`Missing Cloudinary env vars: ${missing}`);
  }
}

export const createCloudinary = () => {
  ensureEnv();
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log(
    `[Cloudinary] configured: cloud=${process.env.CLOUDINARY_CLOUD_NAME}`,
  );
  return cloudinary;
};

export const uploadBufferToCloudinary = async (
  buffer: Buffer | Uint8Array,
  folder = 'uploads',
  options: { publicId?: string } = {},
): Promise<UploadApiResponse> => {
  createCloudinary();

  if (!buffer || buffer.byteLength === 0) {
    throw new Error('uploadBufferToCloudinary: empty buffer');
  }

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: options.publicId,
      },
      (error: unknown, result: UploadApiResponse | undefined) => {
        if (error) {
          const err =
            error instanceof Error ? error : new Error(JSON.stringify(error));
          console.error('[Cloudinary] upload error:', err);
          return reject(err);
        }
        if (!result) {
          const err = new Error('Cloudinary returned no result');
          console.error('[Cloudinary] upload no result');
          return reject(err);
        }
        console.log('[Cloudinary] upload success:', {
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
        resolve(result);
      },
    );

    try {
      const readable = Readable.from([buffer]);
      readable.pipe(uploadStream as NodeJS.WritableStream);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error('[Cloudinary] stream error:', e);
      return reject(e);
    }
  });
};
