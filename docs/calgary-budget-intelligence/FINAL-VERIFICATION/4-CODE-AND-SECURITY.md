# 4. Code and security

Part of the second-stage verification of the Budget Intelligence branch (`budget-intelligence`), written November 11, 2026. Nothing here was published, merged or deployed. Start with [README.md](README.md).

## Inventory

Compared with main at `ff42583627241a1b727d5a85e66ea4dba3df8317`. The complete diff is `git diff ff42583 budget-intelligence`; the patch of the six existing files is saved as `evidence/code/existing-files.patch.txt`.

| Existing file | Lines added | Existing lines edited | What was added |
|---|---:|---:|---|
| `ui/index.html` | 19 | 0 | One line loads the screen's stylesheet. One line adds the tab "Budget Intelligence" under Money, after City budget. Fifteen lines are the empty frame of the screen (a heading, a place for a warning, the list of sections and the content area), which the script fills. One line loads the screen's script after `budget.js`. One line, added for the owner's request about the assistants, is a suggested question on the Data Genie screen. Nothing else on the page is touched. |
| `registry.py` | 11 | 0 | One entry in the list of pages (11 lines): the screen's name, what it holds, how the assistants should read it, and its two data files. Declaring the crosswalk file here also stops the build from offering it as a report topic of its own. |
| `web/search_index.py` | 4 | 0 | One entry in the list of screens (4 lines), so the site search finds the screen and four of its sections. |
| `agent.py` | 17 | 2 | Seven lines of description tell Data Genie what the new section holds and which parts it can ask for. Two existing lines are edited: the list of allowed sections gains `budget_intelligence`, and the list of allowed parts gains seven names (cases, case, departments, priorities, service_areas, wards, checks). Eight lines (two blocks of four) answer the new section in the two places the dashboard tool is answered, by calling `budget_intel.py`. No existing answer is changed. |
| `analyst.py` | 14 | 0 | One topic for the Data Scientist (14 lines): what to set out, which tool parts to read, and the rules (label everything proposed, never divide a citywide amount, take no side). |
| `methods.py` | 26 | 0 | One "How it is counted" note (25 lines: what is read, how it is added, how it is checked, two steps to check it yourself, seven cautions) and one line that says where the method lives in the code. |
| **Six files** | **91** | **2** | An edited line counts as one line removed and one added, so 89 lines are purely new. |

The version examined had 31 added lines in three files (`ui/index.html` 18, `registry.py` 9, `web/search_index.py` 4). Those are all still present. The other lines came after: the owner's instruction to make Data Genie and the Data Scientist aware of the new data (`agent.py`, `analyst.py`, `methods.py`, the suggestion chip, and the fuller registry entry).

| New product file | Bytes | What it is |
|---|---:|---|
| `budget_intel.py` | 22,687 | the new data for Data Genie and the Data Scientist (reads only) |
| `tools/budget_intel_check.py` | 13,546 | checks the dataset and reconciles it with the open data (run by hand) |
| `tools/budget_intel_extract.py` | 17,538 | reads the City's PDF into business-cases.json (run by hand) |
| `ui/budget-intel.css` | 21,130 | its styles |
| `ui/budget-intel.js` | 102,848 | the screen |
| `ui/budget-intel/business-cases.json` | 235,247 | the 384 business cases read from the City's PDF |
| `ui/budget-intel/crosswalk.json` | 5,798 | hand-kept name matches and topic links |

Everything else that is new is documentation and evidence under `docs/calgary-budget-intelligence/` (102 files). Nothing is deleted or renamed.

## What changed on the branch since the version examined (commit `50acadc`)

The owner examined the review of commit `50acadc`. The branch has changed since, for two instructions from the owner and for what this audit found. Product files changed since then: `agent.py`, `analyst.py`, `budget_intel.py` (new), `methods.py`, `registry.py`, `tools/budget_intel_check.py`, `tools/budget_intel_extract.py`, `ui/budget-intel.js`, `ui/budget-intel/business-cases.json`, `ui/index.html`.

| Change | Why |
|---|---|
| Data Genie and the Data Scientist know the new data (`budget_intel.py`, the tool's lists, a report topic, a method note, a suggested question) | the owner's instruction |
| The commercial opportunity is removed from the plan and the reports | the owner's instruction |
| A new field, the full one-time amount stated in the City's note, on 17 operating requests; shown on the request, listed under Data checks, in the export and known to the assistants | found by this audit (finding 1.9). No existing value changed: 0 values differ, 17 fields added |
| The check on the two datasets now shows, unit by unit, where the largest yearly difference is; the business-unit check names a single request where one equals the difference | found by this audit (findings 1.2 and 1.3); worked out from the day's data, nothing typed in |
| The "Budget vs actual" note no longer sends readers to the later years on the City budget screen, and says why | found by this audit (finding 1.2d) |
| The keyboard focus stays on the control that was used; the simulator's slider has a label; the list of sections takes the arrow keys | found by this audit (finding 5.7) |
| A link is only made to an http or https address or a page of this site | found by this audit (finding 4.8) |
| A difference that rounds to zero is shown as 0.0, not -0.0 | found by this audit |

## The built files

Building the interface step (`build_site.page`) from main and from the branch:

| | Main | Branch |
|---|---:|---:|
| Files built | 235 | 239 |
| Identical | 233 | 233 |

| Changed built file | Main | Branch |
|---|---|---|
| `index.html` | 159,349 bytes, sha256 `bc8bc109168bcff3…` | 160,842 bytes, sha256 `266a3425f00f35bb…` |
| the script bundle | `site.20186e8330.js` | `site.0c52be4945.js` |

The bundle's file name is the first ten characters of its own checksum, so a changed bundle has a new name. Proof that it is otherwise the same: removing the one block that the bundler adds for the new script (102,875 bytes) leaves a file whose sha256 is `20186e83308d82bc…`, the published bundle's own. Added to the build: `budget-intel.css`, `budget-intel.js`, `budget-intel/business-cases.json`, `budget-intel/crosswalk.json`.

The later build steps that read the changed files, run offline from main and from the branch against a copy of the published data:

| Build output | From main | From the branch | Difference |
|---|---:|---:|---|
| `data/methods.json` | 51 notes (equal to the published file: yes) | 52 | added: budget_intelligence; none changed or removed |
| `data/analyst_topics.json` | 56 topics (equal to the published file: yes) | 57 | added: budget_requests; none changed or removed |
| `data/registry.json` | 55 entries | 56 | added: budget-intelligence; none changed or removed |
| `data/search.json` | 556 rows | 562 | 6 rows added, 0 removed |
| files shipped to the browser for the assistants | | 115 | new: budget_intel.py, data/business-cases.json, data/crosswalk.json |

## Findings

### 4.1 Complete diff and changed-file inventory

**PASS.** 6 existing files changed (91 lines added, 2 existing lines edited); 7 new product files; 102 new files of documentation and evidence. Nothing deleted, nothing renamed. The full patch of the six existing files is in the evidence folder; the complete diff is one command.

- Evidence: evidence/code/changed-files.json; evidence/code/existing-files.patch.txt
- To repeat: `git diff ff42583 budget-intelligence --stat ; git diff ff42583 budget-intelligence`

### 4.2 Every added line in an existing file explained

**PASS.** The 31 lines of the version the owner examined (ui/index.html 18, registry.py 9, web/search_index.py 4) are still there. The owner's request to make Data Genie and the Data Scientist aware of the new data, and this audit, added the rest: agent.py +17 (and 2 existing lines edited); analyst.py +14; methods.py +26; registry.py +11; ui/index.html +19; web/search_index.py +4. Each block is explained in section 4.

- Evidence: 4-CODE-AND-SECURITY.md; evidence/code/existing-files.patch.txt
- To repeat: `git diff ff42583 budget-intelligence -- agent.py analyst.py methods.py registry.py ui/index.html web/search_index.py`

### 4.3 All new files identified

**PASS.** Product files: budget_intel.py (22,687 bytes); tools/budget_intel_check.py (13,546 bytes); tools/budget_intel_extract.py (17,538 bytes); ui/budget-intel.css (21,130 bytes); ui/budget-intel.js (102,848 bytes); ui/budget-intel/business-cases.json (235,247 bytes); ui/budget-intel/crosswalk.json (5,798 bytes). Everything else that is new is under docs/calgary-budget-intelligence/.

- Evidence: evidence/code/changed-files.json (with sha256 of each product file)
- To repeat: `git diff --name-status ff42583 budget-intelligence`

### 4.4 The two changed built files

**PASS.** The interface step builds 235 files from main and 239 from the branch; 233 are identical. The two that change are index.html (159,349 to 160,842 bytes) and the script bundle, whose name carries its own checksum and so changes from site.20186e8330.js to site.0c52be4945.js. The branch bundle is the main bundle plus one block (the new screen's script, 102,875 bytes): with that block removed it is byte-for-byte the main bundle. Four files are added: budget-intel.css, budget-intel.js, budget-intel/business-cases.json, budget-intel/crosswalk.json.

- Evidence: evidence/code/built-files.json
- To repeat: Build both checkouts with build_site.page() and compare the folders (script in section 4)

### 4.5 Secrets and credentials

**PASS.** 98 text files added or changed were searched for private keys, access tokens of eight kinds, passwords or keys assigned in code, and credentials inside addresses: 0 found. For the six files that existed before, only the added lines were searched. The 15 files that are not text are screenshots.

- Evidence: evidence/code/security-static.json
- To repeat: `python3 evidence/tools/sec_scan.py ff42583 out.json   (run in the repository, on the branch)`

### 4.6 Unsafe external scripts

**PASS.** No script, stylesheet, frame or picture from another site is added. The two tags added to index.html load the screen's own files (budget-intel.css, budget-intel.js). The new script has no eval, no script elements made in code and no inline handlers. Its one fetch call reads the screen's own two data files by a relative address. Web addresses that appear in added code or data: calgaryinsight.ca, data.calgary.ca, www.calgary.ca (links for the reader; nothing is loaded from them).

- Evidence: evidence/code/security-static.json; evidence/code/security-dynamic.json
- To repeat: as 4.5; node evidence/tools/sec.js <address of a running copy> out.json

### 4.7 Unintended data writes

**PASS.** In a running copy, with every call to the site recorded: while all eleven sections were opened, filtered, paged and switched, the screen made exactly five kinds of call, all reads (compare_wards, get_accountability, get_budget, get_infra, get_property_tax), wrote nothing to browser storage, set no cookie, opened no database and sent nothing: 6 network requests, all GET, all to the site itself (budget-intel/business-cases.json, budget-intel/crosswalk.json, data/accountability.json, data/budget.json, data/infra.json, data/tax.json). "Save this list" makes one further call (save_csv), which hands a CSV file to the browser's downloads when the visitor asks. The Python module the site ships (budget_intel.py) only reads. The two tools under tools/ are run by hand and write only their own output.

- Evidence: evidence/code/security-dynamic.json; evidence/code/security-dynamic-calls.json; evidence/code/security-static.json
- To repeat: `node evidence/tools/sec.js <address> out.json`

### 4.8 Can text in the data files run as code?

**PASS.** Both data files were replaced, in a running copy, with versions carrying markup (an image with an error handler, a script element, an SVG with a load handler) in every text field, and a javascript: address as the document's address. On all eleven sections nothing ran and no element was created from the data; the markup is shown as plain text. Hostile values in the address bar (?bi=, ?case=) run nothing and fall back to a normal section. One weakness was found and closed during this audit: a web address taken from a data file was written into a link after escaping but without checking that it is an http or https address. The data files are the site's own, so this needed someone able to change the site already; the screen now refuses any other kind of address. 15 of 15 checks pass.

- Evidence: evidence/code/security-dynamic.json
- To repeat: `node evidence/tools/sec.js <address> out.json`

### 4.9a No commercial proposal in the current files; the commercial opportunity is removed from the plan

**PASS.** The commercial proposal file was never committed to the repository. At the owner's instruction of November 11 the commercial section, the related decision and the related wording were removed from the reports and from the review page that is kept outside the repository. A search of the documents, the new screen, its data, the new module and the two tools for ten words and phrases (commercial, pricing, price list, subscription, paid idea, paid tier, revenue-earning, earn revenue, monetiz, paywall) finds 13 lines, each listed with the reason it is there: 11 record the removal or state that the screen has no paywall or payment code, 2 are the City's own title of request 108 (about subscription-based software), and 0 are unexpected. The pages of this verification report, which discuss the removal, are not counted.

- Evidence: docs/calgary-budget-intelligence/TECHNICAL-REPORT.md section L; evidence/code/sensitive-scan.json
- To repeat: `grep -rniE "commercial|pricing|subscription|paid idea" docs/ ui/budget-intel* budget_intel.py tools/budget_intel_*`

### 4.9b The branch's first commit still holds one sentence about paid ideas

**FAIL.** Commit 50acadc (the version the owner examined) contains, in two report files, one sentence listing kinds of paid service that were being considered and two mentions of "a product meant to earn revenue". No prices, no figures, no names. Later commits remove the text from the files but not from the history of this public branch. Two ways to close this, both the owner's decision: (a) at publication, merge the branch as a single squashed commit, so the sentence never enters main's history (recommended; nothing to do now); (b) rewrite the branch now as one commit and force-push it, which removes it from the branch as well. Not done without instruction, because rewriting history is not reversible.

- Evidence: git show 50acadc:docs/calgary-budget-intelligence/TECHNICAL-REPORT.md (section L)
- To repeat: `git log -p budget-intelligence -- docs/calgary-budget-intelligence/TECHNICAL-REPORT.md | grep -n "paid ideas"`

### 4.9c Other sensitive information

**PASS.** In everything the branch adds: no e-mail address, no telephone number, no home or work address, no account name other than the public repository's, no path of the machine the work was done on and no session link in any file. Run records give only public run numbers and addresses. The owner is named only as the copyright holder already named on the site.

- Evidence: evidence/code/security-static.json; evidence/code/sensitive-scan.json
- To repeat: as 4.5
