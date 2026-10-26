import { NextResponse } from "next/server";
import { schoolApi } from "@/lib/school-api";
export async function GET() {

 try {
  const data = await schoolApi("/api/faculty");
  const value = data.faculty ?? data;
  if(!(Array.isArray(value))) throw new Error("Invalid school response");
  return NextResponse.json({success:true,faculty:value});
 } catch {
  return NextResponse.json({success:false,faculty:[],message:"School information is temporarily unavailable. Please try again or contact the school."},{status:502});
 }
}
