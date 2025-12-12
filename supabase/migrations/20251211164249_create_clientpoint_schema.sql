/*
  # ClientPoint-style Chrome Extension Schema

  ## Overview
  This migration creates the database schema for a relationship management Chrome extension
  that tracks contacts, interactions, meetings, and notes.

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `contacts`
  - `id` (uuid, primary key) - Unique contact identifier
  - `user_id` (uuid, foreign key) - Owner of the contact
  - `email` (text) - Contact's email address
  - `name` (text) - Contact's name
  - `company` (text) - Company name
  - `title` (text) - Job title
  - `phone` (text) - Phone number
  - `linkedin_url` (text) - LinkedIn profile
  - `website` (text) - Personal/company website
  - `notes` (text) - General notes
  - `tags` (text[]) - Array of tags for categorization
  - `last_contacted` (timestamptz) - Last interaction date
  - `created_at` (timestamptz) - When contact was added
  - `updated_at` (timestamptz) - Last update timestamp

  ### `interactions`
  - `id` (uuid, primary key) - Unique interaction identifier
  - `user_id` (uuid, foreign key) - User who logged the interaction
  - `contact_id` (uuid, foreign key) - Related contact
  - `type` (text) - Type of interaction (email, call, meeting, note)
  - `subject` (text) - Interaction subject/title
  - `content` (text) - Interaction details
  - `url` (text) - URL where interaction occurred
  - `created_at` (timestamptz) - When interaction was logged

  ### `meetings`
  - `id` (uuid, primary key) - Unique meeting identifier
  - `user_id` (uuid, foreign key) - Meeting creator
  - `contact_id` (uuid, foreign key) - Related contact
  - `title` (text) - Meeting title
  - `description` (text) - Meeting description
  - `scheduled_at` (timestamptz) - Scheduled meeting time
  - `duration_minutes` (integer) - Meeting duration
  - `meeting_url` (text) - Virtual meeting link
  - `status` (text) - Meeting status (scheduled, completed, cancelled)
  - `created_at` (timestamptz) - When meeting was created
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - All policies check authentication and ownership
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  company text,
  title text,
  phone text,
  linkedin_url text,
  website text,
  notes text DEFAULT '',
  tags text[] DEFAULT '{}',
  last_contacted timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create interactions table
CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'note',
  subject text,
  content text DEFAULT '',
  url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions"
  ON interactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
  ON interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions"
  ON interactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions"
  ON interactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 30,
  meeting_url text,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meetings"
  ON meetings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meetings"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meetings"
  ON meetings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meetings"
  ON meetings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_contact_id ON meetings(contact_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_at ON meetings(scheduled_at);