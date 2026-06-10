const sanitizeHtml = require('sanitize-html');

const allowedTags = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'blockquote', 'pre', 'code',
  'strong', 'b', 'em', 'i', 'u', 's',
  'ul', 'ol', 'li',
  'a', 'span',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img',
];

const allowedAttributes = {
  a: ['href', 'name', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  span: ['class'],
  code: ['class'],
  pre: ['class'],
};

function sanitizeRichText(html) {
  if (!html) return '';
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer',
      }, true),
    },
  });
}

module.exports = {
  sanitizeRichText,
};
