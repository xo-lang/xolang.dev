---
title: "An AWS SDK for Xo"
date: 2026-11-05T08:33:00-05:00
description: "An AWS SDK for Xo, generated from the same Smithy models aws-sdk-go-v2 is built from: 435 services, with a hand-written core for signing, credentials, endpoints, six protocols and event streams. How it was built, how big it is next to Go's, how it was tested against AWS's own suites and real AWS, and the Xo bugs it found on the way."
draft: false
---

Xo is written by AI agents (see [how the agents work](/blog/how-the-agents-work/)),
and the language exists for the kind of programs those agents write:
backends and web services. Most backends talk to a cloud, so Xo now has
an AWS SDK: one module per AWS service, 435 of them, generated from
AWS's own service models with an API shaped like Go's, on a
hand-written core for signing, credentials, endpoint rules, the six AWS
wire protocols and event streams. It was tested against AWS's and
Smithy's own test suites, an emulator, and real AWS, including a free
read call to each of the 366 services that has one needing no input.

This post is how it was built, what it weighs next to aws-sdk-go-v2,
how it was tested, and what it found wrong with Xo.

## The approach: models in, clients out

AWS publishes every service as a [Smithy](https://smithy.io/) model: the
operations, their input and output shapes, the wire protocol, the
endpoint rules, the errors, the documentation. aws-sdk-go-v2 is
generated from those models, and so is this SDK. The split is the same
as Go's:

- **A generator** (codegen/, written in Xo) reads the models and writes
  one Xo module per service: the client, the input and output types,
  the serializers and deserializers for the service's protocol, its
  endpoint resolver, paginators and waiters.
- **A hand-written core** that every service shares: SigV4 and SigV4a
  signing, the credential chain (environment, shared files, STS assume
  role), the endpoint rules engine, the six AWS wire protocols
  (restJson1, restXml, awsJson 1.0 and 1.1, awsQuery, ec2Query),
  event streams, a JMESPath evaluator for waiters, and retries.

The API follows aws-sdk-go-v2's on purpose: a Go programmer who knows
`s3.NewFromConfig(cfg)` and `client.PutObject(ctx, &s3.PutObjectInput{...})`
should recognize the Xo version on sight, with Xo's naming and error
handling.

Smithy's protocol test suites ship as IDL files, which are usually read
with the JVM-based Smithy command line tool. Instead of depending on it,
the agent wrote a Smithy IDL parser in Xo (codegen/idl, 956 lines) and
pinned the test files it reads.

One agent wrote it, from a request the owner made on 2026-11-04. The
repository's first commit landed at 09:44 that morning, and commit
cb27f7f, with signing, presigned requests, paginators, waiters, event
streams and all 435 service models generating code that type checks,
at 23:00 the same day. The real AWS runs and the customization audit
followed on 2026-11-05.

## How big it is

Counted with `wc -l` (comments and blank lines included, the same way on
both sides), at cb27f7f for Xo and at aws-sdk-go-v2's main of
2026-11-04 (0dedb8162). "Generated" means a file that starts with the
generator's DO NOT EDIT line.

| | Xo SDK | aws-sdk-go-v2 |
|---|---|---|
| Services | 435 | 435 |
| Hand-written core (not tests, not generated) | 5,072 lines | 50,128 lines outside `service/`, plus 10,453 hand-written lines inside it |
| Generator | 6,555 lines of Xo | 32,439 lines of Java and Kotlin in the repository (plus smithy-go's own generator, not counted) |
| Generated code, all services | 6,546,763 lines | 19,692,867 lines in 31,512 files |

The models behind those services hold 19,521 operations and 141,582
shapes; the Xo model loader reads all 435 in 0.8 seconds.

The table needs reading with care. aws-sdk-go-v2 has years of
features the Xo SDK does not (more credential sources, the S3 transfer
manager, DynamoDB's attribute value marshaler, more of the per-service
customizations; see the limits below), so its core being
ten times larger is not ten times waste. The generated code is the
fairer comparison: both are full clients for the same 435 models, and
Xo's are about a third the size. We have not broken down where the
difference comes from, so read it as a size, not a verdict. All 435
services are committed to the repository, each its own module, and
every one is regenerated and type checked on every gate.

## How it was tested

Generated code is only as good as the tests it is generated against,
so the SDK leans on AWS's and Smithy's own test suites wherever they
exist:

- **Protocol tests**: 741 cases across 8 Smithy protocol test suites,
  generated into Xo tests: each one serializes a request and checks the
  exact bytes, or parses a canned response and checks the result.
- **Signing**: SigV4's 38 suite cases, 38 SigV4a cases with expected
  results (of 40 upstream), and the event stream signer against 4
  vectors from aws-sdk-go-v2.
- **Endpoint rules**: 14,106 endpoint test cases from the 435 models,
  run against both an interpreter of the rules and the Xo code the
  generator compiles them to, which must agree.
- **JMESPath**: the compliance suite, 892 of 892.
- **LocalStack**: 15 end-to-end tests against an AWS emulator in
  Docker, including paginators, waiters and event streams.
- **Every model**: all 435 services generate and type check, on every
  gate. The repository's gate runs 853 tests.

Those counts are at cb27f7f. After the customization audit below
(commit eedba19), the gate runs 914 tests and LocalStack 50; at the
first release (v0.1.0, commit 2f3ce81) they are 916 and 51.

Then real AWS, run by the agent from a test plan the owner approved
first. The run used an otherwise unused region, and every resource it
created carried a per-run prefix and was deleted by the script; the
repository ships a suggested least-privilege policy for anyone who runs
the tests themselves. Every core step passed: STS (including a
presigned GetCallerIdentity), EC2, S3 (multipart upload, CopyObject, a
paginator, waiters, presigned PUT and GET, a tampered presigned URL
refused, modeled errors), DynamoDB, SQS, SNS, Secrets Manager, a
Kinesis SubscribeToShard event stream, and Polly's audio streamed into
Transcribe Streaming as an input event stream. Lambda's
InvokeWithResponseStream passed, and so did SigV4a through an S3
Multi-Region Access Point. S3 Select was skipped: it is closed to new
customers, and the account had no access.

Real AWS found two bugs that no suite and no emulator had, both in S3
Control:

- The request's host carried the account ID twice: the endpoint rules
  add it, and the serializer applied the operation's host prefix again.
- S3 Control rejects a request without an `x-amz-content-sha256`
  header, so it now signs by S3's rules.

All runs together cost under $0.10 at list prices. Each step deletes
what it creates, the script's exit trap sweeps everything with the
run's prefix, and a separate list-only sweep found nothing left behind
in any service the plan touched.

A wider read-only sweep followed on 2026-11-05 in ca-central-1: one
free List, Describe or Get call per service, chosen from the models,
for the 366 services that have one needing no input. 243 succeeded.
The other 123 returned errors that the SDK parsed into the operation's
typed errors: 76 services are not offered in that region, 28 need
access, an opt-in or a subscription, 16 rejected the request (the
service wants input the model leaves optional, or the account is not
onboarded), and 3 answered with no error code or not at all. No call
failed to sign or to decode. The 69 services left out have no read call
that needs no input, or bill per call.

## The customization audit

Smithy models do not describe everything. The other SDKs carry
hand-written code for some services, and a generated SDK that skips it
is wrong in quiet ways. So the agent listed every customization in
aws-sdk-go-v2 (its `internal/customizations` packages, the hand-written
files next to the generated ones, and its code generator's own
customizations, at commit 0dedb8162), checked the list against
botocore's and the Java SDK's, and wrote down, in
`docs/customizations.md`, what this SDK does about each, with the test
that proves it. Working through that list found real gaps, now fixed:

- **S3 errors in a 200 response.** S3 can answer an operation with
  status 200 and an error document in the body. Every S3 operation with
  an XML response now checks for one.
- **Checksums.** S3's flexible checksums now follow aws-sdk-go-v2's
  defaults: CRC32 when an operation requires a checksum and when it only
  supports one, response checksums validated on GetObject, plus
  DynamoDB's response CRC32, SQS's message MD5s and Glacier's tree hash.
- **Unsigned operations.** Operations modeled with no auth, such as STS
  AssumeRoleWithWebIdentity and AssumeRoleWithSAML, Cognito Identity,
  SSO and SSO OIDC, are now sent unsigned instead of failing for lack of
  credentials.
- **Endpoint discovery.** Timestream Write and Query need each call sent
  to an address the service hands out; the SDK now asks once per region
  and caches it.
- **XML error names.** Route 53 models an error's `message` and sends
  `<Message>`, so its modeled errors lost their text; XML error fields
  are now matched without case, as aws-sdk-go-v2 does.

What is still open is listed there too: `Expect: 100-continue` for large
uploads, trailing checksums for uploads of unknown size, and the user
agent's feature metrics. None is needed for a correct request.

## Kept current every week

The next step is a weekly job (Wednesdays at 06:00 UTC) that moves the pinned AWS models to
their newest commit, regenerates every client, and runs every check
with the newest public Xo release. When everything passes, the update
will be merged and the changed modules tagged; when anything fails, the
pull request stays open and an issue links the run. The job holds no
AWS credentials and makes no calls to AWS. It is written and tested on
a branch, and goes live after the first release.

## What the SDK found wrong with Xo

The best reason to write a large program in a young language is what it
breaks. The agent kept a report of every Xo problem it hit, each with
the smallest program that shows it; the ones worth telling:

- **A compiler cache key that missed a dependency** (issue 5): an
  inlined call into another module failed as a "runtime call" on arm64,
  but only after one particular test package had been built first. The
  agent turned it into a two-command reproduction from an empty cache;
  the cause was two modules with the same short name, which the front
  end cache's key did not tell apart.
- **`xo mod tidy` dropped the require of a nested module** (issue 7)
  that the parent module imports; the SDK is one repository of many
  modules, so it hit this at once.
- **Large generated files** (issue 8): the checker keyed each syntax
  node by its file, start and end in 20 bits each, so a node past 1 MiB
  of a file took the records of a node in the next file. One new import
  made the compiler reject list pushes in unrelated functions of S3's
  1.27 MB client. Worse, the same collision could resolve a call to the
  wrong function with no error. The bug was in every earlier release
  and needed a source file over 1 MiB, which hand-written code never
  had; the generator now also splits its files at about 448 KiB.
- **A full duplex HTTP exchange deadlocked** on Xo's in-memory test
  network (issue 9): the fake network delivered a request whole, so a
  test that streams audio in while transcripts stream out could not
  run. The test network got full duplex support the same night: a
  request with a pipe body now streams to the handler and the response
  streams back, deterministic under `--seed`.
- **DynamoDB's `Select` type** (issue 10): the compiler named the
  runtime's handle for `select` statements `Select`, and a program type
  of the same name took its place. Every such program failed to build;
  none was miscompiled, and the fix makes a program's own type win.
- **Big workspaces** (issue 11): the repository is one workspace of 474
  modules, and Xo loaded every module the workspace listed, used or not.
  Checking one small service peaked at 8.7 GB, and checking the whole
  repository could not finish. Xo now checks a directory with only the
  modules it imports (854 MB for that service on linux/arm64), checks a
  whole workspace one module at a time on a shared base, and scopes its
  queries to what each question needs. `xo check ./...` of the whole
  repository takes 49.5 seconds at a 3.7 GB peak, and `xo test ./...`
  runs all 874 of its tests in 3 minutes 15 seconds at a 3.95 GB peak;
  each had stopped at a 30 GB memory limit (decisions 0511, 0513 and
  0515, in the next Xo release).

The real AWS runs found three more. An S3 program's first native build
after std's code was cached could fail to link with a duplicate symbol:
a zero value function was emitted in both std's object and the
program's, and only one was marked weak (issue 12, fixed in 842702e6d).
Then MediaConvert's Output shape and a WAFv2
type hold values of thousands of words, and the native arm64 backend
failed to build either: its reference counting helpers took frames past
an add immediate's 4,095 and offsets past a load's 32,760 bytes (issues
13 and 14). The same commit (7c86af664) lifted three more limits of
that kind found on the way, each with a test program sized just past
it; the LLVM backend and x86 were never affected.

Issues 5, 7, 8 and 10 were fixed in the toolchain the same day they
were reported, each with a regression test; issue 9 became a new
feature of the test network, and issue 11 three design decisions the
next day. That loop, an agent writing a large real
program and agents fixing the language under it the same day, is how
Xo is meant to be built.

## Limits

This is a young SDK, and it says so:

- **Customizations.** The audit above lists what is not handled yet;
  each customization that is handled names its test, and some are tested
  only against recorded responses, not real AWS.
- **Credentials.** Environment variables, shared config and credential
  files, and STS assume role are supported; SSO, web identity, container
  and instance metadata credentials are not yet.
- **Presigning** covers S3's object and bucket calls and STS
  GetCallerIdentity.
- **Event stream signing** chains from SigV4 only, so an input stream on
  a SigV4a endpoint is unsupported (no AWS service has one today).
- **Xo versions.** Xo 0.39.0 works, with workarounds the README lists
  for the Xo bugs above that the next release fixes: DynamoDB in the
  same build as a `select` statement, a native build that fails to link
  on its first build after a cache refresh (build again, or
  `XO_BACKEND_CACHE=off`), and very large values on native arm64
  (`--backend=llvm`).

The SDK is public at
[github.com/xo-lang/aws](https://github.com/xo-lang/aws), and its first
release is
[v0.1.0](https://github.com/xo-lang/aws/releases/tag/v0.1.0): the core
and all 435 service modules, tagged together. The README shows how to
add a service to a program.
