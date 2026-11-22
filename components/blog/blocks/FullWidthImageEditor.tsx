'use client';

import type { FullWidthImageBlock } from '@/lib/blog/block-types';
import ImageUploadButton from './ImageUploadButton';

interface FullWidthImageEditorProps {
  block: FullWidthImageBlock;
  onChange: (updated: FullWidthImageBlock) => void;
}

export default function FullWidthImageEditor({ block, onChange }: FullWidthImageEditorProps) {
  return (
    <div className="space-y-3">
      {block.src ? (
        <div className="relative">
          <img
            src={block.src}
            alt={block.alt}
            className="w-full rounded-lg"
          />
          <button
            type="button"
            onClick={() => onChange({ ...block, src: '' })}
            className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs hover:bg-black/90"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <ImageUploadButton onUploaded={(url) => onChange({ ...block, src: url })} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={block.alt}
          onChange={(e) => onChange({ ...block, alt: e.target.value })}
          placeholder="Alt text"
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white"
        />
        <input
          type="text"
          value={block.caption}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          placeholder="Caption (optional)"
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white"
        />
      </div>
    </div>
  );
}
