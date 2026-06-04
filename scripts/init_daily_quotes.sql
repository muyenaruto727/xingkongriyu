-- 创建每日一句表
CREATE TABLE IF NOT EXISTS public.daily_quotes (
    id SERIAL PRIMARY KEY,
    sentence TEXT NOT NULL,
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入初始数据
INSERT INTO public.daily_quotes (sentence, source) VALUES
('人生は一度きりだ。だから、後悔しないように生きよう。', '日本のことわざ'),
('明日は明日の風が吹く。', '日本のことわざ'),
('努力は裏切らない。', 'ことわざ'),
('学ぶことは生涯の旅である。', 'ことわざ'),
('夢は逃げない、逃げるのはいつも自分だ。', '名言'),
('成功する秘訣は、失敗を恐れないことだ。', '名言'),
('時間は金なり。', 'ことわざ'),
('何事も最初が肝心。', 'ことわざ'),
('我慢が身を守る。', 'ことわざ'),
('一期一会。', '茶道の理念')
ON CONFLICT DO NOTHING;
