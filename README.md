# Calgary News: published editions

Daily Calgary news articles for the Calgary Data Desk, each with its sources. The website, the laptop version and
Data Genie read these files directly:

- `news/latest.json`: every article from the last 60 days
- `news/index.json`: every day's headlines
- `news/days/YYYY-MM-DD.json`: one day's edition in full

Editions are written by `tools/news_publish.py` on the main branch, which checks every article is cited.
