# Skills used in the upgrade pass

Only skills already available in the environment were considered; none were fetched or installed.

| Task | Skill | Used? | Reason |
|---|---|---|---|
| Elevation / spatial UI direction | `frontend-design` | Yes (invoked) | Its guidance against the generic uniform-shadow "SaaS card kit" shaped the decision to elevate only KPI cards, tint shadows with the brand navy and keep everything else flat. |
| Understanding the existing codebase | `project-takeover` | No (not invoked) | The repo is small (about 35 source files) and fully documented; direct reading of config, entry points, schema, controllers/services and the relevant pages was faster and covered the same ground. |
| Architecture review | `architecture-review` | No (not invoked) | Module boundaries were checked by reading; the controller/service/module layout is sound and no structural change was made. |
| Production readiness | `production-readiness` | No (not invoked) | The same ground (secrets, CI, containers, health, errors) was covered by manual review and recorded in `docs/SECURITY.md` and `docs/UPGRADE-REPORT.md`. |
| Security review | `security-review` | No (not invoked) | Manual review only; no formal skill-driven review or dependency scan was performed. |
| Browser verification | `webapp-testing` | No | Verification used the built-in browser pane (DOM and computed styles) instead. |

No custom skill was authored; none would have had recurring value here.
