// Cinnavia — nube compartida v7.
// Cuentas propias (cualquiera crea su usuario con contraseña), árbol de VIDA, Bosques colaborativos y rankings.
// Las contraseñas se verifican aquí en el servidor: nadie lee ni escribe lo de otra persona sin su contraseña.
import { getStore } from "@netlify/blobs";
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual, createHash } from "node:crypto";
import webpush from "web-push";

const W = "w/";
const GTYPES = ["task", "team", "join", "part", "post", "idea", "like", "done", "focus", "tpl", "board", "event", "poll", "vote", "pin", "pomo", "aviso", "asist", "eval", "book"];
const GUARD_TYPES = ["aviso", "asist", "eval"];
// administración: estas cuentas pueden entrar a cualquier otra (para dar soporte y recuperar datos)
const ADMINS = ["mitchell"];
const weekOf = (ms) => { const d = new Date(dayOf(ms) + "T12:00:00Z"); const dn = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - dn + 3); const y = d.getUTCFullYear(); const w1 = new Date(Date.UTC(y, 0, 4)); return `${y}-W${String(1 + Math.round(((d - w1) / 86400000 - 3 + ((w1.getUTCDay() + 6) % 7)) / 7)).padStart(2, "0")}`; };
const dayOf = (ms) => new Date(ms - 5 * 3600000).toISOString().slice(0, 10); // día en hora de México/Cancún
const LETTER_USERS = ["mitchell", "mel"];
const MAX = 3 * 1024 * 1024;
const USER_RE = /^[a-z0-9]{3,20}$/;
const FID_RE = /^[a-z0-9]{6,16}$/;
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const clip = (v, n) => String(v ?? "").slice(0, n);
const COLORS = ["#2F8A5B", "#3E9A93", "#5B7FD1", "#B07AC8", "#D27C5E", "#C9A55C", "#4F9A63", "#7A8CA8"];

/* Niveles: el árbol de una persona llega al 100; el de un Bosque, al 1000. (Misma fórmula que en la app.) */
const T = (n) => Math.round(10 * n + 0.5 * Math.pow(n, 1.75));
const TG = (n) => Math.round(25 * n + 0.2 * Math.pow(n, 1.6));
const levelFor = (pts, f, max) => { let n = 0; while (n < max && f(n + 1) <= pts) n++; return n; };

async function getSecret(store) {
  let s = await store.get(`${W}secret`);
  if (!s) {
    await store.set(`${W}secret`, randomBytes(32).toString("hex"), { onlyIfNew: true });
    s = await store.get(`${W}secret`);
  }
  return s;
}
const tokenFor = (secret, user, v) => createHmac("sha256", secret).update(`${user}:${v}`).digest("hex");
const hashPw = (pw, salt) => pbkdf2Sync(String(pw), salt, 120000, 32, "sha256").toString("hex");
const safeEq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };

async function vapid(store) {
  let k = await store.get("vapid", { type: "json" });
  if (!k) {
    await store.setJSON("vapid", webpush.generateVAPIDKeys(), { onlyIfNew: true });
    k = await store.get("vapid", { type: "json" });
  }
  return k;
}

async function pushTo(store, users, origin, payload, exceptDevice) {
  try {
    const keys = await vapid(store);
    webpush.setVapidDetails(origin || "https://tareasmitchell.netlify.app", keys.publicKey, keys.privateKey);
    for (const u of users) {
      const { blobs } = await store.list({ prefix: `${W}push/${u}/` });
      await Promise.all(blobs.map(async (b) => {
        const sub = await store.get(b.key, { type: "json" });
        if (!sub || sub.device === exceptDevice) return;
        try { await webpush.sendNotification(sub.subscription, JSON.stringify(payload), { TTL: 86400 }); }
        catch (e) { if (e.statusCode === 404 || e.statusCode === 410) await store.delete(b.key); }
      }));
    }
  } catch (e) { console.error("push error", e); }
}

/* Tiempo real: cada cambio "empuja" un número de revisión a las personas afectadas; los dispositivos lo vigilan (long-poll). */
const revKey = (u) => `${W}rev/${u}`;
function shpClean(d) {
  if (!d || typeof d !== "object") return null;
  const kinds = ["info", "lista", "enlace", "nota", "pegatina"];
  const kind = kinds.includes(d.kind) ? d.kind : "nota";
  const title = String(d.title || "").slice(0, 120);
  const text = String(d.text || "").slice(0, 6000);
  const link = /^https?:\/\//i.test(String(d.link || "")) ? String(d.link).slice(0, 500) : "";
  const items = Array.isArray(d.items) ? d.items.slice(0, 120).map((i) => ({ t: String(i?.t || "").slice(0, 200), done: !!i?.done })).filter((i) => i.t) : [];
  const tones = ["papel", "salvia", "cielo", "rosa", "miel", "lavanda"];
  return { kind, title, text, link, items, tone: tones.includes(d.tone) ? d.tone : "papel", sticker: String(d.sticker || "").slice(0, 20) };
}
const newRev = () => `${Date.now().toString(36)}${randomBytes(2).toString("hex")}`;
async function bump(store, users) {
  const r = newRev();
  await Promise.all([...new Set(users)].filter((u) => u && (USER_RE.test(String(u)) || u === "_lobby" || u === "_lib")).map((u) => store.set(revKey(u), r)));
}

// trazos de pintura (hojas y tinta del pizarrón): solo números enteros y colores válidos, con tope de tamaño
function cleanStrokes(arr) {
  if (!Array.isArray(arr)) return [];
  const out = []; let total = 0;
  for (const s of arr.slice(-600)) {
    if (!s || !Array.isArray(s.p) || s.p.length < 2) continue;
    const p = []; for (const n of s.p.slice(0, 3000)) { const v = Math.round(+n); if (!Number.isFinite(v)) { p.length = 0; break; } p.push(Math.max(-100000, Math.min(100000, v))); }
    if (p.length < 2 || p.length % 2) continue; total += p.length; if (total > 60000) break;
    out.push({ id: String(s.id || "").replace(/[^a-z0-9-]/gi, "").slice(0, 20), c: /^#[0-9a-f]{6}$/i.test(s.c || "") ? s.c : "a", w: Math.max(1, Math.min(60, +s.w || 4)), a: Math.max(0.05, Math.min(1, +s.a || 1)), k: s.k === "m" ? "m" : "p", u: +s.u || 0, p });
  }
  return out;
}
export default async (req, context) => {
  const url = new URL(req.url);
  const store = getStore({ name: "aldia", consistency: "strong" });
  const kindQ = url.searchParams.get("kind");

  if (kindQ === "vapid") return json({ publicKey: (await vapid(store)).publicKey });

  try {
    const secret = await getSecret(store);
    let tokens = {};
    try { tokens = JSON.parse(req.headers.get("x-aldia-tokens") || "{}"); } catch { tokens = {}; }
    const metaCache = {};
    const meta = async (u) => (u in metaCache ? metaCache[u] : (metaCache[u] = USER_RE.test(String(u)) ? await store.get(`${W}a/${u}`, { type: "json" }) : null));
    const auth = {};
    for (const u of Object.keys(tokens).slice(0, 8)) {
      const m = await meta(u);
      if (m && safeEq(tokens[u], tokenFor(secret, u, m.v))) auth[u] = m;
    }
    const allowed = (u) => !!auth[u];
    const authList = Object.keys(auth);
    const admin = ADMINS.some((u) => auth[u]);
    const adminId = ADMINS.find((u) => auth[u]) || "";

    const forestOf = async (fid) => (FID_RE.test(String(fid)) ? await store.get(`${W}f/${fid}`, { type: "json" }) : null);
    const memberOf = async (u, fid) => { const f = await forestOf(fid); return f && f.members.includes(u) ? f : null; };
    const pairKey = (x, y) => [x, y].sort().join("~");
    const socialOf = async (u) => {
      const fr = (await store.list({ prefix: `${W}fr/${u}/` })).blobs.map((b) => b.key.split("/").pop());
      const inc = (await Promise.all((await store.list({ prefix: `${W}frq/${u}/` })).blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
      const outg = (await store.list({ prefix: `${W}frs/${u}/` })).blobs.map((b) => b.key.split("/").pop());
      const blocked = (await store.list({ prefix: `${W}bl/${u}/` })).blobs.map((b) => b.key.split("/").pop());
      const threads = {};
      for (const f of fr) {
        const ks = (await store.list({ prefix: `${W}dm/${pairKey(u, f)}/` })).blobs.map((b) => b.key).sort().slice(-60);
        threads[f] = (await Promise.all(ks.map((k) => store.get(k, { type: "json" })))).filter(Boolean);
      }
      const reads = {};
      for (const f of fr) { const r = await store.get(`${W}dmr/${f}/${u}`); if (r) reads[f] = +r; }
      const friends = [];
      for (const f of fr) { const a = await meta(f); if (a) friends.push({ id: f, name: a.name, color: a.color, av: a.av || 0 }); }
      const outgoing = [];
      for (const t of outg) { const a = await meta(t); if (a) outgoing.push({ id: t, name: a.name, color: a.color }); }
      return { friends, incoming: inc, outgoing, blocked, threads, reads };
    };
    const treeDocs = async () => {
      const { blobs } = await store.list({ prefix: `${W}t/` });
      return (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
    };

    if (req.method === "GET") {
      if (kindQ === "roster") {
        if (!authList.length) return json({ error: "Inicia sesión primero" }, 401);
        const { blobs } = await store.list({ prefix: `${W}a/` });
        const all = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
        return json({ ok: true, users: all.map((a) => ({ id: a.id, name: a.name, color: a.color })) });
      }
      if (kindQ === "history") {
        const p = String(url.searchParams.get("p") || "");
        if (!authList.includes(p) && !admin) return json({ error: "Inicia sesión primero" }, 401);
        const sum = (v, extra) => ({ at: v.at, device: v.device || "", subjects: (v.data.subjects || []).length, tasks: (v.data.tasks || []).length, notes: (v.data.notes || []).length, thoughts: (v.data.thoughts || []).length, owner: v.data.owner || "", ...extra });
        const hl = await store.list({ prefix: `${W}ph/${p}/` });
        const keys = hl.blobs.map((b) => b.key).sort().reverse().slice(0, 40);
        const list = [];
        for (const k of keys) { const v = await store.get(k, { type: "json" }); if (v && v.data) list.push(sum(v, {})); }
        // copias diarias (una por día, 60 días)
        const dl = await store.list({ prefix: `${W}pd/${p}/` });
        const daily = [];
        for (const k of dl.blobs.map((b) => b.key).sort().reverse().slice(0, 60)) { const v = await store.get(k, { type: "json" }); if (v && v.data) daily.push(sum(v, { day: k.split("/").pop() })); }
        return json({ ok: true, list, daily });
      }
      if (kindQ === "live") {
        const me = String(url.searchParams.get("me") || "");
        if (!USER_RE.test(me) || !allowed(me)) return json({ error: "Inicia sesión primero" }, 401);
        const since = +url.searchParams.get("since") || 0; const now = Date.now();
        const pres = (await Promise.all((await store.list({ prefix: `${W}presence/${me}-` })).blobs.map((b) => store.get(b.key, { type: "json" })))).filter((v) => v && v.viewing === me && now - v.at < 20000);
        const keys = (await store.list({ prefix: `${W}am/${me}/` })).blobs.map((b) => b.key).filter((k) => +k.split("/").pop().split("-")[0] > since).sort().slice(-20);
        const msgs = (await Promise.all(keys.map((k) => store.get(k, { type: "json" })))).filter((m) => m && m.from !== me);
        let replies = [];
        if (ADMINS.includes(me)) {
          const rk = (await store.list({ prefix: `${W}amr/${me}/` })).blobs.map((b) => b.key).filter((k) => +k.split("/").pop().split("-")[0] > since).sort().slice(-20);
          replies = (await Promise.all(rk.map((k) => store.get(k, { type: "json" })))).filter(Boolean);
        }
        return json({ ok: true, now, presence: pres, msgs, replies });
      }
      if (kindQ === "amsg") {
        const to = String(url.searchParams.get("to") || "");
        if (!USER_RE.test(to) || !(allowed(to) || admin)) return json({ error: "Inicia sesión primero" }, 403);
        const { blobs } = await store.list({ prefix: `${W}am/${to}/` });
        const msgs = (await Promise.all(blobs.map((b) => b.key).sort().slice(-60).map((k) => store.get(k, { type: "json" })))).filter(Boolean);
        return json({ ok: true, msgs });
      }
      if (kindQ === "admin") {
        if (!admin) return json({ error: "Solo la cuenta de administración puede ver esto" }, 403);
        const { blobs } = await store.list({ prefix: `${W}a/` });
        const users = [];
        for (const b of blobs) {
          const a = await store.get(b.key, { type: "json" }); if (!a) continue;
          const d = await store.get(`${W}p/${a.id}`, { type: "json" });
          const nh = (await store.list({ prefix: `${W}ph/${a.id}/` })).blobs.length;
          const nd = (await store.list({ prefix: `${W}pd/${a.id}/` })).blobs.length;
          const nf = (await store.list({ prefix: `${W}mf/${a.id}/` })).blobs.length;
          const t = await store.get(`${W}t/${a.id}`, { type: "json" });
          users.push({ id: a.id, name: a.name, color: a.color, created: a.at || 0, at: d?.at || 0, device: d?.device || "", subjects: (d?.data?.subjects || []).length, tasks: (d?.data?.tasks || []).length, notes: (d?.data?.notes || []).length, versions: nh, daily: nd, forests: nf, level: t?.level || 0, admin: ADMINS.includes(a.id) });
        }
        const fl = await store.list({ prefix: `${W}f/` });
        const forests = [];
        for (const b of fl.blobs) {
          const f = await store.get(b.key, { type: "json" }); if (!f) continue;
          const n = (await store.list({ prefix: `${W}g/${f.id}/` })).blobs.length;
          const nd = (await store.list({ prefix: `${W}gd/${f.id}/` })).blobs.length;
          forests.push({ id: f.id, name: f.name, color: f.color, owner: f.owner, members: f.members, items: n, daily: nd, at: f.at });
        }
        const nowT = Date.now();
        for (const u of users) {
          const sn = await store.get(`${W}seen/${u.id}`, { type: "json" });
          u.seen = sn?.at || 0; u.online = !!sn && nowT - sn.at < 60000; u.since = sn?.since || 0; u.prevAt = sn?.prevAt || 0; u.total = sn?.total || 0;
        }
        users.sort((a, b) => (b.online - a.online) || ((b.seen || b.at) - (a.seen || a.at)));
        return json({ ok: true, users, forests, now: nowT });
      }
      if (kindQ === "suggestions") {
        const p = String(url.searchParams.get("p") || "");
        if (admin) {
          const ks = (await store.list({ prefix: `${W}sug/` })).blobs.map((b) => b.key).sort().reverse().slice(0, 200);
          const list = (await Promise.all(ks.map((k) => store.get(k, { type: "json" })))).filter(Boolean);
          return json({ ok: true, admin: true, list });
        }
        if (!USER_RE.test(p) || !allowed(p)) return json({ error: "Inicia sesión primero" }, 401);
        const ks = (await store.list({ prefix: `${W}sugu/${p}/` })).blobs.map((b) => b.key).sort().reverse().slice(0, 30);
        const list = (await Promise.all(ks.map((k) => store.get(k, { type: "json" })))).filter(Boolean).map((v) => ({ id: v.id, cat: v.cat, text: v.text, at: v.at, done: !!v.done }));
        return json({ ok: true, admin: false, list });
      }
      if (kindQ === "avisos") {
        if (!admin) return json({ error: "Solo administración" }, 403);
        return json({ ok: true, ...(await runAvisos(store, url.origin, +url.searchParams.get("at") || Date.now())) });
      }
      if (kindQ === "adminexport") {
        if (!admin) return json({ error: "Solo la cuenta de administración puede hacer esto" }, 403);
        const out = { app: "Cinnavia", kind: "respaldo-total", at: Date.now(), profiles: {}, forests: {} };
        const { blobs } = await store.list({ prefix: `${W}p/` });
        for (const b of blobs) { const v = await store.get(b.key, { type: "json" }); if (v) out.profiles[b.key.split("/").pop()] = v; }
        const fl = await store.list({ prefix: `${W}f/` });
        for (const b of fl.blobs) {
          const f = await store.get(b.key, { type: "json" }); if (!f) continue;
          const gl = await store.list({ prefix: `${W}g/${f.id}/` });
          out.forests[f.id] = { meta: f, items: (await Promise.all(gl.blobs.map((x) => store.get(x.key, { type: "json" })))).filter(Boolean) };
        }
        return json(out);
      }
      if (kindQ === "ghistory") {
        const fid = url.searchParams.get("forest"); const as = url.searchParams.get("as");
        const f = await forestOf(fid);
        if (!f || !(admin || (allowed(as) && f.members.includes(as)))) return json({ error: "No disponible" }, 403);
        const dl = await store.list({ prefix: `${W}gd/${f.id}/` });
        const list = [];
        for (const k of dl.blobs.map((b) => b.key).sort().reverse().slice(0, 45)) { const v = await store.get(k, { type: "json" }); if (v) list.push({ day: k.split("/").pop(), at: v.at, items: (v.items || []).filter((x) => !x.deleted).length }); }
        return json({ ok: true, list });
      }
      if (kindQ === "watch") {
        if (!authList.length) return json({ error: "Inicia sesión primero" }, 401);
        const since = url.searchParams.get("since") || "";
        const sinceL = url.searchParams.get("lob");
        const wantL = sinceL !== null;
        const sinceB = url.searchParams.get("lib"); const wantB = sinceB !== null;
        const read = async () => {
          const rs = await Promise.all([...authList].sort().map((u) => store.get(revKey(u))));
          const l = wantL ? await store.get(revKey("_lobby")) : "";
          const b = wantB ? await store.get(revKey("_lib")) : "";
          return { rev: rs.map((x) => x || "0").join("|"), lob: l || "0", lib: b || "0" };
        };
        const t0 = Date.now(); let cur = await read();
        while (since && cur.rev === since && (!wantL || cur.lob === sinceL) && (!wantB || cur.lib === sinceB) && Date.now() - t0 < 7000) {
          await new Promise((r) => setTimeout(r, 400));
          cur = await read();
        }
        return json({ ok: true, rev: cur.rev, lob: cur.lob, lib: cur.lib, changed: !!since && (cur.rev !== since || (wantL && cur.lob !== sinceL) || (wantB && cur.lib !== sinceB)) });
      }
      if (kindQ === "avatar") {
        const u = String(url.searchParams.get("u") || "");
        if (!USER_RE.test(u)) return json({ error: "usuario inválido" }, 400);
        const v = await store.get(`${W}av/${u}`, { type: "json" });
        return json({ ok: true, v: v?.v || 0, data: v?.data || null });
      }
      if (kindQ === "ufile") {
        const as = url.searchParams.get("as"); const id = url.searchParams.get("id") || "";
        if (!allowed(as) && !admin) return json({ error: "Inicia sesión primero" }, 401);
        if (!/^[a-z0-9-]{4,60}$/i.test(id)) return json({ error: "archivo inválido" }, 400);
        return json({ ok: true, data: (await store.get(`${W}uf/${as}/${id}`, { type: "text" })) || null });
      }
      if (kindQ === "library") {
        if (!authList.length) return json({ error: "Inicia sesión primero" }, 401);
        const since = +url.searchParams.get("since") || 0;
        const { blobs } = await store.list({ prefix: `${W}lib/` });
        const keys = blobs.map((b) => b.key).sort().slice(-220).filter((k) => +k.split("/").pop().split("-")[0] > since);
        const posts = (await Promise.all(keys.map((k) => store.get(k, { type: "json" })))).filter(Boolean)
          .map((x) => ({ ...x, reports: undefined, reported: (x.reports || []).length, hidden: (x.reports || []).length >= 3 && !admin }));
        const pres = (await store.list({ prefix: `${W}libon/` })).blobs.length;
        return json({ ok: true, posts, online: pres, now: Date.now() });
      }
      if (kindQ === "libfile") {
        if (!authList.length) return json({ error: "Inicia sesión primero" }, 401);
        const id = url.searchParams.get("id") || "";
        if (!/^[a-z0-9-]{4,60}$/i.test(id)) return json({ error: "archivo inválido" }, 400);
        return json({ ok: true, data: (await store.get(`${W}libf/${id}`, { type: "text" })) || null });
      }
      if (kindQ === "gamerank") {
        const now = Date.now(); const as = url.searchParams.get("as") || "";
        const read = async (prefix, key = "score") => { const { blobs } = await store.list({ prefix }); const all = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean); return all.sort((x, y) => (y[key] || 0) - (x[key] || 0) || (x.at || 0) - (y.at || 0)).slice(0, 20); };
        const P = ({ galope: "gg", peloton: "gp", mente: "gv", enlaza: "gn", gusano: "gw", mono: "gk", cielo: "gc", mina: "gz", torres: "gf" })[url.searchParams.get("game") || ""] || "gs";
        const out = { ok: true, dia: await read(`${W}${P}/d/${dayOf(now)}/`), semana: await read(`${W}${P}/w/${weekOf(now)}/`), record: await read(`${W}${P}/a/`), manzanas: await read(`${W}${P}/t/`, "apples") };
        if (USER_RE.test(as)) { const a1 = await store.get(`${W}${P}/a/${as}`, { type: "json" }); const t1 = await store.get(`${W}${P}/t/${as}`, { type: "json" }); out.me = { best: a1?.score || 0, total: t1?.apples || 0, games: t1?.games || 0 }; }
        return json(out);
      }
      if (kindQ === "lobby") {
        const as = url.searchParams.get("as");
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const now = Date.now();
        const { blobs } = await store.list({ prefix: `${W}lobby/` });
        const docs = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter((d) => d && d.end > now);
        const SLOT = 30 * 60000, slot = Math.floor(now / SLOT);
        const rank = (id) => createHash("sha256").update(`${id}:${slot}`).digest("hex");
        const sorted = [...docs].sort((a, b) => rank(a.id).localeCompare(rank(b.id)));
        const idx = sorted.findIndex((d) => d.id === as);
        const room = idx < 0 ? [] : sorted.slice(Math.floor(idx / 6) * 6, Math.floor(idx / 6) * 6 + 6);
        return json({ ok: true, total: docs.length, slot, room: room.map((d) => ({ id: d.id, name: d.ghost ? null : d.name, color: d.ghost ? null : d.color, ghost: !!d.ghost, end: d.end })) });
      }
      if (kindQ === "gimg") {
        const as = url.searchParams.get("as");
        const fid = url.searchParams.get("forest");
        const id = url.searchParams.get("id");
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        if (!(admin && (await forestOf(fid))) && !(await memberOf(as, fid)) || !/^[a-z0-9-]{4,60}$/i.test(id || "")) return json({ error: "No disponible" }, 403);
        const data = await store.get(`${W}gi/${fid}/${id}`, { type: "text" });
        return json({ ok: true, data: data || null });
      }
      if (kindQ === "rank") {
        const trees = await treeDocs();
        const people = trees.sort((a, b) => b.level - a.level || b.pts - a.pts || b.life - a.life).slice(0, 100)
          .map((t) => ({ id: t.id, name: t.name, color: t.color, level: t.level, pts: t.pts, life: t.life, streak: t.streak || 0 }));
        const lifeBy = Object.fromEntries(trees.map((t) => [t.id, t.life || 0]));
        const { blobs } = await store.list({ prefix: `${W}f/` });
        const fs = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
        const forests = fs.map((f) => {
          const life = f.members.reduce((a, m) => a + (lifeBy[m] || 0), 0);
          return { id: f.id, name: f.name, emoji: f.emoji, color: f.color, members: f.members.length, life, level: levelFor(life, TG, 1000) };
        }).sort((a, b) => b.level - a.level || b.life - a.life).slice(0, 100);
        return json({ ok: true, people, forests, total: trees.length });
      }

      const out = { ok: true, now: Date.now(), users: {}, profiles: {}, letters: [], presence: [], forests: {}, invites: [] };
      for (const u of authList) {
        out.users[u] = { name: auth[u].name, color: auth[u].color, av: auth[u].av || 0, role: auth[u].role === "guardian" ? "guardian" : "student" };
        if (u !== "__none") {
          const d = await store.get(`${W}p/${u}`, { type: "json" });
          if (d) out.profiles[u] = d;
        }
      }
      if (authList.length) {
        const ls = await store.list({ prefix: `${W}l/` });
        const all = (await Promise.all(ls.blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
        out.letters = all.filter((l) => authList.includes(l.to) || authList.includes(l.from));
        const pres = await store.list({ prefix: `${W}presence/` });
        const now = Date.now();
        for (const b of pres.blobs) {
          const v = await store.get(b.key, { type: "json" });
          if (v && now - v.at < 20000 && authList.includes(v.viewing)) out.presence.push(v);
        }
        const seen = new Set();
        for (const u of authList) {
          const mk = await store.list({ prefix: `${W}mf/${u}/` });
          for (const b of mk.blobs) {
            const fid = b.key.split("/").pop();
            if (seen.has(fid)) continue;
            const f = await forestOf(fid);
            if (!f || !f.members.includes(u)) continue;
            seen.add(fid);
            const gl = await store.list({ prefix: `${W}g/${fid}/` });
            let items = (await Promise.all(gl.blobs.slice(0, 1500).map((x) => store.get(x.key, { type: "json" })))).filter(Boolean);
            // privacidad: quien no es Guardián solo recibe SU asistencia y SUS calificaciones
            if (auth[u].role !== "guardian") items = items.map((x) => (x.type === "asist" ? { ...x, marks: x.marks && x.marks[u] ? { [u]: x.marks[u] } : {} } : x.type === "eval" ? { ...x, scores: x.scores && x.scores[u] !== undefined ? { [u]: x.scores[u] } : {} } : x));
            const rq = await store.list({ prefix: `${W}req/${fid}/` });
            const reqs = (await Promise.all(rq.blobs.slice(0, 60).map((x) => store.get(x.key, { type: "json" })))).filter(Boolean);
            out.forests[fid] = { meta: f, items, reqs };
          }
          const mr = await store.list({ prefix: `${W}myreq/${u}/` });
          for (const b of mr.blobs) { const v = await store.get(b.key, { type: "json" }); if (v) (out.myreqs ||= []).push(v); }
          const iv = await store.list({ prefix: `${W}inv/${u}/` });
          for (const b of iv.blobs) { const v = await store.get(b.key, { type: "json" }); if (v) out.invites.push(v); }
        }
        // nombres de todos los integrantes de mis bosques
        const names = {};
        for (const f of Object.values(out.forests)) for (const m of f.meta.members) names[m] = null;
        out.social = {};
        for (const u of authList) out.social[u] = await socialOf(u);
        for (const s of Object.values(out.social)) for (const f of s.friends) names[f.id] = null;
        for (const m of Object.keys(names)) { const a = await meta(m); names[m] = a ? { name: a.name, color: a.color, av: a.av || 0, role: a.role === "guardian" ? "guardian" : "student" } : { name: m, color: COLORS[0] }; }
        out.members = names;
        out.trees = {};
        for (const m of Object.keys(names)) { const t = await store.get(`${W}t/${m}`, { type: "json" }); if (t) out.trees[m] = t; }
      }
      return json(out);
    }

    if (req.method !== "POST" && req.method !== "PUT") return json({ error: "método no permitido" }, 405);
    const text = await req.text();
    if (text.length > MAX) return json({ error: "demasiado grande" }, 413);
    const body = JSON.parse(text);
    const as = String(body.as || "");

    const viewId = String(req.headers.get("x-aldia-view") || "");
    if (viewId && !(["presence", "adminenter"].includes(body.kind)) && (body.profile === viewId || body.as === viewId || body.kind === "letter")) return json({ error: "Vista de administración: solo lectura. No se guardó nada." }, 403);
    switch (body.kind) {
      case "register": {
        const user = String(body.user || "").toLowerCase();
        const name = clip(body.name, 24).trim();
        if (!USER_RE.test(user)) return json({ error: "El usuario debe tener de 3 a 20 letras o números, sin espacios ni acentos" }, 400);
        if (!name) return json({ error: "Escribe tu nombre" }, 400);
        if (String(body.password || "").length < 4) return json({ error: "La contraseña debe tener al menos 4 caracteres" }, 400);
        if (await meta(user)) return json({ error: "Ese usuario ya existe. Prueba con otro o entra con tu contraseña" }, 409);
        const salt = randomBytes(16).toString("hex");
        const color = COLORS.includes(body.color) ? body.color : COLORS[Math.floor(Math.random() * COLORS.length)];
        const role = body.role === "guardian" ? "guardian" : "student";
        const rec = { id: user, name, color, role, salt, hash: hashPw(body.password, salt), v: 1, at: Date.now() };
        await store.setJSON(`${W}a/${user}`, rec, { onlyIfNew: true });
        const again = await store.get(`${W}a/${user}`, { type: "json" });
        if (!again || again.salt !== salt) return json({ error: "Ese usuario ya existe. Prueba con otro" }, 409);
        return json({ ok: true, token: tokenFor(secret, user, 1), user: { id: user, name, color, role } });
      }
      case "login": {
        const user = String(body.user || "").toLowerCase();
        const m = await meta(user);
        if (!m || !safeEq(hashPw(body.password, m.salt), m.hash)) return json({ error: "Usuario o contraseña incorrectos" }, 401);
        return json({ ok: true, token: tokenFor(secret, user, m.v), user: { id: m.id, name: m.name, color: m.color, role: m.role === "guardian" ? "guardian" : "student" } });
      }
      case "setrole": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const role = body.role === "guardian" ? "guardian" : "student";
        const m = await meta(as); await store.setJSON(`${W}a/${as}`, { ...m, role });
        await bump(store, [as]);
        return json({ ok: true, role });
      }
      case "setpw": {
        const user = String(body.user || "").toLowerCase();
        const m = await meta(user);
        if (!m) return json({ error: "Ese usuario no existe" }, 404);
        const proven = allowed(user) || (body.old && safeEq(hashPw(body.old, m.salt), m.hash));
        if (!proven) return json({ error: "Escribe tu contraseña actual" }, 401);
        if (String(body.password || "").length < 4) return json({ error: "La contraseña debe tener al menos 4 caracteres" }, 400);
        const salt = randomBytes(16).toString("hex");
        const v = (m.v || 1) + 1;
        await store.setJSON(`${W}a/${user}`, { ...m, salt, hash: hashPw(body.password, salt), v });
        return json({ ok: true, token: tokenFor(secret, user, v) });
      }
      case "profile": {
        const p = String(body.profile || "");
        if (!body.data || typeof body.data !== "object") return json({ error: "datos inválidos" }, 400);
        if (!allowed(p)) return json({ error: "Inicia sesión primero" }, 401);
        // protección: un dispositivo nunca puede guardar los datos de una persona en la cuenta de otra
        if (body.data.owner && body.data.owner !== p) return json({ error: "Estos datos son de otra cuenta; no se guardaron." }, 409);
        const at = Date.now();
        const prev = await store.get(`${W}p/${p}`, { type: "json" });
        if (prev && prev.data && at - (prev.at || 0) > 0) {
          // historial en la nube: una versión cada 10 minutos como máximo, se guardan las últimas 40
          const hl = await store.list({ prefix: `${W}ph/${p}/` });
          const keys = hl.blobs.map((b) => b.key).sort();
          const lastAt = keys.length ? +keys[keys.length - 1].split("/").pop() : 0;
          if (at - lastAt > 10 * 60000) {
            await store.setJSON(`${W}ph/${p}/${prev.at}`, prev);
            for (const k of keys.slice(0, Math.max(0, keys.length + 1 - 40))) await store.delete(k);
          }
          // copia diaria: la primera versión de cada día se guarda 60 días
          const dk = `${W}pd/${p}/${dayOf(prev.at || at)}`;
          const r = await store.setJSON(dk, prev, { onlyIfNew: true });
          if (r && r.modified !== false) {
            const dl = await store.list({ prefix: `${W}pd/${p}/` });
            const dks = dl.blobs.map((b) => b.key).sort();
            for (const k of dks.slice(0, Math.max(0, dks.length - 60))) await store.delete(k);
          }
        }
        await store.setJSON(`${W}p/${p}`, { at, device: clip(body.device, 40), data: body.data });
        await bump(store, [p]);
        return json({ ok: true, at });
      }
      case "tree": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const pts = Math.max(0, Math.min(4000, Math.floor(+body.pts || 0)));
        const life = Math.max(0, Math.min(400000, Math.floor(+body.life || 0)));
        const doc = { id: as, name: auth[as].name, color: auth[as].color, pts, level: levelFor(pts, T, 100), life, streak: Math.max(0, Math.min(5000, Math.floor(+body.streak || 0))), at: Date.now() };
        await store.setJSON(`${W}t/${as}`, doc);
        return json({ ok: true, level: doc.level });
      }
      case "letter": {
        const l = body.letter || {};
        if (!/^[a-z0-9]{6,30}$/i.test(l.id || "") || !LETTER_USERS.includes(l.from) || !LETTER_USERS.includes(l.to) || l.from === l.to) return json({ error: "mensaje inválido" }, 400);
        if (!allowed(l.from) && !allowed(l.to)) return json({ error: "Inicia sesión primero" }, 401);
        const prevL = await store.get(`${W}l/${l.id}`, { type: "json" });
        // la hora la pone el servidor la primera vez (los relojes de los teléfonos pueden estar desfasados)
        const at = prevL?.at || (Math.abs((+l.at || 0) - Date.now()) < 120000 || !(+l.at) ? Date.now() : Math.min(+l.at, Date.now()));
        await store.setJSON(`${W}l/${l.id}`, { id: l.id, from: l.from, to: l.to, text: clip(l.text, 4000), at, tz: clip(l.tz, 40), read: !!l.read });
        await bump(store, [l.from, l.to]);
        return json({ ok: true });
      }
      case "amreply": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const text = clip(body.text, 1000).trim();
        if (!text || !/^[a-z0-9]{6,30}$/i.test(body.id || "")) return json({ error: "mensaje inválido" }, 400);
        const thread = (await store.list({ prefix: `${W}am/${as}/` })).blobs.map((b) => b.key).sort();
        let to = ADMINS[0];
        for (const k of thread.slice().reverse()) { const v = await store.get(k, { type: "json" }); if (v && v.from !== as && ADMINS.includes(v.from)) { to = v.from; break; } }
        if (!thread.length) return json({ error: "Solo puedes responder cuando administración te escribe" }, 403);
        const at = Date.now(); const rec = { id: body.id, from: as, fromName: auth[as].name, to, reply: true, text, at };
        await store.setJSON(`${W}am/${as}/${at}-${body.id}`, rec);
        await store.setJSON(`${W}amr/${to}/${at}-${body.id}`, rec);
        const rk = (await store.list({ prefix: `${W}amr/${to}/` })).blobs.map((b) => b.key).sort();
        for (const k of rk.slice(0, Math.max(0, rk.length - 200))) await store.delete(k);
        if (context?.waitUntil) context.waitUntil(pushTo(store, [to], url.origin, { title: "Respuesta de " + auth[as].name, body: clip(text, 140), url: "#/panel", tag: "amr-" + as }, ""));
        return json({ ok: true, at });
      }
      case "adminmsg": {
        if (!admin) return json({ error: "Solo la cuenta de administración puede escribir aquí" }, 403);
        const to = String(body.to || "");
        if (!USER_RE.test(to) || !(await meta(to))) return json({ error: "cuenta inválida" }, 400);
        const text = clip(body.text, 1000).trim();
        if (!text || !/^[a-z0-9]{6,30}$/i.test(body.id || "")) return json({ error: "mensaje inválido" }, 400);
        const at = Date.now();
        await store.setJSON(`${W}am/${to}/${at}-${body.id}`, { id: body.id, from: adminId, fromName: auth[adminId]?.name || adminId, to, text, at });
        const ks = (await store.list({ prefix: `${W}am/${to}/` })).blobs.map((b) => b.key).sort();
        for (const k of ks.slice(0, Math.max(0, ks.length - 100))) await store.delete(k);
        await bump(store, [to]);
        if (context?.waitUntil) context.waitUntil(pushTo(store, [to], url.origin, { title: "Mensaje de " + (auth[adminId]?.name || "administración"), body: clip(text, 140), url: "#/hoy", tag: "am" }, ""));
        return json({ ok: true, at });
      }
      case "suggest": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const text = clip(body.text, 1500).trim();
        const cat = ["idea", "juego", "mejora", "error", "otro"].includes(body.cat) ? body.cat : "idea";
        if (text.length < 5 || !/^[a-z0-9]{6,30}$/i.test(body.id || "")) return json({ error: "Escribe tu sugerencia (mínimo 5 letras)" }, 400);
        const mine = (await store.list({ prefix: `${W}sugu/${as}/` })).blobs.map((b) => b.key);
        if (mine.some((k) => k.endsWith("-" + body.id))) return json({ ok: true, dup: true });
        const day = Date.now() - 86400000;
        if (mine.filter((k) => +k.split("/").pop().split("-")[0] > day).length >= 5) return json({ error: "Ya enviaste 5 sugerencias hoy. Mañana puedes mandar más." }, 429);
        const at = Date.now();
        const rec = { id: body.id, by: as, name: auth[as].name, cat, text, at, done: false };
        await store.setJSON(`${W}sug/${at}-${body.id}`, rec);
        await store.setJSON(`${W}sugu/${as}/${at}-${body.id}`, rec);
        if (context?.waitUntil) context.waitUntil(pushTo(store, ADMINS, url.origin, { title: "Sugerencia de " + auth[as].name, body: clip(text, 140), url: "#/sugerencias", tag: "sug" }, ""));
        return json({ ok: true, at });
      }
      case "sugadmin": {
        if (!admin) return json({ error: "Solo la cuenta de administración" }, 403);
        const id = String(body.id || "");
        if (!/^[a-z0-9]{6,30}$/i.test(id)) return json({ error: "inválido" }, 400);
        const ks = (await store.list({ prefix: `${W}sug/` })).blobs.map((b) => b.key).filter((k) => k.endsWith("-" + id));
        for (const k of ks) {
          const v = await store.get(k, { type: "json" }); if (!v) continue;
          const uk = `${W}sugu/${v.by}/${k.split("/").pop()}`;
          if (body.action === "delete") { await store.delete(k); await store.delete(uk); }
          else { v.done = !v.done; await store.setJSON(k, v); await store.setJSON(uk, v); }
        }
        return json({ ok: true });
      }
      case "ping": {
        const who = String(body.who || "");
        if (!USER_RE.test(who) || !allowed(who)) return json({ error: "Inicia sesión primero" }, 401);
        const prev = await store.get(`${W}seen/${who}`, { type: "json" });
        const now = Date.now();
        const first = !prev || now - (prev.at || 0) > 120000;
        // tiempo total: suma el intervalo desde el último latido, solo si no pasó demasiado (evita contar horas cerrada la app)
        const gap = prev && !first ? Math.max(0, now - (prev.at || 0)) : 0;
        const total = (prev?.total || 0) + gap;
        await store.setJSON(`${W}seen/${who}`, { at: now, since: first ? now : (prev.since || now), prevAt: first ? (prev?.at || 0) : (prev.prevAt || 0), total });
        return json({ ok: true });
      }
      case "presence": {
        if (!USER_RE.test(String(body.viewing)) || !USER_RE.test(String(body.viewer)) || body.viewer === body.viewing) return json({ error: "presencia inválida" }, 400);
        if (!allowed(body.viewing) && !(body.leave && allowed(body.viewer))) return json({ error: "Inicia sesión primero" }, 401);
        if (body.leave) { await store.delete(`${W}presence/${body.viewing}-${body.viewer}`); return json({ ok: true }); }
        await store.setJSON(`${W}presence/${body.viewing}-${body.viewer}`, { viewer: body.viewer, viewing: body.viewing, name: auth[body.viewer]?.name || clip(body.name, 40) || body.viewer, at: Date.now() });
        await bump(store, [body.viewing]);
        return json({ ok: true });
      }

      /* ---------- Bosques ---------- */
      case "fcreate": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const name = clip(body.name, 30).trim();
        if (!name) return json({ error: "Ponle nombre a tu Bosque" }, 400);
        const id = randomBytes(5).toString("hex");
        const f = { id, name, emoji: clip(body.emoji, 4) || "", color: COLORS.includes(body.color) ? body.color : COLORS[0], owner: as, members: [as], at: Date.now() };
        await store.setJSON(`${W}f/${id}`, f);
        await store.set(`${W}mf/${as}/${id}`, "1");
        await bump(store, [as]);
        return json({ ok: true, forest: f });
      }
      case "finvite": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const f = await memberOf(as, body.forest);
        if (!f) return json({ error: "Ese Bosque no es tuyo" }, 403);
        const to = String(body.to || "").toLowerCase();
        const tm = await meta(to);
        if (!tm) return json({ error: "No existe ningún usuario con ese nombre" }, 404);
        if (f.members.includes(to)) return json({ error: `${tm.name} ya está en el Bosque` }, 409);
        if (f.members.length >= 40) return json({ error: "El Bosque está lleno (40 integrantes)" }, 400);
        await store.setJSON(`${W}inv/${to}/${f.id}`, { forest: f.id, forestName: f.name, emoji: f.emoji, from: as, fromName: auth[as].name, to, at: Date.now() });
        await bump(store, [to, ...f.members]);
        if (context?.waitUntil) context.waitUntil(pushTo(store, [to], url.origin, { title: `${auth[as].name} te invita a un Bosque`, body: f.name, url: "#/vida", tag: `inv-${f.id}` }, ""));
        return json({ ok: true, name: tm.name });
      }
      case "frespond": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const fid = String(body.forest || "");
        const inv = await store.get(`${W}inv/${as}/${fid}`, { type: "json" });
        if (!inv) return json({ error: "Esa invitación ya no existe" }, 404);
        if (body.accept) {
          const f = await forestOf(fid);
          if (f && !f.members.includes(as)) { f.members.push(as); await store.setJSON(`${W}f/${fid}`, f); }
          if (f) await store.set(`${W}mf/${as}/${fid}`, "1");
        }
        await store.delete(`${W}inv/${as}/${fid}`);
        if (body.accept) { await store.delete(`${W}req/${fid}/${as}`); await store.delete(`${W}myreq/${as}/${fid}`); }
        { const f2 = await forestOf(fid); await bump(store, [as, ...(f2 ? f2.members : [])]); }
        return json({ ok: true });
      }
      case "fleave": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const f = await forestOf(body.forest);
        if (!f) return json({ ok: true });
        f.members = f.members.filter((m) => m !== as);
        await store.delete(`${W}mf/${as}/${f.id}`);
        if (!f.members.length) {
          { const gl0 = await store.list({ prefix: `${W}g/${f.id}/` }); const items = (await Promise.all(gl0.blobs.map((x) => store.get(x.key, { type: "json" })))).filter(Boolean); await store.setJSON(`${W}gx/${f.id}`, { meta: f, items, at: Date.now() }); }
          await store.delete(`${W}f/${f.id}`);
          const gl = await store.list({ prefix: `${W}g/${f.id}/` });
          await Promise.all(gl.blobs.map((b) => store.delete(b.key)));
        } else { if (f.owner === as) f.owner = f.members[0]; await store.setJSON(`${W}f/${f.id}`, f); }
        await bump(store, [as, ...f.members]);
        return json({ ok: true });
      }
      case "frename": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const f = await memberOf(as, body.forest);
        if (!f) return json({ error: "Ese Bosque no es tuyo" }, 403);
        const name = clip(body.name, 30).trim();
        if (name) f.name = name;
        if (body.emoji) f.emoji = clip(body.emoji, 4);
        await store.setJSON(`${W}f/${f.id}`, f);
        await bump(store, f.members);
        return json({ ok: true });
      }
      case "restore": {
        const p = String(body.profile || "");
        if (!allowed(p) && !admin) return json({ error: "Inicia sesión primero" }, 401);
        const v = body.day && /^\d{4}-\d{2}-\d{2}$/.test(body.day) ? await store.get(`${W}pd/${p}/${body.day}`, { type: "json" }) : await store.get(`${W}ph/${p}/${Math.floor(+body.at || 0)}`, { type: "json" });
        if (!v || !v.data) return json({ error: "Esa versión ya no existe" }, 404);
        const cur = await store.get(`${W}p/${p}`, { type: "json" });
        if (cur) await store.setJSON(`${W}ph/${p}/${cur.at}`, { ...cur, device: `${cur.device || ""} (antes de restaurar)`.trim() });
        const at = Date.now(); const data = { ...v.data, owner: p };
        await store.setJSON(`${W}p/${p}`, { at, device: "restaurado", data });
        await bump(store, [p]);
        return json({ ok: true, at, data });
      }
      case "avatar": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const d = String(body.data || "");
        if (d && (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(d) || d.length > 120000)) return json({ error: "La foto no es válida o es muy grande" }, 400);
        const v = Date.now();
        if (d) await store.setJSON(`${W}av/${as}`, { v, data: d }); else await store.delete(`${W}av/${as}`);
        const m = await meta(as); await store.setJSON(`${W}a/${as}`, { ...m, av: d ? v : 0 });
        const fl = (await store.list({ prefix: `${W}mf/${as}/` })).blobs.map((b) => b.key.split("/").pop());
        const touch = new Set([as]);
        for (const fid of fl) { const f = await forestOf(fid); if (f) f.members.forEach((x) => touch.add(x)); }
        for (const b of (await store.list({ prefix: `${W}fr/${as}/` })).blobs) touch.add(b.key.split("/").pop());
        await bump(store, [...touch]);
        return json({ ok: true, v: d ? v : 0 });
      }
      case "ufile": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        if (!/^[a-z0-9-]{4,60}$/i.test(body.id || "")) return json({ error: "archivo inválido" }, 400);
        if (body.delete) { await store.delete(`${W}uf/${as}/${body.id}`); return json({ ok: true }); }
        const d = String(body.data || "");
        if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(d) || d.length > 900000) return json({ error: "La imagen es muy grande o no es válida" }, 400);
        await store.set(`${W}uf/${as}/${body.id}`, d);
        return json({ ok: true });
      }
      case "friendreq": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const to = String(body.to || "").toLowerCase().replace(/^@/, "");
        if (to === as) return json({ error: "No puedes enviarte una solicitud a ti" }, 400);
        const tm = await meta(to);
        if (!tm) return json({ error: "No existe ningún usuario con ese nombre. Revisa cómo lo escribió." }, 404);
        if (await store.get(`${W}fr/${as}/${to}`)) return json({ error: `${tm.name} ya es tu amistad` }, 409);
        if (await store.get(`${W}bl/${to}/${as}`) || await store.get(`${W}bl/${as}/${to}`)) return json({ error: "No se puede enviar la solicitud a esta persona" }, 403);
        if (await store.get(`${W}frq/${as}/${to}`, { type: "json" })) return json({ error: `${tm.name} ya te envió una solicitud: acéptala en Amistades` }, 409);
        const pend = (await store.list({ prefix: `${W}frs/${as}/` })).blobs.length;
        if (pend >= 30) return json({ error: "Tienes muchas solicitudes sin respuesta. Espera a que te respondan." }, 429);
        await store.setJSON(`${W}frq/${to}/${as}`, { from: as, name: auth[as].name, color: auth[as].color, at: Date.now() });
        await store.set(`${W}frs/${as}/${to}`, "1");
        await bump(store, [as, to]);
        if (context?.waitUntil) context.waitUntil(pushTo(store, [to], url.origin, { title: "Nueva solicitud de amistad", body: `${auth[as].name} (@${as}) quiere ser tu amistad en Cinnavia.`, url: "#/amigos", tag: `fr-${as}` }, ""));
        return json({ ok: true, name: tm.name });
      }
      case "friendrespond": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const from = String(body.from || "");
        const rq = await store.get(`${W}frq/${as}/${from}`, { type: "json" });
        if (!rq) return json({ error: "Esa solicitud ya no existe" }, 404);
        await store.delete(`${W}frq/${as}/${from}`); await store.delete(`${W}frs/${from}/${as}`);
        if (body.accept) {
          const since = Date.now();
          await store.setJSON(`${W}fr/${as}/${from}`, { since }); await store.setJSON(`${W}fr/${from}/${as}`, { since });
          if (context?.waitUntil) context.waitUntil(pushTo(store, [from], url.origin, { title: "Solicitud aceptada", body: `${auth[as].name} aceptó tu solicitud. Ya pueden mandarse mensajes.`, url: "#/amigos", tag: `fra-${as}` }, ""));
        }
        await bump(store, [as, from]);
        return json({ ok: true });
      }
      case "friendcancel": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const to = String(body.to || "");
        await store.delete(`${W}frq/${to}/${as}`); await store.delete(`${W}frs/${as}/${to}`);
        await bump(store, [as, to]); return json({ ok: true });
      }
      case "friendremove":
      case "block": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const who = String(body.who || "");
        if (!USER_RE.test(who)) return json({ error: "usuario inválido" }, 400);
        await store.delete(`${W}fr/${as}/${who}`); await store.delete(`${W}fr/${who}/${as}`);
        await store.delete(`${W}frq/${as}/${who}`); await store.delete(`${W}frs/${who}/${as}`); await store.delete(`${W}frq/${who}/${as}`); await store.delete(`${W}frs/${as}/${who}`);
        if (body.kind === "block") { if (body.undo) await store.delete(`${W}bl/${as}/${who}`); else await store.set(`${W}bl/${as}/${who}`, "1"); }
        await bump(store, [as, who]); return json({ ok: true });
      }
      case "dm": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const to = String(body.to || "");
        if (!(await store.get(`${W}fr/${as}/${to}`))) return json({ error: "Solo puedes escribirle a tus amistades aceptadas" }, 403);
        const text = clip(body.text, 2000).trim();
        if (!text) return json({ error: "mensaje vacío" }, 400);
        if (!/^[a-z0-9]{6,30}$/i.test(body.id || "")) return json({ error: "mensaje inválido" }, 400);
        const at = Date.now(); const pk = pairKey(as, to);
        const key = `${W}dm/${pk}/${at}-${body.id}`;
        await store.setJSON(key, { id: body.id, from: as, to, text, at });
        const ks = (await store.list({ prefix: `${W}dm/${pk}/` })).blobs.map((b) => b.key).sort();
        for (const k of ks.slice(0, Math.max(0, ks.length - 400))) await store.delete(k);
        await bump(store, [as, to]);
        if (context?.waitUntil) context.waitUntil(pushTo(store, [to], url.origin, { title: auth[as].name, body: clip(text, 140), url: `#/amigos/${as}`, tag: `dm-${as}` }, ""));
        return json({ ok: true, at });
      }
      case "dmread": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const w = String(body.with || "");
        if (!USER_RE.test(w)) return json({ error: "usuario inválido" }, 400);
        await store.set(`${W}dmr/${as}/${w}`, String(Date.now())); await bump(store, [w]);
        return json({ ok: true });
      }
      // ---- Hojas compartidas de la Libreta (2 o más personas editan la misma hoja) ----
      case "shpshare": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const doc = shpClean(body.doc); if (!doc) return json({ error: "Esa hoja no se puede compartir (las fotos no se comparten todavía)" }, 400);
        const mine = (await store.list({ prefix: `${W}shpi/${as}/` })).blobs.length;
        if (mine >= 60) return json({ error: "Tienes muchas hojas compartidas; deja alguna antes de crear otra" }, 400);
        const id = randomBytes(8).toString("hex");
        await store.setJSON(`${W}shp/${id}`, { id, owner: as, members: [as], names: { [as]: auth[as].name }, doc, v: 1, by: as, at: Date.now() });
        await store.set(`${W}shpi/${as}/${id}`, "1");
        return json({ ok: true, id, v: 1 });
      }
      case "shpinvite": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const sh = await store.get(`${W}shp/${String(body.id || "")}`, { type: "json" });
        if (!sh || !sh.members.includes(as)) return json({ error: "Esa hoja ya no está disponible" }, 404);
        const to = String(body.to || "");
        if (!USER_RE.test(to) || to === as) return json({ error: "Elige a un amigo" }, 400);
        if (!(await store.get(`${W}fr/${as}/${to}`))) return json({ error: "Solo puedes invitar a tus amigos" }, 403);
        if (sh.members.includes(to)) return json({ error: "Ya está en la hoja" }, 409);
        if (sh.members.length >= 6) return json({ error: "Una hoja admite hasta 6 personas" }, 400);
        sh.members.push(to); sh.names = { ...(sh.names || {}), [to]: clip(body.name, 40) || to }; await store.setJSON(`${W}shp/${sh.id}`, sh);
        await store.set(`${W}shpi/${to}/${sh.id}`, "1");
        await bump(store, [to]);
        return json({ ok: true });
      }
      case "shpsave": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const sh = await store.get(`${W}shp/${String(body.id || "")}`, { type: "json" });
        if (!sh || !sh.members.includes(as)) return json({ error: "Esa hoja ya no está disponible" }, 404);
        if (+body.base !== sh.v) return json({ error: "Alguien cambió la hoja mientras editabas", conflict: true, v: sh.v, doc: sh.doc, by: sh.by }, 409);
        const doc = shpClean(body.doc); if (!doc) return json({ error: "Esa hoja no se puede guardar" }, 400);
        sh.doc = doc; sh.v += 1; sh.by = as; sh.at = Date.now();
        await store.setJSON(`${W}shp/${sh.id}`, sh);
        return json({ ok: true, v: sh.v, at: sh.at });
      }
      case "shpleave": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const sh = await store.get(`${W}shp/${String(body.id || "")}`, { type: "json" });
        if (!sh || !sh.members.includes(as)) return json({ ok: true });
        await store.delete(`${W}shpi/${as}/${sh.id}`);
        if (sh.owner === as || body.remove) {
          // quien comparte deja la hoja: se quita a todos (la copia de cada quien queda como hoja personal)
          for (const m of sh.members) { await store.delete(`${W}shpi/${m}/${sh.id}`); }
          await store.delete(`${W}shp/${sh.id}`);
          await bump(store, sh.members);
        } else {
          sh.members = sh.members.filter((m) => m !== as); await store.setJSON(`${W}shp/${sh.id}`, sh); await bump(store, sh.members.concat([as]));
        }
        return json({ ok: true });
      }
      case "shplist": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const ids = (await store.list({ prefix: `${W}shpi/${as}/` })).blobs.map((b) => b.key.split("/").pop());
        const out = [];
        for (const id of ids.slice(0, 60)) {
          const sh = await store.get(`${W}shp/${id}`, { type: "json" });
          if (!sh || !sh.members.includes(as)) { await store.delete(`${W}shpi/${as}/${id}`); continue; }
          out.push({ id, owner: sh.owner, members: sh.members.map((m) => ({ id: m, name: (sh.names || {})[m] || m })), doc: sh.doc, v: sh.v, by: sh.by, at: sh.at });
        }
        return json({ ok: true, shared: out });
      }
      case "libpost": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const last = +(await store.get(`${W}libt/${as}`)) || 0;
        if (Date.now() - last < 1200) return json({ error: "Espera un momento antes de volver a publicar" }, 429);
        const kind = ["text", "draw", "voice", "help", "photo"].includes(body.pkind) ? body.pkind : "text";
        const text = clip(body.text, 1500).trim();
        const id = randomBytes(6).toString("hex"); const at = Date.now();
        let file = "";
        if (kind === "draw" || kind === "voice" || kind === "photo") {
          const d = String(body.data || "");
          const okD = kind === "voice" ? /^data:audio\/[a-z0-9.+-]+(;codecs=[a-z0-9.,]+)?;base64,[A-Za-z0-9+/=]+$/i.test(d) && d.length < 900000
            : /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(d) && d.length < 700000;
          if (!okD) return json({ error: kind === "voice" ? "La nota de voz es muy larga (máximo 1 minuto)" : "La imagen es muy grande" }, 400);
          await store.set(`${W}libf/${id}`, d); file = id;
        } else if (!text) return json({ error: "Escribe algo primero" }, 400);
        const parent = /^[a-f0-9]{12}$/.test(body.parent || "") ? body.parent : "";
        const post = { id, by: as, name: auth[as].name, color: auth[as].color, av: auth[as].av || 0, kind, text, file, dur: Math.max(0, Math.min(90, +body.dur || 0)), subject: clip(body.subject, 40), parent, at, solved: false };
        await store.setJSON(`${W}lib/${at}-${id}`, post);
        await store.set(`${W}libt/${as}`, String(at));
        const ks = (await store.list({ prefix: `${W}lib/` })).blobs.map((b) => b.key).sort();
        for (const k of ks.slice(0, Math.max(0, ks.length - 500))) { const v = await store.get(k, { type: "json" }); if (v?.file) await store.delete(`${W}libf/${v.file}`); await store.delete(k); }
        await bump(store, ["_lib"]);
        if (parent) { const pk = ks.find((k) => k.endsWith(`-${parent}`)); const pv = pk && await store.get(pk, { type: "json" }); if (pv && pv.by !== as && context?.waitUntil) context.waitUntil(pushTo(store, [pv.by], url.origin, { title: `${auth[as].name} te respondió en la Biblioteca`, body: clip(text || "Te mandó algo", 140), url: "#/biblioteca", tag: `lib-${parent}` }, "")); }
        return json({ ok: true, post });
      }
      case "libedit": {
        if (!allowed(as) && !admin) return json({ error: "Inicia sesión primero" }, 401);
        const ks = (await store.list({ prefix: `${W}lib/` })).blobs.map((b) => b.key);
        const k = ks.find((x) => x.endsWith(`-${String(body.id || "")}`)); if (!k) return json({ error: "Ya no existe" }, 404);
        const v = await store.get(k, { type: "json" });
        if (body.action === "report") { v.reports = [...new Set([...(v.reports || []), as])]; await store.setJSON(k, v); }
        else if (body.action === "delete") { if (v.by !== as && !admin) return json({ error: "Solo quien lo publicó puede borrarlo" }, 403); if (v.file) await store.delete(`${W}libf/${v.file}`); await store.delete(k); }
        else if (body.action === "solved") { if (v.by !== as && !admin) return json({ error: "Solo quien pidió ayuda puede marcarla" }, 403); v.solved = !v.solved; await store.setJSON(k, v); }
        await bump(store, ["_lib"]);
        return json({ ok: true });
      }
      case "libhere": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        await store.set(`${W}libon/${as}`, String(Date.now()));
        const { blobs } = await store.list({ prefix: `${W}libon/` });
        for (const b of blobs) { const t = +(await store.get(b.key)) || 0; if (Date.now() - t > 90000) await store.delete(b.key); }
        return json({ ok: true });
      }
      case "game": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        if (body.game === "peloton") {
          // Pelotón de Tareas: puntos = distancia + libros. "partidas" cuenta las carreras.
          const score = Math.max(0, Math.floor(+body.score || 0)); const dur = Math.max(1, Math.floor(+body.dur || 0));
          if (score < 1 || score > dur * 130 + 80 || dur > 36000) return json({ error: "Partida inválida" }, 400);
          const now = Date.now(); const who = { id: as, name: auth[as].name, color: auth[as].color, av: auth[as].av || 0 };
          const put = async (key) => { const prev = await store.get(key, { type: "json" }); if (!prev || score > (prev.score || 0)) { await store.setJSON(key, { ...who, score, apples: 0, at: now }); return true; } return false; };
          await put(`${W}gp/d/${dayOf(now)}/${as}`); await put(`${W}gp/w/${weekOf(now)}/${as}`); const newBest = await put(`${W}gp/a/${as}`);
          const t0 = (await store.get(`${W}gp/t/${as}`, { type: "json" })) || { games: 0 };
          const games = (t0.games || 0) + 1;
          await store.setJSON(`${W}gp/t/${as}`, { ...who, games, apples: games, score: games, at: now });
          const best = (await store.get(`${W}gp/a/${as}`, { type: "json" }))?.score || score;
          const { blobs } = await store.list({ prefix: `${W}gp/d/${dayOf(now)}/` });
          const day = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean).sort((x, y) => y.score - x.score);
          return json({ ok: true, best, newBest: newBest && score > 0, rankDay: day.findIndex((x) => x.id === as) + 1 });
        }
        if (body.game === "mente" || body.game === "enlaza" || body.game === "gusano") {
          // Juegos por niveles: puntos y nivel alcanzado. Se revisa que el avance sea posible (puntos por nivel y tiempo mínimo por nivel).
          const CFG = { mente: { P: "gv", maxL: 500, perLvl: 330, minT: 4 }, enlaza: { P: "gn", maxL: 500, perLvl: 300, minT: 3 }, gusano: { P: "gw", maxL: 1000, perLvl: 300, minT: 2 } }[body.game];
          const level = Math.floor(+body.level); const cleared = Math.floor(+body.cleared); const score = Math.floor(+body.score); const dur = Math.floor(+body.dur || 0);
          if (!(level >= 1 && level <= CFG.maxL) || !(cleared >= 1 && cleared <= 5000) || score < 1 || score > cleared * CFG.perLvl + 20 || dur < cleared * CFG.minT || dur > 86400) return json({ error: "Partida inválida" }, 400);
          const now = Date.now(); const who = { id: as, name: auth[as].name, color: auth[as].color, av: auth[as].av || 0 };
          const put = async (key) => { const prev = await store.get(key, { type: "json" }); if (!prev || score > (prev.score || 0)) { await store.setJSON(key, { ...who, score, level, apples: 0, at: now }); return true; } return false; };
          const P = CFG.P;
          await put(`${W}${P}/d/${dayOf(now)}/${as}`); await put(`${W}${P}/w/${weekOf(now)}/${as}`); const newBest = await put(`${W}${P}/a/${as}`);
          const t0 = (await store.get(`${W}${P}/t/${as}`, { type: "json" })) || { games: 0 };
          const games = (t0.games || 0) + 1;
          await store.setJSON(`${W}${P}/t/${as}`, { ...who, games, apples: games, score: games, at: now });
          const best = (await store.get(`${W}${P}/a/${as}`, { type: "json" }))?.score || score;
          const { blobs } = await store.list({ prefix: `${W}${P}/d/${dayOf(now)}/` });
          const day = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean).sort((x, y) => y.score - x.score);
          return json({ ok: true, best, newBest: newBest && score > 0, rankDay: day.findIndex((x) => x.id === as) + 1 });
        }
        if (body.game === "galope" || body.game === "mono" || body.game === "cielo" || body.game === "mina" || body.game === "torres") {
          const GP = body.game === "mono" ? "gk" : body.game === "cielo" ? "gc" : body.game === "mina" ? "gz" : body.game === "torres" ? "gf" : "gg";
          // Galope: su propio ranking. Puntos = distancia; no hay manzanas, así que "partidas" cuenta las partidas.
          const score = Math.max(0, Math.floor(+body.score || 0)); const dur = Math.max(1, Math.floor(+body.dur || 0));
          if (score < 1 || score > (body.game === "mina" ? 60000 : dur * 35 + 40) || dur > 36000) return json({ error: "Partida inválida" }, 400);
          const now = Date.now(); const who = { id: as, name: auth[as].name, color: auth[as].color, av: auth[as].av || 0 };
          const put = async (key) => { const prev = await store.get(key, { type: "json" }); if (!prev || score > (prev.score || 0)) { await store.setJSON(key, { ...who, score, apples: 0, at: now }); return true; } return false; };
          await put(`${W}${GP}/d/${dayOf(now)}/${as}`); await put(`${W}${GP}/w/${weekOf(now)}/${as}`); const newBest = await put(`${W}${GP}/a/${as}`);
          const t0 = (await store.get(`${W}${GP}/t/${as}`, { type: "json" })) || { games: 0 };
          const games = (t0.games || 0) + 1;
          await store.setJSON(`${W}${GP}/t/${as}`, { ...who, games, apples: games, score: games, at: now });
          const best = (await store.get(`${W}${GP}/a/${as}`, { type: "json" }))?.score || score;
          const { blobs } = await store.list({ prefix: `${W}${GP}/d/${dayOf(now)}/` });
          const day = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean).sort((x, y) => y.score - x.score);
          return json({ ok: true, best, newBest: newBest && score > 0, rankDay: day.findIndex((x) => x.id === as) + 1 });
        }
        const apples = Math.max(0, Math.floor(+body.apples || 0)); const score = Math.max(0, Math.floor(+body.score || 0)); const dur = Math.max(1, Math.floor(+body.dur || 0));
        if (score > apples * 5 || score < apples || apples > 50000 || dur < apples * 0.25) return json({ error: "Partida inválida" }, 400);
        const now = Date.now(); const who = { id: as, name: auth[as].name, color: auth[as].color, av: auth[as].av || 0 };
        const put = async (key) => { const prev = await store.get(key, { type: "json" }); if (!prev || score > (prev.score || 0)) { await store.setJSON(key, { ...who, score, apples, at: now }); return true; } return false; };
        await put(`${W}gs/d/${dayOf(now)}/${as}`); await put(`${W}gs/w/${weekOf(now)}/${as}`); const newBest = await put(`${W}gs/a/${as}`);
        const t0 = (await store.get(`${W}gs/t/${as}`, { type: "json" })) || { apples: 0, games: 0 };
        await store.setJSON(`${W}gs/t/${as}`, { ...who, apples: (t0.apples || 0) + apples, games: (t0.games || 0) + 1, score: (t0.apples || 0) + apples, at: now });
        const best = (await store.get(`${W}gs/a/${as}`, { type: "json" }))?.score || score;
        const { blobs } = await store.list({ prefix: `${W}gs/d/${dayOf(now)}/` });
        const day = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean).sort((x, y) => y.score - x.score);
        return json({ ok: true, best, newBest: newBest && score > 0, rankDay: day.findIndex((x) => x.id === as) + 1 });
      }
      case "pushtest": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        await pushTo(store, [as], url.origin, { title: "Avisos de Cinnavia listos", body: "Así te llegarán tus recordatorios, aunque la app esté cerrada.", url: "#/asistente", tag: "aldia-test" }, "");
        return json({ ok: true });
      }
      case "adminenter": {
        if (!admin) return json({ error: "Solo la cuenta de administración puede hacer esto" }, 403);
        const user = String(body.user || "").toLowerCase();
        const m = await meta(user);
        if (!m) return json({ error: "Ese usuario no existe" }, 404);
        await store.setJSON(`${W}audit/${Date.now()}-${user}`, { admin: adminId, user, at: Date.now() });
        return json({ ok: true, token: tokenFor(secret, user, m.v), user: { id: m.id, name: m.name, color: m.color } });
      }
      case "grestore": {
        const f = await forestOf(body.forest);
        if (!f || !(admin || (allowed(as) && f.members.includes(as)))) return json({ error: "No disponible" }, 403);
        const day = String(body.day || "");
        const snap = /^\d{4}-\d{2}-\d{2}$/.test(day) ? await store.get(`${W}gd/${f.id}/${day}`, { type: "json" }) : null;
        if (!snap) return json({ error: "Esa copia ya no existe" }, 404);
        // restauración segura: solo regresa lo que falta o se borró; nunca quita ni pisa lo nuevo
        let n = 0;
        for (const it of snap.items || []) {
          if (!it || it.deleted || !GTYPES.includes(it.type) || !/^[a-z0-9-]{4,60}$/i.test(it.id || "")) continue;
          const key = `${W}g/${f.id}/${it.type}/${it.id}`;
          const cur = await store.get(key, { type: "json" });
          if (!cur || cur.deleted) { await store.setJSON(key, { ...it, u: Date.now() }); n++; }
        }
        await bump(store, f.members);
        return json({ ok: true, restored: n });
      }
      case "freq": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const code = String(body.code || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const f = await forestOf(code);
        if (!f) return json({ error: "No encontramos ningún Bosque con ese código. Revísalo con quien te lo compartió." }, 404);
        if (f.members.includes(as)) return json({ error: `Ya eres parte de ${f.name}` }, 409);
        if (f.members.length >= 40) return json({ error: "Ese Bosque está lleno (40 integrantes)" }, 400);
        const at = Date.now();
        await store.setJSON(`${W}req/${f.id}/${as}`, { forest: f.id, user: as, name: auth[as].name, color: auth[as].color, at });
        await store.setJSON(`${W}myreq/${as}/${f.id}`, { forest: f.id, forestName: f.name, color: f.color, members: f.members.length, at });
        await bump(store, [as, ...f.members]);
        if (context?.waitUntil) context.waitUntil(pushTo(store, f.members, url.origin, { title: `${auth[as].name} quiere unirse a ${f.name}`, body: "Ábrelo para aceptar o rechazar la solicitud.", url: "#/grupo", tag: `req-${f.id}-${as}` }, ""));
        return json({ ok: true, forest: { id: f.id, name: f.name } });
      }
      case "fapprove": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const f = await memberOf(as, body.forest);
        if (!f) return json({ error: "Ya no eres parte de este Bosque" }, 403);
        const who = String(body.user || "").toLowerCase();
        const rq = await store.get(`${W}req/${f.id}/${who}`, { type: "json" });
        if (!rq) return json({ error: "Esa solicitud ya fue atendida" }, 404);
        if (body.accept && !f.members.includes(who)) {
          if (f.members.length >= 40) return json({ error: "El Bosque está lleno (40 integrantes)" }, 400);
          f.members.push(who); await store.setJSON(`${W}f/${f.id}`, f); await store.set(`${W}mf/${who}/${f.id}`, "1");
        }
        await store.delete(`${W}req/${f.id}/${who}`); await store.delete(`${W}myreq/${who}/${f.id}`);
        await bump(store, [who, ...f.members]);
        return json({ ok: true });
      }
      case "fcancel": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const fid = String(body.forest || "");
        if (!FID_RE.test(fid)) return json({ ok: true });
        await store.delete(`${W}req/${fid}/${as}`); await store.delete(`${W}myreq/${as}/${fid}`);
        const f = await forestOf(fid); await bump(store, [as, ...(f ? f.members : [])]);
        return json({ ok: true });
      }
      case "gitem": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const f = await memberOf(as, body.forest);
        if (!f) return json({ error: "Ya no eres parte de este Bosque" }, 403);
        const it = body.item || {};
        if (!GTYPES.includes(it.type) || !/^[a-z0-9-]{4,60}$/i.test(it.id || "")) return json({ error: "elemento inválido" }, 400);
        if (GUARD_TYPES.includes(it.type) && auth[as].role !== "guardian") return json({ error: "Solo el Guardián del Bosque puede hacer esto" }, 403);
        const key = `${W}g/${f.id}/${it.type}/${it.id}`;
        const prev = await store.get(key, { type: "json" });
        const clean = { ...it, by: auth[as].name, byId: prev?.byId || as, at: +it.at || Date.now(), u: Date.now() };
        for (const k of ["title", "desc", "text", "subject", "link", "tag", "owner", "name"]) if (k in clean) clean[k] = clip(clean[k], k === "desc" || k === "text" ? 4000 : 300);
        if (clean.type === "board") {
          clean.kind = ["note", "link", "file", "draft", "meta", "comment", "todo", "titulo", "fecha", "pregunta", "pintura", "tinta"].includes(it.kind) ? it.kind : "note";
          clean.parent = /^[a-z0-9-]{2,60}$/i.test(it.parent || "") ? it.parent : ""; clean.pa = /^[a-z0-9-]{2,60}$/i.test(it.pa || "") ? it.pa : ""; clean.act = clip(it.act, 20); clean.from = clip(it.from, 20);
          clean.x = Math.max(0, Math.min(1, +it.x || 0)); clean.y = Math.max(0, Math.min(12, +it.y || 0)); clean.ep = Math.max(0, Math.min(9999, Math.floor(+it.ep || 0)));
          if (clean.kind === "meta") { clean.epoch = Math.max(0, Math.min(9999, Math.floor(+it.epoch || 0))); clean.archives = Array.isArray(it.archives) ? it.archives.slice(-40).map((x) => ({ ep: Math.floor(+x.ep || 0), at: +x.at || 0, by: clip(x.by, 40), n: Math.floor(+x.n || 0), title: clip(x.title, 60) })) : []; }
          clean.sz = ["s", "m", "l"].includes(it.sz) ? it.sz : "m"; clean.font = ["sans", "serif", "mono"].includes(it.font) ? it.font : "sans"; clean.pin = !!it.pin; clean.done = !!it.done; clean.due = /^\d{4}-\d{2}-\d{2}$/.test(it.due || "") ? it.due : ""; clean.bg = ["papel", "cuadricula", "puntos", "rayas"].includes(it.bg) ? it.bg : "papel";
          clean.tone = clip(it.tone, 12); clean.file = clip(it.file, 120); clean.size = Math.max(0, Math.min(5e6, +it.size || 0)); clean.archived = !!it.archived; clean.fileId = /^[a-z0-9-]{4,60}$/i.test(it.fileId || "") ? it.fileId : "";
        }
        if (clean.type === "board" && (clean.kind === "pintura" || clean.kind === "tinta")) { clean.strokes = cleanStrokes(it.strokes); clean.pbg = ["liso", "cuadricula", "rayas", "puntos", "oscuro"].includes(it.pbg) ? it.pbg : "liso"; clean.pw = 800; clean.ph = 600; if (clean.kind === "tinta") { clean.x = 0; clean.y = 0; } }
        else if (clean.type === "board") delete clean.strokes;
        if (clean.type === "tpl") {
          clean.steps = Array.isArray(it.steps) ? it.steps.slice(0, 30).map((x) => ({ text: clip(x && x.text, 120), min: Math.max(0, Math.min(600, +(x && x.min) || 0)) })) : [];
          clean.kind = clip(it.kind, 20); clean.est = Math.max(0, Math.min(600, +it.est || 0));
        }
        if (clean.type === "book") {
          if (prev && prev.byId !== as && auth[as].role !== "guardian") return json({ error: "Solo quien subió el libro puede cambiarlo" }, 403);
          clean.author = clip(it.author, 120); clean.fileId = /^[a-z0-9-]{4,60}$/i.test(it.fileId || "") ? it.fileId : (prev?.fileId || "");
          clean.pages = Math.max(0, Math.min(5000, Math.floor(+it.pages || 0))); clean.size = Math.max(0, Math.min(5e6, +it.size || 0));
          clean.color = clip(it.color, 12); clean.cat = clip(it.cat, 30); clean.deleted = !!it.deleted;
          if (!clean.fileId && !clean.deleted) return json({ error: "Falta el archivo del libro" }, 400);
        }
        if (clean.type === "aviso") { clean.pin = !!it.pin; clean.due = /^\d{4}-\d{2}-\d{2}$/.test(it.due || "") ? it.due : ""; }
        if (clean.type === "asist") {
          clean.date = /^\d{4}-\d{2}-\d{2}$/.test(it.date || "") ? it.date : dayOf(Date.now());
          clean.marks = {}; for (const m of f.members) { const v = it.marks && it.marks[m]; if (["p", "f", "r", "j"].includes(v)) clean.marks[m] = v; }
        }
        if (clean.type === "eval") {
          clean.date = /^\d{4}-\d{2}-\d{2}$/.test(it.date || "") ? it.date : dayOf(Date.now());
          clean.max = Math.max(1, Math.min(1000, +it.max || 10)); clean.weight = Math.max(0, Math.min(100, +it.weight || 0));
          clean.scores = {}; for (const m of f.members) { const v = it.scores && it.scores[m]; if (v !== null && v !== undefined && v !== "" && isFinite(+v)) clean.scores[m] = Math.max(0, Math.min(clean.max, Math.round(+v * 100) / 100)); }
        }
        // copia diaria del Bosque (una por día, 45 días): se toma antes del primer cambio del día
        const today = dayOf(Date.now());
        if ((await store.get(`${W}gdm/${f.id}`)) !== today) {
          const gl = await store.list({ prefix: `${W}g/${f.id}/` });
          const items = (await Promise.all(gl.blobs.slice(0, 2000).map((x) => store.get(x.key, { type: "json" })))).filter(Boolean);
          if (items.length) { await store.setJSON(`${W}gd/${f.id}/${today}`, { at: Date.now(), items }, { onlyIfNew: true }); await store.set(`${W}gdm/${f.id}`, today); }
          const dl = await store.list({ prefix: `${W}gd/${f.id}/` });
          const dks = dl.blobs.map((b) => b.key).sort();
          for (const k of dks.slice(0, Math.max(0, dks.length - 45))) await store.delete(k);
        }
        await store.setJSON(key, clean);
        await bump(store, f.members);
        if ((!prev || (clean.type === "focus" && !clean.joined && (prev.deleted || prev.start !== clean.start))) && !clean.deleted && !(clean.type === "focus" && clean.joined) && ["task", "team", "idea", "focus", "tpl", "aviso", "book"].includes(clean.type) && !(clean.type === "focus" && clean.ghost)) {
          const what = clean.type === "task" ? "subió una tarea" : clean.type === "focus" ? "empezó a concentrarse: ¡únete a la sala de enfoque!" : clean.type === "aviso" ? "publicó un aviso" : clean.type === "tpl" ? "compartió una plantilla de estudio" : clean.type === "book" ? "agregó un libro a la biblioteca" : clean.type === "team" ? "creó un trabajo en equipo" : "compartió una idea";
          const payload = { title: `${f.name} · ${clean.by} ${what}`, body: clip(clean.title || clean.text, 140), url: "#/grupo", tag: `g-${clean.id}` };
          const job = pushTo(store, f.members.filter((m) => m !== as), url.origin, payload, clip(body.device, 40));
          if (context?.waitUntil) context.waitUntil(job); else await job;
        }
        return json({ ok: true, u: clean.u });
      }
      case "lobby": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const key = `${W}lobby/${as}`;
        if (body.leave) { await store.delete(key); await bump(store, ["_lobby"]); return json({ ok: true }); }
        const now = Date.now(); const end = Math.max(now + 1000, Math.min(+body.end || 0, now + 31 * 60000));
        await store.setJSON(key, { id: as, name: auth[as].name, color: auth[as].color, ghost: !!body.ghost, start: now, end });
        await bump(store, ["_lobby"]);
        return json({ ok: true });
      }
      case "gimg": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const f = await memberOf(as, body.forest);
        if (!f) return json({ error: "Ya no eres parte de este Bosque" }, 403);
        const d = String(body.data || "");
        const isPdf = /^data:application\/pdf;base64,[A-Za-z0-9+/=]+$/.test(d);
        if (!(isPdf || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(d)) || d.length > (isPdf ? 2900000 : 900000)) return json({ error: isPdf ? "El PDF es muy pesado: máximo 2 MB" : "La foto es muy grande o no es válida" }, 400);
        if (!/^[a-z0-9-]{4,60}$/i.test(body.id || "")) return json({ error: "elemento inválido" }, 400);
        await store.set(`${W}gi/${f.id}/${body.id}`, d);
        await bump(store, f.members);
        return json({ ok: true });
      }
      case "gsub": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const s = body.subscription;
        if (!s || typeof s.endpoint !== "string" || !s.keys) return json({ error: "suscripción inválida" }, 400);
        const id = createHash("sha256").update(s.endpoint).digest("hex").slice(0, 32);
        await store.setJSON(`${W}push/${as}/${id}`, { subscription: s, device: clip(body.device, 40), at: Date.now() });
        return json({ ok: true });
      }
      default:
        return json({ error: "tipo desconocido" }, 400);
    }
  } catch (e) {
    console.error("sync error", e);
    return json({ error: "error del servidor" }, 500);
  }
};

/* ================= Avisos programados (llegan aunque la app esté cerrada) ================= */
const AGENT = {
  amable: {
    eve: (t) => [`Mañana se entrega: ${t}`, "Si avanzas un poco hoy, mañana será tranquilo."],
    dia: (t) => [`Hoy se entrega: ${t}`, "Tú puedes. Ábrela y da el primer paso."],
    pre: (t, m) => [`En ${m}: ${t}`, "Último empujón. Ya casi."],
    late: (t) => [`Se quedó pendiente: ${t}`, "No pasa nada: entrégala hoy y tu árbol se recupera."],
    custom: (t) => [`Recordatorio: ${t}`, "Lo apartaste para este momento."],
  },
  coach: {
    eve: (t, m, p) => [`Mañana vence ${t}`, p ? `Llevas el ${p}%. Hoy se termina, sin excusas.` : "Llevas el 0%. Empieza hoy. Nada de “ahorita”."],
    dia: (t, m, p) => [`HOY: ${t}`, p ? `Vas en ${p}%. Cierra el celular y termínala.` : "Llevas el 0%. Apaga Instagram ya y ponte a trabajar."],
    pre: (t, m, p) => [`Te quedan ${m} para ${t}`, p ? `Vas en ${p}%. Concéntrate, sin distracciones.` : "Y llevas el 0%. Modo bestia: AHORA."],
    late: (t) => [`Vencida: ${t}`, "Ya pasó la fecha. Entrégala hoy, primero esto y luego lo demás."],
    custom: (t) => [`Es la hora: ${t}`, "Lo prometiste. Cumple."],
  },
  meme: {
    eve: (t) => [`${t} mañana`, "Tú: “ahorita la hago”. También tú, mañana a las 11:58 p.m.: 😐"],
    dia: (t) => [`${t} es HOY`, "Plot twist: la tarea no se va a hacer sola. Lo checamos."],
    pre: (t, m) => [`${m} para ${t}`, "Esto no es un simulacro. Bueno, sí es un aviso, pero tú me entiendes."],
    late: (t) => [`${t} sigue ahí…`, "Mirándote. Esperándote. Como la ropa en la silla."],
    custom: (t) => [`Ding ding: ${t}`, "Yo solo vengo a recordarte que esto existe. Ok bye."],
  },
  estratega: {
    eve: (t, m, p, e) => [`${t}: mañana`, `Si empiezas hoy, necesitas unos ${e} min. Mañana serían más, con prisa.`],
    dia: (t, m, p, e) => [`${t}: hoy`, `Tiempo estimado: ${e} min. Mejor bloque: ahora.`],
    pre: (t, m, p, e) => [`${t}: faltan ${m}`, `Avance ${p}%. Estimado restante: ${Math.max(5, Math.round(e * (1 - p / 100)))} min.`],
    late: (t, m, p, e) => [`${t}: vencida`, `Recuperable hoy con unos ${e} min.`],
    custom: (t) => [`${t}`, "Bloque programado."],
  },
};
function localNow(tz, at) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const o = Object.fromEntries(f.formatToParts(new Date(at)).map((x) => [x.type, x.value]));
  return { day: `${o.year}-${o.month}-${o.day}`, min: (+o.hour) * 60 + (+o.minute) };
}
const addDayISO = (d, n) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const fmtM = (m) => (m >= 60 ? `${Math.round(m / 60)} h` : `${m} min`);
export async function runAvisos(store, origin, at = Date.now()) {
  const subs = (await store.list({ prefix: `${W}push/` })).blobs.map((b) => b.key.split("/")[2]);
  const users = [...new Set(subs)].filter((u) => USER_RE.test(u));
  let sent = 0;
  for (const u of users) {
    const doc = await store.get(`${W}p/${u}`, { type: "json" }); const d = doc?.data; if (!d) continue;
    const st = d.settings || {};
    if (st.notify === false || st.pushOff) continue;
    let tz = st.tz || "America/Mexico_City"; try { new Intl.DateTimeFormat("en", { timeZone: tz }); } catch { tz = "America/Mexico_City"; }
    const { day, min } = localNow(tz, at);
    const style = AGENT[st.agent] || AGENT.amable;
    const before = Math.max(10, Math.min(1440, +st.remindBefore || 60));
    const out = [];
    for (const t of d.tasks || []) {
      if (!t || t.done || !t.title) continue;
      const steps = t.steps || []; const p = steps.length ? Math.round((100 * steps.filter((s) => s.done).length) / steps.length) : 0;
      const e = Math.max(15, Math.min(240, +t.estimate || 45));
      const title = String(t.title).slice(0, 80);
      if (t.remind && !t.remindShown) {
        const [rd, rt] = String(t.remind).split("T"); const [rh, rm] = (rt || "00:00").split(":").map(Number);
        if (rd === day && min >= rh * 60 + rm && min < rh * 60 + rm + 120) out.push({ k: `custom-${t.remind}`, id: t.id, m: style.custom(title, 0, p, e) });
      }
      if (!t.due) continue;
      if (t.due === addDayISO(day, 1) && min >= 19 * 60 && min < 22 * 60) out.push({ k: `eve-${t.due}`, id: t.id, m: style.eve(title, 0, p, e) });
      if (t.due === day && min >= 7 * 60 && min < 12 * 60) out.push({ k: `dia-${t.due}`, id: t.id, m: style.dia(title, 0, p, e) });
      if (t.due === day && t.time) {
        const [h, mm] = t.time.split(":").map(Number); const left = h * 60 + mm - min;
        if (left > 0 && left <= before) out.push({ k: `pre-${t.due}-${t.time}`, id: t.id, m: style.pre(title, fmtM(left), p, e) });
      }
      if (t.due === addDayISO(day, -1) && min >= 9 * 60 && min < 13 * 60) out.push({ k: `late-${t.due}`, id: t.id, m: style.late(title, 0, p, e) });
    }
    // recordatorios propios (Tareas > Recordatorios): hora exacta, aviso previo y repetición
    for (const r of (Array.isArray(d.recs) ? d.recs : []).slice(0, 60)) {
      if (!r || !r.title || !r.date || !/^\d{4}-\d{2}-\d{2}$/.test(r.date) || day < r.date) continue;
      const rep = r.repeat || "no"; if (r.done && rep === "no") continue;
      const wd = new Date(day + "T12:00:00Z").getUTCDay(), w0 = new Date(r.date + "T12:00:00Z").getUTCDay();
      const occurs = rep === "dia" || (rep === "laboral" && wd >= 1 && wd <= 5) || (rep === "semana" && wd === w0) || (rep === "no" && day === r.date);
      if (!occurs || (r.skipUntil && rep !== "no" && day <= r.skipUntil)) continue;
      const [rh, rm] = String(r.time || "08:00").split(":").map(Number); const at0 = rh * 60 + rm - Math.max(0, Math.min(1440, +r.before || 0));
      if (at0 < 0 || min < at0 || min >= at0 + 120) continue;
      const lead = +r.before ? `Es a las ${String(rh).padStart(2, "0")}:${String(rm).padStart(2, "0")}.` : "Es ahora.";
      out.push({ k: `rc-${day}`, id: String(r.id).slice(0, 40), m: [String(r.title).slice(0, 80), lead], url: "#/recordatorios" });
    }
    // partes de trabajos en equipo atrasadas (aviso discreto solo a quien la tiene)
    for (const b of (await store.list({ prefix: `${W}mf/${u}/` })).blobs) {
      const fid = b.key.split("/").pop();
      for (const x of (await store.list({ prefix: `${W}g/${fid}/part/` })).blobs.slice(0, 300)) {
        const pt = await store.get(x.key, { type: "json" });
        if (!pt || pt.deleted || pt.done || pt.ownerId !== u || !pt.dueP || pt.dueP >= day || min < 10 * 60 || min > 20 * 60) continue;
        out.push({ k: `part-${pt.id}-${pt.dueP}`, id: pt.id, m: [`Tu parte va atrasada: ${String(pt.text).slice(0, 60)}`, "Tu equipo cuenta contigo. Si se te complicó, pide ayuda o pide que la reasignen."], url: "#/grupo" });
      }
    }
    let n = 0;
    for (const o of out) {
      if (n >= 4) break;
      const key = `${W}sent/${u}/${o.id}-${o.k}`;
      const r = await store.set(key, String(at), { onlyIfNew: true });
      if (r && r.modified === false) continue;
      await pushTo(store, [u], origin, { title: o.m[0], body: o.m[1], url: o.url || "#/hoy", tag: `aldia-${o.id}-${o.k.split("-")[0]}` }, "");
      n++; sent++;
    }
  }
  return { users: users.length, sent };
}

export const config = { path: "/api/sync" };
