const https = require('https');

const USER_AGENT = 'Mozilla/5.0 (compatible; JapaneseLearningApp/1.0)';
const NHK_EASY_LIST_URLS = [
  'https://www3.nhk.or.jp/news/easy/news-list.json',
  'https://www3.nhk.or.jp/news/easy/top-list.json',
];
const NHK_EASIER_FEED_URL = 'https://nhkeasier.com/feed/?no-furiganas=';

function decodeTextChunks(chunks) {
  return Buffer.concat(chunks).toString('utf8');
}

function requestText(url, { followCount = 0, timeout = 15000 } = {}) {
  if (followCount > 3) return Promise.reject(new Error('Too many redirects'));

  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      timeout,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json, text/html, */*',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).toString();
        res.resume();
        requestText(redirectUrl, { followCount: followCount + 1, timeout }).then(resolve).catch(reject);
        return;
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(Buffer.from(chunk)));
      res.on('end', () => {
        const data = decodeTextChunks(chunks);
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
          return;
        }
        resolve(data);
      });
    });

    req.on('error', reject);
    req.on('timeout', function () {
      this.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function normalizeNewsListPayload(payload) {
  const articles = [];
  collectArticleLikeObjects(payload, articles);

  return articles.map(item => {
    const link = item.easy_news_web_url || item.news_web_url || item.link || item.url;
    const pubDate = item.news_prearranged_time || item.news_creation_time || item.pubDate || item.pub_date || item.date;
    return {
      title: stripHtml(item.title || item.title_with_ruby || ''),
      link: normalizeNhkUrl(link),
      pub_date: pubDate ? new Date(pubDate) : null,
    };
  }).filter(item => item.title && item.link);
}

function collectArticleLikeObjects(value, output) {
  if (Array.isArray(value)) {
    value.forEach(item => collectArticleLikeObjects(item, output));
    return;
  }

  if (!value || typeof value !== 'object') return;

  const hasTitle = typeof value.title === 'string' || typeof value.title_with_ruby === 'string';
  const hasLink = value.easy_news_web_url || value.news_web_url || value.link || value.url;
  if (hasTitle && hasLink) {
    output.push(value);
    return;
  }

  Object.values(value).forEach(item => collectArticleLikeObjects(item, output));
}

function normalizeNhkUrl(link) {
  if (!link || typeof link !== 'string') return '';
  return new URL(link, 'https://www3.nhk.or.jp').toString();
}

function stripHtml(text) {
  return String(text)
    .replace(/<audio[\s\S]*?<\/audio>/gi, '')
    .replace(/<ul[\s\S]*?<\/ul>/gi, '')
    .replace(/<rt[\s\S]*?<\/rt>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNhkEasyHtml(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const bodyMatch = html.match(/<div[^>]+id=["']js-article-body["'][^>]*>([\s\S]*?)<\/div>/i);

  if (!titleMatch || !bodyMatch) {
    throw new Error('Cannot find relevant nodes to scrape');
  }

  const titleParts = stripHtml(decodeHtmlEntities(titleMatch[1])).split('|');
  return {
    title: stripHtml(titleParts[titleParts.length - 1] || ''),
    description: stripHtml(decodeHtmlEntities(bodyMatch[1])).substring(0, 500),
  };
}

async function fetchNhkNewsList() {
  let lastError;

  for (const url of NHK_EASY_LIST_URLS) {
    try {
      console.log(`[news] Fetching NHK Easy list: ${url}`);
      const body = await requestText(url, { timeout: 5000 });
      const items = normalizeNewsListPayload(JSON.parse(body));
      if (items.length > 0) return items;
      lastError = new Error(`No NHK Easy items found in ${url}`);
    } catch (err) {
      lastError = err;
      console.error(`[news] NHK Easy list error (${url}): ${err.message}`);
    }
  }

  throw lastError || new Error('No NHK Easy list URL configured');
}

function parseNhkEasierRssItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = decodeHtmlEntities(extractTag(itemXml, 'title'));
    const link = decodeHtmlEntities(extractTag(itemXml, 'link'));
    const pubDate = decodeHtmlEntities(extractTag(itemXml, 'pubDate'));
    const encodedDescription = extractTag(itemXml, 'description');
    const description = stripHtml(decodeHtmlEntities(encodedDescription)).substring(0, 500);

    if (title && link) {
      items.push({
        title: stripHtml(title),
        link,
        pub_date: pubDate ? new Date(pubDate) : null,
        description,
      });
    }
  }

  return items;
}

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function decodeHtmlEntities(text) {
  return String(text)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

async function fetchNhkEasierFeedNews({ limit = 50 } = {}) {
  console.log(`[news] Fetching NHK Easier feed fallback: ${NHK_EASIER_FEED_URL}`);
  const xml = await requestText(NHK_EASIER_FEED_URL);
  return parseNhkEasierRssItems(xml).slice(0, limit);
}

async function fetchNhkEasyNews({ limit = 50 } = {}) {
  let listItems;
  try {
    listItems = await fetchNhkNewsList();
  } catch (err) {
    console.error(`[news] Official NHK Easy list failed; using NHK Easier RSS fallback: ${err.message}`);
    return fetchNhkEasierFeedNews({ limit });
  }

  const limitedItems = listItems.slice(0, limit);
  const newsItems = [];

  for (const item of limitedItems) {
    try {
      const html = await requestText(item.link);
      const article = parseNhkEasyHtml(html);
      newsItems.push({
        title: article.title || item.title,
        link: item.link,
        pub_date: item.pub_date,
        description: article.description,
      });
    } catch (err) {
      console.error(`[news] NHK Easy article error (${item.link}): ${err.message}`);
      newsItems.push({
        title: item.title,
        link: item.link,
        pub_date: item.pub_date,
        description: '',
      });
    }
  }

  return newsItems;
}

module.exports = {
  decodeTextChunks,
  fetchNhkEasyNews,
  parseNhkEasierRssItems,
  normalizeNewsListPayload,
  parseNhkEasyHtml,
};
