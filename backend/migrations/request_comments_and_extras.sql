-- Комментарии к заявкам (замер / монтаж / общие) + расширенные позиции монтажа
-- Выполнять один раз: sudo -u postgres psql primedoor_db -f request_comments_and_extras.sql

CREATE TABLE IF NOT EXISTS request_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name TEXT,
  author_role TEXT,
  stage TEXT NOT NULL DEFAULT 'general', -- 'measurement' | 'installation' | 'general'
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_request_comments_request ON request_comments(request_id, created_at);

-- Перенос старых заметок из requests.notes в ленту комментариев (однократно)
INSERT INTO request_comments (request_id, author_name, author_role, stage, text, created_at)
SELECT r.id, 'Импорт', 'system',
       CASE WHEN r.type = 'installation' THEN 'installation'
            WHEN r.type = 'measurement' THEN 'measurement'
            ELSE 'general' END,
       r.notes, COALESCE(r.updated_at, r.created_at)
FROM requests r
WHERE r.notes IS NOT NULL AND btrim(r.notes) <> ''
  AND NOT EXISTS (SELECT 1 FROM request_comments c WHERE c.request_id = r.id);

-- Расширенные позиции монтажа
ALTER TABLE requests ADD COLUMN IF NOT EXISTS entrance_panels INTEGER;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS baseboard_meters NUMERIC(10,2);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS portals INTEGER;

-- Связь повторных заявок с исходной
ALTER TABLE requests ADD COLUMN IF NOT EXISTS parent_request_id UUID REFERENCES requests(id) ON DELETE SET NULL;
