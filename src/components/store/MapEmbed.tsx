interface MapEmbedProps {
  address: string;
}

export default function MapEmbed({ address }: MapEmbedProps) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

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
