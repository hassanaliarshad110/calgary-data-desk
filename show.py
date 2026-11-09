import schooltax as st, re
for y,u in st.CAPITAL_LISTS:
    L=st._pdf_lines(st._get(u))
    print('CHK ==',y,len(L))
    for i,l in enumerate(L):
        if re.search(r'total of|Edmonton|^Calgary|projects \(', l): print('CHK',y,i,l[:160])
