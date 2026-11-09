// Al Día — nube compartida.
// Perfiles personales (Mitchell, Mel) y el Grupo 512, con contraseñas verificadas aquí en el servidor.
// Nadie puede leer ni escribir un perfil con contraseña sin haber iniciado sesión en él.
import { getStore } from "@netlify/blobs";
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual, createHash } from "node:crypto";
import webpush from "web-push";

const PERSONAL = ["mitchell", "mel"];
const GROUP = "g512";
const PROFILES = [...PERSONAL, GROUP];
const GTYPES = ["task", "team", "join", "part", "post", "idea", "like"];
const MAX = 3 * 1024 * 1024;
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const clip = (v, n) => String(v ?? "").slice(0, n);

async function getSecret(store, base) {
  let s = await store.get(`${base}secret`);
  if (!s) {
    const fresh = randomBytes(32).toString("hex");
    await store.set(`${base}secret`, fresh, { onlyIfNew: true });
    s = await store.get(`${base}secret`);
  }
  return s;
}
const tokenFor = (secret, profile, v) => createHmac("sha256", secret).update(`${profile}:${v}`).digest("hex");
const hashPw = (pw, salt) => pbkdf2Sync(String(pw), salt, 120000, 32, "sha256").toString("hex");
const safeEq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };

async function vapid(store) {
  let k = await store.get("vapid", { type: "json" });
  if (!k) {
    const keys = webpush.generateVAPIDKeys();
    await store.setJSON("vapid", keys, { onlyIfNew: true });
    k = await store.get("vapid", { type: "json" });
  }
  return k;
}

async function pushGroup(store, base, origin, payload, exceptDevice) {
  try {
    const keys = await vapid(store);
    webpush.setVapidDetails(origin || "https://tareasmitchell.netlify.app", keys.publicKey, keys.privateKey);
    const { blobs } = await store.list({ prefix: `${base}push/` });
    await Promise.all(blobs.map(async (b) => {
      const sub = await store.get(b.key, { type: "json" });
      if (!sub || sub.device === exceptDevice) return;
      try { await webpush.sendNotification(sub.subscription, JSON.stringify(payload), { TTL: 86400 }); }
      catch (e) { if (e.statusCode === 404 || e.statusCode === 410) await store.delete(b.key); }
    }));
  } catch (e) { console.error("push error", e); }
}

export default async (req, context) => {
  const url = new URL(req.url);
  const store = getStore({ name: "aldia", consistency: "strong" });

  if (url.searchParams.get("kind") === "vapid") {
    const k = await vapid(store);
    return json({ publicKey: k.publicKey });
  }

  const space = (url.searchParams.get("space") || "").toUpperCase();
  if (!/^[A-Z0-9-]{14,40}$/.test(space)) return json({ error: "código inválido" }, 400);
  const base = `s/${space}/`;

  try {
    const secret = await getSecret(store, base);
    let tokens = {};
    try { tokens = JSON.parse(req.headers.get("x-aldia-tokens") || "{}"); } catch { tokens = {}; }
    const authMeta = {};
    for (const p of PROFILES) authMeta[p] = await store.get(`${base}auth/${p}`, { type: "json" });
    const hasPw = Object.fromEntries(PROFILES.map((p) => [p, !!authMeta[p]]));
    const allowed = (p) => {
      if (!PROFILES.includes(p)) return false;
      if (p === GROUP && !authMeta[p]) return false; // el grupo siempre requiere contraseña
      if (!authMeta[p]) return true;
      return !!tokens[p] && safeEq(tokens[p], tokenFor(secret, p, authMeta[p].v));
    };

    if (req.method === "GET") {
      const out = { ok: true, now: Date.now(), hasPw, authorized: PROFILES.filter(allowed), profiles: {}, letters: [], presence: [], group: null };
      for (const p of PERSONAL) {
        if (!allowed(p)) continue;
        const d = await store.get(`${base}p/${p}`, { type: "json" });
        if (d) out.profiles[p] = d;
      }
      const okPersonal = PERSONAL.filter(allowed);
      if (okPersonal.length) {
        const { blobs } = await store.list({ prefix: `${base}l/` });
        const all = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
        out.letters = all.filter((l) => okPersonal.includes(l.to) || okPersonal.includes(l.from));
        const pres = await store.list({ prefix: `${base}presence/` });
        const now = Date.now();
        for (const b of pres.blobs) {
          const v = await store.get(b.key, { type: "json" });
          if (v && now - v.at < 60000 && okPersonal.includes(v.viewing)) out.presence.push(v);
        }
      }
      if (allowed(GROUP)) {
        const { blobs } = await store.list({ prefix: `${base}g/` });
        const items = (await Promise.all(blobs.slice(0, 1500).map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
        out.group = { items };
      }
      return json(out);
    }

    if (req.method !== "POST" && req.method !== "PUT") return json({ error: "método no permitido" }, 405);
    const text = await req.text();
    if (text.length > MAX) return json({ error: "demasiado grande" }, 413);
    const body = JSON.parse(text);

    switch (body.kind) {
      case "login": {
        const p = body.profile; const m = authMeta[p];
        if (!m) return json({ error: "Este usuario todavía no tiene contraseña" }, 400);
        if (!safeEq(hashPw(body.password, m.salt), m.hash)) return json({ error: "Contraseña incorrecta" }, 401);
        return json({ ok: true, token: tokenFor(secret, p, m.v) });
      }
      case "setpw": {
        const p = body.profile;
        if (!PROFILES.includes(p)) return json({ error: "usuario inválido" }, 400);
        if (authMeta[p] && !allowed(p)) return json({ error: "Inicia sesión primero" }, 401);
        if (String(body.password || "").length < 4) return json({ error: "La contraseña debe tener al menos 4 caracteres" }, 400);
        // crear el grupo exige haber entrado como Mitchell o Mel
        if (p === GROUP && !authMeta[p] && !PERSONAL.some((x) => authMeta[x] && allowed(x))) return json({ error: "Para crear el grupo, primero pon contraseña a tu usuario" }, 403);
        const salt = randomBytes(16).toString("hex");
        const v = (authMeta[p]?.v || 0) + 1;
        await store.setJSON(`${base}auth/${p}`, { salt, hash: hashPw(body.password, salt), v });
        return json({ ok: true, token: tokenFor(secret, p, v) });
      }
      case "profile": {
        if (!PERSONAL.includes(body.profile) || !body.data || typeof body.data !== "object") return json({ error: "datos inválidos" }, 400);
        if (!allowed(body.profile)) return json({ error: "Inicia sesión primero" }, 401);
        const at = Date.now();
        await store.setJSON(`${base}p/${body.profile}`, { at, device: clip(body.device, 40), data: body.data });
        return json({ ok: true, at });
      }
      case "letter": {
        const l = body.letter || {};
        if (!/^[a-z0-9]{6,30}$/i.test(l.id || "") || !PERSONAL.includes(l.from) || !PERSONAL.includes(l.to)) return json({ error: "mensaje inválido" }, 400);
        if (!allowed(l.from) && !allowed(l.to)) return json({ error: "Inicia sesión primero" }, 401);
        await store.setJSON(`${base}l/${l.id}`, { id: l.id, from: l.from, to: l.to, text: clip(l.text, 4000), at: +l.at || Date.now(), read: !!l.read });
        return json({ ok: true });
      }
      case "presence": {
        if (!PERSONAL.includes(body.viewing) || !PERSONAL.includes(body.viewer) || body.viewer === body.viewing) return json({ error: "presencia inválida" }, 400);
        if (!allowed(body.viewing)) return json({ error: "Inicia sesión primero" }, 401);
        await store.setJSON(`${base}presence/${body.viewing}-${body.viewer}`, { viewer: body.viewer, viewing: body.viewing, at: Date.now() });
        return json({ ok: true });
      }
      case "gitem": {
        if (!allowed(GROUP)) return json({ error: "Inicia sesión en el grupo" }, 401);
        const it = body.item || {};
        if (!GTYPES.includes(it.type) || !/^[a-z0-9-]{4,60}$/i.test(it.id || "")) return json({ error: "elemento inválido" }, 400);
        const key = `${base}g/${it.type}/${it.id}`;
        const prev = await store.get(key, { type: "json" });
        const clean = { ...it, by: clip(it.by, 40), at: +it.at || Date.now(), u: Date.now() };
        for (const k of ["title", "desc", "text", "subject", "link", "tag", "owner"]) if (k in clean) clean[k] = clip(clean[k], k === "desc" || k === "text" ? 4000 : 300);
        await store.setJSON(key, clean);
        if (!prev && !clean.deleted && ["task", "team", "idea"].includes(clean.type)) {
          const what = clean.type === "task" ? "subió una tarea" : clean.type === "team" ? "creó un trabajo en equipo" : "compartió una idea";
          const payload = { title: `Grupo 512 · ${clean.by || "Alguien"} ${what}`, body: clip(clean.title || clean.text, 140), url: "#/grupo", tag: `g-${clean.id}` };
          const job = pushGroup(store, base, url.origin, payload, clip(body.device, 40));
          if (context?.waitUntil) context.waitUntil(job); else await job;
        }
        return json({ ok: true, u: clean.u });
      }
      case "gsub": {
        if (!allowed(GROUP)) return json({ error: "Inicia sesión en el grupo" }, 401);
        const s = body.subscription;
        if (!s || typeof s.endpoint !== "string" || !s.keys) return json({ error: "suscripción inválida" }, 400);
        const id = createHash("sha256").update(s.endpoint).digest("hex").slice(0, 32);
        await store.setJSON(`${base}push/${id}`, { subscription: s, device: clip(body.device, 40), name: clip(body.name, 40), at: Date.now() });
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
