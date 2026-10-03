# AM5 CPU upgrade checklist: BIOS, memory, cooling and storage

URL: /blog/am5-upgrade-checklist/
Meta description: Plan an AM5 CPU upgrade with an exact motherboard support-list check, BIOS notes, memory configuration, cooler mounts and storage lane checks.
By PC Part Performance. Draft created October 3, 2026. First publication remains pending deployment.

An AM5 socket match starts the check; it does not finish it. Confirm the exact CPU on the board support list, the required BIOS, the cooler mount, memory configuration and any slot-sharing rules before buying.

## Record the system you have

Copy the motherboard’s full model and hardware revision, installed BIOS, processor, memory kit number and cooler model. Similar product names are easy to confuse. Use the manufacturer page for that exact board rather than a support table for the chipset family.

Keep these details in your build notes. If the PC is working, find the firmware information before removing the old processor. A screenshot of the firmware version can be more useful than a recollection of when you last updated it.

## Make CPU support a documented check

Find the intended processor in the board maker’s CPU support list. Record the minimum BIOS and the source URL. Compare that version with the installed firmware; do not assume a new processor is supported simply because it fits the socket.

Read the update instructions, including whether an existing supported CPU or a separate flash feature is required. This guide does not claim a minimum BIOS for every AM5 board. The current MSI support table was not extractable in our audit, so the exact version remains a manual check.

## Check memory and cooling as configurations

Match the memory generation, module count and kit against the board documentation. Recheck slot placement and any supported-profile notes after a CPU change. A rated kit speed and the processor’s official memory support are different specifications.

Confirm the cooler’s mount, hardware and case space. If you will reuse a cooler, follow its vendor’s removal and installation instructions. Keep any cooling question unresolved until you have the exact model information.

## Review expansion and storage notes

A CPU change can be part of a larger upgrade involving a new GPU or additional storage. Read the motherboard’s lane and slot notes for the planned combination. On the MAG B650 TOMAHAWK WIFI, MSI documents sharing between M2_3 and PCI_E2; that rule must not be generalized to every B650 board.

The builder counts indexed slots and ports but does not model every lane-sharing rule. For a second expansion card, note which slot it needs and which storage slot is occupied. Check that plan in the exact manual.

## Keep a final verification record

Before ordering, mark each check as confirmed, unresolved or not applicable: CPU support, BIOS procedure, RAM configuration, cooler mount, PSU connections and physical space. A list with one unresolved requirement is not a compatibility certificate.

After assembly, verify the detected components and settings, then test the workload that justified the upgrade. Report a data error with the product ID, source and incorrect field through the correction link. The 3D preview is useful for layout, but exact mounting and cable clearance remain separate checks.

## Sources

Checked 2026-10-03.

- [AMD Ryzen 7 9800X3D specifications](https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9800x3d.html)
- [AMD Ryzen 7 7800X3D specifications](https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800x3d.html)
- [MSI MAG B650 TOMAHAWK WIFI manual](https://download.msi.com/archive/mnu_exe/mb/MAGB650TOMAHAWKWIFI.pdf)
- [MSI MAG B650 TOMAHAWK WIFI specifications](https://us.msi.com/Motherboard/MAG-B650-TOMAHAWK-WIFI/Specification)

## Related resources

- /compare/ryzen-7-9800x3d-vs-7800x3d/
- /blog/understanding-pc-memory/
- /builder/
- /builder/model-coverage/

Corrections: /editorial-policy/#corrections. Interactive calculators and their visible examples are implemented in scripts/seo-launch.cjs and dist/research-tools.js.
