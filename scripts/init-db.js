const {
  assertSafeForDestructiveOperation,
  createDbPool,
} = require('../lib/dbConfig');

assertSafeForDestructiveOperation();

const pool = createDbPool({ max: 5 });

const textbooks = [
  { name: '综合日语1', description: '综合日语第一册', level: '初级', sortOrder: 1, lessons: 11, startLesson: 5 },
  { name: '综合日语2', description: '综合日语第二册', level: '初级', sortOrder: 2, lessons: 15, startLesson: 16 },
  { name: '综合日语3', description: '综合日语第三册', level: '中级', sortOrder: 3, lessons: 10, startLesson: 1 },
  { name: '综合日语4', description: '综合日语第四册', level: '中级', sortOrder: 4, lessons: 10, startLesson: 11 },
  { name: '大家的日语初级上', description: '大家的日语初级上册', level: '初级', sortOrder: 5, lessons: 25, startLesson: 1 },
  { name: '大家的日语初级下', description: '大家的日语初级下册', level: '初级', sortOrder: 6, lessons: 26, startLesson: 25 },
  { name: '大家的日语中级上', description: '大家的日语中级上册', level: '中级', sortOrder: 7, lessons: 12, startLesson: 1 },
  { name: '大家的日语中级下', description: '大家的日语中级下册', level: '中级', sortOrder: 8, lessons: 12, startLesson: 13 },
];

const preserveTables = ['textbooks', 'textbook_lessons'];

async function initDatabase() {
  let client;
  try {
    client = await pool.connect();
    console.log('=== 开始初始化数据库 ===\n');

    // 获取所有表名（包括所有schema）
    console.log('1. 获取所有表名...');
    const tablesResult = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('public')
      ORDER BY table_schema, table_name;
    `);
    const allTables = tablesResult.rows;
    console.log(`   共找到 ${allTables.length} 张表`);
    allTables.forEach(table => console.log(`     - ${table.table_schema}.${table.table_name}`));

    // 清空非保留表的数据
    console.log('\n2. 清空非保留表的数据...');
    let successCount = 0;
    let failCount = 0;

    for (const table of allTables) {
      const tableName = table.table_name;
      const schemaName = table.table_schema;
      
      if (preserveTables.includes(tableName)) {
        console.log(`   - ${schemaName}.${tableName} [保留]`);
        continue;
      }

      try {
        console.log(`   - ${schemaName}.${tableName}...`);
        await client.query(`TRUNCATE TABLE ${schemaName}.${tableName} RESTART IDENTITY CASCADE;`);
        console.log(`     ✓ 已清空`);
        successCount++;
      } catch (e) {
        console.log(`     ✗ 清空失败: ${e.message}`);
        failCount++;
      }
    }

    console.log(`   清空完成: 成功 ${successCount} 张, 失败 ${failCount} 张`);

    // 创建教材表（如果不存在）
    console.log('\n3. 创建/检查教材表...');
    await client.query(`
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
    `);
    console.log('   ✓ 教材表检查完成');

    // 创建教材课程表（如果不存在）
    console.log('4. 创建/检查教材课程表...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.textbook_lessons (
        id SERIAL PRIMARY KEY,
        textbook_id INTEGER NOT NULL REFERENCES public.textbooks(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(textbook_id, name)
      );
    `);
    console.log('   ✓ 教材课程表检查完成');

    // 创建索引
    console.log('5. 创建/检查索引...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_textbook_lessons_textbook_id ON public.textbook_lessons(textbook_id);`);
    console.log('   ✓ 索引检查完成');

    // 检查教材表是否已有数据
    const existingTextbooks = await client.query('SELECT COUNT(*) FROM public.textbooks');
    const hasTextbooks = parseInt(existingTextbooks.rows[0].count) > 0;

    if (!hasTextbooks) {
      // 教材表为空，初始化教材数据
      console.log('\n6. 初始化教材数据...');
      for (const textbook of textbooks) {
        const result = await client.query(
          'INSERT INTO public.textbooks (name, description, level, sort_order) VALUES ($1, $2, $3, $4) RETURNING id',
          [textbook.name, textbook.description, textbook.level, textbook.sortOrder]
        );
        const textbookId = result.rows[0].id;
        console.log(`   - ${textbook.name}`);

        // 插入课程数据
        const insertPromises = [];
        for (let i = 0; i < textbook.lessons; i++) {
          insertPromises.push(
            client.query(
              'INSERT INTO public.textbook_lessons (textbook_id, name, sort_order) VALUES ($1, $2, $3)',
              [textbookId, `第${textbook.startLesson + i}课`, i + 1]
            )
          );
        }
        await Promise.all(insertPromises);
        console.log(`     ✓ 已插入 ${textbook.lessons} 节课`);
      }
    } else {
      console.log('\n6. 教材表已有数据，跳过初始化');
      const count = await client.query('SELECT COUNT(*) FROM public.textbooks');
      const lessonCount = await client.query('SELECT COUNT(*) FROM public.textbook_lessons');
      console.log(`   现有教材: ${count.rows[0].count} 本, 课程: ${lessonCount.rows[0].count} 节`);
    }

    console.log('\n=== 数据库初始化完成 ===');
    console.log('- 已清空所有非教材课程表的数据');
    console.log('- 教材和课程数据已保留/初始化');

  } catch (error) {
    console.error('\n✗ 数据库初始化失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

initDatabase();
