// Highlights the section of the page you are reading in the "On this page"
// index (.toc): the last heading above a line near the top of the window.
// The index scrolls on its own, so the highlighted link is kept in view.
const toc = document.querySelector(".toc");
if (toc) {
  const links = [...toc.querySelectorAll('a[href^="#"]')];
  const pairs = links
    .map((a) => [a, document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1)))])
    .filter(([, h]) => h);
  let current = null;
  const mark = (a) => {
    if (a === current) return;
    if (current) {
      current.classList.remove("active");
      current.removeAttribute("aria-current");
    }
    toc.querySelectorAll("li.open").forEach((li) => li.classList.remove("open"));
    current = a;
    if (!a) return;
    a.classList.add("active");
    a.setAttribute("aria-current", "location");
    // the section an active subsection belongs to
    for (let li = a.parentElement.parentElement.closest("li"); li && toc.contains(li); li = li.parentElement.closest("li")) li.classList.add("open");
    const t = toc.getBoundingClientRect(), r = a.getBoundingClientRect();
    if (r.top < t.top + 40 || r.bottom > t.bottom - 20) toc.scrollTop += r.top - t.top - t.height / 3;
  };
  const update = () => {
    const line = 120;
    let found = null;
    for (const [a, h] of pairs) {
      if (h.getBoundingClientRect().top - line <= 0) found = a;
      else break;
    }
    // at the very bottom, the last section is the one being read
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2 && pairs.length) found = pairs[pairs.length - 1][0];
    mark(found);
  };
  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  addEventListener("hashchange", update);
  update();
}
