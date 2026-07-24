import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { TableKit } from '@tiptap/extension-table';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { ReactNodeViewRenderer } from '@tiptap/react';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';

import BlogAssetImage from './BlogAssetImage';

const BlogImage = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(BlogAssetImage);
  },
});

export function createBlogEditorExtensions() {
  return [
    StarterKit.configure({
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
      table: { resizable: true },
      tableHeader: {},
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
  ];
}

