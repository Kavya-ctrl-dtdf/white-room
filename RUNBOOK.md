# White Room: complete run-through

This guide takes the project from your PC to GitHub to a live Vercel link. Every step is in order.

## 1. What is in the project

```
white-room/
  app/            Pages: / , /stays, /stays/[id], /book/[id], /trips, /host, /host/new, /admin
  components/     FloorPlan, Icons, Shell (nav, footer, toast), ui (pills, price breakdown, cards)
  lib/            data (seed listings), pricing, format, search, store (state + localStorage), types
  public/         favicon.svg
  package.json, package-lock.json, tsconfig.json, tailwind.config.ts, postcss.config.mjs, next.config.mjs
  README.md       Short setup and demo script
```

No environment variables, no database, no API keys. All data is sample data in `lib/data.ts`; changes made while using the app live in the browser's localStorage.

## 2. Run it on your PC

You need Node.js 20 or newer (Node 24 is installed on this PC). Open a new terminal so it finds Node.

```bash
cd C:\Users\BZala\white-room
npm install
npm run dev
```

Open http://localhost:3000. To test the production build the way Vercel will run it:

```bash
npm run build
npm start
```

## 3. Click-through test (about 4 minutes)

1. **Home.** The floor plan draws itself. Choose "My parents", Old Airport Road, 3 months, click the search button.
2. **Results.** Open the filters, change the budget, sort by Lowest price. The address bar updates as you change them.
3. **Listing wr-101.** See the floor plan, 30 checks, nearby places and the booking panel. "Someone else" is preselected.
4. **Request to book.** Fill in the guest's name and mobile (10 digits, starting 6 to 9), your details and an email. Choose UPI. Click "Pay ... now". A 1.4 second spinner, then My stays.
5. **For owners.** The dashboard opens as Lakshmi Serviced Homes. Click Accept.
6. **My stays.** The booking is Confirmed. Click "Report a problem", write at least 10 characters (for example "The geyser does not work"), send.
7. **Verification desk, Move-in problems.** Click "Refund first month". My stays now shows the resolution.
8. **Verification queue.** Start verification on wr-701, click "Mark all as passed (demo)", then "Approve and publish". It now appears in search.
9. **15-day stay.** On the home page choose "Me, for work" and "15 days", search, and open wr-201. The panel shows "Rent for 15 days" at ₹21,000, "15 days, all in" at ₹22,793, and "Paid once, nothing later". The move-out date is 15 days after move-in. Book it: checkout shows no "Then ... each month" line. Homes tagged only for parents or treatment do not appear in a 15-day search.
10. **Footer, Reset demo data** puts everything back. Click it once before testing if you used an earlier version of the app, so the saved data picks up the 15-day option.

If any step fails, note the page and the message and send it to me.

## 4. Put it on GitHub

First, a one-time Git identity (skip if already set):

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Create an empty repository on github.com: New repository, name it `white-room`, leave "Add a README" and ".gitignore" unticked, click Create. Then, in the project folder:

```bash
cd C:\Users\BZala\white-room
git add .
git commit -m "White Room demo"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/white-room.git
git push -u origin main
```

Notes:
- `.gitignore` already excludes `node_modules`, `.next` and `.env*.local`, so the push is small.
- Keep `package-lock.json`. Vercel uses it to install the same versions you tested.
- GitHub may ask you to sign in in a browser the first time you push. That is normal.

## 5. Deploy on Vercel

1. Go to vercel.com and sign in with GitHub.
2. Click Add New, then Project. Find `white-room` and click Import.
3. Leave every setting as it is. Vercel detects Next.js. The framework preset is Next.js, the build command is `next build`, and there are no environment variables to add.
4. Click Deploy. It takes about a minute.
5. Open the `.vercel.app` link. Repeat the click-through test from section 3 on the live site.

After this, every `git push` to `main` redeploys automatically.

## 6. If something goes wrong

| Problem | Fix |
| --- | --- |
| `node` or `npm` not found | Close and reopen the terminal. If still missing, reinstall Node LTS from nodejs.org. |
| Port 3000 busy | `npm run dev -- -p 3001` |
| `git push` rejected or asks for a password | Sign in through the browser window GitHub opens, or use a personal access token as the password. |
| Vercel build fails | Open the build log, copy the first red error and send it to me. Locally `npm run build` passes. |
| Data looks wrong or stuck | Click Reset demo data in the footer, or clear the site's storage in the browser. |
| Data is not shared between two people | Expected. State is stored per browser, so each viewer has their own demo. Supabase is on the roadmap. |

## 7. Good to know for the hackathon

- The demo is single-browser by design. Do the whole story on one laptop and one browser profile.
- Payments are test mode only. No money moves and no card details are collected.
- Use Reset demo data before each presentation so the story starts clean.
- 15-day pricing is an assumption: half the monthly rent, plus GST and the 3% fee, billed once. To add a short-stay premium, change `quote()` in `lib/pricing.ts`.
