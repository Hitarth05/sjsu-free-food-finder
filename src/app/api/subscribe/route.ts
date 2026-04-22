import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    // Insert subscriber (will fail silently if already subscribed due to UNIQUE)
    const { error } = await supabaseAdmin
      .from("email_subscribers")
      .upsert(
        { email, is_verified: true },
        { onConflict: "email" }
      );

    if (error) throw error;

    return NextResponse.json({ message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}