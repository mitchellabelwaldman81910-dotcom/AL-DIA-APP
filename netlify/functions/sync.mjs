// Al Día — nube compartida para Mitchell y Mel.
// Cada "espacio" (código secreto) guarda un documento por usuario y los mensajes entre ellos.
import { getStore } from "@netlify/blobs";

const PROFILES = ["mitchell", "mel"];
const MAX = 3 * 1024 * 1024;
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  const url = new URL(req.url);
  const space = (url.searchParams.get("space") || "").toUpperCase();
  if (!/^[A-Z0-9-]{14,40}$/.test(space)) return json({ error: "código inválido" }, 400);
  const store = getStore({ name: "aldia", consistency: "strong" });
  const base = `s/${space}/`;

  try {
    if (req.method === "GET") {
      const profiles = {};
      for (const p of PROFILES) {
        const d = await store.get(`${base}p/${p}`, { type: "json" });
        if (d) profiles[p] = d;
      }
      const { blobs } = await store.list({ prefix: `${base}l/` });
      const letters = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
      return json({ ok: true, profiles, letters, now: Date.now() });
    }

    if (req.method === "PUT" || req.method === "POST") {
      const text = await req.text();
      if (text.length > MAX) return json({ error: "demasiado grande" }, 413);
      const body = JSON.parse(text);
      if (body.kind === "profile") {
        if (!PROFILES.includes(body.profile) || !body.data || typeof body.data !== "object") return json({ error: "datos inválidos" }, 400);
        const at = Date.now();
        await store.setJSON(`${base}p/${body.profile}`, { at, device: String(body.device || "").slice(0, 40), data: body.data });
        return json({ ok: true, at });
      }
      if (body.kind === "letter") {
        const l = body.letter || {};
        if (!/^[a-z0-9]{6,30}$/i.test(l.id || "") || !PROFILES.includes(l.from) || !PROFILES.includes(l.to)) return json({ error: "mensaje inválido" }, 400);
        const clean = { id: l.id, from: l.from, to: l.to, text: String(l.text || "").slice(0, 4000), at: +l.at || Date.now(), read: !!l.read };
        await store.setJSON(`${base}l/${l.id}`, clean);
        return json({ ok: true });
      }
      return json({ error: "tipo desconocido" }, 400);
    }
    return json({ error: "método no permitido" }, 405);
  } catch (e) {
    console.error("sync error", e);
    return json({ error: "error del servidor" }, 500);
  }
};

export const config = { path: "/api/sync" };
