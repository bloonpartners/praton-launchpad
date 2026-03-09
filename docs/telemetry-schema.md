# Telemetry Schema

Anonymous, categorical data only. No PII. Insert-only from client.

## Supabase Table: `wizard_completions`

```sql
CREATE TABLE wizard_completions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  
  -- Environment
  os text,                        -- from navigator.platform (Win32, MacIntel, Linux x86_64)
  
  -- Authentication
  auth_type text,                 -- 'subscription' | 'api_key'
  
  -- Technical Setup
  language text,                  -- 'python' | 'javascript' | 'both' | 'other' | 'not_sure'
  has_database boolean,
  database_types text[],          -- ['user_accounts', 'products', 'documents', 'analytics']
  has_frontend boolean,
  deploy_target text,             -- 'local' | 'server' | 'not_sure'
  team_type text,                 -- 'alone' | 'team'
  
  -- Design Principles
  design_principles text[],       -- ['simplicity', 'security', 'speed', ...]
  
  -- AI Capabilities Selected
  capabilities text[],            -- ['context7', 'perplexity', 'playwright', 'postgres', 'shell']
  
  -- Project Context
  project_description text,       -- free text from Q2 — what are they building
  
  -- Completeness
  goals_count int                 -- how many goals they entered (1-4)
);
```

## Row-Level Security

```sql
-- Enable RLS
ALTER TABLE wizard_completions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts only (no read, no update, no delete from client)
CREATE POLICY "Allow anonymous inserts" 
  ON wizard_completions 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- No SELECT policy = client cannot read any data
-- Dashboard access via Supabase Studio or authenticated role only
```

## Client-Side POST

```typescript
// src/lib/telemetry.ts
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

export async function sendTelemetry(data: TelemetryPayload): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/wizard_completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(data),
    });
  } catch {
    // Silently fail — telemetry never blocks the user
  }
}
```

## TelemetryPayload Type

```typescript
// src/types/wizard.ts
export interface TelemetryPayload {
  os: string;
  auth_type: 'subscription' | 'api_key';
  language: 'python' | 'javascript' | 'both' | 'other' | 'not_sure';
  has_database: boolean;
  database_types: string[];
  has_frontend: boolean;
  deploy_target: 'local' | 'server' | 'not_sure';
  team_type: 'alone' | 'team';
  design_principles: string[];
  capabilities: string[];
  goals_count: number;
  project_description: string;
}
```

## When to Send

Fire telemetry on the Done screen (Screen 10), after zip generation succeeds. Not before — we only want data from completed setups. Fire-and-forget, don't await.

## Dashboard Queries

Useful aggregate queries for Supabase Studio:

```sql
-- Most common language
SELECT language, count(*) FROM wizard_completions GROUP BY language ORDER BY count DESC;

-- Most selected capabilities
SELECT unnest(capabilities) as cap, count(*) FROM wizard_completions GROUP BY cap ORDER BY count DESC;

-- Deploy target distribution
SELECT deploy_target, count(*) FROM wizard_completions GROUP BY deploy_target ORDER BY count DESC;

-- Team vs solo
SELECT team_type, count(*) FROM wizard_completions GROUP BY team_type ORDER BY count DESC;

-- Weekly completions
SELECT date_trunc('week', created_at) as week, count(*) FROM wizard_completions GROUP BY week ORDER BY week DESC;

-- Most common design principle combos
SELECT design_principles, count(*) FROM wizard_completions GROUP BY design_principles ORDER BY count DESC LIMIT 10;
```
