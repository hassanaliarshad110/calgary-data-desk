import json, csv, datetime as dt

start, end = dt.date(2026, 11, 9), dt.date(2026, 12, 31)
days = [start + dt.timedelta(d) for d in range((end - start).days + 1)]

flagship = {
 "2026-11-09": "The pipe under the Bow: how the Bearspaw feeder main break pushed Calgary to the edge, and what is being done so it never happens again",
 "2026-11-11": "Remembrance Day: Calgary's military story, from Mewata Armoury and Currie Barracks to The Military Museums",
 "2026-11-13": "Moh'kins'tsis: the confluence of the Bow and Elbow before Fort Calgary, and the meaning of Treaty 7 (1877)",
 "2026-11-15": "Why is it called Calgary? From a beach on the Isle of Mull to the 1875 NWMP fort",
 "2026-11-17": "Sandstone City: how the 1886 fire rebuilt downtown in stone, and which sandstone buildings still survive",
 "2026-11-19": "Calgary's forgotten streetcars (1909-1950): the network that vanished and why rail came back as the CTrain",
 "2026-11-21": "The Chinook: the warm wind that can lift Calgary's temperature dramatically in hours, and what it does to the city",
 "2026-11-23": "Plus 15: how Calgary built one of the world's largest skywalk networks, and why it is now half empty",
 "2026-11-25": "Turner Valley 1914: the Dingman well, the oil boom that wasn't, and how Calgary became an energy head-office city",
 "2026-11-27": "June 2013: the flood that reshaped Calgary, and the reservoirs and barriers built since",
 "2026-11-29": "The 1988 Olympics: what is left of Calgary's Winter Games, venue by venue",
 "2026-12-01": "Nose Hill: how residents saved one of Canada's largest urban parks from becoming a suburb",
 "2026-12-03": "The Glenmore Dam (1932): where Calgary's water really comes from",
 "2026-12-05": "Zoolights and the Calgary Zoo: a century on St. George's Island, floods included",
 "2026-12-07": "Inglewood: Calgary's oldest neighbourhood and the railway decision that nearly erased it",
 "2026-12-09": "The Calgary Tower (1968): the Husky Tower, the Olympic flame and what it cost",
 "2026-12-11": "Hail Alley: why Calgary gets some of Canada's costliest hailstorms, and the 2020 storm",
 "2026-12-13": "Stoney Trail: the 50-year story of the ring road and the Tsuut'ina Nation agreement",
 "2026-12-15": "The Saddledome: from 1983 icon to flood survivor to its replacement, Scotia Place",
 "2026-12-17": "Eau Claire and Prince's Island: from lumber mill to Calgary's front yard",
 "2026-12-19": "The Peace Bridge: the red bridge Calgary argued about, and how it is used today",
 "2026-12-21": "The Bow River: the river that built Calgary, and the water licences that now limit its growth",
 "2026-12-23": "Heritage Park and the Calgary that was moved: buildings saved by relocating them",
 "2026-12-25": "Christmas in early Calgary: what the holidays looked like in the frontier town",
 "2026-12-27": "From cowtown to one of Canada's most diverse cities: how immigration remade Calgary",
 "2026-12-29": "Downtown's empty towers: the office glut after 2015 and the conversions bringing people back",
 "2026-12-31": "Calgary in 2026: the year in verified numbers",
}

civic = {
 "2026-11-09": "Budget adjustments for 2027: what council is being asked to approve this month, by service",
 "2026-11-11": "Green Line LRT: what is announced, what is funded, what is built",
 "2026-11-13": "Housing starts and building permits in 2026 vs the City's housing targets",
 "2026-11-16": "Snow and ice control: budget, priority routes and how long residential streets wait",
 "2026-11-18": "Water mains: how old Calgary's pipes are and how many break each year",
 "2026-11-20": "Your property tax dollar: where it goes, service by service",
 "2026-11-23": "New communities: how many the City has approved and what servicing them costs",
 "2026-11-25": "Fire response times vs the City's targets, by area",
 "2026-11-27": "Calgary Transit ridership vs 2019, and what the City spends per ride",
 "2026-11-30": "Recreation centres in growing communities: announced vs funded vs open",
 "2026-12-02": "City debt: how much Calgary owes and how close it is to its legal limit",
 "2026-12-04": "Rezoning: what the citywide rezoning changed on the ground, and where it stands now",
 "2026-12-07": "Affordable housing: units delivered vs the City's housing strategy commitments",
 "2026-12-09": "Library access: branches and hours per resident across the city",
 "2026-12-11": "Residential speed limits since 2021: what the collision data shows",
 "2026-12-14": "Scotia Place event centre: public cost, schedule and what is still unknown",
 "2026-12-16": "Green carts and recycling: diversion rates vs the City's targets",
 "2026-12-18": "Tree canopy: Calgary's coverage vs its target",
 "2026-12-21": "Bike network: kilometres built and counter data on use",
 "2026-12-23": "Police budget: share of City spending and how it has changed",
 "2026-12-25": "Climate strategy: emissions targets vs measured progress",
 "2026-12-28": "Capital projects delivered in 2026 vs planned",
 "2026-12-30": "Council's 2026: the major decisions of the year and their status",
}

bank = {
 "Population": ["Net migration: how many people moved to Calgary in the last year", "Calgary vs Edmonton: the population gap over time", "Calgary among Canada's fastest-growing metros", "Median age of Calgarians vs Canada", "Share of Calgarians born outside Canada", "How many new residents Calgary adds per day", "Calgary in 1901 vs today", "Births vs deaths vs migration: where Calgary's growth comes from", "Calgary's fastest-growing community", "How many Calgarians are over 65 vs a decade ago"],
 "Housing": ["One-bedroom rent today vs 2020 (CMHC)", "Rental vacancy rate now vs two years ago", "Housing starts: is Calgary building at a record pace", "Benchmark home price vs Vancouver and Toronto", "Income needed to buy a typical Calgary home", "Renters vs owners: the share of households", "Condo vs detached: the price gap", "Point-in-Time count: how many Calgarians are unhoused", "Secondary suites: how many are registered", "Average rent for a new vs older apartment"],
 "Construction": ["Building permit value this year", "Calgary's tallest building and how tall it is", "Calgary's biggest active construction project", "Office-to-residential conversions: units created", "Homes under construction right now", "How many new communities are actively building", "Construction cranes in Calgary vs other cities", "Heritage buildings designated by the City"],
 "Roads": ["Lane-kilometres of road the City maintains", "Potholes repaired per year", "Deerfoot Trail daily traffic volume", "Stoney Trail: length and what it cost", "Kilometres plowed in a big snowfall", "How many bridges the City owns", "Traffic collisions trend in Calgary", "Red-light and speed camera locations and tickets"],
 "Transit": ["CTrain weekday boardings", "CTrain network length and number of stations", "Is the CTrain still powered by wind electricity", "Calgary's busiest CTrain station", "Transit ridership vs 2019", "The downtown free fare zone", "MAX bus rapid transit lines", "Route 300: the airport bus", "Park and Ride: how many stalls and how full"],
 "Parks": ["Kilometres of regional pathways", "Fish Creek Park vs New York's Central Park", "Number of off-leash areas", "Trees on public land", "Outdoor rinks the City and communities maintain", "Bowness Park lagoon skating history", "Hectares of parks per resident", "Pathway bridges over the Bow and Elbow"],
 "Schools & amenities": ["New schools opening in Calgary", "Calgary's two big school boards: enrolment growth", "Central Library: visits since opening", "How many recreation centres the City runs", "Post-secondary students in Calgary", "Calgary Public Library cardholders", "Calgary's off-leash dog licences"],
 "City spending": ["What $100 of residential property tax pays for", "The typical homeowner's property tax bill", "City debt per resident", "The City's four-year capital budget", "Average monthly water, sewer and drainage bill", "Snow budget per year", "What the City spends per resident on parks"],
 "Economy": ["Calgary's unemployment rate vs Canada", "Head offices in Calgary", "Tech jobs growth in Calgary", "Median household income", "Downtown office vacancy rate", "Calgary airport passengers per year", "Stampede attendance", "Film and TV production spending in Alberta", "Businesses licensed in Calgary", "Average weekly earnings in Calgary vs Canada"],
 "Weather & environment": ["Calgary's sunshine hours vs other big cities", "Chinook days per year", "Calgary's elevation: highest major city in Canada?", "Coldest temperature ever recorded in Calgary", "Average first snowfall date", "Snow in summer: how often it happens", "Calgary's odds of a white Christmas", "Daylight on the shortest day of the year"],
 "City comparisons": ["Calgary's land area vs Toronto", "Population density vs Montreal and Vancouver", "No provincial sales tax: what it means at the till", "Commute times vs other big cities", "Rent vs Toronto and Vancouver", "Household income vs other big metros", "Precipitation vs Vancouver", "Gas prices: Calgary vs other big cities"],
 "Wards": ["Calgary's most populous ward", "Fastest-growing ward", "Largest vs smallest ward by area", "Ward with the most building permits this year", "Communities per ward", "Ward with the most park space", "Ward with the most 311 snow and ice requests last winter"],
 "Neighbourhoods": ["How many communities Calgary has", "Calgary's most densely populated community", "Community with the most children", "Most common languages spoken at home after English", "Calgary's newest communities", "Calgary's oldest neighbourhoods by founding date", "Communities that have lost population since 2016"],
}
pinned = {("2026-12-21", "AM"): ("Weather & environment", "Daylight on the shortest day of the year"),
          ("2026-12-25", "AM"): ("Weather & environment", "Calgary's odds of a white Christmas")}
for (_, _), (c, s) in pinned.items():
    bank[c].remove(s)
cats = list(bank)
queue = []
i = 0
while any(bank.values()):
    c = cats[i % len(cats)]; i += 1
    if bank[c]: queue.append((c, bank[c].pop(0)))

rows = []
for d in days:
    ds = d.isoformat(); dow = d.strftime("%a")
    for slot in ("AM", "PM"):
        c, s = pinned.get((ds, slot)) or queue.pop(0)
        rows.append(dict(date=ds, day=dow, slot=slot, type="quick-insight", skill="calgary-data-explainer", category=c, topic=s, length="15-35 s", format="1080x1920 vertical"))
    if ds in flagship:
        rows.append(dict(date=ds, day=dow, slot="FLAGSHIP", type="flagship", skill="calgary-storyteller", category="Documentary", topic=flagship[ds], length="60-120 s", format="1920x1080 widescreen"))
    if ds in civic:
        rows.append(dict(date=ds, day=dow, slot="CIVIC", type="civic", skill="calgary-civic-analyst", category="Civic intelligence", topic=civic[ds], length="30-60 s", format="1080x1920 vertical"))

# sanity: flagship dates every 2 days, civic only Mon/Wed/Fri
assert all(dt.date.fromisoformat(k).strftime("%a") in ("Mon", "Wed", "Fri") for k in civic)
fl = sorted(flagship); assert all((dt.date.fromisoformat(b) - dt.date.fromisoformat(a)).days == 2 for a, b in zip(fl, fl[1:]))
order = {"AM": 0, "FLAGSHIP": 1, "CIVIC": 2, "PM": 3}
rows.sort(key=lambda r: (r["date"], order[r["slot"]]))
json.dump(rows, open("calendar.json", "w"), indent=1)
with open("calendar.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
from collections import Counter
print(len(rows), Counter(r["type"] for r in rows), "leftover quick seeds:", len(queue))
