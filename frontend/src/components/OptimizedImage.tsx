'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FaImage, FaSpinner } from 'react-icons/fa';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}

export default function OptimizedImage({
  src,
  alt,
  width = 300,
  height = 200,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  quality = 75,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  style
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={fill ? { width: '100%', height: '100%' } : { width, height }}
      >
        <FaImage className="text-gray-400 text-2xl" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10"
          style={fill ? { width: '100%', height: '100%' } : { width, height }}
        >
          <FaSpinner className="text-gray-400 text-2xl animate-spin" />
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        quality={quality}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
