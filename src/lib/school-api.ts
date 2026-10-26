/** Bound backend waits; never substitute fabricated records. */
export async function schoolApi(path: string, init: RequestInit = {}) {
 const base = process.env.SCHOOL_API_URL || "https://ks-server-hqsn.onrender.com";
 const response = await fetch(base + path, {...init, cache:"no-store",signal:AbortSignal.timeout(20000)});
 if(!response.ok) throw new Error("School service unavailable");
 const data = await response.json();
 if(!data || data.success === false) throw new Error("School service unavailable");
 return data;
}
