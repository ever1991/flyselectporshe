import { createClient } from '@supabase/supabase-js';

// Mantiene "despierto" el proyecto Supabase free (QMKT), que se pausa
// tras ~1 semana sin actividad. Lo invoca el Vercel Cron a diario.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'fly_select' } }
);

export default async function handler(req, res) {
  // Si existe CRON_SECRET, exigir el header que Vercel Cron envía automáticamente.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Consulta mínima (solo count, sin traer filas) que registra actividad en la DB.
  const { count, error } = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error('Keepalive error', error);
    return res.status(500).json({ ok: false, error: error.message });
  }

  return res.status(200).json({ ok: true, count, ts: new Date().toISOString() });
}
