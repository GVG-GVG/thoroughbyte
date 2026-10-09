import os as _os
REPO = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))

import json
from collections import defaultdict
import statistics
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

OUTPUT = f'{REPO}/sire_stride_colts_vs_fillies.pdf'

files = [
    ('OBS Mar 2024', f'{REPO}/src/lib/horse-data-obs-march-2024.json'),
    ('OBS Apr 2024', f'{REPO}/src/lib/horse-data-obs-april-2024.json'),
    ('OBS Mar 2025', f'{REPO}/src/lib/horse-data-obs-march-2025.json'),
    ('OBS Apr 2025', f'{REPO}/src/lib/horse-data-obs-april-2025.json'),
    ('OBS Apr 2026', f'{REPO}/src/lib/horse-data-obs-april-2026.json'),
]

data = defaultdict(lambda: {'C': [], 'F': []})

for label, path in files:
    with open(path) as f:
        horses = json.load(f)
    for h in horses:
        stride = h.get('stride', '')
        sex = h.get('sex', '').upper()
        sire = h.get('sire', '')
        if not stride or stride == '' or not sire or sex not in ('C', 'F'):
            continue
        try:
            s = float(stride)
            if s > 0:
                data[sire][sex].append(s)
        except:
            pass

both = {sire: v for sire, v in data.items() if len(v['C']) >= 1 and len(v['F']) >= 1}

results = []
for sire, v in both.items():
    c_avg = statistics.mean(v['C'])
    f_avg = statistics.mean(v['F'])
    diff = c_avg - f_avg
    results.append((sire, len(v['C']), c_avg, len(v['F']), f_avg, diff, len(v['C']) + len(v['F'])))

results.sort(key=lambda x: x[5], reverse=True)

# Overall stats
all_c = [s for v in data.values() for s in v['C']]
all_f = [s for v in data.values() for s in v['F']]
overall_c = statistics.mean(all_c)
overall_f = statistics.mean(all_f)
overall_diff = overall_c - overall_f

# Build PDF
doc = SimpleDocTemplate(OUTPUT, pagesize=landscape(letter),
                        topMargin=0.5*inch, bottomMargin=0.5*inch,
                        leftMargin=0.5*inch, rightMargin=0.5*inch)
styles = getSampleStyleSheet()

title_style = ParagraphStyle('CustomTitle', parent=styles['Title'], fontSize=18, spaceAfter=6)
subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=11, textColor=colors.HexColor('#555555'), spaceAfter=4)
note_style = ParagraphStyle('Note', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#777777'), spaceAfter=12)

story = []
story.append(Paragraph("Sire Stride Length: Colts vs Fillies", title_style))
story.append(Paragraph("OBS 2-Year-Old Sales 2024-2026 (5 Sales Combined)", subtitle_style))
story.append(Paragraph(
    f"Overall: Colts {overall_c:.2f} ft (n={len(all_c)}) | Fillies {overall_f:.2f} ft (n={len(all_f)}) | Diff: +{overall_diff:.2f} ft",
    subtitle_style))
story.append(Paragraph("Sorted by colt-filly stride differential (descending). Only sires with both colts and fillies shown.", note_style))

# Table header
header = ['Sire', 'Colts (n)', 'Colt Avg', 'Fillies (n)', 'Filly Avg', 'Diff (ft)', 'Total (n)']

# Split into chunks for pagination
rows_per_page = 42

for page_start in range(0, len(results), rows_per_page):
    chunk = results[page_start:page_start + rows_per_page]
    table_data = [header]
    for sire, cn, ca, fn, fa, d, total in chunk:
        diff_str = f"+{d:.2f}" if d >= 0 else f"{d:.2f}"
        table_data.append([sire, str(cn), f"{ca:.2f}", str(fn), f"{fa:.2f}", diff_str, str(total)])

    col_widths = [2.8*inch, 0.8*inch, 0.9*inch, 0.9*inch, 0.9*inch, 0.9*inch, 0.8*inch]
    t = Table(table_data, colWidths=col_widths, repeatRows=1)

    # Color rows by diff
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('FONTSIZE', (0, 1), (-1, -1), 7.5),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]

    # Highlight diff column: green for positive, red for negative
    for i, (sire, cn, ca, fn, fa, d, total) in enumerate(chunk):
        row = i + 1
        if d >= 1.0:
            style_cmds.append(('TEXTCOLOR', (5, row), (5, row), colors.HexColor('#006400')))
            style_cmds.append(('FONTNAME', (5, row), (5, row), 'Helvetica-Bold'))
        elif d >= 0.5:
            style_cmds.append(('TEXTCOLOR', (5, row), (5, row), colors.HexColor('#228B22')))
        elif d >= 0:
            style_cmds.append(('TEXTCOLOR', (5, row), (5, row), colors.HexColor('#555555')))
        elif d >= -0.5:
            style_cmds.append(('TEXTCOLOR', (5, row), (5, row), colors.HexColor('#CC6600')))
        else:
            style_cmds.append(('TEXTCOLOR', (5, row), (5, row), colors.HexColor('#CC0000')))
            style_cmds.append(('FONTNAME', (5, row), (5, row), 'Helvetica-Bold'))

    t.setStyle(TableStyle(style_cmds))
    story.append(t)
    if page_start + rows_per_page < len(results):
        story.append(PageBreak())

# Summary page
story.append(PageBreak())
story.append(Paragraph("Summary", styles['Heading1']))
story.append(Spacer(1, 12))

# Top 10 largest dimorphism (min 5 total)
big_sample = [r for r in results if r[6] >= 5]
top10 = big_sample[:10]
bot10 = big_sample[-10:]

story.append(Paragraph("Top 10 Sires by Colt-Filly Stride Gap (min 5 horses)", styles['Heading2']))
story.append(Spacer(1, 6))
t_data = [header]
for sire, cn, ca, fn, fa, d, total in top10:
    t_data.append([sire, str(cn), f"{ca:.2f}", str(fn), f"{fa:.2f}", f"+{d:.2f}", str(total)])
t = Table(t_data, colWidths=col_widths, repeatRows=1)
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 8),
    ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
    ('TEXTCOLOR', (5, 1), (5, -1), colors.HexColor('#006400')),
    ('FONTNAME', (5, 1), (5, -1), 'Helvetica-Bold'),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
]))
story.append(t)

story.append(Spacer(1, 20))
story.append(Paragraph("Bottom 10 Sires (Fillies Stride Longer, min 5 horses)", styles['Heading2']))
story.append(Spacer(1, 6))
t_data = [header]
for sire, cn, ca, fn, fa, d, total in bot10:
    diff_str = f"+{d:.2f}" if d >= 0 else f"{d:.2f}"
    t_data.append([sire, str(cn), f"{ca:.2f}", str(fn), f"{fa:.2f}", diff_str, str(total)])
t = Table(t_data, colWidths=col_widths, repeatRows=1)
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 8),
    ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
    ('TEXTCOLOR', (5, 1), (5, -1), colors.HexColor('#CC0000')),
    ('FONTNAME', (5, 1), (5, -1), 'Helvetica-Bold'),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
]))
story.append(t)

story.append(Spacer(1, 20))
story.append(Paragraph(f"192 sires with both colts and fillies across 5 OBS sales. {len(all_c)} colts, {len(all_f)} fillies total.", note_style))
story.append(Paragraph("Data: OBS March 2024, April 2024, March 2025, April 2025, April 2026. Stride lengths from EQUIX ProStride.", note_style))
story.append(Paragraph("ThoroughByte Research | April 2026", note_style))

doc.build(story)
print(f"Saved to {OUTPUT}")
