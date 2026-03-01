import Image from "next/image";

type FramedImageProps = {
  src: string;
  alt: string;
  caption?: string;
};

export default function FramedImage({ src, alt, caption }: FramedImageProps) {
  return (
    <figure className="group">
      <div className="overflow-hidden border-[8px] border-[#d4af37] bg-[#f5f0e8] p-2 shadow-[4px_6px_20px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out group-hover:scale-105">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm italic text-muted font-[var(--font-display)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
