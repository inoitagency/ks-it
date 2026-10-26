import { NextResponse } from "next/server";
import { schoolApi } from "@/lib/school-api";
export async function GET(request: Request, {params}: {params: Promise<{id:string}>}) {
 const {id} = await params;
 try {
  const data = await schoolApi("/api/faculty/" + encodeURIComponent(id));
  const value = data.faculty ?? data;
  if(!(typeof value === "object" && value?.name && value?._id)) throw new Error("Invalid school response");
  return NextResponse.json({success:true,faculty:value});
 } catch {
  return NextResponse.json({success:false,faculty:null,message:"School information is temporarily unavailable. Please try again or contact the school."},{status:502});
 }
}
