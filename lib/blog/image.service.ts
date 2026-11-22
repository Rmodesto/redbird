import crypto from 'crypto';
import path from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export interface ImageService {
  upload(file: File): Promise<string>;
  delete(filePath: string): Promise<void>;
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'subway-sounds-images';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-e840d0273cf34b648e38bac3383b2fa1.r2.dev';

export class R2ImageService implements ImageService {
  async upload(file: File): Promise<string> {
    const ext = path.extname(file.name) || '.jpg';
    const hash = crypto.randomBytes(8).toString('hex');
    const filename = `blog/${Date.now()}-${hash}${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
      })
    );

    return `${PUBLIC_URL}/${filename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    // Extract key from URL
    const key = fileUrl.replace(`${PUBLIC_URL}/`, '');

    try {
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        })
      );
    } catch {
      // File may not exist
    }
  }
}

export const imageService: ImageService = new R2ImageService();
