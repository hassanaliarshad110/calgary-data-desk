# Calgary Origins Ep 3 - "Boom and Bust: Calgary's 1912 Land Rush and the 1913 Crash"
# One entry per narration line = one scene. v = visual spec read by scene.js. claims = claims-table ids.
SLUG = 'boom-and-bust'
TITLE = "Boom and Bust: The Land Rush That Drew Calgary's Map"
CH_TITLES = {1: 'A City in a Hurry', 2: 'Selling the Prairie', 3: 'The Crash', 4: 'The Map That Waited'}

L = []
def line(ch, text, v, claims=(), gap=None, ai=''):
    L.append(dict(ch=ch, text=text, v=v, claims=list(claims), gap=gap, ai=ai))

# ---------------- CHAPTER 1 · A City in a Hurry ----------------
line(1, "In nineteen twelve, someone paid five hundred dollars for an empty lot in north Calgary.",
     dict(kind='hook', bg='land', tod='dawn', stake=True, hook='$500 for an empty lot', hi=['$500'], chip='1912'),
     ['C1'], ai='Low dawn drone over a windswept, empty prairie field; a wooden survey stake with a red "SOLD" tag slams into the ground in the foreground; grass whipping. One continuous push-in, 3 s.')
line(1, "That owner paid taxes on it for four decades. When it finally sold, in nineteen fifty-five, it went for four hundred.",
     dict(kind='price', a=500, b=400, ya='1912', yb='1955', la='PAID', lb='SOLD', src='Max Foran, Expansive Discourses (AU Press, 2009), ch. 1'),
     ['C1'], ai='Split screen: the same empty field in 1912 sepia and 1955 colour, a price tag flips from $500 to $400; calendar pages fly between them. 6 s.')
line(1, "How did Calgary get sold that far ahead of itself? This is Calgary Origins, episode three. Boom and bust.",
     dict(kind='chapter', bg='town', tod='day'),
     [], ai='Wide painted 1912 sandstone main street, scaffolding on half the buildings, title space in the sky. 4 s.')
line(1, "In nineteen oh one, Calgary had only about four thousand people.",
     dict(kind='land', tod='day', village=True, lower='About 4,000 people', sub='1901', chip='1901'),
     ['C2'], ai='A small prairie town of low wooden buildings by a river, mountains on the horizon, a few wagons; slow lateral dolly. 4 s.')
line(1, "Ten years later, the census counted nearly forty-four thousand.",
     dict(kind='stats', items=[['43,704', 'PEOPLE · 1911 CENSUS']], src='Canada Year Book (Dominion Bureau of Statistics), principal cities: 43,704 in 1911', bg='town'),
     ['C3'], ai='Counter rolls up over a growing town skyline. 4 s.')
line(1, "That's nearly ten times as many people, in a single decade.",
     dict(kind='stats', items=[['×10', 'NEARLY · 1901 → 1911 · WITHIN EACH YEAR’S CITY LIMITS']], src='Canada Year Book: 4,392 (1901), 43,704 (1911)', bg='town'),
     ['C4'], ai='Ten small town silhouettes multiply across the horizon. 4 s.')
line(1, "What drove it? Farming, first of all. The opening of southern Alberta to cash crops brought rapid growth to Calgary.",
     dict(kind='land', tod='autumn', farms=True, train=False, lower='Cash-crop farming', sub='southern Alberta'),
     ['C5'], ai='Golden wheat fields to the horizon, a farmstead, wind rippling the crop; crane rising. 5 s.')
line(1, "Railways stretched out in all directions, and Calgary became the region's prime distributing centre.",
     dict(kind='land', tod='day', train=True, rails=True, lower='Rails in all directions'),
     ['C6'], ai='A steam train crosses the prairie right to left toward a distant town, smoke trailing; tracking shot. 5 s.')
line(1, "By nineteen fourteen, prairie settlement had pushed far to the northwest, drawing migrants from many lands.",
     dict(kind='arrivals', src='The Canadian Encyclopedia · Economic history of Western Canada', origins=['Many lands'], hub='THE PRAIRIES'),
     ['C7'], ai='Stylised map arcs from eastern Canada, Britain and Asia converging on the Canadian West. 6 s.')
line(1, "All those people needed places to live and work. So Calgary built.",
     dict(kind='town', tod='day', rise=True, lower='So Calgary built'),
     [], ai='Time-lapse of sandstone buildings rising floor by floor on a 1912 street, derricks swinging. 4 s.')
line(1, "In nineteen ten, the value of building permits was nearly five point six million dollars.",
     dict(kind='bars', show=1, src='Value of building permits · P. Chastko, The Boom (Univ. of Calgary Press), table 2-1, from the Calgary Herald, Oct 20, 1916'),
     ['C8'], ai='Bar chart: a single gold bar labelled 1910 grows from zero over a blueprint grid. 5 s.')
line(1, "In nineteen eleven, almost thirteen million.",
     dict(kind='bars', show=2, src='Value of building permits · P. Chastko, The Boom (Univ. of Calgary Press), table 2-1, from the Calgary Herald, Oct 20, 1916'),
     ['C8'], ai='Second bar shoots up past the first. 3 s.')
line(1, "In nineteen twelve, more than twenty million dollars: a record.",
     dict(kind='bars', show=3, record=True, src='Value of building permits · P. Chastko, The Boom (Univ. of Calgary Press), table 2-1, from the Calgary Herald, Oct 20, 1916'),
     ['C8', 'C9'], ai='Third bar towers over the others, a RECORD stamp lands. 4 s.')
line(1, "The Grain Exchange, from nineteen ten, is remembered as Calgary's first skyscraper.",
     dict(kind='town', tod='day', hero='grain', lower='Grain Exchange', sub="1910 · Calgary's first skyscraper"),
     ['C10'], ai='Low angle crane-up a six-storey sandstone office block against a blue sky, 1910 street life below. 5 s.')
line(1, "City Hall, one of the biggest building projects in town, went up between nineteen oh seven and nineteen eleven.",
     dict(kind='town', tod='day', hero='cityhall', lower='City Hall', sub='built 1907–1911'),
     ['C11'], ai='A sandstone city hall with a clock tower; scaffolding dissolves away as the tower completes. 6 s.')
line(1, "In nineteen twelve, the Lougheed Building was completed, with a fifteen-hundred-seat theatre inside: the Sherman Grand.",
     dict(kind='town', tod='dusk', hero='lougheed', marquee='SHERMAN GRAND', lower='Lougheed Building', sub='1912 · 1,500-seat Sherman Grand theatre'),
     ['C12'], ai='Dusk: an L-shaped six-storey brick office block, a theatre marquee lighting up, people arriving. 6 s.')
line(1, "The same year, the Memorial Park Library opened: the first public library building in Alberta.",
     dict(kind='town', tod='day', hero='library', lower='Memorial Park Library', sub='1912 · first public library building in Alberta'),
     ['C13'], ai='A sandstone classical library in a park, columns and a dome, trees in leaf; slow push. 5 s.')
line(1, "The Hudson's Bay Company store opened in nineteen thirteen, and the Canadian Pacific Railway was building a grand hotel, the Palliser, from nineteen eleven to nineteen fourteen.",
     dict(kind='timeline', from_=1906, to=1915, events=[[1910, 'Grain Exchange'], [1911, 'City Hall'], [1912, 'Lougheed Bldg · Library'], [1913, 'Hudson’s Bay store'], [1914, 'Palliser Hotel']], src='Historic Downtown Calgary (City of Calgary) · historicplaces.ca · DCB'),
     ['C10', 'C11', 'C12', 'C13', 'C14', 'C15'], ai='Timeline over a dusk skyline: building silhouettes pop up at 1910, 1911, 1912, 1913 and 1914. 8 s.')
line(1, "Many of those buildings still stand downtown today.",
     dict(kind='city', shot='stephen', tod='dusk', lower='Still standing', sub='downtown Calgary today'),
     ['C16'], ai='Dusk drone orbit over today\'s downtown Calgary, old sandstone blocks among glass towers, warm windows. 4 s.')
line(1, "Library, Bay or Palliser: which one have you been inside? Drop your thoughts below.",
     dict(kind='question', q='Library, Bay or Palliser?', hi=['Palliser?'], sub='Which one have you been inside?', tod='dusk', bg='town'),
     [], gap=1.2, ai='Hold on the dusk street, the question in large type. 4 s.')

# ---------------- CHAPTER 2 · Selling the Prairie ----------------
line(2, "Some Calgary suburbs were sold before they were ever built, and at least one never was.",
     dict(kind='hook', bg='plat', hook='A suburb on paper', hi=['paper'], chip='1909–1913'),
     ['C17', 'C18'], ai='Top-down: a blueprint grid of streets and lots draws itself over bare prairie, lots flash SOLD, then the grid fades back to grass. 4 s.')
line(2, "During the boom, speculators bought farmland outside the city limits and registered subdivision plans.",
     dict(kind='plat', tod='day', draw=True, lower='Farmland → subdivision plans'),
     ['C19'], ai='Prairie farm field; surveyors\' stakes and string lines spread across it in a grid. 5 s.')
line(2, "Agents advertised lots up to about eight kilometres from the central post office.",
     dict(kind='citymap', ring=8000, pins=['po'], lower='Up to about 8 km out', sub='converted from “up to five miles”'),
     ['C20'], ai='Map of Calgary: a ring expands from downtown to 8 km. 5 s.')
line(2, "They asked between fifty and three hundred dollars a lot.",
     dict(kind='stats', items=[['$50–$300', 'ASKING PRICE PER LOT · BOOM-ERA ADS']], src='Parkdale Community Heritage Inventory, City of Calgary, 2008', bg='plat'),
     ['C21'], ai='Price tags flip over a grid of lots. 4 s.')
line(2, "Heritage Calgary describes numerous dealers buying up land for resale all around the city.",
     dict(kind='doc', title='Heritage Calgary · Historian in Residence', quote='Numerous dealers were buying up land for resale all around the city.', src='Kay Burns (2023 Historian in Residence), Heritage Calgary blog'),
     ['C22'], ai='Archive-style newspaper ad page, columns of LOTS FOR SALE ads; a line highlighted. 5 s.')
line(2, "The biggest name was Fred Lowes. Historian Max Foran calls him Calgary's most important real estate entrepreneur of the boom years.",
     dict(kind='name', name='Fred C. Lowes', role='Real estate developer', sub2='“most important real estate entrepreneur” of 1909–1912 (Foran)', bg='town', tod='day', hat='bowler'),
     ['C23'], ai='Silhouette of a man in a three-piece suit and bowler hat on a boom-town street (no likeness). 6 s.')
line(2, "He came to Calgary in nineteen oh two, and set up his own development firm in nineteen oh six.",
     dict(kind='timeline', from_=1900, to=1914, events=[[1902, 'Arrives in Calgary'], [1906, 'Own firm']], src='University of Calgary Archives, Fred Charles Lowes fonds'),
     ['C24'], ai='Timeline 1900-1914 with two markers lighting up. 5 s.')
line(2, "His company had offices in Edmonton, Lethbridge, Medicine Hat, and even London, England.",
     dict(kind='offices', src='R. Stevens, “Bird’s-Eye Views of Alberta’s Land Boom of the 1910s”, ACMLA Bulletin, 2020', cities=['Calgary', 'Edmonton', 'Lethbridge', 'Medicine Hat', 'London, England']),
     ['C25'], ai='Office pins pop up across Alberta, then a long arc jumps across the Atlantic to London. 6 s.')
line(2, "In nineteen eleven, the Canadian Pacific Railway laid out South Mount Royal as an exclusive neighbourhood of single-family homes.",
     dict(kind='citymap', comms=['UPPER MOUNT ROYAL'], focus='UPPER MOUNT ROYAL', chip='1911', lower='South Mount Royal', sub='1911 · laid out by the CPR · outline: Upper Mount Royal today'),
     ['C26'], ai='Map dives to Mount Royal; the community outline glows. 6 s.')
line(2, "The northeast part of Upper Mount Royal drew a number of American-born entrepreneurs and speculators, and it became known as American Hill.",
     dict(kind='land', tod='day', hillhouses=True, lower='“American Hill”', sub='northeast Upper Mount Royal'),
     ['C26'], ai='Grand early-1900s houses dot a bare hillside, flags of new money, lots between them still empty. 5 s.')
line(2, "Far to the northwest, John Hextall registered subdivision plans for Bowness in nineteen eleven.",
     dict(kind='citymap', comms=['BOWNESS'], focus='BOWNESS', chip='1911', lower='Bowness', sub='plans registered by John Hextall'),
     ['C27'], ai='Map flies northwest along the Bow River to Bowness; the community lights up. 5 s.')
line(2, "In Elbow Park, serious building began in nineteen eleven, near the height of the boom.",
     dict(kind='citymap', comms=['ELBOW PARK'], focus='ELBOW PARK', chip='1911', lower='Elbow Park'),
     ['C28'], ai='Map swings south along the Elbow River to Elbow Park. 4 s.')
line(2, "And in nineteen ten, the City annexed a vast area on all sides. Its western edge moved out to Thirty-seventh Street.",
     dict(kind='citymap', limits=True, chip='1910', lower='A vast annexation', sub='approximate 1910 limits'),
     ['C29', 'C30'], ai='Map: a rectangle of new city limits expands outward from the small old town. 6 s.')
line(2, "In the northwest, that line held until nineteen sixty-three. In the southwest, until nineteen fifty-four.",
     dict(kind='citymap', limits=True, west=True, chip='1910 → 1954 / 1963', lower='West edge: 37 Street', sub='NW: until 1963 · SW: until 1954'),
     ['C30'], ai='The western edge of the rectangle pulses gold while a counter runs from 1910 to 1963. 3 s.')
line(2, "Then there was Lake View Heights. In May nineteen twelve, its ads promised: we do guarantee to complete by October first, nineteen thirteen.",
     dict(kind='doc', title='Lake View Heights · newspaper advertisement, May 1912', quote='We do guarantee to complete by October 1, 1913.', src='Quoted in Heritage Calgary blog, “Speculative Subdivisions in Early Calgary” (Historian in Residence K. Burns, 2023)'),
     ['C31'], ai='A 1912 newspaper real-estate ad with ornate type; the guarantee line highlighted gold. 7 s.')
line(2, "It appears on a city map engraved in nineteen twelve. Heritage Calgary calls it an imaginary suburb, existing only on maps, never built.",
     dict(kind='plat', tod='dusk', ghost=True, lower='Lake View Heights', sub='“existing only on maps”'),
     ['C31'], ai='An engraved 1912 map of a street grid on prairie; the grid flickers and fades like a ghost. 6 s.')
line(2, "Today, that land is a golf course.",
     dict(kind='land', tod='day', golf=True, lower='Today: a golf course'),
     ['C32'], ai='Gentle drone over a green golf course fairway, flag fluttering. 3 s.')
line(2, "Would you have bought a lot out on the open prairie? Yes or no? Drop your thoughts below.",
     dict(kind='question', q='Buy a lot on the open prairie?', hi=['prairie?'], sub='Yes or no?', tod='dusk'),
     [], gap=1.2, ai='Hold on dusk prairie with a lone stake, the question in large type. 4 s.')

# ---------------- CHAPTER 3 · The Crash ----------------
line(3, "By the end of nineteen thirteen, every one of downtown's four hundred real estate offices had shut.",
     dict(kind='hook', bg='office', hook='400 offices. All shut.', hi=['shut.'], chip='LATE 1913'),
     ['C33'], ai='Night, a 1913 downtown street: office windows with gilt REAL ESTATE lettering switch off one by one; CLOSED signs flip. 4 s.')
line(3, "How did a record year turn into that?",
     dict(kind='bars', show=3, record=True, crack=True, src='Value of building permits · P. Chastko, The Boom, table 2-1'),
     ['C8'], ai='The record 1912 bar trembles and a crack runs through it. 3 s.')
line(3, "Alberta's land boom peaked in nineteen twelve, and went bust in nineteen thirteen.",
     dict(kind='timeline', from_=1908, to=1916, events=[[1912, 'Peak'], [1913, 'Bust']], curve=True, src='R. Stevens, ACMLA Bulletin no. 164, 2020'),
     ['C34'], ai='Timeline with a rising curve that peaks at 1912 and plunges at 1913. 5 s.')
line(3, "Historian Paul Chastko points to events far away. The Balkan Wars disrupted Britain, and sharply cut British investment in Canada.",
     dict(kind='world', src='P. Chastko, The Boom (Univ. of Calgary Press), ch. 2', chip='INTERPRETATION', lower='Money dries up', sub='Balkan Wars, 1912–13'),
     ['C35'], ai='Stylised map: a thick gold stream of money arcs from London to Western Canada, then thins to a trickle. 7 s.')
line(3, "Chastko writes that this dealt a heavy blow to Calgary investors in construction and real estate.",
     dict(kind='town', tod='storm', stalled=True, lower='A heavy blow', chip='INTERPRETATION'),
     ['C35'], ai='A half-built sandstone block, scaffolding bare, rain beginning; no workers. 4 s.')
line(3, "Work on the great transcontinental railway projects was ending too, throwing thousands of labourers out of work.",
     dict(kind='land', tod='dusk', train=True, idle=True, lower='Railway building ends', sub='thousands of labourers out of work'),
     ['C36'], ai='Grey sky over a finished rail line; a work train stands idle, tools abandoned by the track. 6 s.')
line(3, "In nineteen thirteen, the value of building permits fell to less than half of the year before.",
     dict(kind='bars', show=3, fall=True, src='Value of building permits · P. Chastko, The Boom, table 2-1 and p. 62 (1913: $3.6M in the table, $8.6M in the text)'),
     ['C8', 'C37'], ai='The record bar collapses; a fourth bar labelled 1913 drops below half the height, a red arrow plunges. 5 s.')
line(3, "The number of permits fell too, from three thousand, three hundred and forty-eight to two thousand and seventy-eight.",
     dict(kind='stats', items=[['3,348', 'PERMITS · 1912'], ['2,078', 'PERMITS · 1913']], src='Heritage Calgary blog, “Speculative Subdivisions in Early Calgary” (Historian in Residence K. Burns, 2023), citing the Calgary Herald, Sept 12, 1929', bg='town'),
     ['C38'], ai='Two counters slam in, the second smaller, red. 6 s.')
line(3, "House prices began to fall.",
     dict(kind='town', tod='storm', forsale=True, lower='House prices fall'),
     ['C39'], ai='A row of new houses with FOR SALE signs swinging in the wind. 3 s.')
line(3, "By December nineteen thirteen, one in ten Calgarians was out of work: about two thousand tradesmen, and three thousand unskilled labourers.",
     dict(kind='stats', items=[['1 in 10', 'CALGARIANS OUT OF WORK · DEC 1913'], ['2,000 + 3,000', 'TRADESMEN + LABOURERS']], src='P. Chastko, The Boom (Univ. of Calgary Press), ch. 2, p. 63', bg='storm'),
     ['C40'], ai='Rows of worker silhouettes, one in every ten lit red. 8 s.')
line(3, "Chastko writes that all four hundred real estate concerns in downtown Calgary sat closed and shuttered.",
     dict(kind='doc', title='Paul Chastko · The Boom, ch. 2', quote='All 400 real estate concerns in downtown Calgary sat closed and shuttered.', src='University of Calgary Press · p. 63'),
     ['C33'], ai='Close on a book page, the line highlighted. 6 s.')
line(3, "Then, in May nineteen fourteen, came a strange second wave. At Turner Valley, the Dingman well struck wet natural gas.",
     dict(kind='oil', tod='day', chip='MAY 14, 1914', lower='Dingman No. 1', sub='Turner Valley'),
     ['C41'], ai='Foothills valley, a wooden drilling derrick; a plume of gas and spray bursts from the top, crowd cheering. 7 s.')
line(3, "Oil fever swept Calgary. More than five hundred oil companies were started, most of them, says Alberta's energy history, ill-founded.",
     dict(kind='stats', items=[['500+', 'OIL COMPANIES STARTED · AFTER MAY 1914']], src='Alberta’s Energy Heritage (Government of Alberta), Dingman era 1914–1923', bg='oil'),
     ['C42'], ai='Stock certificates rain down over a crowded street, a counter racing to 500+. 7 s.')
line(3, "Many of the brokers were former real estate agents who had fallen on hard times when the housing boom collapsed.",
     dict(kind='town', tod='day', brokers=True, lower='Agents turn oil brokers'),
     ['C43'], ai='A REAL ESTATE window sign is painted over with OIL SHARES. 5 s.')
line(3, "Then, in August nineteen fourteen, the First World War began.",
     dict(kind='land', tod='dusk', war=True, chip='AUGUST 1914', lower='The First World War'),
     ['C44'], ai='A dark sky over the prairie, a railway platform with soldiers\' silhouettes and kit bags, steam. 4 s.')
line(3, "Interest in houses vanished, as thousands of Calgarians enlisted to serve overseas.",
     dict(kind='town', tod='storm', empty=True, lower='Thousands enlist'),
     ['C45'], ai='An empty boom-town street at dusk, shutters closed, a recruiting poster flapping. 5 s.')
line(3, "By the end of the war, all but twenty-one of those oil companies had failed, most without drilling a single well.",
     dict(kind='stats', items=[['21', 'OIL COMPANIES LEFT BY 1918']], src='Alberta’s Energy Heritage (Government of Alberta), Dingman era 1914–1923', bg='oil'),
     ['C46'], ai='Five hundred tiny derrick icons wink out until twenty-one remain. 6 s.')
line(3, "Boom or bubble: which word fits nineteen twelve? Drop your thoughts below.",
     dict(kind='question', q='Boom or bubble?', hi=['bubble?'], sub='Which word fits 1912?', tod='storm', bg='town'),
     [], gap=1.2, ai='Hold on the storm-dark street, the question in large type. 4 s.')

# ---------------- CHAPTER 4 · The Map That Waited ----------------
line(4, "In nineteen fifty-three, Calgarians lined up for days to buy City lots in a suburb first drawn before the First World War.",
     dict(kind='hook', bg='queue', hook='Lined up for days', hi=['days'], chip='1953'),
     ['C47'], ai='1953 morning: a long line of people in coats and hats outside a City land office, folding chairs, thermoses; camera tracks along the line. 4 s.')
line(4, "To see why so much of the boom's map sat empty for so long, go back to the crash. As land sales fell, so did the City's tax collections.",
     dict(kind='bars', taxes=True, lower='Tax collections fall', src='H. L. MacLeod, “Properties, investors and taxes … 1911–1919”, MA thesis, University of Calgary, 1977 (abstract)'),
     ['C48'], ai='Two falling lines, land sales and tax collections, slide down together. 5 s.')
line(4, "The City was reluctant to take land when taxes went unpaid. It treated those unpaid taxes as assets.",
     dict(kind='ledger', lower='Unpaid taxes = “assets”', src='H. L. MacLeod, MA thesis, University of Calgary, 1977 (abstract)'),
     ['C49'], ai='A City ledger: rows of unpaid taxes are written into an ASSETS column in red ink. 6 s.')
line(4, "In the end, it acquired by default a very large quantity of land which it did not want.",
     dict(kind='doc', title='H. L. MacLeod · MA thesis, University of Calgary, 1977', quote='the City acquired by default a very large quantity of land which it did not want', src='prism.ucalgary.ca · abstract'),
     ['C50'], ai='Close on a typed thesis abstract, the line highlighted. 6 s.')
line(4, "Most landowners, historian Max Foran writes, either sold at basement prices, or, more often than not, defaulted.",
     dict(kind='doc', title='Max Foran · Expansive Discourses, ch. 1', quote='Most landowners, however, either sold at basement prices or, more often than not, defaulted.', src='AU Press, 2009'),
     ['C51'], ai='Book page close-up, highlight sweeping across. 6 s.')
line(4, "In nineteen nineteen, the tax arrears were announced publicly, and owners of Lake View Heights lots were on the list.",
     dict(kind='ledger', arrears=True, chip='1919', lower='Tax arrears, made public', src='Heritage Calgary blog, “Speculative Subdivisions in Early Calgary” (Historian in Residence K. Burns, 2023), citing the Calgary Herald, Aug 4, 1919'),
     ['C52'], ai='A newspaper page of tiny tax-arrears listings scrolls past; LAKE VIEW HEIGHTS lines highlighted. 6 s.')
line(4, "By the nineteen sixteen census, Calgary counted about fifty-six and a half thousand people. After that, it grew only modestly for decades.",
     dict(kind='stats', items=[['56,514', 'PEOPLE · 1916 CENSUS']], src='Canada Year Book (Dominion Bureau of Statistics): 56,514 in 1916, 43,704 in 1911', bg='town'),
     ['C53', 'C3'], ai='A population counter crawls slowly over a quiet town. 6 s.')
line(4, "So the map the boom had drawn sat waiting.",
     dict(kind='citymap', comms=['PARKDALE', 'BOWNESS', 'KILLARNEY/GLENGARRY', 'HIGHWOOD', 'SPRUCE CLIFF', 'CAMBRIAN HEIGHTS'], limits=True, dim=True, chip='INTERPRETATION', lower='The map waited'),
     ['C29'], ai='Night map: community outlines glow faintly inside the 1910 limits, mostly empty. 3 s.')
line(4, "In Parkdale, a number of unsold lots appear to have been disposed of or forfeited under a tax recovery act used by the City. Aerial photos from nineteen twenty-four show a barren landscape with only a few scattered homes.",
     dict(kind='citymap', comms=['PARKDALE'], focus='PARKDALE', lower='Parkdale', sub='1924: “a few scattered homes”'),
     ['C54'], ai='Map dives to Parkdale on the Bow; then a bare 1920s field with three small houses. 8 s.')
line(4, "In Bowness, the land John Hextall planned in nineteen eleven sat vacant until after the Second World War, when a settlement for veterans was built.",
     dict(kind='citymap', comms=['BOWNESS'], focus='BOWNESS', chip='AFTER 1945', lower='Bowness', sub='a settlement for veterans'),
     ['C55'], ai='Map: Bowness outline fills in with small post-war houses. 6 s.')
line(4, "In Killarney, most of the building came when soldiers returned from that war.",
     dict(kind='citymap', comms=['KILLARNEY/GLENGARRY'], focus='KILLARNEY/GLENGARRY', chip='AFTER 1945', lower='Killarney'),
     ['C56'], ai='Map: Killarney fills with rows of houses. 4 s.')
line(4, "Highwood, which had reverted to the City for unpaid taxes, finally took shape after nineteen fifty-five.",
     dict(kind='citymap', comms=['HIGHWOOD'], focus='HIGHWOOD', chip='AFTER 1955', lower='Highwood', sub='reverted to the City for unpaid taxes'),
     ['C57'], ai='Map: Highwood lights up in the north. 5 s.')
line(4, "And Spruce Cliff, first subdivided before the First World War, was subdivided again in nineteen fifty-three. Buyers lined up for days for one hundred and eighteen City lots.",
     dict(kind='queue', tod='day', lower='Spruce Cliff, 1953', sub='118 City lots', chip='1953'),
     ['C47'], ai='The 1953 line of buyers stretches past a CITY LOTS sign; time-lapse of the sun crossing the sky. 7 s.')
line(4, "Remember that five-hundred-dollar lot? It sat in a field that became Cambrian Heights, developed in nineteen fifty-five.",
     dict(kind='citymap', comms=['CAMBRIAN HEIGHTS'], focus='CAMBRIAN HEIGHTS', chip='1955', lower='Cambrian Heights', sub='$500 in 1912 → $400 in 1955'),
     ['C1'], ai='Map dives to Cambrian Heights in north Calgary; a price tag flips $500 → $400. 6 s.')
line(4, "Drive through these communities today, and you are driving through a map first drawn in the boom.",
     dict(kind='city', shot='drone', tod='dusk', chip='INTERPRETATION', lower='A map drawn in the boom'),
     [], ai='Dusk drone over today\'s Calgary neighbourhoods toward the downtown skyline. 5 s.')
line(4, "Does your community date back to the boom? Yes or no? Drop your thoughts below.",
     dict(kind='question', q='Does your community date back to the boom?', hi=['boom?'], sub='Yes or no?', tod='dusk', bg='map'),
     [], gap=1.2, ai='Hold on the glowing map, the question in large type. 4 s.')

# film ending (> 2:00): CTA + end card line
END_FILM = "For more Calgary stories, studies and analysis, visit calgary insight dot c a. Follow Calgary Insight for more, and tell us what you think in the comments."
# part endings (reels of 60-75 s: no end card): a "full film" line, then the part's closing question
END_PART = {n: f"That was part {w} of four. The full film is on our YouTube channel." for n, w in [(1, 'one'), (2, 'two'), (3, 'three'), (4, 'four')]}

# reel cuts: indexes into L (twist-first hook, the chapter's strongest beat, full-film line, closing question)
def idx(ch, offsets): base = [i for i, l in enumerate(L) if l['ch'] == ch][0]; return [base + o for o in offsets]
PART_LINES = {
    1: idx(1, [0, 1, 3, 4, 10, 12, 16, 17]),
    2: idx(2, [0, 1, 2, 3, 14, 15, 16]),
    3: idx(3, [0, 3, 6, 9, 11, 12, 14]),
    4: idx(4, [0, 1, 3, 9, 11, 12]),
}
PART_Q = {n: [i for i, l in enumerate(L) if l['ch'] == n][-1] for n in range(1, 5)}
