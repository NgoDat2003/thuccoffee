import { useCallback, useEffect, useState, type ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface EmblaCarouselProps {
  slides: ReactNode[];
  autoplayMs?: number;
  /** Tailwind width classes applied to each slide, e.g. "w-full md:w-1/3". */
  slideClassName?: string;
}

export default function EmblaCarousel({
  slides,
  autoplayMs,
  slideClassName = 'w-full',
}: EmblaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || !autoplayMs) return;
    const id = setInterval(() => emblaApi.scrollNext(), autoplayMs);
    return () => clearInterval(id);
  }, [emblaApi, autoplayMs]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, i) => (
            <div key={i} className={`shrink-0 grow-0 px-2 ${slideClassName}`}>
              {slide}
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            aria-label="Trước"
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
          >
            ‹
          </button>
          <button
            aria-label="Sau"
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
          >
            ›
          </button>
          <div className="mt-3 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Đến mục ${i + 1}`}
                onClick={() => scrollTo(i)}
                className={`h-2 w-2 rounded-full ${i === selectedIndex ? 'bg-primary' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
