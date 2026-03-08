export interface WizardData {
  // Screen 1: Welcome
  consent: boolean;

  // Screen 2: Auth
  auth_type: 'subscription' | 'api_key' | '';
  api_key: string;

  // Screen 3: Project Identity
  project_name: string;
  project_slug: string;
  project_description: string;
  problem_statement: string;

  // Screen 4: Design Principles
  design_principles: string[];
  anti_patterns: string;

  // Screen 5: Technical Setup
  language: 'python' | 'javascript' | 'both' | 'other' | 'not_sure' | '';
  has_database: 'yes' | 'no' | 'not_sure' | '';
  database_types: string[];
  has_frontend: 'yes' | 'no' | 'later' | '';
  deploy_target: 'local' | 'server' | 'not_sure' | '';
  ssh_address: string;
  team_type: 'alone' | 'team' | '';

  // Screen 6: AI Capabilities
  capabilities: string[];

  // Screen 7: Goals
  goal1_title: string;
  goal1_done: string;
  goal2_title: string;
  goal3_title: string;
  goal4_title: string;

  // Screen 8: Credentials
  perplexity_key: string;
  postgres_connection: string;
  shell_ssh: string;

  // Screen 9: Review — toggles handled at generation time
}

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
  credentials_skipped: string[];
  project_description: string;
}
