"use client";

import { useEffect, type RefObject } from "react";

/** Warm images before a scroll reveal, including those initially transformed off-screen. */
export function useSceneImages(ref: RefObject<HTMLElement | null>, layout: boolean | null) {
  useEffect(() => {
    const section = ref.current;
    if (!section || layout === null) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      section.querySelectorAll("img").forEach(image => { image.loading = "eager"; });
      observer.disconnect();
    }, { rootMargin: "1200px 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, [ref, layout]);
}
