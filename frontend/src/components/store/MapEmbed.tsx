interface MapEmbedProps {
  address: string;
  // URL embed do admin cấu hình; có thì dùng thẳng, không thì suy từ address.
  embedUrl?: string | null;
}

export default function MapEmbed({ address, embedUrl }: MapEmbedProps) {
  const src = embedUrl
    || `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className="aspect-video w-full overflow-hidden rounded">
      <iframe
        src={src}
        title={`Bản đồ ${address}`}
        loading="lazy"
        className="h-full w-full border-0"
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
