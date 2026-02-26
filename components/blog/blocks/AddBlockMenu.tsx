'use client';

import { useState, useRef, useEffect } from 'react';
import type { ContentBlock } from '@/lib/blog/block-types';
import { generateBlockId } from '@/lib/blog/block-types';

interface AddBlockMenuProps {
  onAdd: (block: ContentBlock) => void;
}

const BLOCK_OPTIONS = [
  { type: 'text' as const, label: 'Text', desc: 'Rich text with headings, lists, links' },
  { type: 'full-width-image' as const, label: 'Full-Width Image', desc: 'Single image spanning full width' },
  { type: 'image-grid' as const, label: 'Image Grid', desc: '2 or 3 images in a row' },
  { type: 'image-text-wrap' as const, label: 'Image + Text Wrap', desc: 'Image with text flowing around it' },
] as const;

export default function AddBlockMenu({ onAdd }: AddBlockMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function createBlock(type: (typeof BLOCK_OPTIONS)[number]['type']) {
    const id = generateBlockId();
    let block: ContentBlock;
    switch (type) {
      case 'text':
        block = { id, type: 'text', html: '' };
        break;
      case 'full-width-image':
        block = { id, type: 'full-width-image', src: '', alt: '', caption: '' };
        break;
      case 'image-grid':
        block = { id, type: 'image-grid', columns: 2, images: [] };
        break;
      case 'image-text-wrap':
        block = { id, type: 'image-text-wrap', src: '', alt: '', caption: '', alignment: 'left', size: '50', html: '' };
        break;
    }
    onAdd(block);
    setOpen(false);
  }

  return (
    <div ref={menuRef} className="relative flex justify-center">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="add-block-btn"
        title="Add block"
      >
        +
      </button>
      {open && (
        <div className="absolute top-full mt-1 z-20 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 min-w-[220px]">
          {BLOCK_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => createBlock(opt.type)}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors"
            >
              <div className="text-sm text-white font-medium">{opt.label}</div>
              <div className="text-xs text-gray-400">{opt.desc}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
