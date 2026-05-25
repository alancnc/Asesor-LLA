-- ── V3: pending_registrations + app_config ────────────────────────

-- Approval/rejection queue for new users
CREATE TABLE IF NOT EXISTS pending_registrations (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT        NOT NULL UNIQUE,
  full_name    TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  status       TEXT        DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at  TIMESTAMPTZ,
  notes        TEXT
);

-- No RLS — only accessed via service role from admin API routes
ALTER TABLE pending_registrations DISABLE ROW LEVEL SECURITY;

-- Key-value config store for the admin panel
CREATE TABLE IF NOT EXISTS app_config (
  key        TEXT        PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE app_config DISABLE ROW LEVEL SECURITY;

-- Default config values
INSERT INTO app_config (key, value)
VALUES
  ('welcome_message',          'Asesoramiento jurídico-legislativo para los representantes de La Libertad Avanza Misiones.'),
  ('suggested_questions',      '["¿Es constitucional una ley aprobada sin quórum?","¿Cuál es el procedimiento para declarar de interés provincial un proyecto?","¿Qué diferencia hay entre una declaración y una resolución legislativa?","Analizá este proyecto de ley y recomendá cómo votar","¿Cuáles son los límites constitucionales del Ejecutivo provincial?","¿Cómo se interpela a un ministro provincial en Misiones?"]'),
  ('system_prompt_override',   '')
ON CONFLICT (key) DO NOTHING;
