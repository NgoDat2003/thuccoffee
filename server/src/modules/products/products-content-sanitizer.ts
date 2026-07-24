import sanitizeHtml from 'sanitize-html';

const allowedStyles = {
  '*': {
    'border-collapse': [/^collapse$/],
    border: [/^(?:none|solid black 1\.0pt)$/],
    'border-color': [/^windowtext$/],
    width: [/^\d+(?:\.\d+)?(?:px|pt)$/],
    height: [/^\d+(?:\.\d+)?(?:px|pt)$/],
    'text-align': [/^(?:center|justify|left|right)$/],
    'vertical-align': [/^middle$/],
    'white-space': [/^normal$/],
    'font-size': [/^\d+(?:\.\d+)?(?:px|pt)$/],
    'font-family': [
      /^(?:Arial, Helvetica, sans-serif|Arial,Helvetica,sans-serif|Arial,sans-serif|Courier New,Courier,monospace|Times New Roman,Times,serif)$/,
    ],
    color: [/^(?:#[0-9a-f]{6}|black|inherit|null)$/i],
    'background-color': [/^#[0-9a-f]{6}$/i],
    'margin-left': [/^\d+(?:\.\d+)?(?:px|pt)$/],
  },
};

// Mirrors the blog sanitizer's tag/attribute set (see blog-content-sanitizer.ts)
// so the shared ContentEditor toolbar behaves identically for product content.
// Only the image src scheme differs (product-asset vs blog-asset).
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    'a', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'hr', 'img', 'li',
    'mark', 'ol', 'p', 'pre', 'span', 'strong', 'table', 'tbody', 'td', 'th', 'tr', 'u', 'ul',
  ],
  allowedAttributes: {
    a: ['href', 'rel', 'target'],
    div: ['style'],
    h1: ['style'],
    h2: ['style'],
    h3: ['style'],
    img: ['alt', 'src', 'style'],
    li: ['style'],
    mark: ['data-color', 'style'],
    p: ['style'],
    span: ['style'],
    table: ['border', 'cellpadding', 'cellspacing', 'class', 'style'],
    td: ['colspan', 'rowspan', 'style'],
    th: ['colspan', 'rowspan', 'style'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel', 'product-asset'],
  allowedSchemesByTag: {
    a: ['http', 'https', 'mailto', 'tel'],
    img: ['https', 'product-asset'],
  },
  allowProtocolRelative: false,
  allowedStyles,
  disallowedTagsMode: 'discard',
};

function normalizeSafeSerialization(html: string): string {
  return html
    .replace(/style="([^"]*)"/gi, (_match, value: string) => (
      `style="${value.replace(/\s*:\s*/g, ':').replace(/\s*;\s*/g, ';')}"`
    ))
    .replace(/<(br|hr|img)([^>]*?)\s*\/?>/gi, '<$1$2 />')
    .replace(/&nbsp;/gi, ' ');
}

export function sanitizeProductContent(html: string): string {
  const sanitized = sanitizeHtml(html, options);
  return normalizeSafeSerialization(html) === sanitized ? html : sanitized;
}
