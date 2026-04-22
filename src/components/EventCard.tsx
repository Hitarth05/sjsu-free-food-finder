"use client";
 
import { formatDate, generateGoogleCalendarUrl } from "@/lib/utils";
 
interface EventCardProps {
  event: {
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
  };
  index: number;
}
 
export default function EventCard({ event, index }: EventCardProps) {
  const calendarUrl = generateGoogleCalendarUrl(event);
 
  const badges = (
    <div className="absolute top-3 left-3 flex gap-2">
      {event.has_free_food && (
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--green)] text-white shadow-md">
          Free Food
        </span>
      )}
      {event.has_free_stuff && (
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--blue)] text-white shadow-md">
          Free Stuff
        </span>
      )}
    </div>
  );
 
  return (
    <article
      className="animate-fade-in-up bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {event.image_url ? (
        <div className="relative h-44 overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {badges}
        </div>
      ) : (
        <div className="relative h-32 bg-gradient-to-br from-[var(--gold-light)] to-[var(--cream)] flex items-center justify-center">
          <span className="text-4xl opacity-40">{"📅"}</span>
          {badges}
        </div>
      )}
 
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-[var(--text-primary)] mb-2 leading-snug text-base">
          {event.title}
        </h3>
 
        <div className="flex flex-col gap-1 mb-3 text-sm text-[var(--text-secondary)]">
          <span>{formatDate(event.start_date)}</span>
          {event.location_name && (
            <span>{event.location_name}</span>
          )}
        </div>
 
        {event.free_food_details && event.free_food_details !== "" && (
          <p className="text-sm text-[var(--green-dark)] font-semibold mb-2 bg-[var(--green-light)] px-3 py-1.5 rounded-lg">
            {event.free_food_details}
          </p>
        )}
 
        {event.classification_confidence === "medium" && (
          <p className="text-xs text-amber-600 mb-2 bg-amber-50 px-3 py-1.5 rounded-lg font-medium">
            Free food likely but not confirmed
          </p>
        )}
 
        <div className="flex gap-3 mt-auto pt-4 border-t border-[var(--card-border)]">
          <a
            href={event.event_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-white bg-[var(--blue)] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            View Event
          </a>
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[var(--text-secondary)] bg-[var(--cream)] px-4 py-2 rounded-lg hover:bg-[var(--card-border)] transition-colors ml-auto"
          >
            Add to Calendar
          </a>
        </div>
      </div>
    </article>
  );
}
 