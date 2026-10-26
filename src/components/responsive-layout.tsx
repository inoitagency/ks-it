"use client";

import type { ReactNode } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

/** Preserve server-rendered content, then mount only the active layout. */
export function ResponsiveLayout({ desktop, mobile }: {
  desktop: ReactNode;
  mobile: ReactNode;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return <>
    {isDesktop !== false && <div className="hidden md:block">{desktop}</div>}
    {isDesktop !== true && <div className="md:hidden">{mobile}</div>}
  </>;
}
