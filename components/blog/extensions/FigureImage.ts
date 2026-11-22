import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FigureImageView from './FigureImageView';

export type ImageAlignment = 'left' | 'center' | 'right';
export type ImageSize = 'small' | 'medium' | 'large' | 'full';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    figureImage: {
      setFigureImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        caption?: string;
        alignment?: ImageAlignment;
        size?: ImageSize;
      }) => ReturnType;
      updateFigureImage: (options: Partial<{
        src: string;
        alt: string;
        title: string;
        caption: string;
        alignment: ImageAlignment;
        size: ImageSize;
      }>) => ReturnType;
    };
  }
}

const alignmentClasses: Record<ImageAlignment, string> = {
  left: 'image-align-left',
  center: 'image-align-center',
  right: 'image-align-right',
};

const sizeClasses: Record<ImageSize, string> = {
  small: 'image-size-small',
  medium: 'image-size-medium',
  large: 'image-size-large',
  full: 'image-size-full',
};

export const FigureImage = Node.create({
  name: 'figureImage',

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
      title: { default: '' },
      caption: { default: '' },
      alignment: { default: 'center' as ImageAlignment },
      size: { default: 'full' as ImageSize },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="image"]',
        getAttrs(dom) {
          const el = dom as HTMLElement;
          const img = el.querySelector('img');
          const figcaption = el.querySelector('figcaption');
          return {
            src: img?.getAttribute('src') || '',
            alt: img?.getAttribute('alt') || '',
            title: img?.getAttribute('title') || '',
            caption: figcaption?.textContent || '',
            alignment: (el.getAttribute('data-alignment') as ImageAlignment) || 'center',
            size: (el.getAttribute('data-size') as ImageSize) || 'full',
          };
        },
      },
      // Backward compatibility: parse bare <img> tags
      {
        tag: 'img[src]',
        getAttrs(dom) {
          const el = dom as HTMLImageElement;
          return {
            src: el.getAttribute('src') || '',
            alt: el.getAttribute('alt') || '',
            title: el.getAttribute('title') || '',
            caption: '',
            alignment: 'center' as ImageAlignment,
            size: 'full' as ImageSize,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, title, caption, alignment, size } = HTMLAttributes;
    const alignClass = alignmentClasses[alignment as ImageAlignment] || 'image-align-center';
    const sizeClass = sizeClasses[size as ImageSize] || 'image-size-full';

    return [
      'figure',
      mergeAttributes({
        'data-type': 'image',
        'data-alignment': alignment,
        'data-size': size,
        class: `figure-image ${alignClass} ${sizeClass}`,
      }),
      ['img', { src, alt, title }],
      ['figcaption', {}, caption || ''],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigureImageView);
  },

  addCommands() {
    return {
      setFigureImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              alt: options.alt || '',
              title: options.title || '',
              caption: options.caption || '',
              alignment: options.alignment || 'center',
              size: options.size || 'full',
            },
          });
        },
      updateFigureImage:
        (options) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, options);
        },
    };
  },
});

export default FigureImage;
