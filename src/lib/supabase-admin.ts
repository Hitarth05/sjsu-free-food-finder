import { createClient } from "@supabase/supabase-js";

// Server client (for writing data — only use in API routes)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);