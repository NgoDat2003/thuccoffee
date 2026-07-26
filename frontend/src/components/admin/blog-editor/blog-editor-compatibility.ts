export type BlogEditorCompatibility =
  | { mode: 'visual'; reasons: [] }
  | { mode: 'source-only'; reasons: string[]; firstDiff?: string };

const visualTags = new Set([
  'a', 'br', 'em', 'h1', 'h2', 'h3', 'hr', 'img', 'li',
  'ol', 'p', 'strong', 'table', 'tbody', 'td', 'tr', 'u', 'ul',
]);

const visualAttributes: Record<string, Set<string>> = {
  a: new Set(['href', 'rel', 'target']),
  img: new Set(['alt', 'src']),
};

function parseHtml(html: string): HTMLElement {
  return new DOMParser().parseFromString(`<main>${html}</main>`, 'text/html').body.firstElementChild as HTMLElement;
}

function normalizedStyle(style: string): string {
  return style
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const [property, ...value] = declaration.split(':');
      return `${property?.trim().toLowerCase()}:${value.join(':').trim()}`;
    })
    .sort()
    .join(';');
}

function snapshotNode(node: Node): unknown {
  if (node.nodeType === Node.TEXT_NODE) return { text: node.textContent ?? '' };
  if (!(node instanceof HTMLElement)) return null;
  return {
    tag: node.tagName.toLowerCase(),
    attrs: [...node.attributes]
      .map((attribute) => [
        attribute.name.toLowerCase(),
        attribute.name.toLowerCase() === 'style'
          ? normalizedStyle(attribute.value)
          : attribute.value,
      ])
      .sort(([a], [b]) => a.localeCompare(b)),
    children: [...node.childNodes].map(snapshotNode).filter((child) => child !== null),
  };
}

export function compareBlogHtmlStructure(
  canonicalHtml: string,
  roundTrippedHtml: string,
): BlogEditorCompatibility {
  const snapshotRoot = (html: string) => [...parseHtml(html).childNodes]
    .filter((node) => node.nodeType !== Node.TEXT_NODE || Boolean(node.textContent?.trim()))
    .map(snapshotNode);
  const canonical = JSON.stringify(snapshotRoot(canonicalHtml));
  const roundTripped = JSON.stringify(snapshotRoot(roundTrippedHtml));
  if (canonical === roundTripped) return { mode: 'visual', reasons: [] };
  let index = 0;
  while (canonical[index] === roundTripped[index]) index += 1;
  return {
    mode: 'source-only',
    reasons: ['Trình soạn thảo trực quan sẽ thay đổi cấu trúc HTML hiện có.'],
    firstDiff: `Khác biệt cấu trúc tại ký tự ${index}.`,
  };
}

export function classifyBlogHtmlForVisual(html: string): BlogEditorCompatibility {
  const reasons = new Set<string>();
  const root = parseHtml(html);
  if ([...root.childNodes].some((child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim())) {
    reasons.add('Văn bản legacy nằm ngoài đoạn văn chỉ được chỉnh trong chế độ HTML.');
  }

  for (const element of root.querySelectorAll('*')) {
    const tag = element.tagName.toLowerCase();
    if (!visualTags.has(tag)) {
      reasons.add(`Thẻ <${tag}> chỉ được chỉnh trong chế độ HTML.`);
      continue;
    }
    const allowed = visualAttributes[tag] ?? new Set<string>();
    for (const attribute of element.attributes) {
      const name = attribute.name.toLowerCase();
      if (!allowed.has(name)) reasons.add(`Thuộc tính ${name} trên <${tag}> cần giữ bằng chế độ HTML.`);
    }
    if (tag === 'br' && element.nextSibling?.nodeType === Node.TEXT_NODE && /^\s/.test(element.nextSibling.textContent ?? '')) {
      reasons.add('Khoảng trắng legacy sau xuống dòng chỉ được chỉnh trong chế độ HTML.');
    }
    if (tag === 'li' && [...element.childNodes].some((child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim())) {
      reasons.add('Mục danh sách legacy chưa có đoạn văn bao ngoài chỉ được chỉnh trong chế độ HTML.');
    }
    if (tag === 'a' && element.getAttribute('rel') !== 'noopener noreferrer') {
      reasons.add('Liên kết legacy chưa có thuộc tính an toàn chỉ được chỉnh trong chế độ HTML.');
    }
    if (tag === 'img') {
      const src = element.getAttribute('src') ?? '';
      if (!/^[a-z-]+-asset:/.test(src) && !src.startsWith('https://')) {
        reasons.add('Ảnh không dùng blog-asset hoặc HTTPS chỉ được chỉnh trong chế độ HTML.');
      }
    }
  }

  return reasons.size === 0
    ? { mode: 'visual', reasons: [] }
    : { mode: 'source-only', reasons: [...reasons] };
}
