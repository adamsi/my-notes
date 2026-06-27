import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseSchema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA ?? "public";

export const createClient = () =>
  createBrowserClient(supabaseUrl!, supabaseKey!, {
    db: { schema: supabaseSchema },
  });
