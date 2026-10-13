# Distribution drafts — useful demonstrations and answers

Prepared October 13, 2026. **Drafts only: no videos uploaded, messages posted, newsletter sent or subscriptions collected.** Use actual released UI footage. Proposed production paths for this increment must be checked live before distribution; prior approved C01–C12 publication status does not establish deployment of a new tool.

Use PC Part Performance as the organization credit, explain AI assistance where applicable, credit original source publishers, and disclose any active commercial relationship. Do not use another creator’s benchmark footage/tables as this site’s tests.

## Six short-video scripts

Each is designed for roughly 35–60 seconds. Record clean desktop or mobile UI; retain readable labels, captions and source links. No fake dashboards, stock “lab” footage or fabricated result charts.

### S01 — DDR5-6000 CL30 vs CL36: what 10 ns and 12 ns mean

**Show:** memory-timing calculator with both kits at 6,000 MT/s and CAS 30/36. Leave optional timings blank, calculate, then show the limits beneath the table.

**Spoken script:**
“CL30 and CL36 count memory-clock cycles. You need the data rate too. At 6,000 MT/s, the CAS calculation gives 10 nanoseconds for CL30 and 12 for CL36. That is one interval, not a promise of two nanoseconds less total latency or better game FPS. Compare the capacity, supported generation and exact kit separately. This tool keeps the arithmetic visible and leaves optional timings unknown when you haven’t entered them.”

**On-screen text:** “Calculated CAS interval ≠ measured game performance.”

**Destination:** [Two-kit RAM timing comparison](https://www.pcpartperformance.com/tools/memory-timing-comparison/). Supporting existing guide: [Choosing gaming RAM](https://www.pcpartperformance.com/blog/how-to-choose-gaming-ram/). G03/G04 remain draft content until approved.

### S02 — Why 100 MB/s does not tell you when a copy will finish

**Show:** transfer tool with 100 GB, 100 MB/s and 10% extra allowance; calculate. Switch MB/s to Mb/s and point out the changed unit before restoring it.

**Spoken script:**
“Start with a rate observed in a similar copy, rather than the drive’s headline maximum. One hundred decimal gigabytes at a constant one hundred megabytes per second takes sixteen minutes forty seconds. A ten-percent extra-time allowance makes the plan eighteen minutes twenty. Megabits per second is a different input: eight bits make one byte. File sizes, caches and other work can change real throughput. This is your input-based time budget, not an SSD benchmark or a confidence interval.”

**On-screen text:** “GB vs GiB. MB/s vs Mb/s. Manual allowance.”

**Destination:** [Storage transfer time](https://www.pcpartperformance.com/tools/storage-transfer-time/). G01 companion article remains unpublished until approved.

### S03 — A debug light is an observation, not a failed-part verdict

**Show:** troubleshooting start → persistent-light path → printed-label choice. Show the documented/manual support next step and the plaintext record export. Use demo notes with no personal data.

**Spoken script:**
“A PC that turns on with no picture gives you clues, not a diagnosis. Start with the monitor input and output path. If a light stays on, read the printed label and the exact motherboard manual; colors and startup behavior vary. Record what happened before changing a part. Disconnect power before internal checks, keep cooling installed for a boot test, and use only documented cables. This guide records a safe next check. It does not declare your GPU or memory defective.”

**On-screen text:** “Exact manual. One change. Record the result.”

**Destination:** [Troubleshooting](https://www.pcpartperformance.com/troubleshooting/). G02 remains an editorial candidate, not a publicly released guide.

### S04 — Same socket: what still needs checking?

**Show:** select a known matching CPU/board pair in the standalone checker. Keep the socket result and unresolved BIOS result in the same shot; open the exact source and then the builder.

**Spoken script:**
“A matching socket answers one question. It does not tell you which BIOS is installed on the board you will receive. Find the exact motherboard model and revision, the CPU-support entry, and its minimum firmware requirement. Then verify the installed or shipped version. Our checker separates documented fields from checks that still need that evidence. Bringing the pair into the builder adds the other questions: memory, cooling, power and physical space. A passed socket check is never a complete compatibility certificate.”

**On-screen text:** “Socket result + BIOS evidence + whole-system checks.”

**Destination:** [Compatibility](https://www.pcpartperformance.com/compatibility/). Do not suggest the tool contains a verified minimum-BIOS entry if it does not.

### S05 — The price of a CPU upgrade is not always the CPU price

**Show:** existing platform-upgrade cost worksheet with explicit manual demo quotes labeled “example inputs.” Compare reuse versus new CPU/board/memory/cooling rows; deliberately leave one required quote blank.

**Spoken script:**
“Before comparing two CPUs, compare what each route requires you to buy. A platform change can include the motherboard, memory, cooling hardware and other accessories. Keep parts you already own separate from new spending. If a required price is missing, this is a partial subtotal, not the cost of the finished upgrade. These are manual example quotes, not today’s retailer offers. You can save the plan, then update the real prices and compatibility checks before ordering.”

**On-screen text:** “Owned parts ≠ new spending. Missing quote ≠ zero.”

**Destinations:** [Platform-upgrade costs](https://www.pcpartperformance.com/tools/platform-upgrade-cost/) and approved C03 [Build vs Buy complete cost](https://www.pcpartperformance.com/blog/build-vs-buy-pc-complete-cost/).

### S06 — An FPS estimate and a benchmark answer different questions

**Show:** performance evidence/coverage page, current PC record count, console source context and test-protocol fields. Keep the legacy-model demonstration off.

**Spoken script:**
“Before using an FPS number, ask where it came from. A measured benchmark needs the game version, exact hardware, settings, driver and test scene. A console mode target is not proof of the same frame rate in every scene. A synthetic-score calculation is another kind of result entirely. Read the current coverage here: when the required measurement is unavailable, the site should say so. An empty evidence result is more useful than a confident number that was never tested.”

**On-screen text:** “Measured test • source report • target/cap • unvalidated calculation.”

**Destinations:** [Coverage](https://www.pcpartperformance.com/performance/coverage/) and [Benchmark protocol](https://www.pcpartperformance.com/performance/evidence/). Use the count at recording time; do not preserve a stale zero if evidence later changes.

## Three longer video outlines

### L01 — From parts list to build-readiness report

**Format:** 6–8 minutes; original screen recording with readable captions.
**Reader task:** understand unresolved checks before buying or assembling.
**Routes:** /build-school/, /builder/, /compatibility/ and approved C07.

1. **0:00 — Define the job.** Workload, display, country and full budget scope; distinguish a tower from a complete usable setup.
2. **0:45 — Pick exact identities.** Show why a memory capacity, GPU partner model or motherboard revision needs its own selected record.
3. **1:45 — Socket versus support.** Demonstrate the checker and exact source. Keep shipped BIOS unknown unless actually documented.
4. **2:45 — Read the readiness report.** Explain supported checks, conflicts, manual verification and what software cannot inspect. No score pretending to certify safety.
5. **4:00 — Appearance versus fit.** Rotate a supported model, then read separate dimensions/connector assumptions. Link C07; do not call the visual mesh validated geometry.
6. **5:00 — Save the useful state.** Demonstrate exact parts and a local checklist/export. Explain local storage and share-link visibility accurately.
7. **6:00 — First boot and official manuals.** Show the Build School next step, required cooler and safe troubleshooting path without performing hardware procedures on imaginary equipment.

**Capture gate:** verified actual controls, real source links and no personal saved-list details.
**Next action:** create a parts list and resolve one documented unknown.
**Avoid:** “100% compatible,” “perfect 3D fit,” guaranteed game FPS or a budget without all required prices.

### L02 — Prebuilt or DIY: make the complete cost comparable

**Format:** 6–7 minutes; source-led comparison worksheet, no current deal claim.
**Reader task:** compare systems on the same configuration/support/cost basis.
**Routes:** /prebuilts/, /tools/platform-upgrade-cost/, /tools/budget-build-lab/ and approved C01–C04/C08.

1. Identify the exact retailer SKU, region, seller and condition.
2. Separate disclosed components from unknown PSU/board/cooling details.
3. Define whether OS, networking, peripherals, taxes and shipping belong in the budget.
4. Use explicitly labeled manual demonstration quotes; leave unavailable entries visible.
5. Compare DIY responsibility, warranty/support terms and realistic reuse/upgrade restrictions.
6. Show when evidence is too incomplete to choose a best-value winner.
7. Save the worksheet and verify the exact listing at purchase time.

**Capture gate:** no expired price shown as current; no fabricated retailer discount, stock or availability.
**Source context:** link the actual seller’s terms and explain that an individual review applies to its tested configuration, not every system from that brand.
**Next action:** fill the missing configuration and cost fields before ordering.

### L03 — Read a hardware benchmark without comparing unlike tests

**Format:** 5–7 minutes; original explanation using the site’s protocol and evidence views.
**Reader task:** decide whether a published measurement applies to their question.
**Routes:** /performance/evidence/, /performance/coverage/, /tools/frame-time-budget/ and existing display-goal tools.

1. Distinguish manufacturer specifications, original measured review, mode target and calculated estimate.
2. Read the host CPU/GPU/RAM/driver and game version before the result.
3. Keep native rendering, ray tracing, upscaling and generated frames separate.
4. Explain average FPS, frame-time behavior and why a missing measured low-percentile figure stays missing.
5. Demonstrate frame-interval arithmetic without calling it end-to-end input latency.
6. Link an original benchmark publisher with its conditions; do not reproduce an unlicensed table or claim the site ran that test.
7. Use the coverage gap to choose the next evidence request, not invent a precise upgrade uplift.

**Capture gate:** original diagrams or UI, accurate units, rights-cleared media, no synthetic data presented as real measurements.
**Next action:** compare one source’s conditions with the intended game/setup before spending.

## Helpful community-answer drafts

These are standalone assistance, not automated comments. Post only where the question actually fits, follow the community’s rules, and disclose ownership if a site link is used. Remove the optional link when it adds no value.

### Answer 1 — “Should I get CL30 or CL36?”

“The data rate needs to accompany the CL number. At DDR5-6000, CL30 corresponds to a calculated 10 ns CAS interval and CL36 to 12 ns: CL × 2,000 ÷ MT/s. That does not measure the entire memory access or predict an FPS gain. Check generation, capacity, module count and your exact CPU/board/kit support before choosing. Also distinguish an advertised profile from the setting your PC actually uses.”

**Optional transparent link:** “I work on PC Part Performance; our [timing calculator](https://www.pcpartperformance.com/tools/memory-timing-comparison/) shows that arithmetic and its limits.”

### Answer 2 — “They’re both AM5, so will it work?”

“AM5 is a useful first check, but use the exact board model and revision’s CPU-support report. Find the processor entry, its required BIOS, and which version the board has or ships with. Memory population, cooler mounting, cables and fit need separate checks. If shipped firmware is unknown, keep that unknown in your plan rather than assuming socket matching settles it.”

**Optional link:** [Compatibility checks](https://www.pcpartperformance.com/compatibility/), with site ownership disclosed. Do not imply the tool has an inspected CPU/BIOS row that it lacks.

### Answer 3 — “My new PC lights up but there’s no picture.”

“Start by recording the monitor input, which output the cable uses, and any persistent printed debug label. A motherboard video output requires a CPU with usable graphics; a discrete card changes the intended output path. Follow your exact board manual, because LED colors and startup sequences vary. Disconnect power before an internal check, keep the cooler installed for a boot test, and do not change several things at once. A light or one failed boot does not prove a particular part is defective.”

**Optional link:** [Diagnostic path](https://www.pcpartperformance.com/troubleshooting/). Do not diagnose private details that were not supplied.

### Answer 4 — “Is this prebuilt cheaper than building it?”

“Compare the exact configuration and delivered cost, including anything required to use it. A CPU/GPU name leaves the PSU, motherboard, memory arrangement, cooling, OS, support terms and seller condition unresolved. Put the DIY list and that exact prebuilt on the same cost basis. Missing prices or undisclosed internals can change the answer; there is no universal prebuilt markup. Check current seller/return terms rather than using an expired screenshot.”

**Optional link:** approved C03 [Complete Build vs Buy costs](https://www.pcpartperformance.com/blog/build-vs-buy-pc-complete-cost/).

### Answer 5 — “Can a 3D preview tell me if it fits?”

“It can help you see an arrangement and inspect supported model angles. Verify fit separately against the exact partner card and case configuration: length, height, thickness, power-connector access, radiator/fan stack and mounting can all matter. A creator mesh is not automatically a measured engineering model. Keep any missing dimension or configuration note as a manual check.”

**Optional link:** approved C07 [3D preview limits](https://www.pcpartperformance.com/blog/3d-pc-builder-preview-limits/).

## Newsletter draft

**State:** preparation only. No delivery service, consent flow, unsubscribe system or send job is active. Do not collect email addresses with a nonfunctional form.

**Subject:** Before you buy: check the model, the cost and the evidence
**Preview:** Practical ways to turn a hardware question into a clear build plan.

**Body:**

Hi,

A useful PC decision starts with the details that can change it.

- **Comparing memory?** Look at data rate and timing together. Our timing comparison explains the arithmetic without claiming it measured game performance.
- **Planning an upgrade?** Count the board, memory, cooling and other required purchases alongside the CPU. Keep missing quotes visible.
- **Buying a prebuilt?** Compare the exact configuration and seller terms. The [complete-cost guide](https://www.pcpartperformance.com/blog/build-vs-buy-pc-complete-cost/) puts DIY and prebuilt options on the same basis.
- **Using a 3D preview?** Explore the layout, then verify dimensions and connectors separately. [Read what the preview can establish](https://www.pcpartperformance.com/blog/3d-pc-builder-preview-limits/).

Choose one unresolved check in your plan and follow its original source before ordering.

PC Part Performance

**Before activation:** add the real configured unsubscribe and preference controls, the applicable sender/contact details and a clear subscription basis. Keep recommendation relationships disclosed. Replace references to newly implemented tools if their live release has not been verified.

## Copy and media quality check

Before any authorized release: verify every linked URL, record actual tool footage, check current source/offer dates, preserve limitations beside results, use readable phone captions and accessible descriptive links, credit permitted media, and confirm the article/tool release state. The aim is a useful answer and a genuine next task—not manufactured activity, spam, backlinks or traffic guarantees.
