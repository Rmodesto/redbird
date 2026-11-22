'use client';

import type { ImageGridBlock } from '@/lib/blog/block-types';
import ImageUploadButton from './ImageUploadButton';

interface ImageGridEditorProps {
  block: ImageGridBlock;
  onChange: (updated: ImageGridBlock) => void;
}

export default function ImageGridEditor({ block, onChange }: ImageGridEditorProps) {
  function updateImage(index: number, field: 'alt' | 'caption', value: string) {
    const images = [...block.images];
    images[index] = { ...images[index], [field]: value };
    onChange({ ...block, images });
  }

  function removeImage(index: number) {
    const images = block.images.filter((_, i) => i !== index);
    onChange({ ...block, images });
  }

  function addImage(url: string) {
    if (block.images.length >= block.columns) return;
    const images = [...block.images, { src: url, alt: '', caption: '' }];
    onChange({ ...block, images });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">Columns:</span>
        {([2, 3] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange({ ...block, columns: n, images: block.images.slice(0, n) })}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              block.columns === n ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className={`grid gap-3 ${block.columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {Array.from({ length: block.columns }).map((_, i) => {
          const img = block.images[i];
          return (
            <div key={i} className="space-y-2">
              {img ? (
                <div className="relative">
                  <img src={img.src} alt={img.alt} className="w-full rounded-lg aspect-video object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-xs hover:bg-black/90"
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center aspect-video flex items-center justify-center">
                  <ImageUploadButton onUploaded={addImage} label="Upload" />
                </div>
              )}
              {img && (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={img.alt}
                    onChange={(e) => updateImage(i, 'alt', e.target.value)}
                    placeholder="Alt text"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={img.caption}
                    onChange={(e) => updateImage(i, 'caption', e.target.value)}
                    placeholder="Caption"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
