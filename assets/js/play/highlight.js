// Syntax highlighting for the playground editor: a tokenizer for Xo's
// lexical grammar (spec core 1), close enough for coloring. It builds DOM
// nodes with textContent, never HTML from the source.

// The 28 keywords of core 1.4 (internal/token).
const KEYWORDS = new Set(("as break const continue defer else ensures enum fn for if in interface " +
  "invariant let match pub requires return scope select struct test type use uses var while").split(" "));
const CONSTANTS = new Set(["true", "false", "None", "Some", "Ok", "Err", "self"]);

const NUMBER = /0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?(?:ns|us|ms|s|m|h)?/y;
const IDENT = /[A-Za-z_][A-Za-z0-9_]*/y;
const SPACE = /\s+/y;

// tokens returns [class, text] pairs covering src; class "" is plain.
export function tokens(src) {
  const out = [];
  const push = (cls, text) => {
    if (!text) return;
    const last = out[out.length - 1];
    if (last && last[0] === cls) last[1] += text;
    else out.push([cls, text]);
  };
  scan(src, 0, src.length, push, false);
  return out;
}

// scan tokenizes src[i:end]; inside an interpolation, an unmatched `}`
// ends the scan and its position is returned.
function scan(src, i, end, push, interp) {
  let depth = 0;
  while (i < end) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "/") {
      const j = lineEnd(src, i, end);
      push("c", src.slice(i, j));
      i = j;
      continue;
    }
    if (interp && c === "{") depth++;
    if (interp && c === "}") {
      if (depth === 0) return i;
      depth--;
    }
    if (c === '"' || ((c === "r" || c === "b") && (src[i + 1] === '"' || (c === "r" && src[i + 1] === "#")))) {
      i = string(src, i, end, push);
      continue;
    }
    if (c === "'") {
      const m = /'(?:\\[^']*|[^'\\\n])'/y;
      m.lastIndex = i;
      const r = m.exec(src);
      if (r) { push("s", r[0]); i += r[0].length; continue; }
    }
    if (c === "?" && src.startsWith("???", i)) { push("h", "???"); i += 3; continue; }
    if (c >= "0" && c <= "9") {
      NUMBER.lastIndex = i;
      const r = NUMBER.exec(src);
      push("m", r[0]);
      i += r[0].length;
      continue;
    }
    IDENT.lastIndex = i;
    let r = IDENT.exec(src);
    if (r) {
      const w = r[0];
      let cls = "";
      if (KEYWORDS.has(w)) cls = "k";
      else if (CONSTANTS.has(w)) cls = "kc";
      else if (/^[A-Z]/.test(w)) cls = "t";
      else if (src[i + w.length] === "(") cls = "f";
      push(cls, w);
      i += w.length;
      continue;
    }
    SPACE.lastIndex = i;
    r = SPACE.exec(src);
    if (r) { push("", r[0]); i += r[0].length; continue; }
    push("p", c);
    i++;
  }
  return i;
}

function lineEnd(src, i, end) {
  const j = src.indexOf("\n", i);
  return j < 0 || j > end ? end : j;
}

// string pushes one string literal starting at i and returns its end.
function string(src, i, end, push) {
  const start = i;
  if (src[i] === "r") {
    // r"..." or r#"..."# (any number of #): no escapes, no interpolation
    let hashes = 0;
    i++;
    while (src[i] === "#") { hashes++; i++; }
    const close = '"' + "#".repeat(hashes);
    const j = src.indexOf(close, i + 1);
    const stop = j < 0 ? end : j + close.length;
    push("s", src.slice(start, stop));
    return stop;
  }
  const bytes = src[i] === "b";
  if (bytes) i++;
  const triple = src.startsWith('"""', i);
  i += triple ? 3 : 1;
  let run = i;
  push("s", src.slice(start, i));
  while (i < end) {
    const c = src[i];
    if (c === "\\") { i += 2; continue; }
    if (!triple && c === "\n") break;
    if (triple ? src.startsWith('"""', i) : c === '"') {
      const q = triple ? 3 : 1;
      push("s", src.slice(run, i + q));
      return i + q;
    }
    if (!bytes && c === "$" && src[i + 1] === "{") {
      push("s", src.slice(run, i));
      push("si", "${");
      const j = scan(src, i + 2, end, push, true);
      if (j < end && src[j] === "}") { push("si", "}"); i = j + 1; }
      else i = j;
      run = i;
      continue;
    }
    i++;
  }
  push("s", src.slice(run, Math.min(i, end)));
  return Math.min(i, end);
}

// render replaces the children of el with the highlighted source. marks
// are [start, end, severity] ranges (UTF-16 offsets) to underline: the
// diagnostics of the last check. A marked span records its offset in
// data-at, for the page to find the diagnostics under the pointer.
export function render(el, src, marks = []) {
  const frag = document.createDocumentFragment();
  const cuts = new Set();
  for (const [a, b] of marks) { cuts.add(a); cuts.add(b); }
  const markAt = (i) => {
    let sev = "";
    for (const [a, b, s] of marks) if (i >= a && i < b && sev !== "error") sev = s;
    return sev;
  };
  let off = 0;
  for (const [cls, text] of tokens(src)) {
    // split the token where a mark starts or ends
    let from = 0;
    for (let k = 1; k <= text.length; k++) {
      if (k < text.length && !cuts.has(off + k)) continue;
      const piece = text.slice(from, k);
      const sev = marks.length ? markAt(off + from) : "";
      if (!cls && !sev) frag.append(piece);
      else {
        const span = document.createElement("span");
        span.className = (cls ? "x" + cls : "") + (sev ? " xmark-" + sev : "");
        span.textContent = piece;
        if (sev) span.dataset.at = off + from;
        frag.append(span);
      }
      from = k;
    }
    off += text.length;
  }
  // a final newline keeps the overlay as tall as the textarea's content
  frag.append("\n ");
  el.replaceChildren(frag);
}
