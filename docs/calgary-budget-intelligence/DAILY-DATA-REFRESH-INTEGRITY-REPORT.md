# DAILY DATA REFRESH INTEGRITY REPORT

> **Second-stage update, November 11, 2026.** This page was written for the first review. Since then the branch gained the assistants' wiring (the owner's instruction), the commercial opportunity was removed (the owner's instruction), and a second-stage audit added one data field and fixed several defects. Where this page and `FINAL-VERIFICATION/` differ, `FINAL-VERIFICATION/` is the current state.

Calgary Insight, Budget Intelligence development. Prepared 2026-11-11 against production commit `ff42583` (branch `main`).

**Result: the daily data-refresh system is intact and unchanged.** No refresh command, schedule, workflow, API connection, credential reference or data source was deleted, renamed, replaced, disabled or modified. No scheduler was added. No refreshed dataset is overwritten by static data. Nothing has been pushed to `main` and nothing has been deployed.

## 1. Original refresh commands and schedules (baseline, recorded before development)

### 1.1 GitHub Actions on `main`

| Workflow | File | Schedule (UTC) | Other starts | Command | What it does |
|---|---|---|---|---|---|
| Website | `.github/workflows/site.yml` | `23 11 * * *` (about 4:20 a.m. Calgary) | push to `main` touching `*.py`, `ui/**`, `web/**`, `data/**` or the workflow; manual | `python web/build_site.py _site --cache .site-cache --pyodide pyodide` | Rebuilds every ward and screen from public data, then publishes to GitHub Pages and tells IndexNow |
| Backup | `.github/workflows/backup.yml` | `41 9 * * *` (3:41 a.m. Calgary) | manual | `git bundle create ... --all`; `gh run download` of the published site | All branches as one bundle plus the published website, kept 90 days |
| Calgary News images | `.github/workflows/news-images.yml` | `20 0,1,2 * * *` | manual; started by the evening news task | `python main/tools/news_images.py news` | Adds a credited reference image to each new article on the `news` branch |
| AI gateway | `.github/workflows/gateway.yml` | none | push to `main` touching `gateway/**`; manual | `node gateway/test.mjs`, then deploy | Deploys the Cloudflare Worker that holds the AI key |

Website workflow details: concurrency group `website` (a new run waits, never cancels a running one); 150-minute limit; `.site-cache` restored and saved every run so the weekly and daily copies carry over; each build step is wrapped so that a source that does not answer keeps yesterday's copy (`keep_previous`) instead of failing the build or publishing an empty file.

Credential and setting references (names only; no value was read, printed or copied at any point):
secrets `ANTHROPIC_API_KEY`, `GENIE_ACCESS_CODE`, `ELECTION_ACCESS_CODE`, `BUSINESS_ACCESS_CODE`, `SEC_CONTACT`, `SOCRATA_APP_TOKEN`, `CLOUDFLARE_API_TOKEN`, `GITHUB_TOKEN`; variables `CONTACT_EMAIL`, `FIREBASE_CONFIG`, `AI_GATEWAY_URL`, `GOOGLE_SITE_VERIFICATION`, `CLOUDFLARE_ACCOUNT_ID`.

Other workflows registered in the repository (`budget-probe`, `site-check`, `p*.yml`, `studio-probe`, `narration-tts`, the game and election probes) live on non-`main` branches and are used for fetching and narration. They do not refresh the website and were not touched. One probe branch was added for this audit (`site-check-21`, results on `fetched-21`); it only reads.

### 1.2 Scheduled tasks (run in the cloud, outside the repository)

| Task | Schedule (Calgary time) | What it does | Writes to |
|---|---|---|---|
| Calgary Data Desk: backup morning refresh | daily 5:10 a.m. | Starts the Website workflow if no run has started since 4 a.m. (GitHub's own schedule often fires late) | nothing; starts one run at most |
| Calgary Insight: daily follow-up on dated decisions | daily 6:37 a.m. | Records the outcome of dated decisions in the commitments tracker | `main`, only when an outcome is found |
| Calgary Insight: weekly hand check | Mondays 10:47 a.m. | Re-checks the hand-kept lists against their sources | `main` |
| Calgary News | daily 5:31 p.m. | Publishes the day's edition | `news` branch only |
| CalgaryInsight video tasks (fun fact twice daily; news explained Mon/Wed/Fri; flagship every 2 days) | as named | Make and post videos | `content-studio`, `studio-*` branches and social media; never `main` |

### 1.3 Outside the repository's automation

`tools/archive.py` (the daily archive of changed data) runs on the owner's laptop through Windows Task Scheduler. It is not run by any workflow and could not be observed from here. **Status: not verified** (see section 6). It was not modified.

### 1.4 APIs and sources the refresh reads

36 live sources: 27 City of Calgary open datasets (Socrata, `data.calgary.ca`), the City's open data catalogue and map server, Calgary Police community safety data, Statistics Canada (Crime Severity Index, tourism), CMHC rental survey, Government of Alberta (child care, enrolment, major projects), Environment and Climate Change Canada weather, City traffic camera images, the City newsroom. Full list with dataset IDs and the time each last answered: `DATA-SOURCE-REGISTER.md`.

## 2. Existing status, and status after development

| Mechanism | Baseline (before development, 2026-11-11 about 09:40 UTC) | After development (2026-11-11 about 10:35 UTC) |
|---|---|---|
| Website workflow | active; last success run 42977312843 (push, `ff42583`, finished 08:25 UTC); last two scheduled runs succeeded 2026-11-10 18:42 UTC and 2026-11-09 21:28 UTC | active; unchanged; latest run still 42977312843 (success). No run was started, cancelled or altered by this work |
| Backup workflow | active; 6 of 6 runs succeeded; last scheduled 42863009683 (2026-11-10 17:15 UTC) | active; one extra manual run for this project, 42997418780 (success, 09:43 UTC) |
| Calgary News images | active; 15 of 15 runs succeeded; last scheduled 2026-11-11 06:33 UTC | active; unchanged |
| AI gateway | active; last success 42764816551 (2026-11-10) | active; unchanged |
| `main` branch | `ff42583` | `ff42583` (no push) |
| Workflow files on the development branch | n/a | byte-identical to `main` (sha256 below) |
| Scheduled tasks | 7 enabled | the same 7 enabled, same schedules; none created, edited or deleted |

Workflow file fingerprints (first 16 hex digits of sha256), `main` and development branch:

| File | main | development | |
|---|---|---|---|
| backup.yml | 63f2974d90591fb8 | 63f2974d90591fb8 | same |
| gateway.yml | 3a5075fcb4df18b9 | 3a5075fcb4df18b9 | same |
| news-images.yml | 1a62aa4446d0d308 | 1a62aa4446d0d308 | same |
| site.yml | 42e263e4bcff1f06 | 42e263e4bcff1f06 | same |

Scheduled tasks after development (all enabled, schedules unchanged):

| Task | Schedule | Last run | Next run (UTC) |
|---|---|---|---|
| backup morning refresh | `10 5 * * *` America/Edmonton | succeeded 2026-11-10 11:13 UTC | 2026-11-11 11:10 |
| daily follow-up on dated decisions | `37 6 * * *` | created 2026-11-11; not yet due | 2026-11-11 12:37 |
| weekly hand check | `47 10 * * 1` | succeeded 2026-11-09 16:48 UTC | 2026-11-16 16:47 |
| Calgary News | `31 17 * * *` | succeeded 2026-11-10 23:31 UTC | 2026-11-11 23:31 |
| fun fact video | `47 11,19 * 11,12 *` | succeeded 2026-11-11 01:47 UTC | 2026-11-11 17:47 |
| news explained | `11 15 * 11,12 1,3,5` | succeeded 2026-11-09 21:12 UTC | 2026-11-11 21:11 |
| flagship documentary | `23 13 1-31/2 11,12 *` | succeeded 2026-11-09 19:23 UTC | 2026-11-11 19:23 |

## 3. Last successful refresh

Production build run 42977312843, commit `ff42583`, data built 2026-11-11 01:23 Calgary time in 75 minutes: 83 build steps, 0 failed; 36 of 36 live sources answered; 22 of 22 dashboard datasets read. Site size 344 MB, 847 published files. Evidence: `evidence/production-build-log.txt`, `evidence/production-site-files.txt`.

## 4. Data sources and modules affected by this development

| Refreshed data | How the new screen uses it | Changed? |
|---|---|---|
| `data/budget.json` (open budget `fqax-i3nz`, 2027-2030 budget `nnnm-9sfh`, revenue, the proposed-budget file) | read through the existing `get_budget` | no |
| `data/tax.json` (assessment roll `4bsw-nn7w`, 2026 rates) | read through the existing `get_property_tax` | no |
| `data/<method>/w0.json` (ward outlines, residents, 311 by ward) | read through the existing `compare_wards` | no |
| `data/accountability.json` (performance measures `4y62-crsf`) | read through the existing `get_accountability` | no |
| `data/infra.json` (water mains, breaks, sewer lines, pavement, 311) | read through the existing `get_infra` | no |

The new screen only reads. It adds two static files of its own (`ui/budget-intel/business-cases.json`, `ui/budget-intel/crosswalk.json`), which no refresh job writes and which sit outside `data/`, so a refresh can never be overwritten by them and they can never overwrite a refresh.

Files of the refresh system and whether they changed:

| File | Changed |
|---|---|
| `.github/workflows/*` (4 files) | no |
| `web/build_site.py` | no |
| every data module (`budget.py`, `proptax.py`, `infra.py`, `accountability.py`, `dashboard.py` and the other 50 Python modules) | no |
| `data/*` (13 hand-kept files) | no |
| `tools/archive.py`, `tools/news_images.py`, `tools/news_publish.py` | no |
| `registry.py` | **yes: one entry added** (the new screen, so Data Genie can read it). No existing entry changed (checked: 43 entries before, the same 43 unchanged plus 2 after) |
| `web/search_index.py` | **yes: one entry added** (the new screen in site search) |
| `ui/index.html` | **yes: 18 lines added** (stylesheet link, tab, section, script tag); nothing removed |

`registry.py` and `web/search_index.py` are imported by the build. Both changes are additions to a list; the functions the build calls are untouched.

## 5. Tests performed and results

| Test | Result |
|---|---|
| Inventory comparison: workflows, schedules and scheduled tasks before and after | identical (tables above) |
| `git diff main -- .github web/build_site.py data gateway tools/archive.py tools/news_images.py tools/news_publish.py` on the development branch | empty |
| Every Python file compiles (`python -m compileall`) on the development branch | pass |
| The offline part of the refresh command (`build_site.page`) run on `main` | reproduces production exactly: the script bundle it writes is `site.20186e8330.js`, the same name (a content hash) as on the live site |
| The same step run on the development branch | 233 of 235 files byte-identical to `main`'s; `index.html` differs by the 18 added lines; the script bundle is the production bundle plus the new screen's script, and equals the production bundle exactly when that one block is removed; 4 new files |
| The two build steps whose source files changed (`site search index`, `master registry of sources`), run offline on both branches against the production data snapshot | Search index: `main` reproduces production's `search.json` exactly (556 rows); the development branch produces the same 556 rows plus 5 new ones, none removed. Registry: every production entry identical on both branches; the development branch adds 2 and changes none |
| Every existing screen opened on the production data snapshot, desktop and phone (52 checks), before and after | all shown, 0 script errors, same content (`FUNCTIONAL-TESTS.md`) |
| Failure handling: the new screen with a source missing | each section shows what is missing instead of an empty or zero figure; other sections keep working (tested by removing `budget.json`, `tax.json` and the business-case file in turn) |
| A refresh failure cannot corrupt the new screen's data | by construction: the screen's two files are not written by the refresh, and the refresh's `keep_previous` behaviour is unchanged |

Not run, and why: the full network refresh (`python web/build_site.py` end to end) was not executed on the development branch, because the only place it runs with the real credentials is the Website workflow, which publishes to the live site. Running it would have been a deployment. Its code path is unchanged (`build_site.py` is byte-identical), and the two imported files that changed are additions to lists.

## 6. Broken, missing or unverified mechanisms

| Item | Status |
|---|---|
| GitHub's schedule for the Website workflow fires late or not at all on some days | Known before this work; covered by the 5:10 a.m. backup task. Unchanged |
| `tools/archive.py` on the owner's laptop (Windows Task Scheduler) | **Unverified**: it runs outside the repository and cannot be observed from here. Not touched |
| `gh run download` of build artifacts from this workspace | Blocked by the workspace's network rules; the backup was verified through the Backup workflow and an independent local clone instead |
| Many `cancelled` Website runs in the history | Not failures: superseded builds cancelled by hand during earlier work on the same day |
| No broken refresh mechanism was found | |

## 7. Proposed changes awaiting approval (documented only; none made)

1. **After publication, the first build is the test.** Publishing the development branch pushes to `main`, which starts the Website workflow as any push does. Watch that run to completion before the next morning's scheduled refresh.
2. **A weekly check of the City's business-case document.** Add one line to the existing weekly hand check task: re-download the PDF, compare its fingerprint with the one stored in `business-cases.json`, and re-run `tools/budget_intel_extract.py` if it changed. This would edit an existing scheduled task, so it needs approval.
3. **Run `tools/budget_intel_check.py` after each build.** It could run as a non-blocking step of the Website workflow against the built `data/` folder and print a warning if the business cases stop reconciling with the open data. This would edit `site.yml`, so it is only a proposal.
4. **Budget-versus-actual data.** Reading the City's year-end financial reports into a hand-kept file (like revenue today) would close the largest gap. New data, new hand-kept file; needs approval and source review.
