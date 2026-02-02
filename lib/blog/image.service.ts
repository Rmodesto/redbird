import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface ImageService {
  upload(file: File): Promise<string>;
  delete(filePath: string): Promise<void>;
}

export class LocalImageService implements ImageService {
  private uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blog');

  async upload(file: File): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    const ext = path.extname(file.name) || '.jpg';
    const hash = crypto.randomBytes(8).toString('hex');
    const filename = `${Date.now()}-${hash}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return `/uploads/blog/${filename}`;
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    try {
      await fs.unlink(fullPath);
    } catch {
      // File may not exist
    }
  }
}

export const imageService: ImageService = new LocalImageService();
