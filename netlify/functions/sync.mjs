// Al Día — nube compartida v7.
// Cuentas propias (cualquiera crea su usuario con contraseña), árbol de VIDA, Bosques colaborativos y rankings.
// Las contraseñas se verifican aquí en el servidor: nadie lee ni escribe lo de otra persona sin su contraseña.
import { getStore } from "@netlify/blobs";
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual, createHash } from "node:crypto";
import webpush from "web-push";

const W = "w/";
const GTYPES = ["task", "team", "join", "part", "post", "idea", "like", "done", "focus", "tpl"];
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
const newRev = () => `${Date.now().toString(36)}${randomBytes(2).toString("hex")}`;
async function bump(store, users) {
  const r = newRev();
  await Promise.all([...new Set(users)].filter((u) => u && (USER_RE.test(String(u)) || u === "_lobby")).map((u) => store.set(revKey(u), r)));
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

    const forestOf = async (fid) => (FID_RE.test(String(fid)) ? await store.get(`${W}f/${fid}`, { type: "json" }) : null);
    const memberOf = async (u, fid) => { const f = await forestOf(fid); return f && f.members.includes(u) ? f : null; };
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
      if (kindQ === "watch") {
        if (!authList.length) return json({ error: "Inicia sesión primero" }, 401);
        const since = url.searchParams.get("since") || "";
        const sinceL = url.searchParams.get("lob");
        const wantL = sinceL !== null;
        const read = async () => {
          const rs = await Promise.all([...authList].sort().map((u) => store.get(revKey(u))));
          const l = wantL ? await store.get(revKey("_lobby")) : "";
          return { rev: rs.map((x) => x || "0").join("|"), lob: l || "0" };
        };
        const t0 = Date.now(); let cur = await read();
        while (since && cur.rev === since && (!wantL || cur.lob === sinceL) && Date.now() - t0 < 7000) {
          await new Promise((r) => setTimeout(r, 400));
          cur = await read();
        }
        return json({ ok: true, rev: cur.rev, lob: cur.lob, changed: !!since && (cur.rev !== since || (wantL && cur.lob !== sinceL)) });
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
        if (!(await memberOf(as, fid)) || !/^[a-z0-9-]{4,60}$/i.test(id || "")) return json({ error: "No disponible" }, 403);
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
        out.users[u] = { name: auth[u].name, color: auth[u].color };
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
          if (v && now - v.at < 60000 && authList.includes(v.viewing)) out.presence.push(v);
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
            const items = (await Promise.all(gl.blobs.slice(0, 1500).map((x) => store.get(x.key, { type: "json" })))).filter(Boolean);
            out.forests[fid] = { meta: f, items };
          }
          const iv = await store.list({ prefix: `${W}inv/${u}/` });
          for (const b of iv.blobs) { const v = await store.get(b.key, { type: "json" }); if (v) out.invites.push(v); }
        }
        // nombres de todos los integrantes de mis bosques
        const names = {};
        for (const f of Object.values(out.forests)) for (const m of f.meta.members) names[m] = null;
        for (const m of Object.keys(names)) { const a = await meta(m); names[m] = a ? { name: a.name, color: a.color } : { name: m, color: COLORS[0] }; }
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
        const rec = { id: user, name, color, salt, hash: hashPw(body.password, salt), v: 1, at: Date.now() };
        await store.setJSON(`${W}a/${user}`, rec, { onlyIfNew: true });
        const again = await store.get(`${W}a/${user}`, { type: "json" });
        if (!again || again.salt !== salt) return json({ error: "Ese usuario ya existe. Prueba con otro" }, 409);
        return json({ ok: true, token: tokenFor(secret, user, 1), user: { id: user, name, color } });
      }
      case "login": {
        const user = String(body.user || "").toLowerCase();
        const m = await meta(user);
        if (!m || !safeEq(hashPw(body.password, m.salt), m.hash)) return json({ error: "Usuario o contraseña incorrectos" }, 401);
        return json({ ok: true, token: tokenFor(secret, user, m.v), user: { id: m.id, name: m.name, color: m.color } });
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
        const at = Date.now();
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
        await store.setJSON(`${W}l/${l.id}`, { id: l.id, from: l.from, to: l.to, text: clip(l.text, 4000), at: +l.at || Date.now(), read: !!l.read });
        await bump(store, [l.from, l.to]);
        return json({ ok: true });
      }
      case "presence": {
        if (!USER_RE.test(String(body.viewing)) || !USER_RE.test(String(body.viewer)) || body.viewer === body.viewing) return json({ error: "presencia inválida" }, 400);
        if (!allowed(body.viewing)) return json({ error: "Inicia sesión primero" }, 401);
        await store.setJSON(`${W}presence/${body.viewing}-${body.viewer}`, { viewer: body.viewer, viewing: body.viewing, at: Date.now() });
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
      case "gitem": {
        if (!allowed(as)) return json({ error: "Inicia sesión primero" }, 401);
        const f = await memberOf(as, body.forest);
        if (!f) return json({ error: "Ya no eres parte de este Bosque" }, 403);
        const it = body.item || {};
        if (!GTYPES.includes(it.type) || !/^[a-z0-9-]{4,60}$/i.test(it.id || "")) return json({ error: "elemento inválido" }, 400);
        const key = `${W}g/${f.id}/${it.type}/${it.id}`;
        const prev = await store.get(key, { type: "json" });
        const clean = { ...it, by: auth[as].name, byId: prev?.byId || as, at: +it.at || Date.now(), u: Date.now() };
        for (const k of ["title", "desc", "text", "subject", "link", "tag", "owner", "name"]) if (k in clean) clean[k] = clip(clean[k], k === "desc" || k === "text" ? 4000 : 300);
        if (clean.type === "tpl") {
          clean.steps = Array.isArray(it.steps) ? it.steps.slice(0, 30).map((x) => ({ text: clip(x && x.text, 120), min: Math.max(0, Math.min(600, +(x && x.min) || 0)) })) : [];
          clean.kind = clip(it.kind, 20); clean.est = Math.max(0, Math.min(600, +it.est || 0));
        }
        await store.setJSON(key, clean);
        await bump(store, f.members);
        if ((!prev || (clean.type === "focus" && !clean.joined && (prev.deleted || prev.start !== clean.start))) && !clean.deleted && !(clean.type === "focus" && clean.joined) && ["task", "team", "idea", "focus", "tpl"].includes(clean.type) && !(clean.type === "focus" && clean.ghost)) {
          const what = clean.type === "task" ? "subió una tarea" : clean.type === "focus" ? "empezó a concentrarse: ¡únete a la sala de enfoque!" : clean.type === "tpl" ? "compartió una plantilla de estudio" : clean.type === "team" ? "creó un trabajo en equipo" : "compartió una idea";
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
        if (!f) return json({ error: "Ya no eres parte de este Salón" }, 403);
        const d = String(body.data || "");
        if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(d) || d.length > 900000) return json({ error: "La foto es muy grande o no es válida" }, 400);
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

export const config = { path: "/api/sync" };
