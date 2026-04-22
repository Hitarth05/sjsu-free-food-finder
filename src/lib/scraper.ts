interface LocalistEvent {
    event: {
      id: number;
      title: string;
      description_text: string;
      location_name: string;
      room_number: string;
      url: string;
      first_date: string;
    last_date: string;
    localist_url: string;
    event_instances: {
      event_instance: {
        start: string;
        end: string;
      };
    }[];
      photo_url: string;
      filters: {
        event_types?: { name: string }[];
        departments?: { name: string }[];
      };
    };
  }
  
  export interface ScrapedEvent {
    id: string;
    title: string;
    description_text: string;
    location_name: string;
    room_number: string;
    event_url: string;
    image_url: string;
    start_date: string;
    end_date: string;
    event_types: string[];
    departments: string[];
  }
  
  export async function scrapeLocalistEvents(): Promise<ScrapedEvent[]> {
    const allEvents: ScrapedEvent[] = [];
    let page = 1;
    const perPage = 50;
    let hasMore = true;
  
    while (hasMore) {
      const url = `https://events.sjsu.edu/api/2/events?pp=${perPage}&page=${page}&days=14`;
  
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`Localist API error: ${response.status}`);
      }
  
      const data = await response.json();
      const events: LocalistEvent[] = data.events || [];
  
      if (events.length === 0) {
        hasMore = false;
        break;
      }
  
      for (const item of events) {
        const e = item.event;
        allEvents.push({
          id: String(e.id),
          title: e.title,
          description_text: e.description_text || "",
          location_name: e.location_name || "",
          room_number: e.room_number || "",
          event_url: e.localist_url || e.url || `https://events.sjsu.edu/event/${e.id}`,
          image_url: e.photo_url || "",
          start_date: e.event_instances?.[0]?.event_instance?.start || e.first_date,
        end_date: e.event_instances?.[0]?.event_instance?.end || e.last_date,
          event_types: e.filters?.event_types?.map((t) => t.name) || [],
          departments: e.filters?.departments?.map((d) => d.name) || [],
        });
      }
  
      // If we got fewer results than perPage, we've reached the end
      if (events.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
  
      // Safety limit — don't fetch more than 5 pages
      if (page > 5) {
        hasMore = false;
      }
    }
  
    return allEvents;
  }