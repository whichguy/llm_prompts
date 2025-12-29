# ULTRA FAT FIRE v8.4.5

Token-optimized FIRE analysis for high-net-worth clients ($450K+ spending).

## CONVENTIONS

```yaml
# Types: $ = USD whole, % = 0-1 ratio
# Abbreviations (use throughout):
ord: ordinary income        pref: preferential (LTCG/QD)
trad: traditional IRA/401k  gr: gain_ratio = (val-basis)/val
ded: deduction             uded: unused deduction space
eff: effective_rate        st: state        marg: marginal
brk: bracket               th: threshold    cap: capacity
bal: balance               ret: return      wd: withdrawal
inc: income                exp: expenses
```

## §1 GUARD RAILS

```yaml
NEVER:
  rate_denom:
    wrong: "rate = wd / (taxable + trad + roth + home + 529 + DAF)"
    right: "rate = wd / (taxable + trad + roth)"
    why: "Only FIRE-eligible assets"
    
  taxable_tax:
    wrong: "tax = wd × ltcg_rate"
    right: "tax = wd × gr × ltcg_rate"
    why: "Only gains taxed"
    example: "$100K wd, 60% gr, 15% rate → $9K not $15K"
    
  wd_order:
    wrong: "[roth, trad, taxable]"
    right: "[rmd, taxable@0%, trad@0%(uded), taxable@15%, trad@10%+, roth]"
    
  salt: { cap: 10000 }
  iso_spread: "AMT preference, not ordinary"
  qd_stack: "QD + LTCG stack together"
  medical_floor: "max(0, med - AGI × 0.075)"
  charitable: "≤ AGI × 0.60 cash, ≤ 0.30 appreciated"

ALWAYS:
  basis_aware: "eff = gr × (fed + st + niit)"
  healthcare: "exp = base + medical + irmaa"
  balance: "|inc.net + wd.net - exp| < $100"
  niit_split: "Split at $250K mfj, $200K single"
  lot_select: "Highest-basis first"
  gross_up: "gross = net / (1 - eff)"
  ss_earnings: "Pre-FRA earned income reduces SS by (earned - $22K) / 2"
```

## §2 REFERENCE TABLES (2025)

```javascript
const TAX = {
  // Federal ordinary: [floor, rate]
  ord: {
    mfj: [[0,.10],[23850,.12],[96950,.22],[206700,.24],[394600,.32],[501050,.35],[751600,.37]],
    single: [[0,.10],[11925,.12],[48475,.22],[103350,.24],[197300,.32],[250525,.35],[626350,.37]]
  },
  // LTCG/QD: [floor, rate]
  ltcg: {
    mfj: [[0,0],[96700,.15],[600050,.20]],
    single: [[0,0],[48350,.15],[533400,.20]]
  },
  sd: { mfj: 30000, single: 15000, over65: 1600 },
  niit: { mfj: 250000, single: 200000, rate: .038 },
  salt_cap: 10000,
  mort_limit: 750000,
  charitable: { cash: .60, apprec: .30 },
  med_floor: .075,
  
  // AMT
  amt: {
    exempt: { mfj: 133300, single: 85700 },
    phaseout: { mfj: 1218700, single: 609350 },
    rates: [.26, .28], brk: 232600
  },
  
  // Estate
  estate: { exempt: 13990000, rate: .40 },
  estate_sunset: { yr: 2026, exempt: 7000000 },
  
  // Social Security
  ss: {
    tax_th: { mfj: [32000, 44000], single: [25000, 34000] },
    fra: 67,
    bend: [1226, 7391],
    pia_rates: [.90, .32, .15],
    delay_credit: .08,  // per year past FRA
    // Monthly reduction rates (5/9% first 36mo, 5/12% after)
    early_red_mo: [5/900, 5/1200],  // .005556, .004167
    earn_th: 22320  // 2024 earnings test threshold
  },
  
  // RMD (Uniform Lifetime)
  rmd: { 73:26.5, 74:25.5, 75:24.6, 76:23.7, 77:22.9, 78:22.0, 79:21.1, 80:20.2,
         81:19.4, 82:18.5, 83:17.7, 84:16.8, 85:16.0, 86:15.2, 87:14.4, 88:13.7,
         89:12.9, 90:12.2, 91:11.5, 92:10.8, 93:10.1, 94:9.5, 95:8.9 }
};

// IRMAA (2025): [magi_ceil, partB, partD]
const IRMAA = {
  mfj: [[206000,185,0],[258000,259,13.70],[322000,370,35.30],
        [386000,480.90,57],[750000,591.90,78.60],[Infinity,628.90,85.80]],
  single: [[103000,185,0],[129000,259,13.70],[161000,370,35.30],
           [193000,480.90,57],[500000,591.90,78.60],[Infinity,628.90,85.80]]
};

// ACA
const ACA = { fpl_base: 15650, fpl_add: 5500, cliff: 4.0, max_prem: .085 };

// State: [floor, rate]
const NO_TAX = [[0,0]];
const STATE = {
  CA: { brk: [[0,.01],[20824,.02],[49368,.04],[77918,.06],[108162,.08],
              [136700,.093],[698274,.103],[837922,.113],[1396542,.123]],
        mh_th: 1000000 },
  NY: { brk: [[0,.04],[17150,.045],[23600,.0525],[27900,.055],
              [161550,.06],[323200,.0685],[2155350,.0965],[5000000,.103]] },
  NJ: { brk: [[0,.014],[20000,.0175],[50000,.0245],[70000,.035],
              [80000,.05525],[150000,.0637],[500000,.0897],[1000000,.1075]] },
  TX: { brk: NO_TAX }, FL: { brk: NO_TAX }, NV: { brk: NO_TAX },
  WA: { brk: NO_TAX }, TN: { brk: NO_TAX }, WY: { brk: NO_TAX },
  AK: { brk: NO_TAX }, SD: { brk: NO_TAX }, NH: { brk: NO_TAX }
};

// Options withholding
const OPT = { fed: .22, fed_hi: .37, fed_th: 1e6, ss: .062, ss_base: 176100,
              med: .0145, med_add: .009, med_th: 200000 };
```

## §3 CORE FUNCTIONS

```javascript
// Bracket tax
const brkTax = (inc, brks) => {
  let tax = 0;
  for (let i = 0; i < brks.length; i++) {
    const [floor, rate] = brks[i], ceil = brks[i+1]?.[0] ?? Infinity;
    const amt = Math.min(inc, ceil) - floor;
    if (amt > 0 && inc > floor) tax += amt * rate;
  }
  return tax;
};

// Marginal rate
const brkMarg = (inc, brks) => {
  for (let i = brks.length - 1; i >= 0; i--) if (inc > brks[i][0]) return brks[i][1];
  return brks[0][1];
};

// State marginal (CA mental health surtax)
const stMarg = (st, inc, filing = 'mfj') => {
  const b = STATE[st]?.brk ?? [[0, .05]];  // Default 5% for unknown states
  return brkMarg(inc, b) + (st === 'CA' && inc > STATE.CA.mh_th ? .01 : 0);
};

// State tax
const stTax = (st, inc, filing = 'mfj') => {
  const b = STATE[st]?.brk ?? [[0, .05]];  // Default 5% for unknown states
  let tax = brkTax(inc, b);
  if (st === 'CA' && inc > STATE.CA.mh_th) tax += (inc - STATE.CA.mh_th) * .01;
  return tax;
};

// SS taxable portion
const ssTaxable = (ss, other, filing) => {
  if (ss <= 0) return 0;
  const [t1, t2] = TAX.ss.tax_th[filing], prov = other + ss * .5;
  return prov <= t1 ? 0 : prov <= t2 ? Math.min(ss * .5, (prov - t1) * .5) :
         Math.min(ss * .85, (t2 - t1) * .5 + (prov - t2) * .85);
};

// IRMAA
const getIrmaa = (magi, filing) => {
  for (const [ceil, partB, partD] of IRMAA[filing])
    if (magi <= ceil) return { partB, partD, annual: (partB + partD) * 12 };
  const [, b, d] = IRMAA[filing].at(-1);
  return { partB: b, partD: d, annual: (b + d) * 12 };
};

// ACA cliff
const acaCliff = (magi, hh) => {
  const fpl = ACA.fpl_base + (hh - 1) * ACA.fpl_add, cliff = fpl * ACA.cliff;
  return { fpl, cliff, over: magi > cliff, room: cliff - magi };
};

// AMT
const calcAmt = (reg_tax, amti, filing) => {
  const ex = TAX.amt.exempt[filing], po = TAX.amt.phaseout[filing];
  const exempt = Math.max(0, ex - Math.max(0, amti - po) * .25);
  const base = Math.max(0, amti - exempt), [r1, r2] = TAX.amt.rates;
  const tent = base <= TAX.amt.brk ? base * r1 : TAX.amt.brk * r1 + (base - TAX.amt.brk) * r2;
  return { tent, owed: Math.max(0, tent - reg_tax) };
};

// RMD
const calcRmd = (trad, age) => age < 73 ? 0 : Math.round(trad / (TAX.rmd[age] ?? TAX.rmd[95]));

// NSO exercise
const calcNso = (shares, strike, fmv, st, filing, ytd = 0) => {
  const spread = (fmv - strike) * shares, after = ytd + spread;
  const fed = spread <= OPT.fed_th ? spread * OPT.fed :
              OPT.fed_th * OPT.fed + (spread - OPT.fed_th) * OPT.fed_hi;
  const ss = Math.min(spread, Math.max(0, OPT.ss_base - ytd)) * OPT.ss;
  const med = spread * OPT.med + (after > OPT.med_th ?
              (after - Math.max(ytd, OPT.med_th)) * OPT.med_add : 0);
  const state = spread * stMarg(st, after, filing);
  const total = fed + ss + med + state;
  return { spread, fed, ss, med, state, total, net: spread - total };
};

// ISO (AMT preference only)
const calcIso = (shares, strike, fmv) => {
  const spread = (fmv - strike) * shares;
  return { spread, amt_pref: spread, cash: 0 };
};

// SS benefit (corrected early reduction)
const calcSS = (aime, claim_age, birth_yr = 1960) => {
  const fra = TAX.ss.fra, [b1, b2] = TAX.ss.bend, [r1, r2, r3] = TAX.ss.pia_rates;
  const pia = Math.min(aime, b1) * r1 + Math.max(0, Math.min(aime, b2) - b1) * r2 +
              Math.max(0, aime - b2) * r3;
  
  let adj = 1;
  if (claim_age < fra) {
    const mo = (fra - claim_age) * 12;
    const [r36, rAdd] = TAX.ss.early_red_mo;
    adj = 1 - Math.min(36, mo) * r36 - Math.max(0, mo - 36) * rAdd;
  } else if (claim_age > fra) {
    adj = 1 + (claim_age - fra) * TAX.ss.delay_credit;
  }
  return { pia: Math.round(pia), mo: Math.round(pia * adj), yr: Math.round(pia * adj * 12), adj };
};

// SS earnings test (pre-FRA with earned income)
const ssEarnTest = (benefit_mo, earned, age) => {
  const fra = TAX.ss.fra, th = TAX.ss.earn_th;
  if (age >= fra || earned <= 0) return { gross: benefit_mo, net: benefit_mo, reduction: 0, excess: 0 };
  
  const excess = Math.max(0, earned - th);
  const annual_red = excess / 2;  // $1 reduction per $2 excess
  const monthly_red = Math.min(benefit_mo, annual_red / 12);
  
  return {
    gross: benefit_mo,
    threshold: th,
    excess,
    reduction: Math.round(monthly_red),
    net: Math.round(Math.max(0, benefit_mo - monthly_red)),
    annual_loss: Math.round(annual_red),
    restored_at_fra: Math.round(annual_red)  // Credits restored at FRA
  };
};

// Roth conversion optimizer
const rothConv = (magi, trad, age, filing, st, opts = {}) => {
  const tgt = opts.brk ?? .24;
  const ceil = TAX.ord[filing].find(([, r]) => r > tgt)?.[0] ?? 206700;
  const brk_room = Math.max(0, ceil - magi - TAX.sd[filing]);
  const limits = [{ name: 'brk', amt: brk_room }, { name: 'bal', amt: trad }];
  
  if (age >= 63) {
    const curr = getIrmaa(magi, filing);
    const next = IRMAA[filing].find(([, b]) => b > curr.partB);
    if (next) limits.push({ name: 'irmaa', amt: next[0] - magi });
  }
  if (age < 65) {
    const aca = acaCliff(magi, 2);
    if (!aca.over) limits.push({ name: 'aca', amt: aca.room });
  }
  
  const opt = Math.max(0, Math.min(...limits.map(l => l.amt)));
  const bind = limits.find(l => l.amt === opt)?.name ?? 'none';
  return { opt, bind, limits, tax: opt * (tgt + stMarg(st, magi + opt, filing)) };
};

// Estate tax
const estateTax = (val, yr, filing) => {
  const exempt = yr >= TAX.estate_sunset.yr ? TAX.estate_sunset.exempt : TAX.estate.exempt;
  const mult = filing === 'mfj' ? 2 : 1;
  const taxable = Math.max(0, val - exempt * mult);
  return { exempt: exempt * mult, taxable, tax: taxable * TAX.estate.rate };
};

// Lot selection (highest basis first)
const selectLots = (lots, need) => {
  const sorted = [...lots].sort((a, b) => b.basis / b.shares - a.basis / a.shares);
  const used = [];
  let rem = need;
  
  for (const lot of sorted) {
    if (rem <= 0) break;
    const val = lot.shares * lot.price, use = Math.min(rem, val);
    const sh = use / lot.price, basis_per = lot.basis / lot.shares;
    used.push({ ...lot, shares_sold: sh, proceeds: use, basis_used: sh * basis_per,
                gain: use - sh * basis_per });
    rem -= use;
  }
  
  const tot = used.reduce((s, l) => ({
    proceeds: s.proceeds + l.proceeds, basis: s.basis + l.basis_used, gain: s.gain + l.gain
  }), { proceeds: 0, basis: 0, gain: 0 });
  
  return { used, ...tot, gr: tot.proceeds > 0 ? tot.gain / tot.proceeds : 0 };
};
```

## §4 DEDUCTIONS

```javascript
const calcDed = (p, filing) => {
  const { salt, mort_int, mort_bal, charitable, medical, agi, ages } = p;
  const salt_ded = Math.min((salt?.state ?? 0) + (salt?.prop ?? 0), TAX.salt_cap);
  const mort_ded = mort_bal > 0 ? mort_int * Math.min(1, TAX.mort_limit / mort_bal) : 0;
  const char_ded = Math.min(charitable ?? 0, agi * TAX.charitable.cash);
  const med_ded = Math.max(0, (medical ?? 0) - agi * TAX.med_floor);
  const itemized = salt_ded + mort_ded + char_ded + med_ded;
  
  const n65 = (ages.p >= 65 ? 1 : 0) + (ages.s >= 65 ? 1 : 0);
  const standard = TAX.sd[filing] + TAX.sd.over65 * n65;
  
  return { salt_ded, mort_ded, char_ded, med_ded, itemized, standard,
           rec: itemized > standard ? 'item' : 'std', ded: Math.max(itemized, standard) };
};

// Deduction schedule
const dedSched = p => {
  const { mort, prop, char, med, ages, start, end, filing, inf = .025 } = p;
  const sched = [];
  
  for (let yr = start; yr <= end; yr++) {
    const y = yr - start, i = (1 + inf) ** y;
    const age_p = ages.p + y, age_s = ages.s + y;
    
    let mort_int = 0, mort_bal = 0;
    if (mort && yr < mort.start + mort.term) {
      const r = mort.rate / 12, n = mort.term * 12;
      const pmt = mort.init * r / (1 - (1 + r) ** -n);
      const m = (yr - mort.start) * 12;
      mort_bal = mort.init * (1 + r) ** m - pmt * ((1 + r) ** m - 1) / r;
      mort_int = mort_bal * mort.rate;
    }
    
    const prop_val = (prop?.base ?? 0) * i;
    const char_val = (char?.base ?? 0) * (char?.decline ? .95 ** y : 1);
    const med_val = (med?.base ?? 0) * i * (age_p >= 65 ? 1.5 : 1);
    
    const n65 = (age_p >= 65 ? 1 : 0) + (age_s >= 65 ? 1 : 0);
    // Note: Standard deduction nominally inflates ~2.5%/yr; using base year value
    const std = TAX.sd[filing] + TAX.sd.over65 * n65;
    const salt_ded = Math.min(prop_val, TAX.salt_cap);
    const mort_ded = mort_bal > 0 ? mort_int * Math.min(1, TAX.mort_limit / mort_bal) : 0;
    const item = salt_ded + mort_ded + char_val + med_val;
    
    sched.push({ yr, mort_int: Math.round(mort_int), mort_bal: Math.round(mort_bal),
                 prop: Math.round(prop_val), char: Math.round(char_val), med: Math.round(med_val),
                 salt_ded: Math.round(salt_ded), mort_ded: Math.round(mort_ded),
                 item: Math.round(item), std: Math.round(std),
                 rec: item > std ? 'item' : 'std', ded: Math.round(Math.max(item, std)) });
  }
  return sched;
};
```

## §5 WITHDRAWAL OPTIMIZER

```javascript
const buildBuckets = (base, accts, filing, st_rate) => {
  const buckets = [], { ord_tax, pref_ex, magi, uded } = base;
  const niit_th = TAX.niit[filing];
  let run_magi = magi;
  
  const add = (id, src, cap, gr, fed, pri) => {
    if (cap <= 0) return;
    const room = Math.max(0, niit_th - run_magi);
    const pre = gr > 0 ? Math.min(room / gr, cap) : cap;
    if (pre > 0) {
      buckets.push({ id, src, cap: pre, gr, fed, st: st_rate, niit: 0,
                     eff: gr * (fed + st_rate), pri });
      run_magi += pre * gr;
    }
    if (cap > pre) {
      buckets.push({ id: id + '_N', src, cap: cap - pre, gr, fed, st: st_rate, niit: .038,
                     eff: gr * (fed + st_rate + .038), pri: pri + 1 });
    }
  };
  
  // Taxable
  if (accts.taxable?.val > 0) {
    const gr = accts.taxable.gr;
    let rem = accts.taxable.val, cumG = pref_ex;
    
    const sp0 = Math.max(0, TAX.ltcg[filing][1][0] - ord_tax - cumG);
    if (sp0 > 0) {
      const cap = gr > 0 ? Math.min(sp0 / gr, rem) : rem;
      add('TX0', 'taxable', cap, gr, 0, 10);
      rem -= cap; cumG += cap * gr;
    }
    
    const sp15 = Math.max(0, TAX.ltcg[filing][2][0] - Math.max(ord_tax + cumG, TAX.ltcg[filing][1][0]));
    if (sp15 > 0 && rem > 0) {
      const cap = gr > 0 ? Math.min(sp15 / gr, rem) : rem;
      add('TX15', 'taxable', cap, gr, .15, 20);
      rem -= cap;
    }
    
    if (rem > 0) buckets.push({ id: 'TX20_N', src: 'taxable', cap: rem, gr, fed: .20,
                                st: st_rate, niit: .038, eff: gr * (.20 + st_rate + .038), pri: 30 });
  }
  
  // Traditional
  if (accts.trad > 0) {
    let rem = accts.trad;
    if (uded > 0) {
      const cap = Math.min(uded, rem);
      buckets.push({ id: 'TR0', src: 'trad', cap, gr: 1, fed: 0, st: st_rate, niit: 0,
                     eff: st_rate, pri: 50 });
      rem -= cap;
    }
    
    const brks = TAX.ord[filing];
    let runOrd = ord_tax;
    for (let i = 1; i < brks.length && rem > 0; i++) {
      const [ceil] = brks[i], prev = brks[i-1][0], rate = brks[i-1][1];
      const floor = Math.max(runOrd, prev), space = Math.max(0, ceil - floor);
      if (space > 0) {
        const cap = Math.min(space, rem);
        buckets.push({ id: `TR${Math.round(rate*100)}`, src: 'trad', cap, gr: 1,
                       fed: rate, st: st_rate, niit: 0, eff: rate + st_rate, pri: 100 + i });
        rem -= cap; runOrd += cap;
      }
    }
  }
  
  // Roth (always last)
  if (accts.roth > 0) buckets.push({ id: 'ROTH', src: 'roth', cap: accts.roth, gr: 1,
                                     fed: 0, st: 0, niit: 0, eff: 0, pri: 999 });
  
  return buckets.sort((a, b) => a.eff - b.eff || a.pri - b.pri);
};

const calcWd = (need, accts, inc, filing, st_rate, ded_info) => {
  const ord_gr = (inc.earned ?? 0) + (inc.pension ?? 0) + (inc.ss_tax ?? 0) + (inc.int ?? 0);
  const ded = ded_info?.ded ?? 30000;
  const ord_tax = Math.max(0, ord_gr - ded), uded = Math.max(0, ded - ord_gr);
  const pref_ex = inc.qd ?? 0;
  
  const base = { ord_gr, ord_tax, uded, pref_ex, magi: ord_gr + pref_ex };
  const buckets = buildBuckets(base, accts, filing, st_rate);
  
  const plan = [];
  let rem = need;
  
  for (const b of buckets) {
    if (rem <= 0) break;
    const maxN = b.cap * (1 - b.eff), useN = Math.min(rem, maxN);
    const useG = b.eff < 1 ? useN / (1 - b.eff) : useN;  // GROSS-UP
    plan.push({ id: b.id, src: b.src, gross: Math.round(useG),
                tax: Math.round(useG * b.eff), net: Math.round(useN), eff: b.eff });
    rem -= useN;
  }
  
  const tot = plan.reduce((s, p) => ({ gross: s.gross + p.gross, tax: s.tax + p.tax, net: s.net + p.net }),
                          { gross: 0, tax: 0, net: 0 });
  
  const bySrc = { taxable: { gross: 0, tax: 0, net: 0 },
                  trad: { gross: 0, tax: 0, net: 0 },
                  roth: { gross: 0, tax: 0, net: 0 } };
  for (const p of plan) {
    bySrc[p.src].gross += p.gross; bySrc[p.src].tax += p.tax; bySrc[p.src].net += p.net;
  }
  if (accts.taxable?.gr) {
    bySrc.taxable.basis = bySrc.taxable.gross * (1 - accts.taxable.gr);
    bySrc.taxable.gain = bySrc.taxable.gross * accts.taxable.gr;
  }
  
  return { plan, bySrc, ...tot, blended: tot.net > 0 ? tot.tax / tot.net : 0, short: Math.max(0, need - tot.net) };
};
```

## §6 CASH FLOW & MONTE CARLO

```javascript
const cashFlow = p => {
  const { client, proj, spend, inc_sched, accts_init, ded_sched } = p;
  const { start, end, inf = .025, ret = .07 } = proj;
  const sched = [];
  let tx_val = accts_init.taxable.val, tx_basis = accts_init.taxable.basis;
  let trad = accts_init.trad, roth = accts_init.roth;
  
  for (let yr = start; yr <= end; yr++) {
    const y = yr - start, i = (1 + inf) ** y;
    const age_p = client.ages.p + y, age_s = client.ages.s + y;
    
    const inc_yr = inc_sched?.find(x => x.yr === yr) ?? {};
    const inc = {
      earned: inc_yr.earned ?? 0, ss: (inc_yr.ss1 ?? 0) + (inc_yr.ss2 ?? 0),
      pension: inc_yr.pension ?? 0, qd: tx_val * .015, int: tx_val * .005
    };
    inc.gross = inc.earned + inc.ss + inc.pension + inc.qd + inc.int;
    inc.ss_tax = ssTaxable(inc.ss, inc.gross - inc.ss, client.filing);
    
    const ded_yr = ded_sched?.find(x => x.yr === yr);
    const ded = ded_yr?.ded ?? 30000;
    const ord_tax = Math.max(0, inc.earned + inc.ss_tax + inc.pension + inc.int - ded);
    
    const fed_ord = brkTax(ord_tax, TAX.ord[client.filing]);
    const fed_pref = brkTax(inc.qd, TAX.ltcg[client.filing].map(([f, r]) => [Math.max(0, f - ord_tax), r]));
    const st_rate = stMarg(client.st, ord_tax + inc.qd, client.filing);
    const st_tax = stTax(client.st, ord_tax + inc.qd, client.filing);
    const fica = Math.min(inc.earned, OPT.ss_base) * OPT.ss + inc.earned * OPT.med;
    inc.tax = fed_ord + fed_pref + st_tax + fica; inc.net = inc.gross - inc.tax;
    
    const exp = {
      base: spend.base * i,
      health: spend.health * i * (age_p >= 65 ? 1 : 1.03 ** Math.max(0, age_p - 55)),
      irmaa: age_p >= 65 ? getIrmaa(inc.gross, client.filing).annual : 0
    };
    exp.total = exp.base + exp.health + exp.irmaa;
    
    const gap = Math.max(0, exp.total - inc.net);
    const gr = tx_val > 0 ? (tx_val - tx_basis) / tx_val : 0;
    const accts = { taxable: { val: tx_val, basis: tx_basis, gr }, trad, roth };
    const wd = calcWd(gap, accts, { qd: inc.qd, int: inc.int, ss_tax: inc.ss_tax }, client.filing, st_rate, ded_yr);
    const cf = { src: inc.net + wd.net, use: exp.total, bal: inc.net + wd.net - exp.total };
    
    const tx_wd = wd.bySrc.taxable.gross, tx_aft = tx_val - tx_wd;
    const tx_ret = tx_aft * ret, tx_eoy = tx_aft + tx_ret;
    const basis_aft = tx_basis - (wd.bySrc.taxable.basis ?? 0);
    
    const tr_wd = wd.bySrc.trad.gross, tr_rmd = calcRmd(trad, age_p);
    const tr_aft = trad - Math.max(tr_wd, tr_rmd), tr_eoy = tr_aft * (1 + ret);
    const ro_wd = wd.bySrc.roth.gross, ro_eoy = (roth - ro_wd) * (1 + ret);
    
    const port = {
      taxable: { boy: tx_val, wd: tx_wd, ret: tx_ret, eoy: tx_eoy, basis: basis_aft,
                 gr: tx_eoy > 0 ? (tx_eoy - basis_aft) / tx_eoy : 0 },
      trad: { boy: trad, wd: tr_wd, rmd: tr_rmd, eoy: tr_eoy },
      roth: { boy: roth, wd: ro_wd, eoy: ro_eoy },
      total: { boy: tx_val + trad + roth, eoy: tx_eoy + tr_eoy + ro_eoy }
    };
    
    tx_val = tx_eoy; tx_basis = basis_aft; trad = tr_eoy; roth = ro_eoy;
    sched.push({ yr, ages: { p: age_p, s: age_s }, inc, exp, gap, wd, cf, port });
  }
  
  const tot_wd = sched.reduce((s, y) => s + y.wd.gross, 0);
  const tot_tax = sched.reduce((s, y) => s + y.wd.tax, 0);
  const vals = sched.map(y => y.port.total.eoy), min_i = vals.indexOf(Math.min(...vals));
  
  return {
    sched,
    summary: { yrs: sched.length, tot_wd, tot_tax, avg_rate: tot_wd > 0 ? tot_tax / tot_wd : 0,
               low: { yr: sched[min_i]?.yr, amt: vals[min_i] },
               end: vals.at(-1), success: vals.every(v => v > 0) }
  };
};

// Monte Carlo (Box-Muller normal)
const monteCarlo = (p, n = 1000) => {
  const { client, proj, spend, accts_init } = p;
  const { horizon = 30, ret_mean = .07, ret_std = .12, inf_mean = .025, inf_std = .01 } = proj;
  const results = [];
  
  const randn = () => {
    const u1 = Math.random(), u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };
  
  for (let sim = 0; sim < n; sim++) {
    let tx = accts_init.taxable.val, tr = accts_init.trad, ro = accts_init.roth;
    let success = true, low = tx + tr + ro;
    
    for (let y = 0; y < horizon && success; y++) {
      const ret = ret_mean + ret_std * randn(), inf = inf_mean + inf_std * randn();
      const exp = spend.base * (1 + inf) ** y;
      const total = tx + tr + ro;
      if (total <= 0) { success = false; break; }
      
      const wd = Math.min(exp, total);
      const tx_wd = wd * tx / total, tr_wd = wd * tr / total, ro_wd = wd * ro / total;
      tx = (tx - tx_wd) * (1 + ret); tr = (tr - tr_wd) * (1 + ret); ro = (ro - ro_wd) * (1 + ret);
      low = Math.min(low, tx + tr + ro);
    }
    results.push({ success, end: tx + tr + ro, low });
  }
  
  const sorted = results.map(r => r.end).sort((a, b) => a - b);
  return {
    success_rate: results.filter(r => r.success).length / n,
    percentiles: { p5: sorted[Math.floor(n*.05)], p25: sorted[Math.floor(n*.25)],
                   p50: sorted[Math.floor(n*.50)], p75: sorted[Math.floor(n*.75)],
                   p95: sorted[Math.floor(n*.95)] },
    mean_end: results.reduce((s, r) => s + r.end, 0) / n,
    mean_low: results.reduce((s, r) => s + r.low, 0) / n
  };
};
```

## §7 REPORTS

```yaml
1_CLIENT:    ages, st, filing, spend, assets, income, st_marg
2_DED_SCHED: yr, mort_int, prop, salt_ded, char, med, item, std, rec, ded
3_WITHDRAW:  buckets, plan: [{id,src,gross,tax,net,eff}], totals, insight
4_CASHFLOW:  yr, inc, exp, gap, wd, cf.bal, port
5_TAX:       yr, ord_inc, pref_inc, fed, st, niit, irmaa, total
6_PORTFOLIO: yr, taxable, trad, roth, total, milestones
7_RISK:      base, scenarios, monte: {success_rate, p5, p50, p95}
8_SS:        scenarios, breakeven, rec
9_ROTH:      yr, room, opt, bind, tax, summary
```

## §8 TESTS

```yaml
# Federal ordinary (CORRECTED)
test_ord_200k: { ord: 200000, mfj } → { tax: 33828, marg: .22 }
  calc: 23850×.10 + 73100×.12 + 103050×.22 = 2385 + 8772 + 22671

test_pref_stack: { ord: 50000, qd: 30000, ltcg: 20000, mfj } → { at0: 46700, tax: 495 }

# State
test_ca_500k: { CA, 500000, mfj } → .093
test_ca_1.5m: { CA, 1500000, mfj } → .133

# Bucket order (gr=0.60, CA 11.3%)
test_bucket_order: TX0(6.78%) < TR0(11.3%) < TX15(15.78%)
  savings: ~$4,400 on $100K

# SS early reduction (CORRECTED)
test_ss_62: { claim: 62, fra: 67 } → adj: 0.70
  calc: 36mo × 0.5556% + 24mo × 0.4167% = 20% + 10% = 30% reduction

# SS taxable
test_ss_tax: { ss: 40000, other: 80000, mfj } → 34000

# SS earnings test (pre-FRA with high income)
test_ss_earn: { benefit_mo: 2500, earned: 75000, age: 62 }
  → { excess: 52680, reduction: 2195, net: 305 }
  calc: (75000 - 22320) / 2 / 12 = 2195/mo reduction

# IRMAA
test_irmaa: { magi: 300000, mfj } → { partB: 370, partD: 35.30 }

# RMD
test_rmd: { trad: 1M, age: 75 } → 40650

# Medical
test_med: { med: 50000, agi: 200000 } → 35000

# Charitable
test_char: { char: 100000, agi: 120000 } → 72000

# Gross-up
test_grossup: { need: 100K, eff: .20 } → gross: 125000

# Balance
test_bal: |inc.net + wd.net - exp| < 100
```

## §9 VALIDATION

```yaml
invariants:
  - gr ∈ [0, 1]
  - basis ≤ val
  - wd.net ≥ need × .99
  - |cf.bal| < 100
  - roth used last

warnings:
  - gr > .90: "High gain - lot selection"
  - aca: "MAGI near 400% FPL"
  - irmaa: "Conversion increases tier"
  - amt: "ISO may trigger AMT"
  - sunset: "Estate exempt drops 2026"
```
