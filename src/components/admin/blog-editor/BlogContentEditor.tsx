import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';

import BlogEditorToolbar from './BlogEditorToolbar';
import { createBlogEditorExtensions } from './blog-editor-extensions';

interface BlogContentEditorProps {
  value: string;
  onChange(value: string): void;
  onUploadImage(file: File): Promise<string>;
  compatibility: 'visual' | 'source-only';
  reasons?: string[];
}

export default function BlogContentEditor({
  value,
  onChange,
  onUploadImage,
  compatibility,
  reasons = [],
}: BlogContentEditorProps) {
  const [mode, setMode] = useState<'visual' | 'html'>(compatibility === 'visual' ? 'visual' : 'html');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: createBlogEditorExtensions(),
    content: compatibility === 'visual' ? value : '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        'aria-label': 'Nội dung bài viết',
        class: 'min-h-[420px] px-5 py-4 outline-none [&_a]:text-admin-accent-strong [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-admin-border [&_td]:p-2 [&_ul]:list-disc [&_ul]:pl-6',
      },
    },
    onUpdate: ({ editor: activeEditor }) => onChange(activeEditor.getHTML()),
  });

  useEffect(() => {
    setMode(compatibility === 'visual' ? 'visual' : 'html');
  }, [compatibility]);

  useEffect(() => {
    if (!editor || compatibility !== 'visual' || editor.getHTML() === value) return;
    editor.commands.setContent(value, { emitUpdate: false, errorOnInvalidContent: true });
  }, [compatibility, editor, value]);

  async function upload(file?: File) {
    if (!file || !editor) return;
    setUploading(true);
    try {
      const objectKey = await onUploadImage(file);
      editor.chain().focus().setImage({ src: `blog-asset:${objectKey}`, alt: file.name }).run();
    } catch {
      // The form-level upload handler already surfaces a user-facing toast.
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="overflow-hidden rounded-[12px] border border-admin-border-input bg-admin-surface">
      <div className="flex items-center justify-between gap-3 border-b border-admin-border px-3 py-2">
        <div className="flex rounded-lg bg-admin-border-soft p-1">
          <button type="button" onClick={() => compatibility === 'visual' && setMode('visual')} disabled={compatibility !== 'visual'} className={`rounded-md px-3 py-1.5 text-[12px] font-bold ${mode === 'visual' ? 'bg-admin-surface text-admin-ink shadow-sm' : 'text-admin-muted'} disabled:cursor-not-allowed disabled:opacity-45`}>Trực quan</button>
          <button type="button" onClick={() => setMode('html')} className={`rounded-md px-3 py-1.5 text-[12px] font-bold ${mode === 'html' ? 'bg-admin-surface text-admin-ink shadow-sm' : 'text-admin-muted'}`}>HTML</button>
        </div>
        <span className="text-[11.5px] text-admin-muted-2">{compatibility === 'visual' ? 'Có thể chỉnh trực quan an toàn' : 'Bảo toàn HTML gốc'}</span>
      </div>

      {compatibility === 'source-only' && (
        <div role="note" className="border-b border-amber-300/70 bg-amber-50 px-4 py-3 text-[12px] leading-[1.5] text-admin-ink-soft">
          Bài này chứa cấu trúc legacy cần giữ nguyên, nên chế độ Trực quan đã tắt. {reasons[0]}
        </div>
      )}

      {mode === 'visual' && editor ? (
        <>
          <BlogEditorToolbar editor={editor} onUploadClick={() => inputRef.current?.click()} uploading={uploading} />
          <EditorContent editor={editor} />
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => void upload(event.target.files?.[0])} />
        </>
      ) : (
        <textarea
          id="blog-content"
          aria-label="Nội dung bài viết HTML"
          rows={22}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          className="w-full resize-y bg-admin-surface px-4 py-3 font-mono text-[13px] leading-[1.55] outline-none"
        />
      )}
    </div>
  );
}
