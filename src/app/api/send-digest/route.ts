import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatDate } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get upcoming events with free food in the next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { data: events } = await supabaseAdmin
      .from("events")
      .select("*")
      .or("has_free_food.eq.true,has_free_stuff.eq.true")
      .gte("start_date", new Date().toISOString())
      .lte("start_date", nextWeek.toISOString())
      .order("start_date", { ascending: true });

    if (!events || events.length === 0) {
      return NextResponse.json({ message: "No free food events this week" });
    }

    // Get all subscribers
    const { data: subscribers } = await supabaseAdmin
      .from("email_subscribers")
      .select("email, unsubscribe_token")
      .eq("is_verified", true);

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: "No subscribers" });
    }

    // Build email HTML
    const eventListHtml = events
      .map(
        (e) => `
        <div style="margin-bottom: 20px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="margin: 0 0 4px 0; color: #1a1a1a;">${e.title}</h3>
          <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">📅 ${formatDate(e.start_date)}</p>
          <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">📍 ${e.location_name || "TBD"}</p>
          ${e.free_food_details ? `<p style="margin: 0; color: #16a34a; font-size: 14px;">🍕 ${e.free_food_details}</p>` : ""}
          <a href="${e.event_url}" style="color: #2563eb; font-size: 14px;">View event →</a>
        </div>
      `
      )
      .join("");

    // Send to each subscriber
    for (const sub of subscribers) {
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?token=${sub.unsubscribe_token}`;

      await resend.emails.send({
        from: "SJSU Free Food <noreply@yourdomain.com>",
        to: sub.email,
        subject: `🍕 ${events.length} Free Food Events This Week at SJSU`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, sans-serif;">
            <h1 style="color: #1a1a1a;">This Week's Free Food at SJSU</h1>
            <p style="color: #666;">We found ${events.length} events with free food or free stuff this week:</p>
            ${eventListHtml}
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">
              <a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a>
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      message: `Digest sent to ${subscribers.length} subscribers`,
      events_included: events.length,
    });
  } catch (error) {
    console.error("Digest error:", error);
    return NextResponse.json(
      { error: "Failed to send digest" },
      { status: 500 }
    );
  }
}