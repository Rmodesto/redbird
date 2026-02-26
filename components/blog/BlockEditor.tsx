'use client';

import { useCallback } from 'react';
import type { ContentBlock } from '@/lib/blog/block-types';
import BlockWrapper from './blocks/BlockWrapper';
import AddBlockMenu from './blocks/AddBlockMenu';
import TextBlockEditor from './blocks/TextBlockEditor';
import FullWidthImageEditor from './blocks/FullWidthImageEditor';
import ImageGridEditor from './blocks/ImageGridEditor';
import ImageTextWrapEditor from './blocks/ImageTextWrapEditor';

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const updateBlock = useCallback(
    (index: number, updated: ContentBlock) => {
      const next = [...blocks];
      next[index] = updated;
      onChange(next);
    },
    [blocks, onChange],
  );

  const deleteBlock = useCallback(
    (index: number) => {
      onChange(blocks.filter((_, i) => i !== index));
    },
    [blocks, onChange],
  );

  const moveBlock = useCallback(
    (index: number, dir: -1 | 1) => {
      const target = index + dir;
      if (target < 0 || target >= blocks.length) return;
      const next = [...blocks];
      [next[index], next[target]] = [next[target], next[index]];
      onChange(next);
    },
    [blocks, onChange],
  );

  const insertBlock = useCallback(
    (atIndex: number, block: ContentBlock) => {
      const next = [...blocks];
      next.splice(atIndex, 0, block);
      onChange(next);
    },
    [blocks, onChange],
  );

  return (
    <div className="block-editor space-y-2">
      <AddBlockMenu onAdd={(block) => insertBlock(0, block)} />

      {blocks.map((block, index) => (
        <div key={block.id}>
          <BlockWrapper
            type={block.type}
            index={index}
            total={blocks.length}
            onMoveUp={() => moveBlock(index, -1)}
            onMoveDown={() => moveBlock(index, 1)}
            onDelete={() => deleteBlock(index)}
          >
            {block.type === 'text' && (
              <TextBlockEditor block={block} onChange={(b) => updateBlock(index, b)} />
            )}
            {block.type === 'full-width-image' && (
              <FullWidthImageEditor block={block} onChange={(b) => updateBlock(index, b)} />
            )}
            {block.type === 'image-grid' && (
              <ImageGridEditor block={block} onChange={(b) => updateBlock(index, b)} />
            )}
            {block.type === 'image-text-wrap' && (
              <ImageTextWrapEditor block={block} onChange={(b) => updateBlock(index, b)} />
            )}
          </BlockWrapper>

          <AddBlockMenu onAdd={(newBlock) => insertBlock(index + 1, newBlock)} />
        </div>
      ))}
    </div>
  );
}
