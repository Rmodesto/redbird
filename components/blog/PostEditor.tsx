'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import { Fragment } from '@tiptap/pm/model';
import { useCallback } from 'react';
import { FigureImage } from './extensions/FigureImage';
import { ImageGallery } from './extensions/ImageGallery';

interface PostEditorProps {
  content: string;
  onChange: (html: string) => void;
}

async function uploadFile(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    return data.url || null;
  } catch (e) {
    console.error('Upload failed:', e);
    return null;
  }
}

export default function PostEditor({ content, onChange }: PostEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      FigureImage,
      ImageGallery,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing your post...' }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = useCallback(() => {
    if (!editor) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await uploadFile(file);
      if (url) {
        editor.chain().focus().setFigureImage({ src: url }).run();
      }
    };
    input.click();
  }, [editor]);

  const addGallery = useCallback(() => {
    if (!editor) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async () => {
      const files = input.files;
      if (!files || files.length < 2) {
        alert('Please select at least 2 images for a gallery.');
        return;
      }
      const selectedFiles = Array.from(files).slice(0, 3);
      const urls = await Promise.all(selectedFiles.map(uploadFile));
      const validImages = urls
        .filter((url): url is string => url !== null)
        .map((url) => ({ src: url }));
      if (validImages.length >= 2) {
        const columns = validImages.length === 3 ? 3 : 2;
        editor.chain().focus().insertGallery({ images: validImages, columns: columns as 2 | 3 }).run();
      }
    };
    input.click();
  }, [editor]);

  const addVideo = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter YouTube URL');
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  // Splits a block at hard break boundaries before applying heading,
  // so only the selected line becomes a heading (not the entire block).
  const smartToggleHeading = useCallback((level: 1 | 2 | 3 | 4 | 5 | 6) => {
    if (!editor) return;

    const { state, view } = editor;
    const { from, $from } = state.selection;
    const parent = $from.parent;

    // If no hard breaks, standard toggle works fine
    let hasHardBreaks = false;
    parent.forEach(node => {
      if (node.type.name === 'hardBreak') hasHardBreaks = true;
    });

    if (!hasHardBreaks) {
      editor.chain().focus().toggleHeading({ level }).run();
      return;
    }

    // Split content into segments at each hard break
    const parentStart = $from.start();
    const parentEnd = $from.end();
    const segments: { from: number; to: number }[] = [];
    let segStart = parentStart;

    parent.forEach((node, offset) => {
      if (node.type.name === 'hardBreak') {
        segments.push({ from: segStart, to: parentStart + offset });
        segStart = parentStart + offset + node.nodeSize;
      }
    });
    segments.push({ from: segStart, to: parentEnd });

    // Find the segment containing the cursor
    const targetIdx = segments.findIndex(seg => from >= seg.from && from <= seg.to);
    if (targetIdx === -1) {
      editor.chain().focus().toggleHeading({ level }).run();
      return;
    }

    const schema = state.schema;
    const isAlreadyHeading = parent.type.name === 'heading' && parent.attrs.level === level;

    const nodes = segments.map((seg, i) => {
      const content = seg.from < seg.to
        ? state.doc.slice(seg.from, seg.to).content
        : Fragment.empty;
      if (i === targetIdx && !isAlreadyHeading) {
        return schema.nodes.heading.create({ level }, content);
      }
      return schema.nodes.paragraph.create(null, content);
    });

    const { tr } = state;
    tr.replaceWith($from.before(), $from.after(), nodes);
    view.dispatch(tr);
    editor.commands.focus();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-700 bg-gray-900">
        <ToolButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="B"
        />
        <ToolButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="I"
        />
        <ToolButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => smartToggleHeading(2)}
          label="H2"
        />
        <ToolButton
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => smartToggleHeading(3)}
          label="H3"
        />
        <ToolButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="UL"
        />
        <ToolButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="OL"
        />
        <ToolButton
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          label="Quote"
        />
        <ToolButton
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          label="Code"
        />
        <ToolButton active={false} onClick={addImage} label="Image" />
        <ToolButton active={false} onClick={addGallery} label="Gallery" />
        <ToolButton active={false} onClick={addVideo} label="Video" />
        <ToolButton
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
        className="prose prose-invert max-w-none p-4 min-h-[400px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px]"
      />
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
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
