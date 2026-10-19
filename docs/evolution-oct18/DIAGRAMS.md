# Original interactive hardware diagrams

## Integration and scope

`scripts/evolution-diagrams.cjs` exports `prepare({root,shell,write,esc})`.

Run before final SEO processing; it writes **/build-school/hardware-diagrams/** through the established shell/write helpers and copies `evolution-diagrams.js` and `evolution-diagrams.css`. Add an ordinary link from Build School and relevant existing guides. The route uses the existing `guide` shell and supplies a distinct descriptive title and summary. Final canonical, sitemap and layout processing remain the parent build’s responsibility.

This is a single useful educational destination, not eight thin pages. It does not load the hardware catalog, Three.js, remote images, model assets or a new framework. Every diagram and initial readout is rendered in HTML/SVG before JavaScript. Controls run locally; no user input is sent elsewhere.

## Eight functional diagrams

| Module | Working control | Evidence and limits |
| --- | --- | --- |
| Airflow | Reverse front/rear intake or exhaust arrows | Directional case sketch. No pressure calculation, CFD, temperature or fan-performance claim. |
| Memory slots | Select one, two or four modules | Explicit ASUS four-slot installation example: A2, A2/B2, all four. Never universalized to every board or used to infer memory speed/BIOS support. |
| PCIe sharing | Occupy M2_3 and/or PCI_E2 | Exact MSI MAG B650 TOMAHAWK WIFI documentation: M2_3 up to ×4 alone, ×2 when both occupied; PCI_E2 up to ×2. CPU and other-slot caveats retained. No throughput/FPS conversion. |
| Fan control | Select three/four-pin, PWM/DC, illustrative duty command | PWM control and supply-voltage control separated. Duty percentage never converted to RPM, noise or cooling. |
| GPU dimensions | Enter card length, available case length and additional obstruction | Validated arithmetic only. Empty/invalid input stays unknown; zero/negative remainder requires checking. Other dimensions, cables and double-counted obstructions explicitly excluded. Initial values are examples. |
| Power leads | Select ATX24, EPS4+4, PCIe6+2 or modern12+4 | Original simplified contact-count drawings, explicitly not a pinout, keying illustration or wiring reference. Exact PSU modular cable approval remains necessary. |
| SSD sizes | Select M.2 length and independently select SATA/NVMe | Four outlines use the same scale. Size does not establish protocol, keying, thickness or slot compatibility. |
| Cooler placement | Select tower, top, front or bottom radiator | AIO examples explicitly assume pump in CPU block. No cooling estimate, no universal pump-placement assertion, no clearance certification. |

## Primary-source register

Opened and inspected on **2026-10-19**. No first-hand hardware testing claimed; the artwork is original source-authored SVG. Manufacturer artwork and benchmark tables were not copied.

- Noctua airflow fundamentals: <https://www.noctua.at/en/support/faqs/airflow-guide-fundamentals>. Supports intake/exhaust and the effect of enclosure restrictions. Source-derived copy remains concise; no pressure outcome is inferred from fan count.
- ASUS memory installation: <https://www.asus.com/us/support/faq/1049387/>. Explicit A2/A2+B2 four-slot example, exact-manual instruction and removal of system power cord before installation.
- MSI board specifications: <https://www.msi.com/Motherboard/MAG-B650-TOMAHAWK-WIFI/Specification>. Inspected the M2_3/PCI_E2 sharing note and CPU-dependent M2_2 exception. Applies only to this named model, not a similarly named revision.
- Noctua three/four-pin fan FAQ: <https://www.noctua.at/en/support/faqs/can-i-run-noctua-3-pin-fans-on-4-pin-pwm-connectors-or-4-pin-fans-on-3-pin-connectors>. Describes PWM wire and conditional voltage control. The visual waveform is explanatory, not an oscilloscope measurement.
- NVIDIA RTX 5090 official page: <https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/>. Used only for the importance of card dimensions and additional cable space. Its reference-design values are not silently transferred into the manual worksheet. The page includes inconsistent power/installation details; this tool does not import its power recommendations or treat those sections as one consistent current specification. Direct user-guide PDF fetch returned a research-tool error; not represented as inspected.
- CORSAIR cable identification: <https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/which-psu-cables-go-where/>. ATX/EPS/PCIe roles, split connectors and CPU-versus-GPU lead distinction.
- CORSAIR exact modular cable compatibility: <https://www.corsair.com/us/en/s/psu-cable-compatibility>. Explicit incompatibility between some cable types; public illustrations do not replace manufacturer approval.
- Intel design guide: <https://edc.intel.com/content/www/us/en/design/products-and-solutions/processors-and-chipsets/alder-lake-s/atx12vo-12v-only-desktop-power-supply-design-guide/2.11/pcie-add-in-card-12v-2x6-auxiliary-power-connector-sideband-signals/>. Followed the earlier 2.1 version’s replacement link to **2.11**, dated May 2024. Four sideband signals are distinguished from larger power contacts; not all four are called sense pins. The bulk PDF research fetch timed out; the HTML documentation was inspected instead.
- Kingston SSD FAQ: <https://www.kingston.com/en/ssd/ssd-faq>. Inspected the dimension naming section and protocol/physical-compatibility distinction. The FAQ also contains dated performance/driver generalizations; those were not reused.
- CORSAIR radiator installation: <https://help.corsair.com/hc/en-us/articles/360049358271-AIO-How-should-I-mount-the-radiator-of-my-AIO-cooler>. Applied within the explicitly limited CPU-block-pump example.
- Noctua RAM clearance: <https://www.noctua.at/en/support/faqs/what-is-the-ram-clearance-of-my-noctua-cpu-cooler>. Raising a cooler fan can increase installed height; no specific cooler fit or thermal delta imported.

All consequential readouts link back to their applicable primary documentation. Source quotes were not copied. Existing article routes are linked only where already established, including the B650 lane-sharing walkthrough and GPU-fit checklist.

## Accessibility, motion and monetization

- Every control has a native label and readable text output, with `role=status` for changes.
- Each SVG has a descriptive image role/label; useful conclusions and dimensions also appear as normal HTML text.
- The page explains when an example is model-specific or illustrative. An unknown input never becomes a successful compatibility pass.
- Layout stacks below 900px and uses one-column form controls below 600px. Important readouts do not depend on small SVG text.
- Motion starts **off**. The user can enable it. Only line dashes animate; cards, controls and surrounding layout do not move.
- `prefers-reduced-motion` and the site’s manual **Reduce visual motion** preference disable animation immediately. The global **Pause ambient motion** control also stops continuous diagram motion. Either preference cancels the diagram’s earlier opt-in; resuming global motion does not restart it until **Animate diagrams** is pressed again. The runtime listens to `window`’s `pcp:appearance` event and keeps the button’s disabled/pressed/readable state synchronized. An IntersectionObserver pauses offscreen diagrams; hidden documents temporarily pause diagram motion. No JavaScript timer or animation-frame loop.
- No ad container is inserted or animated by this module. The parent’s publisher policy should keep any ads outside the interactive diagrams and control/readout areas.

## Tests actually executed

`node --test scripts/evolution-diagrams.test.cjs` — **13 checks passed**. The runtime fixture exercises manual reduced motion, global ambient pause, button state and no automatic restart on preference resume; this is not a regex-only test. Combined with the ten builder checks, **23 checks passed**.

Checks cover all eight complete still states, unique IDs and label association; reversible airflow; exact memory slots; MSI conditional lane counts and empty paths; PWM/DC limitations; missing/negative/zero/positive manual clearances; CPU/GPU connector identity; same-scale M.2 dimensions and hostile selection input; cooling pump assumptions; scoped route/asset preparation; opt-in/offscreen/hidden/reduced motion safeguards; and actual mounted control handlers changing artwork/readouts and disabling motion when requested.

The parent owns browser execution, full build, route/sitemap validation and production release. Browser screenshots are still a release gate at this handoff, due the parent’s automatic-approval service capacity error. This workstream did not bypass that review or claim browser results.

Executed `node scripts/evolution-diagrams-vector-qa.cjs` and visually inspected `qa/diagram-vector-contact-sheet.png`: eight local SVG geometry previews, readable labels and complete contained outlines. These Sharp-rendered vector previews inspect original geometry only; they are explicitly not browser, responsive-layout, keyboard or theme-contrast evidence.
