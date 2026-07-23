import sanitizeHtml from 'sanitize-html';

const allowedStyles = {
  '*': {
    'border-collapse': [/^collapse$/],
    border: [/^(?:none|solid black 1\.0pt)$/],
    'border-color': [/^windowtext$/],
    width: [/^\d+(?:\.\d+)?(?:px|pt)$/],
    height: [/^\d+(?:\.\d+)?(?:px|pt)$/],
    'text-align': [/^(?:center|justify|left)$/],
    'vertical-align': [/^middle$/],
    'white-space': [/^normal$/],
    'font-size': [/^\d+(?:\.\d+)?(?:px|pt)$/],
    'font-family': [
      /^(?:Arial, Helvetica, sans-serif|Arial,Helvetica,sans-serif|Arial,sans-serif|Courier New,Courier,monospace|Times New Roman,Times,serif)$/,
    ],
    color: [/^(?:#[0-9a-f]{6}|black|null)$/i],
    'background-color': [/^#[0-9a-f]{6}$/i],
    'margin-left': [/^\d+(?:\.\d+)?(?:px|pt)$/],
  },
};

// Surveyed all 267 blog_posts on 2026-07-22. These are the complete tag and
// attribute sets in production content; iframe was absent, so it stays blocked.
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    'a', 'br', 'div', 'em', 'h1', 'h2', 'h3', 'hr', 'img', 'li',
    'ol', 'p', 'span', 'strong', 'table', 'tbody', 'td', 'tr', 'u', 'ul',
  ],
  allowedAttributes: {
    a: ['href', 'rel', 'tabindex', 'target'],
    div: ['style'],
    h2: ['dir'],
    img: ['alt', 'src', 'style'],
    li: ['dir', 'style'],
    p: ['dir', 'style'],
    span: ['aria-label', 'role', 'style'],
    table: ['border', 'cellpadding', 'cellspacing', 'class', 'style'],
    td: ['rowspan', 'style'],
    ul: ['dir'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel', 'blog-asset'],
  allowedSchemesByTag: {
    a: ['http', 'https', 'mailto', 'tel'],
    img: ['https', 'blog-asset'],
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
    .replace(/&nbsp;/gi, '\u00a0');
}

export function sanitizeBlogContent(html: string): string {
  const sanitized = sanitizeHtml(html, options);

  // sanitize-html serializes legacy <br>/<hr>/<img> and &nbsp; differently.
  // Preserve original bytes only when those harmless rewrites are the entire
  // diff; any removed tag, attribute, URI, or CSS value returns sanitized HTML.
  return normalizeSafeSerialization(html) === sanitized ? html : sanitized;
}