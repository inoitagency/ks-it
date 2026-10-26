import { NextResponse } from "next/server";
import { schoolApi } from "@/lib/school-api";
export async function POST(request: Request) {
 let input;
 try { input = await request.json(); } catch { return NextResponse.json({success:false,message:"Invalid message."},{status:400}); }
 const fields = ["fullName","email","phone","message"] as const;
 if(!input || fields.some(key => typeof input[key] !== "string")) return NextResponse.json({success:false,message:"Please complete all fields."},{status:400});
 const body = Object.fromEntries(fields.map(key => [key,input[key].trim()]));
 if(body.fullName.length < 3 || body.fullName.length > 20 || !/^\d{10}$/.test(body.phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || body.email.length > 254 || !body.message || body.message.length > 5000) return NextResponse.json({success:false,message:"Check your name (3-20 characters), email, 10-digit phone and message (up to 5,000 characters)."},{status:400});
 try {
  const data = await schoolApi("/api/contact-us/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(data.success !== true) throw new Error("Delivery not confirmed");
  return NextResponse.json({success:true});
 } catch {return NextResponse.json({success:false,message:"Message delivery could not be confirmed. Please contact the school by phone or email."},{status:502});}
}
