'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import type { ImageTextWrapBlock } from '@/lib/blog/block-types';
import ImageUploadButton from './ImageUploadButton';

interface ImageTextWrapEditorProps {
  block: ImageTextWrapBlock;
  onChange: (updated: ImageTextWrapBlock) => void;
}

export default function ImageTextWrapEditor({ block, onChange }: ImageTextWrapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write text to wrap around the image...' }),
    ],
    content: block.html,
    onUpdate: ({ editor }) => {
      onChange({ ...block, html: editor.getHTML() });
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-400">Align:</span>
        {(['left', 'right'] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => onChange({ ...block, alignment: a })}
            className={`px-3 py-1 text-sm rounded capitalize transition-colors ${
              block.alignment === a ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {a}
          </button>
        ))}
        <span className="text-sm text-gray-400 ml-2">Size:</span>
        {(['25', '50', '75'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange({ ...block, size: s })}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              block.size === s ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {s}%
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="w-48 shrink-0 space-y-2">
          {block.src ? (
            <div className="relative">
              <img src={block.src} alt={block.alt} className="w-full rounded-lg" />
              <button
                type="button"
                onClick={() => onChange({ ...block, src: '' })}
                className="absolute top-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-xs hover:bg-black/90"
              >
                &times;
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
              <ImageUploadButton onUploaded={(url) => onChange({ ...block, src: url })} label="Upload" />
            </div>
          )}
          <input
            type="text"
            value={block.alt}
            onChange={(e) => onChange({ ...block, alt: e.target.value })}
            placeholder="Alt text"
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white"
          />
          <input
            type="text"
            value={block.caption}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Caption"
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white"
          />
        </div>

        <div className="flex-1 min-w-0">
          {editor && (
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <div className="flex flex-wrap gap-1 p-1.5 border-b border-gray-700 bg-gray-900">
                <TBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} label="B" />
                <TBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} label="I" />
                <TBtn
                  active={false}
                  onClick={() => {
                    const url = window.prompt('URL');
                    if (url) editor.chain().focus().setLink({ href: url }).run();
                  }}
                  label="Link"
                />
              </div>
              <EditorContent
                editor={editor}
                className="prose prose-invert max-w-none p-3 min-h-[100px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 text-xs rounded transition-colors ${
        active ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );
}
