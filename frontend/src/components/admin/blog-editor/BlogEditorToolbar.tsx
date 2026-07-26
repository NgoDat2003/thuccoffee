import type { Editor } from '@tiptap/react';

interface BlogEditorToolbarProps {
  editor: Editor;
  onUploadClick: () => void;
  uploading: boolean;
}

const buttonClass = 'min-h-9 rounded-md border border-admin-border px-2.5 text-[12px] font-bold text-admin-ink hover:border-admin-accent disabled:opacity-40 aria-pressed:border-admin-accent aria-pressed:bg-admin-accent/5';

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
    <div className="flex flex-col gap-2 border-b border-admin-border bg-admin-border-soft/35 p-2.5">
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleBold().run()} aria-pressed={editor.isActive('bold')}>Đậm</button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleItalic().run()} aria-pressed={editor.isActive('italic')}>Nghiêng</button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleUnderline().run()} aria-pressed={editor.isActive('underline')}>Gạch chân</button>
        {[1, 2, 3].map((level) => (
          <button key={level} type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()} aria-pressed={editor.isActive('heading', { level })}>H{level}</button>
        ))}
        
        <div className="h-9 w-px bg-admin-border mx-1" />

        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-pressed={editor.isActive('bulletList')}>Danh sách</button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-pressed={editor.isActive('orderedList')}>Đánh số</button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleBlockquote().run()} aria-pressed={editor.isActive('blockquote')}>Trích dẫn</button>
        
        <div className="h-9 w-px bg-admin-border mx-1" />

        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleCode().run()} aria-pressed={editor.isActive('code')}>Mã</button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleCodeBlock().run()} aria-pressed={editor.isActive('codeBlock')}>Khối mã</button>

        <div className="h-9 w-px bg-admin-border mx-1" />

        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().setTextAlign('left').run()} aria-pressed={editor.isActive({ textAlign: 'left' })}>Căn trái</button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().setTextAlign('center').run()} aria-pressed={editor.isActive({ textAlign: 'center' })}>Căn giữa</button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().setTextAlign('right').run()} aria-pressed={editor.isActive({ textAlign: 'right' })}>Căn phải</button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().setTextAlign('justify').run()} aria-pressed={editor.isActive({ textAlign: 'justify' })}>Căn đều</button>

        <div className="h-9 w-px bg-admin-border mx-1" />

        <select
          className={`${buttonClass} bg-transparent py-0 cursor-pointer`}
          value={editor.getAttributes('textStyle').color || ''}
          onChange={(e) => {
            const val = e.target.value;
            if (val) {
              editor.chain().focus().setColor(val).run();
            } else {
              editor.chain().focus().unsetColor().run();
            }
          }}
        >
          <option value="">Màu chữ</option>
          <option value="#ef4444">Đỏ</option>
          <option value="#3b82f6">Xanh dương</option>
          <option value="#10b981">Xanh lá</option>
          <option value="#513829">Nâu Thức</option>
        </select>

        <input
          type="color"
          aria-label="Chọn màu chữ tự do"
          className="h-9 w-9 cursor-pointer rounded-md border border-admin-border bg-transparent p-0.5"
          value={editor.getAttributes('textStyle').color || '#000000'}
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        />

        <select
          className={`${buttonClass} bg-transparent py-0 cursor-pointer`}
          value={editor.isActive('highlight') ? editor.getAttributes('highlight').color || '#fef08a' : ''}
          onChange={(e) => {
            const val = e.target.value;
            if (val) {
              editor.chain().focus().setHighlight({ color: val }).run();
            } else {
              editor.chain().focus().unsetHighlight().run();
            }
          }}
        >
          <option value="">Làm nổi</option>
          <option value="#fef08a">Vàng</option>
          <option value="#bbf7d0">Xanh lá</option>
          <option value="#fecaca">Đỏ</option>
        </select>

        <div className="h-9 w-px bg-admin-border mx-1" />

        <button type="button" className={buttonClass} onClick={setLink}>Liên kết</button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().setHorizontalRule().run()}>Đường kẻ</button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()}>Bảng 2×2</button>
        <button type="button" className={buttonClass} disabled={uploading} onClick={onUploadClick}>{uploading ? 'Đang tải ảnh…' : 'Chèn ảnh'}</button>
        <button type="button" className={buttonClass} disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>Hoàn tác</button>
        <button type="button" className={buttonClass} disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>Làm lại</button>
      </div>

      {editor.isActive('table') && (
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-admin-accent/20 bg-admin-accent/5 p-1.5">
          <span className="self-center px-2 text-[11px] font-bold uppercase tracking-wider text-admin-accent-strong">Thao tác bảng:</span>
          <button type="button" className={buttonClass} onClick={() => editor.chain().focus().mergeCells().run()}>Gộp ô</button>
          <button type="button" className={buttonClass} onClick={() => editor.chain().focus().splitCell().run()}>Tách ô</button>
          <button type="button" className={buttonClass} onClick={() => editor.chain().focus().addRowBefore().run()}>+ Dòng trên</button>
          <button type="button" className={buttonClass} onClick={() => editor.chain().focus().addRowAfter().run()}>+ Dòng dưới</button>
          <button type="button" className={buttonClass} onClick={() => editor.chain().focus().addColumnBefore().run()}>+ Cột trái</button>
          <button type="button" className={buttonClass} onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Cột phải</button>
          <button type="button" className={buttonClass} onClick={() => editor.chain().focus().deleteRow().run()}>Xóa dòng</button>
          <button type="button" className={buttonClass} onClick={() => editor.chain().focus().deleteColumn().run()}>Xóa cột</button>
          <button type="button" className={buttonClass} onClick={() => editor.chain().focus().deleteTable().run()}>Xóa bảng</button>
        </div>
      )}
    </div>
  );
}

