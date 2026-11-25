/**
 * Bellymall — local mock of the Supabase API used by the app.
 *
 * It speaks just enough of GoTrue (auth), PostgREST (tables) and Storage for
 * the storefront and the admin dashboard to run against fixture data, so the
 * admin back office can be exercised end to end without a single request
 * reaching the real project.
 *
 *   node mocks/supabase-mock.mjs            # http://127.0.0.1:54399
 *
 * Then start the app against it:
 *
 *   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54399 \
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=mock-anon-key bun run dev
 *
 * Sign in on /admin with the demo admin (any password of 8+ characters):
 *   owner@bellymall.ng / bellymall
 *
 * Inspect or reset the in-memory data:
 *   GET  /__admin/state
 *   POST /__admin/reset
 */

import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.MOCK_SUPABASE_PORT || 54399);
const ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const ADMIN_EMAIL = "owner@bellymall.ng";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,HEAD,OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization,apikey,content-type,accept,prefer,x-client-info,range,x-upsert,x-supabase-api-version",
  "Access-Control-Expose-Headers": "content-range,content-profile,preference-applied",
  "Access-Control-Max-Age": "86400",
};

const minutesAgo = (m) => new Date(Date.now() - m * 60_000).toISOString();

/* ---------------------------------------------------------------
   FIXTURES
   --------------------------------------------------------------- */

const seed = () => ({
  site_content: [
    {
      key: "hero_slides",
      value: [
        {
          image: "/images/rice-feast-pans.jpg",
          alt: "A generous spread of freshly cooked dishes on a table",
          kickerIcon: "fa-store",
          kicker: "Bellymall food hall",
          titlePre: "Hungry? Enter the ",
          titleEm: "mall",
          titlePost: ".",
          sub: "From street cravings to chef specials — everything you love under one roof, delivered hot in minutes.",
          ctaPrimary: "Start an order",
          ctaPrimaryHref: "#picks",
          ctaGhost: "Explore the mall",
          ctaGhostHref: "#directory",
          trust: [
            { icon: "fa-star", text: "4.9 rated by foodies" },
            { icon: "fa-stopwatch", text: "25 min average delivery" },
            { icon: "fa-store", text: "120+ partner stalls" },
          ],
        },
        {
          image: "/images/egusi-soup.jpg",
          alt: "A rich bowl of egusi soup served with swallow",
          kickerIcon: "fa-utensil-spoon",
          kicker: "Today at the Swallow Hall",
          titlePre: "Egusi that ",
          titleEm: "hugs",
          titlePost: " back.",
          sub: "Smooth, rich and unapologetically generous — served steaming with the swallow of your choice.",
          ctaPrimary: "Order comfort food",
          ctaPrimaryHref: "/stall/swallow-hall",
          ctaGhost: "Visit the Swallow Hall",
          ctaGhostHref: "/stall/swallow-hall",
          trust: [
            { icon: "fa-leaf", text: "Cooked fresh to order" },
            { icon: "fa-pepper-hot", text: "Mild, hot or dare" },
          ],
        },
      ],
      updated_at: minutesAgo(60),
    },
    {
      key: "gallery_slides",
      value: [
        {
          image: "/images/african-family-spread.jpg",
          alt: "A spread of fufu, beans and fish stew at Hall One",
          caption: "The spread at Hall One",
          where: "Build-a-belly box",
        },
        {
          image: "/images/meat-skewers.jpg",
          alt: "Suya skewers fresh off the coals",
          caption: "Straight off the coals",
          where: "Protein factory",
        },
        {
          image: "/images/soup-leaf-bowl.jpg",
          alt: "A rich bowl of egusi with swallow",
          caption: "The comfort classic",
          where: "Swallow hall",
        },
      ],
      updated_at: minutesAgo(60),
    },
    {
      key: "store_settings",
      value: {
        storeName: "Bellymall",
        tagline: "Everything you love, all in one mall",
        ticker:
          "Free delivery on orders over ₦10,000  •  New: Suya Fridays at the Protein Factory  •  Use code BELLY10 for 10% off your first feast  •  120+ stalls under one roof",
        deliveryFee: 900,
        freeDeliveryOver: 10000,
        address: "12 Food Hall Way, Lagos",
        supportPhone: "+234 800 BELLY-01",
        supportEmail: "hello@bellymall.ng",
        hours: "Open daily · 9am – 11pm",
        instagram: "https://instagram.com/bellymall",
        twitter: "https://x.com/bellymall",
        tiktok: "https://tiktok.com/@bellymall",
        facebook: "https://facebook.com/bellymall",
      },
      updated_at: minutesAgo(60),
    },
  ],

  categories: [
    { id: "build-a-belly", name: "Build-a-belly box", short_name: "Build-a-belly", slogan: "Craft your feast", blurb: "Pick a base, a protein and two sides — then let the mall assemble your perfect box.", image: "/images/rice-feast-pans.jpg", image_alt: "A generous spread of dishes ready to be boxed up", icon: "fa-box-open", featured: true, sort_order: 0 },
    { id: "swallow-hall", name: "The swallow hall", short_name: "Swallow hall", slogan: "Smooth & satisfying", blurb: "Slow-simmered soups and the swallow of your choice — eba, fufu, semo or pounded yam.", image: "/images/green-soup-sides.jpg", image_alt: "A rich pot of soup served with swallow", icon: "fa-utensil-spoon", featured: false, sort_order: 1 },
    { id: "grain-district", name: "Grain district & moi-moi corner", short_name: "Grain district", slogan: "Wholesome & steamed", blurb: "Jollof, fried rice, ofada and steamed moi-moi — the grain heart of the mall.", image: "/images/jollof-plantain.jpg", image_alt: "A bowl of seasoned rice with sides", icon: "fa-seedling", featured: false, sort_order: 2 },
    { id: "protein-factory", name: "Protein factory", short_name: "Protein factory", slogan: "Power up", blurb: "Charcoal grills working round the clock — suya, chicken, fish and steak.", image: "/images/meat-skewers.jpg", image_alt: "Spiced skewers grilling over charcoal", icon: "fa-drumstick-bite", featured: false, sort_order: 3 },
    { id: "snack-street", name: "Snack street", short_name: "Snack street", slogan: "Quick & crunchy", blurb: "Fried to order and gone in minutes — puff-puff, chin chin, samosa and bakery treats.", image: "/images/puff-puff.jpg", image_alt: "Golden fried dough puffs dusted with sugar", icon: "fa-cookie-bite", featured: false, sort_order: 4 },
    { id: "porridge-yard", name: "Porridge & tubers yard", short_name: "Porridge yard", slogan: "Hearty & rustic", blurb: "One-pot wonders from the yard — yam, plantain and beans slow-cooked with palm oil.", image: "/images/yam-and-plantain-spread.jpg", image_alt: "Boiled yam, plantain and fish stew laid out on a table", icon: "fa-carrot", featured: false, sort_order: 5 },
    { id: "extras-sides", name: "The extras & sides", short_name: "Extras & sides", slogan: "Perfect companions", blurb: "The little things that finish a plate — coleslaw, dodo, wings and chilled drinks.", image: "/images/chicken-salad.jpg", image_alt: "A colourful bowl of fresh salad sides", icon: "fa-bowl-food", featured: false, sort_order: 6 },
  ],

  menu_items: [
    { id: "bb-jollof", category_id: "build-a-belly", name: "Classic jollof box", desc: "Smoky party jollof, grilled chicken thigh, dodo and coleslaw.", price: 4200, image: "/images/grilled-chicken-jollof.jpg", alt: "A plate of smoky jollof rice with chicken", tag: "Bestseller", rating: "4.9", icon: "fa-bowl-rice", available: true, sort_order: 0 },
    { id: "bb-suya", category_id: "build-a-belly", name: "Suya skewer box", desc: "Charcoal suya skewers, spiced fries and yaji dip.", price: 4600, image: "/images/suya-skewer-box.jpg", alt: "A box of charcoal-grilled suya skewers with fries and dip", tag: "Spicy", rating: "4.8", icon: "fa-pepper-hot", available: true, sort_order: 1 },
    { id: "bb-family", category_id: "build-a-belly", name: "Family feast box", desc: "Feeds four — rice, swallow, proteins, sides and drinks.", price: 15500, image: "/images/african-family-spread.jpg", alt: "A spread of fufu, beans and fish stew for four", tag: "Sharing", rating: "5.0", icon: "fa-people-group", available: true, sort_order: 2 },
    { id: "sw-egusi", category_id: "swallow-hall", name: "Egusi & eba", desc: "Melon-seed soup with goat meat and smoked fish.", price: 3900, image: "/images/egusi-soup.jpg", alt: "A rich bowl of egusi soup with eba", tag: "Comfort", rating: "4.9", icon: "fa-bowl-food", available: true, sort_order: 0 },
    { id: "sw-ogbono", category_id: "swallow-hall", name: "Ogbono & fufu", desc: "Draw soup with beef, kpomo and stockfish.", price: 3700, image: "/images/ogbono-draw-soup.jpg", alt: "A dark, glossy ogbono draw soup with stockfish and fufu", tag: null, rating: "4.8", icon: "fa-utensil-spoon", available: false, sort_order: 1 },
    { id: "gr-jollof", category_id: "grain-district", name: "Smoky party jollof", desc: "Firewood-flavoured jollof with fried plantain.", price: 3500, image: "/images/jollof-plantain.jpg", alt: "A plate of smoky party jollof rice", tag: "Bestseller", rating: "4.9", icon: "fa-bowl-rice", available: true, sort_order: 0 },
    { id: "pf-suya", category_id: "protein-factory", name: "Beef suya skewers", desc: "Yaji-dusted beef off the coals, onions and extra pepper.", price: 4200, image: "/images/suya-board.jpg", alt: "Yaji-spiced beef suya skewers charred on a charcoal grill", tag: "Spicy", rating: "4.9", icon: "fa-pepper-hot", available: true, sort_order: 0 },
    { id: "pf-salmon", category_id: "protein-factory", name: "Charred salmon fillet", desc: "Atlantic salmon with honey glaze and greens.", price: 6500, image: "/images/salmon.jpg", alt: "A charred salmon fillet with herbs", tag: "Chef's pick", rating: "4.9", icon: "fa-fish-fins", available: true, sort_order: 1 },
    { id: "sn-puff", category_id: "snack-street", name: "Golden puff-puff box", desc: "Ten warm puffs, sugar-dusted and airy.", price: 2000, image: "/images/puff-puff.jpg", alt: "Golden sugar-dusted puff-puff piled in a bowl", tag: "Sweet", rating: "4.7", icon: "fa-cookie-bite", available: true, sort_order: 0 },
    { id: "ex-coleslaw", category_id: "extras-sides", name: "Coleslaw cup", desc: "Crunchy cabbage and carrot in creamy dressing.", price: 900, image: "/images/coleslaw.jpg", alt: "A fresh crunchy coleslaw cup", tag: null, rating: "4.6", icon: "fa-leaf", available: true, sort_order: 0 },
  ],

  sellers: [
    { id: "a1000000-0000-4000-8000-000000000001", name: "Mama Tunde", stall: "swallow-hall", role: "Head chef", phone: "0803 111 2222", email: "tunde@bellymall.ng", rating: 4.9, status: "active", image: "", sort_order: 0, created_at: minutesAgo(9000) },
    { id: "a1000000-0000-4000-8000-000000000002", name: "Chef Emeka", stall: "protein-factory", role: "Grill master", phone: "0803 222 3333", email: "emeka@bellymall.ng", rating: 4.8, status: "active", image: "", sort_order: 1, created_at: minutesAgo(8000) },
    { id: "a1000000-0000-4000-8000-000000000003", name: "Ngozi Okafor", stall: "grain-district", role: "Rice specialist", phone: "0803 333 4444", email: "ngozi@bellymall.ng", rating: 4.7, status: "active", image: "", sort_order: 2, created_at: minutesAgo(7000) },
    { id: "a1000000-0000-4000-8000-000000000004", name: "Bisi Adeyemi", stall: "snack-street", role: "Baker", phone: "0803 444 5555", email: "bisi@bellymall.ng", rating: 4.8, status: "paused", image: "", sort_order: 3, created_at: minutesAgo(6000) },
  ],

  orders: [
    { id: "BM-DEMO1", email: "ada@example.com", items: [{ name: "Egusi & eba", qty: 2, price: 3900 }], subtotal: 7800, delivery: 900, total: 8700, address: "12 Awolowo Road, Ikoyi, Lagos", phone: "0803 123 4567", payment: "transfer", status: "placed", eta: minutesAgo(-20), created_at: minutesAgo(5) },
    { id: "BM-DEMO2", email: "tunde@example.com", items: [{ name: "Beef suya skewers", qty: 1, price: 4200 }, { name: "Coleslaw cup", qty: 2, price: 900 }], subtotal: 6000, delivery: 900, total: 6900, address: "4 Admiralty Way, Lekki, Lagos", phone: "0807 222 3333", payment: "card", status: "preparing", eta: minutesAgo(-15), created_at: minutesAgo(18) },
    { id: "BM-DEMO3", email: null, items: [{ name: "Family feast box", qty: 1, price: 15500 }], subtotal: 15500, delivery: 0, total: 15500, address: "9 Bode Thomas, Surulere, Lagos", phone: "0810 555 1212", payment: "delivery", status: "on_the_way", eta: minutesAgo(-5), created_at: minutesAgo(40) },
    { id: "BM-DEMO4", email: "bisi@example.com", items: [{ name: "Golden puff-puff box", qty: 3, price: 2000 }], subtotal: 6000, delivery: 900, total: 6900, address: "22 Herbert Macaulay Way, Yaba, Lagos", phone: "0902 888 4545", payment: "card", status: "delivered", eta: minutesAgo(300), created_at: minutesAgo(290) },
    { id: "BM-DEMO5", email: "ngozi@example.com", items: [{ name: "Charred salmon fillet", qty: 1, price: 6500 }], subtotal: 6500, delivery: 900, total: 7400, address: "1 Ozumba Mbadiwe, Victoria Island, Lagos", phone: "0706 333 9090", payment: "transfer", status: "cancelled", eta: minutesAgo(600), created_at: minutesAgo(640) },
  ],

  activity: [
    { id: 101, session_id: "s-ada", email: "ada@example.com", kind: "order_placed", label: "BM-DEMO1", meta: { total: 8700 }, path: "/about", created_at: minutesAgo(5) },
    { id: 100, session_id: "s-ada", email: "ada@example.com", kind: "checkout_open", label: null, meta: null, path: "/stall/swallow-hall", created_at: minutesAgo(7) },
    { id: 99, session_id: "s-ada", email: null, kind: "add_to_cart", label: "Egusi & eba", meta: { price: 3900 }, path: "/stall/swallow-hall", created_at: minutesAgo(9) },
    { id: 98, session_id: "s-guest-1", email: null, kind: "search", label: "jollof", meta: { picked: "Smoky party jollof" }, path: "/", created_at: minutesAgo(12) },
    { id: 97, session_id: "s-tunde", email: "tunde@example.com", kind: "sign_in", label: "tunde@example.com", meta: null, path: "/signin", created_at: minutesAgo(21) },
    { id: 96, session_id: "s-tunde", email: "tunde@example.com", kind: "page_view", label: "home_hero", meta: null, path: "/", created_at: minutesAgo(22) },
    { id: 95, session_id: "s-guest-2", email: null, kind: "category_view", label: "protein-factory", meta: null, path: "/stall/protein-factory", created_at: minutesAgo(31) },
    { id: 94, session_id: "s-guest-2", email: null, kind: "page_view", label: "home_hero", meta: null, path: "/", created_at: minutesAgo(33) },
    { id: 93, session_id: "s-guest-3", email: null, kind: "remove_from_cart", label: "Coleslaw cup", meta: null, path: "/", created_at: minutesAgo(48) },
    { id: 92, session_id: "s-guest-3", email: null, kind: "sign_up", label: "new@example.com", meta: null, path: "/signin", created_at: minutesAgo(52) },
  ],

  admins: [{ user_id: ADMIN_ID, email: ADMIN_EMAIL }],
});

let TABLES = seed();

/* ---------------------------------------------------------------
   JWT + session helpers
   --------------------------------------------------------------- */

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");

function makeJwt(userId, email) {
  const iat = Math.floor(Date.now() / 1000);
  const payload = {
    iss: `http://127.0.0.1:${PORT}/auth/v1`,
    sub: userId,
    aud: "authenticated",
    role: "authenticated",
    email,
    iat,
    exp: iat + 3600,
    session_id: randomUUID(),
  };
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64(payload)}.mock-signature`;
}

function sessionFor(email = ADMIN_EMAIL, userId = ADMIN_ID) {
  const now = Math.floor(Date.now() / 1000);
  return {
    access_token: makeJwt(userId, email),
    token_type: "bearer",
    expires_in: 3600,
    expires_at: now + 3600,
    refresh_token: "mock-refresh-token",
    user: {
      id: userId,
      aud: "authenticated",
      role: "authenticated",
      email,
      email_confirmed_at: minutesAgo(10000),
      phone: "",
      confirmed_at: minutesAgo(10000),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: { name: email.split("@")[0] },
      identities: [],
      created_at: minutesAgo(10000),
      updated_at: new Date().toISOString(),
    },
  };
}

/* ---------------------------------------------------------------
   PostgREST-ish filtering
   --------------------------------------------------------------- */

const RESERVED = new Set(["select", "order", "limit", "offset", "apikey", "columns"]);

function parseValue(raw) {
  const v = raw.trim();
  if (v === "null") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v.replace(/^"|"$/g, "");
}

function matches(row, key, expr) {
  const [op, ...rest] = expr.split(".");
  const arg = rest.join(".");
  const value = row[key];
  switch (op) {
    case "eq":
      return String(value) === String(parseValue(arg));
    case "neq":
      return String(value) !== String(parseValue(arg));
    case "in": {
      const list = arg.replace(/^\(|\)$/g, "").split(",").map(parseValue);
      return list.some((v) => String(v) === String(value));
    }
    case "is":
      return value === null || value === undefined;
    case "not": {
      const [, innerOp, ...innerRest] = [op, ...rest];
      if (innerOp === "is" && innerRest.join(".") === "null") return value !== null && value !== undefined;
      return true;
    }
    case "gt":
      return value > parseValue(arg);
    case "gte":
      return value >= parseValue(arg);
    case "lt":
      return value < parseValue(arg);
    case "lte":
      return value <= parseValue(arg);
    case "like":
    case "ilike": {
      const pattern = String(arg).replace(/%/g, ".*");
      const re = new RegExp(`^${pattern}$`, op === "ilike" ? "i" : "");
      return re.test(String(value ?? ""));
    }
    default:
      return true;
  }
}

function queryRows(table, params) {
  let rows = [...(TABLES[table] || [])];

  for (const [key, expr] of params) {
    if (RESERVED.has(key)) continue;
    rows = rows.filter((row) => matches(row, key, expr));
  }

  const order = params.get("order");
  if (order) {
    const clauses = order.split(",").map((c) => c.trim()).filter(Boolean);
    rows.sort((a, b) => {
      for (const clause of clauses) {
        const [col, dir = "asc"] = clause.split(".");
        const av = a[col];
        const bv = b[col];
        if (av === bv) continue;
        const cmp = av === null || av === undefined ? -1 : bv === null || bv === undefined ? 1 : av > bv ? 1 : -1;
        return dir === "desc" ? -cmp : cmp;
      }
      return 0;
    });
  }

  const offset = Number(params.get("offset") || 0);
  const limit = params.get("limit");
  if (offset) rows = rows.slice(offset);
  if (limit) rows = rows.slice(0, Number(limit));

  const select = params.get("select");
  if (select && select !== "*" && !select.includes("(")) {
    const cols = select.split(",").map((c) => c.trim()).filter(Boolean);
    rows = rows.map((row) => Object.fromEntries(cols.map((c) => [c, row[c]])));
  }

  return rows;
}

/* ---------------------------------------------------------------
   HTTP plumbing
   --------------------------------------------------------------- */

const corsHeaders = (req) => ({
  ...CORS,
  "Access-Control-Allow-Headers":
    req.headers["access-control-request-headers"] || CORS["Access-Control-Allow-Headers"],
});

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return null;
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function sortOrder(table) {
  const rows = TABLES[table] || [];
  return rows.reduce((max, row) => Math.max(max, Number(row.sort_order ?? 0)), -1) + 1;
}

async function handleRest(req, res, url, table) {
  const params = url.searchParams;
  const prefer = String(req.headers.prefer || "");
  const wantsObject = String(req.headers.accept || "").includes("vnd.pgrst.object+json");
  const wantsRows = prefer.includes("return=representation");

  const reply = (rows, status = 200) => {
    if (wantsObject) {
      if (rows.length === 1) return send(res, 200, rows[0]);
      if (rows.length === 0) return send(res, 200, null);
      return send(res, 406, { code: "PGRST116", message: "JSON object requested, multiple rows returned" });
    }
    return send(res, status, rows);
  };

  if (req.method === "GET" || req.method === "HEAD") {
    const rows = queryRows(table, params);
    if (req.method === "HEAD") {
      res.writeHead(200, {
        ...corsHeaders(req),
        "Content-Range": `0-${Math.max(rows.length - 1, 0)}/${rows.length}`,
      });
      return res.end();
    }
    return reply(rows);
  }

  if (req.method === "POST") {
    const payload = req.body ?? (await readBody(req));
    const list = Array.isArray(payload) ? payload : [payload];
    const rows = TABLES[table] || (TABLES[table] = []);
    const inserted = [];

    const pk = table === "admins" ? "user_id" : table === "site_content" ? "key" : "id";
    for (const raw of list) {
      const row = { ...raw };
      if (table === "activity") row.id = nextActivityId();
      else if (row[pk] === undefined || row[pk] === null || row[pk] === "") {
        row[pk] = table === "sellers" ? randomUUID() : uniqueId(table);
      }
      if (!row.created_at && (table === "orders" || table === "sellers")) row.created_at = new Date().toISOString();

      const existingIndex = rows.findIndex((r) => String(r[pk]) === String(row[pk]));
      const isUpsert = prefer.includes("resolution=merge-duplicates");
      if (existingIndex >= 0 && isUpsert) {
        rows[existingIndex] = { ...rows[existingIndex], ...row };
        inserted.push(rows[existingIndex]);
      } else if (existingIndex >= 0) {
        return send(res, 409, { code: "23505", message: `duplicate key value violates unique constraint "${table}_pkey"` });
      } else {
        rows.push(row);
        inserted.push(row);
      }
    }

    return wantsRows || wantsObject ? reply(inserted, 201) : send(res, 201, null);
  }

  if (req.method === "PATCH") {
    const payload = req.body ?? (await readBody(req));
    const rows = TABLES[table] || [];
    const targets = queryRows(table, params);
    for (const row of targets) Object.assign(row, payload);

    if (table === "site_content" && payload.key) {
      // keep the PK in sync on upserts that only patch the value
      for (const row of targets) row.key = payload.key;
    }
    return wantsRows || wantsObject ? reply(targets) : send(res, 204, undefined);
  }

  if (req.method === "DELETE") {
    const rows = TABLES[table] || [];
    const targets = new Set(queryRows(table, params));
    TABLES[table] = rows.filter((row) => !targets.has(row));
    return send(res, 204, undefined);
  }

  return send(res, 405, { message: `Method ${req.method} not allowed on ${table}` });
}

function uniqueId(table) {
  if (table === "activity") return nextActivityId();
  if (table === "site_content") return `content-${Date.now()}`;
  return `${table}-${Math.random().toString(36).slice(2, 8)}`;
}

function nextActivityId() {
  const ids = (TABLES.activity || []).map((a) => Number(a.id) || 0);
  return Math.max(0, ...ids) + 1;
}

/* ---------------------------------------------------------------
   SERVER
   --------------------------------------------------------------- */

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const path = url.pathname;

  for (const [k, v] of Object.entries(corsHeaders(req))) res.setHeader(k, v);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // ---- test helpers -------------------------------------------------
  if (path === "/__admin/state") {
    return send(res, 200, TABLES);
  }
  if (path === "/__admin/reset") {
    TABLES = seed();
    return send(res, 200, { ok: true });
  }

  // ---- GoTrue (auth) ------------------------------------------------
  if (path === "/auth/v1/token") {
    await readBody(req);
    return send(res, 200, sessionFor());
  }
  if (path === "/auth/v1/user" && req.method === "GET") {
    return send(res, 200, sessionFor().user);
  }
  if (path.startsWith("/auth/v1/logout")) {
    return send(res, 204, undefined);
  }
  if (path === "/auth/v1/settings") {
    return send(res, 200, { external: { email: true }, disable_signup: false, mailer_autoconfirm: true });
  }
  if (path.startsWith("/auth/v1/")) {
    return send(res, 200, {});
  }

  // ---- PostgREST ----------------------------------------------------
  if (path.startsWith("/rest/v1/")) {
    const table = path.slice("/rest/v1/".length).split("/")[0];
    if (!table) return send(res, 200, { message: "Bellymall mock API" });
    if (!TABLES[table]) return send(res, 404, { code: "PGRST205", message: `Could not find the table 'public.${table}'` });
    req.body = await readBody(req);
    return handleRest(req, res, url, table);
  }

  // ---- Storage ------------------------------------------------------
  if (path.startsWith("/storage/v1/object/")) {
    await readBody(req);
    const key = path.replace(/^\/storage\/v1\/object\/(public\/)?/, "");
    return send(res, 200, { Key: key });
  }
  if (path.startsWith("/storage/v1/")) {
    return send(res, 200, {});
  }

  send(res, 404, { message: `No mock route for ${req.method} ${path}` });
});

server.on("upgrade", (req, socket) => {
  // Realtime websockets are not emulated: refuse the upgrade so supabase-js
  // simply falls back to polling on its next reconnect.
  socket.write("HTTP/1.1 501 Not Implemented\r\nConnection: close\r\n\r\n");
  socket.destroy();
});

server.listen(PORT, "127.0.0.1", () => {
  const counts = Object.entries(TABLES).map(([t, rows]) => `${t}=${rows.length}`).join(" ");
  console.log(`Bellymall mock Supabase on http://127.0.0.1:${PORT}`);
  console.log(`admin login: ${ADMIN_EMAIL} / any password (8+ chars)`);
  console.log(`fixtures: ${counts}`);
});
