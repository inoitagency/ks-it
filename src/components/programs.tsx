"use client";

import { OFFICIAL_MEDIA } from "@/content/official-media";
import { motion, useMotionValue } from "framer-motion";
import Link from "next/link";
import { SCHOOL } from "@/content/school";
import { ArrowRight, ArrowUpRight } from "lucide-react";

/* -----------------------------------------------
   PROGRAMS OF DISTINCTION
   Mouse-following image hover, editorial
   layout, premium typography.
   ----------------------------------------------- */
const PROGRAMS = [
  {
    title: "M.Sc. (CA & IT)",
    slug: "m-sc-ca-it",
    img: OFFICIAL_MEDIA.programTechnology,
    desc: "A 5-year integrated path to mastering computer applications and information technology.",
    duration: "5 Years",
    eligibility: SCHOOL.eligibilitySummary,
  },
  {
    title: "Integrated MBA",
    slug: "integrated-mba",
    img: OFFICIAL_MEDIA.programManagement,
    desc: "A 5-year comprehensive leadership journey blending management theory with real-world practice.",
    duration: "5 Years",
    eligibility: SCHOOL.eligibilitySummary,
  },
];

export const Programs = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  return (
    <motion.section
      id="programs"
      className="bg-white py-20 px-6 md:py-28"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: "-60px" }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 flex flex-col justify-between items-start gap-8 md:flex-row md:items-end">
          <h2 className="editorial-title text-ink">
            Programs of{" "}
            <br className="hidden md:block" />
            <span className="italic text-accent">Distinction</span>.
          </h2>
          <div className="max-w-md">
            <p className="text-ink/80 mb-8 text-[15px] font-medium leading-relaxed">
              Our curriculum is designed to evolve with the industry, ensuring
              our students are always ahead of the curve.
            </p>
            <a href={SCHOOL.brochure} target="_blank" rel="noreferrer" className="group flex items-center gap-2 font-bold uppercase tracking-widest text-xs text-ink">
              View All Details
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 transition-all duration-300 group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white">
                <ArrowRight size={14} />
              </div>
            </a>
          </div>
        </div>

        {/* List */}
        <div className="border-t border-zinc-100">
          {PROGRAMS.map((prog, i) => (
            <Link key={i} href={`/programs/${prog.slug}`} className="block">
              <div className="service-tile group flex-wrap sm:flex-nowrap" onPointerMove={(event) => {
                if (event.pointerType === "touch") return;
                mouseX.set(event.clientX);
                mouseY.set(event.clientY);
              }}>
              {/* Floating image on hover */}
              <motion.div
                className="fixed left-0 top-0 z-40 pointer-events-none"
                style={{ x: mouseX, y: mouseY }}
              >
              <div
                className="service-image-hover"
                style={{ position: "absolute", left: 0, top: 0 }}
              >
                <img
                  src={prog.img}
                  alt={prog.title}
                  decoding="async"
                  className="h-full w-full rounded-2xl object-cover shadow-2xl"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Try the fallback only once, even if the fallback also fails.
                    const image = e.currentTarget;
                    if (image.dataset.fallback) return;
                    image.dataset.fallback = "true";
                    image.src = OFFICIAL_MEDIA.campus;
                  }}
                />
              </div>
              </motion.div>

              {/* Title row */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-3 sm:gap-6">
                  <span className="text-sm font-bold text-accent">0{i + 1}</span>
                  <h3 className="program-title font-display text-2xl text-ink sm:text-3xl lg:text-6xl">
                    {prog.title}
                  </h3>
                </div>
                <div className="ml-0 flex flex-wrap gap-3 sm:gap-8 text-[10px] font-bold uppercase tracking-widest text-zinc-400 md:ml-12">
                  <span>{prog.duration}</span>
                  <span className="text-zinc-200">|</span>
                  <span>{prog.eligibility}</span>
                </div>
              </div>

              {/* Description (desktop) */}
              <div className="hidden max-w-sm text-sm leading-relaxed text-zinc-500 opacity-0 transition-opacity duration-500 lg:block group-hover:opacity-100">
                {prog.desc}
              </div>

              {/* Arrow */}
              <div className="flex h-10 w-10 shrink-0 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-zinc-200 transition-all duration-500 group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white">
                <ArrowUpRight size={22} />
              </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
