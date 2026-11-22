export interface TextBlock {
  id: string;
  type: 'text';
  html: string;
}

export interface ImageTextWrapBlock {
  id: string;
  type: 'image-text-wrap';
  src: string;
  alt: string;
  caption: string;
  alignment: 'left' | 'right';
  size: '25' | '50' | '75';
  html: string;
}

export interface ImageGridBlock {
  id: string;
  type: 'image-grid';
  columns: 2 | 3;
  images: { src: string; alt: string; caption: string }[];
}

export interface FullWidthImageBlock {
  id: string;
  type: 'full-width-image';
  src: string;
  alt: string;
  caption: string;
}

export type ContentBlock =
  | TextBlock
  | ImageTextWrapBlock
  | ImageGridBlock
  | FullWidthImageBlock;

let counter = 0;
export function generateBlockId(): string {
  return `block-${Date.now()}-${++counter}`;
}
