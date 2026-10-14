# Trippin' Travels — Admin Guide (for partners)

A plain-English guide to the admin dashboard. **No technical knowledge needed.**
It has two parts:

- **Part 1 — What everything on the screen means** (every number, badge, colour and
  alert, and how the numbers are worked out).
- **Part 2 — How to do things** (step-by-step for every task).

A few words we use throughout:

- **Pot** — a shared pool of profit that gets divided **equally** among the partners in
  it. There are two: the **Travel pot** (profit from trips/packages) and the **Car pot**
  (profit from car hires). You and your partners are members of one or both.
- **Gross** — the full amount of money charged to / collected from the customer, before
  any costs.
- **Net** — what's left as profit after that booking's own costs.
- **Pending** — money a customer still owes us.
- **Settlement** — the once-a-month exercise of working out how much each partner gets.

---

# PART 1 — What everything on the screen means

## Signing in & the menu
- You log in with your email (a one-time code is sent — no password to remember).
- The menu on the left lists every screen. At the very bottom is a red **Log out**.
- Everyone who can log in is a **partner**.

## Dashboard (the home screen)

### The four tiles across the top
| Tile | What it is |
|---|---|
| **Travel bookings** | How many travel (package) bookings exist, all-time. |
| **Car bookings** | How many car bookings exist (including cars used inside travel bookings). |
| **Revenue** | **Gross** money collected **this month** — the top-line, before costs. |
| **Net profit** | The **profit this month** after each booking's costs. This is the number that gets shared between partners. |

> **Revenue vs Net profit:** Revenue is everything that came in; Net profit is what's
> left after the trip's own costs (hotels, the car, commission to referrers, toll,
> driver). Net profit will always be the smaller number — that's normal.

### The small stat tiles
- **Fleet cars** — how many of our own cars are active.
- **Drivers** — how many drivers are active.
- **Partners** — how many partners share the revenue.
- **Pending** — total money customers still owe us (across all bookings), and how many
  bookings that spans.
- **Docs expiring** — how many car documents are due to expire within 30 days.

### Alerts (the "action required" list) — the notification system
These are things that need attention. The **colour** shows urgency (red = urgent,
amber = soon, muted = low). The kinds you'll see:
- **Document expiring / expired** — a car paper (insurance, pollution, fitness, permit,
  road-tax, VLTD) or a **driver's licence** is close to expiry or already expired.
  Click it to go to the Cars or Drivers screen and upload the renewal.
- **Payment pending** — a trip has finished but the customer still owes money. You can
  record the received amount right there.
- **Distance not entered** — a "by distance" car trip has ended but nobody has entered
  the kilometres, so we can't work out what to charge. Click to enter it.
- **No driver assigned** — an upcoming car trip has no driver yet.

### The rest of the dashboard
- **Revenue chart** — the last 6 months, with a **gross** line and a **net** line.
- **Recent activity** — the latest bookings, each with a status badge:
  - **Paid** — fully collected.
  - **Confirmed** — a future/ongoing booking that still has a balance, but it isn't
    overdue yet.
  - **₹X due** — the trip has ended and ₹X is still unpaid (overdue — chase it).
  - **Dist pending** — a distance trip waiting for its kilometres.
  - **Cancelled** — this booking was cancelled.
- **Upcoming departures** — the next few trips, and whether a driver is assigned.

## Travel bookings

Each row shows: the customer's name, the booking's code (like **T6**), a **Car …**
badge if a fleet car is attached, the dates, number of people, phone, and the trip
idea. On the right: a **Paid** / **₹X due** pill, the **gross**, and the **profit**
(travel net, and car net if a car is attached).

When you open a travel booking you'll see **five money figures**:

| Figure | Plain meaning | How it's worked out |
|---|---|---|
| **Gross** | The total you're charging the customer. | You type it in ("Booking amount"). |
| **Travel gross** | The trip's share of the money, after the car's share is set aside. | Gross − Car cost. |
| **Travel net** | **Profit the Travel pot keeps.** | Gross − Cost except car − Car cost − Commission. |
| **Car gross** | What the trip pays the car side. | The "Car cost" you entered. |
| **Car net** | **Profit the Car pot keeps** from this trip's car. | Car cost − Toll − Driver cost. |

The input fields in plain words:
- **Booking amount** — total charged to the customer.
- **Cost except car** — everything the trip pays out *other than* the car (hotels,
  entries, guides…).
- **Car cost** — what the trip pays for the car. If you tick **"uses a fleet car"**,
  this is money that moves to our **Car pot** (our own car earns it). If you **don't**
  tick it, this is a car hired from **outside** — the money leaves the business and the
  Car pot gets nothing (correct — it isn't our car).
- **Commission** — a cut paid to whoever referred the booking.
- **Hotels** — you can add any number of hotel contacts for the trip.
- **Total advance** (only when creating) — money taken up front; it's saved as a payment.

**Cancelling:** a cancelled travel booking stays on record but drops out of all profit
figures. If it used a fleet car, the car is cancelled with it. You must type a reason.

## Car bookings

Each row: the car, a code (**C2** for a standalone hire, or **Travel T6** for a car
that belongs to a travel booking), the registration, driver, dates and route, then on
the right the **amount** and the **net** (profit).

- **Amount** — what the hire is worth. For a **flat** hire it's the flat fare; for a
  **by-distance** hire it's base + (kilometres × rate), and it shows **Pending** until
  the kilometres are entered.
- **Net (profit)** — Amount − Commission − Toll − Driver cost.
- **Pricing**: *Flat* (one fixed fare) or *Distance* (base fare + a per-kilometre rate;
  you fill the kilometres after the trip).
- **Trip-end fields** — Toll, Driver cost, and (for distance) the Kilometres — you
  usually fill these after the trip finishes. The live **Amount / Net** box updates as
  you type.
- **Cars used by a travel booking** are shown here too (badged **Travel T#**). They
  can't take their own payments and are edited mostly from the travel booking.
- **Cancelling** works like travel bookings (reason required; dropped from profit).

**Filters** at the top let you narrow the list (date range, status, duty, and — under
"More filters" — search, car, driver, pricing, type). A count shows how many match.

## Payments
- Record money received against a **travel** or a **car** booking.
- The booking dropdown shows each booking's state: **— ₹X due**, **— paid**, or
  **— amount pending** (a distance trip with no kilometres yet).
- Picking a booking fills in the outstanding amount and offers a **Pay full** button.
- The list shows every payment with its booking, amount, date and note; you can delete
  one (two clicks, to be safe).

## Expenses
- An expense is a running cost (tax, insurance, service, EMI, fuel refill, VLTD
  recharge, or miscellaneous). It's **either a Car expense or a Travel expense** — that
  decides which pot it comes out of.
- **Paid by** — the partner who actually paid. They get reimbursed in full.
- The summary line reads **"Car pot −₹X · Travel pot −₹Y"** for whatever you've
  filtered to, so you can see each pot's costs at a glance.
- ⚠️ The note on the form: **don't** enter a booking's own costs (hotels, commission,
  toll, driver) here — those are already handled inside the booking. Expenses are for
  overheads only.

## Drivers
- Each driver shows a **licence pill**: green **ok**, amber **Nd** (expires in N days),
  or red **expired** — the same alert you see on the dashboard.
- You can attach an identity document and the licence, and set the licence expiry.
- A driver can be **deactivated**, or **deleted** — but deleting is blocked if the
  driver is on any past booking (you're asked to reassign upcoming trips first).

## Cars
- Each car shows expiry pills for its documents (insurance, pollution/PUC, fitness,
  etc.) using the same colours.
- You add a car by picking its make → model and typing the registration, then upload
  documents and set expiry dates in the **Documents** panel.

## Partners
- Lists the people who can use the dashboard and share in revenue.
- **Revenue splits** — two cards (Travel and Car) show who shares each pot and from
  what date. **Change split** lets you pick the members; the new split starts from a
  date you choose (today or later — you can't back-date a split) and **past bookings
  keep their old split**.
- **Split history** shows every past split.

## Settlements
This is where each month's profit is divided. Pick a month with the dropdown / arrows
(you can look at future months too).

- **The four totals:**
  - **Travel pot** — the travel profit to share this month (after travel expenses).
  - **Car pot** — the car profit to share this month (after car expenses).
  - **Reimbursements** — money owed back to partners who paid expenses.
  - **Month total** — everything to be paid out this month.
- **"Not settled this month" (amber box)** — trips that have finished but **aren't ready
  yet** (not fully paid, or a distance trip missing kilometres). They're **not lost** —
  they'll settle in whichever month they get finished/paid. Nothing is stranded.
- **Partner table** — each partner's share, split into **Travel**, **Car**,
  **Reimburse** and **Total**, with a status:
  - **Unsettled** — not yet paid out for this month.
  - **Settled** — recorded as paid out.
  - **Needs update** — this month was settled, but the figures have since changed (a
    late payment, an edit, or a cancellation). Re-settle it to refresh.
- **Buttons:** **Settle month** (record everyone's share), **Re-settle month** (refresh
  after a change), **Un-settle month** (undo). Each asks you to confirm.

---

# PART 2 — How to do things (step by step)

> General tip: the loading spinner says **"brewing…"**. If a save fails, the reason
> shows in red on the form.

## A. Add a car to the fleet
1. Go to **Cars → Add car**.
2. Pick the **Make**, then the **Model**, and type the **Registration number**. Save.
3. Open the car's **Documents**. For each paper (RC, Insurance, Pollution, Fitness,
   Permit, Road tax, VLTD): choose the file, set its **expiry date**, and for extra
   papers use **Add document**. Click **Save documents**.
4. Expiry dates drive the dashboard alerts, so keep them accurate.

## B. Add a driver
1. **Drivers → Add driver**.
2. Enter name, contact and licence number.
3. In **Documents**, attach the identity and licence files, and set the **licence
   expiry** (this feeds the licence alert). Save.

## C. Add a partner / change a revenue split
1. **Partners → Add partner** (name, email, phone).
2. To change who shares a pot: under **Revenue splits** click **Change split** on the
   Travel or Car card, tick the partners, choose an **effective date** (today or later),
   and save. Older bookings keep the old split; the new one applies from that date on.

## D. Make a standalone car booking
1. **Car bookings → New booking.**
2. Choose the **Car** and (optionally) the **Driver**, set the **dates**, **duty type**
   and **route**.
3. **Pricing:**
   - **Flat** — type the **flat fare**.
   - **Distance** — type the **base fare** and the **per-km rate**; leave **Distance**
     blank for now (fill it after the trip). Until then the amount shows **Pending**.
4. Optionally enter **Toll**, **Driver cost**, **Commission**, **Vendor**.
5. Optionally record an **Advance** (amount + date) — it's saved as a payment.
6. Watch the **Amount / Net** box update, then **Create booking**.

## E. Make a travel (package) booking
1. **Travel bookings → New booking.**
2. Fill customer details, dates, people, itinerary.
3. Add any **Hotels** (name, location, contact) with **Add hotel**.
4. **Money:** enter **Booking amount** (what the customer pays), **Cost except car**
   (hotels/entries/etc.), **Car cost**, and **Commission**.
5. **Using a car?**
   - **Our own car:** tick **"uses a fleet car"**, then pick the car, driver, route and
     enter **Toll** and **Driver cost**. The car's fare is automatically set to the
     **Car cost** you typed.
   - **An outside/hired car:** just leave **Car cost** filled and **don't** tick the
     box — that money is treated as paid to an outside vendor.
6. Optionally enter a **Total advance** (saved as a payment).
7. Check the five figures (Gross / Travel gross / Travel net / Car gross / Car net),
   then **Create booking**.

## F. Record a payment / mark fully paid
1. **Payments → Record payment.**
2. Choose **Travel** or **Car**, then the booking (the dropdown shows how much is due).
3. The amount pre-fills with the outstanding balance — or click **Pay full**. Set the
   date and an optional note. **Record payment.**
4. The booking's **due/paid** status updates everywhere.

## G. Enter trip-end details (after a trip finishes)
1. Open the car booking (or the travel booking's car) in **Edit / Trip details**.
2. Enter the **Kilometres** (for distance trips), **Toll** and **Driver cost**. Save.
3. The amount stops being **Pending** and the profit updates.

## H. Cancel (and restore) a booking
1. Open the booking's screen and click **Cancel**.
2. Type a **reason** (required) and confirm.
3. The booking is greyed out, marked **Cancelled**, and drops out of all profit. A
   cancelled travel booking also cancels its fleet car.
4. To undo, click **Restore**.

## I. Record an expense
1. **Expenses → Add expense.**
2. Set the **date** and **amount**, choose **Car** or **Travel**, pick a **Reason**,
   and the **Paid by** partner. Save.
3. The pot totals and that partner's reimbursement update at the next settlement.

## J. Settle a month (the monthly payout)
1. **Settlements** → pick the **month** (settle last month once it's closed and mostly
   paid up).
2. Read the **four totals** and scan the **"Not settled this month"** box — those
   bookings aren't ready; chase payments / enter kilometres if you want them included
   this month, otherwise they'll come in later automatically.
3. Check the **partner table** (each person's Travel + Car + Reimburse = Total).
4. Click **Settle month** and confirm. Everyone's share is recorded.
5. If something later changes and the month shows **Needs update**, click **Re-settle
   month** to refresh (the figures will reflect the change). Use **Un-settle month** to
   undo a settlement entirely.

> **Golden rule:** settle **one month at a time, in order** (oldest first). That keeps
> every late payment and cancellation landing in the right place. See **MONEY_RULES.md**
> for exactly how the figures are worked out.

## K. ⚠️ Avoid having to re-settle — don't disturb a month you've already settled

A settled month should stay final. It only turns **"Needs update"** (meaning you'd
have to re-settle and re-pay the difference) if something changes **inside that already-
settled month**. There are four ways that happens — **avoid all of them:**

> **① ⚠️ A late payment dated inside a settled month.**
> A booking counts in the month it's **fully paid**. If a customer actually paid within,
> say, October but you record that payment **after** you've already settled October,
> October's totals change and it needs re-settling.
> **Avoid it:** settle a month **only after all its payments are in**. If a payment
> genuinely arrives late, record it with the **real date it was received** — if that's a
> new, unsettled month, it simply counts there and disturbs nothing.

> **② ⚠️ Cancelling a booking in a month you've already settled.**
> If you cancel a booking in the same already-settled month, that month's profit drops
> (the booking now earns nothing) and it needs re-settling.
> **Avoid it:** decide on cancellations **before** you settle the month. A cancellation
> made in a **later, open** month is fine — it just reverses the profit there, and never
> touches the closed month.

> **③ ⚠️ Editing a booking that belongs to a settled month.**
> Changing any money figure (amount, cost, car cost, commission, toll, driver, etc.) on
> a booking that was counted in a settled month changes that month's totals.
> **Avoid it:** get the figures right **before** settling. Once a month is settled,
> treat its bookings as locked — don't edit them.

> **④ ⚠️ Refunding / deleting a payment from a settled month.**
> Deleting a payment can drop a booking below "fully paid", pulling it **out** of a
> month you already settled — which then needs re-settling.
> **Avoid it:** don't delete payments on settled bookings. If a refund is genuinely
> needed, handle it as part of a **cancellation** in the current open month.

**In short:** finish a month first — collect the payments, enter the kilometres, make
any cancellations and fixes — **then** settle it, and **leave it alone** afterwards. Do
that and you'll never need to re-settle. ("Needs update" and **Re-settle** exist as a
safety net for when something slips through — not as a normal step.)
