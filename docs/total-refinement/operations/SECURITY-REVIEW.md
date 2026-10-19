# Targeted operational security review

Reviewed October 19, 2026. These are tested controls and explicit residual risks, not a penetration-test certificate.

| ID | Finding | Severity / status | Code and proof |
| --- | --- | --- | --- |
| OPS-S01 | Existing daily network collection inherited repository-write access and persisted checkout credentials. | Medium; implemented and tested locally. | Workflow now defaults to contents read, disables credential persistence for collection and isolates publication in a separate job. Action references use full verified SHAs. |
| OPS-S02 | Adding source discovery would create an SSRF surface if pasted URLs or remote redirects could select destinations. | Preventive control for this new feature; tested. | Fixed registry, exact HTTPS origin, no custom ports/userinfo/IP literals, same-origin manual redirects, all DNS answers checked, selected address pinned into the TLS connection lookup. Private/metadata/mapped/transition/documentation addresses denied. |
| OPS-S03 | Unbounded source bodies or external XML entities could consume resources or access unintended content. | Preventive control; tested. | 1 MiB response cap, 12-second request and DNS deadlines, two redirects, one transient retry, explicit types and external-entity refusal. No XML external-entity resolver or downloaded executable code. |
| OPS-S04 | An operational artifact could become a privileged import if executed or copied without validation. | Preventive control; tested. | Fixed same-run artifact, regular-file checks, pure validation, unknown keys stripped, fixed five JSON destinations, explicit Git staged-file allowlist. All input validates before destination writes. |
| OPS-S05 | A valid daily artifact could replace newer history created while its collector ran. | Medium correctness risk; fixed and tested. | Publisher retains newer exact observations and merges recorded history; conflicting same-time observations fail. |
| OPS-S06 | User notes, private quotes or warranty records might leak through convenient public sharing. | Existing protection retained; regression verified. | Actual workspace/backup/share modules tested with synthetic notes. Public URLs use part selections rather than private notebook text. No user browser storage was read. |
| OPS-S07 | Failed multi-store backup restoration could leave only half of private workspace data written. | Existing protection retained; regression verified. | Actual `commitStores` rollback tested after the second store deliberately fails; build-revision key stays unchanged. |
| OPS-S08 | Existing advertising documents have a broader third-party script policy than normal pages. | Residual third-party risk; unchanged. | Existing seven security tests verify isolation from normal-page CSP. This is not proof every third-party ad is safe. Provider changes still need consent, supply-chain and rendered-layout review. |

The new monitor does not use cookies, sessions, cart endpoints, proxies, CAPTCHA solving, private APIs, challenge bypasses or owner credentials. A 401/403 becomes an unavailable-source record. It does not automatically advise firmware installation from an index change.

## Guidance applied

- [OWASP SSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html): allowlist intentional destinations and consider DNS resolution and redirect behavior. The new transport enforces those controls at the actual connection.
- [GitHub secure use](https://docs.github.com/en/actions/reference/security/secure-use): minimize token permissions, avoid untrusted context injection and verify action identities. No pull_request_target or untrusted checkout is introduced.
- [GitHub workflow scheduling](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onschedule): timezone-aware schedules run from the default branch. Activation is a separate release step from production source changes.

## Remaining work and limits

No credentials, identity verification, paid service, account or legal agreement was created. No cloud backup of private visitor records exists. No full dependency vulnerability scan, broad penetration test, or real iOS screen-reader audit is claimed by these operational tests. Current vendor bundles and advertising demand need ongoing review. Existing price adapters have fixed exact targets and their own parser/request tests; expanding their source universe still requires applicable permissions and retailer terms.

Repository administrators should review default-branch protections, workflow-file ownership and Actions permissions through their authorized account. Do not grant this monitor administration, secrets-write, issue-write or automatic pull-request merge access. It needs none.
