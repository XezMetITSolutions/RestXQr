import React, { useState, useEffect, useCallback } from 'react';
import OptimizedImage from './OptimizedImage';
import Image from 'next/image';

interface ZoomGalleryProps {
  images: string[];
  initialIndex?: number;
}

const ZoomGallery: React.FC<ZoomGalleryProps> = ({ images, initialIndex = 0 }) => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(initialIndex);

  // Sadece component mount olduğunda ve prop değiştiğinde çalışacak şekilde optimize edildi
  useEffect(() => {
    setCurrent(initialIndex);
    setOpen(false);
  }, [initialIndex]);

  // Event handler'ları useCallback ile optimize ettim
  const openGallery = useCallback((idx: number) => {
    setCurrent(idx);
    setOpen(true);
  }, []);
  
  const closeGallery = useCallback(() => setOpen(false), []);
  
  const prev = useCallback(() => 
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1)), 
    [images.length]
  );
  
  const next = useCallback(() => 
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1)), 
    [images.length]
  );

  // Thumbnail'e tıklama handler'ı
  const handleThumbnailClick = useCallback(() => {
    openGallery(0);
  }, [openGallery]);

  return (
    <>
      <div className="relative cursor-pointer w-20 h-20" onClick={handleThumbnailClick}>
        <Image
          src={images[0]}
          alt="Ürün görseli"
          width={80}
          height={80}
          className="object-cover w-full h-full transition-transform duration-200 hover:scale-105 rounded-lg"
        />
      </div>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
          <button className="absolute top-5 right-5 text-white text-2xl" onClick={closeGallery}>×</button>
          <div className="flex items-center gap-8">
            <button className="text-white text-3xl" onClick={prev}>&lt;</button>
            <div className="relative w-[400px] h-[400px] bg-white rounded-lg overflow-hidden">
              <Image
                src={images[current]}
                alt="Galeri görseli"
                fill
                className="object-contain"
                sizes="400px"
              />
            </div>
            <button className="text-white text-3xl" onClick={next}>&gt;</button>
          </div>
          <div className="flex gap-2 mt-4">
            {images.map((img, idx) => (
              <button
                key={img}
                className={`w-12 h-12 border-2 ${idx === current ? 'border-secondary' : 'border-transparent'} rounded overflow-hidden`}
                onClick={() => setCurrent(idx)}
              >
                <OptimizedImage 
                  src={img} 
                  alt="thumb" 
                  width={48} 
                  height={48} 
                  className="object-cover"
                  quality={80}
                  sizes="48px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ZoomGallery;
