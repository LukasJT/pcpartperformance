# Master editorial handoff

Eight complete original resources were prepared from current official sources on **October 13, 2026**. Total editorial text: **6,253 words**. The module exports content and evidence; it does not render, publish, deploy, alter previous articles or manufacture release authorization.

| ID | Canonical intent | Result | Words |
| --- | --- | --- | --- |
| M01 | `/compare/rx-9070-vs-rx-9070-xt/` | New curated specification/purchase-process comparison | 723 |
| M02 | `/blog/ram-timings-cas-trcd-trp/` | Material revision superseding growth G04; specific CL30/CL36 analysis | 798 |
| M03 | `/blog/nvme-vs-sata-ssd-for-gaming/` | Material revision of prior draft16; exact 990 PRO/870 EVO 1 TB identities | 810 |
| M04 | `/blog/am4-upgrade-vs-platform-replacement/` | Material revision of prior draft21; exact illustrative CPU/platform facts | 800 |
| M05 | `/blog/new-pc-first-boot-setup-checklist/` | Material revision of prior draft10; staged first-boot and recovery path | 753 |
| M06 | `/blog/check-cpu-bios-support/` | Material revision of prior draft28; support/update evidence worksheet | 784 |
| M07 | `/blog/phased-pc-upgrade-plan/` | Material revision of prior draft25; usable intermediate-stage checklist | 773 |
| M08 | `/blog/choose-a-pc-power-supply/` | Material revision of prior draft29; separated power/cable/fit questions | 812 |

## Integration schema

`require('./master-editorial-content.cjs')` exposes `articles`, `sources`, `evidenceDate`, `wordCount`, `fingerprint`, `validate`, `prepare` and `markdown`.

Each article contains:

- `id`, `route`, `canonicalRoute`, `type`, `title`, `description`, `summary`, `intent`, `audience`.
- `sections`: title, full original paragraphs, section `sourceIds`, optional original factual/worksheet table.
- `tools`: actual current destinations with `href` and `label`.
- `sourceIds`, `evidenceDate`, `contentVersion`, attribution and limitations.
- `existingIntent`: exact previous program/ID/canonical where this is a revision.
- `imagePlan`: a proposed original 1200 × 675 editorial diagram, not an existing image or a hardware-test photograph.
- Unset human-review/publication records, `humanReviewClaimed: false`, proposed organization author **PC Part Performance**, AI-assistance disclosure.

Source records contain publisher, title, official URL, checked/inspected date, inspected scope, limitations and rights basis. Consequential section citations are already assigned. The parent renderer should escape text, preserve accessible tables and source links, and keep source dates distinct from actual publication/revision dates.

## Validation actually performed

- JavaScript syntax check passed.
- Eight complete articles, unique canonical routes, complete summaries/sections/tables and source references validated.
- Seven previous intent IDs and their canonical mappings checked against the actual prior/growth content modules.
- Every proposed working-tool destination checked in the existing generated output.
- Exact `rx9070` and `rx9070xt` identities checked in the route/product manifest for the interactive comparison link.
- Every source URL checked for HTTPS; article/source hashes saved in the manifest.
- No publication date, update date, hands-on test or personal human-review claim inserted.

The old AMD desktop-product URL for the Ryzen 7 5700X3D genuinely returned 404. Its live official support page exposes the model's specification table and is used instead; the source record documents that distinction. No inaccessible source is cited as if its text was read.

## Remaining release work and bounded limitations

1. Common rendering/discovery, exact revision selection and owner publication authorization are handled centrally. No public routes were changed by this module.
2. Generate and inspect the proposed original diagrams, or deliberately release without a lead diagram. Do not substitute a generic logo as if it were component evidence.
3. Browser layout/keyboard QA, shared metadata/schema validation, build and live deployment remain central tasks.
4. Current offers and comparable measured gaming data were not supplied. M01/M04 do not pretend to resolve a price-performance winner; M02 does not infer FPS from nanoseconds; M03 does not infer game loads from sequential specifications.
5. Exact motherboard firmware support is a reader-specific check in M04/M06. No invented minimum BIOS or shipped version blocks a fake-ready purchase recommendation.
6. `humanReview` is unset. AI source checking is recorded truthfully; no named expert, personal review attestation or independent testing is invented.

Within those stated scopes, all eight resources are complete source-backed integration candidates. External data missing for a stronger buying/performance verdict remains individually explicit rather than replaced with simulated facts.
