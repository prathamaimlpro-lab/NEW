/* Dependency-free JavaScript tokenizer for GitHub-dark style highlighting. */
const KEYWORDS = new Set([
  'function', 'return', 'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'new', 'typeof',
  'instanceof', 'const', 'let', 'var', 'of', 'in', 'switch', 'case', 'default', 'try', 'catch',
  'finally', 'throw', 'class', 'extends', 'import', 'export', 'from', 'async', 'await', 'yield',
  'delete', 'void', 'null', 'undefined', 'true', 'false',
]);

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const TOKEN_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|([A-Za-z_$][\w$]*)|(\d+(?:\.\d+)?)|([{}()[\];,.:?<>=!+\-*/%&|^~]+)|([\s\S])/g;

export function highlightJS(code: string): string {
  let out = '';
  let last = 0;
  TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN_RE.exec(code))) {
    if (m.index > last) out += escapeHtml(code.slice(last, m.index));
    const full = m[0];
    const comment = m[1], str = m[2], ident = m[3], num = m[4], punct = m[5];
    if (comment) out += `<span class="tok-c">${escapeHtml(comment)}</span>`;
    else if (str) out += `<span class="tok-s">${escapeHtml(str)}</span>`;
    else if (ident) {
      if (KEYWORDS.has(ident)) out += `<span class="tok-k">${ident}</span>`;
      else if (/^\s*\(/.test(code.slice(m.index + ident.length))) out += `<span class="tok-f">${ident}</span>`;
      else out += escapeHtml(ident);
    } else if (num) out += `<span class="tok-n">${num}</span>`;
    else if (punct) out += `<span class="tok-p">${escapeHtml(punct)}</span>`;
    else out += escapeHtml(full);
    last = m.index + full.length;
  }
  if (last < code.length) out += escapeHtml(code.slice(last));
  return out;
}
