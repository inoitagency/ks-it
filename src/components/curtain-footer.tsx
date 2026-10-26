// src/components/curtain-footer.tsx
"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";

/* -----------------------------------------------
   CURTAIN FOOTER - Measured reveal in document flow
   ----------------------------------------------- */
export const CurtainFooter = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelHeight = useMotionValue(0);
  const revealDistance = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end end"] });
  const y = useTransform([scrollYProgress, panelHeight, revealDistance], ([progress, height, distance]) =>
    Math.min(0, Number(progress) * Number(height) - Number(distance))
  );

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const measure = () => {
      const height = panel.offsetHeight;
      panelHeight.set(height);
      // A tall footer finishes revealing before normal page scrolling exposes the rest.
      // This keeps every link reachable in short windows without a nested scroll area.
      revealDistance.set(window.innerWidth >= 768 && !reducedMotion.matches
        ? Math.min(height, Math.max(0, window.innerHeight - 96))
        : 0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    window.addEventListener("resize", measure);
    reducedMotion.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      reducedMotion.removeEventListener("change", measure);
    };
  }, [panelHeight, revealDistance]);

  return (
    <div
      ref={containerRef}
      className="curtain-footer relative overflow-hidden bg-[#0a0a0a]"
    >
      <motion.div ref={panelRef} className="curtain-footer-panel relative w-full" style={{ y }}>
        <div className="bg-[#0a0a0a] text-[#a1a1aa] flex flex-col gap-12 justify-between p-8 pb-16 md:p-16 lg:p-24">

          {/* Grain texture */}
          <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat pointer-events-none" />

          {/* Top Section */}
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div className="flex flex-col items-start">
              {/* <img src="/ks-logo.png" alt="KS School" className="h-10 w-auto mb-6 opacity-80" /> */}
              <div className="text-4xl md:text-6xl font-bold text-white leading-none">
                KS
              </div>
              <div className="text-sm md:text-base text-zinc-400 mt-2">
                School of Business Management &amp;<br />Information Technology
              </div>
            </div>

            <div className="hidden md:block text-right space-y-1">
              <p className="text-zinc-400">Gujarat University Campus</p>
              <p className="text-zinc-400">Navrangpura, Ahmedabad</p>
              <p className="text-zinc-500 text-sm mt-4">Gujarat, India</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 mb-4">Programs</p>
              <div className="space-y-3">
                <Link href="/programs/integrated-mba" className="block text-base text-zinc-400 hover:text-white transition-colors">Integrated MBA</Link>
                <Link href="/programs/m-sc-ca-it" className="block text-base text-zinc-400 hover:text-white transition-colors">M.Sc. (CA & IT)</Link>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 mb-4">Campus</p>
              <div className="space-y-3">
                <Link href="/infrastructure" className="block text-base text-zinc-400 hover:text-white transition-colors">Infrastructure</Link>
                <Link href="/infrastructure?open=lab" className="block text-base text-zinc-400 hover:text-white transition-colors">Labs</Link>
                <Link href="/infrastructure?open=auditorium" className="block text-base text-zinc-400 hover:text-white transition-colors">Seminar Space</Link>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 mb-4">Connect</p>
              <div className="space-y-3">
                <Link href="/contact" className="block text-base text-zinc-400 hover:text-white transition-colors">Contact Us</Link>
                <Link href="/placements" className="block text-base text-zinc-400 hover:text-white transition-colors">Placements</Link>
                <Link href="/announcements" className="block text-base text-zinc-400 hover:text-white transition-colors">Announcements</Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="relative z-10 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-700">
              &copy; 2026 KS School of Business Management &amp; IT. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {[{label:"Instagram",url:"https://www.instagram.com/kssbm_gujarat_university?r=nametag"},{label:"Facebook",url:"https://www.facebook.com/KSSBM-110829864378413/"},{label:"YouTube",url:"https://www.youtube.com/channel/UCSi6ShcLabKp_Rrkivh6xYA"}].map((s) => (
                <a
                  key={s.label}
                  href={s.url} target="_blank" rel="noreferrer"
                  className="group hover:text-white transition-colors duration-300 flex items-center gap-1"
                >
                  {s.label}
                  <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>

        </div>
        <p className="absolute bottom-4 right-6 z-10 text-right text-[10px] text-zinc-500 sm:text-xs">
          Made by{" "}
          <a href="https://github.com/Rajchandel1" target="_blank" rel="noopener noreferrer" className="text-zinc-300 transition-colors hover:text-white focus-visible:underline">RAJ</a>
          {" "}&amp;{" "}
          <a href="https://github.com/manavchawla146/" target="_blank" rel="noopener noreferrer" className="text-zinc-300 transition-colors hover:text-white focus-visible:underline">MANAV</a>
        </p>
      </motion.div>
    </div>
  );
};
