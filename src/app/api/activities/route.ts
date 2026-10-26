import { NextResponse } from "next/server";
import { schoolApi } from "@/lib/school-api";
import { selectCampusActivities } from "@/lib/campus-activities";

export async function GET() {
  try {
    const data = await schoolApi("/api/activities");
    if (!Array.isArray(data.activities)) throw new Error("Invalid activities response");
    const activities = selectCampusActivities(data.activities, process.env.SCHOOL_API_URL || "https://ks-server-hqsn.onrender.com");
    return NextResponse.json({ success: true, activities });
  } catch {
    return NextResponse.json({ success: false, activities: [], message: "Current activities are temporarily unavailable." }, { status: 502 });
  }
}
