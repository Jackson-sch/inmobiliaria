"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PropertyImage } from "@/types";

export function PropertyGallery({
  images,
  title,
}: {
  images: PropertyImage[];
  title: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const validImages = images.filter((img) => Boolean(img?.secureUrl?.trim()));

  if (validImages.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-stone text-ink-soft">
        Esta propiedad aún no tiene fotos
      </div>
    );
  }

  const [main, ...rest] = validImages;

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="relative col-span-4 row-span-2 aspect-[4/3] sm:col-span-2 sm:row-span-2"
        >
          <Image
            src={main.secureUrl}
            alt={title}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </button>

        {rest.slice(0, 4).map((img, i) => (
          <button
            type="button"
            key={img.id}
            onClick={() => setLightboxIndex(i + 1)}
            className="relative col-span-2 row-span-1 aspect-square sm:col-span-1"
          >
            <Image
              src={img.secureUrl}
              alt=""
              fill
              sizes="25vw"
              className="object-cover"
            />
            {i === 3 && rest.length > 4 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white">
                +{rest.length - 4} fotos
              </span>
            )}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 print:hidden">
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() =>
              setLightboxIndex((i) => (i! - 1 + images.length) % images.length)
            }
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="relative h-[80vh] w-full max-w-4xl">
            <Image
              src={images[lightboxIndex].secureUrl}
              alt=""
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <button
            type="button"
            onClick={() => setLightboxIndex((i) => (i! + 1) % images.length)}
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <span className="absolute bottom-4 text-sm text-white/70">
            {lightboxIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}
