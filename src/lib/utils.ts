export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  
  export function isUpcoming(dateString: string): boolean {
    return new Date(dateString) > new Date();
  }
  
  export function generateGoogleCalendarUrl(event: {
    title: string;
    start_date: string;
    end_date: string;
    location_name: string;
    event_url: string;
  }): string {
    const startDate = new Date(event.start_date)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
    const endDate = event.end_date
      ? new Date(event.end_date)
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "")
      : startDate;
  
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${startDate}/${endDate}`,
      location: event.location_name || "",
      details: `Event details: ${event.event_url}`,
    });
  
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }