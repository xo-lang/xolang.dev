---
title: "Cloud SDKs"
description: "Community SDKs for AWS, Azure and Google Cloud, written in Xo and checked against the providers' own Go SDKs and test suites."
---

Three community SDKs let Xo programs call AWS, Azure and Google Cloud. Each
one is a port of the provider's Go SDK. Its clients are generated from the
same service descriptions Go uses, and its tests compare what it sends and
returns with what Go's SDK, or the provider's own test suite, does for the
same call.

They are community projects. They are not affiliated with or endorsed by
Amazon Web Services, Microsoft or Google. AWS, Azure and Google Cloud are
named here only to say which services each SDK calls.

Every number below comes from a file committed in that SDK's repository,
named next to it.

## AWS

[github.com/xo-lang/aws](https://github.com/xo-lang/aws), released as v0.1.0.

- **Coverage:** a generated client for all 435 of AWS's published service
  models, under `service/`, each type checked (`README.md`).
- **Verified by:** AWS's Smithy protocol compliance tests (741 cases across
  restJson1, restXml, awsJson1_0, awsJson1_1, awsQuery and ec2Query), the
  SigV4 and SigV4a signing suites, the endpoint rule tests in every model,
  and comparisons with aws-sdk-go-v2's output (`README.md`), plus runs
  against LocalStack.
- **Install** (the core and one service, each tagged v0.1.0):

  ```sh
  xo get github.com/xo-lang/aws@v0.1.0
  xo get github.com/xo-lang/aws/service/s3@v0.1.0
  ```

- **Usage:** [docs/usage.md](https://github.com/xo-lang/aws/blob/main/docs/usage.md).

## Azure

[github.com/xo-lang/azure](https://github.com/xo-lang/azure). Unreleased:
use the main branch.

- **Coverage** (`docs/reports/azure-go-coverage.md`):
  - All 307 management-plane (ARM) modules are generated and Go-verified.
  - 28 of the 29 current data-plane and support modules are ported. These
    include azcore, azidentity, the storage and Key Vault clients, Event
    Hubs, Service Bus, Event Grid, Cosmos DB, Tables and App Configuration.
    The one left is azidentity/cache's per-OS secret storage.
  - The 7 modules Go marks deprecated are not ported.
- **Verified by:** a Go program per module runs Go's own SDK against a fake
  transport (no network). The Xo tests replay the same calls and must match
  Go's requests and results line for line.
- **Install:** there is no tagged release yet, so `xo get` cannot fetch it.
  Clone the main branch next to your module, then add the root module and
  each module your program uses (here azidentity and azblob) to your
  workspace:

  ```sh
  git clone https://github.com/xo-lang/azure.git ../azure
  ```

  ```
  # xo.work
  xo preview
  use .
  use ../azure
  use ../azure/azidentity
  use ../azure/storage/azblob
  ```

## Google Cloud

[github.com/xo-lang/gcp](https://github.com/xo-lang/gcp). Unreleased: use
the main branch.

- **Coverage:** every API version that google.golang.org/api v0.311.0
  ships, 667 modules, all Go-verified (`docs/reports/gcp-go-coverage.md`).
- **Verified by:** every method is called in Go and in Xo with the same
  arguments. The tests compare the request, the response served and the
  result (`docs/reports/gcp-go-coverage.md`).
- **Install:** as for Azure, clone the main branch and add the root module
  and each API version your program uses (here Cloud Storage v1) to your
  `xo.work`:

  ```sh
  git clone https://github.com/xo-lang/gcp.git ../gcp
  ```

  ```
  # xo.work
  xo preview
  use .
  use ../gcp
  use ../gcp/storage/v1
  ```

## No real cloud calls in the tests

The tests run against fakes, recorded Go output and local emulators, never
a real account. The AWS SDK has also been run against real AWS by its
maintainers, as its `README.md` describes.
