# How to choose an SSD: capacity, interface and motherboard fit

URL: /blog/choosing-an-ssd/
Meta description: Choose an SSD by capacity, SATA or NVMe interface, M.2 size and motherboard support. Understand speed claims, endurance and storage units.
By PC Part Performance. Materially revised October 3, 2026. Original publication date not recorded.

Choose enough capacity, then verify the drive’s interface and physical format against your motherboard. M.2 describes the shape; it does not by itself establish SATA or NVMe support.

## Plan capacity around the files you keep

Add the operating system, installed applications, game library and working files you need locally. Include temporary space for updates and large projects. Use actual install sizes where available; a count of games alone cannot describe the storage requirement.

Keep the plan separate from backup. A larger SSD gives you more room, but a single drive is still a single copy of your data. Decide where irreplaceable files will be backed up before treating an additional drive as protection.

## Match the interface and physical format

SATA and NVMe identify different storage connections; M.2 is a physical format. Check the exact slot’s supported interface and module length in the motherboard manual. A drive that appears to fit the connector can still be the wrong electrical type.

Check the complete SKU, including capacity and heatsink option. The same product family can contain versions with different endurance ratings or physical height. A heatsink can also matter when a motherboard already supplies its own cover.

## Read the slot notes, not just the slot count

A motherboard can have several M.2 slots with different connections or bandwidth-sharing rules. Choose a slot after reading its notes. The MAG B650 TOMAHAWK WIFI manual, for example, documents bandwidth sharing between M2_3 and PCI_E2; this is a board-specific rule.

Our builder counts indexed ports and slots. It does not resolve every lane-sharing arrangement. Keep additional expansion cards and drives in the same plan, and recheck the manual when you change the configuration.

## Interpret speed and endurance honestly

Advertised sequential read and write speeds describe particular transfer conditions. They are not a promise that a game loads a corresponding percentage faster. For your workload, look for original tests of the operations you care about, with the tested capacity specified.

Endurance ratings and warranty conditions are also capacity-specific. Check the manufacturer’s terms for the exact drive rather than copying a number from another size in the family. Endurance is not a forecast of the exact day a drive will fail.

## Understand the capacity shown by software

Drive labels use decimal units; software can report capacity using binary units. One decimal TB contains 1,000,000,000,000 bytes, which is about 931.3 GiB. Formatting and system partitions can reduce the space available for files further.

Our capacity planner shows the unit conversion and a budget you control. It does not estimate filesystem overhead or compressibility. Before buying, compare the drive’s exact capacity, fit, warranty and local total price, then keep the source page with your build notes.

## Sources

Checked 2026-10-03.

- [Kingston: SATA, NVMe and M.2 questions](https://www.kingston.com/en/ssd/ssd-faq)
- [Seagate: decimal and binary storage capacity](https://www.seagate.com/ca/en/support/kb/why-does-my-hard-drive-report-less-capacity-than-indicated-on-the-drives-label-172191en/)
- [MSI MAG B650 TOMAHAWK WIFI manual](https://download.msi.com/archive/mnu_exe/mb/MAGB650TOMAHAWKWIFI.pdf)

## Related resources

- /hardware/solid-state-drives/
- /tools/storage-capacity-planner/
- /learn/990pro.html
- /builder/

Corrections: /editorial-policy/#corrections. Interactive calculators and their visible examples are implemented in scripts/seo-launch.cjs and dist/research-tools.js.
