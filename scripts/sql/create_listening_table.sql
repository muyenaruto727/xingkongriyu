-- 创建听力表
CREATE TABLE IF NOT EXISTS listening (
  id SERIAL PRIMARY KEY,
  difficulty VARCHAR(255) NOT NULL,
  audio_url TEXT NOT NULL,
  exercise_type VARCHAR(255) NOT NULL,
  question TEXT,
  options JSONB,
  correct_answer VARCHAR(255),
  explanation TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_listening_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_listening_timestamp
BEFORE UPDATE ON listening
FOR EACH ROW
EXECUTE PROCEDURE update_listening_timestamp();
