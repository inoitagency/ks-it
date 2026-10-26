import { isPlaceholderContent } from "./content-quality";

export type CampusActivityType = "workshops" | "events" | "placements";
export interface CampusActivity {
  id: string;
  type: CampusActivityType;
  title: string;
  image: string;
}

const TYPES: Record<string, CampusActivityType> = {
  workshop: "workshops", workshops: "workshops", seminar: "workshops", seminars: "workshops",
  event: "events", events: "events", placement: "placements", placements: "placements",
};

/** Accept published photo records for the existing three tiles, never invent a category. */
export function selectCampusActivities(rows: unknown[], origin: string): CampusActivity[] {
  const candidates: { activity: CampusActivity; order: number; date: number }[] = [];
  for (const input of rows) {
    if (!input || typeof input !== "object") continue;
    const row = input as Record<string, unknown>;
    if (row.isActive !== true || typeof row.activityType !== "string" || typeof row.title !== "string" || typeof row.url !== "string") continue;
    const type = TYPES[row.activityType.trim().toLowerCase()];
    const title = row.title.trim();
    const description = typeof row.description === "string" ? row.description : "";
    if (!type || !title || title.length > 200 || typeof row._id !== "string") continue;
    if (isPlaceholderContent(title, description)) continue;
    try {
      const base = new URL(origin);
      const url = new URL(row.url.replaceAll("\\", "/"), `${base.origin}/`);
      if (url.origin !== base.origin || !["https:", "http:"].includes(url.protocol) ||
          !url.pathname.startsWith("/Public/") || !/\.(?:jpe?g|png|webp|avif|gif)$/i.test(url.pathname)) continue;
      candidates.push({
        activity: { id: row._id, type, title, image: url.href },
        order: typeof row.order === "number" && Number.isFinite(row.order) ? row.order : Number.MAX_SAFE_INTEGER,
        date: typeof row.updatedAt === "string" ? Date.parse(row.updatedAt) || 0 : 0,
      });
    } catch { /* Malformed photo URLs must not enter the UI. */ }
  }
  candidates.sort((a, b) => a.order - b.order || b.date - a.date);
  const selected: CampusActivity[] = [];
  const images = new Set<string>();
  for (const { activity } of candidates) {
    if (selected.some(item => item.type === activity.type) || images.has(activity.image)) continue;
    selected.push(activity);
    images.add(activity.image);
  }
  return selected;
}

