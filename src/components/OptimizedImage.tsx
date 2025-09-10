import React, { useState, useCallback } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  width?: number;
  height?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder.svg',
  onLoad,
  onError,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  width,
  height
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(fallbackSrc);
    onError?.();
  }, [fallbackSrc, onError]);

  // Generate WebP source set for lovable-uploads images
  const generateSrcSet = (baseSrc: string) => {
    if (!baseSrc.startsWith('/lovable-uploads/')) {
      return baseSrc.startsWith('/') 
        ? baseSrc 
        : `https://images.unsplash.com/${baseSrc}?auto=format&fit=crop&w=800&q=80`;
    }
    
    // For lovable-uploads, create multiple sizes
    const baseUrl = baseSrc.replace('.png', '').replace('.jpg', '').replace('.jpeg', '');
    return `${baseUrl}.webp 800w, ${baseUrl}.png 800w`;
  };

  const finalSrc = generateSrcSet(src);
  const webpSrc = src.startsWith('/lovable-uploads/') 
    ? src.replace(/\.(png|jpg|jpeg)$/, '.webp')
    : null;

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
      <picture>
        {webpSrc && (
          <source 
            srcSet={webpSrc} 
            type="image/webp"
            sizes={sizes}
          />
        )}
        <img
          src={hasError ? imageSrc : (src.startsWith('/lovable-uploads/') ? src : finalSrc)}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          sizes={sizes}
          width={width}
          height={height}
        />
      </picture>
    </div>
  );
};

export default OptimizedImage;