# Extra motherboard photograph audit — 2026-10-17

68 motherboard records researched; 66 exact named-model photographs accepted after actual visual inspection; 2 revision-specific records unresolved.

## Deliverables

- Registry: scripts/component-photo-board-extra-oct17.json
- Assets: dist/assets/hardware/catalog-board-extra-oct17/ (132 WebP files, 6.90 MiB)
- Per-ID outcomes: board-extra-audit.json
- Research candidate evidence: board-extra-research-1.json through board-extra-research-7.json
- Actual visual QA: board-extra-contact-1.jpg through board-extra-contact-4.jpg and contact index.

## Unresolved

- b650aorus: Catalog specification source is explicitly B650 AORUS ELITE AX rev. 1.2. Accessible product photos are original 1.0/1.1 or do not establish 1.2. Exact 1.2 retailer page Libre Opcion P727323 returned 403; official image downloads blocked. Generic model photo accepted only for separate c-board-gigabyte-b650-aorus-elite-ax record, whose name has no PCB revision. No unproven revision substitution.
- retail-gigabyte-b550-aorus-elite-v2: Catalog specification source is explicitly B550 AORUS ELITE V2 rev. 1.2. LDLC image is the exact V2 model but source dates the listing to November 2020 and does not establish PCB rev. 1.2. Manufacturer revision page is readable in web cache but direct media blocked. Alternate exact-revision retailer result returned 404. Withheld rather than treating a V2 model match as revision proof.

## Source and rights status

Retailer and distributor product photos were used when official bytes were blocked. No blocks were bypassed. Attribution identifies the publishing source and avoids claiming a manufacturer license where none was established. Public availability is not an open reuse license; no permission grant was inferred. The Biostar X870E launch picture explicitly credits Biostar in its Notebookcheck source. One ASUS image comes directly from the manufacturer.

## Validation

Every accepted source was decoded as an image, resized with proportions preserved within 800 px and 320 px, inspected on contact sheets, and checked for full metadata, local paths, dimensions, source hashes, derivative hashes and thumbnail hashes. Board revisions are not silently invented; any revision marker in a catalog specification URL is carried in per-record revisionEvidence. No shared runtime/source, build, commit or deployment performed by this task.
