"use client";
 
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import EventCard from "./EventCard";
import FilterBar from "./FilterBar";
 
interface Event {
  id: string;
  title: string;
  description_text: string;
  location_name: string;
  start_date: string;
  end_date: string;
  event_url: string;
  image_url: string;
  has_free_food: boolean;
  has_free_stuff: boolean;
  free_food_details: string;
  classification_confidence: string;
}
 
export default function EventFeed() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<"all" | "food" | "stuff">("food");
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ all: 0, food: 0, stuff: 0 });
 
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
 
      let query = supabase
        .from("events")
        .select("*")
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true });
 
      if (filter === "food") {
        query = query.eq("has_free_food", true);
      } else if (filter === "stuff") {
        query = query.eq("has_free_stuff", true);
      }
 
      const { data, error } = await query;
 
      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    }
 
    fetchEvents();
  }, [filter]);
 
  useEffect(() => {
    async function fetchCounts() {
      const now = new Date().toISOString();
 
      const [allRes, foodRes, stuffRes] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }).gte("start_date", now),
        supabase.from("events").select("id", { count: "exact", head: true }).gte("start_date", now).eq("has_free_food", true),
        supabase.from("events").select("id", { count: "exact", head: true }).gte("start_date", now).eq("has_free_stuff", true),
      ]);
 
      setCounts({
        all: allRes.count || 0,
        food: foodRes.count || 0,
        stuff: stuffRes.count || 0,
      });
    }
 
    fetchCounts();
  }, []);
 
  return (
    <div>
      <FilterBar filter={filter} onFilterChange={setFilter} counts={counts} />
 
      <div className="mt-6">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-[var(--text-secondary)] text-sm font-medium">
              Loading events...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[var(--card-border)]">
            <p className="text-4xl mb-3">No events found</p>
            <p className="text-[var(--text-secondary)] font-medium">
              No upcoming events right now.
            </p>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Check back later. We scan for new events every few hours.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
 