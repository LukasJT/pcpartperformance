# SSD capacity planner: storage budget and TB to GiB conversion

URL: /tools/storage-capacity-planner/
Meta description: Plan SSD capacity for games, applications and files. Convert advertised decimal TB to binary GiB and set your own free-space allowance.
By PC Part Performance. Draft created October 3, 2026. First publication remains pending deployment.

Enter the advertised drive capacity and the storage you expect to use. The tool converts decimal TB to binary GiB, adds your workload budget and reserves the free-space percentage you choose.

## Use one unit throughout the plan

A decimal TB is 1,000,000,000,000 bytes. A GiB is 1,073,741,824 bytes. Dividing the first by the second gives approximately 931.3 GiB per advertised TB. A lower-looking number in software therefore does not by itself mean the drive is missing capacity.

The conversion is before formatting or reserved partitions. This tool does not estimate filesystem metadata, recovery partitions or how your operating system labels its display. It keeps the arithmetic explicit so you can compare your inputs consistently.

## Build a budget from real workloads

Enter the combined operating-system and application budget, game installs, and personal or project files in GiB. Read current installed sizes where you can. Include working copies and downloads that coexist rather than counting only a final exported file.

Game update sizes and temporary working space can change. The free-space allowance is yours to choose; the default is an illustrative planning preference, not a manufacturer requirement or a promised performance threshold.

## Read the result as a plan

The available budget is the converted capacity after your chosen allowance. A positive balance means the entered budget fits that arithmetic. It does not certify storage compatibility or guarantee that future files will stay within the plan.

If the balance is negative, reduce the files you expect to keep locally or consider more storage. Do not assume compression, cloud synchronization or deleting old games will solve the difference unless those actions are part of your actual plan.

## Check the drive and backup separately

Capacity is one purchase requirement. Verify interface, M.2 length, slot rules and heatsink clearance before ordering. Keep backups of important files independently of whether the capacity plan fits.

Unsupported cases include RAID usable-capacity calculations, deduplication, compression estimates and drive-health forecasting. Report calculation errors with the inputs and expected units through our correction link. Formula reviewed October 3, 2026.

## Sources

Checked 2026-10-03.

- [Seagate: decimal and binary storage capacity](https://www.seagate.com/ca/en/support/kb/why-does-my-hard-drive-report-less-capacity-than-indicated-on-the-drives-label-172191en/)

## Related resources

- /blog/choosing-an-ssd/
- /hardware/solid-state-drives/
- /builder/

Corrections: /editorial-policy/#corrections. Interactive calculators and their visible examples are implemented in scripts/seo-launch.cjs and dist/research-tools.js.
