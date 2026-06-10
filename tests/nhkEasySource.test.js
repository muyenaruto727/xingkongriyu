const assert = require('assert');

const {
  normalizeNewsListPayload,
  parseNhkEasierRssItems,
  parseNhkEasyHtml,
} = require('../lib/nhkEasySource');

const sampleNewsList = [
  {
    '2026-06-10': [
      {
        title: 'テストのニュース',
        easy_news_web_url: 'https://www3.nhk.or.jp/news/easy/test/test.html',
        news_prearranged_time: '2026-06-10 12:34:56',
      },
    ],
  },
];

const normalized = normalizeNewsListPayload(sampleNewsList);
assert.strictEqual(normalized.length, 1);
assert.deepStrictEqual(normalized[0], {
  title: 'テストのニュース',
  link: 'https://www3.nhk.or.jp/news/easy/test/test.html',
  pub_date: new Date('2026-06-10 12:34:56'),
});

const article = parseNhkEasyHtml(`
  <html>
    <head><title>NHK NEWS WEB EASY | 本文のテスト</title></head>
    <body>
      <div id="js-article-body">
        <p><span>学校</span><ruby>学校<rt>がっこう</rt></ruby><span>へ行きます。</span></p>
        <p><span>二つ目の文です。</span></p>
      </div>
    </body>
  </html>
`);

assert.strictEqual(article.title, '本文のテスト');
assert.strictEqual(article.description, '学校学校へ行きます。 二つ目の文です。');

const rssItems = parseNhkEasierRssItems(`
  <rss>
    <channel>
      <item>
        <title>RSSのテスト</title>
        <link>https://nhkeasier.com/story/1/</link>
        <description>&lt;p&gt;&lt;ruby&gt;学校&lt;rt&gt;がっこう&lt;/rt&gt;&lt;/ruby&gt;へ行きます。&lt;/p&gt;&lt;audio src="x"&gt;&lt;/audio&gt;</description>
        <pubDate>Tue, 9 Jun 2026 20:15:00 +0900</pubDate>
      </item>
    </channel>
  </rss>
`);

assert.strictEqual(rssItems.length, 1);
assert.deepStrictEqual(rssItems[0], {
  title: 'RSSのテスト',
  link: 'https://nhkeasier.com/story/1/',
  pub_date: new Date('Tue, 9 Jun 2026 20:15:00 +0900'),
  description: '学校へ行きます。',
});

console.log('nhkEasySource tests passed');
