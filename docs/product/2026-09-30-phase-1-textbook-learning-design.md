# 第一期：教材学习主线详细设计

## 1. 目标

第一期把《大家的日语》初级上、初级下、中级上、中级下组织成一条连续的主教材学习路径。用户登录后选择起始册次和课次，查看四册整体进度，进入一课完成各项内容，参加课后小测，并继续下一课。

网站原创独有课程继续使用现有 `courses → chapters → sections` 体系。原创课程与主教材在产品入口、数据结构和进度计算上相互独立。

一期完成后需要回答三个用户问题：

1. 我正在学什么？
2. 我这一课还剩什么？
3. 我接下来应该学什么？

## 2. 一期范围

### 包含

- 创建和修改一个当前学习计划。
- 从《大家的日语》四册中选择起始册次和起始课程。
- 查看四册主线总体进度、当前册次进度和每课状态。
- 把词汇、语法、听力、阅读和题目关联到教材课程。
- 查看一课的学习内容清单。
- 标记单项内容完成或取消完成。
- 记录课程学习中、已完成状态。
- 完成课后小测并记录成绩。
- 当前课程完成后推荐下一课。
- 在个人中心和首页提供“继续学习”入口。
- 保留原创课程列表和详情入口，并在“我的学习”中提供独立的原创课程区域。

### 暂不包含

- 自动生成每日任务。
- 间隔复习算法。
- 错题本和薄弱项分析。
- 强制锁课。
- 支付、会员和课程购买。
- 多个同时激活的学习计划。
- 原创课程的报名、购买和精细进度系统。原创课程一期继续使用现有浏览方式。

## 3. 现有系统基础

当前已有以下能力可以复用：

- `textbooks`：教材，目前包含《大家的日语》和其他教材数据。
- `textbook_lessons`：教材中的课程，如“第 5 课”。
- `vocabulary`：词汇，已有教材和课程字段。
- `grammar`、`listening`、`reading`：独立内容模块。
- `questions`：题库。
- `courses → chapters → sections`：通用课程和文章/视频内容。
- `exam_records`：用户考试记录。
- 登录鉴权和 `requireAuth`。

主教材学习线只使用以下四条 `textbooks` 记录：

1. 大家的日语初级上。
2. 大家的日语初级下。
3. 大家的日语中级上。
4. 大家的日语中级下。

数据库中的其他教材记录不出现在主线学习计划设置页，也不参与主线总体进度。

现有 `courses → chapters → sections` 明确定义为原创课程体系。原创课程继续拥有自己的课程列表、课程详情、章节和小节，不作为主教材学习进度的主键，也不会推进用户的《大家的日语》当前课次。

## 4. 双轨产品边界

| 维度 | 主教材学习 | 原创课程 |
|---|---|---|
| 内容范围 | 《大家的日语》四册 | 网站自有专题课、技能课、特色课 |
| 核心数据 | `textbooks → textbook_lessons` | `courses → chapters → sections` |
| 学习顺序 | 四册和课次连续排序 | 每门课程自行组织章节 |
| 当前进度 | 一个主线当前课次 | 不影响主线当前课次 |
| 一期进度 | 完整支持 | 保留现有浏览，后续独立增加 |
| 内容复用 | 词汇、语法、听力、阅读、题目 | 可引用相同内容，但使用独立关联 |

一期新增的 `lesson_progress`、`content_progress` 和 `lesson_quiz_attempts` 只服务主教材线。未来原创课程增加进度时，使用 `course_enrollments`、`course_section_progress` 等独立表，不复用主教材的课次进度表。

## 5. 总体架构

```text
learning_tracks
    └── learning_track_textbooks
            └── textbooks（仅大家的日语四册）
                    └── textbook_lessons
            └── lesson_content_items
                    ├── vocabulary
                    ├── grammar
                    ├── listening
                    ├── reading
                    ├── section
                    └── question

users
    └── learning_plans
            ├── lesson_progress
            ├── content_progress
            └── lesson_quiz_attempts
```

原创课程保持独立：

```text
courses
    └── chapters
            └── sections
```

设计重点是 `lesson_content_items`。它作为统一关联层，避免在每一种内容表中反复增加教材和课程外键，也让课程聚合接口可以用同一种方式返回所有内容。

### 5.1 learning_tracks

定义主教材轨道。首期只有一条记录。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | SERIAL PK | 轨道 ID |
| code | VARCHAR(50) UNIQUE | 固定为 `minna_no_nihongo` |
| name | VARCHAR(100) | 大家的日语主线 |
| status | VARCHAR(20) | active、inactive |
| created_at | TIMESTAMP | 创建时间 |

### 5.2 learning_track_textbooks

定义四册在主线中的顺序，避免依赖教材名称或硬编码数据库 ID。

| 字段 | 类型 | 说明 |
|---|---|---|
| track_id | INTEGER FK learning_tracks(id) | 主教材轨道 |
| textbook_id | INTEGER FK textbooks(id) | 教材册次 |
| volume_order | SMALLINT | 1–4 |
| display_name | VARCHAR(100) | 初级上、初级下、中级上、中级下 |

唯一约束：`(track_id, textbook_id)` 和 `(track_id, volume_order)`。

## 6. 学习进度数据库设计

### 6.1 learning_plans

保存用户当前教材计划。第一期每个用户只能有一个 `active` 计划，但保留历史计划。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGSERIAL PK | 计划 ID |
| user_id | INTEGER FK users(id) | 用户 |
| track_id | INTEGER FK learning_tracks(id) | 固定为大家的日语主线 |
| start_lesson_id | INTEGER FK textbook_lessons(id) | 起始课程 |
| current_lesson_id | INTEGER FK textbook_lessons(id) | 当前推荐课程 |
| weekly_days | SMALLINT | 每周学习天数，1–7 |
| daily_minutes | SMALLINT | 每日计划分钟数，建议 10–180 |
| status | VARCHAR(20) | active、paused、completed |
| started_at | TIMESTAMP | 开始时间 |
| completed_at | TIMESTAMP NULL | 完成时间 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

约束和索引：

- `weekly_days BETWEEN 1 AND 7`。
- `daily_minutes BETWEEN 10 AND 180`。
- 部分唯一索引：每个用户最多一个 `status = 'active'` 的计划。
- 校验 `start_lesson_id` 和 `current_lesson_id` 必须属于主线四册。该校验放在服务层事务中完成。
- 跨册推进时，根据 `learning_track_textbooks.volume_order` 和 `textbook_lessons.sort_order` 选择下一课。

### 6.2 lesson_content_items

把现有内容挂到一节教材课程，并定义学习顺序和是否必修。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGSERIAL PK | 关联 ID |
| lesson_id | INTEGER FK textbook_lessons(id) | 教材课程 |
| content_type | VARCHAR(30) | vocabulary、grammar、listening、reading、section、question |
| content_id | INTEGER | 对应内容表 ID |
| sort_order | INTEGER | 同类型及整课展示顺序 |
| is_required | BOOLEAN | 是否计入课程完成条件 |
| estimated_minutes | SMALLINT | 预计学习时长 |
| created_at | TIMESTAMP | 创建时间 |

约束和索引：

- 唯一约束：`(lesson_id, content_type, content_id)`。
- 索引：`(lesson_id, sort_order)`。
- `content_type` 使用检查约束限制可选值。
- `content_id` 是多态关联，数据库无法直接设置跨表外键；新增和删除关联时由服务层检查目标内容是否存在。

### 6.3 lesson_progress

记录用户对一节课的汇总状态。它用于快速展示教材目录，不替代单项进度。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGSERIAL PK | 进度 ID |
| user_id | INTEGER FK users(id) | 用户 |
| plan_id | BIGINT FK learning_plans(id) | 所属计划 |
| lesson_id | INTEGER FK textbook_lessons(id) | 教材课程 |
| status | VARCHAR(20) | not_started、in_progress、completed |
| required_count | INTEGER | 必修内容总数快照 |
| completed_count | INTEGER | 已完成必修内容数 |
| progress_percent | SMALLINT | 0–100 |
| quiz_best_score | SMALLINT NULL | 课后测验最高分 |
| started_at | TIMESTAMP NULL | 首次开始 |
| completed_at | TIMESTAMP NULL | 完成时间 |
| updated_at | TIMESTAMP | 更新时间 |

唯一约束：`(plan_id, lesson_id)`。

### 6.4 content_progress

记录用户完成的具体学习内容。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGSERIAL PK | 记录 ID |
| user_id | INTEGER FK users(id) | 用户 |
| plan_id | BIGINT FK learning_plans(id) | 学习计划 |
| lesson_id | INTEGER FK textbook_lessons(id) | 所属课程 |
| lesson_content_item_id | BIGINT FK lesson_content_items(id) | 内容关联项 |
| status | VARCHAR(20) | not_started、in_progress、completed |
| progress_value | INTEGER | 视频/音频可保存播放进度，一般内容用 0 或 100 |
| first_opened_at | TIMESTAMP NULL | 首次打开 |
| completed_at | TIMESTAMP NULL | 完成时间 |
| updated_at | TIMESTAMP | 更新时间 |

唯一约束：`(plan_id, lesson_content_item_id)`。

### 6.5 lesson_quiz_attempts

保存课后小测记录。小测题目通过 `lesson_content_items.content_type = 'question'` 与课程关联。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGSERIAL PK | 作答 ID |
| user_id | INTEGER FK users(id) | 用户 |
| plan_id | BIGINT FK learning_plans(id) | 学习计划 |
| lesson_id | INTEGER FK textbook_lessons(id) | 教材课程 |
| score | SMALLINT | 0–100 |
| correct_count | INTEGER | 正确数 |
| total_count | INTEGER | 总题数 |
| answers | JSONB | 用户答案 |
| question_snapshot | JSONB | 题目和正确答案快照 |
| passed | BOOLEAN | 是否通过 |
| duration_seconds | INTEGER | 用时 |
| created_at | TIMESTAMP | 提交时间 |

一期默认通过线为 60 分。后台后续可以增加每课独立通过线。

## 7. 课程完成规则

课程进度只计算 `is_required = true` 的非题目内容：

```text
内容进度 = 已完成必修内容数 / 必修内容总数
```

课程状态规则：

- 从未打开任何内容：`not_started`。
- 打开或完成任意内容：`in_progress`。
- 所有必修内容完成，并且存在课后题时小测达到 60 分：`completed`。
- 如果课程没有课后题，所有必修内容完成即可完成课程。
- 如果课程没有任何必修内容，不允许自动完成，后台显示内容配置异常。

用户可以访问主线四册中的任何课程。完成当前课程后，系统先查找当前册下一课；当前册完成后，自动进入下一册第一课。中级下最后一课完成后，学习计划状态更新为 `completed`。

## 8. 接口设计

所有学习计划和进度接口使用 `requireAuth`，用户 ID 只从令牌读取。

### 7.1 学习计划

#### GET /api/learning-plan

返回当前激活计划及教材汇总进度。

```json
{
  "id": 12,
  "track": { "id": 1, "code": "minna_no_nihongo", "name": "大家的日语主线" },
  "currentTextbook": { "id": 5, "name": "大家的日语初级上" },
  "currentLesson": { "id": 5, "name": "第5课" },
  "weeklyDays": 5,
  "dailyMinutes": 30,
  "completedLessons": 3,
  "totalLessons": 75,
  "progressPercent": 27
}
```

无计划时返回成功响应，`data: null`，前端进入创建计划引导。

#### POST /api/learning-plan

请求：

```json
{
  "trackCode": "minna_no_nihongo",
  "startLessonId": 5,
  "weeklyDays": 5,
  "dailyMinutes": 30
}
```

创建计划时在事务中：暂停旧的 active 计划、验证课程属于《大家的日语》主线、创建计划、创建起始课程的 `lesson_progress`。

#### PUT /api/learning-plan

允许修改学习节奏、暂停计划和恢复计划。用户可以修改起始位置并重建计划，旧计划作为历史记录保留。

### 7.2 教材进度目录

#### GET /api/learning-plan/lessons

返回所选教材全部课程及用户状态：

```json
[{
  "id": 5,
  "name": "第5课",
  "sortOrder": 1,
  "status": "in_progress",
  "progressPercent": 45,
  "completedCount": 9,
  "requiredCount": 20,
  "quizBestScore": null
}]
```

### 7.3 课程学习聚合

#### GET /api/learning-lessons/:lessonId

返回课程信息、分组内容、单项完成状态和小测状态：

```json
{
  "lesson": { "id": 5, "name": "第5课" },
  "progress": { "status": "in_progress", "percent": 45 },
  "groups": [
    { "type": "vocabulary", "title": "词汇", "completed": 8, "total": 15, "items": [] },
    { "type": "grammar", "title": "语法", "completed": 1, "total": 3, "items": [] }
  ],
  "quiz": { "questionCount": 5, "bestScore": null, "passed": false },
  "nextLessonId": 6
}
```

服务层按 `content_type` 批量读取对应内容表，禁止逐条查询，避免 N+1 查询。

### 7.4 单项进度

#### PUT /api/learning-progress/content/:itemId

请求：

```json
{ "status": "completed", "progressValue": 100 }
```

更新单项进度后，在同一事务内重新计算 `lesson_progress`。接口需要幂等，重复提交完成状态不会增加计数。

### 7.5 课后小测

#### GET /api/learning-lessons/:lessonId/quiz

返回题目时不返回正确答案。

#### POST /api/learning-lessons/:lessonId/quiz

服务端重新查询题库正确答案并评分，保存题目快照和作答记录，然后更新课程最高分和完成状态。不能信任客户端上传的正确答案或分数。

## 9. 页面设计

### 8.1 首次创建学习计划

路径建议：`/my-learning/setup`。

三步表单：

1. 选择起始册次：初级上、初级下、中级上、中级下。
2. 选择起始课程：默认所选册第一课，也允许有基础用户从中间开始。
3. 设置节奏：每周 3/5/7 天，每天 15/30/45/60 分钟，也支持自定义。

提交成功后跳转 `/my-learning`。

### 8.2 我的学习

路径建议：`/my-learning`。

页面从上到下：

- 主教材卡片：显示“大家的日语主线”、当前册次、四册总体百分比和已完成课数。
- 继续学习卡片：当前课程、完成比例、预计剩余时间、继续学习按钮。
- 课程目录：按顺序显示未开始、学习中、已完成状态。
- 学习节奏：每周天数、每日分钟数和修改入口。
- 原创课程区域：展示已发布原创课程入口，不计入主教材完成百分比。

无学习计划时显示创建计划引导。登录失效时跳转登录页，并保留返回地址。

### 8.3 课程学习页

路径建议：`/my-learning/lessons/[lessonId]`。

页面结构：

```text
教材 / 第 5 课                         本课进度 45%

词汇 8/15
  □ 单词卡片或进入词汇学习

语法 1/3
  □ 语法点详情

听力 0/2
  □ 听力材料

阅读 0/1
  □ 阅读材料

课后小测  未完成
```

每个内容项支持“开始学习”和“标记完成”。内容详情页返回时保留课程位置。课程顶部固定显示进度，但不因进度未完成阻止访问其他课程。

### 9.4 首页和个人中心入口

- 已登录且有计划：首页显示“继续第 X 课”。
- 已登录且无计划：首页显示“创建学习计划”。
- 个人中心新增“我的学习”卡片，不把进度内容混入现有收藏列表。
- 导航中将“主教材学习”和“原创课程”作为两个清晰入口。

## 10. 后台配置

一期需要一个基础的“教材内容编排”入口，放在教材管理中。

管理员操作流程：

1. 从《大家的日语》四册中选择册次和课程。
2. 按内容类型搜索现有词汇、语法、听力、阅读、小节和题目。
3. 批量添加到课程。
4. 设置顺序、是否必修和预计时长。
5. 预览课程内容完整度。

完整度检查至少包括：

- 是否有必修内容。
- 是否有词汇或语法内容。
- 题目数量是否达到建议值。
- 关联内容是否已被删除。

原创课程继续由现有课程管理维护。主教材内容编排器不会修改 `courses`、`chapters` 或 `sections` 的层级关系。

## 11. 状态计算和事务边界

以下操作必须使用数据库事务：

- 创建新学习计划并暂停旧计划。
- 更新单项完成状态并重算课程进度。
- 提交小测、保存记录并重算课程状态。
- 删除课程内容关联并重算受影响用户的课程进度。

课程汇总进度由服务函数统一计算，页面和各接口不能各自实现一套规则。建议新增：

- `lib/learningPlan.js`：计划验证和当前课程选择。
- `lib/lessonProgress.js`：内容计数、课程状态和下一课计算。
- `lib/lessonContent.js`：多类型内容校验和批量聚合。
- `lib/lessonQuiz.js`：服务端评分和通过判定。

## 12. 异常处理

- 主线、册次或课程不存在：404。
- 起始课程不属于《大家的日语》四册：400。
- 用户访问其他人的计划或进度：404，避免暴露记录存在。
- 内容关联指向已删除内容：聚合接口跳过该项并记录服务器日志，后台完整度检查显示错误。
- 课程内容为空：页面显示“课程内容正在准备中”，不创建完成记录。
- 重复点击完成：接口幂等返回当前状态。
- 小测题目不足：禁止开始小测，并提示管理员补充题目。

## 13. 数据迁移和初始化

一期新增一个数据库迁移脚本，创建七张新表、约束和索引，并初始化一条 `minna_no_nihongo` 主线及四册顺序。

现有词汇已带教材和课程文本字段，可以编写一次性脚本：

1. 仅处理《大家的日语》四册，根据教材名称匹配 `textbooks.name`。
2. 根据课程名称匹配 `textbook_lessons.name`。
3. 为匹配成功的词汇创建 `lesson_content_items`。
4. 输出未匹配教材、未匹配课程和重复关联报告。

语法、听力、阅读和题目由后台编排器人工关联。因为当前这些模块缺少统一教材课程字段，一期不做模糊自动匹配。

原创课程数据不写入主教材进度表。后续建设原创课程进度时单独迁移，不需要转换主教材计划数据。

## 14. 权限与隐私

- 所有个人学习数据接口必须登录。
- 普通用户只能读写自己的计划和进度。
- 内容编排接口只允许管理员。
- 学习计划接口不接受客户端传入 `user_id`。
- 课后小测由服务端评分。
- 日志不记录完整令牌和用户答案正文。

## 15. 测试设计

### 单元测试

- 计划起始课程必须属于《大家的日语》四册。
- 初级上最后一课完成后正确进入初级下第一课。
- 中级下最后一课完成后计划状态变为 completed。
- 原创课程访问不会改变主教材当前课次。
- 每个用户只能有一个 active 计划。
- 必修内容进度百分比计算。
- 无小测课程的完成判定。
- 有小测课程达到和未达到 60 分的判定。
- 下一课按 `sort_order` 选择。
- 重复完成同一内容不重复计数。

### API 测试

- 未登录访问返回 401。
- 用户不能访问其他用户进度。
- 创建、暂停和恢复学习计划。
- 获取教材目录和课程聚合内容。
- 单项内容完成后课程百分比正确更新。
- 小测答案由服务端评分。

### 页面验收

- 新用户可在三步内创建学习计划。
- 用户刷新页面后进度保持。
- 在手机和桌面端可以完成课程操作。
- 空计划、空课程、接口失败都有明确状态。
- 完成课程后显示下一课入口。

## 16. 监控指标

一期上线后重点观察：

- 创建学习计划的用户比例。
- 创建计划后首次开始课程的比例。
- 第一课完成率。
- 课程平均完成时间。
- 课后小测参与率和通过率。
- 7 天内返回继续学习的用户比例。
- 内容类型完成率：词汇、语法、听力和阅读。

## 17. 实施顺序

1. 新增主教材轨道、册次顺序、进度表、约束、索引和数据迁移脚本。
2. 实现统一的课程内容关联和进度计算服务。
3. 实现学习计划、课程目录、课程聚合和进度接口。
4. 实现课后小测接口和服务端评分。
5. 实现后台教材内容编排器。
6. 实现学习计划设置页。
7. 实现“我的学习”和课程学习页。
8. 增加首页、导航和个人中心入口。
9. 执行数据关联、完整度检查和端到端验收。

## 18. 一期验收标准

- 登录用户可以创建一个《大家的日语》主线学习计划。
- 主线设置页只出现初级上、初级下、中级上、中级下。
- 用户可以从指定课程开始学习。
- 教材目录能显示每课状态和正确进度。
- 每课至少支持词汇、语法、听力、阅读和测验五类内容。
- 用户完成内容后刷新页面，状态不会丢失。
- 所有必修内容和小测条件满足后，课程自动完成。
- 课程完成后按四册顺序推荐下一课，并支持跨册推进。
- 原创课程继续通过 `courses → chapters → sections` 独立展示，不改变主教材进度。
- 管理员可以关联、排序和移除课程内容。
- 所有个人进度接口均通过身份鉴权。
- 不影响现有词汇、语法、听力、阅读、考试和独立课程页面。
