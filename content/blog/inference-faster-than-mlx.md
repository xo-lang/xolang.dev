---
title: "How we built an inference library in Xo that runs faster than MLX"
date: 2026-11-23T07:00:00-05:00
description: "Gemma 4 on Apple's GPU from Xo, with no ML framework: faster than mlx-lm at generating tokens for one conversation on all three models we ran, level on a long bfloat16 prompt, and still behind with many conversations at once. One measuring tool made the difference."
---

Xo is meant for backends that agents write, and more of those backends
now call a language model. So we asked a plain question: could a
program written in Xo run a current open model on a Mac as fast as
Apple's own MLX does, with no ML framework underneath?

For one conversation, it can. On a Mac Studio (M5 Ultra), running the
same 4 bit weights of Google's Gemma 4 back to back against mlx-lm
0.32.2:

| Model | Xo | mlx-lm |
|---|---|---|
| 26B (mixture of experts), 100 tokens | 235.5 to 240.2 tok/s | 167.2 to 171.4 |
| 26B, 40 tokens after an 8000 token prompt | 174.6 to 176.2 tok/s | 137.8 to 139.1 |
| E4B, 120 tokens | 185.9 to 188.1 tok/s | 166.7 and 167.2 |
| E2B, 120 tokens | 287.4 to 295.0 tok/s | 228.0 (one round 185.6) |

The tokens Xo generates are the same ids as the reference in every row:
mlx-lm in float32 for the two small models, and Xo's own exact mode for
26B. This post is how we got there, including where Xo is not ahead.

## What it is

`examples/llm/metal` in the Xo repository is about all of it. The GPU
kernels are Metal Shading Language source that Xo code builds as
strings. Those strings are specialized for the model's shapes and the
mode being run. A small Objective-C file, bound through Xo's `use c`,
does three things only: it compiles the kernels, binds buffers, and runs
them. Everything else is Xo. That includes the tokenizer, the chat
templates, the cache of keys and values, the scheduling of a token's
runs, and an HTTP server with OpenAI and Anthropic style endpoints.

Two language features came out of the work and are now in Xo itself:

- **Mapped regions and typed views** (decision 0754). `std/region` maps
  a file and `View[T]` reads it in place, so `std/safetensors` opens a
  model of any size at the cost of its header. A view of the 26B
  model's weights is handed straight to Metal as a buffer, with no copy.
- **`Float16` and `BFloat16` as storage types** (decision 0755). Model
  files hold bfloat16 scales and biases. Xo can now read and write them
  without a library, and the conversions are correctly rounded.

## The start and the memory

Because the weights are mapped, not loaded, a new process starts
quickly. With the model file in the page cache, the time from a new
process to 20 generated tokens:

| Model | Xo | mlx-lm |
|---|---|---|
| E2B | 0.47 s | 1.73 and 1.79 s |
| E4B | 0.78 and 0.80 s | 1.85 and 1.88 s |
| 26B | 1.25 s | 2.26 and 2.27 s |

The peak footprints are 1.08, 2.45 and 5.79 GB for Xo against 3.78, 5.36
and 15.38 GB for mlx-lm. Read that column with care. macOS counts memory
a process owns, and Xo's weights are file pages it maps read only, so
they are not in its number. mlx-lm loads the weights into its own
memory.

We also tried doing it mlx-lm's way. We copied the weights into memory
Metal allocates: generation came out the same and loading took longer.
We held them with `mlock`, and 26B generation dropped from 237.3 to
240.8 tok/s to 167.4 to 169.5. Both stay off.

## The turning point: a kernel's own time

For a long time 26B sat near 181 to 186 tok/s. That was already ahead
of mlx-lm, but the gap was not closing, and E4B was level with mlx-lm.
We had been guessing where the time went, mostly by leaving a part out
and running the rest twice. Both kinds of guess had pointed at the wrong
kernels.

So we built a profiler into the shim. With `XO_METAL_PROF=1` each kernel
runs in its own compute pass. The GPU stamps each pass's start and end,
and the shim adds the differences up by kernel. A profiled token reads
about 13 percent slow, which is a fair price for a per-kernel table.

The table was a surprise. The kernels that took the most time beside
the weight products read no weights at all. Each took 10 to 23
microseconds a run. Every SIMD group computed the same normalization
again, walking the whole vector through a serial chain of loads. A run
lasts as long as its slowest lane, however many groups run beside it,
so more parallel groups did not help.

The fix was to make each norm once: a single threadgroup of 1024 threads
per vector, or one SIMD group per head. On one 26B token:

| Kernel | Before | After |
|---|---|---|
| final norm (xfinal, then xfin1) | 683 us | 246 us |
| MLP input norm and products (mlpnr2, then xnr1 and mlphr2) | 954 us | 194 + 447 us |
| q, k, v norms (xqkvnorm, then xqkvn1) | 309 us | 181 us |
| the whole token | 5206 us | 4310 us |

26B went to 219.5 to 222.8 tok/s and E4B to 185.9 to 188.1. More work
read off the same table took 26B to the 235.5 to 240.2 above.

The lesson is the same one this blog keeps learning: measure the split
before building.

## Where Xo is not ahead

- **A long prompt in bfloat16.** Reading 8000 tokens into 26B takes 1126
  to 1128 ms in Xo against 1048 and 1181 ms in mlx-lm. That is inside
  mlx-lm's own spread, so we call it level. In float32 (Xo with
  TF32 products) Xo reads it in 1582 to 1612 ms against 1871 and 1909.
- **Many conversations at once.** Stepping 16 conversations together,
  mlx-lm's `batch_generate` makes 1762.0 to 1765.3 tok/s on E2B. Xo
  makes 1247.6. On E4B the numbers are 1117.7 to 1118.5 against 786.9.
  This is the work in progress. A new product kernel for 6 to 32
  positions moved E2B from 1087.1, and moving the vocabulary head onto
  it moved E2B to 1322.5 and 1330.7 in a later run. The gap is still
  about a third.

## What did not gain

Some ideas that sounded right and measured flat or worse:

- Expert tiles of two sizes, or of 32 rows, in the long read.
- A layer's four tail runs merged into one threadgroup on E4B: 76 to
  106 us against 28.
- More rows per SIMD group in 26B's expert kernels, or a row spread
  over more groups.
- Reading the mapped weights ahead on other threads to cut the first
  prompt.
- For many conversations, staging each weight tile through threadgroup
  memory so every word is loaded once (level), and loading the next
  step's words before the current product (slower: 1208.8 and 1231.7
  against 1322.5 and 1330.7 on E2B).

## What it says about Xo

None of this needed a framework. Xo builds the kernels as text, binds
the GPU through a short C boundary, and has the numeric types and mapped
views that model files need. What made it fast was the same tool that
makes any program fast: a measurement of where the time goes, at the
grain where the time goes.

Results file: bench/results/gemma4-vs-mlx-lm-2026-11-23.md in the Xo
repository, with the methods and the log for each row.
