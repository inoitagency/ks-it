"use client";

import { useEffect, useState } from "react";

/** Cancel stale requests on navigation and distinguish an outage from an empty list. */
export function useSchoolResource<T>(url: string | null, key: string) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ url: string | null; data: T | null; loading: boolean; error: boolean }>({ url, data: null, loading: !!url, error: false });
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    let active = true;
    async function run() {
      setState({ url, data: null, loading: true, error: false });
      try {
        const response = await fetch(url!, { signal: controller.signal });
        const json = await response.json();
        if (!response.ok || json.success !== true) throw new Error("Unavailable");
        if (active) setState({ url, data: json[key], loading: false, error: false });
      } catch {
        if (active) setState({ url, data: null, loading: false, error: true });
      }
    }
    void run();
    return () => { active = false; controller.abort(); };
  }, [url, key, attempt]);
  return { ...state, loading: !!url && (state.url !== url || state.loading), data: state.url === url ? state.data : null, retry: () => setAttempt(value => value + 1) };
}
