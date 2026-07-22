import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { getImageUrl } from '../../lib/image-url';

// Curated locally (not in src/data/) — these are homepage-only brand photos,
// not tied to a product/blog/store record.
const GALLERY_IMAGES = [
  'site/56e70517_z6157733703207-60f39403ff895814bcae5bee6e3dbfba.jpg',
  'stores/6cdd14d1_74.jpg',
  'site/38477004_z4196149101339-58b3de8b5ff9725fda6c9c627d63726b.jpg',
  'stores/170ff33_thuc2d41.jpg',
  'site/48270e72_z6157795668203-258e0e9a0e1ce535d1d0782e3199ea9a.jpg',
  'site/9ead2735_z6157794639130-42110afa99c0a14e5f9c8fdd6d5e84a5.jpg',
  'site/a96b3f5c_z6157794642418-4e22336e67fc1feac49709d2e700744e.jpg',
  'site/c3bc3b1c_z6155463159164-bfe0689d79840c400bbaad0696aeec0c.jpg',
];

export default function GalleryLightbox() {
  const [index, setIndex] = useState(-1);
  const slides = GALLERY_IMAGES.map((filename) => ({ src: getImageUrl(filename) }));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {GALLERY_IMAGES.map((filename, i) => (
          <button
            key={filename}
            onClick={() => setIndex(i)}
            className="block"
            aria-label={`Xem ảnh ${i + 1} trong bộ sưu tập`}
          >
            <img
              src={getImageUrl(filename)}
              alt={`Ảnh ${i + 1} - bộ sưu tập Thức Coffee`}
              className="aspect-square w-full rounded object-cover"
            />
          </button>
        ))}
      </div>
      <Lightbox open={index >= 0} close={() => setIndex(-1)} index={index} slides={slides} />
    </>
  );
}
