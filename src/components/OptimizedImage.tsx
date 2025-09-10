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
        : `https://images.unsplash.com/${baseSrc}?auto=format&fit=crop&w=800&q=75`;
    }
    
    // For lovable-uploads, return the original image
    // WebP conversion would need server-side support
    return baseSrc;
  };

  // Don't use WebP for lovable-uploads since we can't guarantee they exist
  const webpSrcSet = null;
  
  const fallbackSrcSet = generateSrcSet(src, false);

  // Calculate optimal dimensions based on common display sizes
  const getOptimalDimensions = (originalSrc: string) => {
    // Use provided dimensions or defaults
    return {
      width: width,
      height: height,
      sizes: sizes
    };
  };

  const optimalDims = getOptimalDimensions(src);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
      <picture>
        <img
          src={hasError ? imageSrc : src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          sizes={optimalDims.sizes || sizes}
          width={optimalDims.width || width}
          height={optimalDims.height || height}
          decoding="async"
        />
      </picture>
    </div>
  );
};

export default OptimizedImage;