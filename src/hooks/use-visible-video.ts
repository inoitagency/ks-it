"use client";

import { useEffect, type RefObject } from "react";

/** Keep autoplay while visible; stop decoding off-screen or in background tabs. */
export function useVisibleVideo(ref: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let visible = false;
    const updatePlayback = () => {
      if (visible && !document.hidden) {
        void video.play().catch(() => { /* Autoplay may be blocked by the browser. */ });
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    });
    observer.observe(video);
    document.addEventListener("visibilitychange", updatePlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      video.pause();
    };
  }, [ref]);
}
