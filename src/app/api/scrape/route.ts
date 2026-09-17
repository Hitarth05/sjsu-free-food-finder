import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { scrapeLocalistEvents } from "@/lib/scraper";
import { classifyEvents } from "@/lib/classifier";

export const maxDuration = 60; // Hobby plan hard cap

// How many new events to classify per invocation, to stay under the 60s limit.
// The daily cron + dedup logic drains any backlog over several runs.
const MAX_EVENTS_PER_RUN = 40;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Step 1: Scrape events from Localist API
    const scrapedEvents = await scrapeLocalistEvents();

    // Step 2: Find which events we don't already have
    const { data: existingEvents } = await supabaseAdmin
      .from("events")
      .select("id")
      .in("id", scrapedEvents.map((e) => e.id));

    const existingIds = new Set(existingEvents?.map((e) => e.id) || []);
    const newEvents = scrapedEvents.filter((e) => !existingIds.has(e.id));

    if (newEvents.length === 0) {
      await supabaseAdmin.from("scrape_logs").insert({
        source: "localist_api",
        events_found: scrapedEvents.length,
        events_with_free_food: 0,
      });
      return NextResponse.json({
        message: "No new events found",
        total_scraped: scrapedEvents.length,
      });
    }

    // Only process a chunk this run so we finish within 60s
    const eventsToProcess = newEvents.slice(0, MAX_EVENTS_PER_RUN);

    // Step 3: Classify this chunk with Groq
    const classifications = await classifyEvents(eventsToProcess);

    // Step 4: Insert into database
    const eventsToInsert = eventsToProcess.map((event) => {
      const classification = classifications.get(event.id);
      return {
        ...event,
        has_free_food: classification?.has_free_food || false,
        has_free_stuff: classification?.has_free_stuff || false,
        free_food_details: classification?.free_food_details || "",
        classification_confidence: classification?.confidence || "low",
      };
    });

    const uniqueEvents = Array.from(
      new Map(eventsToInsert.map((e) => [e.id, e])).values()
    );

    const { error: insertError } = await supabaseAdmin
      .from("events")
      .upsert(uniqueEvents, { onConflict: "id" });

    if (insertError) {
      throw insertError;
    }

    const freeFoodCount = eventsToInsert.filter(
      (e) => e.has_free_food || e.has_free_stuff
    ).length;

    // Step 5: Log the run
    await supabaseAdmin.from("scrape_logs").insert({
      source: "localist_api",
      events_found: scrapedEvents.length,
      events_with_free_food: freeFoodCount,
    });

    // Step 6: Push notifications for new free food events
    if (freeFoodCount > 0) {
      const freeFoodEvents = eventsToInsert.filter(
        (e) => e.has_free_food || e.has_free_stuff
      );
      await sendPushNotifications(freeFoodEvents);
    }

    return NextResponse.json({
      message: "Scrape complete",
      total_scraped: scrapedEvents.length,
      new_events_total: newEvents.length,
      processed_this_run: eventsToProcess.length,
      remaining: newEvents.length - eventsToProcess.length,
      free_food_events: freeFoodCount,
    });
  } catch (error) {
    console.error("Scrape error:", error);
    await supabaseAdmin.from("scrape_logs").insert({
      source: "localist_api",
      events_found: 0,
      events_with_free_food: 0,
      error_message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Scrape failed" }, { status: 500 });
  }
}

async function sendPushNotifications(
  events: { title: string; free_food_details: string }[]
) {
  const webpush = await import("web-push");

  webpush.setVapidDetails(
    `mailto:your-email@sjsu.edu`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const { data: subscriptions } = await supabaseAdmin
    .from("push_subscriptions")
    .select("*");

  if (!subscriptions || subscriptions.length === 0) return;

  const eventSummary =
    events.length === 1
      ? `🍕 Free food at: ${events[0].title}`
      : `🍕 ${events.length} events with free food/stuff found!`;

  const payload = JSON.stringify({
    title: "SJSU Free Food Alert!",
    body: eventSummary,
    url: process.env.NEXT_PUBLIC_APP_URL,
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
    } catch (error) {
      if ((error as any).statusCode === 410) {
        await supabaseAdmin
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint);
      }
    }
  }
}
