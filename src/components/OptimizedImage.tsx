'use client';

import Image from 'next/image';
import { useState } from 'react';
import { OFFICIAL_MEDIA } from '@/content/official-media';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

export default function OptimizedImage({
  src,
  alt,
  className = "",
  priority = false,
  fill = false,
  width,
  height,
}: OptimizedImageProps) {
  const [isError, setIsError] = useState(false);

  const fallbackSrc = OFFICIAL_MEDIA.campus;

  return (
    <Image
      src={isError ? fallbackSrc : src}
      alt={alt}
      className={className}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      priority={priority}
      quality={85}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      onError={() => setIsError(true)}
      style={{ objectFit: fill ? 'cover' : 'contain' }}
    />
  );
}
