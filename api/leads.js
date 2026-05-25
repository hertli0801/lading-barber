const { createClient } = require('@supabase/supabase-js');

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function getAllowedOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return '*';
  try {
    const u = new URL(origin);
    if (u.hostname === 'localhost' || u.hostname.endsWith('.vercel.app')) {
      return origin;
    }
  } catch (_) {
    /* ignore */
  }
  return process.env.ALLOWED_ORIGIN || '*';
}

async function readJsonBody(req) {
  if (req.body != null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  const raw = await new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
  return JSON.parse(raw || '{}');
}

module.exports = async (req, res) => {
  const allowedOrigin = getAllowedOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Método no permitido' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return json(res, 500, { error: 'Servidor sin configurar: faltan variables de entorno de Supabase.' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (_) {
    return json(res, 400, { error: 'JSON inválido' });
  }

  const full_name = typeof body.full_name === 'string' ? body.full_name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : null;
  const business_name = typeof body.business_name === 'string' ? body.business_name.trim() : null;
  const notes = typeof body.notes === 'string' ? body.notes.trim() : null;

  if (!full_name || full_name.length > 200) {
    return json(res, 400, { error: 'El nombre es obligatorio (máx. 200 caracteres).' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return json(res, 400, { error: 'Introduce un correo electrónico válido.' });
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('leads')
    .insert({
      full_name,
      email,
      phone: phone || null,
      business_name: business_name || null,
      notes: notes || null,
      source: 'landing',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Supabase insert error:', error.message);
    return json(res, 502, { error: 'No se pudo guardar el registro. Inténtalo más tarde.' });
  }

  return json(res, 201, { ok: true, id: data.id });
};
