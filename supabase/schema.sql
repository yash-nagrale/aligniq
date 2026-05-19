-- ============================================================
-- AlignIQ — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUMS ──────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('employee', 'manager', 'admin');
CREATE TYPE uom_type AS ENUM ('Min', 'Max', 'Timeline', 'Zero');
CREATE TYPE goal_status AS ENUM ('Draft', 'Submitted', 'Approved', 'Rejected', 'Locked');
CREATE TYPE checkin_status AS ENUM ('Not Started', 'On Track', 'Completed');
CREATE TYPE quarter_key AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');
CREATE TYPE cycle_type AS ENUM ('goal_setting', 'Q1', 'Q2', 'Q3', 'Q4');

-- ─── USERS ──────────────────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE,                          -- links to auth.users
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  department TEXT NOT NULL,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_users_role ON users(role);

-- ─── GOALS ──────────────────────────────────────────────────
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  thrust_area TEXT NOT NULL,
  description TEXT,
  uom_type uom_type NOT NULL,
  target TEXT NOT NULL,
  achievement TEXT,
  weightage INTEGER NOT NULL CHECK (weightage >= 10 AND weightage <= 100),
  status goal_status NOT NULL DEFAULT 'Draft',
  deadline DATE NOT NULL,
  locked BOOLEAN NOT NULL DEFAULT FALSE,
  manager_comment TEXT,
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  shared_goal_id UUID REFERENCES shared_goals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_shared ON goals(shared_goal_id);

-- Enforce max 8 goals per user
CREATE OR REPLACE FUNCTION check_max_goals()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM goals WHERE user_id = NEW.user_id AND id != COALESCE(NEW.id, uuid_generate_v4())) >= 8 THEN
    RAISE EXCEPTION 'Maximum of 8 goals per employee';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_goals
BEFORE INSERT ON goals
FOR EACH ROW EXECUTE FUNCTION check_max_goals();

-- Enforce weightage total <= 100
CREATE OR REPLACE FUNCTION check_weightage_total()
RETURNS TRIGGER AS $$
DECLARE total INT;
BEGIN
  SELECT COALESCE(SUM(weightage), 0) INTO total
  FROM goals
  WHERE user_id = NEW.user_id AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000');
  IF total + NEW.weightage > 100 THEN
    RAISE EXCEPTION 'Total weightage cannot exceed 100%% (current: %%, adding: %%)', total, NEW.weightage;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_weightage
BEFORE INSERT OR UPDATE ON goals
FOR EACH ROW EXECUTE FUNCTION check_weightage_total();

-- ─── SHARED GOALS ───────────────────────────────────────────
CREATE TABLE shared_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  thrust_area TEXT NOT NULL,
  description TEXT,
  uom_type uom_type NOT NULL,
  target TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── QUARTERLY UPDATES ──────────────────────────────────────
CREATE TABLE quarterly_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  quarter quarter_key NOT NULL,
  achievement TEXT NOT NULL,
  status checkin_status NOT NULL DEFAULT 'On Track',
  notes TEXT,
  submitted_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (goal_id, quarter)
);
CREATE INDEX idx_quarterly_goal ON quarterly_updates(goal_id);

-- ─── COMMENTS ───────────────────────────────────────────────
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_comments_goal ON comments(goal_id);

-- ─── AUDIT LOGS ─────────────────────────────────────────────
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ─── CYCLES ─────────────────────────────────────────────────
CREATE TABLE cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cycle_type cycle_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  override_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NOTIFICATIONS ──────────────────────────────────────────
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  type TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);

-- ─── UPDATED_AT TRIGGER ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_goals
BEFORE UPDATE ON goals
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_quarterly
BEFORE UPDATE ON quarterly_updates
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Users: can read all, edit own
CREATE POLICY "Users read all" ON users FOR SELECT USING (TRUE);
CREATE POLICY "Users update own" ON users FOR UPDATE USING (auth.uid() = auth_id);

-- Goals: employees own; managers see reports; admins see all
CREATE POLICY "Goals select" ON goals FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  OR user_id IN (SELECT id FROM users WHERE manager_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Goals insert own" ON goals FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "Goals update" ON goals FOR UPDATE USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  OR user_id IN (SELECT id FROM users WHERE manager_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin')
);

-- Quarterly updates
CREATE POLICY "QU select" ON quarterly_updates FOR SELECT USING (
  goal_id IN (SELECT id FROM goals)
);
CREATE POLICY "QU insert" ON quarterly_updates FOR INSERT WITH CHECK (
  submitted_by IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "QU update" ON quarterly_updates FOR UPDATE USING (
  submitted_by IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- ─── DEMO SEED DATA ─────────────────────────────────────────
INSERT INTO users (id, name, email, role, department) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Priya Sharma',  'priya@aligniq.ai',  'employee', 'Engineering'),
  ('11111111-0000-0000-0000-000000000002', 'Rahul Menon',   'rahul@aligniq.ai',  'employee', 'Product'),
  ('11111111-0000-0000-0000-000000000003', 'Deepa Iyer',    'deepa@aligniq.ai',  'manager',  'Engineering'),
  ('11111111-0000-0000-0000-000000000004', 'Kiran Patel',   'kiran@aligniq.ai',  'admin',    'HR');

UPDATE users SET manager_id = '11111111-0000-0000-0000-000000000003'
WHERE id IN ('11111111-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000002');
UPDATE users SET manager_id = '11111111-0000-0000-0000-000000000004'
WHERE id = '11111111-0000-0000-0000-000000000003';

INSERT INTO cycles (name, cycle_type, start_date, end_date, is_active) VALUES
  ('Goal Setting 2025',  'goal_setting', '2025-05-01', '2025-05-31', FALSE),
  ('Q1 Check-In 2025',   'Q1',           '2025-07-01', '2025-07-31', FALSE),
  ('Q2 Check-In 2025',   'Q2',           '2025-10-01', '2025-10-31', FALSE),
  ('Q3 Check-In 2025',   'Q3',           '2026-01-01', '2026-01-31', FALSE),
  ('Q4 Annual Review',   'Q4',           '2026-03-01', '2026-04-30', TRUE);
