import schooltax as st
print('CHK', [st.parse_capital(st._pdf_lines(st._get(u)), y, ['Airdrie','Beaumont','Brooks','Calgary','Edmonton','Cochrane','Lethbridge','Red Deer','St. Albert','Spruce Grove','Legal','Lac La Biche','Grande Prairie','Morinville','Chestermere','Okotoks','Fort Saskatchewan','Cold Lake','Fairview']) for y,u in st.CAPITAL_LISTS[:2]])
