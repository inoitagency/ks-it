"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SCROLL_OPTIONS = { lerp: 0.05, smoothWheel: true, touchMultiplier: 1.5, autoRaf: false };

/** Lenis and GSAP share a clock rather than scheduling competing frame loops. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const ref = useRef<LenisRef>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const update = (seconds: number) => {
      if (!document.hidden) ref.current?.lenis?.raf(seconds * 1000);
    };
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, []);
  return <ReactLenis ref={ref} root autoRaf={false} options={SCROLL_OPTIONS}>{children}</ReactLenis>;
}
