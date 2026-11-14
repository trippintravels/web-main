var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/bookings.js
var json = /* @__PURE__ */ __name((obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } }), "json");
var body = /* @__PURE__ */ __name(async (req) => {
  try {
    return await req.json();
  } catch {
    return null;
  }
}, "body");
var pick = /* @__PURE__ */ __name((obj, cols) => {
  const out = {};
  for (const c of cols) if (obj && obj[c] !== void 0) out[c] = obj[c];
  return out;
}, "pick");
async function nextId(env, series) {
  const r = await env.DB.prepare("UPDATE counters SET value = value + 1 WHERE name = ? RETURNING value").bind(series).first();
  const prefix = series === "travel" ? "T" : series === "enquiry" ? "E" : "C";
  return prefix + r.value;
}
__name(nextId, "nextId");
async function insertRow(env, table, data, extra = {}) {
  const m = { ...data, ...extra };
  const cols = Object.keys(m);
  const sql = `INSERT INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")}) RETURNING *`;
  return env.DB.prepare(sql).bind(...cols.map((c) => m[c])).first();
}
__name(insertRow, "insertRow");
var TRAVEL_COLS = [
  "start_date",
  "end_date",
  "pax",
  "itinerary",
  "addons",
  "exclusions",
  "customer_name",
  "customer_phone",
  "booking_amount",
  "cost_except_car",
  "car_cost",
  "car_included",
  "vendor_name",
  "vendor_contact",
  "commission",
  "comments",
  "cancelled",
  "cancelled_at",
  "cancel_reason",
  "ext_driver",
  "ext_car_no",
  "ext_contact"
];
var CAR_COLS = [
  "car_id",
  "driver_id",
  "start_date",
  "end_date",
  "duty_type",
  "route",
  "vendor_name",
  "vendor_contact",
  "commission",
  "toll",
  "driver_cost",
  "pricing_type",
  "flat_fare",
  "base_fare",
  "per_km_rate",
  "distance_km",
  "remarks",
  "cancelled",
  "cancelled_at",
  "cancel_reason"
];
var CAR_JOIN = `SELECT cb.*, c.registration_no, m.make, m.model, d.name AS driver_name
  FROM car_bookings cb
  LEFT JOIN cars c ON c.id = cb.car_id
  LEFT JOIN car_models m ON m.id = c.model_id
  LEFT JOIN drivers d ON d.id = cb.driver_id`;
async function createTravel(env, input) {
  if (!input || !input.customer_name) return json({ error: "missing_customer_name" }, 400);
  if (input.car_included && (!input.car || !input.car.car_id))
    return json({ error: "car_included_requires_car.car_id" }, 400);
  const displayId = await nextId(env, "travel");
  const travel = await insertRow(env, "travel_bookings", pick(input, TRAVEL_COLS), { display_id: displayId });
  const hotels = Array.isArray(input.hotels) ? input.hotels : [];
  for (const h of hotels)
    await env.DB.prepare("INSERT INTO travel_booking_hotels (travel_booking_id, hotel_name, location, contact) VALUES (?,?,?,?)").bind(travel.id, h.hotel_name ?? null, h.location ?? null, h.contact ?? null).run();
  let car_booking = null;
  if (input.car_included)
    car_booking = await insertRow(
      env,
      "car_bookings",
      pick(input.car, CAR_COLS),
      { display_id: displayId, origin: "travel", travel_booking_id: travel.id }
    );
  return json({ data: { ...travel, hotels, car_booking } }, 201);
}
__name(createTravel, "createTravel");
async function getTravel(env, id) {
  const t = await env.DB.prepare("SELECT * FROM travel_bookings WHERE id = ?").bind(id).first();
  if (!t) return json({ error: "not_found" }, 404);
  const hotels = (await env.DB.prepare("SELECT * FROM travel_booking_hotels WHERE travel_booking_id = ?").bind(id).all()).results;
  const car_booking = await env.DB.prepare("SELECT * FROM car_bookings WHERE travel_booking_id = ?").bind(id).first();
  const payments = (await env.DB.prepare("SELECT * FROM payments WHERE travel_booking_id = ? ORDER BY received_on").bind(id).all()).results;
  return json({ data: { ...t, hotels, car_booking, payments } });
}
__name(getTravel, "getTravel");
async function listTravel(env) {
  return json({ data: (await env.DB.prepare("SELECT * FROM travel_bookings ORDER BY id DESC").all()).results });
}
__name(listTravel, "listTravel");
async function updateTravel(env, id, input) {
  input = input || {};
  const data = pick(input, TRAVEL_COLS);
  const cols = Object.keys(data);
  if (cols.length) {
    const ok = await env.DB.prepare(`UPDATE travel_bookings SET ${cols.map((c) => `${c} = ?`).join(", ")} WHERE id = ? RETURNING id`).bind(...cols.map((c) => data[c]), id).first();
    if (!ok) return json({ error: "not_found" }, 404);
  }
  if (Array.isArray(input.hotels)) {
    await env.DB.prepare("DELETE FROM travel_booking_hotels WHERE travel_booking_id = ?").bind(id).run();
    for (const h of input.hotels)
      await env.DB.prepare("INSERT INTO travel_booking_hotels (travel_booking_id, hotel_name, location, contact) VALUES (?,?,?,?)").bind(id, h.hotel_name ?? null, h.location ?? null, h.contact ?? null).run();
  }
  // Reconcile the linked fleet car_booking to match car_included. Only runs when the
  // caller explicitly sends car_included, so older callers that never touch car type
  // are unaffected. This moves NO money: the car pot is still driven by car_cost /
  // car_included on the travel row; the linked car_bookings row is only the fleet-car
  // detail record. Linked travel cars carry no standalone payments (advances are stored
  // against travel_booking_id), so removing one orphans nothing.
  if (input.car_included !== void 0) {
    const existing = await env.DB.prepare("SELECT id FROM car_bookings WHERE travel_booking_id = ?").bind(id).first();
    if (input.car_included && input.car && input.car.car_id) {
      const carData = pick(input.car, CAR_COLS);
      if (existing) {
        const ccols = Object.keys(carData);
        if (ccols.length)
          await env.DB.prepare(`UPDATE car_bookings SET ${ccols.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`).bind(...ccols.map((c) => carData[c]), existing.id).run();
      } else {
        const trow = await env.DB.prepare("SELECT display_id FROM travel_bookings WHERE id = ?").bind(id).first();
        await insertRow(env, "car_bookings", carData, { display_id: trow ? trow.display_id : null, origin: "travel", travel_booking_id: id });
      }
    } else if (existing) {
      await env.DB.prepare("DELETE FROM car_bookings WHERE travel_booking_id = ?").bind(id).run();
    }
  }
  return getTravel(env, id);
}
__name(updateTravel, "updateTravel");
async function createCar(env, input) {
  if (!input || !input.car_id) return json({ error: "missing_car_id" }, 400);
  if (input.pricing_type && !["flat", "distance"].includes(input.pricing_type))
    return json({ error: "bad_pricing_type" }, 400);
  const displayId = await nextId(env, "car");
  const row = await insertRow(env, "car_bookings", pick(input, CAR_COLS), { display_id: displayId, origin: "standalone" });
  return json({ data: row }, 201);
}
__name(createCar, "createCar");
async function getCar(env, id) {
  const row = await env.DB.prepare(`${CAR_JOIN} WHERE cb.id = ?`).bind(id).first();
  if (!row) return json({ error: "not_found" }, 404);
  const payments = (await env.DB.prepare("SELECT * FROM payments WHERE car_booking_id = ? ORDER BY received_on").bind(id).all()).results;
  return json({ data: { ...row, payments } });
}
__name(getCar, "getCar");
async function listCars(env, url) {
  const origin = url.searchParams.get("origin");
  const sql = CAR_JOIN + (origin ? " WHERE cb.origin = ?" : "") + " ORDER BY cb.id DESC";
  const { results } = await env.DB.prepare(sql).bind(...origin ? [origin] : []).all();
  return json({ data: results });
}
__name(listCars, "listCars");
async function updateCar(env, id, input) {
  const data = pick(input || {}, CAR_COLS);
  const cols = Object.keys(data);
  if (!cols.length) return json({ error: "empty_body", detail: "Nothing to update \u2014 no changes were provided." }, 400);
  const row = await env.DB.prepare(`UPDATE car_bookings SET ${cols.map((c) => `${c} = ?`).join(", ")} WHERE id = ? RETURNING *`).bind(...cols.map((c) => data[c]), id).first();
  return row ? json({ data: row }) : json({ error: "not_found" }, 404);
}
__name(updateCar, "updateCar");
async function createPayment(env, input) {
  if (!input) return json({ error: "bad_body" }, 400);
  const t = input.travel_booking_id ?? null, cb = input.car_booking_id ?? null;
  if (!!t === !!cb) return json({ error: "exactly_one_booking_required" }, 400);
  if (input.amount == null) return json({ error: "missing_amount" }, 400);
  if (!input.received_on) return json({ error: "missing_received_on" }, 400);
  if (cb) {
    const r = await env.DB.prepare("SELECT origin FROM car_bookings WHERE id = ?").bind(cb).first();
    if (!r) return json({ error: "car_booking_not_found" }, 404);
    if (r.origin === "travel") return json({ error: "payments_not_allowed_on_travel_linked_car" }, 400);
  }
  const row = await insertRow(env, "payments", {
    travel_booking_id: t,
    car_booking_id: cb,
    amount: input.amount,
    received_on: input.received_on,
    note: input.note ?? null
  });
  return json({ data: row }, 201);
}
__name(createPayment, "createPayment");
async function listPayments(env, url) {
  const t = url.searchParams.get("travel_booking_id"), cb = url.searchParams.get("car_booking_id");
  let sql = "SELECT * FROM payments", binds = [];
  if (t) {
    sql += " WHERE travel_booking_id = ?";
    binds.push(t);
  } else if (cb) {
    sql += " WHERE car_booking_id = ?";
    binds.push(cb);
  }
  sql += " ORDER BY received_on";
  return json({ data: (await env.DB.prepare(sql).bind(...binds).all()).results });
}
__name(listPayments, "listPayments");
async function deletePayment(env, id) {
  const r = await env.DB.prepare("DELETE FROM payments WHERE id = ? RETURNING id").bind(id).first();
  return r ? json({ ok: true }) : json({ error: "not_found" }, 404);
}
__name(deletePayment, "deletePayment");
async function handleBookings(request, env, url, res, id) {
  const method = request.method;
  try {
    if (res === "travel-bookings") {
      if (!id && method === "GET") return listTravel(env);
      if (!id && method === "POST") return createTravel(env, await body(request));
      if (id && method === "GET") return getTravel(env, id);
      if (id && (method === "PATCH" || method === "PUT")) return updateTravel(env, id, await body(request));
      return json({ error: "method_not_allowed" }, 405);
    }
    if (res === "car-bookings") {
      if (!id && method === "GET") return listCars(env, url);
      if (!id && method === "POST") return createCar(env, await body(request));
      if (id && method === "GET") return getCar(env, id);
      if (id && (method === "PATCH" || method === "PUT")) return updateCar(env, id, await body(request));
      return json({ error: "method_not_allowed" }, 405);
    }
    if (res === "payments") {
      if (!id && method === "GET") return listPayments(env, url);
      if (!id && method === "POST") return createPayment(env, await body(request));
      if (id && method === "DELETE") return deletePayment(env, id);
      return json({ error: "method_not_allowed" }, 405);
    }
    return json({ error: "not_found" }, 404);
  } catch (err) {
    return json({ error: "server_error", detail: String(err?.message || err) }, 500);
  }
}
__name(handleBookings, "handleBookings");

// src/finance.js
var json2 = /* @__PURE__ */ __name((obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } }), "json");
var body2 = /* @__PURE__ */ __name(async (req) => {
  try {
    return await req.json();
  } catch {
    return null;
  }
}, "body");
var pick2 = /* @__PURE__ */ __name((obj, cols) => {
  const out = {};
  for (const c of cols) if (obj && obj[c] !== void 0) out[c] = obj[c];
  return out;
}, "pick");
async function insertRow2(env, table, data) {
  const cols = Object.keys(data);
  const sql = `INSERT INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")}) RETURNING *`;
  return env.DB.prepare(sql).bind(...cols.map((c) => data[c])).first();
}
__name(insertRow2, "insertRow");
var EXP_COLS = ["date", "amount", "reason", "category", "paid_by_user_id", "remarks"];
async function createExpense(env, input) {
  for (const r of ["date", "amount", "category", "paid_by_user_id"])
    if (input == null || input[r] == null) return json2({ error: `missing_${r}` }, 400);
  try {
    return json2({ data: await insertRow2(env, "expenses", pick2(input, EXP_COLS)) }, 201);
  } catch (e) {
    return json2({ error: "insert_failed", detail: String(e?.message || e) }, 400);
  }
}
__name(createExpense, "createExpense");
async function listExpenses(env, url) {
  let sql = `SELECT e.*, u.name AS paid_by_name FROM expenses e LEFT JOIN users u ON u.id = e.paid_by_user_id`;
  const w = [], b = [];
  const cat = url.searchParams.get("category");
  if (cat) {
    w.push("e.category = ?");
    b.push(cat);
  }
  const month = url.searchParams.get("month");
  if (month) {
    w.push("e.date LIKE ?");
    b.push(month + "%");
  }
  const payer = url.searchParams.get("paid_by");
  if (payer) {
    w.push("e.paid_by_user_id = ?");
    b.push(payer);
  }
  if (w.length) sql += " WHERE " + w.join(" AND ");
  sql += " ORDER BY e.date DESC";
  return json2({ data: (await env.DB.prepare(sql).bind(...b).all()).results });
}
__name(listExpenses, "listExpenses");
async function updateExpense(env, id, input) {
  const data = pick2(input || {}, EXP_COLS);
  const cols = Object.keys(data);
  if (!cols.length) return json2({ error: "empty_body" }, 400);
  const row = await env.DB.prepare(`UPDATE expenses SET ${cols.map((c) => `${c} = ?`).join(", ")} WHERE id = ? RETURNING *`).bind(...cols.map((c) => data[c]), id).first();
  return row ? json2({ data: row }) : json2({ error: "not_found" }, 404);
}
__name(updateExpense, "updateExpense");
async function deleteExpense(env, id) {
  const r = await env.DB.prepare("DELETE FROM expenses WHERE id = ? RETURNING id").bind(id).first();
  return r ? json2({ ok: true }) : json2({ error: "not_found" }, 404);
}
__name(deleteExpense, "deleteExpense");
async function createSplitConfig(env, input) {
  if (!input || !input.stream || !input.effective_from) return json2({ error: "missing_stream_or_effective_from" }, 400);
  if (!["travel", "car"].includes(input.stream)) return json2({ error: "bad_stream" }, 400);
  const members = Array.isArray(input.members) ? input.members : [];
  if (!members.length) return json2({ error: "members_required" }, 400);
  try {
    const v = await env.DB.prepare("INSERT INTO split_config_versions (stream, effective_from, note) VALUES (?,?,?) RETURNING *").bind(input.stream, input.effective_from, input.note ?? null).first();
    for (const uid of members)
      await env.DB.prepare("INSERT INTO split_config_members (version_id, user_id) VALUES (?,?)").bind(v.id, uid).run();
    return json2({ data: { ...v, members } }, 201);
  } catch (e) {
    return json2({ error: "create_failed", detail: String(e?.message || e) }, 400);
  }
}
__name(createSplitConfig, "createSplitConfig");
async function listSplitConfig(env, url) {
  const stream = url.searchParams.get("stream");
  const sql = "SELECT * FROM split_config_versions" + (stream ? " WHERE stream = ?" : "") + " ORDER BY stream, effective_from DESC";
  const versions = (await env.DB.prepare(sql).bind(...stream ? [stream] : []).all()).results;
  for (const v of versions)
    v.members = (await env.DB.prepare(
      "SELECT m.user_id, u.name FROM split_config_members m LEFT JOIN users u ON u.id = m.user_id WHERE m.version_id = ?"
    ).bind(v.id).all()).results;
  return json2({ data: versions });
}
__name(listSplitConfig, "listSplitConfig");
async function deleteSplitConfig(env, id) {
  const r = await env.DB.prepare("DELETE FROM split_config_versions WHERE id = ? RETURNING id").bind(id).first();
  return r ? json2({ ok: true }) : json2({ error: "not_found" }, 404);
}
__name(deleteSplitConfig, "deleteSplitConfig");
async function createSettlement(env, input) {
  if (!input || input.user_id == null || !input.period_month || input.amount_snapshot == null)
    return json2({ error: "missing_user_id_period_month_or_amount" }, 400);
  try {
    const row = await env.DB.prepare(
      "INSERT INTO settlements (user_id, period_month, amount_snapshot, breakdown_json, settled_by, note) VALUES (?,?,?,?,?,?) RETURNING *"
    ).bind(
      input.user_id,
      input.period_month,
      input.amount_snapshot,
      input.breakdown_json ? JSON.stringify(input.breakdown_json) : null,
      input.settled_by ?? null,
      input.note ?? null
    ).first();
    return json2({ data: row }, 201);
  } catch (e) {
    return json2({ error: "settle_failed", detail: String(e?.message || e) }, 400);
  }
}
__name(createSettlement, "createSettlement");
async function listSettlements(env, url) {
  let sql = "SELECT * FROM settlements", w = [], b = [];
  const u = url.searchParams.get("user_id");
  if (u) {
    w.push("user_id = ?");
    b.push(u);
  }
  const m = url.searchParams.get("month");
  if (m) {
    w.push("period_month = ?");
    b.push(m);
  }
  if (w.length) sql += " WHERE " + w.join(" AND ");
  sql += " ORDER BY period_month DESC";
  return json2({ data: (await env.DB.prepare(sql).bind(...b).all()).results });
}
__name(listSettlements, "listSettlements");
async function deleteSettlement(env, id) {
  const r = await env.DB.prepare("DELETE FROM settlements WHERE id = ? RETURNING id").bind(id).first();
  return r ? json2({ ok: true }) : json2({ error: "not_found" }, 404);
}
__name(deleteSettlement, "deleteSettlement");
async function handleFinance(request, env, url, res, id) {
  const method = request.method;
  try {
    if (res === "expenses") {
      if (!id && method === "GET") return listExpenses(env, url);
      if (!id && method === "POST") return createExpense(env, await body2(request));
      if (id && (method === "PATCH" || method === "PUT")) return updateExpense(env, id, await body2(request));
      if (id && method === "DELETE") return deleteExpense(env, id);
      return json2({ error: "method_not_allowed" }, 405);
    }
    if (res === "split-config") {
      if (!id && method === "GET") return listSplitConfig(env, url);
      if (!id && method === "POST") return createSplitConfig(env, await body2(request));
      if (id && method === "DELETE") return deleteSplitConfig(env, id);
      return json2({ error: "method_not_allowed" }, 405);
    }
    if (res === "settlements") {
      if (!id && method === "GET") return listSettlements(env, url);
      if (!id && method === "POST") return createSettlement(env, await body2(request));
      if (id && method === "DELETE") return deleteSettlement(env, id);
      return json2({ error: "method_not_allowed" }, 405);
    }
    return json2({ error: "not_found" }, 404);
  } catch (err) {
    return json2({ error: "server_error", detail: String(err?.message || err) }, 500);
  }
}
__name(handleFinance, "handleFinance");

// src/files.js
var json3 = /* @__PURE__ */ __name((obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } }), "json");
var MAX_BYTES = 15 * 1024 * 1024;
var safe = /* @__PURE__ */ __name((s) => (s || "file").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80), "safe");
async function handleFiles(request, env, url, res) {
  const method = request.method;
  if (!env.DOCS) return json3({ error: "r2_not_bound" }, 500);
  if (res === "upload" && method === "POST") {
    const len = Number(request.headers.get("content-length") || 0);
    if (len > MAX_BYTES) return json3({ error: "too_large", max_bytes: MAX_BYTES }, 413);
    if (!request.body) return json3({ error: "empty_body" }, 400);
    const folder = safe(url.searchParams.get("folder") || "misc");
    const name = safe(url.searchParams.get("name") || "file");
    const key = `${folder}/${crypto.randomUUID()}-${name}`;
    const contentType = request.headers.get("content-type") || "application/octet-stream";
    await env.DOCS.put(key, request.body, { httpMetadata: { contentType } });
    return json3({ key, contentType }, 201);
  }
  if (res === "file" && method === "GET") {
    const key = url.searchParams.get("key");
    if (!key) return json3({ error: "missing_key" }, 400);
    const obj = await env.DOCS.get(key);
    if (!obj) return json3({ error: "not_found" }, 404);
    const headers = new Headers();
    headers.set("content-type", obj.httpMetadata?.contentType || "application/octet-stream");
    headers.set("cache-control", "private, max-age=60");
    return new Response(obj.body, { headers });
  }
  if (res === "file" && method === "DELETE") {
    const key = url.searchParams.get("key");
    if (!key) return json3({ error: "missing_key" }, 400);
    await env.DOCS.delete(key);
    return json3({ ok: true });
  }
  return json3({ error: "method_not_allowed" }, 405);
}
__name(handleFiles, "handleFiles");

// src/admin.js
var json4 = /* @__PURE__ */ __name((obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } }), "json");
var authed = /* @__PURE__ */ __name((req, env) => env.ADMIN_DEV_TOKEN && (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "") === env.ADMIN_DEV_TOKEN, "authed");
var body3 = /* @__PURE__ */ __name(async (req) => {
  try {
    return await req.json();
  } catch {
    return null;
  }
}, "body");
var pick3 = /* @__PURE__ */ __name((obj, cols) => {
  const out = {};
  for (const c of cols) if (obj[c] !== void 0) out[c] = obj[c];
  return out;
}, "pick");
var RESOURCES = {
  cars: {
    table: "cars",
    writable: [
      "model_id",
      "registration_no",
      "rc_doc_key",
      "insurance_doc_key",
      "insurance_expiry",
      "pollution_doc_key",
      "pollution_expiry",
      "fitness_doc_key",
      "fitness_expiry",
      "permit_doc_key",
      "permit_expiry",
      "road_tax_doc_key",
      "road_tax_expiry",
      "vltd_doc_key",
      "vltd_expiry",
      "extra_docs",
      "active"
    ],
    required: ["registration_no"],
    listSql: `SELECT c.*, m.make, m.model, m.body_type, m.image_url
              FROM cars c LEFT JOIN car_models m ON m.id = c.model_id
              ORDER BY c.active DESC, m.make, m.model`
  },
  drivers: {
    table: "drivers",
    writable: ["name", "contact", "identity_doc_key", "licence_no", "licence_doc_key", "licence_expiry", "active"],
    required: ["name"],
    listSql: `SELECT * FROM drivers ORDER BY active DESC, name`,
    // hard-delete guard: past bookings block outright (history is never rewritten);
    // upcoming ones must be reassigned first. dateExpr classifies by trip date.
    refs: [{ table: "car_bookings", col: "driver_id", label: "car booking", dateExpr: "COALESCE(end_date, start_date)" }]
  },
  users: {
    table: "users",
    writable: ["name", "email", "phone", "photo_key", "active"],
    required: ["name", "email"],
    listSql: `SELECT * FROM users ORDER BY active DESC, name`
  },
  enquiries: {
    table: "enquiries",
    // triage only — the submitted fields are immutable; just status + follow-up note.
    // An invalid status is rejected by the table's CHECK constraint (update_failed).
    writable: ["status", "note"],
    required: [],
    listSql: `SELECT * FROM enquiries ORDER BY id DESC`
  }
};
var list = /* @__PURE__ */ __name(async (env, d) => json4({ data: (await env.DB.prepare(d.listSql).all()).results }), "list");
var getOne = /* @__PURE__ */ __name(async (env, d, id) => {
  const row = await env.DB.prepare(`SELECT * FROM ${d.table} WHERE id = ?`).bind(id).first();
  return row ? json4({ data: row }) : json4({ error: "not_found" }, 404);
}, "getOne");
var create = /* @__PURE__ */ __name(async (env, d, input) => {
  const data = pick3(input, d.writable);
  for (const r of d.required) if (!data[r]) return json4({ error: `missing_${r}` }, 400);
  const cols = Object.keys(data);
  if (!cols.length) return json4({ error: "empty_body" }, 400);
  const sql = `INSERT INTO ${d.table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")}) RETURNING *`;
  try {
    return json4({ data: await env.DB.prepare(sql).bind(...cols.map((c) => data[c])).first() }, 201);
  } catch (e) {
    return json4({ error: "insert_failed", detail: String(e?.message || e) }, 400);
  }
}, "create");
var update = /* @__PURE__ */ __name(async (env, d, id, input) => {
  const data = pick3(input, d.writable);
  const cols = Object.keys(data);
  if (!cols.length) return json4({ error: "empty_body" }, 400);
  const sql = `UPDATE ${d.table} SET ${cols.map((c) => `${c} = ?`).join(", ")} WHERE id = ? RETURNING *`;
  try {
    const row = await env.DB.prepare(sql).bind(...cols.map((c) => data[c]), id).first();
    return row ? json4({ data: row }) : json4({ error: "not_found" }, 404);
  } catch (e) {
    return json4({ error: "update_failed", detail: String(e?.message || e) }, 400);
  }
}, "update");
var softDelete = /* @__PURE__ */ __name(async (env, d, id) => {
  const row = await env.DB.prepare(`UPDATE ${d.table} SET active = 0 WHERE id = ? RETURNING id`).bind(id).first();
  return row ? json4({ ok: true }) : json4({ error: "not_found" }, 404);
}, "softDelete");
var hardDelete = /* @__PURE__ */ __name(async (env, d, id) => {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  for (const r of d.refs || []) {
    if (r.dateExpr) {
      const total = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${r.table} WHERE ${r.col} = ?`).bind(id).first())?.n || 0;
      if (!total) continue;
      const upcoming = (await env.DB.prepare(
        `SELECT id, display_id, start_date, end_date FROM ${r.table} WHERE ${r.col} = ? AND ${r.dateExpr} >= ? ORDER BY ${r.dateExpr}`
      ).bind(id, today).all()).results;
      const past = total - upcoming.length;
      if (past > 0)
        return json4({ error: "historical", detail: `This driver is on ${past} past ${r.label}${past === 1 ? "" : "s"}. Historical records can't be reassigned \u2014 deactivate the driver instead.` }, 409);
      if (upcoming.length)
        return json4({ error: "reassign_required", detail: `This driver has ${upcoming.length} upcoming ${r.label}${upcoming.length === 1 ? "" : "s"}. Reassign ${upcoming.length === 1 ? "it" : "them"} to another driver before deleting.`, bookings: upcoming }, 409);
    } else {
      const n = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${r.table} WHERE ${r.col} = ?`).bind(id).first())?.n || 0;
      if (n > 0)
        return json4({ error: "in_use", detail: `Still linked to ${n} ${r.label}${n === 1 ? "" : "s"} \u2014 deactivate instead.` }, 409);
    }
  }
  try {
    const row = await env.DB.prepare(`DELETE FROM ${d.table} WHERE id = ? RETURNING id`).bind(id).first();
    return row ? json4({ ok: true }) : json4({ error: "not_found" }, 404);
  } catch (e) {
    return json4({ error: "delete_failed", detail: String(e?.message || e) }, 400);
  }
}, "hardDelete");
async function handleAdmin(request, env, url) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (!authed(request, env)) return json4({ error: "unauthorized" }, 401);
  const parts = url.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const method = request.method;
  const res = parts[1];
  const id = parts[2];
  try {
    if (res === "health" && method === "GET") {
      return json4({ ok: true, counts: await env.DB.prepare(
        "SELECT (SELECT COUNT(*) FROM car_models) AS car_models, (SELECT COUNT(*) FROM users) AS users"
      ).first() });
    }
    if (res === "makes" && method === "GET") {
      const { results } = await env.DB.prepare("SELECT DISTINCT make FROM car_models ORDER BY make").all();
      return json4({ makes: results.map((x) => x.make) });
    }
    if (res === "car-models" && method === "GET") {
      const make = url.searchParams.get("make");
      const stmt = make ? env.DB.prepare("SELECT id, make, model, body_type, fuel_types FROM car_models WHERE make = ? ORDER BY model").bind(make) : env.DB.prepare("SELECT id, make, model, body_type, fuel_types FROM car_models ORDER BY make, model");
      return json4({ models: (await stmt.all()).results });
    }
    if (res === "travel-bookings" || res === "car-bookings" || res === "payments") {
      return handleBookings(request, env, url, res, id);
    }
    if (res === "expenses" || res === "split-config" || res === "settlements") {
      return handleFinance(request, env, url, res, id);
    }
    if (res === "upload" || res === "file") {
      return handleFiles(request, env, url, res);
    }
    const d = RESOURCES[res];
    if (d) {
      if (!id && method === "GET") return list(env, d);
      if (!id && method === "POST") return create(env, d, await body3(request) || {});
      if (id && method === "GET") return getOne(env, d, id);
      if (id && (method === "PATCH" || method === "PUT")) return update(env, d, id, await body3(request) || {});
      if (id && method === "DELETE") return url.searchParams.get("hard") ? hardDelete(env, d, id) : softDelete(env, d, id);
      return json4({ error: "method_not_allowed" }, 405);
    }
    return json4({ error: "not_found", path: url.pathname }, 404);
  } catch (err) {
    return json4({ error: "server_error", detail: String(err?.message || err) }, 500);
  }
}
__name(handleAdmin, "handleAdmin");

// src/index.js
var WINDOW_SECONDS = 600;
var MAX_PER_WINDOW = 5;
var MAX_BODY_BYTES = 8192;
var FIELD_MAX = 2e3;
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
      return handleAdmin(request, env, url);
    }
    const origin = request.headers.get("Origin") || "";
    const allowed = parseOrigins(env.ALLOWED_ORIGINS);
    const cors = corsHeaders(origin, allowed);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json5({ error: "method_not_allowed" }, 405, cors);
    }
    if (allowed.length && !allowed.includes(origin)) {
      return json5({ error: "forbidden_origin" }, 403, cors);
    }
    if (env.NOTIFIER_KEY && request.headers.get("x-api-key") !== env.NOTIFIER_KEY) {
      return json5({ error: "forbidden" }, 403, cors);
    }
    if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) {
      return json5({ error: "too_large" }, 413, cors);
    }
    let body4;
    try {
      body4 = await request.json();
    } catch {
      return json5({ error: "bad_json" }, 400, cors);
    }
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (await isRateLimited(env, ip)) {
      return json5({ error: "rate_limited" }, 429, cors);
    }
    if (env.TURNSTILE_SECRET) {
      const passed = await verifyTurnstile(env.TURNSTILE_SECRET, body4.turnstileToken, ip);
      if (!passed) return json5({ error: "challenge_failed" }, 403, cors);
    }
    const data = normalise(body4);
    if (!data.name) return json5({ error: "missing_name" }, 400, cors);
    if (!data.phone && !data.email) return json5({ error: "missing_contact" }, 400, cors);
    // Persist the enquiry FIRST so it's never lost even if email delivery fails.
    // Additive to the existing flow: the response below is unchanged (ok iff a
    // delivery channel succeeded); email_sent is backfilled after the attempt.
    let enquiryId = null;
    try {
      enquiryId = await saveEnquiry(env, data, request);
    } catch (err) {
      console.error("[enquiry] DB save failed:", err?.message || err);
    }
    const channels = [{ name: "email", run: sendEmail(env, data) }];
    const results = await Promise.allSettled(channels.map((c) => c.run));
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`[${channels[i].name}] failed:`, r.reason?.message || r.reason);
      }
    });
    const delivered = results.some((r) => r.status === "fulfilled");
    const emailIdx = channels.findIndex((c) => c.name === "email");
    const emailOk = emailIdx >= 0 && results[emailIdx]?.status === "fulfilled";
    if (enquiryId != null && emailOk) {
      await env.DB.prepare("UPDATE enquiries SET email_sent = 1 WHERE id = ?").bind(enquiryId).run()
        .catch((err) => console.error("[enquiry] email_sent update failed:", err?.message || err));
    }
    return delivered ? json5({ ok: true }, 200, cors) : json5({ error: "send_failed" }, 502, cors);
  }
};
var parseOrigins = /* @__PURE__ */ __name((s) => (s || "").split(",").map((o) => o.trim()).filter(Boolean), "parseOrigins");
function corsHeaders(origin, allowed) {
  const permit = allowed.length === 0 || allowed.includes(origin);
  return {
    "Access-Control-Allow-Origin": permit && origin ? origin : allowed[0] || "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}
__name(corsHeaders, "corsHeaders");
var json5 = /* @__PURE__ */ __name((obj, status, cors) => new Response(JSON.stringify(obj), {
  status,
  headers: { "Content-Type": "application/json", ...cors }
}), "json");
var str = /* @__PURE__ */ __name((v) => typeof v === "string" ? v.trim().slice(0, FIELD_MAX) : "", "str");
function normalise(body4) {
  return {
    name: str(body4.name),
    phone: str(body4.phone),
    email: str(body4.email),
    intent: str(body4.intent),
    where: str(body4.where),
    message: str(body4.message)
  };
}
__name(normalise, "normalise");
async function saveEnquiry(env, data, request) {
  const display_id = await nextId(env, "enquiry");
  const h = request.headers;
  const cap = /* @__PURE__ */ __name((v, n) => v ? String(v).slice(0, n) : null, "cap");
  const row = await insertRow(env, "enquiries", {
    name: data.name,
    phone: data.phone || null,
    email: data.email || null,
    intent: data.intent || null,
    destination: data.where || null,
    message: data.message || null,
    source_url: cap(h.get("Referer"), 500),
    country: (request.cf && request.cf.country) || null,
    ip: h.get("CF-Connecting-IP") || null,
    user_agent: cap(h.get("User-Agent"), 500)
  }, { display_id });
  return row ? row.id : null;
}
__name(saveEnquiry, "saveEnquiry");
async function isRateLimited(env, ip) {
  if (!env.RATE_LIMIT) return false;
  const key = `rl:${ip}`;
  const now = Date.now();
  let rec = null;
  try {
    rec = await env.RATE_LIMIT.get(key, "json");
  } catch (err) {
    console.error("KV read failed:", err?.message);
    return false;
  }
  const write = /* @__PURE__ */ __name((value, ttl) => env.RATE_LIMIT.put(key, JSON.stringify(value), {
    expirationTtl: Math.max(60, ttl)
    // KV enforces a 60s minimum
  }).catch((err) => console.error("KV write failed:", err?.message)), "write");
  if (!rec || typeof rec.reset !== "number" || now > rec.reset) {
    await write({ n: 1, reset: now + WINDOW_SECONDS * 1e3 }, WINDOW_SECONDS);
    return false;
  }
  if (rec.n >= MAX_PER_WINDOW) return true;
  await write({ n: rec.n + 1, reset: rec.reset }, Math.ceil((rec.reset - now) / 1e3));
  return false;
}
__name(isRateLimited, "isRateLimited");
async function verifyTurnstile(secret, token, ip) {
  if (!token) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip && ip !== "unknown") form.append("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form
    });
    const out = await res.json();
    if (!out.success) console.warn("Turnstile rejected:", out["error-codes"]);
    return out.success === true;
  } catch (err) {
    console.error("Turnstile unreachable:", err?.message);
    return false;
  }
}
__name(verifyTurnstile, "verifyTurnstile");
var escapeHtml = /* @__PURE__ */ __name((s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"), "escapeHtml");
function subjectFor(d) {
  const tail = d.where ? ` \xB7 ${d.where}` : "";
  return `Enquiry \u2013 ${d.name}${tail}`;
}
__name(subjectFor, "subjectFor");
function textBody(d) {
  const rows = [
    ["Name", d.name],
    ["Phone", d.phone],
    ["Email", d.email],
    ["Planning", d.intent],
    ["Where", d.where]
  ].filter(([, v]) => v);
  let out = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  if (d.message) out += `

Message:
${d.message}`;
  return out;
}
__name(textBody, "textBody");
function htmlBody(d) {
  const row = /* @__PURE__ */ __name((label, value) => value ? `<tr>
           <td style="padding:7px 16px 7px 0;color:#8a7b6d;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td>
           <td style="padding:7px 0;color:#29211c;font-size:15px">${escapeHtml(value)}</td>
         </tr>` : "", "row");
  const message = d.message ? `<div style="margin-top:22px;padding-top:18px;border-top:1px solid #e2d8c8">
         <div style="color:#8a7b6d;font-size:13px;margin-bottom:6px">Message</div>
         <div style="color:#29211c;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(d.message)}</div>
       </div>` : "";
  const replyLine = d.email ? `<p style="margin:22px 0 0;color:#8a7b6d;font-size:13px">Reply to this email to answer ${escapeHtml(d.name)} directly.</p>` : "";
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f1ebe0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#f6f1e7;border:1px solid #e2d8c8;border-radius:6px;padding:26px">
      <div style="color:#a9674c;font-size:11px;letter-spacing:.16em;text-transform:uppercase;margin-bottom:14px">New enquiry</div>
      <table style="border-collapse:collapse;width:100%">${row("Name", d.name) + row("Phone", d.phone) + row("Email", d.email) + row("Planning", d.intent) + row("Where", d.where)}</table>
      ${message}
      ${replyLine}
    </div>
  </body></html>`;
}
__name(htmlBody, "htmlBody");
async function sendEmail(env, d) {
  if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
  const payload = {
    from: env.MAIL_FROM,
    to: [env.MAIL_TO],
    subject: subjectFor(d),
    text: textBody(d),
    html: htmlBody(d)
  };
  if (d.email) payload.reply_to = d.email;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text().catch(() => "")}`);
  }
  return res.json().catch(() => null);
}
__name(sendEmail, "sendEmail");
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
