CREATE TABLE wizard_completions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),

  -- Environment
  os text,

  -- Authentication
  auth_type text,

  -- Technical Setup
  language text,
  has_database boolean,
  database_types text[],
  has_frontend boolean,
  deploy_target text,
  team_type text,

  -- Design Principles
  design_principles text[],

  -- AI Capabilities Selected
  capabilities text[],

  -- Project Context
  project_description text,

  -- Completeness
  goals_count int
);

-- Enable RLS
ALTER TABLE wizard_completions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts only (no read, no update, no delete from client)
CREATE POLICY "Allow anonymous inserts"
  ON wizard_completions
  FOR INSERT
  TO anon
  WITH CHECK (true);
