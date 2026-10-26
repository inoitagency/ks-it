import { NextResponse } from "next/server";
import { schoolApi } from "@/lib/school-api";
export async function GET() {

 try {
  const data = await schoolApi("/api/oldPapers/getByCategory/All");
  const value = data.oldPaper ?? data.oldPapers ?? data.papers;
  if(!(Array.isArray(value))) throw new Error("Invalid school response");
  return NextResponse.json({success:true,oldPaper:value});
 } catch {
  return NextResponse.json({success:false,oldPaper:[],message:"School information is temporarily unavailable. Please try again or contact the school."},{status:502});
 }
}
