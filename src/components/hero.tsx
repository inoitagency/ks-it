"use client";
import { OFFICIAL_MEDIA } from "@/content/official-media";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useVisibleVideo } from "@/hooks/use-visible-video";
import { ResponsiveLayout } from "./responsive-layout";

const SECTION_HEIGHT = 2000;

export const Hero = () => {
  return (
    <div style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }} className="relative w-full">
      <CenterImage />
      <ParallaxImages />
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-white/0 to-white" />
    </div>
  );
};

/* ----------------------------------------------- CENTER VIDEO ----------------------------------------------- */
const CenterImage = () => {
  const { scrollY } = useScroll();
  const videoRef = useRef<HTMLVideoElement>(null);
  useVisibleVideo(videoRef);
  const videoOpacity = useTransform(scrollY, [SECTION_HEIGHT, SECTION_HEIGHT + 400], [1, 0]);

  // Stronger effect
  const brightness = useTransform(scrollY, [400, 1100], [100, 65]);   // Video dark ho jayegi
  const filter = useTransform(brightness, (value) => `brightness(${value}%)`);
  const videoScale = useTransform(scrollY, [400, 1100], [1, 0.92]);

  return (
    <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
      <motion.video
        ref={videoRef}
        src="/clg.mp4"
        className="h-full w-full object-cover"
        autoPlay 
        loop 
        muted 
        playsInline
        preload="metadata"
        style={{ 
          scale: videoScale,
          opacity: videoOpacity,
          filter
        }}
      />

      {/* Strong Overlay when images appear */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 pointer-events-none"
        style={{ 
          opacity: useTransform(scrollY, [300, 1000], [0.2, 0.85]) 
        }}
      />

      {/* Extra blue tint for distinction */}
      <motion.div 
        className="absolute inset-0 bg-blue-950/30 pointer-events-none mix-blend-multiply"
        style={{ 
          opacity: useTransform(scrollY, [500, 1100], [0, 0.4]) 
        }}
      />
    </div>
  );
};

/* ----------------------------------------------- PARALLAX IMAGES ----------------------------------------------- */
const ParallaxImages = () => {
  return (
    <ResponsiveLayout desktop={
      <div>
        <div className="mx-auto max-w-5xl px-4 pt-[200px]">
          <ParallaxImg 
            src={OFFICIAL_MEDIA.heroTechnology}
            alt="Technomantra at KS School"
            start={-200} 
            end={200} 
            className="w-1/3" 
          />
          <ParallaxImg 
            src={OFFICIAL_MEDIA.heroCampus}
            alt="KS School entrance"
            start={200} 
            end={-250} 
            className="mx-auto w-2/3" 
          />
          <ParallaxImg 
            src={OFFICIAL_MEDIA.heroPortrait}
            alt="Advent decorations in the KS School atrium"
            start={-200} 
            end={200} 
            className="ml-auto w-1/3" 
          />
          <ParallaxImg 
            src={OFFICIAL_MEDIA.heroCommunity}
            alt="Melange decorations in the KS School atrium"
            start={0} 
            end={-500} 
            className="ml-24 w-5/12" 
          />
        </div>
      </div>
    } mobile={<MobileStackedImages />} />
  );
};

/* ===================== MOBILE STACKED ===================== */
const MobileStackedImages = () => {
  return (
    <div className="px-4 pt-12 pb-20 space-y-20">
      <MobileStackedImage
        src={OFFICIAL_MEDIA.heroTechnology}
        alt="Technomantra student artwork"
      />
      <MobileStackedImage
        src={OFFICIAL_MEDIA.heroCampus}
        alt="Campus life"
      />
      <MobileStackedImage
        src={OFFICIAL_MEDIA.heroPortrait}
        alt="Advent decorations in the KS School atrium"
      />
      <MobileStackedImage
        src={OFFICIAL_MEDIA.heroCommunity}
        alt="Melange decorations in the KS School atrium"
      />
    </div>
  );
};

const MobileStackedImage = ({ src, alt }: { src: string; alt: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -80]);
  const opacity = useTransform(scrollYProgress, [0.1, 0.45, 0.85], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0.2, 0.8], [0.9, 1]);

return (
    <motion.div ref={ref} style={{ y, opacity, scale }} className="w-full">
      {/* Force portrait feel */}
      <img
        src={src}
        alt={alt}
        className="w-full aspect-[4/5] rounded-3xl shadow-2xl object-cover"
        loading="lazy"
      />
    </motion.div>
  );
};


/* ===================== ParallaxImg Component (Desktop) ===================== */
interface ParallaxImgProps {
  className?: string;
  alt: string;
  src: string;
  start: number;
  end: number;
}

const ParallaxImg = ({ className, alt, src, start, end }: ParallaxImgProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${start}px end`, `end ${end * -1}px`],
  });

  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);
  const y = useTransform(scrollYProgress, [0, 1], [start, end]);

  return (
    <motion.div className={className} ref={ref} style={{ y, scale, opacity }}>
      <img src={src} alt={alt} className="w-full h-auto rounded-2xl" loading="lazy" />
    </motion.div>
  );
};
