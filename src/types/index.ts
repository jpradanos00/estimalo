export interface Session {
  id: string;
  code: string;
  admin_participant_id: string | null;
  name: string | null;
  status: SessionStatus;
  current_task_id: string | null;
  created_at: string;
}

export type SessionStatus = 'lobby' | 'voting' | 'revealed' | 'finished';

export interface Participant {
  id: string;
  session_id: string;
  name: string;
  weight: number;
  is_admin: boolean;
  joined_at: string;
}

export interface Task {
  id: string;
  session_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  final_estimate: number | null;
  created_at: string;
}

export type TaskStatus = 'pending' | 'active' | 'completed';

export interface Vote {
  id: string;
  task_id: string;
  participant_id: string;
  value: number;
  created_at: string;
}

export interface CardDefinition {
  label: string;
  value: number | null;
  color: string;
  description?: string;
}

export type AppScreen = 'landing' | 'create' | 'join' | 'lobby' | 'voting' | 'revealed';

export interface WeightedResult {
  votes: Array<{
    participant: Participant;
    value: number;
  }>;
  simpleMean: number;
  weightedMean: number;
  totalWeight: number;
  min: number;
  max: number;
}
