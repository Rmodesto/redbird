'use client';

import { useRef, useState } from 'react';

interface ImageUploadButtonProps {
  onUploaded: (url: string) => void;
  label?: string;
  className?: string;
}

export default function ImageUploadButton({
  onUploaded,
  label = 'Upload Image',
  className = '',
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) onUploaded(data.url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition-colors ${className}`}
      >
        {uploading ? 'Uploading...' : label}
      </button>
    </>
  );
}
