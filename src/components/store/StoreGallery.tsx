import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { getImageUrl } from '../../lib/image-url';

interface StoreGalleryProps {
  images: string[];
  storeName: string;
}

export default function StoreGallery({ images, storeName }: StoreGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openAt = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="columns-2 gap-3" aria-label={`Hình ảnh ${storeName}`}>
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => openAt(index)}
            className="mb-3 block w-full break-inside-avoid overflow-hidden rounded-[5px] bg-gray-200"
            aria-label={`Mở ảnh ${index + 1} của ${storeName}`}
          >
            <img
              src={getImageUrl(image)}
              alt={`${storeName} - ảnh ${index + 1}`}
              className="h-auto w-full transition-transform duration-300 hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={activeIndex}
        slides={images.map((image) => ({ src: getImageUrl(image) }))}
      />
    </>
  );
}
