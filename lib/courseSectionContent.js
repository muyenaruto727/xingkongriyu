function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseInlineMarkup(text) {
  const source = String(text ?? '');
  let html = '';
  let index = 0;

  while (index < source.length) {
    const emphasisStart = source.indexOf('**', index);
    const rest = source.slice(index);
    const bracketRubyMatch = /([\p{Script=Han}々〆ヶァ-ンーA-Za-z0-9０-９]+)\[([^\]]+)\]/u.exec(rest);
    const explicitRubyMatch = /\{([^{}|]+)\|([^{}|]+)\}/u.exec(rest);
    const rubyMatches = [
      bracketRubyMatch && {
        type: 'bracket',
        match: bracketRubyMatch,
        start: index + bracketRubyMatch.index,
      },
      explicitRubyMatch && {
        type: 'explicit',
        match: explicitRubyMatch,
        start: index + explicitRubyMatch.index,
      },
    ].filter(Boolean);
    const rubyCandidate = rubyMatches.sort((a, b) => a.start - b.start)[0];
    const rubyStart = rubyCandidate ? rubyCandidate.start : -1;

    const candidates = [emphasisStart, rubyStart].filter((item) => item >= 0);
    if (candidates.length === 0) {
      html += escapeHtml(source.slice(index));
      break;
    }

    const nextIndex = Math.min(...candidates);
    html += escapeHtml(source.slice(index, nextIndex));

    if (nextIndex === emphasisStart) {
      const emphasisEnd = source.indexOf('**', emphasisStart + 2);
      if (emphasisEnd === -1) {
        html += escapeHtml(source.slice(emphasisStart));
        break;
      }
      const emphasized = parseInlineMarkup(source.slice(emphasisStart + 2, emphasisEnd));
      html += `<span class="course-section-emphasis">${emphasized}</span>`;
      index = emphasisEnd + 2;
      continue;
    }

    const rubyTextIndex = rubyCandidate.type === 'explicit' ? 1 : 1;
    const rubyReadingIndex = rubyCandidate.type === 'explicit' ? 2 : 2;
    html += `<ruby>${escapeHtml(rubyCandidate.match[rubyTextIndex])}<rt>${escapeHtml(rubyCandidate.match[rubyReadingIndex])}</rt></ruby>`;
    index = rubyStart + rubyCandidate.match[0].length;
  }

  return html;
}

function splitDialogueLine(line) {
  const match = /^(.{1,16}?)([:：])\s*(.+)$/u.exec(line);
  if (!match) return null;

  return {
    speaker: match[1].trim(),
    colon: match[2],
    text: match[3].trim(),
  };
}

function renderAnnotatedTextToHtml(text) {
  return String(text ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const dialogue = splitDialogueLine(line);
      if (!dialogue) {
        return `<p>${parseInlineMarkup(line)}</p>`;
      }

      return [
        '<div class="course-dialogue-line">',
        `<span class="course-dialogue-speaker">${parseInlineMarkup(dialogue.speaker)}</span>`,
        `<span class="course-dialogue-colon">${escapeHtml(dialogue.colon)}</span>`,
        `<span class="course-dialogue-text">${parseInlineMarkup(dialogue.text)}</span>`,
        '</div>',
      ].join('');
    })
    .join('');
}

module.exports = {
  renderAnnotatedTextToHtml,
};
