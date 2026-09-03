"use client";

import Image, { type StaticImageData } from "next/image";
import blackMainDesktop from "../../../../public/landing/black_main_desktop.png";
import blackMainPhone from "../../../../public/landing/black_main_phone.png";
import whiteMainDesktop from "../../../../public/landing/white_main_desktop.png";
import whiteMainPhone from "../../../../public/landing/white_main_phone.png";
import { useSettingsStore } from "@/shared/store/settingsStore";

const PRODUCT_SCREENSHOTS = {
  dark: {
    desktop: blackMainDesktop,
    phone: blackMainPhone,
  },
  light: {
    desktop: whiteMainDesktop,
    phone: whiteMainPhone,
  },
} as const;

interface ProductPreviewProps {
  image: StaticImageData;
}

interface LandingHeroSectionProps {
  titleLine1: string;
  titleLine2: string;
  description: string;
}

function LaptopProductPreview({ image }: ProductPreviewProps) {
  return (
    <div className="relative mx-auto w-full">
      <div className="relative rounded-[1.05rem_1.05rem_0.4rem_0.4rem] border border-black/70 bg-gradient-to-b from-slate-400 via-neutral-700 to-neutral-950 p-[0.65%] pb-[1.05%] shadow-[var(--landing-shadow)]">
        <span
          aria-hidden
          className="absolute top-[0.55%] right-[2%] left-[2%] h-px bg-white/35"
        />
        <span
          aria-hidden
          className="absolute top-0 left-1/2 z-10 flex h-[4.1%] w-[10.5%] -translate-x-1/2 items-center justify-center rounded-b-[0.4rem] bg-neutral-950"
        >
          <span className="aspect-square w-[13%] rounded-full bg-slate-500/80" />
        </span>
        <div
          className="relative overflow-hidden rounded-[0.75rem_0.75rem_0.18rem_0.18rem] bg-black ring-1 ring-black/55"
          style={{ aspectRatio: image.width / image.height }}
        >
          <Image
            src={image}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(min-width: 848px) 40rem, (min-width: 640px) calc(80vw - 2.4rem), (max-width: 367px) calc(80vw - 2.4rem), 16rem"
            preload
          />
        </div>
      </div>

      <div
        aria-hidden
        className="relative z-10 -mt-[0.35%] w-[108%] -translate-x-[4%]"
      >
        <div
          className="relative aspect-[25/1] overflow-hidden bg-gradient-to-b from-neutral-400 via-neutral-600 to-neutral-800 shadow-[0_0.35rem_0.7rem_rgba(0,0,0,0.18)]"
          style={{ clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)" }}
        >
          <span className="absolute top-0 right-[6%] left-[6%] h-px bg-white/40" />
          <span className="absolute top-[32%] left-1/2 h-[42%] w-[18%] -translate-x-1/2 rounded-[0.25rem_0.25rem_0.45rem_0.45rem] border border-black/20 bg-neutral-950/20" />
        </div>
        <div className="relative aspect-[70/1] rounded-b-[0.85rem] border border-t-0 border-black/35 bg-gradient-to-b from-neutral-600 to-neutral-800">
          <span className="absolute right-[2%] bottom-0 left-[2%] h-px bg-black/35" />
        </div>
      </div>
    </div>
  );
}

function PhoneProductPreview({ image }: ProductPreviewProps) {
  return (
    <div className="relative isolate">
      <span
        aria-hidden
        className="absolute top-[25%] -right-[2.2%] h-[7%] w-[3%] rounded-r-sm bg-gradient-to-b from-neutral-300 to-neutral-800"
      />
      <span
        aria-hidden
        className="absolute top-[35%] -right-[2.2%] h-[10%] w-[3%] rounded-r-sm bg-gradient-to-b from-neutral-300 to-neutral-800"
      />

      <div className="relative rounded-[14%] border border-black/75 bg-gradient-to-br from-slate-300 via-neutral-600 to-neutral-900 p-[5.5%] shadow-[0_1rem_1.8rem_rgba(15,23,42,0.28)]">
        <div
          className="relative overflow-hidden rounded-[9%] bg-black ring-1 ring-black/90"
          style={{ aspectRatio: image.width / image.height }}
        >
          <Image
            src={image}
            alt=""
            fill
            className="object-cover object-center"
            loading="eager"
            sizes="(min-width: 848px) 9rem, (min-width: 640px) 18vw, 3.6rem"
          />
        </div>
        <span
          aria-hidden
          className="absolute top-[7.3%] left-1/2 z-10 aspect-square w-[5%] -translate-x-1/2 rounded-full bg-neutral-950 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]"
        />
      </div>
    </div>
  );
}

// 핵심 가치와 현재 제공하는 웹 워크스페이스 캡처를 첫 화면에 표시합니다.
export function LandingHeroSection({
  titleLine1,
  titleLine2,
  description,
}: LandingHeroSectionProps) {
  const theme = useSettingsStore((state) => state.theme);
  const screenshot = PRODUCT_SCREENSHOTS[theme];

  return (
    <section className="relative isolate overflow-hidden border-b border-(--border)">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{ backgroundImage: "var(--landing-hero-glow)" }}
      />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 pb-6 text-center sm:pt-28 sm:pb-8">
        <div className="max-w-4xl">
          <h1 className="text-4xl leading-[1.08] font-bold tracking-[-0.045em] sm:text-5xl md:text-6xl lg:text-7xl">
            {titleLine1}
            <span className="block text-[var(--landing-workspace-accent)]">
              {titleLine2}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-(--muted) sm:text-lg sm:leading-8">
            {description}
          </p>
        </div>

        <div
          aria-hidden
          className="relative mt-12 w-full max-w-[20rem] sm:mt-16 sm:max-w-[50rem]"
        >
          <div className="absolute -inset-x-4 bottom-0 h-2/3 rounded-[3rem] bg-[var(--landing-workspace-accent)] opacity-12 blur-3xl" />

          <div className="relative">
            <div className="mx-auto w-4/5">
              <LaptopProductPreview image={screenshot.desktop} />
            </div>

            <div className="absolute right-0 bottom-[2%] z-10 w-[18%] sm:w-[14%] lg:-right-6">
              <PhoneProductPreview image={screenshot.phone} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
