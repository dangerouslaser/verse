import { MediaImage } from './MediaImage';

interface BackdropProps {
  imageUrl?: string;
  alt: string;
  height?: '30vh' | '50vh';
  logo?: string;
  children?: React.ReactNode;
}

/**
 * Backdrop component for detail pages with gradient overlay and optional logo
 */
export function Backdrop({ imageUrl, alt, height = '50vh', logo, children }: BackdropProps) {
  if (!imageUrl) {
    return null;
  }

  return (
    <div className={`relative h-[${height}] w-full`}>
      <MediaImage
        src={imageUrl}
        alt={alt}
        aspectRatio="fanart"
        loading="eager"
        placeholderType="fanart"
        className="h-full w-full"
      />
      <div className="from-background via-background/60 absolute inset-0 bg-gradient-to-t to-transparent" />

      {/* Optional clearlogo overlay */}
      {logo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={logo}
            alt={alt}
            className="max-h-[40%] max-w-[80%] object-contain drop-shadow-2xl"
          />
        </div>
      )}

      {/* Optional custom content overlay */}
      {children}
    </div>
  );
}
