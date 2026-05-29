import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/**
 * Records a product-analytics event into the `events` table.
 *
 * Server-side only. Fire-and-forget: it never throws, so a failed insert can't
 * break the user-facing action that called it.
 *
 * - In a normal Server Action the current user is resolved automatically.
 * - In contexts without a session (e.g. the Stripe webhook) pass `userId`.
 */
export async function track(
  eventName: string,
  properties: Record<string, unknown> = {},
  opts: { userId?: string | null } = {}
): Promise<void> {
  try {
    let userId = opts.userId ?? null
    if (!userId) {
      try {
        const supabase = await createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        userId = user?.id ?? null
      } catch {
        // No request/session context (e.g. background) — record anonymously.
      }
    }

    const admin = createAdminClient()
    await admin.from('events').insert({
      user_id: userId,
      event_name: eventName,
      properties,
    })
  } catch (err) {
    console.error('[track] failed to record event:', eventName, err)
  }
}
