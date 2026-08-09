const https = require('https');
const pool = require('../../../lib/db');
const { handleError, successResponse } = require('../../../lib/errorHandler');
const { parseIntegerParam } = require('../../../lib/requestValidation');
const { withAdminForMethods } = require('../../../lib/apiAuth');

const RSS_FEEDS = [
  'https://news.yahoo.co.jp/rss/topics/top-picks.xml',
  'https://news.yahoo.co.jp/rss/categories/domestic.xml',
  'https://news.yahoo.co.jp/rss/categories/world.xml',
  'https://news.yahoo.co.jp/rss/categories/it.xml',
  'https://news.yahoo.co.jp/rss/categories/business.xml',
];

const USER_AGENT = 'Mozilla/5.0 (compatible; JapaneseLearningApp/1.0)';

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.yahoo_news (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      link VARCHAR(500) NOT NULL UNIQUE,
      pub_date TIMESTAMP,
      description TEXT,
      fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_yahoo_news_pub_date
    ON public.yahoo_news(pub_date DESC);
  `);
}

function decodeHtmlEntities(text = '') {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function parseRSSItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const pubDate = extractTag(itemXml, 'pubDate');
    const description = extractTag(itemXml, 'description');

    if (title && link) {
      items.push({
        title: decodeHtmlEntities(title),
        link: decodeHtmlEntities(link),
        pub_date: pubDate ? new Date(pubDate) : null,
        description: description ? decodeHtmlEntities(description).replace(/<[^>]*>/g, '').substring(0, 500) : '',
      });
    }
  }

  return items;
}

function fetchRSS(url, followCount = 0) {
  if (followCount > 3) {
    return Promise.reject(new Error('Too many redirects'));
  }

  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/rss+xml, application/xml, */*',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchRSS(res.headers.location, followCount + 1).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.on('timeout', function () {
      this.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function cleanOldNews() {
  const result = await pool.query(
    "DELETE FROM public.yahoo_news WHERE pub_date < NOW() - INTERVAL '30 days' RETURNING id"
  );
  if (result.rows.length > 0) {
    console.log(`[yahoo-news] Cleaned ${result.rows.length} old items`);
  }
}

async function fetchAndStoreNews() {
  const allItems = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const xml = await fetchRSS(feedUrl);
      allItems.push(...parseRSSItems(xml));
    } catch (error) {
      console.error(`[yahoo-news] RSS fetch failed (${feedUrl}): ${error.message}`);
    }
  }

  const seen = new Set();
  const unique = allItems.filter((item) => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });

  let inserted = 0;
  for (const item of unique) {
    try {
      await pool.query(
        `INSERT INTO public.yahoo_news (title, link, pub_date, description, fetched_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (link) DO UPDATE SET
           title = EXCLUDED.title,
           pub_date = EXCLUDED.pub_date,
           description = EXCLUDED.description,
           fetched_at = NOW()`,
        [item.title, item.link, item.pub_date, item.description]
      );
      inserted++;
    } catch (error) {
      console.error(`[yahoo-news] Insert error: ${error.message}`);
    }
  }

  return inserted;
}

async function shouldRefresh() {
  const result = await pool.query('SELECT MAX(fetched_at) as last_fetch FROM public.yahoo_news');
  const lastFetch = result.rows[0]?.last_fetch;
  if (!lastFetch) return true;
  const sixHours = 6 * 60 * 60 * 1000;
  return Date.now() - new Date(lastFetch).getTime() > sixHours;
}

async function handler(req, res) {
  try {
    await ensureTable();

    switch (req.method) {
      case 'GET': {
        const countBefore = await pool.query('SELECT COUNT(*) FROM public.yahoo_news');
        if (parseInt(countBefore.rows[0].count) === 0) {
          try {
            await fetchAndStoreNews();
            await cleanOldNews();
          } catch (error) {
            console.error('[yahoo-news] Initial fetch failed:', error.message);
          }
        } else if (await shouldRefresh()) {
          fetchAndStoreNews().then(() => cleanOldNews()).catch(error =>
            console.error('[yahoo-news] Background refresh failed:', error.message)
          );
        }

        const { page = 1, limit = 50 } = req.query;
        const parsedPage = parseIntegerParam(page, { name: 'page', min: 1, max: 10000, defaultValue: 1 });
        const parsedLimit = parseIntegerParam(limit, { name: 'limit', min: 1, max: 100, defaultValue: 50 });
        if (parsedPage.error || parsedLimit.error) {
          return res.status(400).json({ error: parsedPage.error || parsedLimit.error });
        }

        const offset = (parsedPage.value - 1) * parsedLimit.value;
        const result = await pool.query(
          'SELECT * FROM public.yahoo_news ORDER BY pub_date DESC NULLS LAST, id DESC LIMIT $1 OFFSET $2',
          [parsedLimit.value, offset]
        );
        const countResult = await pool.query('SELECT COUNT(*) FROM public.yahoo_news');

        return successResponse(res, result.rows, '操作成功', {
          pagination: {
            page: parsedPage.value,
            limit: parsedLimit.value,
            total: parseInt(countResult.rows[0].count),
          },
        });
      }

      case 'POST': {
        const count = await fetchAndStoreNews();
        await cleanOldNews();
        return successResponse(res, { inserted: count }, '刷新成功');
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    return handleError(error, req, res);
  }
}

export default withAdminForMethods(handler, ['POST']);
