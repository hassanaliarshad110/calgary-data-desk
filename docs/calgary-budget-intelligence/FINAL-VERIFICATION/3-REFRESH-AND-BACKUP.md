# 3. Daily refresh and backup

Part of the second-stage verification of the Budget Intelligence branch (`budget-intelligence`), written November 11, 2026. Nothing here was published, merged or deployed. Start with [README.md](README.md).

## Workflow files, before and after

Copies of every workflow file as it is on main and as it is on the branch are in `evidence/refresh/workflows/main/` and `evidence/refresh/workflows/branch/` (saved with `.txt` added so that they cannot be mistaken for live workflows).

| Workflow file | Starts on | Schedule (UTC) | sha256 on main | sha256 on the branch | Identical |
|---|---|---|---|---|---|
| `.github/workflows/backup.yml` | schedule, workflow_dispatch | 41 9 * * * | `63f2974d90591fb8ace3…` | `63f2974d90591fb8ace3…` | yes |
| `.github/workflows/gateway.yml` | workflow_dispatch, push | none | `3a5075fcb4df18b9861b…` | `3a5075fcb4df18b9861b…` | yes |
| `.github/workflows/news-images.yml` | schedule, workflow_dispatch | 20 0,1,2 * * * | `1a62aa4446d0d3087515…` | `1a62aa4446d0d3087515…` | yes |
| `.github/workflows/site.yml` | schedule, workflow_dispatch, push | 23 11 * * * | `42e263e4bcff1f063cc2…` | `42e263e4bcff1f063cc2…` | yes |

The machine-readable comparison of every file is `evidence/refresh/before-after.json`: 330 files on main, 324 unchanged, 6 changed, 0 removed, 109 added. Counting as "the refresh system" everything under `.github/`, `web/`, `data/` and `gateway/`, every Python file at the top of the repository, and `tools/archive.py` and `tools/news_publish.py`: 232 files, of which 227 are unchanged.

The five that are changed, and what each change is:

| File | What it does in the build | What is added |
|---|---|---|
| `registry.py` | the master list of pages and data files that the assistants read; the build writes it to `data/registry.json` | one entry for the new screen and its two data files |
| `web/search_index.py` | builds the site search index | one entry for the new screen with four of its sections |
| `methods.py` | the "How it is counted" notes; the build writes them to `data/methods.json` | one note for the new screen |
| `analyst.py` | the Data Scientist's list of report topics; the build writes it to `data/analyst_topics.json` | one topic |
| `agent.py` | Data Genie's tools | the new section in the dashboard tool's description and lists, and the two places that answer it |

One file is added to that set: `budget_intel.py` (reads the business cases for the assistants; it only reads). No fetch, no data module, no data file, no schedule and no publishing step is touched.

## Runs

| Run | Workflow | Started by | Commit | Result | Why it matters |
|---|---|---|---|---|---|
| [42977312843](https://github.com/hassanaliarshad110/calgary-data-desk/actions/runs/42977312843) | Website | push | `ff42583` | success | The build that published the site this work started from (main at ff42583). |
| [43011014041](https://github.com/hassanaliarshad110/calgary-data-desk/actions/runs/43011014041) | Website | workflow_dispatch | `ff42583` | success | The daily refresh of November 11, started by the "backup morning refresh" scheduled task while this review was under way; it builds main, which this work has not touched. |
| [42877892134](https://github.com/hassanaliarshad110/calgary-data-desk/actions/runs/42877892134) | Website | schedule | `2da4e4b` | success | The last run started by GitHub's own schedule (November 10). |
| [42997418780](https://github.com/hassanaliarshad110/calgary-data-desk/actions/runs/42997418780) | Backup | workflow_dispatch | `ff42583` | success | The backup taken before development (artifact backup-7). |
| [42863009683](https://github.com/hassanaliarshad110/calgary-data-desk/actions/runs/42863009683) | Backup | schedule | `2da4e4b` | success | The last backup started by its own schedule (November 10). |
| [42973286311](https://github.com/hassanaliarshad110/calgary-data-desk/actions/runs/42973286311) | Calgary News images | schedule | `8f2ad3d` | success | The last Calgary News images run started by its schedule. |
| [42764816551](https://github.com/hassanaliarshad110/calgary-data-desk/actions/runs/42764816551) | AI gateway | push | `17eb658` | success | The last AI gateway deployment (starts only when gateway/ changes on main). |

Read at 2026-11-11T16:23:49Z. The only runs this review started are Backup 42997418780 (read only: it makes a backup file) and read-only evidence runs on the separate branches site-check-21, site-check-22 and site-check-23. No Website, Calgary News images or AI gateway run was started by this review.

## Backup

| | |
|---|---|
| Artifact | `backup-7`, id 13845290195, from Backup run 42997418780 |
| Size | 1,034,660,657 bytes |
| Created / kept until | 2026-11-11T09:43:37Z / 2027-02-09T09:42:25Z |
| Digest of the artifact | `sha256:3e47c9037e34341a06b57c4617759d39caea5cc58678d2d14995718017fd3a79` |
| File inside | `calgary-data-desk.bundle a7c44128327f345d23f19e34baf2109d49b35e1997c031668364fe3a0d4aa968` |
| File inside | `website.tar.gz 33135cde73d6e7739239088f8cecfec4c8f58d5fc56f37bf65cc325247858f09` |
| File inside | `branches.txt b5c244ed100c64abc24658898ffb59b3cc5c8d801c8d590b040ed223afe81212` |
| Branch copy | `backup/pre-budget-intelligence-20261111` at `ff42583627241a1b727d5a85e66ea4dba3df8317` (the same commit as main) |
| Copy made in the development workspace (first stage) | bundle sha256 `b11e9616…04e2cf`, 887,073,813 bytes; restored there to commit ff42583, 330 files. That workspace is temporary, so this copy is not counted as durable. |

The independent restore test ran on a separate machine and its full output is `evidence/refresh/restore-test-from-the-artifact.txt`. In short: the bundle cloned to commit `ff42583`, tree `ba8f1f74`, 330 tracked files, no changes; `git bundle verify` reported a complete history; `git fsck` found nothing; the site archive holds 847 files (344 MB); and the script bundle rebuilt from the restored code is byte-for-byte the published one.

## Scheduled tasks

| Task | Schedule (Calgary time) | On | Last run | Next run (UTC) | Can it change main? |
|---|---|---|---|---|---|
| Calgary Data Desk: backup morning refresh | `10 5 * * *` | yes | 2026-11-11T11:19 succeeded | 2026-11-12T11:10 | starts a build of main; no commit |
| Calgary Insight: daily follow-up on dated decisions | `37 6 * * *` | yes | not yet (created 2026-11-11) | 2026-11-11T12:37 | can commit to main (one data file) |
| Calgary Insight: weekly hand check | `47 10 * * 1` | yes | 2026-11-09T16:48 succeeded | 2026-11-16T16:47 | can commit to main (hand-kept data files, visit.py, web/explore.py) |
| Calgary News | `31 17 * * *` | yes | 2026-11-10T23:31 succeeded | 2026-11-11T23:31 | no (news branch only) |
| CalgaryInsight: Calgary fun fact video (twice daily) | `47 11,19 * 11,12 *` | yes | 2026-11-11T01:47 succeeded | 2026-11-11T17:47 | no (content-studio, studio-probe and studio-videos branches) |
| CalgaryInsight: Calgary news explained (Mon/Wed/Fri) | `11 15 * 11,12 1,3,5` | yes | 2026-11-09T21:12 succeeded | 2026-11-11T21:11 | no |
| CalgaryInsight: Flagship documentary (every 2 days) | `23 13 1-31/2 11,12 *` | yes | 2026-11-09T19:23 succeeded | 2026-11-11T19:23 | no |

One of them, the daily follow-up on dated decisions, was created on November 11 and had not yet had its first run when the list was read (it was due at 12:37 UTC), so whether it works is not yet shown by a run. Two of these tasks (the daily follow-up and the weekly hand check) can commit to main on their own schedule. None of the files they change is changed by this branch, so they do not conflict with it; but main can move before publication, and the merge has to be checked against main as it is on that day.

## What could not be verified

| Item | Why | What would verify it |
|---|---|---|
| The laptop archive (`tools/archive.py` under Windows Task Scheduler) | it runs on the owner's laptop, out of reach of this review | on the laptop: the task's last result and the date of the newest archive file |
| A full build of the branch with live data | the read-only job takes one to two hours and builds the committed files, so it runs after this report is written | the result of that job (branch fetched-23) |
| A full restore to a public site | it would publish | not authorized |
| That GitHub's own schedule fires tomorrow | cannot be known in advance; it fired about seven hours late on November 10 | the backup morning refresh task covers a late or missed run |
| The values of the build's secrets and settings | only their names were seen, by design | today's successful builds show they work |
| The Cloudflare gateway and the Windows desktop app | not touched and not run | the owner's own check after publication |
| Complete workflow logs | read on GitHub, not copied here | the run addresses in `evidence/refresh/runs.json` |

## Findings

### 3.1 Original and current workflow files

**PASS.** All 4 workflow files are supplied as they are on main and on the branch. They are byte-for-byte identical: backup.yml sha256 63f2974d90591fb8; gateway.yml sha256 3a5075fcb4df18b9; news-images.yml sha256 1a62aa4446d0d308; site.yml sha256 42e263e4bcff1f06. No workflow file was added or removed.

- Evidence: evidence/refresh/workflows/main/ and evidence/refresh/workflows/branch/
- To repeat: `git diff ff42583 budget-intelligence -- .github/   (prints nothing)`

### 3.2 Machine-readable before and after comparison

**PASS.** Every file, as git records it: 330 files on main; 324 unchanged, 6 changed (agent.py, analyst.py, methods.py, registry.py, ui/index.html, web/search_index.py), 0 removed, 109 added. Of the 232 files that make up the refresh system (workflows, build scripts, data modules, data files, gateway), 227 are unchanged; 5 are changed (agent.py, analyst.py, methods.py, registry.py, web/search_index.py: the assistants' tool list, the report topics, the method notes, the registry of sources and the search index, each gaining entries for the new screen) and one is added (budget_intel.py). No schedule, trigger, data module, data file or build step is changed.

- Evidence: evidence/refresh/before-after.json
- To repeat: `python3 evidence/tools/refresh_compare.py ff42583 <out-dir>`

### 3.3a Workflow run IDs and results

**PASS.** Website run 42977312843 (push, commit ff42583): success; Website run 42877892134 (schedule, commit 2da4e4b): success; Backup run 42997418780 (workflow_dispatch, commit ff42583): success; Backup run 42863009683 (schedule, commit 2da4e4b): success; Calgary News images run 42973286311 (schedule, commit 8f2ad3d): success; AI gateway run 42764816551 (push, commit 17eb658): success. All four workflows are registered as active. The only runs this review started are the backup run and read-only evidence runs on separate branches (site-check-21, site-check-22 and, once this report is committed, site-check-23 for the full build of finding 3.7b).

- Evidence: evidence/refresh/runs.json (with the address of each run)
- To repeat: `gh run view <id> -R hassanaliarshad110/calgary-data-desk`

### 3.3b The daily refresh of November 11 ran on untouched code while this review was under way

**PASS.** Run 43011014041 was started at 2026-11-11T11:19:38Z by the "backup morning refresh" scheduled task (GitHub's own schedule had not fired yet), on main at ff42583. It finished with result: success. It builds main, which this work has not changed.

- Evidence: evidence/refresh/runs.json
- To repeat: `gh run view 43011014041 -R hassanaliarshad110/calgary-data-desk`

### 3.3c Full workflow logs

**UNVERIFIED.** The complete log text is not copied into this public repository: it adds nothing to the run records and it reproduces the workflows' scripts line by line. The logs were read; excerpts showed no secret values (GitHub masks them). The logs remain on GitHub at the run addresses in runs.json for anyone signed in with access. Marked UNVERIFIED only in the sense that the reader of this report has to open them there.

- Evidence: evidence/refresh/runs.json
- To repeat: `gh run view <id> --log -R hassanaliarshad110/calgary-data-desk`

### 3.4 Backup artifact details and checksums

**PASS.** Artifact backup-7 of run 42997418780: id 13845290195, 1,034,660,657 bytes, created 2026-11-11T09:43:37Z, kept until 2027-02-09T09:42:25Z, digest sha256:3e47c9037e34341a06b57c4617759d39caea5cc58678d2d14995718017fd3a79. Files inside (sha256): calgary-data-desk.bundle a7c44128327f345d23f19e34baf2109d49b35e1997c031668364fe3a0d4aa968; website.tar.gz 33135cde73d6e7739239088f8cecfec4c8f58d5fc56f37bf65cc325247858f09; branches.txt b5c244ed100c64abc24658898ffb59b3cc5c8d801c8d590b040ed223afe81212. Branch backup/pre-budget-intelligence-20261111 is at ff42583, the same commit as main.

- Evidence: evidence/refresh/artifact-file-checksums.txt; docs/calgary-budget-intelligence/backup-manifest.json
- To repeat: `gh api repos/hassanaliarshad110/calgary-data-desk/actions/runs/42997418780/artifacts; gh run download 42997418780 -n backup-7; sha256sum *`

### 3.5a Independent restore test

**PASS.** On a separate machine (a fresh GitHub Actions runner on a separate branch, read only): the artifact was downloaded and checksummed; the bundle cloned without error to commit ff42583, tree ba8f1f74, 330 tracked files, no changes; git bundle verify and git fsck passed; the site archive unpacked to 847 files (344 MB), the same count as the published site. The restored code was then used to rebuild the interface: the script bundle is byte-for-byte the published one (site.20186e8330.js); index.html differs from the published one only by the one-line visit-counter tag that a later build step adds (38 bytes).

- Evidence: evidence/refresh/restore-test-from-the-artifact.txt
- To repeat: The workflow text is in the branch site-check-22 (.github/workflows/p22.yml); its output is the branch fetched-22b

### 3.5b A full restore to a working public site

**UNVERIFIED.** The restore test proves the backup opens, is complete and rebuilds the published interface. It did not publish the restored site anywhere or run the full data build from it, because doing so would publish.

- Evidence: evidence/refresh/restore-test-from-the-artifact.txt
- To repeat: Would need a publication, which is not authorized

### 3.6 The seven scheduled tasks and their schedules

**PASS.** Read at 2026-11-11T11:47Z: all 7 are switched on, with the schedules recorded before development: Calgary Data Desk: backup morning refresh (10 5 * * *); Calgary Insight: daily follow-up on dated decisions (37 6 * * *); Calgary Insight: weekly hand check (47 10 * * 1); Calgary News (31 17 * * *); CalgaryInsight: Calgary fun fact video (twice daily) (47 11,19 * 11,12 *); CalgaryInsight: Calgary news explained (Mon/Wed/Fri) (11 15 * 11,12 1,3,5); CalgaryInsight: Flagship documentary (every 2 days) (23 13 1-31/2 11,12 *). Times are Calgary time. None was created, edited, paused or started by hand in this work. One of them, the daily follow-up on dated decisions, was created on November 11 and had not yet had its first run when the list was read (it was due at 12:37 UTC), so whether it works is not yet shown by a run.

- Evidence: evidence/refresh/scheduled-tasks.json
- To repeat: The list of scheduled tasks on the owner's account

### 3.7a The laptop archive (tools/archive.py, run by Windows Task Scheduler)

**UNVERIFIED.** It runs on the owner's laptop, which this review cannot reach. Nothing is claimed about it. The file tools/archive.py itself is unchanged on the branch.

- Evidence: evidence/refresh/before-after.json (tools/archive.py: same)
- To repeat: On the laptop: open Task Scheduler and check the task's last run result and the date of the newest archive file

### 3.7b A full build of the branch with live data

**UNVERIFIED.** The first review did not run the whole build on the branch because the Website workflow publishes. For this audit the same build command is run from the committed branch as a separate read-only job that has no publishing step, saves no cache and is given none of the site's secrets. It takes one to two hours with live data and can only start once this report is committed (it builds the committed files), so its result is not in this report; it will be reported to the owner separately and added to this page. Without the site's keys some sources may answer more slowly or refuse, so the result will be read step by step.

- Evidence: The job's definition is on the branch site-check-23; its output will be on the branch fetched-23
- To repeat: Push a copy of .github/workflows/p23.yml from site-check-23 to a new site-check-N branch

### 3.7c Every build step that the changed files feed was run with the branch's code

**PASS.** Run offline against a copy of the published data: the interface step (index.html, the script bundle, the copied files), the master registry (one entry added, none changed), the site search index (six rows added, none removed), the method notes (one added; the other 51 identical to the published file), the report topics (one added; the other 56 identical to the published file) and the files shipped to the browser for the assistants (three added). Run from main, the same steps reproduce the published files exactly, which shows the offline steps are faithful.

- Evidence: evidence/code/built-files.json; evidence/code/build-steps.json
- To repeat: `python3 qa/steps.py and steps2.py (in evidence/tools/) with a checkout and a copy of the published data folder`

### 3.7d Other things that could not be verified

**UNVERIFIED.** Whether GitHub's own schedule will fire tomorrow (it fired 7 hours late on November 10; the backup task covers this). The values of the build's secrets and settings (only their names were seen; today's builds succeeding shows they work). The Cloudflare gateway (not touched, not tested). The Windows desktop app (the new screen uses the same code path as the other screens, but the app was not run).

- Evidence: evidence/refresh/runs.json
- To repeat: n/a

### 3.8 Production was not altered

**PASS.** main is at ff42583 (read at 2026-11-11T16:23:49Z), the commit it was at before development. No Website run was started by this work, nothing was merged, and no file on the published site was changed.

- Evidence: evidence/refresh/runs.json
- To repeat: `gh api repos/hassanaliarshad110/calgary-data-desk/branches/main --jq .commit.sha`
