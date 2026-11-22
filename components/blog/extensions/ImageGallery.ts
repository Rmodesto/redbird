import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageGallery: {
      insertGallery: (options: {
        images: { src: string; alt?: string }[];
        columns?: 2 | 3;
      }) => ReturnType;
    };
  }
}

export const ImageGallery = Node.create({
  name: 'imageGallery',

  group: 'block',

  content: 'figureImage+',

  defining: true,

  addAttributes() {
    return {
      columns: {
        default: 2,
        parseHTML: (element) => {
          const cols = element.getAttribute('data-columns');
          return cols ? parseInt(cols, 10) : 2;
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-gallery"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const cols = HTMLAttributes.columns || 2;
    return [
      'div',
      mergeAttributes({
        'data-type': 'image-gallery',
        'data-columns': cols,
        class: `image-gallery image-gallery-${cols}`,
      }),
      0, // content hole
    ];
  },

  addCommands() {
    return {
      insertGallery:
        ({ images, columns = 2 }) =>
        ({ commands }) => {
          const figureNodes = images.map((img) => ({
            type: 'figureImage',
            attrs: {
              src: img.src,
              alt: img.alt || '',
              caption: '',
              alignment: 'center',
              size: 'full',
            },
          }));

          return commands.insertContent({
            type: this.name,
            attrs: { columns },
            content: figureNodes,
          });
        },
    };
  },
});

export default ImageGallery;
