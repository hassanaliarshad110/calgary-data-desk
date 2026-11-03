# Calgary Data Desk

Every Calgary ward side by side, from City of Calgary open data: 311, safety, growth against amenities, families and
schools, the 2026 budget and property tax by ward. Two ways to use it:

- **The website** (GitHub Pages): rebuilt every morning by `.github/workflows/site.yml`, which runs
  `web/build_site.py` for Calgary and all 14 wards under each way of counting residents, then publishes the app's own
  screens with `web/web.js` standing in for the desktop bridge. Data Genie and the Data Scientist run the same Python
  agent in the visitor's browser (Pyodide, `web/genie-worker.js` and `web/webapp.py`) and open only with the access
  code.
- **The desktop app** (Windows): described below.

## Website setup (once)

1. **Settings, Pages**: set **Source** to **GitHub Actions**.
2. **Settings, Secrets and variables, Actions**, add two repository secrets:
   - `ANTHROPIC_API_KEY`: a Claude API key used only by the website (give it a monthly spend limit in the Claude Console);
   - `GENIE_ACCESS_CODE`: the code people type to open Data Genie and the Data Scientist (use four or more random words).
   The build locks the key with the code (PBKDF2 and AES-GCM) into `data/genie.json`; the page can use the key only after
   the code is typed. Anyone given the code can, with effort, read the key in their browser, so use a separate key.
3. **Actions, Website, Run workflow** for the first build (about 20 to 40 minutes). After that it runs every morning.

To change the code or the key, edit the secret and run the workflow again.

## The desktop app

A Windows app for the Office of Councillor Raj Dhaliwal, Ward 5: a live Ward 5 dashboard built from City of Calgary Open Data, and an AI
assistant (Claude) that answers questions about any of the City's ~1,000 public datasets, downloads data and
draws charts, tables and maps.

## Start it

Double-click **run.bat**. The first time, it sets up a private Python environment, installs `pywebview`
(about a minute) and puts a **Ward 5 Data Desk** shortcut on the desktop. After that, use the shortcut.

Needs Windows 10 or 11, Python 3.10+ (python.org, tick "Add Python to PATH") and an internet connection.

## Data Genie (ask questions)

1. Open **Settings**, **AI services, in order of use**, and add up to four services: Claude (console.anthropic.com),
   Gemini (a free key from aistudio.google.com), ChatGPT (platform.openai.com) or any OpenAI-style service. Use
   **Test** to check each key, and the arrows to set the order. Keys are saved only on this computer, in
   `%APPDATA%\Ward5DataDesk\settings.json`. When a service runs out of credit, reaches its daily limit or is down,
   the question carries on with the next one, and that service rests for a while before it is tried again.
2. Open **Data Genie** and type a question. **Fast** uses each service's quick model; **Thorough** and reports use
   its stronger model. Each answer says which service answered and what it cost.
3. Ask it to download data and it saves a CSV to `Downloads\Ward 5 Data Desk`; the **Files** page lists them.

The assistant only states numbers it got from the City's data in that conversation, and says which dataset
and dates each answer uses.

Data Genie works with the data already on this computer first: the dashboard's Ward 5 figures, the Calgary Police
crime and disorder data, the Crime Severity Index and the CSV files already saved in Files (it can filter, count,
group and sum them). It asks the City's website only when those can't answer, and downloads a file only when you
ask for one; if the same data is already saved it says so first.

## The Ward 5 dashboard

Every figure is fetched live from data.calgary.ca and open.alberta.ca. The app rebuilds it every hour (or when you
choose **Refresh data**). By default it compares the last 12 complete months with the 12 before; select the period at
the top to compare this year to date, the last 3 months, the last month, the study period or any months you choose.
Rates are per 1,000 residents a year. Open requests and residents are always as of today.

- residents today from the live Ward 5 growth model, next to the 2021 Census count
- 311 requests, per community and per 1,000 residents, and by City service
- infrastructure reports per 1,000 residents: the 21 roads, water and sewer, and parks types of the 311 study
- requests still open as of today, and how many have been open for more than 90 days
- share closed within 7 days and share made through the 311 app, against Calgary as a whole
- traffic incidents inside the Ward 5 boundary (map points for the last 90 days) and the City's traffic cameras
- homes in building permits issued and applied for, and development permit applications
- licensed child care spaces and inspection records, and school enrolment (Government of Alberta)
- road construction projects, and amenities: recreation facilities, libraries, community centres, playgrounds and
  transit stops
- crime and calls about disorder by community and month (Calgary Police Service, updated every quarter); the City's older social disorder dataset ended in July 2025
- crime in Calgary against other large cities: Statistics Canada's Crime Severity Index (yearly, city level), with
  a link to the Calgary Police Community Safety Dashboard for crime by community and ward
- rents and vacancy for the Ward 5 area, the Northeast and Calgary (CMHC Rental Market Survey, each October)

The first refresh after installing downloads about 60 MB of Government of Alberta child care and enrolment files,
once; they are kept in `%APPDATA%\Ward5DataDesk\alberta` and fetched again only when the province updates them.

Select **Live** at the bottom of the sidebar to see every source, when its publisher last updated it, and whether
this refresh loaded it.

**Open issues** lists every 311 request still open in Ward 5, with filters (including the year it was made and
hiding "311 Contact Us" messages), a details panel for each one, a request page to print or save as PDF, and
**Save this list** for a spreadsheet copy. **Families and schools** lists every licensed child care program with
its inspection record, and every school's enrolment by year. **Growth and amenities** lists development permits,
amenities by community and road construction. **Traffic cameras** replays each camera's images from the last 30
minutes on a loop (the City posts a still image about once a minute and keeps no recording); select a camera to
play, pause, step or drag through the replay. **Newsletter** makes a Ward 5 community update for any
months you choose (last month by default), compared with the same months a year earlier, and saves it as a PDF in
the Files folder. Choose the sections, add a message from the Councillor, and change any wording in the preview
before saving again. The PDF is printed with Microsoft Edge, which every Windows computer has.
**Briefing screen** fills the screen with the key
figures, live cameras and the newest reports, for a wall or meeting-room display (Esc to close).

Population is estimated every time the data refreshes with the Ward 5 growth model: 2021 Census people per home,
multiplied by the homes standing today on the City's property assessment roll (a home counts as lived in one year
after it is built), plus rental-building units (`data/ward5_rentals.json`). See `population.py`.

Weather questions use Environment Canada's daily climate data for the Calgary International Airport station
(`weather.py`), because the City does not publish weather records.

## Files

| File | What it does |
| --- | --- |
| `app.py` | Opens the window and connects the interface to the dashboard and the assistant |
| `newsletter.py` | Turns the dashboard for any months into a printable community update, and prints it to PDF |
| `context.py` | Crime Severity Index from Statistics Canada, kept for a week |
| `rents.py` | Rents and vacancy from CMHC's Rental Market Survey (Calgary, Northeast zone, the Ward 5 area) |
| `police.py` | Calgary Police Service crime and disorder by community, ward and month |
| `methods.py` | How the app counts every figure, dataset by dataset (shown in Data sources, used by Data Genie) |
| `local_data.py` | Lets Data Genie work with saved files and the police data without downloading again |
| `dashboard.py` | Works out the Ward 5 figures from the City's data |
| `agent.py` | The assistant: tools for searching, querying and downloading City data |
| `engines.py` | The AI services in priority order, and switching to the next one when a service fails |
| `calgary_data.py` | Talks to data.calgary.ca |
| `population.py` | The Ward 5 growth model: population today from homes on the property roll |
| `weather.py` | Calgary weather history from Environment Canada |
| `alberta.py`, `families.py` | Child care and school enrolment from Government of Alberta open data |
| `camfeed.py` | Keeps the last 30 minutes of traffic camera images for the replay |
| `ui/` | The interface (HTML, CSS, JavaScript; map, chart and text libraries bundled in `ui/vendor`) |

If the app does not open, details are written to `%APPDATA%\Ward5DataDesk\error.log`.

Maps: OpenStreetMap by default, Esri satellite imagery, or Google Maps when a Google Maps key is saved in Settings
(remove a personal key before giving the app to someone else).

Data: City of Calgary Open Data, Open Government Licence – City of Calgary. Government of Alberta open data, Open
Government Licence – Alberta. Weather: Environment and Climate Change Canada.
