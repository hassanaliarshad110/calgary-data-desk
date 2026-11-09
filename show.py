import schooltax as st
for y,u,a,b in [(2026,st.CAPITAL_LISTS[0][1],44,95),(2025,st.CAPITAL_LISTS[1][1],56,119)]:
    L=st._pdf_lines(st._get(u))
    for i in range(a,min(b,len(L))): print('CHK',y,i,L[i][:120])
