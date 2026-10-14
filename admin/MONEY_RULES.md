# Trippin' Travels — Money Rules (for partners)

The plain-English version of how the dashboard works out every figure, and the rules
behind who gets paid what, each month. **No technical knowledge needed.** (The exact
technical version lives in `MONEY_FLOW.md`; this is the same thing in everyday words.)

---

## 1. The two pots

All profit goes into one of two shared pots, and each pot is split **equally** among
its partners:

- **Travel pot** — profit from trips / packages. (Currently shared 4 ways.)
- **Car pot** — profit from car hires, including a fleet car used inside a trip.
  (Currently shared 3 ways.)

Who's in each pot can change over time, and the system remembers the arrangement that
was in force **when each booking happened** — so changing the split never disturbs old
bookings. You can't back-date a split change.

---

## 2. How a booking earns money

Every booking has a **gross** (what the customer pays) and some **costs**. What's left
is the **profit (net)** that goes to a pot. Here are the four situations.

**① A car hire on its own (standalone).**
> Profit = Fare − Commission − Toll − Driver cost → **Car pot**

- *Fare* is either the flat fare, or (for a by-distance hire) base + kilometres × rate.
- A by-distance hire has **no fare yet** until the kilometres are entered.

**② A trip with no car.**
> Profit = Booking amount − Cost except car − Commission → **Travel pot**

**③ A trip using our own fleet car.**
The trip "pays" our car side a **Car cost**. That splits into two:
> Travel profit = Booking amount − Cost except car − Car cost − Commission → **Travel pot**
> Car profit    = Car cost − Toll − Driver cost → **Car pot**

Because the Car cost is money moving from our travel side to our car side, it's just an
internal hand-off — add the two profits together and the Car cost cancels out. The real
profit on the trip is: Booking amount − Cost except car − Commission − Toll − Driver cost.

**④ A trip using an outside (hired) car.**
Same as ③ on the travel side, **but** the Car cost is paid to someone outside the
business, so there's **no car-pot profit** — it simply leaves. That's correct: it isn't
our car, so our car pot earns nothing from it.

> **The money words, in plain terms:**
> - **Booking amount / Fare / Gross** — what the customer is charged.
> - **Cost except car** — the trip's costs other than the car (hotels, entries, guides).
> - **Car cost** — what the trip pays for the car (to our car pot, or to an outside vendor).
> - **Commission** — a cut paid to whoever referred the booking.
> - **Toll** / **Driver cost** — the car trip's running costs.
> - **Net / Profit** — what's left after those costs.

---

## 3. The most important rule: we only count money that's actually been paid

Profit is **not** counted when the trip happens — it's counted **only once the customer
has fully paid**, and it lands in the month the **final payment** arrives.

This one rule handles a lot of real-life situations cleanly:

- **A trip at the end of the month, paid next month.** The booking is for 30–31 October
  but the customer clears the balance on 2 November → the profit counts in **November**
  (the month the money actually arrived), not October. Nothing is lost; it simply moves
  forward to the month it was paid. **This is how revenue flows to the next month.**
- **Part-paid or unpaid.** The booking counts **nothing** yet. It shows up as
  **pending** / **due** so you can chase it, and it drops into a settlement the moment
  it's fully paid.
- **Advance now, balance later.** It counts in the month the **balance** clears, not
  the month of the advance.
- **A by-distance car trip with no kilometres yet.** We can't know the fare, so it
  counts nothing until the kilometres are entered **and** it's fully paid.

In the monthly settlement these not-yet-ready bookings appear in the amber **"Not
settled this month"** list — a reminder, not a problem. They'll come in automatically
when they're finished and paid.

---

## 4. Expenses (running costs)

An expense is a running cost (tax, insurance, service, EMI, fuel, etc.). It's tagged as
either a **Car** or a **Travel** expense, and two things happen in the month it's dated:

1. It **comes out of that pot** — shared equally among that pot's partners.
2. The partner who **paid** it is **reimbursed in full**.

Example: a partner pays ₹3,000 for a car service. The three car-pot partners each bear
₹1,000, and the partner who paid gets ₹3,000 back. Net effect: the cost is shared
fairly and the person who fronted the cash is made whole. (Across everyone it balances
to zero — it's just moving money between partners.)

> **Don't double-count:** never log a booking's own costs (hotels, commission, toll,
> driver) as an expense — they're already inside that booking's profit. Expenses are
> for **overheads only**.

---

## 5. How the monthly settlement is worked out

For each month, for each partner:

1. Take every booking that became **fully paid** that month, and add its profit to the
   right pot (Travel or Car; a trip's fleet car goes to the Car pot).
2. Subtract that month's **expenses** from the matching pot, and credit each payer their
   **reimbursement**.
3. **Split each pot equally** among its partners (using the arrangement in force when
   each booking happened).
4. A partner's payout for the month =
   **their travel share + their car share + anything they're owed back for expenses.**

Everyone's share for the month is recorded together when you press **Settle month**.

**Fairness on the last rupee.** When a pot doesn't divide evenly (say ₹2,000 among 3
people), the odd rupees are handed out one at a time, and **which partner gets the odd
rupee rotates** from booking to booking — so over time it evens out, and the totals
always add up exactly.

---

## 6. Cancellations

A cancelled booking is **kept on record** but **earns nothing** — it's removed from all
profit. How it plays out depends on timing:

- **Cancelled in the same month it was paid** → the profit and its removal happen in the
  same month, so it simply nets to **zero** for that month. No one is paid for it.
- **Paid one month, cancelled a later month** → the profit was counted in the first
  month; the cancellation **reverses it** in the later month (partners effectively give
  that profit back). Over the two months it nets to zero.
- **Cancelled before it was ever fully paid** → it never counted, so there's nothing to
  undo.
- A cancelled **trip** also cancels the **fleet car** attached to it.

Because reversals land in the month of the cancellation, settling **month by month in
order** keeps everything balanced.

---

## 7. When a past month's figures change ("Needs update")

A month you already settled can become **"Needs update"** if something changes
afterwards — a **late payment**, an **edit** to a booking, a **refund** (a deleted
payment), or a **cancellation**. The badge means "the real figures no longer match what
you recorded." Just open that month and **Re-settle** it to refresh. Nothing is lost;
the figures simply catch up.

A tip or an **overpayment doesn't increase** anyone's profit — profit is based on the
agreed charge, not on extra money that happened to come in.

---

## 8. A worked example (simple)

Say the Travel pot is **A, B, C, D** (4 partners) and the Car pot is **A, B, D**
(3 partners). In **October** these happen and are **fully paid**:

**A trip with our own car** (paid 20 Oct): charged ₹40,000; hotels etc. ₹10,000; car
cost ₹13,000; commission ₹2,000; the car's toll ₹1,000 and driver ₹3,000.
- Travel profit = 40,000 − 10,000 − 13,000 − 2,000 = **₹15,000** → split 4 ways →
  **₹3,750 each** (A, B, C, D).
- Car profit = 13,000 − 1,000 − 3,000 = **₹9,000** → split 3 ways → **₹3,000 each**
  (A, B, D).

**A standalone car hire** (paid 25 Oct): fare ₹6,000, toll ₹500, driver ₹1,000.
- Car profit = 6,000 − 500 − 1,000 = **₹4,500** → split 3 ways → **₹1,500 each** (A, B, D).

**A car service expense** of ₹3,000, paid by **B** on 10 Oct.
- Car pot − ₹3,000 → **−₹1,000 each** (A, B, D); and **B is reimbursed ₹3,000**.

**Everyone's October payout:**

| Partner | Travel share | Car share | Reimbursed | **Total** |
|---|---|---|---|---|
| **A** | 3,750 | 3,000 + 1,500 − 1,000 = 3,500 | — | **₹7,250** |
| **B** | 3,750 | 3,500 | 3,000 | **₹10,250** |
| **C** | 3,750 | — | — | **₹3,750** |
| **D** | 3,750 | 3,500 | — | **₹7,250** |

Total paid out: **₹28,500.** (Travel pot ₹15,000 + Car pot ₹13,500 − ₹3,000 service =
₹25,500 of real profit, plus ₹3,000 returning B's cash = ₹28,500.)

---

## 9. Quick reference — the rules in one line each

- Profit goes to the **Travel pot** or the **Car pot**, split **equally**.
- A booking earns **Gross − its costs**; a fleet car used in a trip earns the **Car pot**.
- We count profit **only when fully paid**, in the **month the money arrives**.
- A **month-end trip paid next month** counts next month — revenue carries forward.
- **Unpaid / part-paid** bookings count nothing yet (shown as pending).
- **Expenses** come out of their pot and **reimburse** whoever paid.
- **Cancellations** earn nothing; same-month nets to zero, later-month reverses the profit.
- Odd rupees in a split **rotate** so it's fair over time.
- Settle **one month at a time, in order**; a changed past month shows **Needs update** →
  Re-settle.
