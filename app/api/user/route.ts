import { getEmail } from "@/lib/getEmail";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    return NextResponse.json({ email: await getEmail() });
  } catch (error) {
    console.log("[USER_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}