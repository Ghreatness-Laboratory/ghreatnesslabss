import React, { useState } from 'react';

interface BlurImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackText?: string;
  containerClassName?: string;
}

export function BlurImage({
  src,
  alt,
  fallbackText,
  className = '',
  containerClassName = '',
  ...props
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`blur-image-fallback ${containerClassName}`}>
        {fallbackText ? (
          <span className="blur-image-initials">{fallbackText}</span>
        ) : (
          <span className="blur-image-placeholder-mark" />
        )}
      </div>
    );
  }

  return (
    <div className={`blur-image-container ${containerClassName}`}>
      {/* Blurred shimmering backdrop shown before image finishes loading */}
      {!loaded && <div className="blur-image-skeleton" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`blur-image-img ${loaded ? 'blur-image-loaded' : 'blur-image-loading'} ${className}`}
        {...props}
      />
    </div>
  );
}

export default BlurImage;
