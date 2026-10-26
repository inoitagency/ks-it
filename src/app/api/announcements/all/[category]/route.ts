import { NextResponse } from "next/server";
import { schoolApi } from "@/lib/school-api";
import { isPlaceholderContent } from "@/lib/content-quality";
export async function GET(request: Request, {params}: {params: Promise<{category:string}>}) {
 const {category} = await params;
 try {
  const data = await schoolApi("/api/announcements/all/" + encodeURIComponent(category));
  const value = Array.isArray(data) ? data : data.announcement ?? data.announcements ?? data.data;
  if(!(Array.isArray(value))) throw new Error("Invalid school response");
  const announcement = value.filter((row: unknown) => {
    if (!row || typeof row !== "object") return false;
    const item = row as Record<string, unknown>;
    return typeof item.title === "string" && !isPlaceholderContent(item.title, typeof item.description === "string" ? item.description : "");
  });
  return NextResponse.json({success:true,announcement});
 } catch {
  return NextResponse.json({success:false,announcement:[],message:"School information is temporarily unavailable. Please try again or contact the school."},{status:502});
 }
}
