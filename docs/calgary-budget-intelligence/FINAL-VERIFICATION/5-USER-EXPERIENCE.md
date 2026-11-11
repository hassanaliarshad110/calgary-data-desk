# 5. User experience

Part of the second-stage verification of the Budget Intelligence branch (`budget-intelligence`), written November 11, 2026. Nothing here was published, merged or deployed. Start with [README.md](README.md).

## What was tested on what

Everything in this section was run in headless desktop Chromium by `evidence/tools/ux.js` on 2026-11-11. **No real phone or tablet and no screen reader was used.** "Phone" and "tablet" below mean an emulated device: Chromium given that device's screen size, touch input and browser name. That is a fair test of layout and of the script; it is not a test of Safari, of a real on-screen keyboard, or of how a real phone downloads a file or opens a PDF.

| Tested on | Checks passed | Checks failed |
|---|---:|---:|
| desktop Chromium (headless) | 64 | 0 |
| emulated phone (Chromium) | 19 | 0 |
| emulated tablet (Chromium) | 6 | 0 |
| **All (emulated or desktop; none on a real device)** | **89** | **0** |
| Real phone, real tablet, screen reader | not tested | not tested |

| Group | Passed | Of |
|---|---:|---:|
| 1 sections | 24 | 24 |
| 2 mobile navigation | 7 | 7 |
| 3 filtering | 8 | 8 |
| 3-5 explorer | 1 | 1 |
| 4 PDF links | 3 | 3 |
| 5 export | 5 | 5 |
| 6 theme | 5 | 5 |
| 7 keyboard | 17 | 17 |
| 8 accessibility | 19 | 19 |

Every single check, with what it was run on and what it saw, is in `evidence/ux/ux-results.json`.

## Defects this audit found on the branch, and fixed

| Defect | Who it affected | Fix |
|---|---|---|
| Opening or closing a request, moving to the next 25, or choosing a year redrew that part of the screen and dropped the keyboard focus | anyone using a keyboard or a screen reader: after each action they were back at the top of the page | the focus is put back on the control that was used |
| The simulator's slider had no label that a screen reader could read (the label was attached to the number beside it instead) | screen-reader users | the label is tied to the slider |
| The list of sections did not respond to the arrow keys, and every one of its eleven buttons was a separate Tab stop | keyboard users | it now behaves as a radio group does elsewhere on the site: one Tab stop; arrow keys, Home and End |
| A link inside a section that leads to another section left the focus on a button that no longer existed | keyboard and screen-reader users | the focus moves to the new section's content |

The first run of this audit failed five checks because of these; after the fixes all 89 pass. They are reported because they were real, and because they were not caught by the first-stage tests.

## For the owner: ten minutes on a real phone

The working preview on the review page is the real screen on a copy of the published data. On an iPhone or Android phone, please try:

1. Open the preview. Does the strip of sections scroll sideways with a finger, and does the page itself stay still?
2. Tap "Business cases". Type "police" in the search box. Does the keyboard cover the list, and can you still reach the results?
3. Tap a request. Does it open under its row? Tap "p. 224" (request 104). Does the City's PDF open, and at page 224 or at page 1?
4. "Save this list" cannot be tried in the preview: saving files is switched off there, and the preview says so when the button is tapped. It is one to try on the site on the first day after publication: does a file arrive, and does it open in a spreadsheet app?
5. Turn the phone sideways on the Overview. Does the map redraw and do the tiles reflow?
6. Switch the phone to dark mode (or use the site's theme button). Is everything readable?
7. In the simulator, drag the slider. Does the result follow your finger?
8. With VoiceOver or TalkBack on, swipe through the Overview. Are the section buttons announced as a group with the chosen one marked? Is each tile's figure read with its label?

Anything that fails there is a defect this audit could not see.

## Findings

### 5.1 All eleven sections

**PASS.** Every section was opened on four screen sizes in both themes (24 of 24 checks pass): each draws with content, nothing is wider than the screen, the page never scrolls sideways, no script error, no failed request. Screens: a 1440 by 900 desktop window, and emulated iPad Mini, iPhone 13 and a 360 by 640 phone.

- Evidence: evidence/ux/ux-results.json (group "1 sections")
- To repeat: `node evidence/tools/ux.js <address> ui/budget-intel/business-cases.json <out-dir>`

### 5.2 Mobile navigation

**PASS.** 7 of 7 checks pass on an emulated iPhone 13: the site menu opens; Budget Intelligence is under Money after City budget; tapping it opens the screen and closes the menu; each of the eleven sections opens from the strip of sections, stays in view and is kept in the address; the section buttons are at least 40 pixels each way; a link to one request opens that request.

- Evidence: evidence/ux/ux-results.json (group "2 mobile navigation")
- To repeat: as 5.1

### 5.3 Filtering

**PASS.** 8 of 8 checks pass. The expected numbers were worked out by the test from the data file, not typed in: every value of seven of the nine filters one at a time (40 values); the values of the other two (department, 13; reason given, 6) each cover all 384 requests exactly once; 20 combinations of kind, ward and Council priority, nine searches (words, a Budget ID, a number, nothing found), the totals line, and paging through all 384 requests in order.

- Evidence: evidence/ux/ux-results.json (group "3 filtering")
- To repeat: as 5.1

### 5.4 Exports

**PASS.** 5 of 5 checks pass: "Save this list" downloads a CSV of 384 rows; 25 columns of every row (9,600 cells) were compared with the data file and all agree, including dashes kept as blanks and the status "Proposed, not approved"; the capital totals add to 13,051,480 thousand; with filters on, only the filtered requests are exported; a title containing commas and quotation marks survives.

- Evidence: evidence/ux/ux-results.json (group "5 export")
- To repeat: as 5.1

### 5.5a PDF links: the addresses

**PASS.** 3 of 3 checks pass: all 384 rows link to the City's own PDF at that request's page number, in a new tab; inside an opened request every link goes to its page (13 requests tried). The City's file was downloaded again on November 11 and is the same file that was read (same checksum).

- Evidence: evidence/ux/ux-results.json (group "4 PDF links"); evidence/financial/sources-read.json
- To repeat: as 5.1

### 5.5b PDF links: does the document open at the right page on every device?

**UNVERIFIED.** The link ends in #page=N, which the PDF viewers of Chrome, Edge and Firefox follow. Some phone browsers open a PDF at its first page whatever the link says; that cannot be tested without the devices.

- Evidence: n/a
- To repeat: On a phone, open a request and tap "p. 180"

### 5.6 Theme switching

**PASS.** 5 of 5 checks pass: the site's own theme button switches the screen between light and dark and back; surfaces, text and the map change; charts and the map are still drawn; switching while on each of the eleven sections keeps the section drawn.

- Evidence: evidence/ux/ux-results.json (group "6 theme")
- To repeat: as 5.1

### 5.7 Keyboard navigation

**PASS.** 17 of 17 checks pass, after two defects found by this audit were fixed on the branch. Found: opening or closing a request, paging, and choosing a year each redrew the list and dropped the keyboard focus, so a keyboard user was sent back to the top; and the simulator's slider had no label a screen reader could read. Fixed: the focus now stays on the control that was used; the slider is labelled; and the section list now works as a radio group should (one Tab stop; arrow keys, Home and End).

- Evidence: evidence/ux/ux-results.json (group "7 keyboard")
- To repeat: as 5.1

### 5.8a Accessibility: what a scripted audit can check

**PASS.** 19 of 19 checks pass in both themes on all eleven sections: every button, link and control has a readable name; every form control has a label; every table has header cells; headings do not skip a level; charts and pictures are named or marked as decoration; no repeated ids; text contrast is at least 4.5 to 1 (3 to 1 for large text) for every piece of text measured (3,372 in each theme, gradients included); pinch zoom is allowed; at 200% text size the page does not scroll sideways.

- Evidence: evidence/ux/ux-results.json (group "8 accessibility"); evidence/ux/a11y-light.json; evidence/ux/a11y-dark.json
- To repeat: as 5.1

### 5.8b Accessibility: a full audit with a screen reader

**UNVERIFIED.** No screen reader (VoiceOver, TalkBack, NVDA) was run and no person who relies on one tried the screen. The scripted audit is hand-written for this screen; it is not a complete test against the accessibility guidelines.

- Evidence: n/a
- To repeat: Try the screen with a screen reader; a short list of what to try is in section 5

### 5.9 Real devices

**UNVERIFIED.** Every phone and tablet result above comes from an emulated device in desktop Chromium: the screen size, touch and browser name are imitated, but not the real browser engine (Safari on an iPhone), the real keyboard, or real download and PDF behaviour. No real device was available to this review, so no real-device result is reported. A ten-minute list for the owner to try on a phone is in section 5.

- Evidence: evidence/ux/ux-results.json (every result names what it was tested on)
- To repeat: Open the working preview (on the review page) on a phone and follow the list in section 5

### 5.10 The other screens are unaffected

**PASS.** On the final files: all 27 screens (the 26 existing ones and the new one) open on a desktop window and an emulated phone, 54 of 54, with no script error and no failed request. Compared with the same test on main before development, the only screens whose content changed are the three that gained an entry: How it is counted (one note), Data Scientist (one topic) and Data Genie (one suggested question). 40 of 40 interaction checks pass. With each data file hidden in turn (7 cases) no section shows a script error and each says plainly what could not be loaded. The search defect that is already on the live site (an error if you type before the index has loaded) is still there and was not changed.

- Evidence: docs/calgary-budget-intelligence/evidence/functional-after.json; interaction-tests.json; failure-handling.json
- To repeat: `node evidence/tools/smoke.js <address> <out-dir> budget-intelligence`

### 5.11a Data Genie and the Data Scientist can read the new data

**PASS.** Tried the way the website runs them (the Python files it ships to the browser, with no site data folder): 23 of 23 checks pass. The dashboard tool answers for the new section with the same figures as the screen (384 requests; $13,051.5 million; 855 positions; the four purposes; the 17 part-requests), for one request by number, for lists by words, kind and ward, by department, Council priority, service area and ward, and for the checks; the method note is served; the Data Scientist has a topic for the budget requests; every answer carries the instruction to say proposed, not approved, to take no side, and never to divide a citywide amount.

- Evidence: evidence/code/data-genie-tests.json
- To repeat: `cd <built site>/py && python3 evidence/tools/genie_test.py out.json`

### 5.11b A live conversation with Data Genie about the new data

**UNVERIFIED.** Not run: it needs the owner's access code and uses the owner's credits, and the assistants only run on the published site or the desktop app. What was verified is everything up to the assistant: the tool, its description, the data and the guidance it is given.

- Evidence: evidence/code/data-genie-tests.json
- To repeat: After publication: ask Data Genie "What are the ten largest requests in the proposed 2027 to 2030 budget, and which page of the City's document is each on?"
