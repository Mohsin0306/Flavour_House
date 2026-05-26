"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatPKR } from "@/lib/format";
import { HERO_CAROUSEL_IMAGES } from "@/lib/hero-images";

export type HeroSlide = {
  image: string;
  name: string;
  price?: number;
};

type Props = {
  slides: HeroSlide[];
};

const ROTATE_MS = 2800;

export default function HeroCarousel({ slides }: Props) {
  const items: HeroSlide[] =
    slides.length > 0
      ? slides
      : HERO_CAROUSEL_IMAGES.map((image, i) => ({
          image,
          name: `Signature Dish ${i + 1}`,
          price: undefined,
        }));

  const [index, setIndex] = useState(0);
  const count = items.length;

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [count]);

  const slide = items[index];

  return (
    <section className="w-full px-2 pt-2 pb-1" aria-label="Featured dishes carousel">
      <div className="relative flex min-h-[260px] items-center justify-center sm:min-h-[300px]">
        {items.map((s, i) => (
          <div
            key={`${s.image}-${i}`}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
              i === index ? "z-10 opacity-100" : "z-0 pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={s.image}
              alt={s.name}
              width={400}
              height={400}
              className="h-auto max-h-[280px] w-auto max-w-[min(100%,340px)] object-contain sm:max-h-[320px] sm:max-w-[380px]"
              priority={i === 0}
              unoptimized
            />
          </div>
        ))}
      </div>

      <div className="mt-2 text-center">
        <p className="text-sm font-semibold text-neutral-900">{slide.name}</p>
        {slide.price != null && (
          <p className="text-sm font-bold text-amber-700">{formatPKR(slide.price)}</p>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex justify-center gap-1" aria-hidden>
          {items.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-amber-600" : "w-1 bg-neutral-300"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
