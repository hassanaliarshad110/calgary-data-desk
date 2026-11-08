"""The six Visit Calgary guides behind the tiles on calgaryinsight.ca/visit/: what each place offers, in plain words,
with the official page to check before going. Facts that change (dates, closures, passes) carry the month they were
checked; prices and opening hours are left to the official pages, which keep them current.

Each place: (photo key or None, name, where, what it offers, [good to know], [(link text, url)])."""

CHECKED = 'November 2026'

PAGES = [
 {'slug': 'downtown', 'tab': 'Downtown', 'hero': 'dt-hero', 'tile': 'tile-downtown',
  'title': 'Downtown Calgary', 'kicker': 'Tower, Core, Stephen Ave',
  'desc': 'What to see in downtown Calgary: the Calgary Tower, Stephen Avenue, the Central Library, Studio Bell, Devonian Gardens and Chinatown, with what each one offers and how to get around.',
  'intro': ['Downtown Calgary is small enough to cross on foot in half an hour. The Core and Stephen Avenue are the middle; East Village, '
            'with the library and Studio Bell, sits to the east by the Bow; Chinatown is on the river’s edge to the north.',
            'Two things make it easy. CTrain rides along 7 Avenue through downtown are free (the Free Fare Zone), and the +15, about 16 km of '
            'enclosed walkways one storey up, links the towers, so you can cross the Core in January without a coat.'],
  'glance': [('Walk across', '~30 min'), ('CTrain on 7 Ave', 'Free'), ('+15 skywalks', '~16 km'), ('Mountains from the Tower', 'On a clear day')],
  'places': [
   ('dt-tower', 'Calgary Tower', '101 9 Ave SW',
    'The city’s landmark since 1968. An elevator takes you to the observation deck, about 191 metres up, with a glass floor to stand on and a '
    'view that runs from the Saddledome to the Rockies on a clear day. SKY 360, the restaurant just below, turns a full circle as you eat.',
    ['Go at sunset: the mountains turn pink, then the city lights come on.', 'SKY 360 makes one full turn about every 45 minutes.',
     'Tickets are sold at the base; check the hours page before you go.'],
    [('Calgary Tower', 'https://www.calgarytower.com/')]),
   ('dt-stephen', 'Stephen Avenue', '8 Avenue SW, between 1 St SE and 4 St SW',
    'Calgary’s main street, a pedestrian mall lined with sandstone buildings from the 1890s to the 1910s, now a National Historic District. '
    'Restaurants, patios, The CORE shopping centre and the banks’ old halls, with street life from lunch into the evening.',
    ['The best walk to get your bearings: start at the Tower and head west.', 'Most of the big downtown restaurants are on or just off it.'],
    [('Calgary Downtown Association', 'https://www.downtowncalgary.com/')]),
   ('dt-library', 'Central Library', '800 3 St SE, East Village',
    'Opened in 2018 and built right over the CTrain line, which curves through under the building. Inside is a tall wooden atrium, quiet '
    'floors with views of the city, a huge children’s area and a café. It is free to walk in, and worth it for the building alone.',
    ['Free; you don’t need a library card to look around.', 'City Hall/Bow Valley College CTrain station is across the street.'],
    [('Calgary Public Library', 'https://calgarylibrary.ca/')]),
   ('dt-studiobell', 'Studio Bell, National Music Centre', '850 4 St SE, East Village',
    'A curving, terracotta-clad building that holds Canada’s national music collection: instruments, studios and stages over five floors, '
    'the Canadian Music Hall of Fame, and the Rolling Stones Mobile Studio. The historic King Eddy blues bar is part of the same block.',
    ['Plan two hours; there are instruments you are invited to play.', 'Tickets are timed; buy online on busy days.'],
    [('Studio Bell', 'https://www.studiobell.ca/')]),
   ('dt-devonian', 'Devonian Gardens', '4th floor, The CORE, 317 7 Ave SW',
    'A one-hectare indoor park on the top floor of a shopping centre: trees, ponds, a living wall and a playground under a glass roof. '
    'Warm and green in any weather, and a favourite stop with small children.',
    ['Free. It keeps the shopping centre’s hours.', 'Take the escalators up from Stephen Avenue.'],
    [('Devonian Gardens (City of Calgary)', 'https://www.calgary.ca/parks/devonian-gardens/info.html')]),
   ('dt-chinatown', 'Chinatown', 'Centre St and 2 Ave SW, by the Bow',
    'A few blocks of bakeries, dim sum halls, herbalists and grocers that have been here for more than a century. The Chinese Cultural Centre’s '
    'blue-tiled Hall of Prayer dome is the place to start; Sien Lok Park sits on the riverbank beside it.',
    ['Dim sum is busiest late morning at weekends.', 'Lunar New Year brings dragon dances to the streets.'],
    [('Calgary Chinese Cultural Centre', 'https://www.culturalcentre.ca/')]),
   ('dt-olympic', 'Olympic Plaza (rebuilding)', '228 8 Ave SE',
    'The square where medals were handed out at the 1988 Winter Olympics. It has been taken down and is being rebuilt as a new public plaza, '
    'due around 2028 with the expanded Werklund Centre next door. For now the theatres around it are open as usual.',
    [f'Checked {CHECKED}: the site is a construction zone.', 'The Werklund Centre (formerly Arts Commons) is the city’s big performing-arts centre.'],
    [('Olympic Plaza Transformation', 'https://www.calgary.ca/planning/projects/olympic-plaza-transformation.html')]),
  ],
  'plan': [('Getting around', 'Walk, or ride the CTrain free along 7 Avenue. Calgary Transit’s trip planner covers buses and trains city-wide.',
            'https://www.calgarytransit.com/'),
           ('Where to start', 'Visit Calgary, the city’s tourism office, keeps lists of what’s on this week.', 'https://www.visitcalgary.com/')]},

 {'slug': 'mountains', 'tab': 'The mountains', 'hero': 'mt-hero', 'tile': None,
  'title': 'The mountains', 'kicker': 'Banff, Canmore, Kananaskis',
  'desc': 'Day trips from Calgary to the Rockies: Lake Louise, Moraine Lake, Banff, the Banff Gondola, Canmore, Johnston Canyon, Kananaskis and Lake Minnewanka, with passes, shuttles and closures.',
  'intro': ['The Rockies start about an hour west of the city. Canmore is roughly 75 minutes up the Trans-Canada Highway, the Banff park gate a few '
            'minutes past it, and Lake Louise about two and a half hours from downtown. Kananaskis Country, to the south-west, is closer and quieter.',
            'Two passes cover almost everything. Banff National Park needs a Parks Canada pass for every day you stop in the park. Kananaskis and the '
            'Bow Valley provincial sites need an Alberta Kananaskis Conservation Pass ($15 a day or $90 a year per vehicle). In winter, check road '
            'conditions on 511 Alberta before you leave.'],
  'glance': [('To Canmore', '~75 min'), ('To Banff', '~90 min'), ('To Lake Louise', '~2.5 hr'), ('Kananaskis pass', '$15 / day')],
  'places': [
   ('mt-louise', 'Lake Louise', 'Banff National Park',
    'The turquoise lake under the Victoria Glacier, with the Fairmont Chateau at one end. Walk the flat lakeshore trail, rent a canoe in summer, '
    'or climb to the Lake Agnes Tea House. In winter the lake becomes a skating rink.',
    ['Parking is scarce. In season, Parks Canada shuttles run from the Lake Louise Park and Ride (reserve ahead).',
     'Roam Transit buses run from the town of Banff to Lake Louise all year.'],
    [('Parks Canada: getting to Lake Louise', 'https://parks.canada.ca/lakelouise-transit')]),
   (None, 'Moraine Lake', 'Banff National Park',
    'The lake in the photo at the top of this page: blue water under the Valley of the Ten Peaks. Climb the Rockpile beside the parking area for '
    'the classic view.',
    ['Moraine Lake Road is closed to personal vehicles all year. Go by Parks Canada shuttle, Roam’s connector, or a licensed tour.',
     f'Shuttles ran 1 June to 12 October in 2026 (checked {CHECKED}); the road is closed by snow in winter.'],
    [('Parks Canada: Moraine Lake shuttle', 'https://parks.canada.ca/lakelouise-transit')]),
   ('mt-banff', 'Banff town', 'Banff National Park',
    'A mountain town under Cascade Mountain, with Banff Avenue’s shops and restaurants, Bow Falls a short walk away, the Banff Upper Hot '
    'Springs, and the Cave and Basin, where Canada’s national parks began in 1885.',
    ['Park in the free train-station lot and walk in.', 'Roam buses link the town, the gondola, the hot springs and Lake Minnewanka.'],
    [('Banff & Lake Louise Tourism', 'https://www.banfflakelouise.com/'), ('Roam Transit', 'https://roamtransit.com/')]),
   ('mt-gondola', 'Banff Gondola', 'Sulphur Mountain, Banff',
    'An eight-minute ride up Sulphur Mountain to 2,281 metres, then a ridge-top boardwalk of about a kilometre to Sanson’s Peak and its old '
    'weather observatory. Six mountain ranges are in view from the top, and there are restaurants at the summit building.',
    ['It closes for about two weeks each November for maintenance.', 'Go early or late in summer; midday queues are long.'],
    [('Banff Gondola', 'https://www.banffjaspercollection.com/attractions/banff-gondola/')]),
   ('mt-canmore', 'Canmore', 'Bow Valley, outside the national park',
    'A real town at the foot of the Three Sisters, just outside the park, so you can stay or eat here without a park pass. Short hikes '
    '(Grassi Lakes is the favourite), the Canmore Nordic Centre built for the 1988 Olympics, and a relaxed main street.',
    ['The town itself needs no pass; trailheads around it often need the Kananaskis pass.', 'A good base when Banff hotels are full.'],
    [('Explore Canmore', 'https://www.explorecanmore.ca/')]),
   ('mt-johnston', 'Johnston Canyon', 'Bow Valley Parkway, Banff National Park',
    'Catwalks bolted to the canyon walls lead to the Lower Falls, about a kilometre in, and on to the taller Upper Falls. In winter the falls '
    'freeze and guided icewalks run.',
    [f'Closed from 13 October to 11 December 2026 for construction (checked {CHECKED}).', 'Arrive early: the lot fills by mid-morning in summer.'],
    [('Parks Canada: Banff bulletins', 'https://parks.canada.ca/pn-np/ab/banff/bulletins')]),
   ('mt-kananaskis', 'Kananaskis Country', 'South-west of Calgary, via Highway 40',
    'Four thousand square kilometres of provincial parks and mountains, about an hour from the city and usually quieter than Banff: lakes, '
    'long hikes, the Kananaskis Nordic Spa and some of Alberta’s best wildlife viewing.',
    ['Needs the Kananaskis Conservation Pass for parking ($15 a day, $90 a year per vehicle).', 'Highwood Pass on Highway 40 closes each winter, from December to mid-June.'],
    [('Kananaskis Conservation Pass', 'https://www.alberta.ca/kananaskis-conservation-pass'), ('Alberta Parks: Kananaskis', 'https://www.albertaparks.ca/')]),
   ('mt-minnewanka', 'Lake Minnewanka', 'Ten minutes from Banff town',
    'The largest lake in Banff National Park, about 21 km long, with summer boat cruises toward the Devil’s Gap and a short scenic loop '
    'past Two Jack Lake. Bighorn sheep are often on the road.',
    ['The cruise runs in the warmer months only.', 'Two Jack Lake at sunrise is one of the classic Banff photos.'],
    [('Lake Minnewanka Cruise', 'https://www.banffjaspercollection.com/attractions/lake-minnewanka-cruise/')]),
  ],
  'plan': [('Park pass', 'A Parks Canada day pass, or the Discovery Pass for a year, covers Banff and every other national park.', 'https://parks.canada.ca/voyage-travel/admission'),
           ('Road conditions', 'Snow can arrive in any month. 511 Alberta shows closures and cameras.', 'https://511.alberta.ca/')]},

 {'slug': 'stampede', 'tab': 'Stampede', 'hero': 'st-hero', 'tile': None,
  'title': 'The Calgary Stampede', 'kicker': 'Ten days every July',
  'desc': 'A visitor’s guide to the Calgary Stampede: 2027 and 2028 dates, the parade, rodeo, chuckwagon races, Grandstand Show, Elbow River Camp, midway and pancake breakfasts.',
  'intro': ['Every July the whole city dresses western for ten days. The Stampede has run since 1912; it fills Stampede Park beside downtown with a '
            'rodeo, chuckwagon races, a midway and concerts, and spills into the streets with free pancake breakfasts and the parade.',
            'Next dates: 9 to 18 July 2027, and 7 to 16 July 2028. Hotels fill months ahead, so book the room before the tickets.'],
  'glance': [('2027', '9–18 July'), ('2028', '7–16 July'), ('Since', '1912'), ('Dress code', 'Hat and boots')],
  'places': [
   ('st-parade', 'The Parade', 'Downtown, opening Friday morning',
    'The Stampede begins with a parade through downtown on the first Friday morning: marching bands, floats, hundreds of horses and the Treaty 7 '
    'Nations in full regalia. Free to watch from the curb.',
    ['Arrive early for a curb spot; people set up hours before.', 'Reserved grandstand seats along the route are sold too.'],
    [('Calgary Stampede: Parade', 'https://www.calgarystampede.com/stampede/parade')]),
   ('st-bronc', 'The Rodeo', 'Grandstand infield, every afternoon',
    'One of the richest rodeos in the world. Bareback and saddle bronc, bull riding, tie-down roping, steer wrestling and barrel racing, with '
    'the top cowboys and cowgirls competing for big prize money through the ten days.',
    ['The last weekend is Showdown Sunday, with the biggest purse.', 'Seats on the shady side are worth asking for in July heat.'],
    [('Stampede tickets', 'https://www.calgarystampede.com/')]),
   ('st-chuck', 'Rangeland Derby', 'Grandstand, every evening',
    'The chuckwagon races: four wagons and their outriders tearing around the track in a figure eight and then a half-mile dash. Loud, fast '
    'and nothing else like it.',
    ['The same evening ticket includes the Grandstand Show.'], []),
   ('st-grandstand', 'Grandstand Show', 'Grandstand stage, after the races',
    'A full stage spectacular of singers, dancers and acrobats, rolled onto the track on a mobile stage after the chuckwagons, ending with '
    'fireworks over Stampede Park.',
    ['Fireworks can also be seen from the hills around the park, such as Scotsman’s Hill.'], []),
   ('st-elbowcamp', 'Elbow River Camp', 'Stampede Park, by the Elbow River',
    'The camp of the Treaty 7 Nations (Siksika, Kainai, Piikani, Tsuut’ina and Stoney Nakoda), part of the Stampede since the first one '
    'in 1912. Painted tipis, dance competitions, artisans, and bannock and other food to try.',
    ['Free with park admission.', 'Ask before photographing people.'], []),
   ('st-midway', 'The Midway', 'Stampede Park',
    'Rides, games and the famous fair food: mini doughnuts and whatever new deep-fried idea is on the menu this year. Concerts run '
    'every night at Nashville North and on the outdoor stages.',
    ['Evenings are busiest; weekday mornings are calmest.'], []),
   ('st-breakfast', 'Pancake breakfasts', 'All over the city',
    'For ten days, malls, churches, companies and community centres serve free pancakes, often with live music and line dancing. It is the '
    'friendliest part of the Stampede and costs nothing.',
    ['Local news sites publish a list of the free breakfasts each July.'], []),
   ('st-park', 'Stampede Park all year', 'Beside downtown, by the Elbow',
    'The grounds hold events the rest of the year too: the BMO Centre (much enlarged in 2024) for shows and conventions, the Saddledome for '
    'the Flames, and the Grandstand for concerts. The Victoria Park/Stampede CTrain station is at the gate.',
    ['Take the CTrain in July; parking is limited and expensive.'], [('Calgary Stampede', 'https://www.calgarystampede.com/')]),
  ],
  'plan': [('Dates and tickets', 'The Stampede’s own site has the schedule, ticket packages and park admission.', 'https://www.calgarystampede.com/'),
           ('Getting there', 'Ride the CTrain to Victoria Park/Stampede station.', 'https://www.calgarytransit.com/')]},

 {'slug': 'river', 'tab': 'River & pathways', 'hero': 'rv-hero', 'tile': 'tile-river',
  'title': 'River & pathways', 'kicker': 'Bow, Elbow, 1,000 km of trails',
  'desc': 'Calgary’s rivers and pathways for visitors: the Peace Bridge, Prince’s and St. Patrick’s Islands, Edworthy Park, Fish Creek, Nose Hill and floating the Bow safely.',
  'intro': ['Calgary began where the Bow and the Elbow meet, at Fort Calgary in 1875, and the rivers still run through the middle of the city. '
            'Along them runs the pathway network: about 1,000 km of paved regional pathways and almost 100 km of trails, by the City’s count.',
            'You can walk or cycle from downtown to wild-feeling parks without crossing a road. In summer, half the city is on the river in a raft; '
            'by Calgary bylaw everyone on board needs a life jacket.'],
  'glance': [('Pathways', '~1,000 km'), ('Trails', '~96 km'), ('Life jackets', 'Required by bylaw'), ('Rivers', 'Bow and Elbow')],
  'places': [
   ('rv-peace-night', 'Peace Bridge', 'Downtown to Sunnyside',
    'The red, tube-shaped footbridge by Santiago Calatrava, opened in 2012, carries walkers and cyclists across the Bow from downtown to '
    'Sunnyside and Kensington. It is best after dark, when it is lit from inside.',
    ['Walk across, then follow the river west to Kensington for coffee.'], []),
   ('rv-princes', 'Prince’s Island Park', 'Beside downtown, on the Bow',
    'An island park a few steps from the office towers: lawns, lagoons, a café by the water, and the main stage for the Calgary Folk '
    'Music Festival and Shakespeare by the Bow in summer.',
    ['Reach it by footbridge from Eau Claire.', 'Bring a picnic on a summer evening.'],
    [('Calgary Folk Fest', 'https://www.calgaryfolkfest.com/')]),
   ('rv-stpatricks', 'St. Patrick’s Island', 'East Village',
    'An island park reopened in 2015 with a hill to sit on, a pebble beach on a quiet river channel and playgrounds, reached by the George C. '
    'King Bridge with its leaning arches.',
    ['Pair it with the Central Library and Studio Bell next door.'], []),
   ('rv-pathway', 'Bow River pathway', 'Through the city',
    'The spine of the network, following the Bow across the city. Rent an e-bike or e-scooter through the apps in season, or walk the '
    'stretch between the Peace Bridge and East Village for the best of the river.',
    ['Pathways are shared: keep right and ring before you pass.'], [('City pathway map', 'https://www.calgary.ca/pathways')]),
   ('rv-edworthy', 'Edworthy Park and the Douglas Fir Trail', 'West Calgary, on the Bow',
    'Riverside picnic meadows, Lawrey Gardens, and a trail that climbs through a stand of old Douglas fir on the escarpment, a rare forest '
    'this far east of the mountains.',
    ['The Douglas Fir Trail has stairs and steep sections.'], []),
   ('rv-fishcreek', 'Fish Creek Provincial Park', 'South Calgary',
    'One of the largest urban parks in Canada, over 13 square kilometres along Fish Creek to the Bow: aspen and spruce woods, the historic '
    'Bow Valley Ranch, and deer, owls and beavers close to the suburbs.',
    ['Free to visit; it is a provincial park inside the city.'], [('Alberta Parks: Fish Creek', 'https://www.albertaparks.ca/parks/kananaskis/fish-creek-pp/')]),
   ('rv-nosehill', 'Nose Hill Park', 'North Calgary',
    'About 11 square kilometres of native grassland on a hill above the city. The wind, the sky and the whole Rocky Mountain front on the '
    'western horizon on a clear day.',
    ['There is no shade: bring water and a hat in summer.'], [('Nose Hill Park (City of Calgary)', 'https://www.calgary.ca/parks/nose-hill-park.html')]),
   ('rv-float', 'Floating the Bow', 'From designated river access sites',
    'A summer raft trip through the city is a Calgary rite. Launch only from the City’s designated river access sites, plan your exit and '
    'a ride back before you start, and check the flow first: the river is cold and fast.',
    ['Life jackets are required by bylaw for everyone on board (fines up to $500).', 'Alcohol and drugs are not allowed on Calgary waterways.',
     'Less experienced rafters should leave the river before Harvie Passage.'],
    [('City of Calgary: river floating', 'https://www.calgary.ca/safety/river-floating.html'), ('Alberta river flows', 'https://rivers.alberta.ca/')]),
  ],
  'plan': [('Pathway map', 'The City’s pathway and bikeway map shows every route, washroom and closure.', 'https://www.calgary.ca/pathways'),
           ('Water safety', 'River advisories and the River Access map before you float.', 'https://www.calgary.ca/safety/river-floating.html')]},

 {'slug': 'eat', 'tab': 'Eat & drink', 'hero': 'ea-hero', 'tile': 'tile-eat',
  'title': 'Eat & drink', 'kicker': 'Kensington to Inglewood',
  'desc': 'Where to eat and drink in Calgary: the Calgary Farmers’ Market, Kensington, Inglewood, 17 Avenue, the Barley Belt breweries, Stephen Avenue and Chinatown, plus the dishes Calgary invented.',
  'intro': ['Alberta beef is the obvious order, and it is very good. But Calgary also gave the world two of its own: the Caesar cocktail, mixed '
            'at the Calgary Inn in 1969, and ginger beef, which the Silver Inn says it created in the 1970s.',
            'Each neighbourhood below has its own style, from market stalls and brunch to dim sum and taprooms.'],
  'glance': [('Invented here', 'The Caesar'), ('Also invented here', 'Ginger beef'), ('Market days', 'Wed–Sun'), ('Patio season', 'May–Sept')],
  'places': [
   ('tile-eat', 'Calgary Farmers’ Market', 'South: 510 77 Ave SE · West: 25 Greenbriar Dr NW',
    'Two big indoor markets of local growers, bakers, butchers and food stalls. Come hungry: it is as much a place for breakfast and lunch '
    'as for shopping.',
    ['South is open Thursday to Sunday, 9 to 5.', 'West is open Wednesday to Saturday 9 to 7, and Sunday 9 to 5.'],
    [('Calgary Farmers’ Market', 'https://www.calgaryfarmersmarket.ca/')]),
   ('ea-kensington', 'Kensington', 'Kensington Rd and 10 St NW',
    'A village-like street across the river from downtown: independent cafés, bakeries, bookshops and the Plaza Theatre, an old '
    'single-screen cinema. Walk over the Peace Bridge to get there.',
    ['Sunnyside CTrain station is a block away.'], []),
   ('ea-inglewood', 'Inglewood', '9 Avenue SE',
    'One of Calgary’s oldest neighbourhoods, with a main street of brick storefronts: restaurants, record shops, vintage and antiques, '
    'and live music at night. The Calgary Zoo is across the river.',
    ['Good for a slow afternoon of browsing, then dinner.'], []),
   ('ea-17ave', '17 Avenue SW', 'Beltline and Mission',
    'Calgary’s busiest strip for bars, patios and late dinners. When the Flames went to the Stanley Cup Final in 2004, fans packed it so '
    'tightly it earned the name the Red Mile.',
    ['Busiest on Friday and Saturday nights and Flames playoff nights.'], [('17th Ave District', 'https://17thave.ca/')]),
   ('ea-brewery', 'The Barley Belt', 'Manchester, Inglewood and beyond',
    'Calgary has dozens of craft breweries, many in old industrial bays south and east of downtown, with taprooms that welcome families '
    'in the day. A brewery crawl by bike or cab is a popular Saturday.',
    ['Many taprooms have food trucks rather than kitchens.'], [('Visit Calgary: craft breweries', 'https://www.visitcalgary.com/plan-and-stay/itineraries-and-travel-inspiration/breweries')]),
   ('ea-stephen', 'Stephen Avenue at night', 'Downtown, 8 Avenue SW',
    'The downtown pedestrian mall is the city’s fine-dining row, with steakhouses and chef-run restaurants in historic sandstone '
    'buildings and patios in summer.',
    ['Book ahead on weekends and during the Stampede.'], []),
   ('ea-chinatown', 'Chinatown', 'Centre St and 2 Ave SW',
    'Dim sum, Cantonese barbecue, bubble tea and bakeries, and the best place to try ginger beef in the city where it was born.',
    ['Weekend dim sum is a local ritual; expect a short wait.'], []),
  ],
  'plan': [('What’s new', 'Visit Calgary keeps food guides and the city’s restaurant festivals.', 'https://www.visitcalgary.com/'),
           ('Getting home', 'Plan the ride back with Calgary Transit\u2019s trip planner.', 'https://www.calgarytransit.com/')]},

 {'slug': 'after-dark', 'tab': 'After dark', 'hero': 'ad-hero', 'tile': None,
  'title': 'Calgary after dark', 'kicker': 'Music, hockey, patios',
  'desc': 'Calgary at night: the Flames’ last season at the Saddledome, the Stampeders at McMahon, the Werklund Centre, the Folk Festival, live music and the Calgary Tower lit up.',
  'intro': ['Calgary nights are hockey in winter, patios and festivals in summer, and live music all year. 2026–27 is the Flames’ last '
            'season in the Saddledome, the saddle-shaped arena opened in 1983, before they move next door to Scotia Place.',
            'Most of it is within a CTrain ride of downtown, and the trains run late.'],
  'glance': [('Flames', 'Last Saddledome season'), ('Folk Fest', 'Late July'), ('Stampeders', 'Summer to fall'), ('Arena next door', 'Scotia Place, 2027')],
  'places': [
   ('ad-flames', 'Flames at the Saddledome', 'Stampede Park',
    'An NHL game in the Saddledome is the loudest night in the city, and this is the last season to see one there: Scotia Place, the new '
    'arena beside it, is due for the 2027–28 season.',
    [f'Checked {CHECKED}.', 'Ride the CTrain to Victoria Park/Stampede station.'],
    [('Calgary Flames', 'https://www.nhl.com/flames/')]),
   ('ad-mcmahon', 'Stampeders at McMahon Stadium', 'University district, NW',
    'CFL football from early summer into the fall, in the stadium that hosted the opening of the 1988 Winter Olympics. Tailgating and '
    'cowboy hats in the stands.',
    ['Banff Trail CTrain station is next to the stadium.'], [('Calgary Stampeders', 'https://www.stampeders.com/')]),
   ('ad-arts', 'Werklund Centre', '205 8 Ave SE, downtown',
    'The city’s performing-arts centre, renamed from Arts Commons in 2024. The Calgary Philharmonic plays the Jack Singer Concert Hall; '
    'theatre companies, comedy and touring shows fill the other stages.',
    ['Its expansion and the new Olympic Plaza next door are under construction.'], [('Werklund Centre', 'https://werklundcentre.ca/')]),
   ('ad-folk', 'Calgary Folk Music Festival', 'Prince’s Island Park, late July',
    'Four days of music on stages around Prince’s Island: folk in the widest sense, from roots to indie to music from around the world, '
    'with the downtown towers lit up behind the main stage.',
    ['Bring a tarp: the lawn in front of the main stage fills at opening.'], [('Calgary Folk Fest', 'https://www.calgaryfolkfest.com/')]),
   ('ad-tower', 'The Tower at night', 'Downtown',
    'The Calgary Tower is lit in changing colours after dark, and from the observation deck the grid of the city lights up to the edge of the '
    'prairie. Dinner at SKY 360 turns a slow circle above it.',
    ['Check the hours page; the deck stays open into the evening.'], [('Calgary Tower', 'https://www.calgarytower.com/')]),
   (None, 'Live music and late nights', 'All over the city',
    'The King Eddy at Studio Bell for blues and roots, bars on 17 Avenue and in Inglewood for local bands, and the Stampede’s Nashville '
    'North tent for country every July.',
    ['Visit Calgary lists this week’s shows.'], [('What’s on', 'https://www.visitcalgary.com/')]),
  ],
  'plan': [('Tonight', 'See what’s on in the city this week.', 'https://www.visitcalgary.com/'),
           ('Getting home', 'CTrain and night buses; plan your trip home before you go.', 'https://www.calgarytransit.com/')]},
]

# every outside link on the pages, for the link check (visit_pages.links())
