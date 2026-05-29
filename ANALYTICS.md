# Analytics — your own event data

Every meaningful action writes a row into the `events` table (migration
`0008_events.sql`). You own 100% of this raw data. Run the queries below in
**Supabase → SQL Editor**, or export the table and analyze it in Python.

## The data model

```
events
├─ id          uuid
├─ user_id     uuid    (which user; null for anonymous)
├─ event_name  text    (see catalog below)
├─ properties  jsonb   (event-specific payload)
└─ created_at  timestamptz
```

### Event catalog

| event_name | when | useful properties |
| --- | --- | --- |
| `app_opened` | once per browser session | — |
| `user_signed_up` | new account | — |
| `user_logged_in` | password login | — |
| `resume_created` | new resume | `resume_id` |
| `pdf_exported` | resume PDF downloaded | `resume_id` |
| `ats_check_run` | ATS analysis finished | `overall_score`, `resume_id` |
| `interview_prep_generated` | prep questions generated | `question_count` |
| `mock_interview_started` | mock interview begun | `company`, `role` |
| `mock_interview_completed` | report generated | `overall_score` |
| `application_created` | tracker application added | `company`, `channel` |
| `application_status_changed` | status updated | `status` |
| `checkout_started` | clicked upgrade → Stripe checkout | `interval` |
| `subscription_activated` | became Pro (webhook) | `plan` |
| `subscription_cancelled` | reverted to free (webhook) | — |

> Reading `properties`: use the `->>` operator, e.g.
> `(properties->>'overall_score')::int`.

---

## 1. Activity & retention

**Daily active users (last 30 days)** — anyone who opened the app:
```sql
select date_trunc('day', created_at)::date as day,
       count(distinct user_id) as dau
from events
where event_name = 'app_opened'
  and created_at > now() - interval '30 days'
group by 1
order by 1;
```

**New signups per day:**
```sql
select date_trunc('day', created_at)::date as day,
       count(*) as signups
from events
where event_name = 'user_signed_up'
group by 1
order by 1;
```

**Day-1 / Day-7 retention** (did a user come back N days after signing up?):
```sql
with signups as (
  select user_id, min(created_at)::date as signup_day
  from events
  where event_name = 'user_signed_up'
  group by 1
),
activity as (
  select distinct user_id, created_at::date as active_day
  from events
  where event_name = 'app_opened'
)
select s.signup_day,
       count(distinct s.user_id) as cohort_size,
       count(distinct case when a.active_day = s.signup_day + 1 then s.user_id end) as d1_retained,
       count(distinct case when a.active_day = s.signup_day + 7 then s.user_id end) as d7_retained
from signups s
left join activity a on a.user_id = s.user_id
group by 1
order by 1;
```

---

## 2. Feature usage & AI volume

**How often each feature is used (last 30 days):**
```sql
select event_name, count(*) as uses, count(distinct user_id) as users
from events
where created_at > now() - interval '30 days'
group by 1
order by uses desc;
```

**AI calls per day** (your Groq cost/limit driver):
```sql
select date_trunc('day', created_at)::date as day, count(*) as ai_calls
from events
where event_name in ('ats_check_run','interview_prep_generated','mock_interview_started')
group by 1
order by 1;
```

**Average mock interview score:**
```sql
select round(avg((properties->>'overall_score')::numeric), 1) as avg_score,
       count(*) as completed
from events
where event_name = 'mock_interview_completed';
```

---

## 3. Free → paid conversion (the key business metric)

**Overall funnel:**
```sql
select
  count(distinct user_id) filter (where event_name = 'user_signed_up')         as signed_up,
  count(distinct user_id) filter (where event_name = 'checkout_started')        as started_checkout,
  count(distinct user_id) filter (where event_name = 'subscription_activated')  as became_pro
from events;
```

**Conversion rate (% of signups who became Pro):**
```sql
with f as (
  select
    count(distinct user_id) filter (where event_name = 'user_signed_up')        as signed_up,
    count(distinct user_id) filter (where event_name = 'subscription_activated') as paid
  from events
)
select signed_up, paid,
       round(100.0 * paid / nullif(signed_up, 0), 1) as conversion_pct
from f;
```

**Which plan do payers pick:**
```sql
select properties->>'plan' as plan, count(*) 
from events
where event_name = 'subscription_activated'
group by 1;
```

---

## 4. Acquisition channel (from your tracker)

Where users say they applied — a proxy for which job boards your audience uses:
```sql
select properties->>'channel' as channel, count(*) as applications
from events
where event_name = 'application_created'
  and properties->>'channel' is not null
group by 1
order by applications desc;
```

---

## Exporting for Python analysis

1. Supabase → **Table editor → events → Export → CSV**, or run any query above
   and use the **Download CSV** button.
2. Then in a notebook:
   ```python
   import pandas as pd
   df = pd.read_csv('events.csv', parse_dates=['created_at'])
   # properties is JSON text — expand it:
   props = pd.json_normalize(df['properties'].apply(eval))
   df = pd.concat([df.drop(columns=['properties']), props], axis=1)
   ```
3. From here: cohort heatmaps, funnel charts, score distributions, etc.

> For larger datasets, connect directly with the Supabase Postgres connection
> string (Settings → Database) using `psycopg2` / `sqlalchemy` and `pd.read_sql`.

---

## Notes

- Events are written server-side via `lib/analytics/track.ts` using the
  service-role key, so they're reliable and can't be spoofed by the browser.
  The only client-triggered events are whitelisted in `lib/analytics/actions.ts`.
- `track()` never throws — if logging fails, the user's action still succeeds.
- To add a new event: call `track('your_event', { ...props })` from any server
  action (or add it to the client whitelist for client-side events).
