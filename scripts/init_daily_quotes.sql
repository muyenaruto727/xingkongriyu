-- 创建每日一句表
CREATE TABLE IF NOT EXISTS public.daily_quotes (
    id SERIAL PRIMARY KEY,
    sentence TEXT NOT NULL,
    meaning TEXT,
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入初始数据
INSERT INTO public.daily_quotes (sentence, meaning, source) VALUES
('人生は一度きりだ。だから、後悔しないように生きよう。', '人生只有一次。所以，让我们不留遗憾地活下去吧。', '日本のことわざ'),
('明日は明日の風が吹く。', '明天自有明天的风。（顺其自然，船到桥头自然直。）', '日本のことわざ'),
('努力は裏切らない。', '努力不会背叛你。', 'ことわざ'),
('学ぶことは生涯の旅である。', '学习是一生的旅程。', 'ことわざ'),
('夢は逃げない、逃げるのはいつも自分だ。', '梦想不会逃跑，逃跑的总是自己。', '名言'),
('成功する秘訣は、失敗を恐れないことだ。', '成功的秘诀是不畏惧失败。', '名言'),
('時間は金なり。', '时间就是金钱。', 'ことわざ'),
('何事も最初が肝心。', '万事开头难。', 'ことわざ'),
('我慢が身を守る。', '忍耐能保护自己。', 'ことわざ'),
('一期一会。', '一生一次的相遇。（珍惜当下每一次相遇。）', '茶道の理念')
ON CONFLICT DO NOTHING;
