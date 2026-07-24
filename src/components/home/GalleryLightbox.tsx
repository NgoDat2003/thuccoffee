import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { getImageUrl } from '../../lib/image-url';
import { useHomeGallery } from '../../services/static-pages.service';

// Gallery trang chủ đọc từ API (bảng site_gallery, quản trị trong admin).
export default function GalleryLightbox() {
  const [index, setIndex] = useState(-1);
  const { data: items = [], isLoading, isError } = useHomeGallery();

  if (isLoading) {
    return (
      <div className="grid animate-pulse grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-square w-full rounded bg-gray-100" />
        ))}
      </div>
    );
  }
  if (isError || items.length === 0) return null;

  const slides = items.map((item) => ({ src: getImageUrl(item.storageKey) }));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setIndex(i)}
            className="block"
            aria-label={`Xem ảnh ${i + 1} trong bộ sưu tập`}
          >
            <img
              src={getImageUrl(item.storageKey)}
              alt={item.altText || `Ảnh ${i + 1} - bộ sưu tập Thức Coffee`}
              className="aspect-square w-full rounded object-cover"
            />
          </button>
        ))}
      </div>
      <Lightbox open={index >= 0} close={() => setIndex(-1)} index={index} slides={slides} />
    </>
  );
}
