import os as _os
REPO = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))

"""
LIVE DEPLOY — Day-level out-speed normalization for 1/8 mile ONLY.
1/4 mile: no set adjustment, no day normalization (raw times).

Pipeline:
  1. Set adjustment on 1/8 mile (per-day, per-set → Set 1 baseline)
  2. Day normalization on 1/8 mile (shift eighth_out, quarter_out, decel to grand mean)
  3. Z-score within (sex, dist) cohorts
  4. 3-sigma clip, scale 0-100, tier/rank
"""
import json, statistics
from collections import defaultdict

JSON_PATH = f'{REPO}/src/lib/horse-data-obs-april-2026.json'

def fifths_to_sec(v):
    whole = int(v)
    frac = round((v - whole) * 10)
    return whole + frac * 0.2

def sec_to_fifths(s):
    whole = int(s)
    frac = s - whole
    fifths = round(frac / 0.2)
    if fifths >= 5: whole += 1; fifths = 0
    return round(whole + fifths / 10, 1)

def assign_tier(score):
    if score >= 80: return 'ELITE'
    if score >= 65: return 'STRONG'
    if score >= 50: return 'ABOVE AVG'
    if score >= 35: return 'AVERAGE'
    if score >= 20: return 'BELOW AVG'
    return 'WEAK'

with open(JSON_PATH) as f:
    all_horses = json.load(f)

BAD_DATA_HIPS = {'309', '523', '405'}  # Timing errors — exclude from scoring

breezed = []
for h in all_horses:
    if h.get('time') and h['time'] != '' and h.get('section') and h.get('day'):
        try:
            if float(h['time']) > 0 and str(h.get('hip','')) not in BAD_DATA_HIPS:
                breezed.append(h)
        except: pass

# Mark excluded horses
for h in all_horses:
    if str(h.get('hip','')) in BAD_DATA_HIPS:
        h['tier'] = 'EXCLUDED'
        h['rating'] = ''
        h['rank'] = ''

print(f"Total breezed: {len(breezed)}")

for h in breezed:
    h['_time'] = float(h['time'])
    h['_stride'] = float(h['stride']) if h.get('stride') and h['stride'] != '' else None
    h['_eighth'] = float(h['eighth_out']) if h.get('eighth_out') and h['eighth_out'] != '' else None
    h['_quarter'] = float(h['quarter_out']) if h.get('quarter_out') and h['quarter_out'] != '' else None
    h['_decel'] = float(h['decel']) if h.get('decel') and h['decel'] != '' else None
    h['_day'] = int(h['day'])
    h['_set'] = int(h['set']) if h.get('set') and h['set'] != '' else None
    h['_sex'] = h['sex'].upper()
    h['_dist'] = h['section']

# ── STEP 1: Set adjustment (1/8 mile only) ─────────────────────────────────
eg = defaultdict(lambda: defaultdict(list))
for h in breezed:
    if h['_dist'] == '1/8' and h['_set'] is not None:
        eg[(h['_sex'], h['_day'])][h['_set']].append(h)

for key, sets in eg.items():
    s1 = sets.get(1, [])
    if not s1:
        for sh in sets.values():
            for h in sh: h['_adj_time']=h['_time']; h['_adj_eighth']=h['_eighth']; h['_adj_quarter']=h['_quarter']
        continue
    s1t = statistics.mean([fifths_to_sec(h['_time']) for h in s1])
    s1ev = [h['_eighth'] for h in s1 if h['_eighth'] is not None]
    s1qv = [h['_quarter'] for h in s1 if h['_quarter'] is not None]
    s1e = statistics.mean(s1ev) if s1ev else None
    s1q = statistics.mean(s1qv) if s1qv else None
    for sn, sh in sets.items():
        if sn == 1:
            for h in sh: h['_adj_time']=h['_time']; h['_adj_eighth']=h['_eighth']; h['_adj_quarter']=h['_quarter']
        else:
            st = statistics.mean([fifths_to_sec(h['_time']) for h in sh])
            sev = [h['_eighth'] for h in sh if h['_eighth'] is not None]
            sqv = [h['_quarter'] for h in sh if h['_quarter'] is not None]
            se = statistics.mean(sev) if sev else None
            sq = statistics.mean(sqv) if sqv else None
            ta=s1t-st; ea=(s1e-se) if (s1e and se) else 0; qa=(s1q-sq) if (s1q and sq) else 0
            for h in sh:
                h['_adj_time']=sec_to_fifths(fifths_to_sec(h['_time'])+ta)
                h['_adj_eighth']=round(h['_eighth']+ea,2) if h['_eighth'] is not None else None
                h['_adj_quarter']=round(h['_quarter']+qa,2) if h['_quarter'] is not None else None

# 1/4 mile: raw pass-through
for h in breezed:
    if h['_dist'] == '1/4':
        h['_adj_time']=h['_time']; h['_adj_eighth']=h['_eighth']; h['_adj_quarter']=h['_quarter']

for h in breezed:
    if '_adj_time' not in h:
        h['_adj_time']=h['_time']; h['_adj_eighth']=h['_eighth']; h['_adj_quarter']=h['_quarter']

for h in breezed:
    h['_adj_decel'] = round(h['_adj_quarter']-h['_adj_eighth'],2) if (h.get('_adj_quarter') is not None and h.get('_adj_eighth') is not None) else h['_decel']

# ── STEP 2: Day normalization (1/8 mile ONLY) ──────────────────────────────
dng = defaultdict(lambda: defaultdict(list))
for h in breezed:
    if h['_dist'] == '1/8':
        dng[(h['_sex'], h['_dist'])][h['_day']].append(h)

print("\nDay normalization shifts (1/8 mile only):")
for (sex, dist), dg in dng.items():
    label = f"{'Colts' if sex=='C' else 'Fillies'} {dist}"
    all_e = [h['_adj_eighth'] for dh in dg.values() for h in dh if h['_adj_eighth'] is not None]
    all_q = [h['_adj_quarter'] for dh in dg.values() for h in dh if h['_adj_quarter'] is not None]
    all_d = [h['_adj_decel'] for dh in dg.values() for h in dh if h['_adj_decel'] is not None]
    ge = statistics.mean(all_e) if all_e else 0
    gq = statistics.mean(all_q) if all_q else 0
    gd = statistics.mean(all_d) if all_d else 0
    print(f"\n  {label} grand means: 8th={ge:.3f} Qtr={gq:.3f} Decel={gd:.3f}")
    for day, dh in sorted(dg.items()):
        de=[h['_adj_eighth'] for h in dh if h['_adj_eighth'] is not None]
        dq=[h['_adj_quarter'] for h in dh if h['_adj_quarter'] is not None]
        dd=[h['_adj_decel'] for h in dh if h['_adj_decel'] is not None]
        es=ge-(statistics.mean(de) if de else ge)
        qs=gq-(statistics.mean(dq) if dq else gq)
        ds=gd-(statistics.mean(dd) if dd else gd)
        print(f"    Day {day} (n={len(dh)}): 8th {es:+.3f}  Qtr {qs:+.3f}  Decel {ds:+.3f}")
        for h in dh:
            if h['_adj_eighth'] is not None: h['_adj_eighth']=round(h['_adj_eighth']+es,2)
            if h['_adj_quarter'] is not None: h['_adj_quarter']=round(h['_adj_quarter']+qs,2)
            if h['_adj_decel'] is not None: h['_adj_decel']=round(h['_adj_decel']+ds,2)

# ── STEP 3: Z-scores ───────────────────────────────────────────────────────
WEIGHTS = {
    ('C','1/8'):{'time':0.20,'stride':0.30,'qtr_out':0.30,'decel':0.20},
    ('C','1/4'):{'time':0.15,'stride':0.35,'qtr_out':0.30,'decel':0.20},
    ('F','1/8'):{'time':0.20,'stride':0.20,'qtr_out':0.35,'decel':0.25},
    ('F','1/4'):{'time':0.15,'stride':0.25,'qtr_out':0.35,'decel':0.25},
}

# Hip 1056 is an outlier that compresses the entire C/1/8 field.
# Exclude from stats/scaling, hardcode at 100, cap rest at 99.
OUTLIER_CEILING_HIPS = {'1056'}

cohorts = defaultdict(list)
for h in breezed: cohorts[(h['_sex'],h['_dist'])].append(h)

for (sex,dist),cohort in cohorts.items():
    w=WEIGHTS[(sex,dist)]
    # For C/1/8: compute stats from population excluding ceiling outliers
    if (sex,dist) == ('C','1/8'):
        pop = [h for h in cohort if str(h['hip']) not in OUTLIER_CEILING_HIPS]
    else:
        pop = cohort
    ts=[fifths_to_sec(h['_adj_time']) for h in pop]
    st=[h['_stride'] for h in pop if h['_stride'] is not None]
    ei=[h['_adj_eighth'] for h in pop if h['_adj_eighth'] is not None]
    de=[h['_adj_decel'] for h in pop if h['_adj_decel'] is not None]
    tm,td=statistics.mean(ts),(statistics.stdev(ts) if len(ts)>1 else 1)
    sm,sd_=(statistics.mean(st) if st else 0),(statistics.stdev(st) if len(st)>1 else 1)
    em,ed=(statistics.mean(ei) if ei else 0),(statistics.stdev(ei) if len(ei)>1 else 1)
    dm,dd=(statistics.mean(de) if de else 0),(statistics.stdev(de) if len(de)>1 else 1)
    for h in cohort:
        tsec=fifths_to_sec(h['_adj_time'])
        h['_z_time']=-((tsec-tm)/td) if td>0 else 0
        h['_z_stride']=((h['_stride']-sm)/sd_) if (h['_stride'] is not None and sd_>0) else 0
        h['_z_eighth']=-((h['_adj_eighth']-em)/ed) if (h['_adj_eighth'] is not None and ed>0) else 0
        h['_z_decel']=-((h['_adj_decel']-dm)/dd) if (h['_adj_decel'] is not None and dd>0) else 0
        h['_composite']=w['time']*h['_z_time']+w['stride']*h['_z_stride']+w['qtr_out']*h['_z_eighth']+w['decel']*h['_z_decel']

# ── STEP 4: Scale, tier, rank ──────────────────────────────────────────────
for (sex,dist),cohort in cohorts.items():
    if (sex,dist) == ('C','1/8'):
        # Scale without ceiling outliers, cap at 99, hardcode outliers at 100
        pop = [h for h in cohort if str(h['hip']) not in OUTLIER_CEILING_HIPS]
        outliers = [h for h in cohort if str(h['hip']) in OUTLIER_CEILING_HIPS]
        comps=[h['_composite'] for h in pop]
        mu=statistics.mean(comps); sd=statistics.stdev(comps) if len(comps)>1 else 1
        cl,ch=mu-3*sd,mu+3*sd
        clipped=[max(cl,min(ch,h['_composite'])) for h in pop]
        cmin,cmax=min(clipped),max(clipped); cr=cmax-cmin if cmax!=cmin else 1
        for h,cv in zip(pop,clipped): h['_score']=round(min(((cv-cmin)/cr)*100, 99),1)
        for h in outliers: h['_score']=100.0
    else:
        comps=[h['_composite'] for h in cohort]
        mu=statistics.mean(comps); sd=statistics.stdev(comps) if len(comps)>1 else 1
        cl,ch=mu-3*sd,mu+3*sd
        clipped=[max(cl,min(ch,h['_composite'])) for h in cohort]
        cmin,cmax=min(clipped),max(clipped); cr=cmax-cmin if cmax!=cmin else 1
        for h,cv in zip(cohort,clipped): h['_score']=round(((cv-cmin)/cr)*100,1)
    cohort.sort(key=lambda x: x['_score'], reverse=True)
    for i,h in enumerate(cohort):
        h['_rank']=i+1; h['_tier']=assign_tier(h['_score'])
    tiers=defaultdict(int)
    for h in cohort: tiers[h['_tier']]+=1
    print(f"\n{sex}/{dist} ({len(cohort)}): ELITE={tiers['ELITE']} STRONG={tiers['STRONG']} ABOVE={tiers['ABOVE AVG']} AVG={tiers['AVERAGE']} BELOW={tiers['BELOW AVG']} WEAK={tiers['WEAK']}")

# ── STEP 5: Write back ─────────────────────────────────────────────────────
scored = {str(h['hip']): h for h in breezed}

for h in all_horses:
    hip = str(h.get('hip',''))
    if hip in scored:
        s = scored[hip]
        h['rank'] = str(s['_rank'])
        h['rating'] = str(s['_score'])
        h['tier'] = s['_tier']
        h['adj_time'] = str(round(fifths_to_sec(s['_adj_time']),2))
        h['adj_eighth_out'] = str(round(s['_adj_eighth'],2)) if s['_adj_eighth'] is not None else ''
        h['adj_quarter_out'] = str(round(s['_adj_quarter'],2)) if s['_adj_quarter'] is not None else ''
        h['adj_decel'] = str(round(s['_adj_decel'],2)) if s['_adj_decel'] is not None else ''

# Clean working fields
for h in all_horses:
    for k in [k for k in h.keys() if k.startswith('_')]:
        del h[k]

with open(JSON_PATH, 'w') as f:
    json.dump(all_horses, f, indent=2)

print(f"\nSaved to {JSON_PATH}")
