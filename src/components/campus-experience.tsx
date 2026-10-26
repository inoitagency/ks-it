"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { OFFICIAL_MEDIA } from "@/content/official-media";
import { useSchoolResource } from "@/hooks/use-school-resource";
import type { CampusActivity } from "@/lib/campus-activities";

const EXPERIENCES = [
  {
    id: "workshops",
    title: "Workshops",
    image: OFFICIAL_MEDIA.workshop,
    alt: "Students and faculty attending a seminar at KS School",
  },
  {
    id: "events",
    title: "Events",
    image: OFFICIAL_MEDIA.event,
    alt: "Students and faculty at the Advent festival at KS School",
  },
  {
    id: "placements",
    title: "Placements",
    image: OFFICIAL_MEDIA.alumni,
    alt: "The KS School alumni community at an alumni meet",
  },
] as const;

export function CampusExperience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: activities } = useSchoolResource<CampusActivity[]>("/api/activities", "activities");
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const experiences = EXPERIENCES.map(experience => {
    const activity = activities?.find(item => item.type === experience.id && !failedImages.includes(item.image));
    return { ...experience, image: activity?.image || experience.image, alt: activity?.title || experience.alt, live: !!activity };
  });
  const sectionRef = useRef<HTMLElement>(null);
  const restart = useRef<() => void>(() => {});

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let visible = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      if (!visible || document.hidden) return;
      timer = setTimeout(() => {
        setActiveIndex(index => (index + 1) % EXPERIENCES.length);
        schedule();
      }, 5000);
    };
    restart.current = schedule;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, { threshold: 0.15 });
    observer.observe(section);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", schedule);
      restart.current = () => {};
    };
  }, []);

  const selectExperience = (index: number) => {
    setActiveIndex(index);
    restart.current();
  };

  return (
    <section
      ref={sectionRef}
      id="campus-experience"
      aria-labelledby="campus-experience-title"
      className="relative isolate overflow-hidden bg-white px-6 py-20 sm:px-8 lg:px-12 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 whitespace-nowrap text-[clamp(5rem,15vw,15rem)] font-bold leading-none tracking-[-0.06em] text-zinc-50"
      >
        EXPERIENCE KS
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div className="min-w-0">
          <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-accent sm:text-xs">
            Beyond the classroom
          </p>
          <h2
            id="campus-experience-title"
            className="text-[clamp(2.75rem,5.2vw,4.75rem)] font-semibold leading-[1.04] tracking-[-0.055em] text-ink"
          >
            Learn. Connect.<br />
            Build your<br className="hidden sm:block" />{" "}
            <span className="text-accent">future.</span>
          </h2>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-zinc-500 sm:text-base">
            Hands-on learning, shared campus moments and connections that carry you forward.
          </p>

          <div aria-label="Choose a campus experience" className="mt-9 border-t border-zinc-200 sm:mt-12">
            {experiences.map((experience, index) => {
              const selected = activeIndex === index;
              return (
                <button
                  key={experience.id}
                  id={`experience-${experience.id}`}
                  type="button"
                  aria-pressed={selected}
                  aria-controls="campus-experience-preview"
                  onPointerEnter={(event) => {
                    if (event.pointerType !== "touch") selectExperience(index);
                  }}
                  onFocus={() => selectExperience(index)}
                  onClick={() => selectExperience(index)}
                  className={`group flex min-h-20 w-full items-center gap-4 border-b border-zinc-200 px-4 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#e31e24] sm:px-5 ${
                    selected ? "bg-[#e31e24]/[0.04] text-accent" : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <span className="flex-1 text-base font-semibold sm:text-lg">{experience.title}</span>
                  <ArrowUpRight aria-hidden="true" size={18} className={selected ? "text-accent" : "text-zinc-400"} />
                  <span aria-hidden="true" className="ml-1 text-xs font-medium text-accent sm:ml-3">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          id="campus-experience-preview"
          data-active-experience={EXPERIENCES[activeIndex].id}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] rounded-tl-[5rem] rounded-br-[5rem] bg-zinc-100 sm:rounded-tl-[7rem] sm:rounded-br-[7rem] lg:aspect-[5/6]"
        >
          {experiences.map((experience, index) => (
            <img
              key={`${experience.id}-${experience.image}`}
              src={experience.image}
              alt={experience.alt}
              aria-hidden={activeIndex !== index}
              width={index === 2 ? 1400 : 1024}
              height={index === 0 ? 768 : index === 1 ? 623 : 511}
              loading="lazy"
              decoding="async"
              onError={() => {
                if (experience.live) setFailedImages(images => images.includes(experience.image) ? images : [...images, experience.image]);
              }}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 motion-reduce:transition-none ${
                activeIndex === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-10 size-40 rounded-full border-[12px] border-white sm:size-48">
            <div className="absolute inset-0 rounded-full border-[12px] border-[#e31e24]" />
          </div>
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-7xl text-right text-xs text-zinc-500" data-experience-source={experiences[activeIndex].live ? "activity" : "archive"}>
        {experiences[activeIndex].live ? experiences[activeIndex].alt : "Photo from the official school archive"}
      </p>
      <p role="status" className="sr-only">{EXPERIENCES[activeIndex].title} image selected.</p>
    </section>
  );
}
