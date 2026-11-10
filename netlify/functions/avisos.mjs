// Cinnavia — avisos programados: cada 10 minutos revisa las entregas de cada persona y le manda la notificación
// a su teléfono aunque la app esté cerrada (estilo de su asistente: amable, coach, meme o estratega).
import { getStore } from "@netlify/blobs";
import { runAvisos } from "./sync.mjs";

export default async () => {
  const store = getStore({ name: "aldia", consistency: "strong" });
  const r = await runAvisos(store, process.env.URL || "https://tareasmitchell.netlify.app");
  console.log("avisos", r);
  return new Response(JSON.stringify(r), { headers: { "content-type": "application/json" } });
};

export const config = { schedule: "*/10 * * * *" };
