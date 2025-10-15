-- =====================================================
-- Magnetic Testing Instrument Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
-- Extends Supabase Auth users with additional profile information
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('operator', 'engineer', 'admin')) DEFAULT 'operator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 2. TESTING_SESSIONS TABLE
-- =====================================================
CREATE TABLE testing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name TEXT NOT NULL,
  operator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('running', 'paused', 'completed', 'error')) DEFAULT 'running',
  parameters JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_sessions_operator ON testing_sessions(operator_id);
CREATE INDEX idx_sessions_status ON testing_sessions(status);
CREATE INDEX idx_sessions_start_time ON testing_sessions(start_time DESC);
CREATE INDEX idx_sessions_project_name ON testing_sessions(project_name);

-- Enable RLS
ALTER TABLE testing_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for testing_sessions
CREATE POLICY "Users can view own sessions"
  ON testing_sessions FOR SELECT
  USING (auth.uid() = operator_id);

CREATE POLICY "Engineers and admins can view all sessions"
  ON testing_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

CREATE POLICY "Users can create sessions"
  ON testing_sessions FOR INSERT
  WITH CHECK (auth.uid() = operator_id);

CREATE POLICY "Users can update own sessions"
  ON testing_sessions FOR UPDATE
  USING (auth.uid() = operator_id);

CREATE POLICY "Admins can update all sessions"
  ON testing_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 3. SIGNAL_DATA TABLE
-- =====================================================
CREATE TABLE signal_data (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES testing_sessions(id) ON DELETE CASCADE,
  timestamp BIGINT NOT NULL,
  amplitude REAL NOT NULL,
  phase REAL,
  position REAL NOT NULL,
  frequency REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for query performance
CREATE INDEX idx_signal_session ON signal_data(session_id);
CREATE INDEX idx_signal_timestamp ON signal_data(session_id, timestamp);
CREATE INDEX idx_signal_position ON signal_data(session_id, position);

-- Enable RLS
ALTER TABLE signal_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for signal_data
CREATE POLICY "Users can view signal data for own sessions"
  ON signal_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM testing_sessions
      WHERE id = signal_data.session_id AND operator_id = auth.uid()
    )
  );

CREATE POLICY "Engineers and admins can view all signal data"
  ON signal_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

CREATE POLICY "Users can insert signal data for own sessions"
  ON signal_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM testing_sessions
      WHERE id = signal_data.session_id AND operator_id = auth.uid()
    )
  );

-- =====================================================
-- 4. DEFECTS TABLE
-- =====================================================
CREATE TABLE defects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES testing_sessions(id) ON DELETE CASCADE,
  position REAL NOT NULL,
  amplitude REAL NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  gate_triggered TEXT CHECK (gate_triggered IN ('A', 'B', 'both')),
  timestamp TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_defects_session ON defects(session_id);
CREATE INDEX idx_defects_severity ON defects(severity);
CREATE INDEX idx_defects_timestamp ON defects(session_id, timestamp);

-- Enable RLS
ALTER TABLE defects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for defects
CREATE POLICY "Users can view defects for own sessions"
  ON defects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM testing_sessions
      WHERE id = defects.session_id AND operator_id = auth.uid()
    )
  );

CREATE POLICY "Engineers and admins can view all defects"
  ON defects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

CREATE POLICY "Users can insert defects for own sessions"
  ON defects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM testing_sessions
      WHERE id = defects.session_id AND operator_id = auth.uid()
    )
  );

CREATE POLICY "Users can update defects for own sessions"
  ON defects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM testing_sessions
      WHERE id = defects.session_id AND operator_id = auth.uid()
    )
  );

-- =====================================================
-- 5. CALIBRATIONS TABLE
-- =====================================================
CREATE TABLE calibrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  calibration_type TEXT NOT NULL,
  reference_signal JSONB NOT NULL,
  coefficients JSONB NOT NULL,
  standard_block TEXT,
  calibration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_calibrations_active ON calibrations(is_active, calibration_date DESC);
CREATE INDEX idx_calibrations_operator ON calibrations(operator_id);
CREATE INDEX idx_calibrations_type ON calibrations(calibration_type);

-- Enable RLS
ALTER TABLE calibrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calibrations
CREATE POLICY "All authenticated users can view active calibrations"
  ON calibrations FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Engineers and admins can view all calibrations"
  ON calibrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

CREATE POLICY "Engineers and admins can create calibrations"
  ON calibrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

CREATE POLICY "Engineers and admins can update calibrations"
  ON calibrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

-- =====================================================
-- 6. REPORTS TABLE
-- =====================================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES testing_sessions(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  standard TEXT,
  content JSONB NOT NULL,
  pdf_url TEXT,
  generated_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_reports_session ON reports(session_id);
CREATE INDEX idx_reports_generated_by ON reports(generated_by);
CREATE INDEX idx_reports_generated_at ON reports(generated_at DESC);
CREATE INDEX idx_reports_standard ON reports(standard);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "Users can view reports for own sessions"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM testing_sessions
      WHERE id = reports.session_id AND operator_id = auth.uid()
    )
  );

CREATE POLICY "Engineers and admins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

CREATE POLICY "Users can create reports for own sessions"
  ON reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM testing_sessions
      WHERE id = reports.session_id AND operator_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testing_sessions_updated_at
  BEFORE UPDATE ON testing_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKET CONFIGURATION
-- =====================================================
-- Note: Storage buckets are typically created via Supabase Dashboard or API
-- This is a reference for the required bucket configuration

-- Bucket name: report-pdfs
-- Public: false (requires authentication)
-- File size limit: 50MB
-- Allowed MIME types: application/pdf

-- RLS policies for storage will be:
-- 1. Users can upload PDFs for their own reports
-- 2. Users can download PDFs for reports they have access to
-- 3. Admins can access all PDFs

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get active calibration
CREATE OR REPLACE FUNCTION get_active_calibration(cal_type TEXT)
RETURNS TABLE (
  id UUID,
  calibration_type TEXT,
  coefficients JSONB,
  calibration_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.calibration_type, c.coefficients, c.calibration_date
  FROM calibrations c
  WHERE c.calibration_type = cal_type
    AND c.is_active = true
    AND (c.expiry_date IS NULL OR c.expiry_date > NOW())
  ORDER BY c.calibration_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if calibration is expired
CREATE OR REPLACE FUNCTION is_calibration_expired(calibration_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  expiry TIMESTAMPTZ;
BEGIN
  SELECT expiry_date INTO expiry
  FROM calibrations
  WHERE id = calibration_id;
  
  IF expiry IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN expiry < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- Insert default admin user profile (requires manual user creation in Supabase Auth first)
-- This is just a template - actual user IDs will be different
-- INSERT INTO profiles (id, username, full_name, role)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000000', 'admin', 'System Administrator', 'admin');

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase Auth users';
COMMENT ON TABLE testing_sessions IS 'Magnetic testing session records';
COMMENT ON TABLE signal_data IS 'Raw signal measurements from testing sessions';
COMMENT ON TABLE defects IS 'Detected defects and anomalies';
COMMENT ON TABLE calibrations IS 'System calibration records';
COMMENT ON TABLE reports IS 'Generated test reports metadata';

COMMENT ON COLUMN testing_sessions.parameters IS 'JSON object containing gain, filter, velocity, gates, threshold';
COMMENT ON COLUMN testing_sessions.metadata IS 'Additional session metadata (equipment info, environmental conditions, etc.)';
COMMENT ON COLUMN calibrations.reference_signal IS 'Reference signal data from standard test block';
COMMENT ON COLUMN calibrations.coefficients IS 'Calculated calibration coefficients';
COMMENT ON COLUMN reports.content IS 'Report content including summary, findings, and conclusions';
