import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'fly_select' } }
);
const resend = new Resend(process.env.RESEND_API_KEY);

const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const clean = (v, max = 500) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';
const cleanArr = (v, max = 20) =>
  Array.isArray(v) ? v.slice(0, max).map((x) => clean(x, 200)).filter(Boolean) : [];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  const payload = {
    name: clean(body.name, 120),
    phone: clean(body.phone, 40),
    email: clean(body.email, 160),
    city: clean(body.city, 160),
    profile: clean(body.profile, 80),
    routes: clean(body.routes, 400),
    annual_hours: clean(body.annual_hours, 40),
    passengers: clean(String(body.passengers ?? ''), 8),
    trip_nature: clean(body.trip_nature, 40),
    aircraft: cleanArr(body.aircraft),
    pillars: cleanArr(body.pillars),
    current_situation: clean(body.current_situation, 80),
    interests: cleanArr(body.interests),
    consult: clean(body.consult, 60),
    schedule: clean(body.schedule, 30),
    privacy_accepted: body.privacy_accepted === true,
  };

  if (!payload.name || !payload.phone || !isEmail(payload.email)) {
    return res.status(400).json({ error: 'Faltan datos obligatorios o email inválido' });
  }
  if (!payload.privacy_accepted) {
    return res.status(400).json({ error: 'Debe aceptar el aviso de privacidad' });
  }

  const meta = {
    user_agent: clean(req.headers['user-agent'] || '', 400),
    ip: clean(
      (req.headers['x-forwarded-for'] || '').toString().split(',')[0] ||
        req.socket?.remoteAddress ||
        '',
      60
    ),
  };

  const { data: row, error: dbError } = await supabase
    .from('submissions')
    .insert([{ ...payload, meta }])
    .select()
    .single();

  if (dbError) {
    console.error('Supabase error', dbError);
    return res.status(500).json({ error: 'No se pudo registrar la solicitud' });
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: process.env.NOTIFY_TO,
      replyTo: payload.email,
      subject: `Nueva solicitud Fly Select — ${payload.name}`,
      html: renderEmail(payload, row.id),
    });
  } catch (mailError) {
    console.error('Resend error', mailError);
  }

  return res.status(200).json({ ok: true, id: row.id });
}

function row(label, value) {
  if (!value || (Array.isArray(value) && value.length === 0)) return '';
  const v = Array.isArray(value) ? value.join(', ') : value;
  return `<tr><td style="padding:10px 16px;color:#8a8a8a;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;border-bottom:1px solid #1a1a1a;width:38%;">${label}</td><td style="padding:10px 16px;color:#f0ece4;font-size:13px;border-bottom:1px solid #1a1a1a;">${escapeHtml(v)}</td></tr>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderEmail(p, id) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#07070a;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0c0c0f;border:1px solid rgba(201,168,76,0.2);">
        <tr><td style="padding:36px 40px;border-bottom:1px solid rgba(201,168,76,0.15);">
          <div style="font-size:10px;letter-spacing:0.42em;text-transform:uppercase;color:#c9a84c;margin-bottom:8px;">Fly Select® · Nueva solicitud</div>
          <div style="font-family:Georgia,serif;font-size:26px;color:#f0ece4;font-weight:300;">Solicitud de membresía</div>
        </td></tr>
        <tr><td style="padding:24px 24px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${row('Nombre', p.name)}
            ${row('Teléfono', p.phone)}
            ${row('Email', p.email)}
            ${row('Ciudad', p.city)}
            ${row('Perfil', p.profile)}
            ${row('Rutas', p.routes)}
            ${row('Horas anuales', p.annual_hours)}
            ${row('Pasajeros', p.passengers)}
            ${row('Naturaleza', p.trip_nature)}
            ${row('Aeronaves', p.aircraft)}
            ${row('Pilares', p.pillars)}
            ${row('Situación actual', p.current_situation)}
            ${row('Intereses', p.interests)}
            ${row('Consultoría', p.consult)}
            ${row('Horario', p.schedule)}
          </table>
        </td></tr>
        <tr><td style="padding:20px 40px 32px;color:#5a5a5a;font-size:10px;letter-spacing:0.14em;">
          ID: ${escapeHtml(id)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
