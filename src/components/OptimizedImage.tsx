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
  priority?: boolean;
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
  height,
  priority = false
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

  // Generate optimized source sets for better performance
  const generateSrcSet = (baseSrc: string, isWebP = false) => {
    if (!baseSrc.startsWith('/lovable-uploads/')) {
      return baseSrc.startsWith('/') 
        ? baseSrc 
        : `https://images.unsplash.com/${baseSrc}?auto=format&fit=crop&w=800&q=80`;
    }
    
    // Create multiple optimized sizes for responsive images
    const baseUrl = baseSrc.replace(/\.(png|jpg|jpeg)$/, '');
    const ext = isWebP ? '.webp' : baseSrc.match(/\.(png|jpg|jpeg)$/)?.[0] || '.png';
    
    // Generate multiple sizes for better performance
    const sizes = [400, 560, 800, 1200];
    return sizes.map(size => `${baseUrl}${ext}?w=${size}&q=75 ${size}w`).join(', ');
  };

  const webpSrcSet = src.startsWith('/lovable-uploads/') 
    ? generateSrcSet(src, true)
    : null;
  
  const fallbackSrcSet = src.startsWith('/lovable-uploads/')
    ? generateSrcSet(src, false)
    : generateSrcSet(src);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
      <picture>
        {webpSrcSet && (
          <source 
            srcSet={webpSrcSet} 
            type="image/webp"
            sizes={sizes}
          />
        )}
        <img
          src={hasError ? imageSrc : src}
          srcSet={hasError ? undefined : fallbackSrcSet}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          sizes={sizes}
          width={width}
          height={height}
        />
      </picture>
    </div>
  );
};

export default OptimizedImage;