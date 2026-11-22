'use client';

import { useState } from 'react';

const TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  'image-text-wrap': 'Image + Text',
  'image-grid': 'Image Grid',
  'full-width-image': 'Full-Width Image',
};

interface BlockWrapperProps {
  type: string;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

export default function BlockWrapper({
  type,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
  children,
}: BlockWrapperProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`block-wrapper ${hovered ? 'block-wrapper-hover' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`block-wrapper-controls ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-xs text-gray-400 mr-2">{TYPE_LABELS[type] || type}</span>
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="block-control-btn"
          title="Move up"
        >
          &uarr;
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="block-control-btn"
          title="Move down"
        >
          &darr;
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="block-control-btn text-red-400 hover:text-red-300"
          title="Delete block"
        >
          &times;
        </button>
      </div>
      {children}
    </div>
  );
}
