'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import { useCallback } from 'react';
import type { TextBlock } from '@/lib/blog/block-types';

interface TextBlockEditorProps {
  block: TextBlock;
  onChange: (updated: TextBlock) => void;
}

export default function TextBlockEditor({ block, onChange }: TextBlockEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start typing...' }),
      Youtube.configure({ controls: true, nocookie: true }),
    ],
    content: block.html,
    onUpdate: ({ editor }) => {
      onChange({ ...block, html: editor.getHTML() });
    },
  });

  const addVideo = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter YouTube URL');
    if (url) editor.commands.setYoutubeVideo({ src: url });
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-700 bg-gray-900">
        <TBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} label="B" />
        <TBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} label="I" />
        <TBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="H2" />
        <TBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="H3" />
        <TBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} label="UL" />
        <TBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="OL" />
        <TBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote" />
        <TBtn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} label="Code" />
        <TBtn active={false} onClick={addVideo} label="Video" />
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
        className="prose prose-invert max-w-none p-4 min-h-[120px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[120px]"
      />
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
