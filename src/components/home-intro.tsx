"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { AnimatePresence } from "framer-motion";
import { CinematicLoader } from "./cinematic-loader";

/** The intro has its own state so opening it never rerenders the whole homepage. */
const subscribe = () => () => {};
const needsIntro = () => {
  try { return sessionStorage.getItem("hasVisitedKS") !== "true"; }
  catch { return true; }
};
export function HomeIntro() {
  const firstVisit = useSyncExternalStore(subscribe, needsIntro, () => false);
  const [finished, setFinished] = useState(false);
  const finish = useCallback(() => {
    try { sessionStorage.setItem("hasVisitedKS", "true"); } catch { /* Storage is optional. */ }
    setFinished(true);
  }, []);
  return <AnimatePresence>{firstVisit && !finished && <CinematicLoader onComplete={finish} />}</AnimatePresence>;
}
