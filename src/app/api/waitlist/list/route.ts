/**
 * Lists all waitlist signups. Protected by service role key.
 * Usage: curl -H "Authorization: Bearer <SERVICE_ROLE_KEY>" /api/waitlist/list
 */

import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const expectedKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || !expectedKey) {
    return Response.json({ error: "Missing Supabase config" }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, expectedKey)

  const { data, error } = await supabase
    .from("waitlist")
    .select("email, name, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ count: data.length, signups: data })
}
