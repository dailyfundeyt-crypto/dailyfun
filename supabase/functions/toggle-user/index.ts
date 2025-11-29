import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
    }

    const body = await req.json().catch(() => null);
    const userId = body?.userId;
    const action = body?.action; // 'ban' or 'unban'

    if (!userId || !action) {
      return new Response(JSON.stringify({ error: 'Missing userId or action' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    // Update user metadata to set is_banned flag
    const isBanned = action === 'ban';
    const updates: any = { user_metadata: { ...(body?.metadata ?? {}), is_banned: isBanned } };

    const { data, error } = await supabase.auth.admin.updateUserById(userId, updates as any);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'content-type': 'application/json' } });
    }

    return new Response(JSON.stringify({ user: data }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
});
