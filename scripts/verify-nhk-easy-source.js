const {
  decodeTextChunks,
  parseNhkEasierRssItems,
} = require('../lib/nhkEasySource');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const splitPi = [
  Buffer.from('フィリ', 'utf8'),
  Buffer.from([0xe3]),
  Buffer.from([0x83, 0x94]),
  Buffer.from('ン', 'utf8'),
];

assert(
  decodeTextChunks(splitPi) === 'フィリピン',
  'split UTF-8 chunks should decode without replacement characters'
);

const rss = `
  <rss>
    <channel>
      <item>
        <title>フィリピンの近くの海で大きい地震　被害が出ている</title>
        <link>https://nhkeasier.com/story/9688/</link>
        <description>&lt;p&gt;フィリピンの近くの海で、大きい地震がありました。&lt;/p&gt;</description>
        <pubDate>Mon, 8 Jun 2026 20:05:00 +0900</pubDate>
      </item>
    </channel>
  </rss>
`;

const [item] = parseNhkEasierRssItems(rss);
assert(item.title.includes('フィリピン'), 'RSS parser should keep フィリピン intact in title');
assert(item.description.includes('フィリピン'), 'RSS parser should keep フィリピン intact in description');

console.log('nhk easy source checks passed');
