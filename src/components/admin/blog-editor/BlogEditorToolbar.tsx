import type { Editor } from '@tiptap/react';

interface BlogEditorToolbarProps {
  editor: Editor;
  onUploadClick: () => void;
  uploading: boolean;
}

const buttonClass = 'min-h-9 rounded-md border border-admin-border px-2.5 text-[12px] font-bold text-admin-ink hover:border-admin-accent disabled:opacity-40';

export default function BlogEditorToolbar({ editor, onUploadClick, uploading }: BlogEditorToolbarProps) {
  function setLink() {
    const previous = editor.getAttributes('link').href as string | undefined;
    const href = window.prompt('Đường dẫn (http, https, mailto hoặc tel)', previous ?? 'https://');
    if (href === null) return;
    if (!href) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    if (!/^(https?:\/\/|mailto:|tel:)/i.test(href)) {
      window.alert('Đường dẫn không hợp lệ.');
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  }

  return (
    <div className="flex flex-wrap gap-1.5 border-b border-admin-border bg-admin-border-soft/35 p-2.5">
      <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleBold().run()} aria-pressed={editor.isActive('bold')}>Đậm</button>
      <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleItalic().run()} aria-pressed={editor.isActive('italic')}>Nghiêng</button>
      <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleUnderline().run()} aria-pressed={editor.isActive('underline')}>Gạch chân</button>
      {[1, 2, 3].map((level) => (
        <button key={level} type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()} aria-pressed={editor.isActive('heading', { level })}>H{level}</button>
      ))}
      <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-pressed={editor.isActive('bulletList')}>Danh sách</button>
      <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-pressed={editor.isActive('orderedList')}>Đánh số</button>
      <button type="button" className={buttonClass} onClick={setLink}>Liên kết</button>
      <button type="button" className={buttonClass} onClick={() => editor.chain().focus().setHorizontalRule().run()}>Đường kẻ</button>
      <button type="button" className={buttonClass} onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: false }).run()}>Bảng 2×2</button>
      <button type="button" className={buttonClass} disabled={uploading} onClick={onUploadClick}>{uploading ? 'Đang tải ảnh…' : 'Chèn ảnh'}</button>
      <button type="button" className={buttonClass} disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>Hoàn tác</button>
      <button type="button" className={buttonClass} disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>Làm lại</button>
    </div>
  );
}
