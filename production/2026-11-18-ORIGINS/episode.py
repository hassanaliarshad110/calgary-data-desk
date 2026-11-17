# Calgary Origins Ep 2 - "Grass for a Penny: Calgary's Ranch Era"
# One entry per narration line = one scene. v = visual spec read by scene.js.
SLUG = 'ranch-era'
TITLE = "Grass for a Penny: Calgary's Ranch Era"

CH_TITLES = {1: 'Grass for a Penny', 2: 'Two Hard Winters', 3: 'The Beef King', 4: 'The End of the Open Range'}

L = []
def line(ch, text, v, claims=(), gap=None, ai=''):
    L.append(dict(ch=ch, text=text, v=v, claims=list(claims), gap=gap, ai=ai))

# ---------------- CHAPTER 1 ----------------
line(1, "In eighteen eighty-one, Ottawa started renting out prairie grass for one cent an acre.",
     dict(kind='hook', bg='land', tod='dawn', hook='Grass for a penny', hi=['penny'], big='1¢', bigLabel='AN ACRE', chip='1881'),
     ['C1'], ai='Low dawn drone skimming tall prairie grass toward the Rockies, wind combing the grass, warm side light; a single copper one-cent coin spins into frame and lands on the grass. One continuous move, 4 s.')
line(1, "That cheap grass helped turn a police fort on the Bow River into a cattle town.",
     dict(kind='city', shot='confluence', tod='dawn', lower='A police fort on the Bow', chip='INTERPRETATION'),
     ['I1', 'C44'], ai='Aerial crane-down onto the Bow and Elbow confluence in today\'s Calgary at dawn, river glinting gold; no people. 4 s.')
line(1, "This is Calgary Origins, episode two. The ranch era.",
     dict(kind='chapter', bg='land', tod='day', chapter=1),
     [], ai='Wide foothills landscape, clouds racing, title space in the sky. 3 s.')
line(1, "To understand it, start with what disappeared first.",
     dict(kind='land', tod='dusk', bison=True, lower='What disappeared first'),
     [], ai='Dusk prairie, a lone line of bison silhouettes on a ridge slowly fading out, wind. 3 s.')
line(1, "Glenbow's history of the Blackfoot says the buffalo disappeared from the Canadian prairies in eighteen seventy-nine. By eighteen eighty, they were gone.",
     dict(kind='timeline', from_=1874, to=1884, events=[[1879, 'Buffalo disappear'], [1880, 'Gone']], src='Glenbow, Niitsitapiisini: Our Way of Life'),
     ['C2'], ai='Timeline graphic over a faded prairie; bison silhouettes dissolve one by one as the scrub head passes 1879-1880. 6 s.')
line(1, "For the Blackfoot peoples, who had lived on the buffalo, the loss was enormous. Glenbow records that many people starved.",
     dict(kind='doc', title='Glenbow · Niitsitapiisini: Our Way of Life', quote='Many people starved.', src='glenbow.org'),
     ['C2'], ai='Document card on a dark desk, a single line highlighted in gold. Slow push. 5 s.')
line(1, "Cattle were already trickling in. In the fall of eighteen seventy-four, a man named Shaw drove five hundred beef cattle across the mountains from British Columbia.",
     dict(kind='map', view='region', route=['bc', 'morley'], herd=True, pins=['morley', 'calgary'], chip='1874', big='500', bigLabel='BEEF CATTLE'),
     ['C3'], ai='Top-down stylised map of the Rockies; a thin line of cattle dots crosses the mountains from British Columbia toward the foothills. 6 s.')
line(1, "He stayed, at the urging of the Reverend John McDougall. The McDougalls kept their own herd near their mission at Morleyville, today's Morley.",
     dict(kind='land', tod='day', cattle=6, mission=True, lower='Morleyville mission', sub="today's Morley"),
     ['C3', 'C4'], ai='Foothills meadow by a small log mission church, a handful of cattle grazing, mountains behind. Slow lateral dolly. 6 s.')
line(1, "In eighteen seventy-five, Joe McFarland and Henry Olsen arrived from Montana with a herd of dairy cattle.",
     dict(kind='map', view='drive', pins=['montana', 'macleod'], route=['montana', 'macleod'], herd=True, chip='1875', lower='Dairy cattle from Montana'),
     ['C3'], ai='Map: a short line of cattle dots crosses north over the Montana border. 5 s.')
line(1, "Then Ottawa made it big business. On May twentieth, eighteen eighty-one, an order in council set out the rules for grazing leases.",
     dict(kind='doc', title='W. Naftel, The Cochrane Ranch · The Lease', quote='published by order in council of 20 May 1881', src='W. Naftel, The Cochrane Ranch, Parks Canada', paper='rules'),
     ['C1'], ai='Close on an 1880s government document with wax seal, ink lines being drawn; push in. 6 s.')
line(1, "One lease could cover up to one hundred thousand acres. It could run for twenty-one years. And the rent was one cent an acre.",
     dict(kind='stats', items=[['100,000', 'ACRES (UP TO)'], ['21', 'YEARS'], ['1¢', 'AN ACRE']], src='Order in council, 20 May 1881 · W. Naftel, Parks Canada'),
     ['C1'], gap=0.9, ai='Three numbers slam in over a grass texture: 100,000 acres, 21 years, 1 cent an acre. 7 s.')
line(1, "The first big player was a senator from Montreal, Matthew Cochrane.",
     dict(kind='name', name='Matthew Cochrane', role='Senator · Montreal', bg='land', tod='day'),
     ['C5'], ai='Silhouette of a man in a frock coat and top hat against a foothills sky (no likeness). 4 s.')
line(1, "In eighteen eighty-one, he launched what is recognized as Alberta's first large-scale ranch, the Cochrane Ranche, on land west of Calgary.",
     dict(kind='map', view='region', pins=['calgary', 'cochrane'], focus='cochrane', area='cochrane', chip='1881', lower='Cochrane Ranche'),
     ['C5'], ai='Map flies from Calgary west to a pin on Big Hill Creek; a lease square outlines on the grass. 6 s.')
line(1, "Its home base sat in a sheltered valley on Big Hill Creek, near today's town of Cochrane.",
     dict(kind='land', tod='day', valley=True, ranch=True, creek=True, lower='Big Hill Creek', sub='near today\'s Cochrane'),
     ['C5'], ai='Sheltered valley with a creek and log ranch buildings, crane-down from the ridge. 5 s.')
line(1, "Others followed in eighteen eighty-two. To the south, the Oxley Ranch secured a lease of two hundred thousand acres.",
     dict(kind='map', view='region', pins=['calgary', 'cochrane', 'oxley'], focus='oxley', area='oxley', chip='1882', big='200,000', bigLabel='ACRES · OXLEY LEASE'),
     ['C6'], ai='Map pans south; a second, larger lease square draws on near Willow Creek. 6 s.')
line(1, "East of Calgary, an army officer, Thomas Bland Strange, took a ranching lease to raise cavalry horses for the British army.",
     dict(kind='land', tod='day', horses=8, lower='Thomas Bland Strange', sub='Horses for the British army'),
     ['C7'], ai='Prairie east of the city, a small herd of horses galloping left to right, dust. Tracking shot. 6 s.')
line(1, "On paper, it looked like an easy fortune. The grass was cheap. The cattle were coming.",
     dict(kind='land', tod='dusk', cattle=14, drift=True, lower='An easy fortune?', chip='INTERPRETATION'),
     [], ai='Golden-hour herd spreading over the grass, camera rising slowly. 5 s.')
line(1, "Would you have bet on cattle here? Yes or no?",
     dict(kind='question', q='Bet on cattle here? Yes or no?', hi=['yes', 'no?'], tod='dusk'),
     [], gap=1.2, ai='Hold on the dusk prairie, the question in large type. 4 s.')

# ---------------- CHAPTER 2 ----------------
line(2, "Alberta's first big ranch lost thousands of cattle in just two winters.",
     dict(kind='hook', bg='land', tod='storm', snow=True, hook='Two winters. Thousands lost.', hi=['thousands'], chip='1881–1883', cattle=12),
     ['C5', 'C10', 'C12'], ai='Blizzard over open range, snow streaking past the lens, dark cattle shapes hunched against the wind. 4 s.')
line(2, "In eighteen eighty-one, the Cochrane Ranche bought most of its herd in Montana.",
     dict(kind='map', view='drive', pins=['benton', 'calgary', 'cochrane'], focus='benton', chip='1881', lower='Bought in Montana'),
     ['C8'], ai='Map: a pin in Montana, the border line glowing. 4 s.')
line(2, "A trading firm from Fort Benton, Montana, was contracted to drive the cattle north.",
     dict(kind='map', view='drive', pins=['benton', 'cochrane'], route=['benton', 'cochrane'], herd=True, lower='Fort Benton → north'),
     ['C8'], ai='Map: a dotted trail draws north from Fort Benton across the border to the foothills. 5 s.')
line(2, "The main herd numbered six or seven thousand head, at sixteen dollars a head, delivered at the border.",
     dict(kind='stats', items=[['6,000–7,000', 'HEAD (MAIN HERD)'], ['$16', 'A HEAD, AT THE BORDER']], src='W. Naftel, The Cochrane Ranch, Parks Canada'),
     ['C8'], ai='Numbers slam in over a dusty herd: six to seven thousand head, sixteen dollars each. 6 s.')
line(2, "The drivers pushed hard. Steers covered fifteen to eighteen miles a day.",
     dict(kind='land', tod='day', cattle=26, drive=True, dust=True, big='15–18', bigLabel='MILES A DAY'),
     ['C9'], ai='Cattle drive tracking shot, riders at the flanks, thick dust, fast pace. 5 s.')
line(2, "Then winter came. In the winter of eighteen eighty-one to eighty-two, losses were heavy: close to a thousand head, by one account.",
     dict(kind='land', tod='storm', snow=True, cattle=10, big='~1,000', bigLabel='HEAD LOST · 1881–82'),
     ['C10'], ai='Snow covers the range, cattle shapes fade into white. Slow push. 7 s.')
line(2, "In eighteen eighty-two, a second herd arrived: four thousand, two hundred and ninety head, on October nineteenth.",
     dict(kind='stats', items=[['4,290', 'HEAD'], ['19 OCT', '1882']], src='W. Naftel, The Cochrane Ranch, Parks Canada', bg='autumn'),
     ['C11'], ai='Autumn foothills, a long line of cattle arriving; date stamp 19 October 1882. 6 s.')
line(2, "The next winter was worse. By one count, the Cochrane Ranche lost at least three thousand head.",
     dict(kind='land', tod='night', snow=True, blizzard=True, big='3,000+', bigLabel='HEAD LOST · 1882–83 (ONE COUNT)'),
     ['C12'], gap=0.9, ai='Night blizzard, wind roaring, the frame almost white; a number burns through. 6 s.')
line(2, "A letter in eighteen eighty-three said: our losses are enormous.",
     dict(kind='doc', title='Letter, 1883 (quoted by W. Naftel)', quote='“…our losses are enormous…”', src='W. Naftel, The Cochrane Ranch, Parks Canada'),
     ['C13'], ai='Old handwritten letter on a table, candlelight, the line underlined. 5 s.')
line(2, "In eighteen eighty-three, the company moved its cattle south, to a new lease on the Belly River.",
     dict(kind='map', view='region', pins=['cochrane', 'belly'], route=['cochrane', 'belly'], herd=True, chip='1883', lower='South to the Belly River'),
     ['C14'], ai='Map: herd dots stream south from Cochrane to the Belly River. 5 s.')
line(2, "The original Cochrane land turned to horses and sheep, under a new name: the British American Ranch Company.",
     dict(kind='land', tod='day', valley=True, ranch=True, sheep=12, horses=3, lower='British American Ranch Company'),
     ['C14'], ai='The same valley as before, now dotted with sheep and a few horses. 6 s.')
line(2, "Meanwhile, southwest of Calgary, another outfit was taking shape.",
     dict(kind='map', view='region', pins=['calgary', 'baru'], focus='baru', lower='Southwest of Calgary'),
     ['C45'], ai='Map glides southwest toward Pekisko Creek. 3 s.')
line(2, "In June eighteen eighty-one, Fred Stimson, from Quebec, began organizing the North-West Cattle Company, backed by the Allan family of Montreal.",
     dict(kind='name', name='Fred Stimson', role='North-West Cattle Company · organizing begins 1881', bg='land', tod='day', sub2='Backed by the Allan family of Montreal'),
     ['C15'], ai='Silhouette of a rancher at a corral rail, no face detail; foothills behind. 7 s.')
line(2, "It was chartered in March eighteen eighty-two. Its ranch on Pekisko Creek became known by its brand: the Bar U.",
     dict(kind='brand', brand='BARU', label='The Bar U', sub='Pekisko Creek · chartered 1882'),
     ['C15'], ai='A glowing branding iron presses the Bar U mark into weathered wood, smoke curls. 6 s.')
line(2, "Stimson bought more than three thousand cattle in Idaho, and drove them to the company's lease west of High River.",
     dict(kind='map', view='west', pins=['idaho', 'baru', 'highriver'], route=['idaho', 'baru'], herd=True, big='3,000+', bigLabel='CATTLE FROM IDAHO'),
     ['C16'], ai='Wide map: a long trail of dots from Idaho over the mountains to the foothills west of High River. 6 s.')
line(2, "By eighteen ninety, the Bar U was among the largest ranches in Canada: nearly one hundred and fifty-eight thousand acres of leased land, and more than ten thousand head of cattle.",
     dict(kind='stats', items=[['~158,000', 'ACRES LEASED'], ['10,000+', 'HEAD OF CATTLE']], chip='1890', src='Dictionary of Canadian Biography · Frederick Smith Stimson'),
     ['C17'], ai='Counters roll to 157,960 acres and 10,382 head over an aerial of rolling foothills. 8 s.')
line(2, "Today, Parks Canada protects the Bar U as a national historic site, for its role in Canada's ranching story.",
     dict(kind='land', tod='dusk', ranch=True, barn=True, cattle=5, lower='Bar U Ranch', sub='National Historic Site · Parks Canada'),
     ['C18'], ai='Dusk over red-roofed ranch buildings on Pekisko Creek, orbit move. 5 s.')
line(2, "One of its horse-breakers, says the Canadian Encyclopedia, was Harry Longabaugh, better known as the Sundance Kid.",
     dict(kind='name', name='The Sundance Kid', role='Harry Longabaugh · broke horses at the Bar U', bg='land', tod='dusk'),
     ['C18'], ai='Silhouette of a rider breaking a bucking horse in a dusty corral (no likeness). 5 s.')
line(2, "Cochrane or the Bar U: which ranch would you have ridden for?",
     dict(kind='question', q='Cochrane or the Bar U?', hi=['cochrane', 'bar', 'u?'], tod='dusk'),
     [], gap=1.2, ai='Split frame of two ranch brands, the question large. 4 s.')

# ---------------- CHAPTER 3 ----------------
line(3, "Calgary's first millionaire built his fortune on beef.",
     dict(kind='hook', bg='city', shot='elbow', tod='dusk', hook="Calgary's first millionaire?", hi=['millionaire?']),
     ['C19'], ai='Dusk drone low over the Elbow River in today\'s Calgary toward downtown towers; a gold title punches in. 4 s.')
line(3, "But first, the railway.",
     dict(kind='land', tod='day', train=True, lower='The railway'),
     [], ai='Steam train crossing the open prairie, smoke trailing, low angle. 3 s.')
line(3, "The Canadian Pacific Railway reached Calgary in eighteen eighty-three.",
     dict(kind='map', view='region', pins=['calgary'], rail=True, chip='1883', lower='The railway reaches Calgary'),
     ['C20'], ai='Map: a line draws in from the east and stops at Calgary with a flash. 4 s.')
line(3, "Calgary became the distributing and shipping point for the ranch country around it.",
     dict(kind='map', view='region', pins=['calgary', 'cochrane', 'baru', 'highriver', 'oxley'], spokes=True, focus='calgary', lower='The shipping point'),
     ['C21'], ai='Map: lines from ranch pins converge on Calgary like spokes on a wheel. 5 s.')
line(3, "Live cattle went to London, Liverpool and Glasgow. Until the turn of the twentieth century, that trade mattered more to Canada than wheat.",
     dict(kind='export', ports=['London', 'Liverpool', 'Glasgow'], compare=['Live cattle', 'Wheat'], src='The Canadian Encyclopedia · Bar U Ranch'),
     ['C22'], ai='Stylised Atlantic map: three shipping routes arc to British ports; a scale tips toward cattle over wheat. 7 s.')
line(3, "In eighteen eighty-six, the Calgary District and Agricultural Society held the first exhibition, in a town of about a thousand people.",
     dict(kind='land', tod='day', fair=True, flags=True, cattle=6, chip='1886', big='~1,000', bigLabel='PEOPLE IN CALGARY'),
     ['C23'], ai='A small frontier fairground: tents, flags, cattle pens, a handful of figures. 8 s.')
line(3, "Then came Patrick Burns.",
     dict(kind='name', name='Patrick Burns', role='Cattle dealer · meat packer', bg='city', shot='elbow', tod='dusk'),
     ['C24'], gap=0.8, ai='Silhouette in a bowler hat against dusk light (no likeness). 3 s.')
line(3, "In eighteen eighty-seven, contractors William Mackenzie and Donald Mann hired him to supply meat to their construction camps.",
     dict(kind='doc', title='Dictionary of Canadian Biography · Patrick Burns', quote='to supply meat to their construction camps', src='biographi.ca'),
     ['C24'], ai='Biography page, a phrase highlighted in gold. 6 s.')
line(3, "In eighteen ninety, he built his first slaughterhouse, on the east side of the Elbow River in Calgary.",
     dict(kind='city', shot='elbow', tod='day', pinElbow=True, chip='1890', lower='East side of the Elbow'),
     ['C25'], ai='Aerial over the Elbow River in Calgary; a pin drops on the east bank. 6 s.')
line(3, "The plant burned down in eighteen ninety-two. The business kept growing.",
     dict(kind='land', tod='night', embers=True, plant=True, chip='1892', lower='Burned down'),
     ['C26'], ai='Night, a wooden plant silhouette with embers rising, then a new dawn. 5 s.')
line(3, "By nineteen oh two, he was called the beef king of the West.",
     dict(kind='doc', title='Dictionary of Canadian Biography · 1902', quote='“beef king of the West”', src='biographi.ca'),
     ['C27'], ai='Gold crown stamp over a newsprint texture. 4 s.')
line(3, "In nineteen oh five, he incorporated his packing houses as one company. It went on to run plants in Edmonton, Vancouver, Regina, Winnipeg and even Seattle.",
     dict(kind='map', view='west_wide', pins=['calgary', 'edmonton', 'vancouver', 'regina', 'winnipeg', 'seattle'], spokesFrom='calgary', chip='1905'),
     ['C28'], ai='Map of western Canada: plant pins light up city by city from Calgary outward. 8 s.')
line(3, "The Canadian Encyclopedia calls him the city's first millionaire, and his company the largest integrated meat business in Canada.",
     dict(kind='doc', title='The Canadian Encyclopedia · Calgary', quote="The city's first millionaire, Pat Burns, built up the largest integrated meat business in Canada.", size=34, src='thecanadianencyclopedia.ca'),
     ['C19'], ai='Encyclopedia page, highlighted quote. 4 s.')
line(3, "He was a rancher too. By the First World War, he controlled more than four hundred thousand acres, and more than thirty thousand head of cattle.",
     dict(kind='stats', items=[['400,000+', 'ACRES'], ['30,000+', 'HEAD OF CATTLE']], chip='BY 1914', src='Dictionary of Canadian Biography · Patrick Burns'),
     ['C29'], ai='Counters over sweeping ranch land. 7 s.')
line(3, "In nineteen oh two, he bought the Bow Valley Ranch, now inside Fish Creek Provincial Park.",
     dict(kind='land', tod='day', ranch=True, creek=True, cattle=5, chip='1902', lower='Bow Valley Ranch', sub='Fish Creek Provincial Park'),
     ['C29b'], ai='Sandstone-and-timber ranch house by a creek in a river valley, slow dolly. 5 s.')
line(3, "Other ranchers built Calgary too. Alfred Ernest Cross started the A Seven ranch in eighteen eighty-five, on Mosquito Creek, west of Nanton.",
     dict(kind='brand', brand='A7', label='The A7 Ranche', sub='Alfred Ernest Cross · 1885 · Mosquito Creek'),
     ['C30'], ai='Branding iron presses A7 into wood, smoke. 7 s.')
line(3, "In eighteen ninety-two, he founded the Calgary Brewing and Malting Company.",
     dict(kind='land', tod='day', brewery=True, chip='1892', lower='Calgary Brewing and Malting'),
     ['C31'], ai='A brick brewhouse by the river flats, steam rising. 4 s.')
line(3, "His house in east Calgary, built in eighteen ninety-one, is a provincial historic resource today.",
     dict(kind='land', tod='dusk', house=True, chip='1891', lower='A. E. Cross House', sub='East Calgary'),
     ['C31b'], ai='Victorian brick house at dusk, warm windows, slow push. 4 s.')
line(3, "And in eighteen ninety-one, the Ranchmen's Club was founded in Calgary, largely based on the Saint James Club in Montreal.",
     dict(kind='land', tod='night', club=True, chip='1891', lower="The Ranchmen's Club"),
     ['C32'], ai='Lamplit window of a gentlemen\'s club at night, silhouettes inside. 6 s.')
line(3, "Did you know Calgary's first millionaire was a meat packer? Yes or no?",
     dict(kind='question', q='Did you know? Yes or no?', hi=['yes', 'no?'], tod='dusk', sub='Calgary\'s first millionaire: a meat packer'),
     ['C19'], gap=1.2, ai='Dusk skyline, question large. 4 s.')

# ---------------- CHAPTER 4 ----------------
line(4, "One winter, the chinook never came.",
     dict(kind='hook', bg='land', tod='storm', snow=True, hook='No chinook.', hi=['chinook.'], chip='1906–07', arch=True, fences=True, cattle=5),
     ['C34', 'C37'], ai='A chinook arch that never opens: grey lid of cloud over a frozen range, snow blowing. 4 s.')
line(4, "But the open range was already shrinking.",
     dict(kind='land', tod='day', fences=True, cattle=6, lower='The range shrinks'),
     ['C33', 'C34'], ai='Fence posts march across the grass toward the horizon, wire drawing on. 3 s.')
line(4, "In eighteen ninety-two, ranchers got four years' notice: the old leases that kept homesteaders out would be cancelled.",
     dict(kind='doc', title='The Canadian Encyclopedia · Ranching history', quote="4 years' notice that all old leases restricting homestead entry would be cancelled", src='thecanadianencyclopedia.ca', size=34),
     ['C33'], ai='Notice document with a red stamp CANCELLED. 6 s.')
line(4, "Settlers arrived to farm. A Parks Canada plaque says pressure from farmers and smaller ranchers reduced the large ranges.",
     dict(kind='land', tod='day', farms=True, fences=True, lower='Farmers move in', sub='Parks Canada plaque'),
     ['C34'], ai='Split landscape: ploughed strips and homesteads spreading over open range, time-lapse feel. 6 s.')
line(4, "Ranchers organized. In eighteen ninety-six, cattlemen met at Macleod, now Fort Macleod, and formed the Western Stock Growers' Association.",
     dict(kind='map', view='region', pins=['calgary', 'macleod'], focus='macleod', chip='1896', lower="Western Stock Growers' Association"),
     ['C35'], ai='Map: pin pulses on Fort Macleod. 7 s.')
line(4, "At the Bar U, a new boss took over. George Lane had come as foreman in eighteen eighty-four.",
     dict(kind='name', name='George Lane', role='Bar U foreman · 1884', bg='land', tod='day'),
     ['C36'], ai='Silhouette of a cowboy on horseback at a ridge (no likeness). 5 s.')
line(4, "In nineteen oh two, he and his partners bought the ranch, for two hundred and twenty thousand dollars.",
     dict(kind='stats', items=[['$220,000', 'BAR U SALE · 1902']], src='Dictionary of Canadian Biography · Stimson, Lane', stamp='BARU'),
     ['C36'], ai='Bar U brand with a price tag stamping onto a deed. 5 s.')
line(4, "Lane built up what his biography calls the largest pure-bred Percheron stud in the world.",
     dict(kind='land', tod='day', horses=6, big=True, percheron=True, lower='Percheron horses', sub='“the largest pure-bred Percheron stud in the world”'),
     ['C36'], ai='Heavy draft horses walking in a line, manes in the wind. 5 s.')
line(4, "Then came the winter of nineteen oh six to oh seven. The usual chinook never came.",
     dict(kind='land', tod='storm', snow=True, blizzard=True, arch=True, chip='1906–07', lower='No chinook'),
     ['C37'], gap=0.9, ai='Prairie frozen hard; the sky to the west stays grey. 5 s.')
line(4, "Stock losses ran into the thousands.",
     dict(kind='land', tod='night', snow=True, cattle=8, big='THOUSANDS', bigLabel='STOCK LOST'),
     ['C37'], ai='Snow-buried range at night, still. 3 s.')
line(4, "Parks Canada's plaque says that hard winter marked the end of the era of the big ranches.",
     dict(kind='doc', title='Parks Canada · Ranching Industry plaque', quote='marked the end of the era of the big ranches', src='Parks Canada, Directory of Federal Heritage Designations'),
     ['C34'], ai='Bronze plaque, a line highlighted. 5 s.')
line(4, "Before then, says the Canadian Encyclopedia, the open-range cattle industry was Calgary's dominant economic activity.",
     dict(kind='timeline', from_=1879, to=1912, events=[[1881, 'Leases'], [1883, 'Railway'], [1890, "Burns' first slaughterhouse"], [1892, 'Notice'], [1896, 'Stock growers'], [1906, 'Hard winter', '1906–07']], src='Sources: W. Naftel, Parks Canada · Dictionary of Canadian Biography · The Canadian Encyclopedia · WSGA'),
     ['C38', 'C1', 'C20', 'C25', 'C33', 'C35', 'C37'], ai='Timeline sweep across the ranch era. 6 s.')
line(4, "But the ranchers had one more idea.",
     dict(kind='land', tod='dusk', cattle=4, lower='One more idea'),
     [], gap=0.8, ai='Dusk, a rider pauses on a ridge above the city lights. 3 s.')
line(4, "In nineteen twelve, four of them, Pat Burns, Alfred Ernest Cross, George Lane and Archibald McLean, guaranteed one hundred thousand dollars to stage the first Calgary Stampede.",
     dict(kind='bigfour', names=['Pat Burns', 'A. E. Cross', 'George Lane', 'Archibald McLean'], big='$100,000', bigLabel='GUARANTEED · 1912', src='Dictionary of Canadian Biography · Archibald James McLean'),
     ['C39'], ai='Four silhouettes in a row, a gold guarantee stamp lands between them. 9 s.')
line(4, "It ran from September second to fifth, nineteen twelve.",
     dict(kind='land', tod='day', fair=True, flags=True, crowd=True, chip='2–5 SEPT 1912', lower='The first Stampede'),
     ['C40'], ai='Fairground with flags snapping, rodeo dust. 3 s.')
line(4, "Downtown, the Burns Building, home to one of his retail meat markets, went up in nineteen twelve and nineteen thirteen. It still stands, a provincial historic resource.",
     dict(kind='city', shot='stephen', tod='dusk', lower='Burns Building', sub='8 Avenue SE · 1912–1913'),
     ['C41'], ai='Dusk drone along Stephen Avenue in today\'s downtown toward a six-storey terracotta building. 8 s.')
line(4, "In nineteen thirty-one, at a huge celebration of Burns' approaching seventy-fifth birthday, a three-thousand-pound cake was shared with some fifteen thousand people. That day, he was named to the Senate.",
     dict(kind='stats', items=[['3,000 lb', 'BIRTHDAY CAKE'], ['~15,000', 'PEOPLE']], chip='1931', src='Dictionary of Canadian Biography · Patrick Burns'),
     ['C42'], ai='A giant tiered cake on a stage, crowd silhouettes, bunting. 9 s.')
line(4, "The ranch era was short. But the Stampede those ranchers backed is still going.",
     dict(kind='city', shot='confluence', tod='night', lower='The Stampede goes on', chip='INTERPRETATION'),
     ['C43'], ai='Night crane-up over the city lights at the river confluence. 5 s.')
line(4, "Is Calgary still a cattle town at heart? Yes or no?",
     dict(kind='question', q='Still a cattle town at heart?', hi=['cattle', 'town'], tod='night'),
     [], gap=1.0, ai='Night skyline, question large. 4 s.')

# end lines (voiced separately; film uses END_FILM, reels use END_PART[n])
END_FILM = "Drop your thoughts below. For more Calgary stories, studies and analysis, visit calgary insight dot c a. Follow Calgary Insight for more, and tell us what you think in the comments."
END_PART = {
    1: "Drop your answer below. Part two is next: the winters. For more Calgary stories, visit calgary insight dot c a, and follow Calgary Insight.",
    2: "Drop your answer below. Part three is next: the beef king. For more Calgary stories, visit calgary insight dot c a, and follow Calgary Insight.",
    3: "Drop your answer below. Part four is next: the end of the open range. For more Calgary stories, visit calgary insight dot c a, and follow Calgary Insight.",
    4: END_FILM,
}
