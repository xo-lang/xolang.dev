// The REPL page (/repl/): the REPL (repl.js, as in the playground's repl
// tab) beside a guided walkthrough. Each step's "type it" button types an
// entry into the REPL's input, a character at a time (at once when the
// visitor prefers reduced motion, or presses a key or the button again),
// and the visitor presses Enter to run it. The step reached is kept in
// localStorage. The steps are data/repl.json, which the browser test
// (scripts/test-playground.mjs) runs entry by entry.

import { client, el, consented, agree, sizes } from "./client.js";
import { mountRepl } from "./repl.js";

const root = document.getElementById("repl");
const statusEl = document.getElementById("play-status");
const input = document.getElementById("play-repl-in");
const log = document.getElementById("play-repl-log");
const consentBox = document.getElementById("play-consent");
const consentBtn = document.getElementById("play-consent-ok");
const progress = document.getElementById("repl-progress");
const stepEl = document.getElementById("repl-step");
const prevBtn = document.getElementById("repl-prev");
const nextBtn = document.getElementById("repl-next");
const countEl = document.getElementById("repl-count");
const barText = document.getElementById("repl-bar-t");
const barType = document.getElementById("repl-bar-type");
const barNext = document.getElementById("repl-bar-next");
const steps = JSON.parse(document.getElementById("repl-steps").textContent);

const STEP = "xo-repl-step";
const setStatus = (s) => { statusEl.textContent = s; };
const request = client(root.dataset.toolchain, setStatus);

function askConsent() {
  consentBox.hidden = false;
  consentBox.classList.remove("flash");
  void consentBox.offsetWidth;
  consentBox.classList.add("flash");
  consentBtn.focus();
}

const repl = mountRepl({
  root,
  log,
  form: document.getElementById("play-repl-form"),
  input,
  request,
  setStatus,
  ready: consented,
  ask: askConsent,
});

consentBtn.addEventListener("click", () => {
  agree();
  consentBox.hidden = true;
  // start the compiler now, so the first entry does not wait for it
  request("repl", { cmd: "defs" }, (s) => setStatus(s + "…")).then(() => setStatus("Ready.")).catch((e) => setStatus(e.message));
  input.focus();
});

// ---- typing an entry --------------------------------------------------

const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let typing = null; // { finish } while an entry is being typed

// typeInto fills the REPL's input with src, a character at a time, and
// leaves the caret at its end for the visitor to press Enter.
function typeInto(src) {
  if (typing) typing.finish();
  input.value = "";
  repl.fit();
  input.focus({ preventScroll: true });
  input.scrollIntoView({ block: "nearest", behavior: reduced.matches ? "auto" : "smooth" });
  let i = 0;
  let timer = 0;
  const done = () => {
    clearInterval(timer);
    input.value = src;
    repl.fit();
    input.classList.remove("typing");
    input.setSelectionRange(src.length, src.length);
    input.removeEventListener("keydown", skip, true);
    typing = null;
    root.dataset.typed = String(Number(root.dataset.typed || 0) + 1);
  };
  // any key finishes the typing first (Enter then runs the whole entry)
  const skip = () => done();
  typing = { finish: done };
  if (reduced.matches || !src.length) { done(); return; }
  input.classList.add("typing");
  input.addEventListener("keydown", skip, true);
  // about 2 s for any entry, at most 60 characters a second
  const per = Math.max(1, Math.ceil(src.length / 90));
  timer = setInterval(() => {
    i = Math.min(src.length, i + per);
    input.value = src.slice(0, i);
    repl.fit();
    if (i >= src.length) done();
  }, 22);
}

// ---- the walkthrough --------------------------------------------------

let at = 0;
try { at = Math.min(steps.length - 1, Math.max(0, parseInt(localStorage.getItem(STEP), 10) || 0)); } catch (e) {}
let reached = at;

// inline turns `code` in a step's text into code elements (the text is
// the site's own, but it goes in as text, not HTML)
function inline(text) {
  const p = el("p");
  text.split(/(`[^`]+`)/).forEach((part, k) => p.append(k % 2 ? el("code", "", part.slice(1, -1)) : part));
  return p;
}

// codeLines shows an entry's source a line per element, so a long line
// wraps with its continuation indented past the line's own indent
function codeLines(pre, src) {
  for (const line of src.split("\n")) {
    const lead = line.length - line.trimStart().length;
    const s = el("span", "ln", line.slice(lead) || "\u200b");
    s.style.setProperty("--in", String(lead));
    pre.append(s);
  }
}

// the bar under the input (narrow screens): the step, the entry its
// "type it" types next (the first one not typed yet), and the next step
function bar() {
  const s = steps[at];
  const items = [...stepEl.querySelectorAll(".repl-try")];
  const k = items.findIndex((li) => !li.classList.contains("ran"));
  const t = el("b", "", (at + 1) + "/" + steps.length + " " + s.title);
  if (k < 0) {
    barText.replaceChildren(t, el("span", "", "all typed: on to the next step"));
    barType.hidden = true;
  } else {
    barText.replaceChildren(t, el("code", "", s.tries[k].src.split("\n")[0]));
    barType.hidden = false;
    barType.dataset.try = String(k);
  }
  barNext.textContent = at === steps.length - 1 ? "start over" : "next";
}

function show(n) {
  at = n;
  reached = Math.max(reached, n);
  try { localStorage.setItem(STEP, String(n)); } catch (e) {}
  const s = steps[n];
  const tries = el("ul", "repl-tries");
  s.tries.forEach((t, k) => {
    const li = el("li", "repl-try");
    const pre = el("pre");
    codeLines(pre, t.src);
    if (t.why) { const w = inline(t.why); w.className = "why"; pre.append(w); }
    const b = el("button", "btn ghost", "type it");
    b.type = "button";
    b.dataset.try = String(k);
    b.setAttribute("aria-label", "Type " + t.src.split("\n")[0] + " into the REPL");
    b.addEventListener("click", () => { typeInto(t.src); li.classList.add("ran"); bar(); });
    li.append(pre, b);
    tries.append(li);
  });
  stepEl.replaceChildren(el("div", "n", "STEP " + (n + 1) + " OF " + steps.length), el("h2", "", s.title), inline(s.text), tries);
  for (const [k, b] of [...progress.querySelectorAll("button")].entries()) {
    b.classList.toggle("done", k < reached || (k === reached && k < n));
    if (k === n) b.setAttribute("aria-current", "step");
    else b.removeAttribute("aria-current");
  }
  prevBtn.disabled = n === 0;
  nextBtn.textContent = n === steps.length - 1 ? "start over" : "next";
  countEl.textContent = (n + 1) + " / " + steps.length;
  root.dataset.step = String(n);
  bar();
}

steps.forEach((s, k) => {
  const li = el("li");
  const b = el("button", "", String(k + 1));
  b.type = "button";
  b.title = s.title;
  b.setAttribute("aria-label", "Step " + (k + 1) + ": " + s.title);
  b.addEventListener("click", () => show(k));
  li.append(b);
  progress.append(li);
});
prevBtn.addEventListener("click", () => { if (at > 0) show(at - 1); });
nextBtn.addEventListener("click", () => show(at === steps.length - 1 ? 0 : at + 1));
barNext.addEventListener("click", () => show(at === steps.length - 1 ? 0 : at + 1));
barType.addEventListener("click", () => {
  stepEl.querySelector('.repl-try [data-try="' + barType.dataset.try + '"]')?.click();
});

// ---- start ------------------------------------------------------------

if (!consented()) {
  consentBox.hidden = false;
  sizes(consentBox, root.dataset.manifest);
}
show(at);
document.documentElement.dataset.playReady = "1";
