-- Карточки сотрудников (монтажников и замерщиков)
-- Запустить на VPS: psql $DATABASE_URL -f backend/migrations/employee_profiles.sql

CREATE TABLE IF NOT EXISTS employee_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  birth_date DATE,
  city TEXT,
  car_plate TEXT,
  passport_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  license_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_profiles_user_id ON employee_profiles(user_id);
