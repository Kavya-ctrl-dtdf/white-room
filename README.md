# White Room

A marketplace for verified serviced apartments in Bengaluru, for stays of 15 days to 6 months. The 15-day stay is aimed at hybrid and remote workers. Every home is shown as a floor plan drawn from an in-person visit, priced by the month with GST and fees included.

This is a clickable demo for validation. There is no backend. Listings, hosts and prices are sample data, payments run in test mode, and all state is kept in the browser (localStorage key `white-room-demo-v1`).

Stack: Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS 3. Fonts are self-hosted through npm. No environment variables are needed.

## Set up

```bash
npm install
npm run dev
```

Open http://localhost:3000. Check the production build with `npm run build`.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose Add New, then Project, and import the repository.
3. Leave every setting at its default and deploy. There are no environment variables.

## Three-minute demo script

1. **Find a home (0:30).** On the home page, choose "My parents", Old Airport Road, 3 months, and search. Open wr-101, the garden-facing 1 BHK near Manipal Hospital. Point out the floor plan, the 30 checks and the "Verified in person" date.
2. **Book for parents (0:45).** The panel already says "Someone else". Click Request to book. Enter the parents' name and mobile, then your own details and a valid email, such as a 10-digit number starting with 9. Click "Pay now". You land on My stays with the request waiting.
3. **Accept as the owner (0:30).** Open For owners. The dashboard opens as Lakshmi Serviced Homes, the owner of wr-101. Click Accept and note the payout line.
4. **Report a problem (0:45).** Back in My stays the booking is confirmed. Click "Report a problem" and write "The geyser in the bathroom does not work". Send the report.
5. **Refund (0:30).** Open the Verification desk, then Move-in problems. Click "Refund first month". Return to My stays to see the resolution.

Hybrid and remote workers: search "Me, for work" with "15 days", then open wr-201. The price is half a month's rent plus GST and the fee, paid once, with no later payments. Only homes tagged for work accept 15-day stays; the rest start at 1 month.

Bonus: in the Verification queue, start verification on wr-701, click "Mark all as passed (demo)", and publish it. It now appears in search. The footer has a Reset demo data button.

## Sign-in with Supabase (optional)

Accounts are off by default, so the site stays an open demo and deploys with no environment variables. To switch them on:

1. Create a Supabase project and run `supabase/schema.sql` in the SQL Editor.
2. Copy `.env.example` to `.env.local` and fill in the project URL and publishable key. Add the same variables in Vercel under Settings, then Environment Variables.
3. In Supabase, under Authentication, then URL Configuration, set the site URL and add `/auth/callback` on localhost and on your Vercel address as redirect URLs. Enable the Google provider if you want Google sign-in.
4. Sign in once, then make yourself admin in the SQL Editor (the last line of the schema file shows how).

When on: `/trips`, `/book` and `/host/new` need any signed-in user, `/host` needs a host or admin, and `/admin` needs an admin. The sign-in page returns people to the page they came from.

Bookings and listings still live in each browser. They are not yet tied to a user account.

## Roadmap

- **Supabase:** real accounts, listings, bookings and owner payouts in Postgres, with row-level security.
- **Live Razorpay:** UPI and card payments, automatic refunds, monthly mandates and GST invoices.
- **Real photos and video:** walkthrough videos and photos alongside the floor plan, uploaded at the verification visit.
- **Corporate accounts:** company billing, one invoice for many stays, and approval flows for travel desks.
