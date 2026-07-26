import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';

import { getImageUrl } from '../../../lib/image-url';

export default function BlogAssetImage({ node, selected }: ReactNodeViewProps) {
  const persistedSrc = String(node.attrs.src ?? '');
  const assetMatch = persistedSrc.match(/^([a-z-]+-asset):(.+)$/);
  const displaySrc = assetMatch ? getImageUrl(assetMatch[2]) : persistedSrc;

  return (
    <NodeViewWrapper className="my-4">
      <img
        src={displaySrc}
        alt={String(node.attrs.alt ?? '')}
        className={`h-auto max-w-full rounded-lg ${selected ? 'ring-2 ring-admin-accent ring-offset-2' : ''}`}
      />
    </NodeViewWrapper>
  );
}
