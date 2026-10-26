"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TIME_PER_LOOP = 29;
const SCROLL_POWER = 0.003;
const BRAKE_DURATION = 0.8;

export default function Marquee({ logos, className = "" }: {
  logos: string[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const row = rowRef.current;
    if (!container || !row || !logos.length) return;
    gsap.registerPlugin(ScrollTrigger);

    let cleanupAnimation = () => {};
    let previousWidth = -1;
    let visible = false;
    let timeline: gsap.core.Timeline | undefined;
    const updatePlayback = () => timeline?.paused(!visible || document.hidden);

    const rebuild = () => {
      const width = container.clientWidth;
      if (width === previousWidth) return;
      previousWidth = width;
      cleanupAnimation();
      timeline = undefined;
      const firstLogo = row.firstElementChild as HTMLElement | null;
      // Hidden containers have zero width: wait for ResizeObserver instead of looping.
      if (!width || !firstLogo || !firstLogo.offsetWidth) return;

      const added: HTMLElement[] = [];
      const count = Math.min(100, Math.max(0, Math.ceil((width * 3 - row.offsetWidth) / firstLogo.offsetWidth)));
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        const copy = firstLogo.cloneNode(true) as HTMLElement;
        copy.setAttribute("aria-hidden", "true");
        added.push(copy);
        fragment.appendChild(copy);
      }
      row.appendChild(fragment);
      const clone = row.cloneNode(true) as HTMLElement;
      clone.setAttribute("aria-hidden", "true");
      row.parentElement?.appendChild(clone);

      const context = gsap.context(() => {
        gsap.set(clone, { position: "absolute", top: row.offsetTop, left: row.offsetLeft - row.offsetWidth });
        timeline = gsap.timeline({ repeat: -1 }).to([row, clone], {
          xPercent: 100, duration: TIME_PER_LOOP, ease: "none",
        });
      }, container);
      updatePlayback();

      let direction = 1;
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const trigger = ScrollTrigger.create({
        onUpdate(self) {
          if (!visible || document.hidden || !timeline) return;
          const velocity = self.getVelocity();
          if (Math.abs(velocity) > 8) direction = velocity > 0 ? 1 : -1;
          gsap.to(timeline, { timeScale: (1 + Math.abs(velocity) * SCROLL_POWER) * direction, duration: 0.1, overwrite: true });
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            if (timeline) gsap.to(timeline, { timeScale: direction, duration: BRAKE_DURATION, overwrite: true });
          }, 100);
        },
      });
      cleanupAnimation = () => {
        clearTimeout(timeout);
        trigger.kill();
        if (timeline) gsap.killTweensOf(timeline);
        context.revert();
        clone.remove();
        added.forEach((element) => element.remove());
      };
    };

    const resizeObserver = new ResizeObserver(rebuild);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    });
    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", updatePlayback);
    rebuild();
    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      cleanupAnimation();
    };
  }, [logos]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden h-20 ${className}`}>
      <div ref={rowRef} className="flex gap-8 items-center h-20 absolute top-0 left-0">
        {logos.map((src, i) => (
          <div key={src + i} className="w-40 h-20 flex items-center justify-center shrink-0">
            <img src={src} alt={`logo-${i}`} loading="lazy" decoding="async" className="max-h-12 object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}
