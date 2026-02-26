'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useState } from 'react';
import type { ImageAlignment, ImageSize } from './FigureImage';

const sizeOptions: { label: string; value: ImageSize }[] = [
  { label: '25%', value: 'small' },
  { label: '50%', value: 'medium' },
  { label: '75%', value: 'large' },
  { label: '100%', value: 'full' },
];

const alignmentOptions: { label: string; value: ImageAlignment; icon: string }[] = [
  { label: 'Left', value: 'left', icon: '◧' },
  { label: 'Center', value: 'center', icon: '▣' },
  { label: 'Right', value: 'right', icon: '◨' },
];

export default function FigureImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, caption, alignment, size } = node.attrs;
  const [showToolbar, setShowToolbar] = useState(false);

  return (
    <NodeViewWrapper
      className={`figure-image image-align-${alignment} image-size-${size} ${selected ? 'figure-image-selected' : ''}`}
      data-type="image"
      data-alignment={alignment}
      data-size={size}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
    >
      {/* Floating toolbar */}
      {(showToolbar || selected) && (
        <div className="figure-image-toolbar" contentEditable={false}>
          {/* Size controls */}
          <div className="toolbar-group">
            {sizeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`toolbar-btn ${size === opt.value ? 'toolbar-btn-active' : ''}`}
                onClick={() => updateAttributes({ size: opt.value })}
                title={`Size: ${opt.label}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="toolbar-divider" />
          {/* Alignment controls */}
          <div className="toolbar-group">
            {alignmentOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`toolbar-btn ${alignment === opt.value ? 'toolbar-btn-active' : ''}`}
                onClick={() => updateAttributes({ alignment: opt.value })}
                title={`Align: ${opt.label}`}
              >
                {opt.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image */}
      <img
        src={src}
        alt={alt}
        draggable={false}
      />

      {/* Editable caption */}
      <figcaption
        className="figure-caption"
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Add a caption..."
        onBlur={(e) => updateAttributes({ caption: e.currentTarget.textContent || '' })}
      >
        {caption}
      </figcaption>
    </NodeViewWrapper>
  );
}
