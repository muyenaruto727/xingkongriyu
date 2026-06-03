-- 创建教材表
CREATE TABLE IF NOT EXISTS public.textbooks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    level VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建教材课程表
CREATE TABLE IF NOT EXISTS public.textbook_lessons (
    id SERIAL PRIMARY KEY,
    textbook_id INTEGER NOT NULL REFERENCES public.textbooks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(textbook_id, name)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_textbook_lessons_textbook_id ON public.textbook_lessons(textbook_id);

-- 插入初始教材数据
INSERT INTO public.textbooks (name, description, level, sort_order) VALUES
('综合日语1', '综合日语第一册', '初级', 1),
('综合日语2', '综合日语第二册', '初级', 2),
('综合日语3', '综合日语第三册', '中级', 3),
('综合日语4', '综合日语第四册', '中级', 4),
('大家的日语初级上', '大家的日语初级上册', '初级', 5),
('大家的日语初级下', '大家的日语初级下册', '初级', 6),
('大家的日语中级上', '大家的日语中级上册', '中级', 7),
('大家的日语中级下', '大家的日语中级下册', '中级', 8)
ON CONFLICT (name) DO NOTHING;

-- 使用 generate_series 批量插入课程数据

-- 综合日语1 (第5课-第15课, 共11课)
INSERT INTO public.textbook_lessons (textbook_id, name, sort_order)
SELECT 
    (SELECT id FROM public.textbooks WHERE name = '综合日语1'),
    '第' || (4 + i) || '课',
    i
FROM generate_series(1, 11) AS i
ON CONFLICT (textbook_id, name) DO NOTHING;

-- 综合日语2 (第16课-第30课, 共15课)
INSERT INTO public.textbook_lessons (textbook_id, name, sort_order)
SELECT 
    (SELECT id FROM public.textbooks WHERE name = '综合日语2'),
    '第' || (15 + i) || '课',
    i
FROM generate_series(1, 15) AS i
ON CONFLICT (textbook_id, name) DO NOTHING;

-- 综合日语3 (第1课-第10课, 共10课)
INSERT INTO public.textbook_lessons (textbook_id, name, sort_order)
SELECT 
    (SELECT id FROM public.textbooks WHERE name = '综合日语3'),
    '第' || i || '课',
    i
FROM generate_series(1, 10) AS i
ON CONFLICT (textbook_id, name) DO NOTHING;

-- 综合日语4 (第11课-第20课, 共10课)
INSERT INTO public.textbook_lessons (textbook_id, name, sort_order)
SELECT 
    (SELECT id FROM public.textbooks WHERE name = '综合日语4'),
    '第' || (10 + i) || '课',
    i
FROM generate_series(1, 10) AS i
ON CONFLICT (textbook_id, name) DO NOTHING;

-- 大家的日语初级上 (第1课-第25课, 共25课)
INSERT INTO public.textbook_lessons (textbook_id, name, sort_order)
SELECT 
    (SELECT id FROM public.textbooks WHERE name = '大家的日语初级上'),
    '第' || i || '课',
    i
FROM generate_series(1, 25) AS i
ON CONFLICT (textbook_id, name) DO NOTHING;

-- 大家的日语初级下 (第25课-第50课, 共26课)
INSERT INTO public.textbook_lessons (textbook_id, name, sort_order)
SELECT 
    (SELECT id FROM public.textbooks WHERE name = '大家的日语初级下'),
    '第' || (24 + i) || '课',
    i
FROM generate_series(1, 26) AS i
ON CONFLICT (textbook_id, name) DO NOTHING;

-- 大家的日语中级上 (第1课-第12课, 共12课)
INSERT INTO public.textbook_lessons (textbook_id, name, sort_order)
SELECT 
    (SELECT id FROM public.textbooks WHERE name = '大家的日语中级上'),
    '第' || i || '课',
    i
FROM generate_series(1, 12) AS i
ON CONFLICT (textbook_id, name) DO NOTHING;

-- 大家的日语中级下 (第13课-第24课, 共12课)
INSERT INTO public.textbook_lessons (textbook_id, name, sort_order)
SELECT 
    (SELECT id FROM public.textbooks WHERE name = '大家的日语中级下'),
    '第' || (12 + i) || '课',
    i
FROM generate_series(1, 12) AS i
ON CONFLICT (textbook_id, name) DO NOTHING;
