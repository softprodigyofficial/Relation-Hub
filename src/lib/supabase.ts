import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export type Contact = {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  company: string | null;
  title: string | null;
  phone: string | null;
  linkedin_url: string | null;
  website: string | null;
  notes: string;
  tags: string[];
  last_contacted: string | null;
  created_at: string;
  updated_at: string;
};

export type Interaction = {
  id: string;
  user_id: string;
  contact_id: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  subject: string | null;
  content: string;
  url: string | null;
  created_at: string;
};

export type Meeting = {
  id: string;
  user_id: string;
  contact_id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};
