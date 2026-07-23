import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { TableKit, TableRow } from '@tiptap/extension-table';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { ReactNodeViewRenderer } from '@tiptap/react';

import BlogAssetImage from './BlogAssetImage';

const BlogImage = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(BlogAssetImage);
  },
});

const BlogTableRow = TableRow.extend({
  content: 'tableCell*',
});

export function createBlogEditorExtensions() {
  return [
    StarterKit.configure({
      blockquote: false,
      code: false,
      codeBlock: false,
      heading: { levels: [1, 2, 3] },
      link: false,
      strike: false,
      underline: false,
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: false,
      defaultProtocol: 'https',
      HTMLAttributes: { rel: 'noopener noreferrer' },
    }),
    BlogImage.configure({
      allowBase64: false,
      inline: false,
    }),
    TableKit.configure({
      table: { resizable: false },
      tableHeader: false,
      tableRow: false,
    }),
    BlogTableRow,
  ];
}
