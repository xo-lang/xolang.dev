#!/usr/bin/env python3
# gen-stdcov.py XO_REPO WEBSITE_REPO: writes content/docs/std-coverage.md from the xo repo's committed files
# (a checkout of xo-lang/xo at the commit to describe; needs go, git and its std/VERSION). Regenerate for each release:
#   python3 scripts/gen-stdcov.py ~/path/to/xo .   then review the diff (the levels come from committed evidence).
import os, re, subprocess, sys, json, collections

XO = sys.argv[1]
WEB = sys.argv[2]
GH = "https://github.com/xo-lang/xo/blob/main/"
sh = lambda c: subprocess.check_output(c, shell=True, text=True, cwd=XO).strip()

head = sh("git log -1 --format=%h")
headdate = sh("git log -1 --format=%cs")
version = open(f"{XO}/std/VERSION").read().strip()

# ---- Go packages and the coverage table
gopk = [l for l in subprocess.check_output("go list std | grep -v '/internal\\|^internal\\|vendor'", shell=True, text=True).split("\n") if l]
gover = subprocess.check_output("go version", shell=True, text=True).split()[2]
cover = {}      # package -> (status, xo, note)
rows_by_module = collections.defaultdict(list)
for l in open(f"{XO}/knowledgebase/infrastructure/std-coverage.md"):
    m = re.match(r"\| (.+?) \| (.+?) \| (done|partial|planned|not planned)[^|]*\|(.*)\|", l)
    if not m:
        m2 = re.match(r"\| (.+?) \| (not planned) \| (.*) \|", l)
        if m2 and ("go/*" in m2.group(1) or "debug/*" in m2.group(1) or "runtime" in m2.group(1) or "plugin" in m2.group(1) or "reflect" in m2.group(1) or "image" in m2.group(1)):
            m = (None, m2.group(1), "none", m2.group(2), m2.group(3))
            first, xo, st, note = m2.group(1), "none", "not planned", m2.group(3)
        else:
            continue
    else:
        first, xo, st, note = m.group(1), m.group(2), m.group(3), m.group(4)
    names = []
    for part in re.split(r",\s*", first):
        part = part.strip("` ")
        part = re.sub(r"\s*\((server|client)\)", "", part)
        if "(" in part:   # go/* (ast, ...): expand
            pre = part.split("/*")[0] if "/*" in part else part.split(" ")[0].rstrip("/")
            names.append(pre + "/*")
        else:
            names.append(part)
    for n in names:
        cover[n] = (st, xo.strip("` "), note.strip())
    for mod in set(re.findall(r"std/([a-z0-9]+)", xo)):
        rows_by_module[mod].append(st)
    if "prelude" in xo:
        rows_by_module["prelude"].append(st)

def lookup(p):
    if p in cover: return cover[p]
    top = p.split("/")[0]
    if top + "/*" in cover: return cover[top + "/*"]
    for k in cover:
        if k.endswith("/*") and p.startswith(k[:-1]): return cover[k]
    if p.startswith("image") and "image" in cover: return cover["image"]
    if p.startswith("runtime") and "runtime" in cover: return cover["runtime"]
    if p == "net/http" and "net/http" in cover: return cover["net/http"]
    return None

status = {}
for p in gopk:
    c = lookup(p)
    status[p] = c[0] if c else "unmapped"
# the owner's list of potential gaps (2026-11-02) overrides the knowledgebase table's "not planned" for these
GAPS = ["image", "image/color", "image/png", "image/jpeg", "encoding/gob", "net/rpc", "net/rpc/jsonrpc", "compress/bzip2", "compress/lzw",
        "hash/crc64", "hash/adler32", "os/user", "log/syslog", "text/scanner", "container/ring", "unicode/utf16", "index/suffixarray",
        "crypto/des", "crypto/dsa", "crypto/rc4", "weak", "unique"]
for g in GAPS:
    if g in status: status[g] = "planned"
for g in ("crypto/mlkem/mlkemtest", "text/template/parse"):
    status[g] = "not planned"   # a test helper for a package xo does not export; the parse tree is internal to std/template
cnt = collections.Counter(status.values())
unmapped = [p for p in gopk if status[p] == "unmapped"]
if unmapped: sys.stderr.write("unmapped: %s\n" % unmapped)

# net/http: partial; map explicit group rows
gaps = [p for p in gopk if status[p] == "planned"]

# ---- modules
mods = sorted(f[:-3] for f in os.listdir(f"{XO}/std") if f.endswith(".xo") and "_test" not in f and f != "internal.xo")
mods = [m for m in mods if m != "prelude"]  # std/prelude.xo is the prelude, which has its own first row; it was listed and counted twice
nmods = len(mods)
corpus = set(os.listdir(f"{XO}/internal/stdtest/testdata/corpus"))
tags = sh("git tag | sort -V").split()

def added(m):
    out = sh(f"git log --diff-filter=A --format='%h %cs' -- std/{m}.xo").split("\n")[-1].split()
    t = subprocess.run(["git", "tag", "--contains", out[0], "--sort=v:refname"], capture_output=True, text=True, cwd=XO).stdout.split()
    t = [x for x in t if x.startswith("v0.")]
    return out[1], (t[0] if t else "unreleased")

BEYOND = {"rate", "backoff", "metrics", "trace", "dns", "udp", "uuid", "toml", "websocket", "deque", "cli", "term", "testing", "task", "debug", "go", "log", "embed", "crc32", "fnv"}
# beyond Go means no single Go std package: the Lead's list plus modules whose scope is Xo's own
BEYOND_GO = {"sql": "database/sql plus a PostgreSQL driver", "websocket": "Go has no websocket in std", "toml": "Go has no TOML in std",
             "uuid": "Go has no UUID in std", "rate": "x/time/rate is outside std", "backoff": "no Go std package", "metrics": "expvar plus a Prometheus registry",
             "trace": "no Go std tracing API of this kind", "dns": "net.Resolver covers part", "udp": "net.UDPConn"}

# parsers of untrusted input need fuzzing for Solid testing (owner, 2026-11-02)
PARSERS = {"http", "url", "mime", "multipart", "mail", "smtp", "tls", "x509", "websocket", "json", "xml", "xmlcodec", "toml", "csv",
           "archive", "compress", "dns", "regexp", "template", "html", "netip", "time", "png", "jpeg", "cbor"}
FUZZ = {  # module -> (evidence path, text)
    "http": ("internal/stdtest/httpheadfuzz_test.go", "request head, response and URL fuzz tests"),
    "url": ("internal/stdtest/httpurlfuzz_test.go", "URL fuzz test"),
    "x509": ("internal/stdtest/testdata/corpus/x509/x509_test.xo", "fuzz cases in its corpus"),
    "json": ("internal/stdtest/testdata/corpus/jsonfuzz/jsonfuzz_test.xo", "fuzz corpus against encoding/json (2,022 cases; internal/stdtest/jsonfuzz_test.go runs fresh seeds)"),
    "xml": ("internal/stdtest/testdata/corpus/xmlfuzz/xmlfuzz_test.xo", "fuzz corpus against encoding/xml (2,000 documents through Token, Token not strict, and RawToken, error texts exact; internal/stdtest/xmlfuzz_test.go runs fresh seeds)"),
    "csv": ("internal/stdtest/testdata/corpus/csvfuzz/csvfuzz_test.xo", "fuzz corpus against encoding/csv (2,000 texts under random Reader options, error texts exact, and the Writer's output; internal/stdtest/csvfuzz_test.go runs fresh seeds)"),
    "toml": ("internal/stdtest/tomlfuzz_test.go", "toml-test v1.5.0 conformance (TOML 1.0.0: 179 valid, 364 invalid documents) and a 2,000-document invariant fuzz on every backend"),
    "png": ("internal/stdtest/pngfuzz_test.go", "1,000 seeded files from a chunk-level builder and Go-encoded images (every color type and depth, bad headers, palettes, tRNS, split IDATs, cuts, bit flips) against Go's Decode and DecodeConfig, plus 36,000 fresh cases over six seeds"),
    "jpeg": ("internal/stdtest/jpegfuzz_test.go", "350 seeded files from a segment-aware mutator over Go's test images and Go-encoded images (every chroma ratio, baseline and progressive, restart intervals, CMYK, YCCK, headers, tables, scan parameters, cuts, bit flips) against Go's Decode and DecodeConfig, plus 12,000 fresh cases on arm64 and LLVM"),
    "cbor": ("internal/stdtest/cborfuzz_test.go", "1,500 seeded inputs from a byte level builder (random head widths, indefinite lengths, floats of every width, tags, simple values, repeated keys, text that is not UTF-8, then bits flipped, cuts, insertions) against fxamacker/cbor v2 (Go has no CBOR in its standard library), plus 12,000 fresh cases on arm64 and LLVM and the RFC 8949 Appendix A examples"),
    "compress": ("internal/stdtest/compressfuzz_test.go", "2,000 hostile DEFLATE, zlib and gzip streams (hand-built blocks and corrupted Go output) against Go's decoders, error texts exact, plus streaming and max_size, on every backend"),
    "archive": ("internal/stdtest/archivefuzz_test.go", "2,010 hostile tar and zip archives (Go-written and hand-built headers, cut and field-mutated) against Go's archive/tar and archive/zip readers on every backend"),
    "mime": ("internal/stdtest/mimefuzz_test.go", "2,000 cases against Go's mime and net/http: hostile Content-Type headers (RFC 2231, continuations, duplicates), format_media_type, every DetectContentType signature, on every backend"),
    "mail": ("internal/stdtest/mailfuzz_test.go", "2,000 addresses, address lists, header blocks and dates against Go's net/mail (RFC 2047, groups, folds, zones) on every backend"),
}
GODIFF = {"tls": ("internal/llvm/tls13_diff_test.go", "TLS 1.3 client and server differential against Go"),
          "http": ("internal/llvm/http1_diff_test.go", "HTTP/1 differential against Go")}
# performance rows against Go: module -> (level, evidence file, fact)
PERF = {
    "json": ("Proven", "bench/results/json-vs-go-2026-10-21.md", "0.33 to 0.49 of Go's instructions on native (2026-10-21)"),
    "csv": ("Proven", "bench/results/std-twin-rows-2026-11-03.md", "parse 0.92, format 1.01 of Go's wall (2026-11-03)"),
    "xml": ("Solid", "bench/results/std-twin-rows-2026-11-03.md", "tokens 1.15, tree 0.95 of Go's wall (2026-11-03)"),
    "png": ("Proven", "bench/results/std-twin-rows5-2026-11-03.md", "decode 1.04, encode 0.94 of Go's wall (2026-11-03)"),
    "jpeg": ("Proven", "bench/results/std-twin-rows6-2026-11-03.md", "decode 1.01, with RGBA conversion 1.04 of Go's wall (2026-11-03)"),
    "cbor": ("Proven", "bench/results/std-twin-rows7-2026-11-03.md", "decode 0.43, encode 0.26, deterministic encode 0.62 of fxamacker/cbor's wall (2026-11-03)"),
    "compress": ("Proven", "bench/results/std-twin-rows-2026-11-03.md", "gzip 0.96, gunzip 0.92, deflate 0.96, inflate 0.91 of Go's wall (2026-11-03)"),
    "archive": ("Solid", "bench/results/std-twin-rows-2026-11-03.md", "zip 1.20, tar 1.04, unzip 0.99, untar 0.27 of Go's wall (2026-11-03)"),
    "mime": ("Solid", "bench/results/std-twin-rows-2026-11-03.md", "format 1.28, parse 1.06, detect 0.90 of Go's wall (2026-11-03)"),
    "mail": ("Solid", "bench/results/std-twin-rows-2026-11-03.md", "display 1.15, address 0.62, header block 0.45 of Go's wall (2026-11-03)"),
    "prelude": ("Early", "bench/results/std-twin-rows2-2026-11-03.md", "Str.trim_chars 2.24 of Go's wall (a trimmed view holds a reference); fs walk 1.54 (0.95 with Go reading each entry's info); itoa 1.52, atoi 1.46, sort of strings 1.42; split, search, case and predicate workloads 0.4 to 1.24 (2026-11-03)"),
    "base64": ("Proven", "bench/results/std-twin-rows2-2026-11-03.md", "encode 0.57, decode 0.88 of Go's wall (2026-11-03)"),
    "base32": ("Proven", "bench/results/std-twin-rows3-2026-11-03.md", "encode 0.98, decode 0.47 of Go's wall (2026-11-03)"),
    "path": ("Solid", "bench/results/std-twin-rows2-2026-11-03.md", "clean 1.08, join 1.13, parts 1.40 of Go's wall (2026-11-03)"),
    "html": ("Solid", "bench/results/std-twin-rows2-2026-11-03.md", "escape 1.75, unescape 0.65 of Go's wall (2026-11-03)"),
    "template": ("Solid", "bench/results/std-twin-rows2-2026-11-03.md", "render 1.36, parse 0.90 of Go's wall (2026-11-03)"),
    "big": ("Solid", "bench/results/std-twin-rows2-2026-11-03.md", "mul 1.23, parse 0.49 of Go's wall (2026-11-03)"),
    "crc32": ("Proven", "bench/results/std-twin-rows2-2026-11-03.md", "crc32 0.96, crc32c 0.37 of Go's wall (2026-11-03)"),
    "fnv": ("Proven", "bench/results/std-twin-rows2-2026-11-03.md", "fnv 32a, 64a, 128a at most 0.98 of Go's wall (2026-11-03)"),
    "deque": ("Proven", "bench/results/std-twin-rows2-2026-11-03.md", "queue and both-ends workloads 0.13 to 0.17 of Go's wall (2026-11-03)"),
    "dns": ("Early", "bench/results/std-twin-rows2-2026-11-03.md", "MX lookup over UDP 4.66 of Go's wall; the CPU profile is 30 ms, the rest is task wakeup latency (2026-11-03)"),
    "x509": ("Proven", "bench/results/std-twin-rows2-2026-11-03.md", "parse, verify, create and CRL at most 0.98 of Go's wall (2026-11-03)"),
    "cookie": ("Proven", "bench/results/std-twin-rows3-2026-11-03.md", "parse cookie 0.76, parse set-cookie 1.02 of Go's wall (2026-11-03)"),
    "toml": ("Solid", "bench/results/std-twin-rows3-2026-11-03.md", "decode 1.17, encode 1.32 of Go's wall (2026-11-03)"),
    "rate": ("Solid", "bench/results/std-twin-rows3-2026-11-03.md", "allow 1.29 of Go's wall (2026-11-03)"),
    "aead": ("Solid", "bench/results/std-twin-rows3-2026-11-03.md", "gcm 0.39 to 1.31, chacha 0.48 to 1.16, hkdf 1.19 of Go's wall (2026-11-03)"),
    "uuid": ("Proven", "bench/results/std-twin-rows3-2026-11-03.md", "parse 0.91, string 0.72, bytes 1.00 of Go's wall (2026-11-03)"),
    "websocket": ("Solid", "bench/results/std-twin-rows3-2026-11-03.md", "small messages 1.12, big 0.40, dial 0.77 of Go's wall (2026-11-03)"),
    "xmlcodec": ("Solid", "bench/results/std-twin-rows-2026-11-03.md", "encode 0.57, decode 1.13 of Go's wall (2026-11-03)"),
    "url": ("Proven", "bench/results/url-parse-2026-10-23.md", "0.78 of Go's instructions (2026-10-23)"),
    "netip": ("Solid", "bench/results/netip-2026-10-22.md", "1.58 of Go's instructions (2026-10-22)"),
    "regexp": ("Solid", "bench/results/std-twin-rows2-2026-11-03.md", "match 1.25, find_all 0.89 of Go's wall (2026-11-03)"),
    "multipart": ("Solid", "bench/results/json-vs-go-2026-10-21.md", "parse 1.15 of Go's instructions (2026-10-21)"),
    "crypto": ("Solid", "bench/results/aesgcm-2026-10-22.md", "AES-GCM bulk loop 1.12, ChaCha20-Poly1305 1.2 of Go (2026-10-22)"),
    "tls": ("Solid", "bench/results/tls-h2-vs-go-2026-10-21.md", "HTTP/2 14 us a request against Go's 32; handshakes mixed (2026-10-21)"),
    "http": ("Solid", "bench/results/tls-h2-vs-go-2026-10-21.md", "HTTP/2 14 us a request against Go's 32; /alloc 0.97 of v0.35.0 (2026-11-02)"),
    "time": ("Early", "bench/results/std-twin-rows2-2026-11-03.md", "format 5.4 and parse 4.7 of Go's wall with string layouts, 2.03 and 1.90 with a const Layout; civil 0.46 (2026-11-03)"),
}
MAIN_NOTE = {"prelude": "Str, Bytes, List, Map, Fs, Net, Clock, Rand, Env, Stdio, Proc"}

LV = {"Early": 0, "Solid": 1, "Proven": 2}
NM = ["Early", "Solid", "Proven"]
def pill(level, link=None, key="", name=""):
    if key: return '{{< level "%s" "%s" "%s" "%s" >}}' % (level, link or "", key, name)
    if link: return '{{< level "%s" "%s" >}}' % (level, link)
    return '{{< level "%s" >}}' % level

def feat(m):
    st = rows_by_module.get(m, [])
    if m in BEYOND_GO and not st:
        return "Solid", f"beyond Go: {BEYOND_GO[m]}", None
    if not st:
        return "Solid", "no Go package maps to it; covers its own domain's common uses", None
    c = collections.Counter(st)
    if c.get("partial", 0) or c.get("planned", 0):
        return "Solid", f"{c.get('done',0)} of {len(st)} mapped Go rows done, {c.get('partial',0)} partial", "knowledgebase/infrastructure/std-coverage.md"
    return "Proven", f"all {len(st)} mapped Go rows done", "knowledgebase/infrastructure/std-coverage.md"

def test(m):
    has_corpus = m in corpus
    diff = m in GODIFF
    if not (has_corpus or diff):
        return "Early", "own tests only", None
    ev = f"internal/stdtest/testdata/corpus/{m}" if has_corpus else GODIFF[m][0]
    what = "Go's tests ported" if has_corpus else GODIFF[m][1]
    if m in PARSERS:
        if m in FUZZ:
            return "Solid", f"{what}; {FUZZ[m][1]}", FUZZ[m][0]
        return "Early", f"{what}; parser with no fuzz harness", ev
    return "Solid", what, ev

def perf(m):
    if m in PERF:
        lv, ev, fact = PERF[m]
        return lv, fact, ev
    return "Early", "no committed row against Go", None

def anchor(m):
    return "mod-" + m

def short_feat(f):
    t = f[1]
    m = re.match(r"all (\d+) mapped Go rows done", t)
    if m: return f"{m.group(1)}/{m.group(1)}"
    m = re.match(r"(\d+) of (\d+) mapped Go rows done", t)
    if m: return f"{m.group(1)}/{m.group(2)}"
    if t.startswith("beyond Go"): return "beyond Go"
    if t.startswith("no Go package"): return "own domain"
    return ""

def short_test(t):
    x = t[1]
    if x.startswith("own tests"): return "own tests"
    base = "differential" if "differential" in x and "ported" not in x else "ported"
    if "no fuzz harness" in x: return base + ", no fuzz"
    if "hostile" in x: return base + " + hostile"
    if "fuzz" in x: return base + " + fuzz"
    return base

def short_perf(p):
    x = p[1]
    if x.startswith("no committed row"): return "no row"
    x = re.sub(r"\s*\(\d{4}-\d{2}-\d{2}\)\s*$", "", x)
    x = re.sub(r"\([^)]*\)", "", x)
    clauses = [c for c in x.split(";") if "of Go" in c and " us " not in c]
    nums = [float(n) for c in clauses for n in re.findall(r"(?<![\d./-])\d+\.\d+(?![\d])", c)]
    if not nums: return "see notes"
    unit = "x instr." if "instructions" in x else "x"
    lo, hi = min(nums), max(nums)
    return f"{lo:g}{unit}" if lo == hi else f"{lo:g} to {hi:g}{unit}"

rows = []
for m in ["prelude"] + mods:
    f, t, p = feat(m), test(m), perf(m)
    lv = NM[min(LV[f[0]], LV[t[0]], LV[p[0]])]
    d, rel = added(m) if m != "prelude" else ("2026-10-08", "go-compiler-final")
    rows.append((m, f, t, p, lv, d, rel))

lvcount = collections.Counter(r[4] for r in rows)
axcount = {a: collections.Counter(r[i][0] for r in rows) for a, i in (("features", 1), ("testing", 2), ("performance", 3))}

def link(ev):
    return (GH + ev) if ev else None

out = []
w = out.append
w("---")
w('title: "Standard library coverage"')
w('linkTitle: "Std coverage"')
w('description: "Which of Go\'s %d standard packages Xo covers, what is beyond Go, what is not applicable by design, what is a gap with its priority, and a maturity level for each std module with its evidence."' % len(gopk))
w("weight: 7")
w("toc: true")
w("---")
w("")
w(f"As of Xo {'0.36 (development, main %s of %s)' % (head, headdate)}; Go {gover[2:]}. Every count below comes from a command run on that commit: `go list std` without internal and vendor packages, and the table in the repository's [std-coverage.md]({GH}knowledgebase/infrastructure/std-coverage.md) (decision 0276: Go's standard library is std's reference scope).")
w("")
w("## Summary")
w("")
w(f"Go has **{len(gopk)}** public standard library packages. Xo has **{nmods}** `std` modules besides the prelude (the builtin types and capabilities every program sees).")
w("")
w("| Status | Go packages |")
w("|---|---|")
w(f"| Covered (done) | {cnt['done']} |")
w(f"| Partial | {cnt['partial']} |")
w(f"| Not applicable by design | {cnt['not planned']} |")
w(f"| Gap, potentially planned | {cnt['planned']} |")
if cnt.get("unmapped"): w(f"| Not yet mapped | {cnt['unmapped']} |")
w("")
w("Beyond Go: modules with no Go standard library counterpart, or going past it, are listed under [Beyond Go](#beyond-go).")
w("")
w("## Maturity levels")
w("")
w("Each `std` module gets three marks, one per axis, and an overall level that is the weakest of the three (owner, 2026-11-02, decision 0461).")
w("")
w("| Axis | " + pill("Early") + " | " + pill("Solid") + " | " + pill("Proven") + " |")
w("|---|---|---|---|")
w("| Features, against Go's package or the domain | core uses | common uses, gaps listed | near full parity, or beyond Go |")
w("| Testing | own tests | Go's tests ported or a Go differential; parsers fuzzed | also `--race` and load stress clean, long fuzz runs, security reviewed where it applies (crypto, tls, http, x509) |")
w("| Performance | not measured, or measured and above 2x Go | measured against Go, within 2x | at or better than Go on its benchmark |")
w("")
w("How a mark is read here: *Features* from the rows of the coverage table that name the module (all done is Proven, any partial is Solid; a module with no Go package is Solid and says so). *Testing* from the committed corpus of Go's tests under `internal/stdtest/testdata/corpus`, Go differential tests, and fuzz tests for modules that parse untrusted input. *Performance* from a committed result file with a Go twin. A mark with no committed evidence is Early, so a missing result is the gap to close, not a hidden number. The dates are those of the result files, which can be older than this page; a re-run can only move a mark if the file is replaced.")
w("")
w(f"Today: overall {lvcount['Proven']} Proven, {lvcount['Solid']} Solid, {lvcount['Early']} Early of {len(rows)} (prelude and {nmods} modules). Per axis, features {axcount['features']['Proven']}/{axcount['features']['Solid']}/{axcount['features']['Early']}, testing {axcount['testing']['Proven']}/{axcount['testing']['Solid']}/{axcount['testing']['Early']}, performance {axcount['performance']['Proven']}/{axcount['performance']['Solid']}/{axcount['performance']['Early']} (Proven/Solid/Early). No module has the committed `--race`, load stress, long fuzz and security review evidence that Proven testing needs yet.")
w("")
w("### Per module")
w("")
w("Marks only. Each module has its three marks (F features, T testing, P performance) and the short figures behind them; times are multiples of Go's time, so lower is faster and 0.47x is better than Go. The prose behind each mark (which rows are partial, the timings, what is missing, the evidence link) is under [Module notes](#module-notes); each module name links to its note.")
w("")
w("| Module | Marks: F features, T testing, P performance |")
w("|---|---|")
for m, f, t, p, lv, d, rel in rows:
    name = "prelude" if m == "prelude" else f"std/{m}"
    pills = " ".join(pill(x[0], link(x[2]), k, n) for x, k, n in ((f, "F", "Features"), (t, "T", "Testing"), (p, "P", "Performance")))
    desc = "Features " + short_feat(f) + " · Testing " + short_test(t) + " · Performance " + short_perf(p)
    w(f"| [`{name}`](#{anchor(m)}) | {pills} {{{{< covdesc \"{desc}\" >}}}} |")
w("")
w("### Module notes")
w("")
w("One entry per module: the three marks with their evidence, in words, and when the module was added. The marks are the table's; nothing here changes one.")
w("")
for m, f, t, p, lv, d, rel in rows:
    name = "prelude" if m == "prelude" else f"std/{m}"
    w(f"#### `{name}` {{#{anchor(m)}}}")
    w("")
    w(f"Overall {pill(lv)}. Added {rel} ({d}).")
    w("")
    w(f"- Features {pill(f[0], link(f[2]))}: {f[1]}.")
    w(f"- Testing {pill(t[0], link(t[2]))}: {t[1]}.")
    w(f"- Performance {pill(p[0], link(p[2]))}: {p[1]}.")
    w("")
w("## Go packages")
w("")
w(f"All {len(gopk)} packages of `go list std`, by status. A package that maps to a module names it; the repository's coverage table has the notes per row.")
w("")

def byst(st):
    return sorted(p for p in gopk if status[p] == st)

def xoname(p):
    c = lookup(p)
    x = c[1] if c else ""
    return x if x and x != "none" else ""

for title, st, intro in (
    ("Covered", "done", "The module covers what a backend uses of the package, on the native backends and the Go backend."),
    ("Partial", "partial", "Some of it; the notes in the coverage table name what is missing."),
    ("Not applicable by design", "not planned", "Reflection, Go source tooling, cgo and the runtime's internals are replaced by language features or the toolchain, or the algorithm is broken or legacy."),
    ("Gaps, potentially planned", "planned", "Nothing yet, wanted. See [Roadmap of gaps](#roadmap-of-gaps)."),
):
    ps = byst(st)
    w(f"### {title} ({len(ps)})")
    w("")
    w(intro)
    w("")
    if st == "not planned":
        w(", ".join(f"`{p}`" for p in ps))
    else:
        w("| Go package | Xo |")
        w("|---|---|")
        for p in ps:
            w(f"| `{p}` | {xoname(p) or 'none'} |")
    w("")

w("### Beyond Go")
w("")
w("Modules with no Go standard library counterpart, or that go past it: " + ", ".join(f"`std/{m}` ({BEYOND_GO[m]})" for m in sorted(BEYOND_GO)) + ". Also in `std/crypto`: Argon2id password hashing, AES-GCM and ChaCha20-Poly1305 as public AEAD, HKDF.")
w("")

w("## Function level checks")
w("")
w("The coverage table is checked against the code, not only the package names. Examples from this commit (`xo symbols --module=... --pub`):")
w("")
w("- `crypto/md5`, `crypto/sha1`: `Hash.Md5` and `Hash.Sha1` in `std/crypto`, one-shot and streaming (`Hasher`), also through `hmac`. Covered.")
w("- `encoding/hex`: `Bytes.to_hex` and `Bytes.from_hex` in the prelude. Covered; Go's `Dump` is not offered.")
w("- `hash/crc32`: `std/crc32` with `Poly.Ieee` and `Poly.Castagnoli`, `checksum` and `update`. Covered. `hash/crc64` and `hash/adler32` have no module: gaps.")
w("- `net/http/cookiejar`: `std/http` reads and writes cookies on a `Request` (`cookie`, `cookies`, `with_cookie`) but the client has no jar. Gap, planned with client cookies.")
w("")
w("## Roadmap of gaps")
w("")
w("The gaps are *potentially planned*: a priority and a realistic timeframe, not a commitment. The ordering is the std owner's estimate (2026-11-02) from port effort and demand, and the owner decides.")
w("")
w("| Priority | Gap | Timeframe |")
w("|---|---|---|")
w("| 1 | `encoding/gob`, `net/rpc`; `compress/bzip2`, `compress/lzw`; small hashes (`hash/crc64`, `hash/adler32`); `os/user`; `log/syslog`; `expvar`; `text/scanner`; `container/ring`; `unicode/utf16`; `index/suffixarray` | Q1 2027 |")
w("| 2 | legacy crypto (`crypto/des`, `crypto/dsa`, `crypto/rc4`); `weak`, `unique` | last, or possibly never |")
w("")
w("The repository's coverage table still lists some of these as not planned (for example `encoding/gob`, `net/rpc`, `text/scanner`, `log/syslog`, `container/ring`, `index/suffixarray`, the image packages); this page follows the owner's list, and the table moves with the decision. CBOR is not a Go package; it is listed because it is first on the list.")
w("")
w("Sources: [std-coverage.md](" + GH + "knowledgebase/infrastructure/std-coverage.md), [std/changes](" + GH + "std/changes/README.md) (every module's change log), [decision 0276](" + GH + "knowledgebase/decisions/0276-std-follows-go-std.md) and [decision 0461](" + GH + "knowledgebase/decisions/0461-std-module-maturity.md).")
open(f"{WEB}/content/docs/std-coverage.md", "w").write("\n".join(out) + "\n")
json.dump({"counts": cnt, "levels": lvcount, "axes": {k: dict(v) for k, v in axcount.items()}, "unmapped": unmapped}, sys.stderr)
