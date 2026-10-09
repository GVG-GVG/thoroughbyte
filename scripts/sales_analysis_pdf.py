import os as _os
REPO = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))

import json, statistics
from collections import defaultdict
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT

OUTPUT = f'{REPO}/obs-april-2026-sales-analysis.pdf'

with open(f'{REPO}/src/lib/horse-data-obs-april-2026.json') as f:
    data = json.load(f)

TIER_COLORS = {
    'ELITE':     {'text': '#2d6a4f'},
    'STRONG':    {'text': '#5a9e68'},
    'ABOVE AVG': {'text': '#a89e40'},
    'AVERAGE':   {'text': '#808080'},
    'BELOW AVG': {'text': '#c87a5a'},
    'WEAK':      {'text': '#b83c3c'},
}

HEADER_BG = colors.HexColor('#3d5a80')
HEADER_TEXT = colors.white
ALT_ROW = colors.HexColor('#f8f9fa')
GRID_COLOR = colors.HexColor('#dee2e6')

styles = getSampleStyleSheet()

# Cell paragraph styles
cell_c = ParagraphStyle('cellC', parent=styles['Normal'], fontSize=7, leading=8.5, alignment=TA_CENTER)
cell_l = ParagraphStyle('cellL', parent=styles['Normal'], fontSize=7, leading=8.5, alignment=TA_LEFT)
cell_cb = ParagraphStyle('cellCB', parent=styles['Normal'], fontSize=7, leading=8.5, alignment=TA_CENTER, fontName='Helvetica-Bold')
cell_lb = ParagraphStyle('cellLB', parent=styles['Normal'], fontSize=7, leading=8.5, alignment=TA_LEFT, fontName='Helvetica-Bold')
hdr_style = ParagraphStyle('hdr', parent=styles['Normal'], fontSize=7, leading=8.5, alignment=TA_CENTER, fontName='Helvetica-Bold', textColor=colors.white)

def P(text, style=cell_c):
    return Paragraph(str(text), style)

def Ptier(tier):
    c = TIER_COLORS.get(tier, {}).get('text', '#333333')
    s = ParagraphStyle(f'tier_{tier}', parent=cell_cb, textColor=colors.HexColor(c))
    return Paragraph(str(tier), s)

def fmt_price(v):
    if v == 0: return '-'
    return f'${v:,.0f}'

def fmt_pct(v):
    return f'{v:.0f}%'

# Categorize
sold_horses = [h for h in data if h.get('sale_status') in ('SOLD', 'POST-SALE')]
rna_horses = [h for h in data if h.get('sale_status') == 'RNA']
out_horses = [h for h in data if h.get('sale_status') == 'OUT']
pending = [h for h in data if not h.get('sale_status') or h['sale_status'] == '']

cataloged = len(data)
withdrawn = len(out_horses)
thru_ring = len(sold_horses) + len(rna_horses)
sold_prices = sorted([int(h['sale_price']) for h in sold_horses if h.get('sale_price')])
rna_prices = [int(h['sale_price']) for h in rna_horses if h.get('sale_price')]

def make_table(header_texts, rows, col_widths):
    """header_texts: list of strings. rows: list of lists of Paragraph objects."""
    header = [P(h, hdr_style) for h in header_texts]
    table_data = [header] + rows
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, GRID_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
    ]
    for i in range(1, len(table_data)):
        if i % 2 == 0:
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), ALT_ROW))
    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle(style_cmds))
    return t

# ─── Build PDF ───
doc = SimpleDocTemplate(OUTPUT, pagesize=letter,
                        topMargin=0.5*inch, bottomMargin=0.5*inch,
                        leftMargin=0.5*inch, rightMargin=0.5*inch)
title_style = ParagraphStyle('T', parent=styles['Title'], fontSize=18, spaceAfter=2, alignment=TA_CENTER)
subtitle_style = ParagraphStyle('Sub', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#666666'), alignment=TA_CENTER, spaceAfter=12)
section_style = ParagraphStyle('Sec', parent=styles['Heading2'], fontSize=13, spaceBefore=14, spaceAfter=6, textColor=colors.HexColor('#1a1a2e'))
footer_style = ParagraphStyle('Ft', parent=styles['Normal'], fontSize=7.5, textColor=colors.HexColor('#999999'))

story = []

# ─── PAGE 1 ───
story.append(Paragraph("OBS April 2026 - Sales Analysis", title_style))
story.append(Paragraph("Final Results | Days 1-4 | April 14-17, 2026 | Ranked Horses Only", subtitle_style))

story.append(Paragraph("Sale Overview", section_style))
story.append(Paragraph("Performance at auction by rating tier (ranked horses, N=%d)" % thru_ring, footer_style))
story.append(Spacer(1, 4))

# Overview
overview_header = ['Cataloged', 'Withdrawn', 'Thru Ring', 'Sold', 'RNA', 'Sell Rate', 'Total Sales', 'Average', 'Median', 'High Sale']
overview_row = [[P(str(cataloged)), P(str(withdrawn)), P(str(thru_ring)), P(str(len(sold_horses))), P(str(len(rna_horses))),
    P(fmt_pct(len(sold_horses)/thru_ring*100)), P(fmt_price(sum(sold_prices))),
    P(fmt_price(statistics.mean(sold_prices))), P(fmt_price(statistics.median(sold_prices))), P(fmt_price(max(sold_prices)))]]
story.append(make_table(overview_header, overview_row, [0.75*inch]*10))

# Tier Breakdown
story.append(Paragraph("Tier Breakdown", section_style))
tier_header = ['Tier', 'Thru Ring', 'Sold', 'RNA', 'Sell Rate', 'Total Sales', 'Avg Price', 'Median', 'High', 'Low', 'Avg RNA']
tier_rows = []
tiers_order = ['ELITE', 'STRONG', 'ABOVE AVG', 'AVERAGE', 'BELOW AVG', 'WEAK']
total_thru = 0; total_sold_n = 0; total_rna_n = 0; total_sales = 0
for tier in tiers_order:
    t_sold = [h for h in sold_horses if h.get('tier') == tier]
    t_rna = [h for h in rna_horses if h.get('tier') == tier]
    t_thru = len(t_sold) + len(t_rna)
    prices = sorted([int(h['sale_price']) for h in t_sold if h.get('sale_price')])
    rna_p = [int(h['sale_price']) for h in t_rna if h.get('sale_price')]
    total_thru += t_thru; total_sold_n += len(t_sold); total_rna_n += len(t_rna)
    if prices: total_sales += sum(prices)
    tier_rows.append([
        Ptier(tier), P(str(t_thru)), P(str(len(t_sold))), P(str(len(t_rna))),
        P(fmt_pct(len(t_sold)/t_thru*100) if t_thru else '-'),
        P(fmt_price(sum(prices)) if prices else '-'),
        P(fmt_price(statistics.mean(prices)) if prices else '-'),
        P(fmt_price(statistics.median(prices)) if prices else '-'),
        P(fmt_price(max(prices)) if prices else '-'),
        P(fmt_price(min(prices)) if prices else '-'),
        P(fmt_price(statistics.mean(rna_p)) if rna_p else '-'),
    ])
tier_rows.append([
    P('TOTAL', cell_cb), P(str(total_thru), cell_cb), P(str(total_sold_n), cell_cb), P(str(total_rna_n), cell_cb),
    P(fmt_pct(total_sold_n/total_thru*100) if total_thru else '-', cell_cb),
    P(fmt_price(total_sales), cell_cb),
    P(fmt_price(statistics.mean(sold_prices)), cell_cb),
    P(fmt_price(statistics.median(sold_prices)), cell_cb),
    P(fmt_price(max(sold_prices)), cell_cb),
    P('-', cell_cb), P('-', cell_cb)
])
tw = [0.68*inch, 0.55*inch, 0.42*inch, 0.38*inch, 0.5*inch, 0.82*inch, 0.72*inch, 0.68*inch, 0.72*inch, 0.6*inch, 0.68*inch]
t = make_table(tier_header, tier_rows, tw)
total_idx = len(tier_rows)
t.setStyle(TableStyle([('LINEABOVE', (0, total_idx), (-1, total_idx), 1, colors.HexColor('#333333'))]))
story.append(t)

# By Sex
story.append(Paragraph("By Sex", section_style))
sex_header = ['', 'Thru Ring', 'Sold', 'RNA', 'Sell Rate', 'Avg Price', 'Median', 'High', 'Total Sales']
sex_rows = []
for sex, label in [('C','Colts'), ('F','Fillies')]:
    s = [h for h in sold_horses if h.get('sex','').upper() == sex]
    r = [h for h in rna_horses if h.get('sex','').upper() == sex]
    thru = len(s) + len(r)
    prices = [int(h['sale_price']) for h in s if h.get('sale_price')]
    sex_rows.append([P(label, cell_lb), P(str(thru)), P(str(len(s))), P(str(len(r))),
        P(fmt_pct(len(s)/thru*100) if thru else '-'),
        P(fmt_price(statistics.mean(prices)) if prices else '-'),
        P(fmt_price(statistics.median(prices)) if prices else '-'),
        P(fmt_price(max(prices)) if prices else '-'),
        P(fmt_price(sum(prices)) if prices else '-')])
sw = [0.7*inch, 0.7*inch, 0.6*inch, 0.5*inch, 0.7*inch, 0.85*inch, 0.8*inch, 0.9*inch, 0.95*inch]
story.append(make_table(sex_header, sex_rows, sw))

# By Breeze Distance
story.append(Paragraph("By Breeze Distance", section_style))
dist_rows = []
for dist in ['1/8 Mile', '1/4 Mile']:
    d = '1/8' if '1/8' in dist else '1/4'
    s = [h for h in sold_horses if h.get('section') == d]
    r = [h for h in rna_horses if h.get('section') == d]
    thru = len(s) + len(r)
    prices = [int(h['sale_price']) for h in s if h.get('sale_price')]
    dist_rows.append([P(dist, cell_lb), P(str(thru)), P(str(len(s))), P(str(len(r))),
        P(fmt_pct(len(s)/thru*100) if thru else '-'),
        P(fmt_price(statistics.mean(prices)) if prices else '-'),
        P(fmt_price(statistics.median(prices)) if prices else '-'),
        P(fmt_price(max(prices)) if prices else '-'),
        P(fmt_price(sum(prices)) if prices else '-')])
story.append(make_table(sex_header, dist_rows, sw))

# Sell Rate by Tier & Sex
story.append(Paragraph("Sell Rate by Tier & Sex", section_style))
ts_header = ['Tier', 'C Thru', 'C Sold', 'C Rate', 'C Avg $', 'F Thru', 'F Sold', 'F Rate', 'F Avg $']
ts_rows = []
for tier in tiers_order:
    row = [Ptier(tier)]
    for sex in ['C', 'F']:
        s = [h for h in sold_horses if h.get('tier')==tier and h.get('sex','').upper()==sex]
        r = [h for h in rna_horses if h.get('tier')==tier and h.get('sex','').upper()==sex]
        thru = len(s) + len(r)
        prices = [int(h['sale_price']) for h in s if h.get('sale_price')]
        row.extend([P(str(thru)), P(str(len(s))),
            P(fmt_pct(len(s)/thru*100) if thru else '-'),
            P(fmt_price(statistics.mean(prices)) if prices else '-')])
    ts_rows.append(row)
tsw = [0.75*inch, 0.55*inch, 0.55*inch, 0.55*inch, 0.85*inch, 0.55*inch, 0.55*inch, 0.55*inch, 0.85*inch]
story.append(make_table(ts_header, ts_rows, tsw))

# ─── PAGE 2: Top 10 ───
story.append(PageBreak())
story.append(Paragraph("Top 10 Sales (Ranked Horses)", section_style))
top10 = sorted(sold_horses, key=lambda h: int(h.get('sale_price','0')), reverse=True)[:10]
top_header = ['Hip', 'Sex', 'Sire', 'Dam', 'Consigner', 'Tier', 'Rating', 'Rank', 'Price', 'Buyer']
top_rows = []
for h in top10:
    top_rows.append([
        P(str(h['hip'])),
        P(h['sex']),
        P(h['sire'], cell_l),
        P(h['dam'], cell_l),
        P(h.get('consigner',''), cell_l),
        Ptier(h.get('tier','')),
        P(h.get('rating','')),
        P('#'+str(h.get('rank','')) if h.get('rank') else ''),
        P(fmt_price(int(h['sale_price']))),
        P(h.get('buyer',''), cell_l),
    ])
topw = [0.35*inch, 0.28*inch, 0.82*inch, 0.78*inch, 1.05*inch, 0.62*inch, 0.42*inch, 0.38*inch, 0.72*inch, 1.78*inch]
story.append(make_table(top_header, top_rows, topw))

# ─── Sire Analysis ───
story.append(Paragraph("Average Price Sold by Stallion", section_style))
story.append(Paragraph("All sires with at least 1 sale, sorted by average price", footer_style))
story.append(Spacer(1, 4))

sire_data = defaultdict(lambda: {'sold':[], 'rna':[]})
for h in sold_horses:
    sire_data[h['sire']]['sold'].append(int(h['sale_price']))
for h in rna_horses:
    sire_data[h['sire']]['rna'].append(int(h['sale_price']))

sire_list = []
for sire, d in sire_data.items():
    thru = len(d['sold']) + len(d['rna'])
    if d['sold']:
        sire_list.append({
            'sire': sire, 'thru': thru, 'sold': len(d['sold']), 'rna': len(d['rna']),
            'rate': len(d['sold'])/thru*100,
            'avg': statistics.mean(d['sold']), 'med': statistics.median(d['sold']),
            'high': max(d['sold']), 'total': sum(d['sold'])
        })
sire_list.sort(key=lambda x: x['avg'], reverse=True)

multi = [s for s in sire_list if s['sold'] >= 2]
single = [s for s in sire_list if s['sold'] == 1]

sire_header = ['Stallion', 'Thru Ring', 'Sold', 'RNA', 'Sell Rate', 'Avg Price', 'Median', 'High', 'Total Sales']
sirew = [1.2*inch, 0.6*inch, 0.45*inch, 0.4*inch, 0.6*inch, 0.8*inch, 0.75*inch, 0.8*inch, 0.85*inch]

def sire_rows_data(sires):
    rows = []
    for s in sires:
        rows.append([P(s['sire'], cell_l), P(str(s['thru'])), P(str(s['sold'])), P(str(s['rna'])),
            P(fmt_pct(s['rate'])), P(fmt_price(s['avg'])), P(fmt_price(s['med'])),
            P(fmt_price(s['high'])), P(fmt_price(s['total']))])
    return rows

story.append(Paragraph("2+ Sold", ParagraphStyle('s2', parent=styles['Normal'], fontSize=10, fontName='Helvetica-Bold', spaceBefore=8, spaceAfter=4)))
story.append(make_table(sire_header, sire_rows_data(multi), sirew))

story.append(PageBreak())
story.append(Paragraph("1 Sold", ParagraphStyle('s1', parent=styles['Normal'], fontSize=10, fontName='Helvetica-Bold', spaceBefore=8, spaceAfter=4)))
story.append(make_table(sire_header, sire_rows_data(single), sirew))

# Footer
def add_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(colors.HexColor('#999999'))
    canvas.drawString(0.5*inch, 0.35*inch, 'ThoroughByte Analytics')
    canvas.drawCentredString(letter[0]/2, 0.35*inch, f'Page {doc.page}')
    canvas.drawRightString(letter[0]-0.5*inch, 0.35*inch, 'OBS APR 2026 FINAL')
    canvas.restoreState()

doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
print(f"Saved to {OUTPUT}")
