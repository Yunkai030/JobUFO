'use server'

import { track } from './track'

// Only these events may be triggered from the client, to prevent the browser
// from spamming arbitrary event names into the table.
const CLIENT_EVENTS = new Set(['app_opened', 'pdf_exported'])

export async function trackClient(
  eventName: string,
  properties: Record<string, unknown> = {}
): Promise<void> {
  if (!CLIENT_EVENTS.has(eventName)) return
  await track(eventName, properties)
}
