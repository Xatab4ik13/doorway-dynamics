-- Журнал отсутствий сотрудников (отпуск/выходной/больничный)
CREATE TABLE IF NOT EXISTS employee_absences (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('dayoff', 'vacation', 'sick')),
  comment TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_employee_absences_user_date ON employee_absences(user_id, date);
CREATE INDEX IF NOT EXISTS idx_employee_absences_date ON employee_absences(date);
