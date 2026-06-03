const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');

async function handler(req, res) {
  try {
    const { method } = req;
    
    switch (method) {
      case 'GET':
        await handleGetStats(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    handleError(error, req, res);
  }
}

async function handleGetStats(req, res) {
  try {
    // 获取用户总数
    const userResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(userResult.rows[0].count) || 0;

    // 获取上个月新增用户数
    const lastMonthResult = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '1 month'"
    );
    const lastMonthUsers = parseInt(lastMonthResult.rows[0].count) || 0;

    // 计算增长率（简化计算：假设上月用户数 = 当前用户数 - 上月新增用户数）
    let growthRate = 0;
    if (totalUsers > lastMonthUsers && lastMonthUsers > 0) {
      const previousMonthUsers = totalUsers - lastMonthUsers;
      growthRate = Math.round((lastMonthUsers / previousMonthUsers) * 100);
    }

    // 获取待处理反馈数量
    let pendingFeedback = 0;
    try {
      const feedbackResult = await pool.query('SELECT COUNT(*) as count FROM feedback WHERE status = $1', ['pending']);
      pendingFeedback = parseInt(feedbackResult.rows[0].count) || 0;
    } catch (e) {
      console.log('Feedback table may not have status column:', e.message);
    }

    // 获取最近活动
    let recentActivity = [];
    try {
      const activityResult = await pool.query(
        'SELECT username, last_login FROM users WHERE last_login IS NOT NULL ORDER BY last_login DESC LIMIT 10'
      );
      recentActivity = activityResult.rows.map(row => ({
        username: row.username,
        lastLogin: row.last_login
      }));
    } catch (e) {
      console.log('Users table may not have last_login column:', e.message);
    }

    successResponse(res, {
      totalUsers,
      growthRate,
      pendingFeedback,
      recentActivity
    });
  } catch (error) {
    handleError(error, req, res);
  }
}

export default handler;