# SJSU Free Food Finder

A full-stack web application that automatically scans San Jose State University event listings and uses AI to detect events offering free food or free stuff to students.

**Live at [sjsufreefood.com](https://sjsufreefood.com)**

## About

SJSU hosts hundreds of events every month, and many of them offer free food, snacks, or giveaways, but this information is buried across event descriptions. SJSU Free Food Finder solves this by automatically scraping event data, classifying it with AI, and presenting a clean, filterable feed to students.

No account needed. Just visit the site and browse.

## How It Works

1. **Automated Scraping** - A scheduled job runs every 6 hours, pulling upcoming events from SJSU's Localist API
2. **AI Classification** - Each event description is analyzed by Llama 3.3 70B (via Groq) to determine if free food or free items are offered
3. **Database Storage** - Classified events are stored in a PostgreSQL database with deduplication to avoid reprocessing
4. **Live Feed** - The website reads from the database and displays a real-time, filterable feed of events with free food/stuff

## Features

- **Event Feed** - Browse upcoming SJSU events filtered by free food, free stuff, or all events
- **Push Notifications** - Opt-in browser notifications when new free food events are detected (PWA)
- **Weekly Email Digest** - Subscribe with your email to receive a weekly summary of upcoming free food events
- **Add to Calendar** - One-click Google Calendar export for any event
- **Mobile Responsive** - Works on desktop and mobile browsers
- **No Login Required** - Zero friction, open the site and start browsing

## Tech Stack

- **Frontend** - Next.js 14, TypeScript, Tailwind CSS
- **Backend** - Next.js API Routes, Vercel Cron Jobs
- **Database** - Supabase (PostgreSQL) with Row Level Security
- **AI** - Llama 3.3 70B via Groq API for event classification
- **Email** - Resend for weekly digest emails
- **Push Notifications** - Web Push API with VAPID keys
- **Deployment** - Vercel with automatic CI/CD from GitHub
- **Domain** - Custom domain via Namecheap

## Architecture

```
Vercel Cron (every 6 hours)
  -> Fetch events from SJSU Localist API
  -> Deduplicate against existing events in database
  -> Classify new events with Llama 3.3 70B (Groq)
  -> Store results in Supabase (PostgreSQL)
  -> Send push notifications for new free food events

User visits sjsufreefood.com
  -> Next.js frontend queries Supabase
  -> Displays filtered event feed
  -> User can subscribe to push notifications or email digest
```

## Local Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/Hitarth05/sjsu-free-food-finder.git
cd sjsu-free-food-finder

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in your API keys (see Environment Variables section below)

# Run the development server
pnpm dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your_cron_secret
```

### Testing the Scraper

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/scrape
```

## Database Schema

The application uses four tables:

- **events** - Stores scraped and classified event data
- **email_subscribers** - Stores email digest subscribers
- **push_subscriptions** - Stores web push notification subscriptions
- **scrape_logs** - Tracks scraper run history for debugging

## Future Improvements

- Additional event sources beyond the SJSU Localist calendar
- Student-submitted events via a contribution form
- Campus map view showing event locations
- Historical analytics on free food event trends
- Confidence-based filtering (show only confirmed vs. likely events)

## Author

Built by [Hitarth Sharma](https://github.com/Hitarth05), Computer Science student at San Jose State University.