const images = import.meta.glob<string>('/src/assets/images/**/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

const urlByFilename = new Map<string, string>();
for (const [path, url] of Object.entries(images)) {
  urlByFilename.set(path.split('/').pop()!, url);
}

const placeholder = urlByFilename.get('151b6674_circlelogo-white-blue-jul2023.png') ?? '';

export function getImageUrl(filename: string): string {
  const url = urlByFilename.get(filename);
  if (url) return url;
  if (import.meta.env.DEV) {
    console.warn(`[image-url] missing asset: ${filename}`);
  }
  return placeholder;
}
