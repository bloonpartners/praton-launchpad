export interface WizardData {
  // Screen 1: Welcome
  consent: boolean;
  telemetry_consent: boolean;

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
  language: 'python' | 'javascript' | 'go' | 'rust' | 'both' | 'other' | 'not_sure' | '';
  has_database: 'yes' | 'no' | 'not_sure' | '';
  database_types: string[];
  has_frontend: 'yes' | 'no' | 'later' | '';
  deploy_target: 'local' | 'server' | 'not_sure' | '';
  team_type: 'alone' | 'team' | '';

  // Screen 6: AI Capabilities
  capabilities: string[];

  // Screen 7: Goals
  goal1_description: string;
  goal1_acceptance_criteria: string;
  goal2_description: string;
  goal3_description: string;
  goal4_description: string;

  // Detected at runtime
  detected_os: 'windows' | 'mac' | '';

  // Screen 8: Review
  review_toggles: Record<string, boolean>;
}

export interface TelemetryPayload {
  os: string;
  auth_type: 'subscription' | 'api_key';
  language: 'python' | 'javascript' | 'go' | 'rust' | 'both' | 'other' | 'not_sure';
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
