import { useEffect, useState } from 'react';
import { Shirt } from 'lucide-react';

interface GarmentImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  priority?: boolean;
}

export function GarmentImage({
  src,
  alt,
  title,
  className = '',
  priority = false,
}: GarmentImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F2ECE1] via-[#EAE0D0] to-[#DFD2BD] text-[#58111E] p-6 text-center ${className}`}
      >
        <Shirt className="w-8 h-8 mb-2 opacity-75" strokeWidth={1.5} aria-hidden="true" />
        {title ? (
          <span className="font-display text-sm font-medium text-[#1E1917] max-w-[18ch] line-clamp-2">
            {title}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
    />
  );
}
