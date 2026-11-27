# Calgary Insight pronunciation dictionary

The master list of Calgary names the narrator must say correctly: communities, landmarks, people, Treaty 7 nations and places, and the hard words in the Nov 9 to Dec 31 calendar. Started Nov 26, 2026 after viewers flagged mispronounced community, landmark and Indigenous names (Hassan: "it's mostly the name of the communities, and name of the landmarks and native areas").

## How it works (read before every narration)

1. **Write names normally in the script.** Captions and on-screen text keep the normal spelling. Never put a respelling such as "Breez-bwah" or "BOH-lee-oo" into a script: Kokoro reads hyphenated respellings as separate words (QC, Nov 17, 2026).
2. **The voice list does the work.** `probe/lexicon.json` on the `studio-probe` branch gives Kokoro the exact phonemes for every word in the first table below. `probe/tts.py` applies it automatically on every narration run (whole words, case-sensitive; possessives such as "Lougheed's" are not matched, so write "the Lougheed house" or rephrase).
3. **Before writing a script,** scan this file for every place, person and Indigenous name in it. A name in "Fixed in the voice list" or "Checked" needs nothing. A name in "Reference only" or not listed at all must be checked after voicing (step 4).
4. **After voicing,** read `sp_out/asr_report.json` (mismatches) and `sp_out/phonemes.json` → `script_names`. Any name heard wrong goes into `probe/lexicon.json` (`ipa`, `say` with no hyphens or spaces, `why`) AND into the first table here, in the same run, then re-voice. A word fixed once stays fixed for every later video.
5. **Viewer complaints:** when a viewer flags a word, add it the same day, test it with a one-line studio-probe run, and note the date in "why".

## Fixed in the voice list (74 words, exact phonemes in probe/lexicon.json)

| Written | Say it like | Note |
| --- | --- | --- |
| Acheson | ATCH-uh-sun | Assistant Commissioner Acheson Irvine; Kokoro said 'Aixson' (QC Nov 17, 2026) |
| Altadore | AL-tuh-dor | Calgary community, said AL-tuh-dor |
| Alyth | AY-lith | Alyth Yard, said AY-lith; default said AL-ith |
| Atletico | at-LET-ih-koh | Atletico Ottawa (CPL club); Kokoro said 'atelrico', heard as 'Adel to Co' (QC Nov 23, 2026) |
| Bjarke | BYAR-kuh | Bjarke Ingels, TELUS Sky architect; test heard 'Bjork' |
| Bow | BOH | Bow River / The Bow rhymes with 'go', not 'cow' |
| Bowness | BO-ness | Calgary community, said BO-ness (Hassan, Nov 27, 2026) |
| Braeside | BRAY-side | Calgary community, said BRAY-side; default said BREE-side |
| Brisebois | BREEZ-bwah | Inspector Ephrem Brisebois, Brisebois Drive (French name) |
| Casavant | KAZ-uh-vahn | Casavant Frères organ builders (Jack Singer Concert Hall organ); test heard 'Cass Avent' |
| Cedarbrae | SEE-dar-bray | Calgary community, said SEE-dar-bray; default said SED-ar-bree |
| Chinook | shih-NOOK | Calgary's warm wind, said shi-NOOK |
| chinook | shih-NOOK | same, lower case |
| Chinooks | shih-NOOKS | plural |
| chinooks | shih-NOOKS | plural, lower case |
| Cochrane | KOK-run | Cochrane (town, Cochrane Ranche, Senator Matthew Cochrane): locals say 'COCK-run'; Kokoro said 'cock-rain' (QC Nov 17, 2026) |
| Concacaf | KONK-uh-kaf | Concacaf, the North and Central American and Caribbean football confederation; added Nov 23, 2026 |
| CTrain | SEE-train | Calgary's light rail |
| CTrains | SEE-trains | plural |
| Daqing | dah-CHING | Daqing, Calgary's twin city in China; Daqing Avenue/Plaza in Chinatown |
| Dhaliwal | DAH-lee-wahl | Ward 5 Councillor Raj Dhaliwal, said DAH-lee-wahl; default said DAL-i-wul |
| Doucet | doo-SAY | Father Léon Doucet, Mission district (French); test heard 'Dowsett' |
| Elboya | el-BOY-uh | Calgary community, said el-BOY-uh; test heard 'Alboya' |
| Enmax | EN-max | ENMAX, Ride the Wind; test heard 'NMACS' |
| ENMAX | EN-max | same, capitals |
| Ephrem | EF-rem | French first name of Inspector Brisebois; uses Kokoro's own reading of 'Éphrem' (QC Nov 17: 'ˈeɪfɹɛm' heard as 'Afram', 'eɪfɹˈɛm' ran into Brisebois) |
| Gaelic | GAL-ik | Scottish Gaelic is said GAL-ik |
| Hidy | HY-dee | Hidy and Howdy, 1988 Olympic mascots; test heard 'Heide' |
| Inarritu | in-YAR-ih-too | same, without accents |
| Ingels | ING-ulz | Bjarke Ingels; test lost the word |
| Iyarhe | ee-YAH-hay | same, without accents |
| Iñárritu | in-YAR-ih-too | Alejandro González Iñárritu (The Revenant); test heard 'Inuredu' |
| Kananaskis | kan-uh-NASS-kiss | Kananaskis Country |
| Kirtan | KEER-tun | same |
| Lacombe | luh-KOHM | Father Albert Lacombe, the Oblate missionary; said luh-KOHM (as the town of Lacombe, Alberta) |
| Langevin | LANJ-uh-vin | Langevin Bridge (now Reconciliation Bridge), said LANJ-uh-vin |
| Longabaugh | LONG-uh-baw | Harry Longabaugh, the Sundance Kid |
| Lougheed | LAW-heed | Peter Lougheed, Lougheed House |
| LRT | L R T | letter by letter |
| Macleod | muh-KLOWD | Macleod Trail, Fort Macleod, Colonel James Macleod |
| Metis | MAY-tee | same, without the accent |
| Mewata | meh-WAH-tuh | Mewata Armoury, said meh-WAH-tuh; test heard 'Muada' |
| Mohkinstsis | MOH-kin-stsis | Blackfoot name for the Calgary area |
| Moyie | MOY-ee | SS Moyie paddlewheeler at Heritage Park; test heard 'Muayi' |
| Métis | MAY-tee | French pronunciation used in Canada |
| Nagar Kirtan | NUG-ur KEER-tun | Calgary's Nagar Kirtan (Sikh procession); test heard 'Nagar curtain' |
| Nakiska | nuh-KISS-kuh | Nakiska ski area (1988 Olympics); test heard 'Nachiska' |
| Nolan Hill | NOH-lun hill | Calgary community; test heard 'Nallen Hill' |
| Nykanen | NEE-kuh-nen | same, without accents |
| Nykänen | NEE-kuh-nen | Matti Nykänen, 1988 ski jump champion; test heard 'Nikonon' |
| Okotoks | OH-koh-toks | town south of Calgary |
| Oshawa | OSH-uh-wuh | Oshawa, Ontario (Pat Burns story); test heard 'Ashawa' |
| Pekisko | puh-KISS-koh | Pekisko Creek, Bar U Ranch |
| Percheron | PUR-shuh-ron | draft-horse breed (George Lane's stud) |
| Piikani | bee-GAH-nee | Piikani Nation, said bee-GAH-nee; test heard 'Piakani' |
| Ranche | RANCH | Cochrane Ranche (historic spelling), said like 'ranch' |
| Rideau | ree-DOH | Rideau Park, said ree-DOH; test heard 'Rhydow' |
| Rosscarrock | ross-KAIR-ok | Calgary community, said ross-KAIR-ok; test heard 'Roskirk' |
| Rouleauville | ROO-loh-vil | the French settlement that became Mission |
| SAIT | SAYT (one word) | SAIT polytechnic, said as one word 'sate', not letters |
| Shaganappi | shag-uh-NAP-ee | Shaganappi Trail |
| Shouldice | SHOLE-dice | Shouldice Park, said SHOLE-dice; test heard 'Shuddus' |
| Sien Lok | SEEN LOK | Sien Lok Park in Chinatown; test heard 'Scene Loke' |
| Sunalta | sun-AL-tuh | Calgary community, said sun-AL-tuh; test heard 'Sinalta' |
| Syne | SYNE (rhymes with line) | Auld Lang Syne: 'syne' rhymes with 'line' |
| TELUS | TELL-us | TELUS Sky, TELUS Spark: a word, not letters |
| Tsuut'ina | tsoo-TIN-ah | Tsuut'ina Nation |
| Tsuut’ina | tsoo-TIN-ah | same, curly apostrophe |
| Warschewski | var-SHEF-skee | Tobias Warschewski, Cavalry FC forward (German name); added Nov 23, 2026 |
| Weadick | WEE-dik | Guy Weadick, Stampede founder; test heard 'Weidich' |
| YYC | Y Y C | airport code, letter by letter |
| Zurbriggen | ZUR-brig-en | Pirmin Zurbriggen, 1988 Olympic champion; test heard 'Zurburgen' |
| Éphrem | EF-rem | French first name of Inspector Brisebois; uses Kokoro's own reading of 'Éphrem' (QC Nov 17: 'ˈeɪfɹɛm' heard as 'Afram', 'eɪfɹˈɛm' ran into Brisebois) |
| Îyârhe | ee-YAH-hay | Îyârhe (Stoney) Nakoda; test heard 'ER' |

## Checked: the voice already says these correctly (103 words)

Tested on the studio-probe lane on Nov 27, 2026 (Kokoro af_heart, listen-back check). No fix needed; leave them out of the voice list unless a future check flags one.

Abbeydale, Acadia, Airdrie, Ang Lee, Assiniboine, Bearspaw, Beddington, Bonavista, Bridlewood, Britannia, Calatrava, Cambrian, Canmore, Cantonese, Carrington, Carthy, Chaparral, Chestermere, Clamato, Connaught, Cougar Ridge, Crowchild, cul-de-sac, Currie Barracks, Dalhousie, Dashmesh, Devonian, DiCaprio, Diefenbaker, Diefenbunker, Douglasdale, Eau Claire, Edworthy, Erlton, Falconridge, Fortress Mountain, Glamorgan, Glenbow, Glenmore, Gondek, Gurdwara, Gyllenhaal, Haysboro, Heath Ledger, Hextall, Hillhurst, Hogmanay, Howdy, Inglewood, Jann Arden, Kainai, Kensington, Khalsa, Kincora, Mahogany, Marlborough, Martindale, McKenzie Towne, McMahon, Midnapore, Millican, Montgomery, Nenshi, Niitsitapi, Notre Dame, Ogden, Orser, Palliser, Paskapoo, Penbrooke, Penhold, Punjabi, Ralph Klein, Ramsay, Renfrew, Rouleau, Roxboro, Rundle, Saddledome, Sarcee, Savanna, Scarboro, Seton, Shaughnessy, Sikh, Siksika, Silverado, Springbank, Spruce Meadows, Stoney Nakoda, Strathcona, Tagalog, Taradale, Tegan and Sara Quin, Thorncliffe, Tuscany, Tuxedo, Vaisakhi, Walden, Weaselhead, Werklund, Windermere, WinSport.

## Reference only (103 words)

Expected pronunciations from the original dictionary. Not yet tested on the voice: if one appears in a script, check it after voicing (step 4) and move it to the first table if it comes out wrong.

| Written | Say it like | Group |
| --- | --- | --- |
| 1912 | nineteen twelve | Words from the December schedule |
| 1988 | nineteen eighty-eight | Words from the December schedule |
| A. E. Cross | A. E. CROSS | Words from the December schedule |
| Alyth Yard | AY-lith yard | Words from the December schedule |
| Applewood Park | AP-ul-wood park | Communities, A to Z (part 1) |
| Arbour Lake | AR-bur lake | Communities, A to Z (part 1) |
| Archie McLean | Archie muh-KLAYN | Words from the December schedule |
| Aspen Woods | AS-pen woods | Communities, A to Z (part 1) |
| Atlanta Flames | at-LAN-tuh flames | Words from the December schedule |
| Auburn Bay | AW-burn bay | Communities, A to Z (part 1) |
| Banff | bamf | Calgary and area |
| Banff Trail | BAMF trail | Communities, A to Z (part 1) |
| Bankview | BANK-vyoo | Communities, A to Z (part 1) |
| Beaulieu | BOH-lee-oo | Words from the December schedule |
| Beddington Heights | BED-ing-tun heights | Communities, A to Z (part 1) |
| Bel-Aire | bel-AIR | Communities, A to Z (part 1) |
| Beltline | BELT-line | Communities, A to Z (part 1) |
| Blackfoot Trail | BLAK-foot trail | Indigenous nations and places |
| Bow Glacier | BOH glacier | Words from the December schedule |
| Bow Lake | BOH lake | Words from the December schedule |
| Bow River | BOH river | Indigenous nations and places |
| Bridgeland | BRIDJ-lund | Communities, A to Z (part 1) |
| C-Train | see train | Communities and roads |
| Calgary | KAL-guh-ree | Calgary and area |
| Cambrian Heights | KAM-bree-un heights | Communities, A to Z (part 1) |
| Capitol Hill | KAP-ih-tul hill | Communities, A to Z (part 1) |
| Castleridge | KAS-ul-ridge | Communities, A to Z (part 1) |
| Chinatown | CHY-nuh-town | Communities, A to Z (part 1) |
| Citadel | SIT-uh-del | Communities, A to Z (part 1) |
| Cityscape | SIT-ee-skayp | Communities, A to Z (part 1) |
| Cornerstone | KOR-ner-stone | Communities, A to Z (part 1) |
| Coventry Hills | KUV-en-tree hills | More communities |
| Cowtown | KOW-town | Words from the December schedule |
| CPR | C P R | Words from the December schedule |
| Cranston | KRAN-stun | Communities, A to Z (part 1) |
| Crescent Heights | KRES-ent heights | Communities, A to Z (part 1) |
| Crestmont | KREST-mont | Communities, A to Z (part 1) |
| Crowchild Trail | KROH-child trail | Communities and roads |
| Deerfoot Trail | DEER-foot trail | Communities and roads |
| Devonian Gardens | deh-VOH-nee-un gardens | Landmarks |
| Dover | DOH-ver | Communities, A to Z (part 1) |
| Edgemont | EDJ-mont | Communities, A to Z (part 1) |
| Edworthy Park | ED-wur-thee park | Landmarks |
| Elbow River | EL-boh river | Indigenous nations and places |
| Ephrem Brisebois | EF-rem BREEZ-bwah | Words from the December schedule |
| Evanston | EV-un-stun | Communities, A to Z (part 1) |
| Evergreen | EV-er-green | Communities, A to Z (part 1) |
| Fairview | FAIR-vyoo | Communities, A to Z (part 1) |
| Forest Lawn | FOR-est lawn | Communities, A to Z (part 1) |
| Glenbrook | GLEN-brook | Communities, A to Z (part 1) |
| Grey Cup | GRAY cup | Words from the December schedule |
| Guy Weadick | Guy WEE-dik | Words from the December schedule |
| Hawkwood | HAWK-wood | Communities, A to Z (part 1) |
| Huntington Hills | HUN-ting-tun hills | Communities, A to Z (part 1) |
| James Lougheed | James LAW-heed | Words from the December schedule |
| James Macleod | James muh-KLOWD | Words from the December schedule |
| Kelvin Grove | KEL-vin grove | Communities, A to Z (part 1) |
| Killarney | kih-LAR-nee | More communities |
| Lakeview | LAYK-vyoo | Communities, A to Z (part 1) |
| Livingston | LIV-ing-stun | Communities, A to Z (part 1) |
| Lougheed House | LAW-heed house | Landmarks |
| Lynnwood | LIN-wood | Communities, A to Z (part 1) |
| Macleod Trail | muh-KLOWD trail | Communities and roads |
| Manchester | MAN-ches-ter | Communities, A to Z (part 1) |
| Mayland Heights | MAY-lund heights | Communities, A to Z (part 1) |
| McMahon Stadium | mik-MAN stadium | Landmarks |
| Mewata Armoury | meh-WAH-tuh armoury | Landmarks |
| Mount Pleasant | mount PLEZ-ent | Communities, A to Z (part 1) |
| Nose Creek | NOHZ creek | Words from the December schedule |
| NWMP | North-West Mounted Police | Words from the December schedule |
| Ogden Shops | OG-den shops | Words from the December schedule |
| Olympic Plaza | oh-LIM-pik PLAH-zuh | Words from the December schedule |
| Panorama Hills | pan-uh-RAM-uh hills | Communities, A to Z (part 1) |
| Pat Burns | Pat BURNZ | Words from the December schedule |
| Penbrooke Meadows | PEN-brook meadows | Communities, A to Z (part 1) |
| Peter Lougheed | Peter LAW-heed | Words from the December schedule |
| Pineridge | PINE-ridge | Communities, A to Z (part 1) |
| Prince's Island Park | PRIN-siz island park | Landmarks |
| Redstone | RED-stone | Communities, A to Z (part 1) |
| Rideau Park | ree-DOH park | More communities |
| Sage Hill | SAYJ hill | Communities, A to Z (part 1) |
| Sarcee Trail | SAR-see trail | Indigenous nations and places |
| Shawnessy | SHAW-ness-ee | More communities |
| Shouldice Park | SHOWL-dice park | Landmarks |
| Sien Lok Park | SEEN LOK park | Landmarks |
| Siksikaitsitapi | sik-sik-AH-it-si-tah-pee | Indigenous nations and places |
| Skyview Ranch | SKY-vyoo ranch | Communities, A to Z (part 1) |
| Stampeders | STAMP-ee-derz | Words from the December schedule |
| Strathcona Park | strath-KOH-nuh park | More communities |
| Studio Bell | STOO-dee-oh bell | Words from the December schedule |
| Sunnyside | SUN-ee-side | Communities, A to Z (part 1) |
| The Bow (tower) | the BOH | Landmarks |
| Treaty 7 | treaty seven | Indigenous nations and places |
| Tsuut'ina Trail | tsoo-TIN-ah trail | Indigenous nations and places |
| Tuxedo Park | tuk-SEE-doh park | Communities, A to Z (part 1) |
| U of C | you of see | Words from the December schedule |
| Valley Ridge | VAL-ee ridge | Communities, A to Z (part 1) |
| Varsity | VAR-sih-tee | Communities, A to Z (part 1) |
| Walter Chell | Walter CHELL | Words from the December schedule |
| Wildwood | WILD-wood | Communities, A to Z (part 1) |
| Windsor Park | WIN-zur park | Communities, A to Z (part 1) |
| Winston Heights | WIN-stun heights | Communities, A to Z (part 1) |
| Îyârhe Nakoda | ee-YAH-hay nah-KOH-dah | Indigenous nations and places |

## Still to confirm with a Treaty 7 or local source

These are best approximations. Before a video leans on one, confirm it (Treaty 7 Nation websites, Glenbow, a local speaker) and update the voice list:

- Siksikaitsitapi (Blackfoot Confederacy), Niitsitapi, Kainai, Piikani (bee-GAH-nee), Îyârhe Nakoda (ee-YAH-hay)
- Haultain (Haultain School, Frederick Haultain): HALL-tun or HOLT-ain; the voice heard it as "Haltane"
- Beaulieu (Lougheed House's original name): BOH-lee-oo or BEW-lee

## Narration style rules

- Write numbers the way they are said ("two point four million", not "2.4M"); years as said ("nineteen eighty-eight").
- Spell out abbreviations unless they are said as letters ("Y Y C", "C P R"); SAIT is said as one word.
- No dotted abbreviations or a.m./p.m. in narration (PLAYBOOK section 4).
- Short sentences, with commas where a person would breathe.
- Listen to the first ten seconds of every narration before posting.
