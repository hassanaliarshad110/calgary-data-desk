"""Visiting Calgary (data/visit.json), worked out at each website build.

  weather   Environment and Climate Change Canada daily records for the Calgary airport station since 1885 (weather.py):
            the 1991 to 2020 normals by month, every year since 1885 (mean temperature, hot and cold days, snow, rain,
            frost-free days), the records in the data, the last twelve months against the normals, and today's
            forecast when the site was built. Daily rows are kept in the cache by year; only the current year and the
            one before are read again.
  places    sights and places to stay in OpenStreetMap (tourism tags) inside the city boundary, each placed in its
            community, with a hand-written list of the best-known sights (facts, a sentence on each, what weather suits
            it) matched to OpenStreetMap by name for its position and website.
  months    what is on in Calgary month by month: recurring festivals, seasons and sports, with the organiser's page.
  getting_around, facts, stats   checked by hand against the sources listed, with their dates; the weekly check
            reviews them.
Nothing here is a recommendation of one business over another: hotels are listed as OpenStreetMap has them, by area.
"""
import datetime as dt
import json
import os
import time
import urllib.parse
import urllib.request

import calgary_data as cd
import geo
import weather

VERSION = 1
FIRST_YEAR = 1885
NORMALS = (1991, 2020)
OSM_KEEP_DAYS = 7
BBOX = (50.84, -114.32, 51.22, -113.85)          # south, west, north, east: the whole City of Calgary
COMMUNITIES = 'surr-xmvs'
OSM_SOURCE = {'name': 'OpenStreetMap (Overpass API)', 'licence': '© OpenStreetMap contributors, Open Database Licence (ODbL)',
              'url': 'https://www.openstreetmap.org/copyright'}
STAY = ('hotel', 'motel', 'hostel', 'guest_house', 'apartment', 'resort', 'chalet')
SIGHTS = ('attraction', 'museum', 'gallery', 'zoo', 'theme_park', 'viewpoint', 'aquarium', 'artwork')
STAY_LABEL = {'hotel': 'Hotel', 'motel': 'Motel', 'hostel': 'Hostel', 'guest_house': 'Guest house', 'apartment': 'Apartment stay',
              'resort': 'Resort', 'chalet': 'Chalet'}
SIGHT_LABEL = {'attraction': 'Attraction', 'museum': 'Museum', 'gallery': 'Gallery', 'zoo': 'Zoo', 'theme_park': 'Theme park',
               'viewpoint': 'Viewpoint', 'aquarium': 'Aquarium', 'artwork': 'Public art'}
# the areas visitors ask about, by the City's community codes
AREAS = [
    ('Downtown', 'Downtown Commercial Core, Eau Claire, East Village, Chinatown and the west end: the +15 walkways, Stephen Avenue, the Bow River pathway, most head offices and the main hotels',
     ('DNC', 'DNE', 'DNW', 'EAU', 'CHN')),
    ('Beltline and Stampede Park', '17 Avenue SW, Mission and Victoria Park: restaurants, the Stampede grounds, the Saddledome and the new arena',
     ('BLN', 'VIC', 'MIS', 'CLF', 'LMR')),
    ('Inglewood and Ramsay', "Calgary's oldest neighbourhood: 9 Avenue SE shops and music venues, the Bird Sanctuary and the river", ('INN', 'RAM')),
    ('Kensington and Hillhurst', 'Across the Bow from downtown: cafés, shops and the river path, one CTrain stop from the core', ('HIL', 'SNH', 'WHL')),
    ('University and Motel Village', 'Beside the University of Calgary and McMahon Stadium, with a cluster of hotels and motels at Banff Trail', ('BNF', 'UNI', 'VAR', 'BRT', 'CAP')),
    ('Airport and the northeast', 'Hotels around Calgary International Airport, 17 km from downtown', ('MCL', 'SKV', 'SKR', 'CSC', 'HAR', 'WCO', 'PEG', 'FRA', 'SUN', 'DGT', 'SAD', 'CRN', 'MRT')),
    ('South', 'Macleod Trail, Chinook Centre, the Glenmore Reservoir, Heritage Park and the way to Fish Creek Park', ('MAN', 'FLN', 'HAY', 'KIN', 'SHW', 'WIL', 'SRI', 'ACA', 'GLG', 'MWP', 'BRD', 'EAG', 'MKZ', 'SET', 'SHS', 'SUN')),
    ('West and northwest', 'Canada Olympic Park, Bowness Park, the river valley and the road to the mountains', ('BOW', 'CRS', 'SPH', 'WES', 'GRE', 'GBN', 'VAL', 'ROC', 'ROY', 'TUS', 'ARB', 'COU')),
]

# the best-known sights, with what suits them: warm (a sunny day above about 18 °C), cool (5 to 18 °C), cold (below
# freezing), wet (rain or snow falling). 'indoor' places suit any weather. Facts are the organisers' own, checked
# 2026-11-06 (the weekly check reviews them).
TOP = [
    {'id': 'tower', 'name': 'Calgary Tower', 'kind': 'Viewpoint', 'area': 'Downtown', 'lat': 51.0444, 'lon': -114.0631, 'indoor': True,
     'what': 'The 191 m tower from 1968, with an observation deck, a glass floor and a view to the Rockies on a clear day.', 'url': 'https://www.calgarytower.com/', 'fit': ['warm', 'cool', 'cold', 'wet']},
    {'id': 'glenbow', 'name': 'Glenbow at the JR Shaw Centre for Arts & Culture', 'kind': 'Museum', 'area': 'Downtown', 'lat': 51.0447, 'lon': -114.0609, 'indoor': True,
     'what': 'Western Canada\'s largest museum, closed for its rebuild and reopening in 2027 with general admission paid for by an endowment, so visitors pay nothing to walk in.', 'url': 'https://www.glenbow.org/', 'fit': ['cold', 'wet', 'cool'], 'closed_until': '2027'},
    {'id': 'studiobell', 'name': 'Studio Bell, home of the National Music Centre', 'kind': 'Museum', 'area': 'Downtown', 'lat': 51.0426, 'lon': -114.0511, 'indoor': True,
     'what': "Canada's national music museum in East Village: instruments, recording studios and the Canadian Music Hall of Fame.", 'url': 'https://www.studiobell.ca/', 'fit': ['cold', 'wet', 'cool']},
    {'id': 'library', 'name': 'Central Library', 'kind': 'Landmark', 'area': 'Downtown', 'lat': 51.0458, 'lon': -114.0556, 'indoor': True,
     'what': 'The 2018 library in East Village that the CTrain runs underneath, open to everyone: reading rooms, a children\'s library and a café.', 'url': 'https://calgarylibrary.ca/', 'fit': ['cold', 'wet', 'cool']},
    {'id': 'stephen', 'name': 'Stephen Avenue Walk', 'kind': 'Street', 'area': 'Downtown', 'lat': 51.0453, 'lon': -114.0656, 'indoor': False,
     'what': 'The pedestrian street at the centre of downtown, a National Historic Site lined with sandstone buildings from the 1890s, restaurants and patios.', 'url': 'https://www.calgary.ca/bike-walk-roll/stephen-avenue.html', 'fit': ['warm', 'cool']},
    {'id': 'plus15', 'name': 'Plus 15 walkways', 'kind': 'Landmark', 'area': 'Downtown', 'lat': 51.0460, 'lon': -114.0700, 'indoor': True,
     'what': '86 bridges and more than 16 km of enclosed walkways one floor above the street, joining most downtown buildings, 6 am to 9 pm on weekdays.', 'url': 'https://www.calgary.ca/bike-walk-roll/plus-15-network.html', 'fit': ['cold', 'wet']},
    {'id': 'princes', 'name': "Prince's Island Park", 'kind': 'Park', 'area': 'Downtown', 'lat': 51.0536, 'lon': -114.0695, 'indoor': False,
     'what': 'The island park in the Bow River at the north edge of downtown: lawns, the river pathway and the site of the Folk Festival and Canada Day.', 'url': 'https://www.calgary.ca/parks-rec-culture/parks/princes-island-park.html', 'fit': ['warm', 'cool']},
    {'id': 'peace', 'name': 'Peace Bridge', 'kind': 'Landmark', 'area': 'Downtown', 'lat': 51.0533, 'lon': -114.0771, 'indoor': False,
     'what': 'The red footbridge over the Bow, opened in 2012, on the pathway between downtown and Kensington.', 'url': 'https://www.calgary.ca/bike-walk-roll/peace-bridge.html', 'fit': ['warm', 'cool', 'cold']},
    {'id': 'confluence', 'name': 'The Confluence Historic Site & Parkland', 'kind': 'Historic site', 'area': 'Downtown', 'lat': 51.0450, 'lon': -114.0440, 'indoor': True,
     'what': 'Where the Bow and Elbow rivers meet and the North-West Mounted Police built Fort Calgary in 1875: the museum of how the city began, formerly called Fort Calgary.', 'url': 'https://www.theconfluence.ca/', 'fit': ['warm', 'cool', 'cold', 'wet']},
    {'id': 'chinatown', 'name': 'Chinatown and the Chinese Cultural Centre', 'kind': 'Neighbourhood', 'area': 'Downtown', 'lat': 51.0510, 'lon': -114.0640, 'indoor': False,
     'what': 'One of Canada\'s larger Chinatowns, beside the river: restaurants, shops and the cultural centre with its dome modelled on the Temple of Heaven.', 'url': 'https://www.culturalcentre.ca/', 'fit': ['warm', 'cool', 'cold']},
    {'id': 'contemporary', 'name': 'Contemporary Calgary', 'kind': 'Gallery', 'area': 'Downtown', 'lat': 51.0505, 'lon': -114.0836, 'indoor': True,
     'what': 'The contemporary art gallery in the former Centennial Planetarium at the west end of downtown.', 'url': 'https://www.contemporarycalgary.com/', 'fit': ['cold', 'wet', 'cool']},
    {'id': 'devonian', 'name': 'Devonian Gardens', 'kind': 'Indoor garden', 'area': 'Downtown', 'lat': 51.0458, 'lon': -114.0665, 'indoor': True,
     'what': 'An indoor park on the top floor of the Core shopping centre: a hectare of plants, ponds and a playground, open every day at no charge.', 'url': 'https://www.calgary.ca/parks-rec-culture/parks/devonian-gardens.html', 'fit': ['cold', 'wet']},
    {'id': 'zoo', 'name': 'Wilder Institute / Calgary Zoo', 'kind': 'Zoo', 'area': 'Inglewood and Ramsay', 'lat': 51.0457, 'lon': -114.0287, 'indoor': False,
     'what': 'On St George\'s Island on the Bow, with the Canadian Wilds, the pandas\' former home and the winter Zoolights; its own CTrain station.', 'url': 'https://www.calgaryzoo.com/', 'fit': ['warm', 'cool', 'cold']},
    {'id': 'spark', 'name': 'TELUS Spark Science Centre', 'kind': 'Science centre', 'area': 'Inglewood and Ramsay', 'lat': 51.0528, 'lon': -114.0304, 'indoor': True,
     'what': 'The science centre beside the zoo, with a dome theatre and an outdoor park; Adults Only nights once a month.', 'url': 'https://www.sparkscience.ca/', 'fit': ['cold', 'wet', 'cool']},
    {'id': 'inglewood', 'name': 'Inglewood', 'kind': 'Neighbourhood', 'area': 'Inglewood and Ramsay', 'lat': 51.0405, 'lon': -114.0330, 'indoor': False,
     'what': 'Calgary\'s first main street (9 Avenue SE, 1875): vintage shops, music venues, breweries and the Inglewood Bird Sanctuary on the river.', 'url': 'https://www.inglewoodyyc.com/', 'fit': ['warm', 'cool', 'cold']},
    {'id': 'kensington', 'name': 'Kensington', 'kind': 'Neighbourhood', 'area': 'Kensington and Hillhurst', 'lat': 51.0523, 'lon': -114.0875, 'indoor': False,
     'what': 'The café and shop district across the Peace Bridge from downtown, one CTrain stop from the core (Sunnyside).', 'url': 'https://visitkensington.com/', 'fit': ['warm', 'cool', 'cold']},
    {'id': 'seventeenth', 'name': '17 Avenue SW', 'kind': 'Street', 'area': 'Beltline and Stampede Park', 'lat': 51.0378, 'lon': -114.0810, 'indoor': False,
     'what': 'The Beltline\'s restaurant and patio street, "the Red Mile" when the Flames are in the playoffs.', 'url': 'https://www.17thave.ca/', 'fit': ['warm', 'cool', 'cold']},
    {'id': 'stampede', 'name': 'Stampede Park, GMC Stadium and the BMO Centre', 'kind': 'Venue', 'area': 'Beltline and Stampede Park', 'lat': 51.0375, 'lon': -114.0530, 'indoor': False,
     'what': 'Home of the Calgary Stampede each July (more than 1.4 million visits over ten days in 2026), the rodeo grandstand, the BMO Centre convention halls and the Saddledome; the new Scotia Place arena opens in the fall of 2027.', 'url': 'https://www.calgarystampede.com/', 'fit': ['warm', 'cool']},
    {'id': 'heritage', 'name': 'Heritage Park Historical Village', 'kind': 'Historic site', 'area': 'South', 'lat': 50.9825, 'lon': -114.1038, 'indoor': False,
     'what': 'Canada\'s largest living history museum on the Glenmore Reservoir: a steam train, a paddlewheeler, a 1910 town and the Gasoline Alley car museum (open all year); the village opens from May to Thanksgiving and for Christmas weekends.', 'url': 'https://heritagepark.ca/', 'fit': ['warm', 'cool']},
    {'id': 'glenmore', 'name': 'Glenmore Reservoir and the Weaselhead', 'kind': 'Park', 'area': 'South', 'lat': 50.9930, 'lon': -114.1130, 'indoor': False,
     'what': 'The city\'s drinking water reservoir, ringed by a 16 km pathway, with sailing and paddling in summer and the Weaselhead natural area at its west end.', 'url': 'https://www.calgary.ca/parks-rec-culture/parks/weaselhead-flats.html', 'fit': ['warm', 'cool']},
    {'id': 'fishcreek', 'name': 'Fish Creek Provincial Park', 'kind': 'Park', 'area': 'South', 'lat': 50.9240, 'lon': -114.0500, 'indoor': False,
     'what': 'One of the largest urban parks in Canada, 19 km long across the south of the city: paths, Sikome Lake for swimming in summer, and cross-country skiing in winter.', 'url': 'https://www.albertaparks.ca/parks/kananaskis/fish-creek-pp/', 'fit': ['warm', 'cool', 'cold']},
    {'id': 'military', 'name': 'The Military Museums', 'kind': 'Museum', 'area': 'South', 'lat': 51.0010, 'lon': -114.0860, 'indoor': True,
     'what': 'The second-largest military museum in Canada: the Navy, Army and Air Force galleries and the regiments\' own museums.', 'url': 'https://themilitarymuseums.ca/', 'fit': ['cold', 'wet', 'cool']},
    {'id': 'nosehill', 'name': 'Nose Hill Park', 'kind': 'Park', 'area': 'West and northwest', 'lat': 51.1110, 'lon': -114.1150, 'indoor': False,
     'what': 'Eleven square kilometres of prairie grassland on a hill in the north of the city, with the skyline and the mountains in view from the top.', 'url': 'https://www.calgary.ca/parks-rec-culture/parks/nose-hill-park.html', 'fit': ['warm', 'cool', 'cold']},
    {'id': 'bowness', 'name': 'Bowness Park', 'kind': 'Park', 'area': 'West and northwest', 'lat': 51.0973, 'lon': -114.2237, 'indoor': False,
     'what': 'The riverside park in the northwest: boat rentals and a miniature train in summer, and skating on the lagoon and the river channels in winter.', 'url': 'https://www.calgary.ca/parks-rec-culture/parks/bowness-park.html', 'fit': ['warm', 'cool', 'cold']},
    {'id': 'winsport', 'name': 'WinSport at Canada Olympic Park', 'kind': 'Sports venue', 'area': 'West and northwest', 'lat': 51.0803, 'lon': -114.2160, 'indoor': False,
     'what': 'The 1988 Winter Olympics ski jump and bobsleigh site at the west edge of the city: skiing, snowboarding and tubing in winter, mountain biking and the zipline in summer, and public skating indoors all year.', 'url': 'https://www.winsport.ca/', 'fit': ['warm', 'cool', 'cold']},
    {'id': 'oval', 'name': 'Olympic Oval', 'kind': 'Sports venue', 'area': 'University and Motel Village', 'lat': 51.0775, 'lon': -114.1335, 'indoor': True,
     'what': 'The 1988 Olympic speed skating oval at the University of Calgary, with public skating sessions on the fast ice.', 'url': 'https://oval.ucalgary.ca/', 'fit': ['cold', 'wet', 'cool']},
    {'id': 'spruce', 'name': 'Spruce Meadows', 'kind': 'Sports venue', 'area': 'South', 'lat': 50.9000, 'lon': -114.1130, 'indoor': False,
     'what': 'The show jumping grounds at the south edge of the city, with tournaments from June to September (the Masters in September), Cavalry FC soccer from April to October and the Christmas Market in November.', 'url': 'https://www.sprucemeadows.com/', 'fit': ['warm', 'cool']},
    {'id': 'calaway', 'name': 'Calaway Park', 'kind': 'Theme park', 'area': 'West and northwest', 'lat': 51.0620, 'lon': -114.3900, 'indoor': False,
     'what': 'Western Canada\'s largest outdoor family amusement park, just west of the city on the Trans-Canada Highway, open from May to October.', 'url': 'https://www.calawaypark.com/', 'fit': ['warm']},
    {'id': 'lougheed', 'name': 'Lougheed House', 'kind': 'Historic site', 'area': 'Beltline and Stampede Park', 'lat': 51.0410, 'lon': -114.0770, 'indoor': True,
     'what': 'The 1891 sandstone mansion of Senator James Lougheed in the Beltline, a National Historic Site with gardens and a restaurant.', 'url': 'https://lougheedhouse.com/', 'fit': ['cold', 'wet', 'cool', 'warm']},
    {'id': 'farmers', 'name': "Calgary Farmers' Market", 'kind': 'Market', 'area': 'South', 'lat': 50.9860, 'lon': -114.0600, 'indoor': True,
     'what': 'Indoor markets open all year, Thursday to Sunday: the South market on 77 Avenue SE and the West market at Greenbriar.', 'url': 'https://www.calgaryfarmersmarket.ca/', 'fit': ['cold', 'wet', 'cool']},
    {'id': 'pathways', 'name': 'The Bow River pathway', 'kind': 'Pathway', 'area': 'Downtown', 'lat': 51.0500, 'lon': -114.0600, 'indoor': False,
     'what': 'Part of more than 1,000 km of pathways: along the Bow from Bowness to Fish Creek, past downtown, the zoo and Inglewood, with bike share and rentals downtown.', 'url': 'https://www.calgary.ca/bike-walk-roll/pathways-bikeways.html', 'fit': ['warm', 'cool']},
]

DAY_TRIPS = [
    {'name': 'Banff and Lake Louise', 'km': 128, 'what': 'Banff National Park: the townsite, the gondola, Lake Louise and Moraine Lake (shuttle in summer). A Parks Canada pass is needed to stop in the park.', 'url': 'https://parks.canada.ca/pn-np/ab/banff'},
    {'name': 'Canmore and Kananaskis', 'km': 105, 'what': 'The mountain town of Canmore and Kananaskis Country\'s trails and lakes; a Kananaskis Conservation Pass is needed to park in Kananaskis.', 'url': 'https://www.alberta.ca/kananaskis-conservation-pass'},
    {'name': 'Drumheller and the Royal Tyrrell Museum', 'km': 135, 'what': 'The badlands, the hoodoos and Canada\'s dinosaur museum, 1.5 hours east.', 'url': 'https://tyrrellmuseum.com/'},
    {'name': 'Head-Smashed-In Buffalo Jump', 'km': 175, 'what': 'The UNESCO World Heritage buffalo jump used by Plains peoples for nearly 6,000 years, near Fort Macleod.', 'url': 'https://headsmashedin.ca/'},
    {'name': 'Waterton Lakes National Park', 'km': 270, 'what': 'Where the prairie meets the mountains at the US border, 3 hours south.', 'url': 'https://parks.canada.ca/pn-np/ab/waterton'},
]

# what is on, month by month: recurring events with the organiser's page. Dates are the organisers' habit, not a
# promise: check their page for the year's dates.
MONTHS = [
    (1, 'January', 'Deep winter, but often sunny: the coldest month on average, with Chinook days above freezing.',
     [('Flames, Wranglers and Hitmen hockey', 'NHL, AHL and WHL games at the Saddledome', 'https://www.nhl.com/flames'), ('Zoolights', 'The zoo\'s light festival runs into early January', 'https://www.calgaryzoo.com/'),
      ('Skating', 'Bowness Park lagoon, the Olympic Oval and outdoor rinks across the city', 'https://www.calgary.ca/parks-rec-culture/recreation/skating.html'), ('Chinook Blast', 'The winter festival downtown opens at the end of the month', 'https://www.chinookblast.ca/')]),
    (2, 'February', 'Still cold, with the most sunshine of the winter months and the Chinook Blast festival downtown.',
     [('Chinook Blast', 'Light art, music and winter sport downtown through mid-February (January 30 to February 16 in 2026)', 'https://www.chinookblast.ca/'), ('Family Day weekend', 'The Alberta long weekend in the middle of the month', 'https://www.alberta.ca/alberta-general-holidays'),
      ('Skiing and tubing', 'WinSport in the city; Banff, Lake Louise and Nakiska within two hours', 'https://www.winsport.ca/')]),
    (3, 'March', 'Melting and freezing by turns; the restaurant festival and the end of the hockey regular season.',
     [('Big Taste', 'The restaurant festival\'s set menus across the city', 'https://www.bigtastecalgary.com/'), ('Calgary Roughnecks lacrosse', 'National Lacrosse League games at the Saddledome, December to May', 'https://calgaryroughnecks.com/')]),
    (4, 'April', 'Spring arrives, with snow still possible; the comic expo and the start of the outdoor season.',
     [('Calgary Expo', 'The comic and entertainment expo at Stampede Park', 'https://calgaryexpo.com/'), ('Cavalry FC', 'Canadian Premier League soccer at Spruce Meadows, April to October', 'https://cavalryfc.canpl.ca/'),
      ('Stanley Cup playoffs', 'If the Flames are in, 17 Avenue becomes the Red Mile', 'https://www.nhl.com/flames')]),
    (5, 'May', 'Green at last; patios open, the marathon runs and Heritage Park opens for the season.',
     [('Calgary Marathon', 'Canada\'s longest-running marathon, at the end of the month', 'https://calgarymarathon.com/'), ('Heritage Park opens', 'The historical village opens for the summer in May', 'https://heritagepark.ca/'),
      ('Calaway Park opens', 'Weekends from May, daily in summer', 'https://www.calawaypark.com/'), ('Victoria Day weekend', 'The long weekend that opens the camping season', 'https://www.alberta.ca/alberta-general-holidays')]),
    (6, 'June', 'The wettest month, long days and the start of the festival season.',
     [('Lilac Festival', '4 Street SW\'s street festival on the first Sunday of June', 'https://www.lilacfestival.net/'), ('Sled Island', 'The music and arts festival across downtown venues, late June', 'https://www.sledisland.com/'),
      ('Spruce Meadows summer tournaments', 'Show jumping, June to July', 'https://www.sprucemeadows.com/'), ('Stampeders football', 'CFL season at McMahon Stadium, June to November', 'https://www.stampeders.com/'),
      ('National Indigenous Peoples Day', 'June 21 events across the city', 'https://www.calgary.ca/communities/indigenous.html')]),
    (7, 'July', 'The warmest month and the Stampede: the city dresses western for ten days.',
     [('Calgary Stampede', 'July 9 to 18, 2027: the rodeo, chuckwagons, the parade on the first Friday, the midway and the evening show (July 3 to 12 in 2026)', 'https://www.calgarystampede.com/'),
      ('Canada Day', 'July 1 celebrations downtown and in the parks', 'https://www.calgary.ca/events/canada-day.html'), ('Calgary Folk Music Festival', 'Four days on Prince\'s Island at the end of July', 'https://www.calgaryfolkfest.com/'),
      ('Calgary International Blues Festival', 'Late July or early August', 'https://www.calgarybluesfest.com/')]),
    (8, 'August', 'Warm days and cool nights, fireworks over Elliston Park and the Fringe.',
     [('GlobalFest', 'The international fireworks competition and cultural pavilions at Elliston Park', 'https://www.globalfest.ca/'), ('Calgary Fringe Festival', 'Theatre in Inglewood, early August', 'https://www.calgaryfringe.ca/'),
      ('Taste of Calgary', 'The food festival downtown', 'https://tasteofcalgary.com/'), ('Calgary Pride', 'The parade and festival at the end of August into September', 'https://www.calgarypride.ca/')]),
    (9, 'September', 'Often the finest weather of the year: warm, dry days; the Masters, Beakerhead and the film festival.',
     [('Spruce Meadows Masters', 'The show jumping tournament in the first half of September', 'https://www.sprucemeadows.com/'), ('Beakerhead', 'Art, science and engineering spectacles across the city', 'https://beakerhead.com/'),
      ('Calgary International Film Festival', 'Eleven days of films at the end of September', 'https://www.ciffcalgary.ca/'), ('Larch season', 'The larches turn gold in the mountains in the last two weeks', 'https://parks.canada.ca/pn-np/ab/banff')]),
    (10, 'October', 'Crisp days, the first snow, hockey returns and Wordfest.',
     [('Flames opening night', 'The NHL season opens', 'https://www.nhl.com/flames'), ('Wordfest', 'The writers\' festival downtown', 'https://wordfest.com/'),
      ('Thanksgiving weekend', 'Heritage Park\'s last weekend of the summer season', 'https://heritagepark.ca/'), ('Halloween at the zoo and Heritage Park', 'Family events through the month', 'https://www.calgaryzoo.com/')]),
    (11, 'November', 'Winter sets in; the Christmas markets open and Zoolights begins.',
     [('Spruce Meadows International Christmas Market', 'Weekends from mid-November', 'https://www.sprucemeadows.com/'), ('Zoolights', 'From mid-November to early January', 'https://www.calgaryzoo.com/'),
      ('Once Upon a Christmas', 'Heritage Park\'s Christmas weekends', 'https://heritagepark.ca/'), ('Grey Cup', 'If the Stampeders reach it, the CFL final in late November', 'https://www.stampeders.com/')]),
    (12, 'December', 'Short, bright days; lights, skating and the markets.',
     [('Zoolights', 'Every evening at the zoo', 'https://www.calgaryzoo.com/'), ('Skating opens', 'Bowness Park lagoon and the outdoor rinks when the ice is ready', 'https://www.calgary.ca/parks-rec-culture/recreation/skating.html'),
      ('New Year\'s Eve', 'The City publishes the downtown plan each December', 'https://www.calgary.ca/events.html')]),
]

GETTING_AROUND = [
    ('From the airport', 'Calgary International Airport (YYC) is 17 km northeast of downtown. Calgary Transit\'s Route 300 bus runs between the airport and downtown along Centre Street for the regular adult fare, about 45 to 55 minutes; Route 100 links the airport to the Blue Line CTrain. A taxi to downtown is about $40 to $50 and 25 to 35 minutes; rideshares pick up at the terminal.',
     'https://www.yyc.com/en-us/to-from/ground-transportation'),
    ('Calgary Transit', 'In 2026 an adult single fare is $4.00 (valid 90 minutes), a day pass $12.65, youth $2.65 and children 12 and under ride at no charge; buy fares in the My Fare app or at CTrain stations. The Red and Blue CTrain lines cross downtown along 7 Avenue, where riding between the downtown stations costs nothing.',
     'https://www.calgarytransit.com/fares---passes.html'),
    ('Finding your way', 'Calgary is a grid in four quadrants (NW, NE, SW, SE) split by Centre Street and the Bow River; every address carries its quadrant, and the same street number can exist in all four. Downtown avenues run east-west and streets north-south.',
     'https://www.calgary.ca/'),
    ('Downtown on foot', 'The Plus 15 walkways (86 bridges, more than 16 km) join most downtown buildings one floor up, open 6 am to 9 pm on weekdays and 9 am to 7 pm at weekends, so a winter day downtown needs no coat between buildings.',
     'https://www.calgary.ca/bike-walk-roll/plus-15-network.html'),
    ('Bikes and pathways', 'More than 1,000 km of pathways, with the Bow River pathway through downtown; shared e-bikes and e-scooters are available downtown and in the inner city from spring to fall.',
     'https://www.calgary.ca/bike-walk-roll/pathways-bikeways.html'),
    ('Driving and the mountains', 'Banff is 128 km west on the Trans-Canada Highway, about 90 minutes; winter tires or chains are required on some mountain highways from November to April. A Parks Canada pass is needed inside the national parks and a Kananaskis Conservation Pass to park in Kananaskis.',
     'https://511.alberta.ca/'),
    ('Money, tax and tipping', 'Alberta has no provincial sales tax: the 5% federal GST applies to most purchases, hotels add a 4% tourism levy (and many a 6% destination marketing fee), and 15 to 20% is the usual tip in restaurants.',
     'https://www.visitcalgary.com/visitor-hub/faq'),
    ('Winter', 'December to February are the cold months (the month table shows the averages), with sunny skies most days; a Chinook wind can lift the temperature by 15 to 20 °C in a few hours. Dress in layers; the +15, the CTrain and the malls are warm.',
     'https://weather.gc.ca/city/pages/ab-52_metric_e.html'),
]

FACTS = [
    ('The sunniest big city in Canada', 'About 2,396 hours of bright sunshine a year and 333 days with some sun (Environment Canada normals, 1981 to 2010).', 'https://climate.weather.gc.ca/climate_normals/'),
    ('Chinooks', 'Warm, dry winds off the Rockies that can lift a winter day from −20 °C to above freezing within hours; the Chinook arch of cloud over the mountains announces them.', 'https://weather.gc.ca/'),
    ('High and dry', 'At 1,045 m above sea level, Calgary is Canada\'s highest large city; the air is dry, so summer nights cool quickly and the sun is strong.', 'https://www.calgary.ca/'),
    ('The 1988 Winter Olympics', 'The first Winter Games in Canada, February 13 to 28, 1988; the Olympic Oval, the ski jumps at Canada Olympic Park and the Saddledome are still in use.', 'https://www.winsport.ca/'),
    ('The Stampede', 'First held in 1912; more than 1.4 million visits over its ten days in 2026.', 'https://www.calgarystampede.com/'),
    ('Head offices', 'Calgary has the most head offices per person of any Canadian city and the second-most in total after Toronto, most of them in energy.', 'https://www.calgaryeconomicdevelopment.com/'),
    ('The Caesar', 'Canada\'s cocktail was invented at the Calgary Inn in 1969.', 'https://www.visitcalgary.com/'),
    ('Parks', 'Fish Creek is one of the largest urban parks in Canada and Nose Hill one of the largest municipal parks; more than 1,000 km of pathways join them.', 'https://www.calgary.ca/parks-rec-culture/parks.html'),
    ('Two rivers', 'The Bow and the Elbow meet at the Confluence, where the city began as a North-West Mounted Police fort in 1875; the Bow is one of the world\'s best trout rivers inside a city.', 'https://www.theconfluence.ca/'),
]

STATS = [
    ('10.5 million', 'visitors in 2025', 'Tourism Calgary, 2025 annual report'),
    ('$3.3 billion', 'spent by visitors in Calgary in 2025', 'Tourism Calgary, 2025 annual report'),
    ('19.4 million', 'passengers through YYC in 2025, up from 18.9 million in 2024', 'Tourism Calgary, 2025 annual report (Calgary Airport Authority)'),
    ('67.5%', 'hotel occupancy in 2025', 'Tourism Calgary, 2025 annual report'),
    ('84,000', 'Calgarians employed in tourism', 'Tourism Calgary'),
    ('1.4 million+', 'visits to the 2026 Stampede over ten days', 'Calgary Stampede, July 2026'),
]

SOURCES = [
    {'title': 'Daily climate data, Calgary International Airport (climate IDs 3031092 and 3031093)', 'publisher': 'Environment and Climate Change Canada', 'url': 'https://api.weather.gc.ca/collections/climate-daily'},
    {'title': 'Public forecast for Calgary', 'publisher': 'Environment and Climate Change Canada', 'url': 'https://weather.gc.ca/city/pages/ab-52_metric_e.html'},
    {'title': 'OpenStreetMap: tourism features inside the City of Calgary', 'publisher': 'OpenStreetMap contributors (ODbL)', 'url': 'https://www.openstreetmap.org/copyright'},
    {'title': 'Community District Boundaries', 'publisher': 'The City of Calgary', 'url': 'https://data.calgary.ca/d/surr-xmvs'},
    {'title': '2025 Annual Report', 'publisher': 'Tourism Calgary', 'url': 'https://www.visitcalgary.com/'},
    {'title': 'Fares and passes', 'publisher': 'Calgary Transit', 'url': 'https://www.calgarytransit.com/fares---passes.html'},
    {'title': 'Plus 15 network', 'publisher': 'The City of Calgary', 'url': 'https://www.calgary.ca/bike-walk-roll/plus-15-network.html'},
    {'title': 'Visitor FAQ', 'publisher': 'Tourism Calgary', 'url': 'https://www.visitcalgary.com/visitor-hub/faq'},
    {'title': 'Canadian Climate Normals 1981 to 2010 (sunshine)', 'publisher': 'Environment and Climate Change Canada', 'url': 'https://climate.weather.gc.ca/climate_normals/'},
]


# ---------------------------------------------------------------- weather
def _year_rows(cache_dir, year, today):
    """Daily rows for one year, from the cache unless the year is still running (or just ended)."""
    d = os.path.join(cache_dir, 'visit', 'daily')
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, f'{year}.json')
    fresh = year >= today.year - 1
    if os.path.exists(p) and (not fresh or time.time() - os.path.getmtime(p) < 86400):
        with open(p, encoding='utf-8') as f:
            return json.load(f)
    rows = weather.daily(dt.date(year, 1, 1), min(dt.date(year, 12, 31), today))
    keep = [{'d': r['LOCAL_DATE'][:10], 't': r.get('MEAN_TEMPERATURE'), 'lo': r.get('MIN_TEMPERATURE'), 'hi': r.get('MAX_TEMPERATURE'),
             'p': r.get('TOTAL_PRECIPITATION'), 'r': r.get('TOTAL_RAIN'), 's': r.get('TOTAL_SNOW'), 'g': r.get('SNOW_ON_GROUND')} for r in rows]
    with open(p + '.tmp', 'w', encoding='utf-8') as f:
        json.dump(keep, f, separators=(',', ':'))
    os.replace(p + '.tmp', p)
    return keep


def _f(v):
    try:
        return None if v is None else float(v)
    except (TypeError, ValueError):
        return None


def _mean(xs, nd=1):
    xs = [x for x in xs if x is not None]
    return round(sum(xs) / len(xs), nd) if xs else None


def _month_stats(rows):
    """Figures for one calendar month (any year): the daily rows of that month."""
    hi = [_f(r['hi']) for r in rows]
    lo = [_f(r['lo']) for r in rows]
    return {'high': _mean(hi), 'low': _mean(lo), 'mean': _mean([_f(r['t']) for r in rows]),
            'rain_mm': round(sum(_f(r['r']) or 0 for r in rows), 1), 'snow_cm': round(sum(_f(r['s']) or 0 for r in rows), 1),
            'precip_mm': round(sum(_f(r['p']) or 0 for r in rows), 1),
            'days_20': sum(1 for h in hi if h is not None and h >= 20), 'days_25': sum(1 for h in hi if h is not None and h >= 25),
            'days_frost': sum(1 for l in lo if l is not None and l <= 0), 'days_m20': sum(1 for l in lo if l is not None and l <= -20),
            'days_snowfall': sum(1 for r in rows if (_f(r['s']) or 0) >= 0.2), 'days_rain': sum(1 for r in rows if (_f(r['r']) or 0) >= 0.2),
            'days_snow_on_ground': sum(1 for r in rows if (_f(r['g']) or 0) >= 1), 'n': len(rows)}


def weather_block(cache_dir, today):
    by_year = {}
    missing = []
    for y in range(FIRST_YEAR, today.year + 1):
        try:
            by_year[y] = _year_rows(cache_dir, y, today)
        except Exception as e:                           # noqa: BLE001 - one year missing must not stop the page
            missing.append(f'{y}: {e}')
    names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    # normals: the 1991 to 2020 average of each month's figures
    normals = []
    for m in range(1, 13):
        per_year = []
        for y in range(NORMALS[0], NORMALS[1] + 1):
            rows = [r for r in by_year.get(y, []) if int(r['d'][5:7]) == m]
            if len(rows) >= 20:
                per_year.append(_month_stats(rows))
        keys = ['high', 'low', 'mean', 'rain_mm', 'snow_cm', 'precip_mm', 'days_20', 'days_25', 'days_frost', 'days_m20', 'days_snowfall', 'days_rain', 'days_snow_on_ground']
        normals.append({'n': m, 'name': names[m - 1], **{k: _mean([s[k] for s in per_year], 1) for k in keys}, 'years': len(per_year)})
    # every year: the annual figures (a year counts when it has at least 330 days of temperature)
    years = []
    for y in range(FIRST_YEAR, today.year + 1):
        rows = by_year.get(y) or []
        t = [_f(r['t']) for r in rows if _f(r['t']) is not None]
        if len(t) < 330 and y != today.year:
            continue
        hi = [_f(r['hi']) for r in rows]
        lo = [(r['d'], _f(r['lo'])) for r in rows if _f(r['lo']) is not None]
        # frost-free season: from the last spring day at or below 0 to the first fall day at or below 0
        spring = [d for d, v in lo if v <= 0 and int(d[5:7]) <= 7]
        fall = [d for d, v in lo if v <= 0 and int(d[5:7]) >= 7]
        ff = None
        if spring and fall and y != today.year:
            a, b = dt.date.fromisoformat(max(spring)), dt.date.fromisoformat(min(fall))
            ff = (b - a).days - 1 if b > a else 0
        years.append({'y': y, 'mean': _mean(t), 'days_25': sum(1 for h in hi if h is not None and h >= 25),
                      'days_30': sum(1 for h in hi if h is not None and h >= 30), 'days_m20': sum(1 for _, v in lo if v <= -20),
                      'snow_cm': round(sum(_f(r['s']) or 0 for r in rows), 1) if any(_f(r['s']) is not None for r in rows) else None,
                      'precip_mm': round(sum(_f(r['p']) or 0 for r in rows), 1) if any(_f(r['p']) is not None for r in rows) else None,
                      'frost_free': ff, 'days': len(t), 'partial': y == today.year})
    # records in the data
    allrows = [r for y in sorted(by_year) for r in by_year[y]]
    def best(key, fn, cond=lambda v: v is not None):
        vals = [(r['d'], _f(r[key])) for r in allrows if cond(_f(r[key]))]
        if not vals:
            return None
        d, v = fn(vals, key=lambda x: x[1])
        return {'date': d, 'value': v}
    records = {'hottest': best('hi', max), 'coldest': best('lo', min), 'most_rain_day': best('r', max), 'most_snow_day': best('s', max),
               'deepest_snow': best('g', max), 'warmest_year': max((y for y in years if not y['partial'] and y['mean'] is not None), key=lambda y: y['mean'], default=None),
               'coldest_year': min((y for y in years if not y['partial'] and y['mean'] is not None), key=lambda y: y['mean'], default=None)}
    # snow in summer: the latest spring and earliest fall snowfall (at least 1 cm) in the record
    snow = [(r['d'], _f(r['s'])) for r in allrows if (_f(r['s']) or 0) >= 1]
    records['latest_spring_snow'] = max((d for d, _ in snow if 5 <= int(d[5:7]) <= 7), key=lambda d: d[5:], default=None)
    records['earliest_fall_snow'] = min((d for d, _ in snow if 7 <= int(d[5:7]) <= 10), key=lambda d: d[5:], default=None)
    # the last twelve full months against the normals
    last12 = []
    y, m = today.year, today.month
    for _ in range(12):
        m -= 1
        if m == 0:
            y, m = y - 1, 12
        rows = [r for r in by_year.get(y, []) if int(r['d'][5:7]) == m]
        s = _month_stats(rows) if rows else {}
        last12.append({'y': y, 'n': m, 'name': names[m - 1][:3], 'high': s.get('high'), 'low': s.get('low'), 'mean': s.get('mean'),
                       'snow_cm': s.get('snow_cm'), 'precip_mm': s.get('precip_mm'), 'normal_mean': normals[m - 1]['mean']})
    last12.reverse()
    try:
        today_fc = weather.forecast()
    except Exception as e:                               # noqa: BLE001 - the forecast is a bonus
        today_fc = {'error': str(e)}
    return {'normals': normals, 'normals_period': f'{NORMALS[0]} to {NORMALS[1]}', 'years': years, 'first_year': FIRST_YEAR,
            'records': records, 'last12': last12, 'today': today_fc, 'missing_years': missing, 'source': weather.SOURCE}


# ---------------------------------------------------------------- places
def osm_query(bbox=BBOX):
    b = ','.join(str(x) for x in bbox)
    return (f'[out:json][timeout:180];('
            f'nwr["tourism"~"^({"|".join(STAY)})$"]["name"]({b});'
            f'nwr["tourism"~"^({"|".join(SIGHTS)})$"]["name"]({b});'
            f');out tags center;')


def osm_fetch(cache_dir, force=False):
    p = os.path.join(cache_dir, 'visit', 'osm.json')
    if os.path.exists(p) and not force and time.time() - os.path.getmtime(p) < OSM_KEEP_DAYS * 86400:
        with open(p, encoding='utf-8') as f:
            return json.load(f)
    body = urllib.parse.urlencode({'data': osm_query()}).encode()
    last = None
    for url in ('https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'):
        for attempt in range(2):
            try:
                req = urllib.request.Request(url, data=body, headers={'User-Agent': 'CalgaryInsight/1.0 (civic open data)'})
                with urllib.request.urlopen(req, timeout=200) as r:
                    els = json.loads(r.read().decode('utf-8'))['elements']
                os.makedirs(os.path.dirname(p), exist_ok=True)
                with open(p, 'w', encoding='utf-8') as f:
                    json.dump(els, f, separators=(',', ':'))
                return els
            except Exception as e:                       # noqa: BLE001 - busy or down: wait, then the other server
                last = e
                time.sleep(20 if attempt == 0 else 2)
    if os.path.exists(p):
        with open(p, encoding='utf-8') as f:
            return json.load(f)
    raise RuntimeError(f'OpenStreetMap could not be reached ({last})')


def _norm(s):
    return ''.join(ch for ch in (s or '').lower() if ch.isalnum() or ch == ' ').strip()


def places_block(cache_dir, force=False):
    shapes = cd.query(COMMUNITIES, select='comm_code,name,multipolygon', limit=5000)
    polys = {r['comm_code']: r['multipolygon'] for r in shapes if r.get('comm_code') and r.get('multipolygon')}
    names = {r['comm_code']: (r.get('name') or '').title() for r in shapes if r.get('comm_code')}
    loc = geo.Locator(polys)
    area_of = {}
    for label, _, codes in AREAS:
        for c in codes:
            area_of.setdefault(c, label)
    els = osm_fetch(cache_dir, force)
    stays, sights = [], []
    for e in els:
        t = e.get('tags') or {}
        lat = e.get('lat') if e.get('type') == 'node' else (e.get('center') or {}).get('lat')
        lon = e.get('lon') if e.get('type') == 'node' else (e.get('center') or {}).get('lon')
        if lat is None or lon is None:
            continue
        code = loc.find(lon, lat)
        if not code:
            continue                                     # outside the city
        kind = t.get('tourism')
        row = {'name': t.get('name'), 'kind': kind, 'comm': code, 'community': names.get(code), 'area': area_of.get(code, 'Elsewhere in Calgary'),
               'lat': round(lat, 5), 'lon': round(lon, 5), 'url': t.get('website') or t.get('contact:website') or None,
               'osm': f"{e.get('type')}/{e.get('id')}"}
        if kind in STAY:
            row['stars'] = t.get('stars')
            row['brand'] = t.get('brand')
            stays.append(row)
        else:
            row['label'] = SIGHT_LABEL.get(kind, kind)
            sights.append(row)
    # the hand-written list takes its position and website from OpenStreetMap when the name matches
    by_name = {_norm(s['name']): s for s in sights}
    top = []
    for p in TOP:
        q = dict(p)
        m = by_name.get(_norm(p['name'])) or next((s for k, s in by_name.items() if k and (k in _norm(p['name']) or _norm(p['name']) in k) and len(k) > 8), None)
        if m:
            q['lat'], q['lon'] = m['lat'], m['lon']
            q['osm'] = m['osm']
            q['community'] = m['community']
            if not q.get('url') and m.get('url'):
                q['url'] = m['url']
        else:
            code = loc.find(p['lon'], p['lat'])
            q['community'] = names.get(code)
        top.append(q)
    stays.sort(key=lambda s: (s['area'], s['name'] or ''))
    sights.sort(key=lambda s: (s['area'], s['name'] or ''))
    by_area = []
    for label, about, _ in AREAS:
        n = [s for s in stays if s['area'] == label]
        by_area.append({'area': label, 'about': about, 'stays': len(n), 'hotels': sum(1 for s in n if s['kind'] == 'hotel'),
                        'sights': sum(1 for s in sights if s['area'] == label)})
    other = [s for s in stays if s['area'] == 'Elsewhere in Calgary']
    by_area.append({'area': 'Elsewhere in Calgary', 'about': 'Hotels and motels along the main roads and in the suburbs', 'stays': len(other),
                    'hotels': sum(1 for s in other if s['kind'] == 'hotel'), 'sights': sum(1 for s in sights if s['area'] == 'Elsewhere in Calgary')})
    return {'top': top, 'sights': sights, 'stays': stays, 'areas': by_area, 'stay_labels': STAY_LABEL, 'osm_source': OSM_SOURCE,
            'day_trips': DAY_TRIPS}


def build(cache_dir, today=None, force=False):
    today = today or dt.date.today()
    out = {'version': VERSION, 'built_at': dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'today': today.isoformat(), 'errors': {}}
    try:
        out['weather'] = weather_block(cache_dir, today)
    except Exception as e:                               # noqa: BLE001
        out['errors']['weather'] = str(e)
    try:
        out.update(places_block(cache_dir, force))
    except Exception as e:                               # noqa: BLE001
        out['errors']['places'] = str(e)
        out['top'] = [dict(p, community=None) for p in TOP]
        out['day_trips'] = DAY_TRIPS
    out['months'] = [{'n': n, 'name': name, 'about': about, 'events': [{'name': a, 'what': b, 'url': c} for a, b, c in evs]} for n, name, about, evs in MONTHS]
    out['getting_around'] = [{'title': a, 'what': b, 'url': c} for a, b, c in GETTING_AROUND]
    out['facts'] = [{'title': a, 'what': b, 'url': c} for a, b, c in FACTS]
    out['stats'] = [{'n': a, 'what': b, 'source': c} for a, b, c in STATS]
    out['areas_about'] = [{'area': a, 'about': b} for a, b, _ in AREAS]
    out['sources'] = SOURCES
    out['checked'] = '2026-11-06'
    return out
