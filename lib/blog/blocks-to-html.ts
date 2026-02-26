import type { ContentBlock } from './block-types';

const sizeMap: Record<string, string> = {
  '25': 'image-size-small',
  '50': 'image-size-medium',
  '75': 'image-size-large',
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderTextBlock(block: Extract<ContentBlock, { type: 'text' }>): string {
  return block.html;
}

function renderImageTextWrap(block: Extract<ContentBlock, { type: 'image-text-wrap' }>): string {
  const alignClass = block.alignment === 'left' ? 'image-align-left' : 'image-align-right';
  const sizeClass = sizeMap[block.size] || 'image-size-medium';
  const caption = block.caption
    ? `<figcaption>${escapeHtml(block.caption)}</figcaption>`
    : '';

  return (
    `<figure data-type="image" data-alignment="${block.alignment}" data-size="${block.size}" class="figure-image ${alignClass} ${sizeClass}">` +
    `<img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" />` +
    caption +
    `</figure>` +
    block.html +
    `<div style="clear:both"></div>`
  );
}

function renderImageGrid(block: Extract<ContentBlock, { type: 'image-grid' }>): string {
  const figures = block.images
    .map((img) => {
      const caption = img.caption
        ? `<figcaption>${escapeHtml(img.caption)}</figcaption>`
        : '';
      return (
        `<figure data-type="image" data-alignment="center" data-size="full" class="figure-image image-align-center image-size-full">` +
        `<img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" />` +
        caption +
        `</figure>`
      );
    })
    .join('');

  return (
    `<div data-type="image-gallery" data-columns="${block.columns}" class="image-gallery image-gallery-${block.columns}">` +
    figures +
    `</div>`
  );
}

function renderFullWidthImage(block: Extract<ContentBlock, { type: 'full-width-image' }>): string {
  const caption = block.caption
    ? `<figcaption>${escapeHtml(block.caption)}</figcaption>`
    : '';

  return (
    `<figure data-type="image" data-alignment="center" data-size="full" class="figure-image image-align-center image-size-full">` +
    `<img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" />` +
    caption +
    `</figure>`
  );
}

export function blocksToHtml(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'text':
          return renderTextBlock(block);
        case 'image-text-wrap':
          return renderImageTextWrap(block);
        case 'image-grid':
          return renderImageGrid(block);
        case 'full-width-image':
          return renderFullWidthImage(block);
      }
    })
    .join('\n');
}
