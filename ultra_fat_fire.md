# ULTRA FAT FIRE v8.3 — Explicit Field Formats

> **Guard Rails First, Tests Inline, Explicit Field Formulas**
> **Token-Optimized Progressive Knowledge Builder for High-Net-Worth FIRE Analysis**
> **v8.3: Explicit field types, units, precision, and formulas for all artifacts**

---

## §0.1 REPORT GENERATION INSTRUCTIONS

```yaml
# ═══════════════════════════════════════════════════════════════════════════
# FULL FIRE REPORT GENERATION
# When asked to produce a FIRE analysis, generate ALL artifacts below
# ═══════════════════════════════════════════════════════════════════════════

REQUIRED_OUTPUTS:
  1_CLIENT_SUMMARY:
    description: "Client profile and key assumptions"
    fields:
      - client: { name, ages, state, filing_status }
      - spending: { annual_gross, annual_net, medical, discretionary }
      - assets: { taxable, traditional, roth, home_equity, other }
      - fire_eligible: { total, note: "Excludes home, 529, DAF" }
      - income: { pension, ss_primary, ss_spouse, other }
      - state_marginal_rate: { rate, bracket, source: "getStateMarginalRate()" }
    format: YAML or table

  2_DEDUCTION_SCHEDULE:
    description: "Year-by-year deductions from calcDeductionSchedule()"
    years: "retirement_year to age_95"
    fields_per_year:
      - mortgage_interest, property_tax, salt_deductible, charitable
      - medical_gross, standard_deduction, itemized_total
      - recommended: [itemized | standard]
      - deduction_used
    format: Table with key transition years highlighted

  3_WITHDRAWAL_STRATEGY:
    description: "Bucket fill analysis from calcWithdrawal()"
    for_each_year:
      - buckets_available: [id, capacity, effective_rate]
      - buckets_used: [id, gross, tax, net]
      - total: { gross, tax, net, effective_rate }
    summary:
      - average_effective_rate
      - total_taxes_paid
      - roth_preservation_years
    format: Table + bucket waterfall chart

  4_TAX_PROJECTION:
    description: "Year-by-year federal + state taxes"
    fields_per_year:
      - ordinary_income, preferential_income
      - federal_tax: { ordinary, preferential, total }
      - state_tax: { total, marginal_rate }
      - niit: { applies, amount }
      - irmaa: { applies, monthly_surcharge }
      - total_tax, effective_rate
    format: Table

  5_PORTFOLIO_PROJECTION:
    description: "Asset trajectory to age 95"
    fields_per_year:
      - taxable: { boy, withdrawal, return, eoy, gain_ratio }
      - traditional: { boy, withdrawal, rmd, return, eoy }
      - roth: { boy, withdrawal, return, eoy }
      - total_fire_assets
    key_milestones:
      - rmd_start_year
      - roth_depletion_year (if any)
      - traditional_depletion_year (if any)
      - portfolio_floor
    format: Table + line chart

  6_RISK_ANALYSIS:
    description: "Stress tests and guardrails"
    scenarios:
      - base_case: { success_rate, ending_balance }
      - bear_market_year_1: { -30% returns, success_rate }
      - high_inflation: { 5% for 10 years, success_rate }
      - long_life: { both to age 100, success_rate }
      - healthcare_shock: { +$50K/year at 80, success_rate }
    guardrails:
      - floor_withdrawal_rate
      - ceiling_withdrawal_rate
      - rebalancing_triggers
    format: Table + Monte Carlo percentile chart

  7_SOCIAL_SECURITY_ANALYSIS:
    description: "Optimal claiming strategy"
    scenarios:
      - claim_62_62, claim_fra_fra, claim_70_70, claim_70_fra
    for_each:
      - monthly_benefit, lifetime_benefit, breakeven_age
      - impact_on_portfolio
    recommendation: { strategy, rationale }
    format: Comparison table

  8_ROTH_CONVERSION_ANALYSIS:
    description: "Optimal Roth conversion strategy"
    fields_per_year:
      - conversion_headroom (to top of 24% bracket)
      - recommended_conversion
      - tax_cost
      - irmaa_impact
    summary:
      - total_converted
      - total_tax_paid
      - projected_rmd_reduction
    format: Table

OUTPUT_FORMAT:
  primary: "Single HTML file with Material Design styling"
  sections: "Collapsible cards for each artifact"
  charts: "Inline SVG or Chart.js"
  data_tables: "Sortable with sticky headers"
  
  alternative_formats:
    - PDF (for printing)
    - Excel (for client manipulation)
    - JSON (for API integration)

GENERATION_PROCESS:
  1. Parse client inputs and validate against CRITICAL INVARIANTS
  2. Look up state marginal rate: getStateMarginalRate(state, estimated_taxable, filing)
  3. Generate deduction schedule: calcDeductionSchedule(params)
  4. For each year in projection:
     a. Get deduction: getDeductionForYear(schedule, year, agi)
     b. Calculate withdrawal: calcWithdrawal(gap, accts, income, year, filing, state_rate, deduction)
     c. Calculate taxes: calcFedOrdinary() + calcFedPreferential() + calcStateTax()
     d. Update portfolio balances
  5. Run Monte Carlo simulations for risk analysis
  6. Generate Social Security comparison
  7. Calculate Roth conversion opportunities
  8. Compile all artifacts into final report
```

---

## §0.2 CRITICAL INVARIANTS

```yaml
# ═══════════════════════════════════════════════════════════════════════════
# GUARD RAILS — READ BEFORE ANY CALCULATION
# These constraints MUST be checked in every calculation. Violations = HALT.
# ═══════════════════════════════════════════════════════════════════════════

NEVER:
  WITHDRAWAL_RATE:
    - Use home equity in denominator
    - Use 529 plans in denominator  
    - Use DAF (donor-advised funds) in denominator
    - Use total net worth; ONLY use FIRE-eligible assets
    wrong: "rate = withdrawal / (taxable + trad + roth + home + 529)"
    right: "rate = withdrawal / (taxable + trad + roth)"
    severity: CRITICAL
    
  TAXABLE_WITHDRAWAL:
    - Tax full withdrawal amount
    - Assume 100% of withdrawal is gain
    wrong: "tax = withdrawal × ltcg_rate"
    right: "tax = withdrawal × gain_ratio × ltcg_rate"
    severity: CRITICAL
    
  WITHDRAWAL_ORDER:
    - Withdraw Roth first (destroys tax-free growth)
    - Skip RMD (IRS penalty = 25%)
    wrong: "[roth, traditional, taxable]"
    right: "[rmd, taxable@0%, taxable@15%, traditional, roth]"
    severity: HIGH
    
  OPTIONS_NSO:
    - Omit FICA taxes (SS 6.2% + Medicare 1.45%+)
    - Use gross spread as net value
    wrong: "nso_tax = federal + state"
    right: "nso_tax = federal + state + SS + medicare"
    impact: "Underestimates by 7-8%"
    severity: CRITICAL
    
  OPTIONS_ISO:
    - Tax ISO spread as ordinary income at exercise
    wrong: "iso_ordinary_income = spread"
    right: "ISO creates AMT preference, not ordinary income"
    severity: HIGH
    
  SALT:
    - Allow SALT deduction > $10,000
    wrong: "salt_deduction = state_tax + property_tax"
    right: "salt_deduction = min(state + property, 10000)"
    severity: HIGH
    
  IRMAA:
    - Use current year MAGI for IRMAA
    wrong: "irmaa_tier = lookup(magi[2025])"
    right: "irmaa_tier = lookup(magi[2023]) // 2-year lookback"
    severity: MEDIUM

ALWAYS:
  QD_LTCG_STACKING:
    - Stack qualified dividends + LTCG together
    - Fill 0% bracket first, then 15%, then 20%
    rule: "total_pref = qd + ltcg; allocate to brackets in order"
    
  WITHDRAWAL_BUCKET_FILL:
    - Build buckets with effective_rate = gain_ratio × (fed + state + niit)
    - Sort by effective_rate ascending
    - Roth is ALWAYS LAST despite 0% rate (preserve tax-free growth)
    - Fill cheapest bucket first, then next, until need met
    formulas:
      taxable: "effective = gain_ratio × (ltcg_rate + state_rate + niit_rate)"
      traditional: "effective = ord_bracket_rate + state_rate"
      roth: "effective = 0%, priority = LAST"
    example: |
      With 50% gain_ratio, 9.3% state:
        Taxable@0%:  0.50 × 0.093 = 4.65%
        Taxable@15%: 0.50 × 0.243 = 12.15%
        Trad@22%:    0.22 + 0.093 = 31.3%
      → Fill Taxable first, it's 2.5× cheaper than Traditional!
    
  GAIN_RATIO_UPDATE:
    - Recalculate gain_ratio after each taxable sale
    - High-basis lots deplete faster than low-basis
    rule: "gain_ratio[y+1] = (value - basis_remaining) / value"
    
  SS_EARNINGS_TEST:
    - Apply if SS claimed before FRA AND earned income > threshold
    - $1 reduction per $2 over $22,320 (2024)
    rule: "if age < fra: ss_net = ss_gross - (earned - threshold) / 2"
    
  ROTH_CONVERSION_CONSTRAINTS:
    - Check bracket ceiling
    - Check IRMAA threshold
    - Check ACA cliff
    constraint: "conversion ≤ min(bracket_room, irmaa_room, aca_room, balance)"

# ═══════════════════════════════════════════════════════════════════════════
# VALIDATION GATES — Check after each level
# ═══════════════════════════════════════════════════════════════════════════

GATES:
  GATE_REF:    "All reference tables loaded for correct year"
  GATE_DEDUCT: "SALT ≤ $10K, taxable ≤ AGI ≤ gross"
  GATE_TAX:    "Tax ≥ 0, effective ≤ marginal, brackets sum = total"
  GATE_HEALTH: "IRMAA uses 2-yr lookback, ACA cliff flagged if >400% FPL"
  GATE_WDRAW:  "Need met, Roth not first, gain_ratio updated"
  GATE_SS:     "Benefit ≤ $4,873/mo (2025), earnings test if needed"
  GATE_ESTATE: "Tax = 40% × max(0, estate - exemption)"
  GATE_OUTPUT: "Schedule has 40 years, all rows balance, HTML renders"

# ═══════════════════════════════════════════════════════════════════════════
# MATHEMATICAL VALIDATION — Check every calculation
# ═══════════════════════════════════════════════════════════════════════════

VALIDATION_LEVELS:
  HALT:   "Calculation cannot proceed; result would be dangerously wrong"
  ERROR:  "Result is invalid but can continue with warning"
  WARN:   "Result is suspicious; flag for review"
  INFO:   "Informational check passed"

RANGE_CHECKS:
  # All dollar amounts
  tax:              { min: 0, max: null, on_fail: HALT, msg: "Tax cannot be negative" }
  income:           { min: 0, max: 50000000, on_fail: WARN, msg: "Income outside expected range" }
  withdrawal:       { min: 0, max: 10000000, on_fail: WARN, msg: "Withdrawal unusually large" }
  basis:            { min: 0, max: "value", on_fail: HALT, msg: "Basis cannot exceed value" }
  
  # Ratios
  gain_ratio:       { min: 0, max: 1, on_fail: HALT, msg: "Gain ratio must be 0-1" }
  effective_rate:   { min: 0, max: 0.50, on_fail: WARN, msg: "Effective rate > 50%" }
  marginal_rate:    { min: 0, max: 0.37, on_fail: ERROR, msg: "Invalid marginal bracket" }
  
  # Ages
  age:              { min: 18, max: 120, on_fail: HALT, msg: "Invalid age" }
  retire_age:       { min: 30, max: 80, on_fail: WARN, msg: "Unusual retirement age" }
  ss_claim_age:     { min: 62, max: 70, on_fail: HALT, msg: "SS claim must be 62-70" }
  
  # Counts
  years_in_schedule: { min: 1, max: 60, on_fail: ERROR, msg: "Schedule length invalid" }

IDENTITY_CHECKS:
  # These equations MUST hold true
  IDENT_001:
    name: "Deductions chain"
    formula: "taxable = agi - deduction_used"
    check: "taxable ≤ agi ≤ gross"
    on_fail: HALT
    
  IDENT_002:
    name: "Tax bracket sum"
    formula: "sum(breakdown[].income) = taxable_income"
    check: "|sum - taxable| < 1"
    on_fail: HALT
    
  IDENT_003:
    name: "Tax calculation sum"
    formula: "sum(breakdown[].tax) = gross_tax"
    check: "|sum - gross_tax| < 1"
    on_fail: HALT
    
  IDENT_004:
    name: "Preferential allocation"
    formula: "at_0 + at_15 + at_20 = total_preferential"
    check: "|sum - total| < 1"
    on_fail: HALT
    
  IDENT_005:
    name: "NSO net proceeds"
    formula: "net_proceeds = spread - taxes.total"
    check: "|net - (spread - taxes)| < 1"
    on_fail: HALT
    
  IDENT_006:
    name: "Annual balance"
    formula: "income_net + withdrawal_net = expenses + savings"
    check: "|balance| < 100"
    on_fail: ERROR
    
  IDENT_007:
    name: "SALT cap"
    formula: "salt_deductible = min(salt_actual, 10000)"
    check: "salt_deductible ≤ 10000"
    on_fail: HALT
    
  IDENT_008:
    name: "Gain ratio evolution"
    formula: "gain_ratio = (value - basis) / value"
    check: "0 ≤ gain_ratio ≤ 1"
    on_fail: HALT
    
  IDENT_009:
    name: "Withdrawal meets need"
    formula: "withdrawal_net ≥ gap × 0.99"
    check: "shortfall < gap × 0.01"
    on_fail: ERROR

MONOTONICITY_CHECKS:
  # These relationships MUST hold
  MONO_001: "effective_rate ≤ marginal_rate"
  MONO_002: "taxable_income ≤ agi"
  MONO_003: "agi ≤ gross_income"
  MONO_004: "basis ≤ value (for any asset)"
  MONO_005: "ss_benefit[age_70] > ss_benefit[fra] > ss_benefit[age_62]"
  MONO_006: "estate_tax[value+1] ≥ estate_tax[value]"

CROSS_VALIDATION:
  # Multiple paths to same answer should match
  CROSS_001:
    name: "Tax two ways"
    path_a: "sum of bracket taxes"
    path_b: "taxable × effective_rate"
    tolerance: 10
    on_fail: WARN
    
  CROSS_002:
    name: "Withdrawal gross-up"
    path_a: "gross from calcWithdrawal"
    path_b: "net / (1 - effective_tax_rate)"
    tolerance: 100
    on_fail: WARN
    
  CROSS_003:
    name: "Portfolio balance"
    path_a: "eoy = boy + returns - withdrawals"
    path_b: "sum(taxable + traditional + roth)"
    tolerance: 100
    on_fail: ERROR

# ═══════════════════════════════════════════════════════════════════════════
# VALIDATION EXECUTION — When and how to check
# ═══════════════════════════════════════════════════════════════════════════

VALIDATION_PROTOCOL:
  before_calculation:
    - checkRange(all inputs)
    - checkNonNegative(amounts)
    - require(year >= 2024 && year <= 2060)
    
  after_calculation:
    - checkIdentity(output vs formula)
    - checkMonotonic(rates)
    - checkSum(breakdown vs total)
    
  after_schedule:
    - validateFullSchedule(schedule)
    - check each year balances
    - check portfolio progression
    
  on_failure:
    HALT: "throw Error, stop processing"
    ERROR: "log error, continue with warning flag"
    WARN: "log warning, continue normally"
    
  report_format: |
    {
      valid: boolean,
      errors: [{ level, msg, context, ts }],
      warnings: [{ level, msg, context, ts }],
      checks_performed: number,
      checks_failed: number,
      summary: string
    }

CRITICAL_CHECK_LIST:
  # Run these on EVERY calculation
  EVERY_TAX:
    - tax ≥ 0
    - effective ≤ marginal
    - breakdown sums to total
    
  EVERY_WITHDRAWAL:
    - net ≥ need × 0.99
    - gross ≥ net
    - gross - tax = net
    - source !== 'roth' first (usually)
    
  EVERY_OPTIONS:
    - net = spread - taxes
    - NSO: ordinary = spread
    - ISO hold: ordinary = 0, amt = spread
    
  EVERY_YEAR:
    - income_net + withdrawal_net ≈ expenses
    - portfolio > 0 (until late years)
    - gain_ratio in [0, 1]
    - ages increment correctly

DIVISION_GUARDS:
  # Prevent division by zero
  DIV_001: "if denominator = 0: return 0 or Infinity with flag"
  DIV_002: "gain_ratio: if value = 0, gain_ratio = 0"
  DIV_003: "effective_rate: if income = 0, rate = 0"
  DIV_004: "mortgage proration: if balance = 0, deduction = 0"
```

---

## §1 EXECUTION PROTOCOL

```yaml
INIT:
  command: "Load ULTRA FAT FIRE v8.2"
  action: |
    1. Parse §0 (critical invariants — memorize constraints)
    2. Load §2 (reference tables)
    3. Parse §3 (artifact schemas + inline tests)
    4. Defer §4 (calculation engines) until execution
    5. Confirm: "Framework v8.2 loaded. Invariants active."

EXECUTE:
  command: "Analyze {client_profile}"
  action: |
    for level in 0..9:
      artifacts = ARTIFACTS.filter(a => a.level === level)
      for art in artifacts.filter(a => a.trigger(client)):
        result = execute(art)
        validate(result, art.invariants)  # From §0
        if GATES[level]: gate_check()
    generate(OUT_SCHEDULE, OUT_REPORT)

VALIDATE:
  command: "Test {calc_id}"
  action: |
    tests = ARTIFACTS[calc_id].tests  # Inline tests
    for test in tests:
      actual = execute(calc_id, test.input)
      assert(actual ≈ test.expected, tolerance=test.tolerance)

ARTIFACT_PRODUCTION:
  workflow: |
    1. ANNOUNCE: artifact_id, purpose, inputs
    2. GUARD: Check §0 NEVER rules apply
    3. CALCULATE: formula → substitution → result
    4. VERIFY: Check invariants with ✅/❌
    5. OUTPUT: Table with must_include fields
```

---

## §2 REFERENCE TABLES

```javascript
// ═══════════════════════════════════════════════════════════════
// TAX BRACKETS 2025 (MFJ)
// ═══════════════════════════════════════════════════════════════

const TAX_2025_MFJ = {
  ord: [[0,0.10],[23850,0.12],[96950,0.22],[206700,0.24],[394600,0.32],[501050,0.35],[751600,0.37]],
  ltcg: [[0,0],[96700,0.15],[600050,0.20]],
  sd: 30000
};

const TAX_2025_SINGLE = {
  ord: [[0,0.10],[11925,0.12],[48475,0.22],[103350,0.24],[197300,0.32],[250525,0.35],[626350,0.37]],
  ltcg: [[0,0],[48350,0.15],[533400,0.20]],
  sd: 15000
};

// TCJA Sunset 2026+
const TAX_SUNSET = {
  mfj: { ord: [[0,0.10],[21000,0.15],[85000,0.25],[165000,0.28],[315000,0.33],[400000,0.35],[450000,0.396]], sd: 15700, pex: 5300 }
};

// Inflation adjustment
const INFLATE = (brackets, year, base=2025, rate=1.025) => 
  brackets.map(([t,r]) => [Math.round(t * Math.pow(rate, year-base)), r]);

// ═══════════════════════════════════════════════════════════════
// IRMAA 2024 (2-year lookback for 2026 Medicare)
// ═══════════════════════════════════════════════════════════════

const IRMAA_MFJ = [
  { ceiling: 206000, b: 174.70, d: 0 },
  { ceiling: 258000, b: 244.60, d: 12.90 },
  { ceiling: 322000, b: 349.40, d: 33.30 },
  { ceiling: 386000, b: 454.20, d: 53.80 },
  { ceiling: 750000, b: 559.00, d: 74.20 },
  { ceiling: Infinity, b: 594.00, d: 81.00 }
];

// ═══════════════════════════════════════════════════════════════
// SOCIAL SECURITY
// ═══════════════════════════════════════════════════════════════

const SS = {
  fra: { 1960: 67, 1959: 66.833, 1958: 66.667 },
  earnings_test: { threshold: 22320, rate: 0.50 },  // 2024
  delayed_credit: 0.08,  // per year past FRA
  early_reduction: 0.0556,  // per year before FRA (first 3)
  max_2025: 4873  // Monthly at age 70
};

// ═══════════════════════════════════════════════════════════════
// OTHER CONSTANTS
// ═══════════════════════════════════════════════════════════════

const NIIT = { mfj: 250000, single: 200000, rate: 0.038 };
const SALT_CAP = 10000;
const ESTATE = { current: 13610000, sunset: 7350000, rate: 0.40 };

const OPTIONS_RATES = {
  fed_supp: 0.22, fed_excess: 0.37,
  state_ca: 0.1023, state_ny: 0.0685,
  ss: 0.062, ss_wage_base: 176100,
  medicare: 0.0145, medicare_add: 0.009
};

// ═══════════════════════════════════════════════════════════════
// STATE TAX TABLES (2024) — Progressive brackets for key states
// ═══════════════════════════════════════════════════════════════
// CRITICAL: States tax LTCG as ordinary income (no federal preference)
// Use getStateMarginalRate(state, taxable_income, filing) for lookups

const STATE_TAX = {
  // California — LTCG taxed as ordinary, additional 1% mental health surcharge >$1M
  CA: {
    brackets_single: [
      [0, 0.01], [10412, 0.02], [24684, 0.04], [38959, 0.06],
      [54081, 0.08], [68350, 0.093], [349137, 0.103], [418961, 0.113],
      [698271, 0.123]
    ],
    brackets_mfj: [
      [0, 0.01], [20824, 0.02], [49368, 0.04], [77918, 0.06],
      [108162, 0.08], [136700, 0.093], [698274, 0.103], [837922, 0.113],
      [1396542, 0.123]
    ],
    mental_health_surcharge: { threshold: 1000000, rate: 0.01 },
    ltcg_treatment: 'ordinary'
  },
  
  // New York — Additional NYC tax for city residents
  NY: {
    brackets_single: [
      [0, 0.04], [8500, 0.045], [11700, 0.0525], [13900, 0.055],
      [80650, 0.06], [215400, 0.0685], [1077550, 0.0965], [5000000, 0.103],
      [25000000, 0.109]
    ],
    brackets_mfj: [
      [0, 0.04], [17150, 0.045], [23600, 0.0525], [27900, 0.055],
      [161550, 0.06], [323200, 0.0685], [2155350, 0.0965], [5000000, 0.103],
      [25000000, 0.109]
    ],
    nyc_addon: 0.03876,  // NYC residents add this
    ltcg_treatment: 'ordinary'
  },
  
  // New Jersey
  NJ: {
    brackets_single: [
      [0, 0.014], [20000, 0.0175], [35000, 0.035], [40000, 0.05525],
      [75000, 0.0637], [500000, 0.0897], [1000000, 0.1075]
    ],
    brackets_mfj: [
      [0, 0.014], [20000, 0.0175], [50000, 0.0245], [70000, 0.035],
      [80000, 0.05525], [150000, 0.0637], [500000, 0.0897], [1000000, 0.1075]
    ],
    ltcg_treatment: 'ordinary'
  },
  
  // No income tax states
  TX: { brackets_single: [[0, 0]], brackets_mfj: [[0, 0]], ltcg_treatment: 'none' },
  FL: { brackets_single: [[0, 0]], brackets_mfj: [[0, 0]], ltcg_treatment: 'none' },
  NV: { brackets_single: [[0, 0]], brackets_mfj: [[0, 0]], ltcg_treatment: 'none' },
  WA: { brackets_single: [[0, 0]], brackets_mfj: [[0, 0]], ltcg_treatment: 'none' },
  WY: { brackets_single: [[0, 0]], brackets_mfj: [[0, 0]], ltcg_treatment: 'none' },
  AK: { brackets_single: [[0, 0]], brackets_mfj: [[0, 0]], ltcg_treatment: 'none' },
  SD: { brackets_single: [[0, 0]], brackets_mfj: [[0, 0]], ltcg_treatment: 'none' },
  TN: { brackets_single: [[0, 0]], brackets_mfj: [[0, 0]], ltcg_treatment: 'none' },
  NH: { brackets_single: [[0, 0]], brackets_mfj: [[0, 0]], ltcg_treatment: 'none' }  // No wage tax
};

// Get state marginal rate for given income
function getStateMarginalRate(state, taxable_income, filing = 'mfj') {
  const st = STATE_TAX[state];
  if (!st) return 0.05;  // Default fallback
  
  const brackets = filing === 'mfj' ? st.brackets_mfj : st.brackets_single;
  let rate = 0;
  
  for (let i = 0; i < brackets.length; i++) {
    if (taxable_income >= brackets[i][0]) {
      rate = brackets[i][1];
    }
  }
  
  // CA mental health surcharge
  if (state === 'CA' && taxable_income > st.mental_health_surcharge.threshold) {
    rate += st.mental_health_surcharge.rate;
  }
  
  return rate;
}

// Calculate full state tax (for verification)
function calcStateTax(state, taxable_income, filing = 'mfj') {
  const st = STATE_TAX[state];
  if (!st) return taxable_income * 0.05;  // Default fallback
  
  const brackets = filing === 'mfj' ? st.brackets_mfj : st.brackets_single;
  let tax = 0;
  let prev_ceiling = 0;
  
  for (let i = 0; i < brackets.length; i++) {
    const [ceiling, rate] = brackets[i];
    const next_ceiling = brackets[i + 1]?.[0] || Infinity;
    const in_bracket = Math.min(taxable_income, next_ceiling) - ceiling;
    
    if (in_bracket > 0) {
      tax += in_bracket * rate;
    }
    
    if (taxable_income <= next_ceiling) break;
  }
  
  // CA mental health surcharge
  if (state === 'CA' && taxable_income > st.mental_health_surcharge.threshold) {
    tax += (taxable_income - st.mental_health_surcharge.threshold) * st.mental_health_surcharge.rate;
  }
  
  return tax;
}
```

---

## §3 ARTIFACTS WITH EXPLICIT FIELD FORMATS

```yaml
# ═══════════════════════════════════════════════════════════════════════════
# FIELD FORMAT NOTATION
# ═══════════════════════════════════════════════════════════════════════════
# 
# type:      number | string | enum | object | array
# unit:      USD | % | ratio | shares | months | years
# precision: whole | cents | 2dec | 4dec
# formula:   explicit calculation (use × for multiply, / for divide)
# source:    [input fields used in formula]
#
# ═══════════════════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 0: REFERENCE (loaded from §2)
# ═══════════════════════════════════════════════════════════════════════════

REF_TAX:     { level: 0, schema: {year, filing, brackets, sd} }
REF_IRMAA:   { level: 0, schema: {year, filing, tiers[]} }
REF_SS:      { level: 0, schema: {fra, earnings_test, credits} }
REF_ESTATE:  { level: 0, schema: {exemption, rate} }

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 1: DEDUCTIONS
# ═══════════════════════════════════════════════════════════════════════════

CALC_100_DEDUCTIONS:
  level: 1
  requires: [REF_TAX]

  inputs:
    gross_income:    { type: number, unit: USD, precision: whole }
    salt.state_tax:  { type: number, unit: USD, precision: whole }
    salt.property:   { type: number, unit: USD, precision: whole }
    mortgage.balance: { type: number, unit: USD, precision: whole }
    mortgage.rate:   { type: number, unit: ratio, precision: 4dec, example: 0.0625 }
    charitable.cash: { type: number, unit: USD, precision: whole }
    above_line.hsa:  { type: number, unit: USD, precision: whole, max: 8300 }
    filing:          { type: enum, values: [single, mfj, mfs, hoh] }
    year:            { type: number, unit: year }
  
  outputs:
    agi:
      type: number, unit: USD, precision: whole
      formula: "gross_income - above_line.hsa - above_line.ira"
      
    salt.actual:
      type: number, unit: USD, precision: whole
      formula: "salt.state_tax + salt.property"
      
    salt.deductible:
      type: number, unit: USD, precision: whole
      formula: "min(salt.actual, 10000)"
      constraint: "≤ 10000"
      
    salt.lost:
      type: number, unit: USD, precision: whole
      formula: "salt.actual - salt.deductible"
      
    mortgage.deductible:
      type: number, unit: USD, precision: whole
      formula: "balance × rate × min(acquisition_debt, 750000) / balance"
      
    itemized_total:
      type: number, unit: USD, precision: whole
      formula: "salt.deductible + mortgage.deductible + charitable + medical"
      
    method:
      type: enum, values: [standard, itemized]
      formula: "itemized_total > standard_deduction ? 'itemized' : 'standard'"
      
    deduction_used:
      type: number, unit: USD, precision: whole
      formula: "max(itemized_total, standard_deduction)"
      
    taxable_income:
      type: number, unit: USD, precision: whole
      formula: "max(0, agi - deduction_used)"
      constraint: "≤ agi"
  
  invariants:
    - taxable_income ≤ agi ≤ gross_income
    - salt.deductible ≤ 10000
    - salt.lost = salt.actual - salt.deductible
  
  tests:
    TEST_100_A:
      name: "High SALT Itemizer"
      input: { gross: 600000, state_tax: 50000, property: 20000, mortgage_int: 36000, charitable: 25000, hsa: 8300, filing: mfj }
      expected: { agi: 591700, salt_deductible: 10000, salt_lost: 60000, method: itemized }
      calculation: |
        agi = 600000 - 8300 = 591700
        salt.actual = 50000 + 20000 = 70000
        salt.deductible = min(70000, 10000) = 10000
        salt.lost = 70000 - 10000 = 60000
        itemized = 10000 + 36000 + 25000 = 71000 > 30000 standard
        
    TEST_100_B:
      name: "Standard Better"
      input: { gross: 150000, state_tax: 8000, property: 4000, mortgage_int: 5000, charitable: 3000, filing: mfj }
      expected: { method: standard, deduction: 30000, taxable: 120000 }
      calculation: |
        itemized = 10000 + 5000 + 3000 = 18000 < 30000 standard
        taxable = 150000 - 30000 = 120000

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 1: OPTIONS
# ═══════════════════════════════════════════════════════════════════════════

CALC_106_OPTIONS:
  level: 1
  requires: [REF_TAX]
  lazy: true
  trigger: "client.grants.length > 0"

  inputs:
    grant.type:       { type: enum, values: [nso, iso] }
    grant.strike:     { type: number, unit: USD, precision: cents }
    exercise.shares:  { type: number, unit: shares, precision: whole }
    exercise.fmv:     { type: number, unit: USD, precision: cents }
    client.state:     { type: enum, values: [CA, NY, TX, ...] }
  
  outputs:
    spread:
      type: number, unit: USD, precision: whole
      formula: "(fmv - strike) × shares"
      
    ordinary_income:
      type: number, unit: USD, precision: whole
      formula: |
        if type = 'nso': spread
        if type = 'iso' AND same_day_sale: spread
        if type = 'iso' AND hold: 0
      
    amt_preference:
      type: number, unit: USD, precision: whole
      formula: |
        if type = 'iso' AND hold: spread
        else: 0
      
    taxes.federal:
      type: number, unit: USD, precision: whole
      formula: |
        if ordinary ≤ 1000000: ordinary × 0.22
        else: 220000 + (ordinary - 1000000) × 0.37
      
    taxes.state:
      type: number, unit: USD, precision: whole
      formula: "ordinary × state_rate[state]"
      rates: { CA: 0.1023, NY: 0.0685, TX: 0 }
      
    taxes.ss:
      type: number, unit: USD, precision: whole
      formula: "min(ordinary, 176100 - prior_wages) × 0.062"
      
    taxes.medicare:
      type: number, unit: USD, precision: whole
      formula: "ordinary × 0.0145 + max(0, ordinary - 200000) × 0.009"
      
    taxes.total:
      type: number, unit: USD, precision: whole
      formula: "federal + state + ss + medicare"
      
    net_proceeds:
      type: number, unit: USD, precision: whole
      formula: "spread - taxes.total"
      CRITICAL: "This is THE key output"
  
  invariants:
    - type=nso → ordinary_income = spread, amt_preference = 0
    - type=iso → ordinary_income = 0, amt_preference = spread (if hold)
    - net_proceeds = spread - taxes.total
  
  tests:
    TEST_106_A:
      name: "NSO Same-Day Sale CA"
      input: { type: nso, shares: 10000, strike: 10, fmv: 50, state: CA, filing: mfj }
      expected: { spread: 400000, ordinary_income: 400000, taxes_total: 146988, net_proceeds: 253012 }
      tolerance: 100
      calculation: |
        spread = (50 - 10) × 10000 = 400000
        federal = 400000 × 0.22 = 88000
        state = 400000 × 0.1023 = 40920
        ss = 176100 × 0.062 = 10918 (capped at wage base)
        medicare = 400000 × 0.0145 + 200000 × 0.009 = 5800 + 1800 = 7600
        taxes.total = 88000 + 40920 + 10918 + 7600 = 147438
        net_proceeds = 400000 - 147438 = 252562
        
    TEST_106_C:
      name: "ISO Exercise and Hold"
      input: { type: iso, shares: 8000, strike: 15, fmv: 75, state: CA }
      expected: { spread: 480000, ordinary_income: 0, amt_preference: 480000, taxes_total: 0 }
      calculation: |
        spread = (75 - 15) × 8000 = 480000
        ordinary_income = 0 (ISO hold)
        amt_preference = 480000
        taxes = 0 (no withholding on ISO hold)

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 1: DEDUCTION SCHEDULE
# ═══════════════════════════════════════════════════════════════════════════

CALC_107_DEDUCTION_SCHEDULE:
  level: 1
  requires: [REF_TAX]
  purpose: "Calculate year-by-year deductions that evolve over the retirement horizon"
  
  note: |
    CRITICAL: Do NOT use static deduction assumptions!
    - Mortgage interest DECREASES as loan amortizes
    - Property tax INCREASES with inflation
    - Medical expenses INCREASE with age
    - SALT cap may change (TCJA sunset)
    - Standard deduction INFLATES annually
    - Client may switch between itemized/standard over time
  
  inputs:
    start_year:     { type: number }
    end_year:       { type: number }
    filing:         { type: enum, values: [single, mfj, mfs, hoh] }
    inflation:      { type: number, default: 0.025 }
    
    ages:
      primary_age:    { type: number, note: "Age in start_year" }
      spouse_age:     { type: number, optional: true, note: "For MFJ: spouse age in start_year" }
    
    mortgage:
      original_balance: { type: number, unit: USD }
      rate:             { type: number, unit: ratio }
      term_years:       { type: number }
      origination_year: { type: number }
      acquisition_limit: { type: number, default: 750000 }
    
    property:
      base_year_tax:    { type: number, unit: USD }
      growth_rate:      { type: number, default: 0.025 }
    
    charitable:
      base_amount:      { type: number, unit: USD }
      pattern:          { type: enum, values: [constant, declining, frontload] }
    
    medical:
      base_amount:      { type: number, unit: USD }
      age_acceleration: { type: number, default: 0.05 }
      primary_age:      { type: number, note: "Deprecated: use ages.primary_age instead" }
    
    state_income_tax:
      base_amount:      { type: number, unit: USD }
      pattern:          { type: enum, values: [constant, declining, zero_after] }
    
    tcja_sunset:
      model:            { type: enum, values: [extended, sunset, partial] }
  
  outputs:
    schedule:
      type: array
      element:
        year:               { type: number }
        mortgage_interest:  { type: number, note: "Decreases with amortization" }
        mortgage_balance:   { type: number }
        property_tax:       { type: number, note: "Increases with inflation" }
        salt_deductible:    { type: number, note: "min(actual, cap)" }
        salt_lost:          { type: number }
        charitable:         { type: number }
        medical_gross:      { type: number, note: "Before 7.5% AGI floor" }
        itemized_total:     { type: number }
        standard_deduction: { type: number, note: "Inflates + 65+ bonus" }
        recommended:        { type: enum, values: [standard, itemized] }
        deduction_used:     { type: number }

  key_dynamics:
    mortgage: "Amortizes over term; interest front-loaded; $0 at payoff"
    property_tax: "Grows ~2.5%/year with inflation"
    salt_cap: "$10K through TCJA; may change after sunset"
    medical: "Grows with inflation + 5%/year acceleration after age 65"
    standard: "Inflates ~2.5%/year; +$1600/person MFJ at age 65"

  tests:
    TEST_107_A:
      name: "Mortgage Paydown Over Time"
      input:
        mortgage: { original_balance: 750000, rate: 0.0625, term_years: 30, origination_year: 2020 }
        start_year: 2025
        end_year: 2055
      expected:
        schedule[0].mortgage_interest: { approx: 41000, tolerance: 2000 }
        schedule[10].mortgage_interest: { approx: 24000, tolerance: 2000 }
        schedule[25].mortgage_interest: 0  # Paid off
        schedule[25].notes: ["Mortgage paid off"]

    TEST_107_B:
      name: "Medical Expense Acceleration"
      input:
        medical: { base_amount: 5000, age_acceleration: 0.05, primary_age: 60 }
        start_year: 2025
        end_year: 2045
      expected:
        schedule[0].medical_gross: 5000  # Age 60
        schedule[10].medical_gross: { approx: 9300, tolerance: 500 }  # Age 70
        schedule[20].medical_gross: { approx: 19500, tolerance: 1500 }  # Age 80

    TEST_107_C:
      name: "Flip from Itemized to Standard"
      input:
        mortgage: { original_balance: 400000, rate: 0.05, term_years: 15, origination_year: 2020 }
        charitable: { base_amount: 15000, pattern: declining, decline_rate: 0.10 }
        start_year: 2025
        end_year: 2045
      expected:
        schedule[0].recommended: itemized
        schedule[15].recommended: standard  # Mortgage paid off, charitable declined

    TEST_107_D:
      name: "65+ Standard Deduction Bonus Per Spouse"
      input:
        filing: mfj
        ages: { primary_age: 63, spouse_age: 60 }
        start_year: 2025
        end_year: 2035
      expected:
        # Year 0 (2025): Primary 63, Spouse 60 → no bonus
        schedule[0].standard_deduction: { approx: 30000, tolerance: 100 }
        schedule[0].notes: []
        
        # Year 2 (2027): Primary 65, Spouse 62 → 1 bonus ($1600 × inf)
        schedule[2].notes: ["65+ standard deduction bonus applied"]
        schedule[2].standard_deduction: { approx: 33200, tolerance: 200 }  # 30000 × 1.025^2 + 1600 × 1.025^2
        
        # Year 5 (2030): Primary 68, Spouse 65 → 2 bonuses
        schedule[5].notes: ["Both spouses 65+: double standard deduction bonus"]
        schedule[5].standard_deduction: { approx: 37600, tolerance: 400 }  # base × inf + 2 × 1600 × inf

    TEST_107_E:
      name: "Lookup with AGI-Adjusted Medical Floor"
      purpose: "Verify getDeductionForYear applies 7.5% AGI floor"
      input:
        medical: { base_amount: 20000, primary_age: 70 }
        charitable: { base_amount: 80000, pattern: constant }
        start_year: 2030
        end_year: 2030
      lookup_scenarios:
        - agi: 100000
          expected:
            medical_deductible: 12500  # 20000 - 100000 × 7.5%
            itemized_total: { approx: 92500, tolerance: 1000 }  # SALT + mortgage + 80K + 12.5K
            
        - agi: 300000
          expected:
            medical_deductible: 0  # 20000 - 300000 × 7.5% = negative → 0
            itemized_total: { approx: 80000, tolerance: 1000 }  # Medical doesn't help
            
        - agi: null  # No AGI provided
          expected:
            medical_deductible: 20000  # Full medical_gross used
            itemized_total: { approx: 100000, tolerance: 1000 }

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 2: TAX ENGINES
# ═══════════════════════════════════════════════════════════════════════════

CALC_101_FED_ORDINARY:
  level: 2
  requires: [CALC_100]

  inputs:
    taxable_income: { type: number, unit: USD, precision: whole, source: "CALC_100.taxable_income" }
    year:           { type: number, unit: year }
    filing:         { type: enum, values: [single, mfj, mfs, hoh] }
    tcja:           { type: enum, values: [current, sunset], default: current }
  
  outputs:
    breakdown:
      type: array
      element: { bracket: %, income_in_bracket: USD, tax_in_bracket: USD }
      formula: "for each bracket: income_in_bracket × (bracket / 100)"
      
    gross_tax:
      type: number, unit: USD, precision: whole
      formula: "sum(breakdown[].tax_in_bracket)"
      
    effective_rate:
      type: number, unit: ratio, precision: 4dec
      formula: "gross_tax / taxable_income"
      display: "multiply by 100 for percentage"
      
    marginal_rate:
      type: number, unit: ratio, precision: 2dec
      formula: "bracket rate containing last dollar of taxable_income"
  
  invariants:
    - gross_tax ≥ 0
    - effective_rate ≤ marginal_rate
    - sum(breakdown.income_in_bracket) = taxable_income
    - sum(breakdown.tax_in_bracket) = gross_tax
  
  tests:
    TEST_101_A:
      name: "MFJ $200K Ordinary 2025"
      input: { taxable: 200000, filing: mfj, year: 2025 }
      expected: { gross_tax: 33828, effective: 0.1691, marginal: 0.22 }
      tolerance: 50
      calculation: |
        Bracket 10%: $0 → $23,850
          income = 23850, tax = 23850 × 0.10 = 2385
        Bracket 12%: $23,850 → $96,950
          income = 73100, tax = 73100 × 0.12 = 8772
        Bracket 22%: $96,950 → $200,000
          income = 103050, tax = 103050 × 0.22 = 22671
        gross_tax = 2385 + 8772 + 22671 = 33828
        effective = 33828 / 200000 = 0.16914
        marginal = 0.22 (last bracket used)
      
    TEST_101_B:
      name: "MFJ $500K Ordinary 2025"
      input: { taxable: 500000, filing: mfj, year: 2025 }
      expected: { gross_tax: 114462, marginal: 0.35 }
      tolerance: 100
      calculation: |
        10%: 23850 × 0.10 = 2385
        12%: 73100 × 0.12 = 8772
        22%: 109750 × 0.22 = 24145
        24%: 187900 × 0.24 = 45096
        32%: 106450 × 0.32 = 34064
        Total = 114462

CALC_102_FED_PREFERENTIAL:
  level: 2
  requires: [CALC_100]
  trigger: "qd + ltcg > 0"

  inputs:
    ord_taxable:  { type: number, unit: USD, precision: whole, note: "Ordinary taxable EXCLUDING QD" }
    qd:           { type: number, unit: USD, precision: whole, source: "client.income.qualified_dividends" }
    ltcg:         { type: number, unit: USD, precision: whole, source: "realized gains from withdrawal" }
    year:         { type: number, unit: year }
    filing:       { type: enum, values: [single, mfj, mfs, hoh] }
  
  outputs:
    total_preferential:
      type: number, unit: USD, precision: whole
      formula: "qd + ltcg"
      note: "QD and LTCG stack together for bracket purposes"
      
    stacking_base:
      type: number, unit: USD, precision: whole
      formula: "ord_taxable"
      note: "Preferential income stacks ON TOP of ordinary"
      
    bracket_0_ceiling:
      type: number, unit: USD, precision: whole
      formula: "REF_TAX[year][filing].ltcg[1][0]"
      value_2025_mfj: 96700
      
    space_at_0:
      type: number, unit: USD, precision: whole
      formula: "max(0, bracket_0_ceiling - stacking_base)"
      
    at_0:
      type: number, unit: USD, precision: whole
      formula: "min(total_preferential, space_at_0)"
      
    bracket_15_ceiling:
      type: number, unit: USD, precision: whole
      formula: "REF_TAX[year][filing].ltcg[2][0]"
      value_2025_mfj: 600050
      
    space_at_15:
      type: number, unit: USD, precision: whole
      formula: "max(0, bracket_15_ceiling - max(stacking_base, bracket_0_ceiling))"
      
    at_15:
      type: number, unit: USD, precision: whole
      formula: "min(total_preferential - at_0, space_at_15)"
      
    at_20:
      type: number, unit: USD, precision: whole
      formula: "total_preferential - at_0 - at_15"
      
    pref_tax:
      type: number, unit: USD, precision: whole
      formula: "at_0 × 0 + at_15 × 0.15 + at_20 × 0.20"
      
    niit_threshold:
      type: number, unit: USD, precision: whole
      formula: "250000 if mfj else 200000"
      
    magi:
      type: number, unit: USD, precision: whole
      formula: "ord_taxable + qd + ltcg + deductions"
      
    niit:
      type: number, unit: USD, precision: whole
      formula: "min(max(0, magi - threshold), total_preferential) × 0.038"
      
    total:
      type: number, unit: USD, precision: whole
      formula: "pref_tax + niit"
  
  invariants:
    - at_0 + at_15 + at_20 = total_preferential
    - pref_tax = at_15 × 0.15 + at_20 × 0.20
    - NIIT only if MAGI > threshold
  
  tests:
    TEST_102_A:
      name: "QD+LTCG Stacking - Fill 0% First"
      input: { ord_taxable: 50000, qd: 30000, ltcg: 70000, year: 2025, filing: mfj }
      expected: { at_0: 46700, at_15: 53300, at_20: 0, pref_tax: 7995, niit: 0, total: 7995 }
      tolerance: 100
      calculation: |
        total_preferential = 30000 + 70000 = 100000
        stacking_base = 50000 (ordinary fills first)
        bracket_0_ceiling = 96700
        space_at_0 = 96700 - 50000 = 46700
        at_0 = min(100000, 46700) = 46700
        at_15 = 100000 - 46700 = 53300
        at_20 = 0
        pref_tax = 46700 × 0 + 53300 × 0.15 + 0 × 0.20 = 7995
        magi = 50000 + 100000 = 150000 < 250000 threshold
        niit = 0
        total = 7995
        
    TEST_102_B:
      name: "High Income with NIIT"
      input: { ord_taxable: 200000, qd: 50000, ltcg: 150000, year: 2025, filing: mfj }
      expected: { at_0: 0, at_15: 200000, at_20: 0, pref_tax: 30000, niit: 5700, total: 35700 }
      tolerance: 100
      calculation: |
        total_preferential = 200000
        stacking_base = 200000
        space_at_0 = max(0, 96700 - 200000) = 0
        at_0 = 0
        at_15 = min(200000, 600050 - 200000) = 200000
        pref_tax = 200000 × 0.15 = 30000
        magi = 400000
        niit_base = max(0, 400000 - 250000) = 150000
        niit = min(150000, 200000) × 0.038 = 5700
        total = 30000 + 5700 = 35700
CALC_105_AMT:
  level: 2
  requires: [REF_AMT, CALC_101]
  trigger: "iso_spread > 0 OR salt_lost > 50000"
  lazy: true
  
  schema:
    amti: number
    exemption: number
    tmt: number
    amt_liability: number
  
  invariants:
    - amt_liability = max(0, tmt - regular_tax)
    - amti = taxable + amt_preferences
  
  must_include: [regular_taxable, amt_adjustments, amti, exemption, tmt, amt_owed]
  
  tests:
    TEST_105_A:
      name: "AMT with ISO Exercise"
      input: { regTax: 91462, taxable: 400000, prefs: {salt: 45000, iso: 200000}, year: 2024, filing: mfj }
      expected: { amti: 645000, amt_liability: 47438 }
      tolerance: 500

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 3: HEALTHCARE
# ═══════════════════════════════════════════════════════════════════════════

CALC_201_IRMAA:
  level: 3
  requires: [REF_IRMAA]
  trigger: "age ≥ 63"  # Plan 2 years ahead
  
  schema:
    magi_lookback: number
    tier: number
    part_b: number
    part_d: number
    annual_surcharge: number
  
  invariants:
    - magi_lookback = magi[year - 2]  # CRITICAL from §0
    - tier = lookup(magi_lookback)
  
  must_include: [magi_2yr_prior, tier, part_b, part_d, annual_total]
  
  tests:
    TEST_201_A:
      name: "IRMAA Tier 3"
      input: { magi_2yr_prior: 300000, filing: mfj }
      expected: { tier: 3, part_b: 349.40, part_d: 33.30, annual: 4592 }

CALC_202_ACA:
  level: 3
  requires: [REF_ACA]
  trigger: "age < 65"
  lazy: true
  
  schema:
    fpl_pct: number
    cliff: boolean
    benchmark: number
    subsidy: number
    net_premium: number
  
  invariants:
    - cliff = (fpl_pct > 400)
    - cliff → subsidy = 0
  
  must_include: [magi, fpl_pct, cliff_warning, benchmark, subsidy, net_premium]
  
  tests:
    TEST_202_A:
      name: "ACA Above Cliff"
      input: { magi: 85000, ages: [60, 58], year: 2025 }
      expected: { cliff: true, subsidy: 0 }
      tolerance: 1

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 4: WITHDRAWAL OPTIMIZATION
# ═══════════════════════════════════════════════════════════════════════════

CALC_301_WITHDRAWAL:
  level: 4
  requires: [CALC_101, CALC_102]
  
  strategy: "Progressive Bucket Fill with Tax Gross-Up"
  
  description: |
    Build "buckets" of withdrawal opportunities at different effective tax rates.
    Sort by effective rate (cheapest first). Fill until need is met.
    Roth is always LAST despite 0% rate (preserve tax-free growth).
    
    CORE ALGORITHM:
    1. Calculate base state (ord_taxable, unused_deduction, LTCG space)
    2. Build buckets at each rate discontinuity
    3. Sort by effective_rate ascending (Roth forced last)
    4. Fill buckets until net need is met, using gross-up: 
       gross = net / (1 - effective_rate)
    
    NIIT THRESHOLD SPLITTING:
    Taxable buckets split at NIIT threshold ($250K MFJ, $200K Single).
    Creates: TAXABLE_15PCT (no NIIT) and TAXABLE_15PCT_NIIT (+3.8%)

  bucket_priority_order: |
    CRITICAL INSIGHT: TRADITIONAL_0PCT often beats TAXABLE_15PCT!
    
    Fill order (by effective rate, NOT by source):
    
    1. TAXABLE_0PCT:      gain_ratio × state_rate
       Example (60% gain, 9.3% CA): 5.58%
       
    2. TRADITIONAL_0PCT:  state_rate only (fills unused deduction!)
       Example: 9.3%
       NOTE: This is the "free" federal space when income < deductions.
       Capacity = max(0, deduction - ord_gross)
       
    3. TAXABLE_15PCT:     gain_ratio × (15% + state + niit?)
       Example (60% gain, 9.3% CA, no NIIT): 14.58%
       
    4. TAXABLE_15PCT_NIIT: gain_ratio × (15% + state + 3.8%)
       Example: 16.86%
       
    5. TRADITIONAL_10PCT: 10% + state
       Example: 19.30%
       
    6. TAXABLE_20PCT_NIIT: gain_ratio × (20% + state + 3.8%)
       Example: 17.58%
       
    7. TRADITIONAL_12PCT through 37%: fed_bracket + state
    
    8. ROTH: 0% (but ALWAYS last to preserve tax-free growth)
    
    KEY OPTIMIZATION:
    Naive "withdraw taxable first" misses TRADITIONAL_0PCT:
      9.3% (Traditional in deduction space) < 14.58% (Taxable@15%)
    
    This bucket order saves thousands in taxes for itemizing clients!

  cross_effect_analysis: |
    CONCERN: "Traditional withdrawals change LTCG stacking base"
    
    VERIFIED SAFE because:
    1. TRADITIONAL_0PCT fills unused deduction → ord_taxable stays at 0
    2. LTCG rates < Traditional rates at same bracket → LTCG fills first
    3. By the time Traditional exceeds deduction, LTCG space is exhausted
    
    Edge case (gain_ratio > 90%): Traditional may beat Taxable@15%, but
    at that point we're past LTCG 0% anyway. No practical cross-effect.

  inputs:
    need:          { type: number, unit: USD, precision: whole, note: "Net cash required" }
    income:        { type: object, fields: [earned, ss_taxable, pension, qd, interest] }
    accts.taxable: { type: object, fields: [value, basis, gain_ratio] }
    accts.traditional: { type: number, unit: USD }
    accts.roth:    { type: number, unit: USD }
    state_rate:
      type: number
      unit: ratio
      precision: 4dec
      note: |
        CRITICAL: Use client's MARGINAL state rate, not average rate!
        
        Use: getStateMarginalRate(state, taxable_income, filing)
        
        Example lookups (MFJ, $500K taxable):
          CA: 11.3%   (progressive, LTCG = ordinary)
          NY: 6.85%   (+ 3.88% NYC if applicable)
          NJ: 8.97%   (progressive)
          TX/FL/NV: 0% (no state income tax)
        
        California brackets (MFJ, 2024):
          9.3%:  $136,700 - $698,274
          10.3%: $698,274 - $837,922  
          11.3%: $837,922 - $1,396,542
          12.3%: $1,396,542+ (plus 1% mental health >$1M)
          
        For FAT FIRE ($450K+ spending), marginal rate is typically 10.3-12.3%!
        
        NEVER use flat 9.3% for CA FAT FIRE clients.
      example: 0.113
      lookup: "getStateMarginalRate(client.state, estimated_taxable, filing)"
    year:          { type: number, unit: year }
    filing:        { type: enum, values: [single, mfj, mfs, hoh] }
    deductions:
      type: object
      optional: true
      note: "If null, uses standard deduction only"
      fields:
        state_tax:        { type: number, unit: USD, note: "State income tax paid" }
        property_tax:     { type: number, unit: USD, note: "Property taxes" }
        mortgage_interest: { type: number, unit: USD, note: "Mortgage interest paid" }
        mortgage_balance: { type: number, unit: USD, note: "Mortgage balance for $750K proration" }
        charitable:       { type: number, unit: USD, note: "Cash charitable contributions" }
        medical:          { type: number, unit: USD, note: "Medical expenses (7.5% AGI floor applied)" }
      example:
        state_tax: 45000
        property_tax: 25000
        mortgage_interest: 47000
        mortgage_balance: 750000
        charitable: 50000
        medical: 0

  outputs:
    plan:
      type: array
      element:
        bucket_id:      { type: string, example: "TAXABLE_0PCT" }
        source:         { type: enum, values: [taxable, traditional, roth] }
        label:          { type: string, example: "Taxable @ 0% LTCG" }
        gross:          { type: number, unit: USD, precision: whole }
        gain:           { type: number, unit: USD, precision: whole }
        basis:          { type: number, unit: USD, precision: whole }
        tax:            { type: number, unit: USD, precision: whole }
        net:            { type: number, unit: USD, precision: whole }
        effective_rate: { type: number, unit: ratio, precision: 4dec }
        
    total_gross:
      type: number, unit: USD, precision: whole
      formula: "sum(plan[].gross)"
      
    total_tax:
      type: number, unit: USD, precision: whole
      formula: "sum(plan[].tax)"
      
    total_net:
      type: number, unit: USD, precision: whole
      formula: "sum(plan[].net)"
      constraint: "≥ need × 0.99"
      
    effective_rate:
      type: number, unit: ratio, precision: 4dec
      formula: "total_tax / total_gross"
      
    blended_rate:
      type: number, unit: ratio, precision: 4dec
      formula: "total_tax / need"
      note: "Tax as % of net needed"

  bucket_order:
    1: "TAXABLE_0PCT → gain_ratio × state_rate"
    2: "TRADITIONAL_0PCT → state_rate only (fills unused deduction)"
    3: "TAXABLE_15PCT → gain_ratio × (0.15 + state + niit)"
    4: "TRADITIONAL_10PCT → 0.10 + state"
    5: "TRADITIONAL_12PCT → 0.12 + state"
    6: "TAXABLE_20PCT → gain_ratio × (0.20 + state + niit)"
    7: "TRADITIONAL_22PCT+ → bracket + state"
    8: "ROTH → 0% but ALWAYS LAST"
    
  note: |
    Actual sort order depends on gain_ratio and state_rate.
    With 50% gain_ratio and 9.3% state:
      TAXABLE_0PCT:      4.65%
      TRADITIONAL_0PCT:  9.3% (state only, 0% federal)
      TAXABLE_15PCT:     12.15%
      TRADITIONAL_10PCT: 19.3%
      TRADITIONAL_12PCT: 21.3%
    
    Key insight: TRADITIONAL_0PCT (unused deduction) can be cheaper
    than TAXABLE_15PCT! This is why proper bucket sorting matters.

  effective_rate_formulas:
    taxable: "gain_ratio × (fed_ltcg_rate + state_rate + niit_rate)"
    traditional: "fed_ord_rate + state_rate"
    roth: "0 (but preserve for growth)"

  invariants:
    - total_gross - total_tax = total_net
    - total_net ≥ need × 0.99
    - plan[last].source = 'roth' only if needed  # Preserve Roth
    - Each bucket filled before moving to next

  tests:
    TEST_301_A:
      name: "Bucket Fill - Mixed Sources with Deduction"
      input:
        need: 259000
        income: { earned: 0, ss_taxable: 0, pension: 0, qd: 45000, interest: 5000 }
        accts:
          taxable: { value: 3000000, basis: 1500000, gain_ratio: 0.50 }
          traditional: 2000000
          roth: 500000
        state_rate: 0.093
        year: 2025
        filing: mfj
      expected:
        # ord_gross = 5000 (interest only, QD is preferential)
        # unused_deduction = 30000 - 5000 = 25000
        # Bucket effective rates:
        #   TAXABLE_0PCT: 4.65%
        #   TRADITIONAL_0PCT: 9.3% (fills unused deduction)
        #   TAXABLE_15PCT: 12.15%
        # Algorithm fills cheapest first!
        plan[0].bucket_id: TAXABLE_0PCT
        plan[0].effective_rate: 0.0465
        plan[1].bucket_id: TRADITIONAL_0PCT  # Uses deduction space!
        plan[1].effective_rate: 0.093
        plan[2].bucket_id: TAXABLE_15PCT
        plan[2].effective_rate: 0.1215
        total_net: 259000
        buckets_used: 3
        effective_rate: { max: 0.10 }
      tolerance: 500
      calculation: |
        Base state:
          ord_gross = 5000 (interest)
          pref_existing = 45000 (QD)
          deduction = 30000
          unused_deduction = 25000
          ord_taxable = 0
        
        Bucket 1: TAXABLE_0PCT
          LTCG 0% ceiling = 96700
          space_at_0 = 96700 - 0 - 45000 = 51700 gains
          max_gross = 51700 / 0.50 = 103400
          effective_rate = 0.50 × 0.093 = 4.65%
          use_net = 103400 × 0.9535 = 98592
          remaining = 259000 - 98592 = 160408
        
        Bucket 2: TRADITIONAL_0PCT (deduction space)
          capacity = 25000
          effective_rate = 0.093 (state only)
          use_net = 25000 × 0.907 = 22675
          remaining = 160408 - 22675 = 137733
        
        Bucket 3: TAXABLE_15PCT
          effective_rate = 0.50 × 0.243 = 12.15%
          use_net = 137733
          use_gross = 137733 / 0.8785 = 156782
          use_tax = 156782 × 0.1215 = 19049
        
        Totals:
          gross = 103400 + 25000 + 156782 = 285182
          tax = 4808 + 2325 + 19049 = 26182
          net = 98592 + 22675 + 137733 = 259000 ✓
          effective = 26182 / 285182 = 9.18%
        
        Savings vs no deduction bucket:
          Old tax: ~26991, New tax: ~26182
          Savings: $809 (3%)

    TEST_301_B:
      name: "High Gain Ratio - Deduction Beats Taxable@15%"
      input:
        need: 100000
        income: { earned: 0, qd: 0, interest: 0 }
        accts:
          taxable: { value: 500000, basis: 50000, gain_ratio: 0.90 }
          traditional: 500000
          roth: 0
        state_rate: 0.093
        year: 2025
        filing: mfj
      expected:
        # With 90% gain ratio and full unused deduction:
        #   TAXABLE_0PCT: 0.90 × 0.093 = 8.37%
        #   TRADITIONAL_0PCT: 9.3% (unused deduction = 30000)
        #   TAXABLE_15PCT: 0.90 × 0.243 = 21.87%
        #   TRADITIONAL_10PCT: 0.10 + 0.093 = 19.3%
        # Order: TAXABLE_0PCT (8.37%) → TRADITIONAL_0PCT (9.3%) → TRADITIONAL_10PCT (19.3%) → TAXABLE_15PCT (21.87%)
        plan[0].bucket_id: TAXABLE_0PCT
        plan[0].effective_rate: 0.0837
        plan[1].bucket_id: TRADITIONAL_0PCT  # Deduction space at 9.3%
        plan[1].effective_rate: 0.093
        plan[2].source: traditional  # 10% bracket beats Taxable@15%!
      tolerance: 100

    TEST_301_C:
      name: "15% Bracket Space Calculation"
      description: "Verify 15% bucket has correct capacity after 0% is filled"
      input:
        need: 400000
        income: { earned: 0, qd: 50000, interest: 0 }
        accts:
          taxable: { value: 2000000, basis: 1000000, gain_ratio: 0.50 }
          traditional: 0
          roth: 0
        state_rate: 0.05
        year: 2025
        filing: mfj
      expected:
        # Base: ord_taxable = 0, pref_existing = 50000
        # 0% bucket: space = 96700 - 0 - 50000 = 46700 gains = 93400 gross
        # After 0%: current_position = 0 + 96700 = 96700
        # 15% bucket: space = 600050 - 96700 = 503350 gains = 1006700 gross
        plan[0].bucket_id: TAXABLE_0PCT
        plan[0].gross: 93400
        plan[1].bucket_id: TAXABLE_15PCT
        plan[1].gross: { min: 330000 }  # Need remaining after 0% net
        buckets_used: 2
        total_net: 400000
      tolerance: 1000
      calculation: |
        0% bucket:
          space_at_0 = 96700 - 0 - 50000 = 46700 gains
          max_gross = 46700 / 0.50 = 93400
          effective_rate = 0.50 × 0.05 = 0.025
          net = 93400 × 0.975 = 91065
          remaining = 400000 - 91065 = 308935
        
        15% bucket (CRITICAL - tests the fix):
          current_position = 0 + 96700 = 96700
          bracket_15_start = max(96700, 96700) = 96700
          space_at_15 = 600050 - 96700 = 503350 gains
          max_gross = 503350 / 0.50 = 1006700
          effective_rate = 0.50 × 0.20 = 0.10
          use_net = 308935
          use_gross = 308935 / 0.90 = 343261

    TEST_301_D:
      name: "Zero Gain Ratio - All Basis"
      input:
        need: 50000
        income: { earned: 0, qd: 0, interest: 0 }
        accts:
          taxable: { value: 100000, basis: 100000, gain_ratio: 0 }
          traditional: 0
          roth: 0
        state_rate: 0.093
        year: 2025
        filing: mfj
      expected:
        # With 0% gain ratio, effective_rate = 0 for all taxable buckets
        plan[0].bucket_id: TAXABLE_0PCT
        plan[0].effective_rate: 0
        plan[0].tax: 0
        plan[0].net: 50000
        total_tax: 0
      tolerance: 1

    TEST_301_E:
      name: "Unused Deduction Space - Traditional at 0%"
      description: "Traditional fills unused deduction at 0% federal before hitting brackets"
      input:
        need: 50000
        income: { earned: 0, qd: 0, interest: 5000 }
        accts:
          taxable: { value: 0, basis: 0, gain_ratio: 0 }
          traditional: 500000
          roth: 0
        state_rate: 0.093
        year: 2025
        filing: mfj
      expected:
        # ord_gross = 5000, deduction = 30000
        # unused_deduction = 30000 - 5000 = 25000
        # First 25000 Traditional at 0% federal (9.3% state only) = 9.3% effective
        # Next amount at 10% federal + 9.3% state = 19.3% effective
        plan[0].bucket_id: TRADITIONAL_0PCT
        plan[0].effective_rate: 0.093
        plan[0].fed_rate: 0
        plan[1].bucket_id: TRADITIONAL_10PCT
        plan[1].effective_rate: 0.193
        total_tax: { max: 9000 }  # ~15% effective on ~59K gross
        effective_rate: { max: 0.16 }
      tolerance: 200
      calculation: |
        Base state:
          ord_gross = 5000
          deduction = 30000
          unused_deduction = 25000
          
        Bucket 1: TRADITIONAL_0PCT (deduction space)
          capacity = 25000
          effective_rate = 0.093 (state only, 0% federal)
          max_net = 25000 × 0.907 = 22675
          use all: gross = 25000, tax = 2325, net = 22675
          remaining = 50000 - 22675 = 27325
        
        Bucket 2: TRADITIONAL_10PCT
          effective_rate = 0.10 + 0.093 = 0.193
          need_net = 27325
          use_gross = 27325 / 0.807 = 33859
          use_tax = 33859 × 0.193 = 6535
        
        Totals:
          gross = 25000 + 33859 = 58859
          tax = 2325 + 6535 = 8860
          net = 22675 + 27325 = 50000 ✓
          effective = 8860 / 58859 = 15.05%
        
        Compare to BUGGY (no deduction bucket):
          All at 10%+ brackets
          50000 net needs ~62K gross at ~19% effective
          tax ≈ 12000 (vs 8860 with fix)
          ERROR: 35% more tax than necessary!

    TEST_301_F:
      name: "Itemized Deductions - FAT FIRE Scenario"
      description: "FAT FIRE clients typically itemize due to mortgage + charitable"
      input:
        need: 150000
        income: { earned: 0, qd: 45000, interest: 10000 }
        accts:
          taxable: { value: 2000000, basis: 1000000, gain_ratio: 0.50 }
          traditional: 1000000
          roth: 0
        deductions:
          state_tax: 45000      # CA state tax on previous year
          property_tax: 25000   # $3M home
          mortgage_interest: 47000  # $750K @ 6.25%
          mortgage_balance: 750000
          charitable: 50000     # Significant giving
          medical: 0
        state_rate: 0.093
        year: 2025
        filing: mfj
      expected:
        # Itemized: $10K (SALT cap) + $47K (mortgage) + $50K (charitable) = $107K
        # Standard: $30K
        # Use itemized → deduction = $107,000
        # ord_gross = 10000 (interest only)
        # unused_deduction = 107000 - 10000 = 97000!
        base_state.deduction_method: itemized
        base_state.deduction: 107000
        plan[0].bucket_id: TAXABLE_0PCT
        plan[1].bucket_id: TRADITIONAL_0PCT  # Uses $97K of deduction space!
        plan[1].gross: { min: 90000 }
      tolerance: 2000
      calculation: |
        Itemized deductions:
          SALT = min(45000 + 25000, 10000) = 10000 (capped)
          Mortgage = 47000 × min(1, 750000/750000) = 47000
          Charitable = min(50000, 10000 × 0.60) = 50000 (under 60% AGI limit)
          Medical = max(0, 0 - 10000 × 0.075) = 0
          Total itemized = 10000 + 47000 + 50000 = 107000
        
        Standard = 30000
        Use itemized (107000 > 30000)
        
        Base state:
          ord_gross = 10000 (interest)
          deduction = 107000
          unused_deduction = 107000 - 10000 = 97000!
          pref_existing = 45000 (QD)
        
        Bucket order:
          1. TAXABLE_0PCT @ 4.65%: fills 0% LTCG space
          2. TRADITIONAL_0PCT @ 9.3%: fills $97K deduction space!
          3. TAXABLE_15PCT @ 12.15%: remaining need
        
        Impact: $97K of Traditional at 9.3% vs 19.3% if standard deduction used
        Savings: $97K × (19.3% - 9.3%) = $9,700!

    TEST_301_G:
      name: "Traditional Bucket with Existing Ordinary Income"
      description: "Traditional buckets should account for existing ord_taxable filling lower brackets"
      input:
        need: 50000
        income: { earned: 0, pension: 80000, qd: 0, interest: 0 }
        accts:
          taxable: { value: 0, basis: 0, gain_ratio: 0 }
          traditional: 500000
          roth: 0
        deductions: null  # Use standard $30K
        state_rate: 0.093
        year: 2025
        filing: mfj
      expected:
        # ord_gross = 80000 (pension)
        # deduction = 30000 (standard)
        # ord_taxable = 50000
        # 
        # 10% bracket: $0-$23,850 → FILLED by first $23,850 of ord_taxable
        # 12% bracket: $23,850-$96,700 → $23,850 to $50,000 FILLED (remaining = $46,700)
        #
        # Traditional bucket should start at $50K, not $0!
        # First available bucket is 12% with $46,700 space
        plan[0].bucket_id: TRADITIONAL_12PCT
        plan[0].fed_rate: 0.12
        plan[0].gross: { max: 62000 }  # Need ~62K gross for 50K net at 21.3%
        total_net: 50000
      tolerance: 1000
      calculation: |
        Base state:
          ord_gross = 80000
          deduction = 30000
          ord_taxable = 50000
          unused_deduction = max(0, 30000 - 80000) = 0
        
        Traditional bucket building:
          Start running_ord at 50000 (where existing income ends)
          
          10% bracket: ceiling=23850, floor=50000 → space=0 (already filled)
          12% bracket: ceiling=96700, floor=50000 → space=46700 ✓
          
        Bucket: TRADITIONAL_12PCT
          capacity = 46700
          effective_rate = 0.12 + 0.093 = 0.213
          need_net = 50000
          need_gross = 50000 / 0.787 = 63532
          (capped at 46700 if insufficient, but we have enough)

    TEST_301_H:
      name: "NIIT Threshold Bucket Splitting"
      description: "Taxable buckets should split at NIIT $250K MFJ threshold"
      input:
        need: 200000
        income: { earned: 0, pension: 0, qd: 45000, interest: 10000, ss_taxable: 50000 }
        accts:
          taxable: { value: 2000000, basis: 800000, gain_ratio: 0.60 }
          traditional: 0
          roth: 0
        deductions:
          deduction_used: 100000
          recommended: itemized
        state_rate: 0.113   # CA marginal for FAT FIRE
        year: 2025
        filing: mfj
      expected:
        # Base MAGI = 10K interest + 45K QD + 50K SS = 105K (approx)
        # NIIT threshold = $250K
        # Room before NIIT = 250K - 105K = $145K of gains
        # At 60% gain ratio: $145K gains requires ~$242K gross
        #
        # Buckets should split:
        #   TAXABLE_15PCT: pre-NIIT portion (no 3.8%)
        #   TAXABLE_15PCT_NIIT: post-NIIT portion (+3.8%)
        buckets_created: ["TAXABLE_0PCT", "TAXABLE_15PCT", "TAXABLE_15PCT_NIIT"]
        
        # Effective rates:
        #   TAXABLE_15PCT: 0.60 × (0.15 + 0.113) = 15.78%
        #   TAXABLE_15PCT_NIIT: 0.60 × (0.15 + 0.113 + 0.038) = 18.06%
        TAXABLE_15PCT.effective_rate: { approx: 0.1578, tolerance: 0.01 }
        TAXABLE_15PCT_NIIT.effective_rate: { approx: 0.1806, tolerance: 0.01 }
      
      calculation: |
        Base state:
          ord_gross = 10K + 50K = 60K
          pref_existing = 45K (QD)
          deduction = 100K
          ord_taxable = max(0, 60K - 100K) = 0
          magi ≈ 105K (below NIIT threshold)
        
        NIIT threshold math:
          threshold = $250,000
          room = 250K - 105K = $145K of additional MAGI
          At 60% gain ratio: gross = 145K / 0.60 = $241,667
          
        Bucket split:
          TAXABLE_15PCT: first ~$242K gross → no NIIT
          TAXABLE_15PCT_NIIT: remaining → +3.8% NIIT

    TEST_301_I:
      name: "Already Above NIIT Threshold"
      description: "When base MAGI > $250K, all taxable buckets should include NIIT"
      input:
        need: 100000
        income: { earned: 0, pension: 200000, qd: 30000, interest: 50000 }
        accts:
          taxable: { value: 500000, basis: 200000, gain_ratio: 0.60 }
          traditional: 0
          roth: 0
        deductions: null
        state_rate: 0.113
        year: 2025
        filing: mfj
      expected:
        # MAGI = 200K + 30K + 50K = 280K (above $250K threshold)
        # ALL taxable buckets should have NIIT
        buckets_created: ["TAXABLE_0PCT_NIIT", "TAXABLE_15PCT_NIIT"]
        TAXABLE_0PCT_NIIT.niit_rate: 0.038
        TAXABLE_15PCT_NIIT.niit_rate: 0.038

    TEST_301_J:
      name: "State Rate Lookup - California FAT FIRE"
      description: "Verify getStateMarginalRate returns correct CA marginal rate"
      test_function: getStateMarginalRate
      cases:
        - input: { state: CA, taxable: 500000, filing: mfj }
          expected: 0.093  # $500K is in 9.3% bracket (up to $698K)
          
        - input: { state: CA, taxable: 750000, filing: mfj }
          expected: 0.103  # $750K is in 10.3% bracket ($698K-$837K)
          
        - input: { state: CA, taxable: 900000, filing: mfj }
          expected: 0.113  # $900K is in 11.3% bracket ($837K-$1.4M)
          
        - input: { state: CA, taxable: 1500000, filing: mfj }
          expected: 0.133  # $1.5M is 12.3% + 1% mental health surcharge
          
        - input: { state: TX, taxable: 1000000, filing: mfj }
          expected: 0  # No state income tax
          
        - input: { state: NY, taxable: 500000, filing: mfj }
          expected: 0.0685  # $500K is in 6.85% bracket

    TEST_301_K:
      name: "State Tax Calculation - California"
      description: "Verify calcStateTax computes correct CA tax"
      test_function: calcStateTax
      input: { state: CA, taxable: 500000, filing: mfj }
      expected:
        # CA MFJ brackets applied to $500K:
        # $0-$20,824 @ 1% = $208
        # $20,824-$49,368 @ 2% = $571
        # $49,368-$77,918 @ 4% = $1,142
        # $77,918-$108,162 @ 6% = $1,815
        # $108,162-$136,700 @ 8% = $2,283
        # $136,700-$500,000 @ 9.3% = $33,787
        # Total = ~$39,806
        tax: { approx: 39806, tolerance: 500 }

    TEST_301_L:
      name: "Complete Bucket Waterfall - FAT FIRE Example"
      description: "Full worked example showing bucket fill with gross-up"
      scenario: |
        FAT FIRE couple in California, early retirement
        Need: $200,000 net for living expenses
        
      input:
        need: 200000
        income: 
          earned: 0
          pension: 0
          ss_taxable: 0
          qd: 15000        # From taxable dividends
          interest: 5000
        accts:
          taxable: { value: 3000000, basis: 1200000, gain_ratio: 0.60 }
          traditional: 1500000
          roth: 500000
        deductions:
          deduction_used: 100000  # Large itemized (charitable + property)
          recommended: itemized
        state_rate: 0.113  # CA marginal at ~$900K
        year: 2025
        filing: mfj
        
      calculation: |
        ═══════════════════════════════════════════════════════════════
        STEP 1: CALCULATE BASE STATE
        ═══════════════════════════════════════════════════════════════
        
        ord_gross = 0 + 0 + 0 + 5000 = $5,000 (interest only)
        pref_existing = $15,000 (QD)
        deduction = $100,000
        
        ord_taxable = max(0, 5000 - 100000) = $0
        unused_deduction = max(0, 100000 - 5000) = $95,000
        
        MAGI = ord_gross + pref_existing = $20,000 (well below $250K NIIT)
        
        LTCG 0% space = $96,700 - $0 - $15,000 = $81,700 gains
        
        ═══════════════════════════════════════════════════════════════
        STEP 2: BUILD BUCKETS
        ═══════════════════════════════════════════════════════════════
        
        Gain ratio = 60%, State = 11.3%
        
        TAXABLE_0PCT:
          Space in gains: $81,700
          Gross capacity: $81,700 / 0.60 = $136,167
          Effective rate: 0.60 × 0.113 = 6.78%
          
        TRADITIONAL_0PCT (unused deduction):
          Capacity: $95,000
          Effective rate: 11.3% (state only, 0% federal)
          
        TAXABLE_15PCT (before NIIT threshold):
          MAGI room = $250,000 - $20,000 - $81,700 = $148,300 gains
          Gross capacity: $148,300 / 0.60 = $247,167
          Effective rate: 0.60 × (0.15 + 0.113) = 15.78%
          
        TAXABLE_15PCT_NIIT (after NIIT threshold):
          Remaining taxable
          Effective rate: 0.60 × (0.15 + 0.113 + 0.038) = 18.06%
          
        TRADITIONAL_10PCT:
          Starts at ord_taxable = $0
          Bracket: $0 - $23,850
          Capacity: $23,850
          Effective rate: 0.10 + 0.113 = 21.30%
          
        ═══════════════════════════════════════════════════════════════
        STEP 3: SORT BY EFFECTIVE RATE
        ═══════════════════════════════════════════════════════════════
        
        1. TAXABLE_0PCT       @  6.78%  (capacity: $136,167)
        2. TRADITIONAL_0PCT   @ 11.30%  (capacity: $95,000)
        3. TAXABLE_15PCT      @ 15.78%  (capacity: $247,167)
        4. TAXABLE_15PCT_NIIT @ 18.06%  (remaining)
        5. TRADITIONAL_10PCT  @ 21.30%  (capacity: $23,850)
        6. ROTH               @  0.00%  (LAST - preserve growth)
        
        ═══════════════════════════════════════════════════════════════
        STEP 4: FILL BUCKETS (Gross-Up Formula)
        ═══════════════════════════════════════════════════════════════
        
        Need = $200,000 net
        
        BUCKET 1: TAXABLE_0PCT @ 6.78%
          Max net = $136,167 × (1 - 0.0678) = $126,934
          Use: ALL of it
          Gross: $136,167
          Tax: $136,167 × 0.0678 = $9,232
          Net: $126,935
          Remaining need: $200,000 - $126,935 = $73,065
        
        BUCKET 2: TRADITIONAL_0PCT @ 11.30%
          Max net = $95,000 × (1 - 0.113) = $84,265
          Need only $73,065, which fits
          Gross needed: $73,065 / (1 - 0.113) = $82,372
          Tax: $82,372 × 0.113 = $9,308
          Net: $73,064
          Remaining need: $0 ✓
        
        ═══════════════════════════════════════════════════════════════
        STEP 5: RESULTS
        ═══════════════════════════════════════════════════════════════
        
        | Bucket           | Gross    | Tax    | Net      | Rate   |
        |------------------|----------|--------|----------|--------|
        | TAXABLE_0PCT     | $136,167 | $9,232 | $126,935 | 6.78%  |
        | TRADITIONAL_0PCT | $82,372  | $9,308 | $73,064  | 11.30% |
        | TOTAL            | $218,539 | $18,540| $199,999 | 8.48%  |
        
        Blended effective rate: $18,540 / $200,000 = 9.27%
        
        KEY INSIGHT: 
        - Used TRADITIONAL_0PCT (11.3%) instead of TAXABLE_15PCT (15.78%)
        - Saved: ($73,065 / 0.8422) × 0.1578 - $9,308 = $4,402 in taxes!
        - This is the power of filling unused deduction space first.
        
      expected:
        plan[0].bucket_id: TAXABLE_0PCT
        plan[0].gross: { approx: 136167, tolerance: 1000 }
        plan[1].bucket_id: TRADITIONAL_0PCT
        plan[1].gross: { approx: 82372, tolerance: 1000 }
        total_net: { approx: 200000, tolerance: 100 }
        total_tax: { approx: 18540, tolerance: 500 }
        blended_rate: { approx: 0.0927, tolerance: 0.01 }

CALC_302_ROTH_CONVERT:
  level: 4
  requires: [CALC_101, CALC_201]
  trigger: "traditional > 0"
  
  schema:
    optimal: number
    binding: enum[bracket|irmaa|aca|balance]
    tax_cost: number
  
  must_include: [amount, binding_constraint, tax_cost, headroom]
  
  tests:
    TEST_302_A:
      name: "IRMAA Constrained"
      input: { traditional: 500000, current_magi: 180000, filing: mfj }
      expected: { optimal: 26000, binding: irmaa, headroom_to_206K: 26000 }

CALC_303_ANNUAL_DRAW:
  level: 4
  requires: [CALC_100, CALC_101, CALC_102, CALC_201, CALC_301]
  trigger: "Always in schedule generation"

  inputs:
    income.earned:   { type: number, unit: USD, precision: whole }
    income.ss:       { type: number, unit: USD, precision: whole, formula: "(ss_primary + ss_spouse) × 12" }
    income.pension:  { type: number, unit: USD, precision: whole }
    income.qd:       { type: number, unit: USD, precision: whole, formula: "taxable_value × 0.015" }
    income.interest: { type: number, unit: USD, precision: whole }
    base_spend:      { type: number, unit: USD, precision: whole, source: "client.annual_spending" }
    healthcare:      { type: number, unit: USD, precision: whole, source: "CALC_201 or CALC_202" }
    accounts.taxable.value:  { type: number, unit: USD, precision: whole }
    accounts.taxable.basis:  { type: number, unit: USD, precision: whole }
    accounts.traditional:    { type: number, unit: USD, precision: whole }
    accounts.roth:           { type: number, unit: USD, precision: whole }
    filing:          { type: enum, values: [single, mfj, mfs, hoh] }
    year:            { type: number, unit: year }
  
  outputs:
    income_gross:
      type: number, unit: USD, precision: whole
      formula: "earned + ss + pension + qd + interest"
      source: [income.*]
      
    expenses_total:
      type: number, unit: USD, precision: whole
      formula: "base_spend + healthcare + special"
      source: [base_spend, healthcare]
      CRITICAL: "Healthcare MUST be included"
      
    deductions:
      type: number, unit: USD, precision: whole
      formula: "CALC_100(income_gross)"
      
    tax_on_income:
      type: number, unit: USD, precision: whole
      formula: |
        ord_tax = CALC_101(income.ordinary - deductions)
        pref_tax = CALC_102(qd, 0)  # No LTCG yet
        state = income.ordinary × state_rate
        total = ord_tax + pref_tax + state
      note: "Calculate BEFORE withdrawal"
      
    fica:
      type: number, unit: USD, precision: whole
      formula: "min(earned, 176100) × 0.062 + earned × 0.0145"
      
    income_net:
      type: number, unit: USD, precision: whole
      formula: "income_gross - tax_on_income - fica"
      
    gap:
      type: number, unit: USD, precision: whole
      formula: "max(0, expenses_total - income_net)"
      note: "What we need from portfolio"
      
    gain_ratio:
      type: number, unit: ratio, precision: 4dec
      formula: "(taxable.value - taxable.basis) / taxable.value"
      constraint: "0 ≤ gain_ratio ≤ 1"
      
    withdrawal.gross:
      type: number, unit: USD, precision: whole
      formula: "CALC_301(gap)"
      
    withdrawal.tax:
      type: number, unit: USD, precision: whole
      formula: "sum of tax on each withdrawal step"
      
    withdrawal.net:
      type: number, unit: USD, precision: whole
      formula: "withdrawal.gross - withdrawal.tax"
      constraint: "≥ gap × 0.99"
    
    withdrawal.by_bucket:
      type: array
      description: "Bucket-level detail showing exactly where cash came from"
      element:
        bucket_id:      { type: string, example: "TAXABLE_0PCT" }
        source:         { type: enum, values: [taxable, traditional, roth] }
        gross:          { type: number, unit: USD }
        tax:            { type: number, unit: USD }
        net:            { type: number, unit: USD }
        effective_rate: { type: number, unit: ratio }
      example: |
        [
          { bucket_id: "TAXABLE_0PCT", source: "taxable", gross: 136167, tax: 9232, net: 126935, effective_rate: 0.0678 },
          { bucket_id: "TRADITIONAL_0PCT", source: "traditional", gross: 82372, tax: 9308, net: 73064, effective_rate: 0.113 }
        ]
    
    withdrawal.by_source:
      type: object
      description: "Aggregated by source for portfolio updates"
      fields:
        taxable:     { gross: number, tax: number, net: number, basis_consumed: number }
        traditional: { gross: number, tax: number, net: number }
        roth:        { gross: number, tax: number, net: number }
      formula: |
        taxable.gross = sum(bucket.gross where source='taxable')
        taxable.basis_consumed = taxable.gross × (1 - gain_ratio)
        traditional.gross = sum(bucket.gross where source='traditional')
        roth.gross = sum(bucket.gross where source='roth')
      
    balance:
      type: number, unit: USD, precision: whole
      formula: "income_net + withdrawal.net - expenses_total"
      constraint: "|balance| < 100"
      note: "Should be ≈ 0"
      
    cash_flow_summary:
      type: object
      description: "Complete picture of money in and money out"
      fields:
        sources:
          income_net:           { type: number, note: "After income taxes" }
          withdrawal_taxable:   { type: number, note: "From taxable accounts (net)" }
          withdrawal_trad:      { type: number, note: "From Traditional (net)" }
          withdrawal_roth:      { type: number, note: "From Roth (net)" }
          total_available:      { type: number, formula: "sum of above" }
        uses:
          base_spending:        { type: number }
          healthcare:           { type: number }
          taxes_on_income:      { type: number }
          taxes_on_withdrawal:  { type: number }
          total_uses:           { type: number }
        reconciliation:
          sources_minus_uses:   { type: number, constraint: "≈ 0" }
  
  invariants:
    - gap = max(0, expenses_total - income_net)
    - withdrawal.net ≥ gap × 0.99
    - expenses_total includes healthcare
    - income_net = income_gross - tax_on_income - fica
    - |balance| < 100
  
  tests:
    TEST_303_A:
      name: "Early Retirement Draw - No Earned Income"
      input:
        income: { earned: 0, ss: 0, pension: 0, qd: 45000, interest: 5000 }
        base_spend: 285000
        healthcare: 24000
        accounts: { taxable: {value: 3000000, basis: 1500000}, traditional: 2000000, roth: 500000 }
        filing: mfj
        year: 2025
      expected:
        income_gross: 50000
        expenses_total: 309000
        tax_on_income: 0
        fica: 0
        income_net: 50000
        gap: 259000
        gain_ratio: 0.50
        withdrawal_gross: 280000
        withdrawal_tax: 21000
        withdrawal_net: 259000
        balance: 0
      tolerance: 1000
      calculation: |
        1. income_gross = 0 + 0 + 0 + 45000 + 5000 = 50000
        2. expenses_total = 285000 + 24000 = 309000
        3. tax_on_income = 0 (QD fills 0% bracket: 46700 space, only 45K QD)
        4. fica = 0 (no earned income)
        5. income_net = 50000 - 0 - 0 = 50000
        6. gap = max(0, 309000 - 50000) = 259000
        7. gain_ratio = (3000000 - 1500000) / 3000000 = 0.50
        8. Withdrawal from taxable:
           - First at 0%: space = 96700 - 50000 = 46700 of gains
             gross = 46700 / 0.50 = 93400, tax = 0
           - Rest at 15%: need 259000 - 93400 = 165600 net
             tax_rate = 0.50 × 0.15 = 0.075 effective
             gross = 165600 / (1 - 0.075) = 179135, tax = 13435
           - Total gross = 272535, tax = 13435
        9. balance = 50000 + 259100 - 309000 ≈ 0 ✓

CALC_304_CASHFLOW_SCHEDULE:
  level: 4
  requires: [CALC_107, CALC_301, CALC_303]
  trigger: "Generate for full retirement horizon"
  
  purpose: |
    Create year-by-year cash flow showing EXACTLY where money comes from
    and where it goes. Each year tracks bucket-level withdrawal detail
    to ensure net expenses match available cash.

  inputs:
    client:
      ages: { primary: number, spouse: number }
      state: { type: string, example: "CA" }
      filing: { type: enum, values: [single, mfj] }
    projection:
      start_year: { type: number }
      end_year: { type: number, note: "Usually to age 95" }
      inflation: { type: number, default: 0.025 }
      returns: { type: object, fields: [taxable, traditional, roth] }
    spending:
      base_annual: { type: number, unit: USD }
      healthcare_base: { type: number, unit: USD }
      discretionary: { type: number, unit: USD, optional: true }
    income_schedule:
      type: array
      element:
        year: number
        earned: number
        ss_primary: number
        ss_spouse: number
        pension: number
    accounts_initial:
      taxable: { value: number, basis: number }
      traditional: number
      roth: number
    deduction_schedule:
      type: "output from CALC_107"
      
  outputs:
    schedule:
      type: array
      element:
        year:       { type: number }
        ages:       { primary: number, spouse: number }
        phase:      { type: enum, values: [accumulation, early_retire, ss_bridge, rmd, late] }
        
        # ─── INCOME SOURCES ───────────────────────────────────────
        income:
          earned:     { type: number, unit: USD }
          ss:         { type: number, unit: USD, note: "Combined SS" }
          pension:    { type: number, unit: USD }
          qd:         { type: number, unit: USD, note: "From taxable portfolio" }
          interest:   { type: number, unit: USD }
          gross:      { type: number, formula: "sum of above" }
          tax:        { type: number, note: "Fed + state + FICA on income" }
          net:        { type: number, formula: "gross - tax" }
          
        # ─── EXPENSES ─────────────────────────────────────────────
        expenses:
          base:       { type: number, unit: USD, note: "Inflated from base_annual" }
          healthcare: { type: number, unit: USD, note: "From CALC_201/202" }
          irmaa:      { type: number, unit: USD, note: "Medicare surcharge if applicable" }
          special:    { type: number, unit: USD, optional: true }
          total:      { type: number, formula: "sum of above" }
        
        # ─── FUNDING GAP ──────────────────────────────────────────
        gap:
          needed:     { type: number, formula: "max(0, expenses.total - income.net)" }
          description: "How much must come from portfolio"
        
        # ─── WITHDRAWALS BY BUCKET ────────────────────────────────
        withdrawals:
          buckets:
            type: array
            element:
              bucket_id:      { type: string }
              source:         { type: enum, values: [taxable, traditional, roth] }
              gross:          { type: number }
              tax:            { type: number }
              net:            { type: number }
              effective_rate: { type: number }
            example: |
              [
                { bucket_id: "TAXABLE_0PCT", source: "taxable", gross: 136167, tax: 9232, net: 126935, effective_rate: 0.0678 },
                { bucket_id: "TRADITIONAL_0PCT", source: "traditional", gross: 82372, tax: 9308, net: 73064, effective_rate: 0.1130 }
              ]
          
          by_source:
            taxable:
              gross:          { type: number }
              tax:            { type: number }
              net:            { type: number }
              basis_consumed: { type: number, formula: "gross × (1 - gain_ratio)" }
              gain_realized:  { type: number, formula: "gross × gain_ratio" }
            traditional:
              gross:          { type: number }
              tax:            { type: number }
              net:            { type: number }
            roth:
              gross:          { type: number }
              tax:            { type: number, note: "Always 0" }
              net:            { type: number }
          
          totals:
            gross:          { type: number }
            tax:            { type: number }
            net:            { type: number }
            blended_rate:   { type: number, formula: "tax / net" }
        
        # ─── CASH FLOW RECONCILIATION ─────────────────────────────
        cash_flow:
          sources:
            income_net:       { type: number }
            withdrawal_net:   { type: number }
            total:            { type: number }
          uses:
            expenses:         { type: number }
            taxes_paid:       { type: number, note: "Already netted from sources" }
            total:            { type: number }
          balance:            { type: number, constraint: "≈ 0" }
        
        # ─── PORTFOLIO END OF YEAR ────────────────────────────────
        portfolio:
          taxable:
            boy:              { type: number, note: "Beginning of year" }
            withdrawal:       { type: number, note: "Gross withdrawn" }
            return:           { type: number, note: "(BOY - withdrawal) × return_rate" }
            eoy:              { type: number, formula: "boy - withdrawal + return" }
            basis:            { type: number, note: "Updated after withdrawal" }
            gain_ratio:       { type: number, formula: "(eoy - basis) / eoy" }
          traditional:
            boy:              { type: number }
            withdrawal:       { type: number }
            rmd_required:     { type: number, optional: true }
            return:           { type: number }
            eoy:              { type: number }
          roth:
            boy:              { type: number }
            withdrawal:       { type: number }
            return:           { type: number }
            eoy:              { type: number }
          total:
            boy:              { type: number }
            eoy:              { type: number }
            change:           { type: number }
    
    summary:
      total_years:          { type: number }
      total_withdrawn:      { type: number, note: "Sum of all withdrawals" }
      total_taxes_paid:     { type: number, note: "On all withdrawals" }
      average_blended_rate: { type: number }
      portfolio_low_point:  { year: number, amount: number }
      portfolio_end:        { type: number }
      success:              { type: boolean, note: "Never ran out of money" }

  tests:
    TEST_304_A:
      name: "10-Year Cash Flow Trace"
      description: "Verify year-by-year cash flow balances"
      input:
        client: { ages: { primary: 55, spouse: 52 }, state: CA, filing: mfj }
        projection: { start_year: 2025, end_year: 2035, inflation: 0.025 }
        spending: { base_annual: 300000, healthcare_base: 24000 }
        accounts_initial:
          taxable: { value: 3000000, basis: 1200000 }
          traditional: 1500000
          roth: 500000
      expected:
        # Each year should balance: income_net + withdrawal_net = expenses
        each_year: { cash_flow.balance: { approx: 0, tolerance: 100 } }
        # Gain ratio should decrease as we spend high-basis first
        schedule[0].portfolio.taxable.gain_ratio: 0.60
        schedule[5].portfolio.taxable.gain_ratio: { lt: 0.70, note: "Increases as basis depletes" }

    TEST_304_B:
      name: "Bucket Tracking Through Transition"
      description: "Verify bucket usage changes as accounts shift"
      scenario: |
        Early years: Use TAXABLE_0PCT first (cheapest)
        Middle years: LTCG 0% exhausted, use TAXABLE_15PCT
        Later years: Taxable depleted, Traditional becomes primary
      expected:
        schedule[0].withdrawals.buckets[0].bucket_id: TAXABLE_0PCT
        # By year 10, should see Traditional usage increase
        schedule[10].withdrawals.by_source.traditional.gross: { gt: 0 }

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 5: SOCIAL SECURITY
# ═══════════════════════════════════════════════════════════════════════════

CALC_401_SS_BENEFIT:
  level: 5
  requires: [REF_SS]
  
  schema:
    pia: number
    fra_benefit: number
    age_62_benefit: number
    age_70_benefit: number
  
  must_include: [pia, benefits_at_62_fra_70, breakeven_ages]
  
  tests:
    TEST_401_A:
      name: "PIA $3000"
      input: { pia: 3000, birth_year: 1965 }
      expected: { fra: 67, age_62: 2100, age_70: 3720 }

CALC_402_SS_EARNINGS_TEST:
  level: 5
  requires: [CALC_401]
  trigger: "ss_age < fra AND earned > 0"
  lazy: true
  
  schema:
    threshold: number
    excess: number
    reduction: number
    net_benefit: number
  
  invariants:
    - reduction = excess / 2 (pre-FRA)  # CRITICAL from §0
    - net_benefit = max(0, benefit - reduction)
  
  tests:
    TEST_402_A:
      name: "High Earner Pre-FRA"
      input: { benefit: 2500, earned: 75000, threshold: 22320 }
      expected: { excess: 52680, reduction: 26340, net: 0, restored_at_fra: 26340 }

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 6: ESTATE
# ═══════════════════════════════════════════════════════════════════════════

CALC_501_ESTATE:
  level: 6
  requires: [REF_ESTATE]
  
  schema:
    gross_estate: number
    exemption: number
    taxable: number
    tax: number
  
  invariants:
    - taxable = max(0, gross - exemption)
    - tax = taxable × 0.40
  
  tests:
    TEST_501_A:
      name: "Over Exemption"
      input: { gross: 20000000, exemption: 13610000 }
      expected: { taxable: 6390000, tax: 2556000 }
      
    TEST_501_B:
      name: "Estate Tax Under Sunset"
      input: { value: 20000000, year: 2027, tcja: sunset, priorGifts: 0, filing: mfj }
      expected: { taxable: {min: 5000000}, tax: {min: 2000000} }
      tolerance: 100000

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 8: SIMULATION
# ═══════════════════════════════════════════════════════════════════════════

CALC_701_MONTE_CARLO:
  level: 8
  requires: [CALC_301, CALC_401]
  
  schema:
    params: { n, return_mean, return_std, inflation, horizon }
    success_rate: number
    percentiles: { p5, p25, p50, p75, p95 }
  
  invariants:
    - 0 ≤ success_rate ≤ 1
    - p5 ≤ p50 ≤ p95
  
  must_include: [params, success_rate, percentiles, worst_case]

# ═══════════════════════════════════════════════════════════════════════════
# LEVEL 9: OUTPUTS
# ═══════════════════════════════════════════════════════════════════════════

OUT_SCHEDULE:
  level: 9
  requires: [CALC_*]
  format: JSON
  schema: |
    years[]: { year, ages, phase, income{}, withdrawals{}, taxes{}, healthcare{}, expenses{}, portfolio_eoy{} }
  invariants:
    - years.length = horizon (typically 40)
    - each year balances: income + withdrawals = expenses + taxes + savings

OUT_REPORT:
  level: 9
  requires: [OUT_SCHEDULE, CALC_701]
  format: HTML (Bootstrap 5.3)
  sections: [executive_summary, fire_readiness, tax_strategy, year_by_year, withdrawal_plan, roth_roadmap, healthcare, ss_strategy, estate, monte_carlo, action_items]

# ═══════════════════════════════════════════════════════════════════════════
# BUILD ORDER
# ═══════════════════════════════════════════════════════════════════════════

BUILD_ORDER:
  L0: [REF_*] → GATE_REF
  L1: [CALC_100, CALC_106?] → GATE_DEDUCT
  L2: [CALC_101, CALC_102, CALC_105?] → GATE_TAX
  L3: [CALC_201, CALC_202?] → GATE_HEALTH
  L4: [CALC_301, CALC_302, CALC_303] → GATE_WDRAW
  L5: [CALC_401, CALC_402?] → GATE_SS
  L6: [CALC_501, CALC_502] → GATE_ESTATE
  L7: [CALC_601]
  L8: [CALC_701]
  L9: [OUT_SCHEDULE, OUT_REPORT] → GATE_OUTPUT

ANNUAL_FLOW:
  1: INCOME_GROSS → earned + ss + pension + qd + interest
  2: EXPENSES → base_spend + healthcare + special → total_need
  3: INCOME_TAX → tax on income_gross (before withdrawal)
  4: INCOME_NET → income_gross - income_tax - fica
  5: GAP → max(0, total_need - income_net) → withdrawal_required
  6: WITHDRAW → gross_up(gap) from taxable/traditional/roth
  7: FINAL_TAX → recalculate with income + withdrawal
  8: VERIFY → income_net + withdrawal_net ≈ expenses
```

---


## §4 CALCULATION ENGINES

```javascript
// ═══════════════════════════════════════════════════════════════
// VALIDATION FRAMEWORK - COMPREHENSIVE ERROR CHECKING
// ═══════════════════════════════════════════════════════════════

const VALIDATION = {
  errors: [],
  warnings: [],
  checks: [],  // Log of all checks performed
  
  reset() { 
    this.errors = []; 
    this.warnings = []; 
    this.checks = [];
  },
  
  log(check, passed, context = {}) {
    this.checks.push({ check, passed, context, ts: Date.now() });
  },
  
  halt(msg, context = {}) {
    const err = { level: 'HALT', msg, context, ts: Date.now() };
    this.errors.push(err);
    throw new Error(`HALT: ${msg} | ${JSON.stringify(context)}`);
  },
  
  error(msg, context = {}) {
    this.errors.push({ level: 'ERROR', msg, context, ts: Date.now() });
    console.error(`ERROR: ${msg}`, context);
  },
  
  warn(msg, context = {}) {
    this.warnings.push({ level: 'WARN', msg, context, ts: Date.now() });
    console.warn(`WARN: ${msg}`, context);
  },
  
  getReport() {
    return { 
      valid: this.errors.length === 0,
      errors: this.errors, 
      warnings: this.warnings,
      checks_performed: this.checks.length,
      checks_failed: this.checks.filter(c => !c.passed).length,
      summary: `${this.errors.length} errors, ${this.warnings.length} warnings, ${this.checks.length} checks`
    };
  }
};

// ═══════════════════════════════════════════════════════════════
// CORE VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function require(condition, message, context = {}) {
  VALIDATION.log(message, condition, context);
  if (!condition) VALIDATION.halt(message, context);
}

function warn(condition, message, context = {}) {
  VALIDATION.log(message, condition, context);
  if (!condition) VALIDATION.warn(message, context);
}

// ═══════════════════════════════════════════════════════════════
// RANGE CHECKS
// ═══════════════════════════════════════════════════════════════

function checkRange(value, name, min, max, level = 'HALT') {
  const passed = value >= min && (max === null || value <= max);
  VALIDATION.log(`range:${name}`, passed, { value, min, max });
  if (!passed) {
    const msg = `${name} = ${value} outside range [${min}, ${max ?? '∞'}]`;
    if (level === 'HALT') VALIDATION.halt(msg, { value, min, max });
    else if (level === 'ERROR') VALIDATION.error(msg, { value, min, max });
    else VALIDATION.warn(msg, { value, min, max });
  }
  return passed;
}

function checkNonNegative(value, name, level = 'HALT') {
  return checkRange(value, name, 0, null, level);
}

function checkPositive(value, name, level = 'HALT') {
  const passed = value > 0;
  VALIDATION.log(`positive:${name}`, passed, { value });
  if (!passed) {
    const msg = `${name} = ${value} must be > 0`;
    if (level === 'HALT') VALIDATION.halt(msg, { value });
    else if (level === 'ERROR') VALIDATION.error(msg, { value });
    else VALIDATION.warn(msg, { value });
  }
  return passed;
}

function checkPercentage(value, name, level = 'ERROR') {
  return checkRange(value, name, 0, 1, level);
}

// ═══════════════════════════════════════════════════════════════
// RELATIONAL CHECKS
// ═══════════════════════════════════════════════════════════════

function checkIdentity(a, b, name, tolerance = 1, level = 'HALT') {
  const diff = Math.abs(a - b);
  const passed = diff <= tolerance;
  VALIDATION.log(`identity:${name}`, passed, { a, b, diff, tolerance });
  if (!passed) {
    const msg = `${name}: ${a.toLocaleString()} ≠ ${b.toLocaleString()} (diff=${diff.toFixed(2)}, tol=${tolerance})`;
    if (level === 'HALT') VALIDATION.halt(msg, { a, b, diff, tolerance });
    else if (level === 'ERROR') VALIDATION.error(msg, { a, b, diff, tolerance });
    else VALIDATION.warn(msg, { a, b, diff, tolerance });
  }
  return passed;
}

function checkLessOrEqual(a, b, aName, bName, level = 'ERROR') {
  const passed = a <= b;
  VALIDATION.log(`${aName} ≤ ${bName}`, passed, { a, b });
  if (!passed) {
    const msg = `${aName} (${a.toLocaleString()}) should be ≤ ${bName} (${b.toLocaleString()})`;
    if (level === 'HALT') VALIDATION.halt(msg, { a, b });
    else VALIDATION.error(msg, { a, b });
  }
  return passed;
}

function checkGreaterOrEqual(a, b, aName, bName, level = 'ERROR') {
  return checkLessOrEqual(b, a, bName, aName, level);
}

function checkMonotonic(values, name, ascending = true, level = 'ERROR') {
  let passed = true;
  for (let i = 1; i < values.length; i++) {
    if (ascending ? values[i] < values[i-1] : values[i] > values[i-1]) {
      passed = false;
      break;
    }
  }
  VALIDATION.log(`monotonic:${name}`, passed, { values, ascending });
  if (!passed) {
    const msg = `${name} should be ${ascending ? 'ascending' : 'descending'}`;
    if (level === 'HALT') VALIDATION.halt(msg, { values });
    else VALIDATION.error(msg, { values });
  }
  return passed;
}

// ═══════════════════════════════════════════════════════════════
// ARITHMETIC CHECKS
// ═══════════════════════════════════════════════════════════════

function safeDivide(numerator, denominator, defaultValue = 0) {
  if (denominator === 0 || !isFinite(denominator)) {
    VALIDATION.warn(`Division by zero: ${numerator} / ${denominator}`, { numerator, denominator });
    return defaultValue;
  }
  const result = numerator / denominator;
  if (!isFinite(result)) {
    VALIDATION.warn(`Non-finite result: ${numerator} / ${denominator} = ${result}`, { numerator, denominator, result });
    return defaultValue;
  }
  return result;
}

function checkSum(parts, expectedTotal, name, tolerance = 1, level = 'ERROR') {
  const actualSum = parts.reduce((s, p) => s + p, 0);
  return checkIdentity(actualSum, expectedTotal, `sum:${name}`, tolerance, level);
}

function checkProduct(a, b, expectedProduct, name, tolerance = 1, level = 'ERROR') {
  const actualProduct = a * b;
  return checkIdentity(actualProduct, expectedProduct, `product:${name}`, tolerance, level);
}

// ═══════════════════════════════════════════════════════════════
// FINANCIAL-SPECIFIC CHECKS
// ═══════════════════════════════════════════════════════════════

function checkTaxResult(result, context = {}) {
  const checks = [];
  
  // Tax must be non-negative
  checks.push(checkNonNegative(result.gross_tax ?? result.tax ?? 0, 'tax', 'ERROR'));
  
  // Effective rate must be ≤ marginal rate
  if (result.effective_rate !== undefined && result.marginal_rate !== undefined) {
    checks.push(checkLessOrEqual(result.effective_rate, result.marginal_rate, 
      'effective_rate', 'marginal_rate', 'ERROR'));
  }
  
  // Effective rate must be reasonable (0-50%)
  if (result.effective_rate !== undefined) {
    checks.push(checkRange(result.effective_rate, 'effective_rate', 0, 0.5, 'WARN'));
  }
  
  // Breakdown should sum to total
  if (result.breakdown && result.gross_tax !== undefined) {
    const breakdownSum = result.breakdown.reduce((s, b) => s + (b.tax ?? b.tax_in_bracket ?? 0), 0);
    checks.push(checkIdentity(breakdownSum, result.gross_tax, 'breakdown_sum', 10, 'ERROR'));
  }
  
  return checks.every(c => c);
}

function checkWithdrawalResult(result, need, context = {}) {
  const checks = [];
  
  // Net withdrawal should meet need (within 1%)
  checks.push(checkGreaterOrEqual(result.total_net, need * 0.99, 
    'total_net', 'need * 0.99', 'WARN'));
  
  // Gross must be ≥ net
  checks.push(checkGreaterOrEqual(result.total_gross, result.total_net,
    'total_gross', 'total_net', 'ERROR'));
  
  // Tax must be non-negative
  checks.push(checkNonNegative(result.total_tax, 'total_tax', 'ERROR'));
  
  // Gross - Tax = Net
  checks.push(checkIdentity(result.total_gross - result.total_tax, result.total_net,
    'gross - tax = net', 1, 'ERROR'));
  
  // First source should not be Roth (unless no other choice)
  if (result.plan && result.plan.length > 0 && result.plan[0].source === 'roth') {
    VALIDATION.warn('Roth withdrawn first - verify other sources exhausted', context);
  }
  
  return checks.every(c => c);
}

function checkGainRatio(gainRatio, value, basis, name = 'gain_ratio') {
  const checks = [];
  
  // Gain ratio must be 0-1
  checks.push(checkRange(gainRatio, name, 0, 1, 'ERROR'));
  
  // Verify calculation: (value - basis) / value
  if (value > 0) {
    const calculated = (value - basis) / value;
    checks.push(checkIdentity(gainRatio, calculated, `${name} formula`, 0.0001, 'WARN'));
  }
  
  // Basis must be ≤ value
  checks.push(checkLessOrEqual(basis, value, 'basis', 'value', 'ERROR'));
  
  return checks.every(c => c);
}

function checkAnnualBalance(income_net, withdrawal_net, expenses_total, tolerance = 100) {
  const balance = income_net + withdrawal_net - expenses_total;
  const passed = Math.abs(balance) <= tolerance;
  VALIDATION.log('annual_balance', passed, { income_net, withdrawal_net, expenses_total, balance, tolerance });
  
  if (!passed) {
    VALIDATION.error(
      `Annual balance failed: ${income_net.toLocaleString()} + ${withdrawal_net.toLocaleString()} - ${expenses_total.toLocaleString()} = ${balance.toLocaleString()} (should be ≈ 0)`,
      { income_net, withdrawal_net, expenses_total, balance }
    );
  }
  return passed;
}

// ═══════════════════════════════════════════════════════════════
// BRACKET STACKING CHECKS
// ═══════════════════════════════════════════════════════════════

function checkBracketAllocation(at_0, at_15, at_20, total_preferential, tolerance = 1) {
  const checks = [];
  
  // Sum must equal total
  checks.push(checkIdentity(at_0 + at_15 + at_20, total_preferential, 
    'bracket_allocation_sum', tolerance, 'ERROR'));
  
  // Each must be non-negative
  checks.push(checkNonNegative(at_0, 'at_0', 'ERROR'));
  checks.push(checkNonNegative(at_15, 'at_15', 'ERROR'));
  checks.push(checkNonNegative(at_20, 'at_20', 'ERROR'));
  
  // Should fill lower brackets first (at_15 = 0 if at_0 not full, etc.)
  // This is a warning since there may be edge cases
  if (at_15 > 0 && at_0 === 0) {
    VALIDATION.warn('at_15 > 0 but at_0 = 0 - verify 0% bracket is full', { at_0, at_15 });
  }
  
  return checks.every(c => c);
}

// ═══════════════════════════════════════════════════════════════
// OPTIONS CHECKS
// ═══════════════════════════════════════════════════════════════

function checkOptionsResult(result, type) {
  const checks = [];
  
  // Spread must be non-negative
  checks.push(checkNonNegative(result.spread, 'spread', 'ERROR'));
  
  // Type-specific invariants
  if (type === 'nso') {
    checks.push(checkIdentity(result.ordinary_income, result.spread, 
      'NSO: ordinary = spread', 1, 'ERROR'));
    checks.push(checkIdentity(result.amt_preference, 0, 
      'NSO: amt_preference = 0', 1, 'ERROR'));
  } else if (type === 'iso' && !result.sold_same_day) {
    checks.push(checkIdentity(result.ordinary_income, 0, 
      'ISO hold: ordinary = 0', 1, 'ERROR'));
    checks.push(checkIdentity(result.amt_preference, result.spread, 
      'ISO hold: amt_preference = spread', 1, 'ERROR'));
  }
  
  // Critical: net_proceeds = spread - taxes
  checks.push(checkIdentity(result.net_proceeds, result.spread - result.taxes.total_withheld,
    'net_proceeds = spread - taxes', 1, 'HALT'));
  
  return checks.every(c => c);
}

// ═══════════════════════════════════════════════════════════════
// SCHEDULE VALIDATION
// ═══════════════════════════════════════════════════════════════

function validateScheduleYear(year, prevYear = null) {
  const checks = [];
  
  // Age should increment
  if (prevYear) {
    checks.push(checkIdentity(year.age_p, prevYear.age_p + 1, 'age increment', 0, 'ERROR'));
  }
  
  // Portfolio should be positive (until very late)
  if (year.portfolio_eoy?.total < 0) {
    VALIDATION.error('Portfolio went negative', { year: year.year, total: year.portfolio_eoy.total });
  }
  
  // Gain ratio should be valid
  if (year.portfolio_eoy?.taxable_gain_ratio !== undefined) {
    checks.push(checkRange(year.portfolio_eoy.taxable_gain_ratio, 'gain_ratio', 0, 1, 'WARN'));
  }
  
  // Balance check
  if (year.balance_check) {
    checks.push(checkAnnualBalance(
      year.balance_check.income_net,
      year.balance_check.withdrawal_net,
      year.balance_check.expenses_total,
      100
    ));
  }
  
  return checks.every(c => c);
}

function validateFullSchedule(schedule) {
  VALIDATION.reset();
  let allPassed = true;
  
  for (let i = 0; i < schedule.length; i++) {
    const prevYear = i > 0 ? schedule[i-1] : null;
    if (!validateScheduleYear(schedule[i], prevYear)) {
      allPassed = false;
    }
  }
  
  // Check monotonic portfolio decline makes sense
  const portfolioValues = schedule.map(y => y.portfolio_eoy?.total ?? 0);
  // Don't require strict monotonic decline - growth can happen
  
  return VALIDATION.getReport();
}

// ═══════════════════════════════════════════════════════════════
// CALC_100: DEDUCTIONS (with validation)
// ═══════════════════════════════════════════════════════════════

function calcDeductions(input) {
  const { gross_income, salt, mortgage, charitable, medical, above_line, filing, year } = input;
  
  // Input validation
  checkNonNegative(gross_income, 'gross_income', 'WARN');
  checkRange(gross_income, 'gross_income', 0, 50000000, 'WARN');
  checkRange(year, 'year', 2024, 2060, 'HALT');
  
  const tax = getTaxTable(year, 'current', filing);
  
  // Above-the-line deductions
  const aboveLine = (above_line?.hsa || 0) + (above_line?.ira || 0) + (above_line?.se_health || 0);
  const agi = gross_income - aboveLine;
  
  // SALT (capped at $10,000)
  const saltActual = (salt?.state_tax || 0) + (salt?.property_tax || 0);
  const saltDeductible = Math.min(saltActual, DEDUCTION_LIMITS.salt_cap);
  const saltLost = saltActual - saltDeductible;
  
  // Mortgage interest (limited to $750K acquisition debt)
  const mortgageBalance = mortgage?.balance || 0;
  const mortgageRate = mortgage?.rate || 0;
  const acquisitionDebt = Math.min(mortgage?.acquisition_debt || mortgageBalance, DEDUCTION_LIMITS.mortgage_limit);
  const mortgageInterest = mortgageBalance * mortgageRate;
  const mortgageDeductible = mortgageBalance > 0 
    ? mortgageInterest * (acquisitionDebt / mortgageBalance) 
    : 0;
  
  // Charitable (cash: 60% AGI, appreciated: 30% AGI)
  const charityCash = Math.min(charitable?.cash || 0, agi * DEDUCTION_LIMITS.charity_cash_limit);
  const charityAppreciated = Math.min(
    charitable?.appreciated_assets?.reduce((s, a) => s + a.value, 0) || 0,
    agi * DEDUCTION_LIMITS.charity_appreciated_limit
  );
  const charityTotal = charityCash + charityAppreciated;
  
  // Avoided gains on appreciated donations
  const avoidedGains = charitable?.appreciated_assets
    ?.filter(a => a.holding === 'long_term')
    ?.reduce((s, a) => s + (a.value - a.basis), 0) || 0;
  
  // Medical (exceeds 7.5% of AGI)
  const medicalTotal = medical?.total_expenses || 0;
  const medicalFloor = agi * DEDUCTION_LIMITS.medical_floor;
  const medicalDeductible = Math.max(0, medicalTotal - medicalFloor);
  
  // Itemized total
  const itemizedTotal = saltDeductible + mortgageDeductible + charityTotal + medicalDeductible;
  const standardDeduction = tax.sd;
  const useItemized = itemizedTotal > standardDeduction;
  
  const taxableIncome = Math.max(0, agi - (useItemized ? itemizedTotal : standardDeduction));
  
  return {
    agi,
    taxable_income: taxableIncome,
    method: useItemized ? 'itemized' : 'standard',
    deduction_used: useItemized ? itemizedTotal : standardDeduction,
    detail: {
      salt: { actual: saltActual, deductible: saltDeductible, lost: saltLost },
      mortgage: { interest: mortgageInterest, deductible: Math.round(mortgageDeductible) },
      charity: { cash: charityCash, appreciated: charityAppreciated, total: charityTotal, avoided_gains: avoidedGains },
      medical: { total: medicalTotal, floor: medicalFloor, deductible: medicalDeductible }
    },
    standard_deduction: standardDeduction,
    itemized_total: itemizedTotal
  };
}

// ═══════════════════════════════════════════════════════════════
// CALC_106: STOCK OPTIONS
// ═══════════════════════════════════════════════════════════════

function calcOptionsExercise(grant, exercise, withholding, client, year) {
  require(grant.type === 'nso' || grant.type === 'iso', `Invalid grant type: ${grant.type}`);
  
  const shares = exercise.shares_exercised;
  const exercisePrice = grant.exercise_price;
  const fmv = exercise.fmv_at_exercise;
  const salePrice = exercise.sale_price || fmv;
  
  require(fmv >= exercisePrice, `FMV ${fmv} < exercise price ${exercisePrice}`);
  
  // Spread calculation
  const spreadPerShare = fmv - exercisePrice;
  const totalSpread = spreadPerShare * shares;
  
  // Holding period checks for ISO
  let isQualifying = false;
  if (grant.type === 'iso' && exercise.sale_date) {
    const grantDate = new Date(grant.grant_date);
    const exerciseDate = new Date(exercise.exercise_date);
    const saleDate = new Date(exercise.sale_date);
    const daysFromExercise = (saleDate - exerciseDate) / (1000 * 60 * 60 * 24);
    const daysFromGrant = (saleDate - grantDate) / (1000 * 60 * 60 * 24);
    isQualifying = daysFromExercise >= 365 && daysFromGrant >= 730;
  }
  
  // Tax characterization
  let ordinaryIncome = 0, amtPreference = 0, ltcgIncome = 0, stcgIncome = 0;
  
  if (grant.type === 'nso') {
    ordinaryIncome = totalSpread;
    // Additional gain/loss from sale
    if (exercise.sold_same_day && salePrice !== fmv) {
      const additionalGain = (salePrice - fmv) * shares;
      stcgIncome = additionalGain;  // Always short-term on same-day
    }
  } else {  // ISO
    if (exercise.sold_same_day) {
      // Disqualifying disposition - spread is ordinary income
      ordinaryIncome = totalSpread;
    } else if (exercise.sale_date && !isQualifying) {
      // Disqualifying disposition at later date
      ordinaryIncome = Math.min(totalSpread, (salePrice - exercisePrice) * shares);
      const additionalGain = (salePrice - fmv) * shares;
      if (additionalGain > 0) stcgIncome = additionalGain;
      else ltcgIncome = additionalGain;  // Could be negative
    } else if (exercise.sale_date && isQualifying) {
      // Qualifying disposition - all LTCG
      ltcgIncome = (salePrice - exercisePrice) * shares;
    } else {
      // Exercise and hold - AMT preference only
      amtPreference = totalSpread;
    }
  }
  
  // Calculate withholding (NSO only)
  const taxes = calcOptionsWithholding(ordinaryIncome, grant.type, withholding, client, year);
  
  // Net proceeds calculation
  let grossProceeds, netProceeds, sharesRetained;
  
  if (exercise.sold_same_day) {
    grossProceeds = salePrice * shares;
    const exerciseCost = exercisePrice * shares;
    netProceeds = grossProceeds - exerciseCost - taxes.total_withheld;
    sharesRetained = 0;
  } else if (withholding?.sell_to_cover && grant.type === 'nso') {
    const sharesToSell = Math.ceil(taxes.total_withheld / fmv);
    sharesRetained = shares - sharesToSell;
    grossProceeds = sharesToSell * fmv;
    netProceeds = sharesRetained * fmv;  // Paper value
  } else {
    sharesRetained = shares;
    const exerciseCost = exercisePrice * shares;
    netProceeds = sharesRetained * fmv - exerciseCost;
    if (grant.type === 'nso' && !withholding?.sell_to_cover) {
      netProceeds -= taxes.total_withheld;  // Must pay taxes from other funds
    }
  }
  
  // Cost basis for retained shares
  let costBasis;
  if (grant.type === 'nso') {
    costBasis = fmv * sharesRetained;  // Basis = FMV (spread already taxed)
  } else {
    costBasis = {
      regular: exercisePrice * sharesRetained,
      amt: fmv * sharesRetained
    };
  }
  
  return {
    grant_id: grant.grant_id,
    grant_type: grant.type,
    exercise_date: exercise.exercise_date,
    shares_exercised: shares,
    exercise_price: exercisePrice,
    fmv_at_exercise: fmv,
    sale_price: salePrice,
    spread_per_share: spreadPerShare,
    spread: totalSpread,
    is_qualifying: isQualifying,
    ordinary_income: ordinaryIncome,
    amt_preference: amtPreference,
    ltcg_income: ltcgIncome,
    stcg_income: stcgIncome,
    taxes,
    gross_proceeds: grossProceeds,
    exercise_cost: exercisePrice * shares,
    net_proceeds: Math.round(netProceeds * 100) / 100,
    shares_retained: sharesRetained,
    cost_basis: costBasis,
    _verify: `Net ${netProceeds.toLocaleString()} = Spread ${totalSpread.toLocaleString()} - Taxes ${taxes.total_withheld.toLocaleString()}`
  };
}

function calcOptionsWithholding(ordinaryIncome, optionType, elections, client, year) {
  if (optionType === 'iso' || ordinaryIncome <= 0) {
    return { federal: 0, state: 0, ss: 0, medicare: 0, fica_total: 0, total_withheld: 0 };
  }
  
  // Federal supplemental rate
  const fedRate = elections?.federal_rate || 
    (ordinaryIncome > 1000000 ? OPTIONS_RATES.federal_excess : OPTIONS_RATES.federal_supplemental);
  const federal = ordinaryIncome * fedRate;
  
  // State withholding
  const stateRates = { CA: OPTIONS_RATES.state_ca, NY: OPTIONS_RATES.state_ny };
  const stateRate = elections?.state_rate || stateRates[client.state] || 0.05;
  const state = ordinaryIncome * stateRate;
  
  // FICA
  const ssWageBase = OPTIONS_RATES.ss_wage_base_2025;
  const ssWages = Math.min(ordinaryIncome, ssWageBase);
  const ss = ssWages * OPTIONS_RATES.social_security;
  
  // Medicare (with additional tax over threshold)
  const medicareThresh = OPTIONS_RATES.medicare_threshold[client.filing_status] || 200000;
  let medicare = ordinaryIncome * OPTIONS_RATES.medicare;
  if (ordinaryIncome > medicareThresh) {
    medicare += (ordinaryIncome - medicareThresh) * OPTIONS_RATES.medicare_additional;
  }
  
  const ficaTotal = ss + medicare;
  const totalWithheld = federal + state + ficaTotal;
  
  return {
    federal: Math.round(federal * 100) / 100,
    federal_rate: fedRate,
    state: Math.round(state * 100) / 100,
    state_rate: stateRate,
    ss: Math.round(ss * 100) / 100,
    medicare: Math.round(medicare * 100) / 100,
    fica_total: Math.round(ficaTotal * 100) / 100,
    total_withheld: Math.round(totalWithheld * 100) / 100,
    effective_rate: ordinaryIncome > 0 ? totalWithheld / ordinaryIncome : 0
  };
}

// ═══════════════════════════════════════════════════════════════
// CALC_101: FEDERAL ORDINARY TAX
// ═══════════════════════════════════════════════════════════════

function calcFedOrdinary(taxable, year, filing, tcja = 'current') {
  // Input validation
  checkNonNegative(taxable, 'taxable', 'HALT');
  checkRange(year, 'year', 2024, 2060, 'HALT');
  
  const brackets = getTaxTable(year, tcja, filing).ord;
  let tax = 0, prev = 0, marginal = 0;
  const breakdown = [];
  
  for (let i = 0; i < brackets.length; i++) {
    const [thresh, rate] = brackets[i];
    if (i === 0) { prev = 0; marginal = rate; continue; }
    
    if (taxable <= thresh) {
      const inc = taxable - prev;
      tax += inc * marginal;
      if (inc > 0) breakdown.push({ bracket: `${(marginal * 100).toFixed(0)}%`, income: inc, tax: inc * marginal });
      break;
    }
    
    const inc = thresh - prev;
    tax += inc * marginal;
    if (inc > 0) breakdown.push({ bracket: `${(marginal * 100).toFixed(0)}%`, income: inc, tax: inc * marginal });
    prev = thresh;
    marginal = rate;
  }
  
  if (taxable > prev) {
    const inc = taxable - prev;
    tax += inc * marginal;
    breakdown.push({ bracket: `${(marginal * 100).toFixed(0)}%`, income: inc, tax: inc * marginal });
  }
  
  const result = {
    taxable_income: taxable,
    gross_tax: Math.round(tax * 100) / 100,
    effective_rate: safeDivide(tax, taxable, 0),
    marginal_rate: marginal,
    breakdown
  };
  
  // Output validation
  checkTaxResult(result);
  checkSum(breakdown.map(b => b.income), taxable, 'breakdown.income', 1, 'ERROR');
  checkSum(breakdown.map(b => b.tax), tax, 'breakdown.tax', 1, 'ERROR');
  
  return result;
}

// ═══════════════════════════════════════════════════════════════
// CALC_102: PREFERENTIAL TAX (QD + LTCG)
// ═══════════════════════════════════════════════════════════════

function calcFedPreferential(ordTaxable, qd, ltcg, year, filing, tcja = 'current') {
  // Input validation
  checkNonNegative(qd, 'qd', 'HALT');
  checkNonNegative(ltcg, 'ltcg', 'HALT');
  checkNonNegative(ordTaxable, 'ordTaxable', 'WARN');
  
  const brackets = getTaxTable(year, tcja, filing).ltcg;
  const total = qd + ltcg;
  
  const [t0, t15] = [brackets[1][0], brackets[2][0]];
  const space0 = Math.max(0, t0 - ordTaxable);
  const space15 = Math.max(0, t15 - Math.max(ordTaxable, t0));
  
  const at0 = Math.min(total, space0);
  const at15 = Math.min(total - at0, space15);
  const at20 = total - at0 - at15;
  
  const prefTax = at15 * 0.15 + at20 * 0.20;
  
  // NIIT
  const niitThresh = NIIT[filing];
  const totalInc = ordTaxable + total;
  const niitBase = Math.min(total, Math.max(0, totalInc - niitThresh));
  const niit = niitBase * NIIT.rate;
  
  const result = {
    total_preferential: total,
    at_0: at0,
    at_15: at15,
    at_20: at20,
    pref_tax: Math.round(prefTax * 100) / 100,
    niit_base: niitBase,
    niit: Math.round(niit * 100) / 100,
    total: Math.round((prefTax + niit) * 100) / 100,
    effective_rate: safeDivide(prefTax + niit, total, 0)
  };
  
  // Output validation
  checkBracketAllocation(at0, at15, at20, total, 1);
  checkNonNegative(result.pref_tax, 'pref_tax', 'ERROR');
  checkNonNegative(result.niit, 'niit', 'ERROR');
  checkIdentity(at0 * 0 + at15 * 0.15 + at20 * 0.20, prefTax, 'pref_tax formula', 1, 'ERROR');
  
  return result;
}

// ═══════════════════════════════════════════════════════════════
// CALC_104: SALT CAP IMPACT
// ═══════════════════════════════════════════════════════════════

function calcSaltImpact(stateTax, propTax, fedMarginal) {
  const actual = stateTax + propTax;
  const deductible = Math.min(actual, DEDUCTION_LIMITS.salt_cap);
  const lost = actual - deductible;
  return {
    actual,
    deductible,
    lost,
    cost: Math.round(lost * fedMarginal * 100) / 100
  };
}

// ═══════════════════════════════════════════════════════════════
// CALC_105: AMT
// ═══════════════════════════════════════════════════════════════

function calcAMT(regTax, taxable, prefs, year, filing) {
  const p = getAMT(year, filing);
  
  // AMTI = taxable + preferences
  const amti = taxable + (prefs.salt || 0) + (prefs.iso || 0) + (prefs.misc || 0);
  
  // Exemption with phaseout
  let exempt = p.exemption;
  if (amti > p.phaseout_start) {
    exempt = Math.max(0, p.exemption - (amti - p.phaseout_start) * p.phaseout_rate);
  }
  
  // Tentative Minimum Tax
  const amtTaxable = Math.max(0, amti - exempt);
  const tmt = amtTaxable <= p.bracket_28
    ? amtTaxable * 0.26
    : p.bracket_28 * 0.26 + (amtTaxable - p.bracket_28) * 0.28;
  
  const amtLiability = Math.max(0, tmt - regTax);
  
  return {
    amti,
    exemption: exempt,
    amt_taxable: amtTaxable,
    tmt: Math.round(tmt * 100) / 100,
    amt_liability: Math.round(amtLiability * 100) / 100,
    total: Math.round((regTax + amtLiability) * 100) / 100
  };
}

// ═══════════════════════════════════════════════════════════════
// CALC_201: IRMAA
// ═══════════════════════════════════════════════════════════════

function calcIRMAA(magi, year, filing) {
  const tiers = getIRMAA(year, filing);
  
  for (let i = 0; i < tiers.length; i++) {
    if (magi < tiers[i].ceiling) {
      return {
        tier: i,
        part_b: tiers[i].b,
        part_d: tiers[i].d,
        monthly: tiers[i].b + tiers[i].d,
        annual: (tiers[i].b + tiers[i].d) * 12,
        next_threshold: tiers[i].ceiling
      };
    }
  }
  
  const last = tiers[tiers.length - 1];
  return {
    tier: tiers.length - 1,
    part_b: last.b,
    part_d: last.d,
    monthly: last.b + last.d,
    annual: (last.b + last.d) * 12,
    next_threshold: Infinity
  };
}

// ═══════════════════════════════════════════════════════════════
// CALC_202: ACA SUBSIDY
// ═══════════════════════════════════════════════════════════════

function calcACA(magi, ages, year) {
  const fpl100 = 20440 * Math.pow(1.025, year - 2024);
  const fpl400 = fpl100 * 4;
  const pct = magi / fpl100 * 100;
  const cliff = magi > fpl400;
  
  // Benchmark premium estimate by age
  const avgAge = (ages[0] + (ages[1] || ages[0])) / 2;
  const benchmark = avgAge < 40 ? 800 : avgAge < 50 ? 1000 : avgAge < 60 ? 1400 : 1800;
  
  let contribution, subsidy;
  if (cliff) {
    subsidy = 0;
    contribution = benchmark;
  } else {
    // Sliding scale contribution
    const contribPct = Math.min(0.085, 0.02 + (pct - 100) / 300 * 0.065);
    contribution = Math.round(magi * contribPct / 12);
    subsidy = Math.max(0, benchmark - contribution);
  }
  
  return {
    fpl_100: Math.round(fpl100),
    fpl_400: Math.round(fpl400),
    fpl_pct: Math.round(pct),
    cliff,
    benchmark,
    contribution,
    subsidy,
    net: benchmark - subsidy,
    annual_net: (benchmark - subsidy) * 12
  };
}

// ═══════════════════════════════════════════════════════════════
// CALC_107: DEDUCTION SCHEDULE GENERATOR
// ═══════════════════════════════════════════════════════════════
// Generates year-by-year deductions accounting for:
//   - Mortgage amortization (interest decreases over time)
//   - Property tax inflation
//   - SALT cap (may change with TCJA sunset)
//   - Charitable patterns
//   - Medical expense growth with age
//   - Standard deduction inflation + 65+ bonus

function calcDeductionSchedule(params) {
  const {
    start_year, end_year, filing, inflation = 0.025,
    mortgage, property, charitable, medical, state_income_tax,
    tcja_sunset = { model: 'extended' }
  } = params;
  
  const schedule = [];
  const tax_2024 = getTaxTable(2024, 'current', filing);
  const base_sd = tax_2024.sd;
  
  for (let year = start_year; year <= end_year; year++) {
    const years_from_base = year - 2024;
    const inf = Math.pow(1 + inflation, years_from_base);
    const notes = [];
    
    // ─── MORTGAGE INTEREST ───────────────────────────────────────
    let mortgage_interest = 0;
    let mortgage_balance = 0;
    
    if (mortgage && mortgage.original_balance > 0) {
      const loan_age = year - mortgage.origination_year;
      
      if (loan_age >= 0 && loan_age < mortgage.term_years) {
        const r = mortgage.rate / 12;
        const n = mortgage.term_years * 12;
        const payments_made = loan_age * 12;
        
        // Remaining balance
        mortgage_balance = mortgage.original_balance * 
          (Math.pow(1 + r, n) - Math.pow(1 + r, payments_made)) / 
          (Math.pow(1 + r, n) - 1);
        
        // Approximate annual interest
        const balance_end = mortgage.original_balance * 
          (Math.pow(1 + r, n) - Math.pow(1 + r, payments_made + 12)) / 
          (Math.pow(1 + r, n) - 1);
        const avg_balance = (mortgage_balance + Math.max(0, balance_end)) / 2;
        mortgage_interest = avg_balance * mortgage.rate;
        
        // $750K acquisition limit proration
        if (mortgage.original_balance > (mortgage.acquisition_limit || 750000)) {
          mortgage_interest *= (mortgage.acquisition_limit || 750000) / mortgage.original_balance;
        }
      } else if (loan_age >= mortgage.term_years) {
        notes.push('Mortgage paid off');
      }
    }
    
    // ─── PROPERTY TAX ────────────────────────────────────────────
    let property_tax = 0;
    if (property && property.base_year_tax > 0) {
      const prop_growth = Math.pow(1 + (property.growth_rate || inflation), years_from_base);
      property_tax = property.base_year_tax * prop_growth;
    }
    
    // ─── STATE INCOME TAX ────────────────────────────────────────
    let state_tax = 0;
    if (state_income_tax) {
      if (state_income_tax.pattern === 'zero_after' && year >= state_income_tax.zero_after_year) {
        state_tax = 0;
      } else if (state_income_tax.pattern === 'declining') {
        state_tax = state_income_tax.base_amount * Math.pow(0.9, years_from_base);
      } else {
        state_tax = state_income_tax.base_amount;
      }
    }
    
    // ─── SALT ────────────────────────────────────────────────────
    const salt_actual = state_tax + property_tax;
    let salt_cap = 10000;
    
    if (tcja_sunset.model === 'sunset' && year >= (tcja_sunset.sunset_year || 2026)) {
      salt_cap = tcja_sunset.post_sunset_salt_cap || Infinity;
      if (salt_cap === Infinity) notes.push('TCJA sunset: SALT cap removed');
    }
    
    const salt_deductible = Math.min(salt_actual, salt_cap);
    const salt_lost = salt_actual - salt_deductible;
    
    // ─── CHARITABLE ──────────────────────────────────────────────
    let charitable_amount = 0;
    if (charitable && charitable.base_amount > 0) {
      if (charitable.pattern === 'constant') {
        charitable_amount = charitable.base_amount * inf;
      } else if (charitable.pattern === 'declining') {
        charitable_amount = charitable.base_amount * Math.pow(1 - (charitable.decline_rate || 0.05), years_from_base);
      } else if (charitable.pattern === 'frontload' && charitable.daf_years) {
        charitable_amount = years_from_base < charitable.daf_years 
          ? charitable.base_amount * 3 
          : charitable.base_amount * 0.2;
      }
    }
    
    // ─── MEDICAL ─────────────────────────────────────────────────
    let medical_amount = 0;
    if (medical && medical.base_amount > 0) {
      const age = (medical.primary_age || 55) + years_from_base;
      medical_amount = medical.base_amount * inf;
      if (age >= 65) {
        medical_amount *= Math.pow(1 + (medical.age_acceleration || 0.05), age - 65);
      }
    }
    
    // ─── STANDARD DEDUCTION ──────────────────────────────────────
    let standard_deduction = base_sd * inf;
    
    // 65+ additional standard deduction
    // For MFJ, add bonus for EACH spouse 65+
    if (params.ages) {
      const { primary_age, spouse_age } = params.ages;
      const age_p = (primary_age || 55) + years_from_base;
      const age_s = spouse_age ? spouse_age + years_from_base : 0;
      
      let bonus_count = 0;
      if (age_p >= 65) bonus_count++;
      if (filing === 'mfj' && age_s >= 65) bonus_count++;
      
      if (bonus_count > 0) {
        // 2025 IRS figures: $1,600 per person (MFJ), $2,000 (single)
        const per_person = (filing === 'mfj' ? 1600 : 2000) * inf;
        standard_deduction += per_person * bonus_count;
        if (bonus_count === 2) notes.push('Both spouses 65+: double standard deduction bonus');
        else notes.push('65+ standard deduction bonus applied');
      }
    } else if (medical && medical.primary_age) {
      // Backward compat: use medical.primary_age if ages not provided
      // Note: This only applies one person's bonus; use ages param for both
      const age = medical.primary_age + years_from_base;
      if (age >= 65) {
        // 2025 IRS figures: $1,600 per person (MFJ), $2,000 (single)
        const extra = (filing === 'mfj' ? 1600 : 2000) * inf;
        standard_deduction += extra;
      }
    }
    
    // ─── TOTALS ──────────────────────────────────────────────────
    const itemized_before_medical = salt_deductible + mortgage_interest + charitable_amount;
    const itemized_total = itemized_before_medical + medical_amount;
    const recommended = itemized_before_medical > standard_deduction ? 'itemized' : 
                        itemized_total > standard_deduction * 1.1 ? 'itemized' : 'standard';
    const deduction_used = recommended === 'itemized' ? itemized_total : standard_deduction;
    
    schedule.push({
      year,
      mortgage_interest: Math.round(mortgage_interest),
      mortgage_balance: Math.round(mortgage_balance),
      property_tax: Math.round(property_tax),
      state_income_tax: Math.round(state_tax),
      salt_actual: Math.round(salt_actual),
      salt_cap,
      salt_deductible: Math.round(salt_deductible),
      salt_lost: Math.round(salt_lost),
      charitable: Math.round(charitable_amount),
      medical_gross: Math.round(medical_amount),
      itemized_before_medical: Math.round(itemized_before_medical),
      itemized_total: Math.round(itemized_total),
      standard_deduction: Math.round(standard_deduction),
      recommended,
      deduction_used: Math.round(deduction_used),
      notes
    });
  }
  
  return { schedule };
}

// Helper: Get deduction for specific year with AGI-adjusted medical floor
function getDeductionForYear(schedule, year, agi = null) {
  const entry = schedule.find(s => s.year === year);
  if (!entry) throw new Error(`No deduction data for year ${year}`);
  
  // Apply medical 7.5% AGI floor if AGI provided
  let medical_deductible = entry.medical_gross;
  if (agi !== null && agi > 0) {
    medical_deductible = Math.max(0, entry.medical_gross - agi * 0.075);
  }
  
  const itemized_actual = entry.itemized_before_medical + medical_deductible;
  const use_itemized = itemized_actual > entry.standard_deduction;
  
  return {
    year,
    salt_deductible: entry.salt_deductible,
    mortgage_interest: entry.mortgage_interest,
    charitable: entry.charitable,
    medical_deductible,
    itemized_total: itemized_actual,
    standard_deduction: entry.standard_deduction,
    recommended: use_itemized ? 'itemized' : 'standard',
    deduction_used: Math.max(itemized_actual, entry.standard_deduction),
    raw_entry: entry
  };
}

// ═══════════════════════════════════════════════════════════════
// CALC_301: BUCKET FILL WITHDRAWAL OPTIMIZER
// ═══════════════════════════════════════════════════════════════
// 
// Strategy: Build "buckets" of withdrawal opportunities at different
// effective tax rates, sort by rate (cheapest first), fill until
// need is met. Roth is always last despite 0% rate (preserve growth).
//
// Bucket effective rates:
//   Taxable: gain_ratio × (fed_ltcg_rate + state_rate + niit_rate)
//   Traditional: fed_ord_rate + state_rate
//   Roth: 0% (but priority = LAST)

function calculateBaseState(income, deduction_info, year, filing) {
  const tax = getTaxTable(year, 'current', filing);
  
  // Ordinary income components
  const ord_gross = (income.earned || 0) + 
                    (income.ss_taxable || 0) + 
                    (income.pension || 0) + 
                    (income.interest || 0);
  
  // Preferential income already received (QD from portfolio)
  const pref_existing = income.qd || 0;
  
  // ─────────────────────────────────────────────────────────────
  // DEDUCTION: From schedule lookup OR calculate on-the-fly
  // ─────────────────────────────────────────────────────────────
  // deduction_info can be:
  //   1. A schedule entry from calcDeductionSchedule (has 'deduction_used')
  //   2. A raw deductions object (backward compat)
  //   3. null (use standard deduction)
  
  const standard = tax.sd;
  let deduction = standard;
  let deduction_method = 'standard';
  let itemized = 0;
  let deduction_detail = null;
  
  if (deduction_info) {
    // Check if this is a schedule entry (has deduction_used or recommended)
    if (deduction_info.deduction_used !== undefined || deduction_info.recommended !== undefined) {
      // Pre-calculated schedule entry - use directly
      deduction = deduction_info.deduction_used;
      deduction_method = deduction_info.recommended;
      itemized = deduction_info.itemized_total || 0;
      deduction_detail = deduction_info;
    } else {
      // Raw deductions object - calculate itemized total
      
      // SALT: capped at $10K
      const salt_actual = (deduction_info.state_tax || 0) + (deduction_info.property_tax || 0);
      const salt_deductible = Math.min(salt_actual, 10000);
      
      // Mortgage interest: prorate for $750K limit
      let mortgage_deductible = 0;
      if (deduction_info.mortgage_interest > 0) {
        const balance = deduction_info.mortgage_balance || 750000;
        const proration = Math.min(1, 750000 / balance);
        mortgage_deductible = deduction_info.mortgage_interest * proration;
      }
      
      // Charitable: up to 60% AGI
      const charitable = deduction_info.charitable || 0;
      const charitable_limit = ord_gross > 0 ? ord_gross * 0.60 : Infinity;
      const charitable_deductible = Math.min(charitable, charitable_limit);
      
      // Medical: above 7.5% AGI floor
      const medical = deduction_info.medical || 0;
      const medical_floor = ord_gross * 0.075;
      const medical_deductible = Math.max(0, medical - medical_floor);
      
      itemized = salt_deductible + mortgage_deductible + charitable_deductible + medical_deductible;
      deduction_method = itemized > standard ? 'itemized' : 'standard';
      deduction = Math.max(itemized, standard);
      
      deduction_detail = {
        salt_deductible,
        mortgage_deductible,
        charitable_deductible,
        medical_deductible,
        itemized_total: itemized,
        standard_deduction: standard
      };
    }
  }
  
  const ord_taxable = Math.max(0, ord_gross - deduction);
  
  // MAGI for NIIT threshold
  const magi = ord_gross + pref_existing;
  
  return {
    ord_gross,
    ord_taxable,
    pref_existing,
    magi,
    deduction,
    deduction_method,
    standard_deduction: standard,
    itemized_deduction: itemized,
    deduction_detail,
    ltcg_brackets: tax.ltcg,
    ord_brackets: tax.ord
  };
}

function buildBuckets(base, accts, year, filing, state_rate) {
  // NOTE: state_rate should be client's MARGINAL state rate, not average.
  // For CA FAT FIRE ($450K+ spending), marginal rate is typically 10.3-12.3%
  // CA brackets: 9.3% up to $338K, 10.3% to $406K, 11.3% to $677K, 12.3% above
  
  const buckets = [];
  const { ord_taxable, pref_existing, magi, ltcg_brackets, ord_brackets } = base;
  
  // NIIT threshold - $250K MFJ, $200K Single
  // CRITICAL: NIIT kicks in when MAGI exceeds threshold, not all-or-nothing
  const niit_threshold = filing === 'mfj' ? 250000 : 200000;
  
  // Track running MAGI as we build taxable buckets
  // MAGI increases as gains are realized
  let running_magi = magi;
  
  // Helper to split a bucket at NIIT threshold
  function splitAtNIIT(bucket_base, max_gross, gr, fed_rate, id_prefix, priority_base) {
    const result = [];
    
    // Space before NIIT threshold (in gross terms)
    // Gains add to MAGI: gain = gross × gr
    // MAGI after full bucket = running_magi + max_gross × gr
    
    if (running_magi >= niit_threshold) {
      // Already above threshold - all gains get NIIT
      result.push({
        ...bucket_base,
        id: `${id_prefix}_NIIT`,
        label: `${bucket_base.label} +NIIT`,
        gross_capacity: max_gross,
        niit_rate: 0.038,
        effective_rate: gr * (fed_rate + state_rate + 0.038),
        priority: priority_base + 1
      });
      running_magi += max_gross * gr;
    } else {
      // Below threshold - may need to split
      const magi_room = niit_threshold - running_magi;
      const gross_before_niit = gr > 0 ? magi_room / gr : max_gross;
      
      if (gross_before_niit >= max_gross) {
        // Entire bucket fits before NIIT threshold
        result.push({
          ...bucket_base,
          id: id_prefix,
          gross_capacity: max_gross,
          niit_rate: 0,
          effective_rate: gr * (fed_rate + state_rate),
          priority: priority_base
        });
        running_magi += max_gross * gr;
      } else {
        // Split: part before NIIT, part after
        const gross_pre = gross_before_niit;
        const gross_post = max_gross - gross_before_niit;
        
        if (gross_pre > 0) {
          result.push({
            ...bucket_base,
            id: id_prefix,
            label: bucket_base.label,
            gross_capacity: gross_pre,
            niit_rate: 0,
            effective_rate: gr * (fed_rate + state_rate),
            priority: priority_base
          });
          running_magi += gross_pre * gr;
        }
        
        if (gross_post > 0) {
          result.push({
            ...bucket_base,
            id: `${id_prefix}_NIIT`,
            label: `${bucket_base.label} +NIIT`,
            gross_capacity: gross_post,
            niit_rate: 0.038,
            effective_rate: gr * (fed_rate + state_rate + 0.038),
            priority: priority_base + 1
          });
          running_magi += gross_post * gr;
        }
      }
    }
    
    return result;
  }
  
  // ─────────────────────────────────────────────────────────────
  // TAXABLE BUCKETS (with NIIT threshold splitting)
  // ─────────────────────────────────────────────────────────────
  
  if (accts.taxable?.value > 0) {
    const gr = accts.taxable.gain_ratio;
    checkGainRatio(gr, accts.taxable.value, accts.taxable.basis, 'gain_ratio');
    
    let taxable_remaining = accts.taxable.value;
    let cumulative_gains = pref_existing;
    
    // LTCG 0% bucket
    const ltcg_0_ceiling = ltcg_brackets[1][0];
    const space_at_0 = Math.max(0, ltcg_0_ceiling - ord_taxable - cumulative_gains);
    
    if (space_at_0 > 0 && taxable_remaining > 0) {
      const max_gross = gr > 0 ? Math.min(space_at_0 / gr, taxable_remaining) : taxable_remaining;
      
      const bucket_base = {
        source: 'taxable',
        label: 'Taxable @ 0% LTCG',
        gain_ratio: gr,
        fed_rate: 0,
        state_rate: state_rate
      };
      
      // 0% LTCG: Split at NIIT if needed
      // Note: Even at 0% fed LTCG, NIIT still applies to gains above threshold!
      const split = splitAtNIIT(bucket_base, max_gross, gr, 0, 'TAXABLE_0PCT', 10);
      buckets.push(...split);
      
      taxable_remaining -= max_gross;
      cumulative_gains += max_gross * gr;
    }
    
    // LTCG 15% bucket
    const ltcg_15_ceiling = ltcg_brackets[2][0];
    const current_position = ord_taxable + cumulative_gains;
    const bracket_15_start = Math.max(current_position, ltcg_0_ceiling);
    const space_at_15 = Math.max(0, ltcg_15_ceiling - bracket_15_start);
    
    if (space_at_15 > 0 && taxable_remaining > 0) {
      const max_gross = gr > 0 ? Math.min(space_at_15 / gr, taxable_remaining) : taxable_remaining;
      
      const bucket_base = {
        source: 'taxable',
        label: 'Taxable @ 15% LTCG',
        gain_ratio: gr,
        fed_rate: 0.15,
        state_rate: state_rate
      };
      
      const split = splitAtNIIT(bucket_base, max_gross, gr, 0.15, 'TAXABLE_15PCT', 20);
      buckets.push(...split);
      
      taxable_remaining -= max_gross;
      cumulative_gains += max_gross * gr;
    }
    
    // LTCG 20% bucket (remainder)
    if (taxable_remaining > 0) {
      const bucket_base = {
        source: 'taxable',
        label: 'Taxable @ 20% LTCG',
        gain_ratio: gr,
        fed_rate: 0.20,
        state_rate: state_rate
      };
      
      const split = splitAtNIIT(bucket_base, taxable_remaining, gr, 0.20, 'TAXABLE_20PCT', 30);
      buckets.push(...split);
    }
  }
  
  // ─────────────────────────────────────────────────────────────
  // TRADITIONAL BUCKETS (one per bracket)
  // ─────────────────────────────────────────────────────────────
  // CRITICAL: Must account for unused deduction space first!
  // Traditional withdrawals fill unused deduction at 0% federal
  // before hitting tax brackets.
  
  if (accts.traditional > 0) {
    let trad_remaining = accts.traditional;
    
    // Calculate unused deduction space
    // This is the amount of Traditional that can be withdrawn at 0% federal
    const unused_deduction = Math.max(0, base.deduction - base.ord_gross);
    
    // Bucket 0: Unused deduction space (0% federal, but state still applies)
    if (unused_deduction > 0 && trad_remaining > 0) {
      const capacity = Math.min(unused_deduction, trad_remaining);
      
      buckets.push({
        id: 'TRADITIONAL_0PCT',
        source: 'traditional',
        label: 'Traditional @ 0% (Deduction Space)',
        gross_capacity: capacity,
        gain_ratio: 1.0,
        fed_rate: 0,
        state_rate: state_rate,  // State deduction typically smaller/exhausted
        niit_rate: 0,
        effective_rate: state_rate,  // Just state tax
        priority: 50,  // After 0% LTCG, before 10% Traditional
        note: `Fills ${unused_deduction.toLocaleString()} unused deduction`
      });
      
      trad_remaining -= capacity;
    }
    
    // Now build bracket-based buckets
    // IMPORTANT: Start from ord_taxable, not 0!
    // Existing ordinary income already fills lower brackets
    let running_ord = ord_taxable;
    
    for (let i = 1; i < ord_brackets.length && trad_remaining > 0; i++) {
      const [ceiling, _] = ord_brackets[i];
      const prev_ceiling = ord_brackets[i-1][0];
      const bracket_rate = ord_brackets[i-1][1];
      
      const bracket_floor = Math.max(running_ord, prev_ceiling);
      const space = Math.max(0, ceiling - bracket_floor);
      
      if (space > 0) {
        const capacity = Math.min(space, trad_remaining);
        
        buckets.push({
          id: `TRADITIONAL_${(bracket_rate * 100).toFixed(0)}PCT`,
          source: 'traditional',
          label: `Traditional @ ${(bracket_rate * 100).toFixed(0)}%`,
          gross_capacity: capacity,
          gain_ratio: 1.0,
          fed_rate: bracket_rate,
          state_rate: state_rate,
          niit_rate: 0,
          effective_rate: bracket_rate + state_rate,
          priority: 100 + i
        });
        
        trad_remaining -= capacity;
        running_ord += capacity;
      }
    }
    
    // Top bracket remainder
    if (trad_remaining > 0) {
      const top_rate = ord_brackets[ord_brackets.length - 1][1];
      buckets.push({
        id: 'TRADITIONAL_TOP',
        source: 'traditional',
        label: `Traditional @ ${(top_rate * 100).toFixed(0)}%`,
        gross_capacity: trad_remaining,
        gain_ratio: 1.0,
        fed_rate: top_rate,
        state_rate: state_rate,
        niit_rate: 0,
        effective_rate: top_rate + state_rate,
        priority: 200
      });
    }
  }
  
  // ─────────────────────────────────────────────────────────────
  // ROTH BUCKET (always last despite 0% rate)
  // ─────────────────────────────────────────────────────────────
  
  if (accts.roth > 0) {
    buckets.push({
      id: 'ROTH',
      source: 'roth',
      label: 'Roth (Tax-Free)',
      gross_capacity: accts.roth,
      gain_ratio: 0,
      fed_rate: 0,
      state_rate: 0,
      niit_rate: 0,
      effective_rate: 0,
      priority: 9999
    });
  }
  
  return buckets;
}

function sortBuckets(buckets) {
  return [...buckets].sort((a, b) => {
    // Roth always last
    if (a.source === 'roth') return 1;
    if (b.source === 'roth') return -1;
    // Then by effective rate ascending
    const diff = a.effective_rate - b.effective_rate;
    if (Math.abs(diff) > 0.0001) return diff;
    // Tie-breaker: priority
    return a.priority - b.priority;
  });
}

function fillBuckets(buckets, need) {
  let remaining = need;
  const plan = [];
  
  for (const bucket of buckets) {
    if (remaining <= 1) break;
    if (bucket.gross_capacity <= 0) continue;
    
    // Max net from this bucket
    const max_net = bucket.gross_capacity * (1 - bucket.effective_rate);
    
    // How much we need from this bucket
    const use_net = Math.min(remaining, max_net);
    
    // Gross-up to get that net
    const use_gross = bucket.effective_rate < 1
      ? use_net / (1 - bucket.effective_rate)
      : use_net;
    
    const use_tax = use_gross * bucket.effective_rate;
    
    // For taxable, track gain/basis
    const use_gain = bucket.source === 'taxable' ? use_gross * bucket.gain_ratio : 
                     bucket.source === 'traditional' ? use_gross : 0;
    const use_basis = bucket.source === 'taxable' ? use_gross * (1 - bucket.gain_ratio) : 0;
    
    plan.push({
      bucket_id: bucket.id,
      source: bucket.source,
      label: bucket.label,
      gross: Math.round(use_gross * 100) / 100,
      gain: Math.round(use_gain * 100) / 100,
      basis: Math.round(use_basis * 100) / 100,
      tax: Math.round(use_tax * 100) / 100,
      net: Math.round(use_net * 100) / 100,
      effective_rate: bucket.effective_rate
    });
    
    remaining -= use_net;
  }
  
  return { plan, remaining };
}

function calcWithdrawal(need, accts, income, year, filing, state_rate = 0.05, deductions = null) {
  // Handle edge case: no need
  if (need <= 0) {
    return {
      plan: [],
      total_gross: 0,
      total_tax: 0,
      total_net: 0,
      shortfall: 0,
      effective_rate: 0,
      buckets_used: 0,
      validation: { valid: true, errors: [], warnings: [] }
    };
  }
  
  // Input validation
  checkPositive(need, 'need', 'WARN');
  checkRange(state_rate, 'state_rate', 0, 0.15, 'WARN');
  
  // Step 1: Calculate base state (where we are before withdrawal)
  // Pass deductions for itemized calculation
  const base = calculateBaseState(income, deductions, year, filing);
  
  // Step 2: Build all available buckets
  const buckets = buildBuckets(base, accts, year, filing, state_rate);
  
  // Step 3: Sort by effective rate (cheapest first, Roth last)
  const sorted = sortBuckets(buckets);
  
  // Step 4: Fill buckets to meet need
  const { plan, remaining } = fillBuckets(sorted, need);
  
  // Step 5: Calculate totals
  const total_gross = plan.reduce((s, p) => s + p.gross, 0);
  const total_tax = plan.reduce((s, p) => s + p.tax, 0);
  const total_net = plan.reduce((s, p) => s + p.net, 0);
  const shortfall = Math.max(0, remaining);
  
  // Step 6: Validate
  checkIdentity(total_gross - total_tax, total_net, 'gross - tax = net', 10, 'ERROR');
  if (shortfall > 1) {
    VALIDATION.warn(`Withdrawal shortfall: ${shortfall.toFixed(0)}`, { need, total_net });
  }
  
  // Check Roth not used unless necessary
  const roth_used = plan.find(p => p.source === 'roth');
  if (roth_used) {
    const non_roth_net = buckets
      .filter(b => b.source !== 'roth')
      .reduce((s, b) => s + b.gross_capacity * (1 - b.effective_rate), 0);
    if (non_roth_net >= need) {
      VALIDATION.warn('Roth used despite sufficient non-Roth', { roth: roth_used.gross, non_roth_net });
    }
  }
  
  return {
    plan,
    total_gross: Math.round(total_gross * 100) / 100,
    total_tax: Math.round(total_tax * 100) / 100,
    total_net: Math.round(total_net * 100) / 100,
    shortfall: Math.round(shortfall * 100) / 100,
    effective_rate: total_gross > 0 ? total_tax / total_gross : 0,
    blended_rate: need > 0 ? total_tax / need : 0,
    buckets_available: buckets.length,
    buckets_used: plan.length,
    base_state: base,
    validation: VALIDATION.getReport()
  };
}

// ═══════════════════════════════════════════════════════════════
// CALC_301_REFINED: Two-Pass Withdrawal Optimizer
// ═══════════════════════════════════════════════════════════════
// For edge cases where Traditional and Taxable rates are close,
// a second pass can verify optimal ordering.
//
// Usually unnecessary because:
// 1. LTCG rates < Traditional rates at same bracket
// 2. We fill LTCG first, so no cross-effect
// 3. TRADITIONAL_0PCT fills unused deduction (doesn't affect LTCG base)
//
// Use when gain_ratio > 80% and Traditional rates are close to Taxable.

function calcWithdrawalRefined(need, accts, income, year, filing, state_rate, deductions) {
  // Pass 1: Standard bucket fill
  const pass1 = calcWithdrawal(need, accts, income, year, filing, state_rate, deductions);
  
  // Check if any Traditional was used
  const tradUsed = pass1.plan
    .filter(p => p.source === 'traditional')
    .reduce((s, p) => s + p.gross, 0);
  
  if (tradUsed === 0) return pass1;  // No Traditional = no cross-effect possible
  
  // Check if Taxable@15%+ was also used (potential cross-effect)
  const taxable15Used = pass1.plan
    .filter(p => p.source === 'taxable' && p.fed_rate >= 0.15)
    .reduce((s, p) => s + p.gross, 0);
  
  if (taxable15Used === 0) return pass1;  // No LTCG@15%+ = no cross-effect
  
  // Pass 2: Rebuild buckets with Traditional as if it were income
  // This simulates the post-withdrawal state
  const adjustedIncome = { ...income };
  adjustedIncome.pension = (income.pension || 0) + tradUsed;
  
  // Reduce Traditional available by what we "used" as income
  const adjustedAccts = { ...accts };
  adjustedAccts.traditional = Math.max(0, (accts.traditional || 0) - tradUsed);
  
  const pass2 = calcWithdrawal(need, adjustedAccts, adjustedIncome, year, filing, state_rate, deductions);
  
  // Compare and return better result
  if (pass2.total_tax < pass1.total_tax) {
    pass2.refinement = {
      applied: true,
      pass1_tax: pass1.total_tax,
      pass2_tax: pass2.total_tax,
      savings: pass1.total_tax - pass2.total_tax
    };
    return pass2;
  }
  
  pass1.refinement = { applied: false, reason: 'Pass 1 was optimal' };
  return pass1;
}

// ═══════════════════════════════════════════════════════════════
// CALC_302: ROTH CONVERSION OPTIMIZER
// ═══════════════════════════════════════════════════════════════

function calcRothConversion(income, accts, age, year, filing, prefs = {}) {
  const tax = getTaxTable(year, 'current', filing);
  const constraints = [];
  
  // Bracket ceiling
  const targetRate = prefs.target_bracket || 0.24;
  const ceiling = findBracketCeiling(targetRate, tax.ord);
  constraints.push({ name: 'bracket', limit: Math.max(0, ceiling - income - tax.sd), binding: false });
  
  // IRMAA (if age >= 63, lookback is 2 years)
  if (age >= 63) {
    const irmaa = getIRMAA(year + 2, filing);  // 2-year lookback
    const targetTier = prefs.target_irmaa || 0;
    const tierCeiling = irmaa[targetTier]?.ceiling || irmaa[0].ceiling;
    constraints.push({ name: 'irmaa', limit: Math.max(0, tierCeiling - income), binding: false });
  }
  
  // ACA cliff (if age < 65)
  if (age < 65) {
    const fpl400 = 20440 * 4 * Math.pow(1.025, year - 2024);
    constraints.push({ name: 'aca', limit: Math.max(0, fpl400 - income), binding: false });
  }
  
  // Traditional balance
  constraints.push({ name: 'balance', limit: accts.traditional || 0, binding: false });
  
  // Cash to pay taxes
  if (accts.cash > 0) {
    const marginal = calcFedOrdinary(income + 1, year, filing).marginal_rate;
    constraints.push({ name: 'cash', limit: marginal > 0 ? accts.cash / marginal : Infinity, binding: false });
  }
  
  // Find binding constraint
  const optimal = Math.min(...constraints.map(c => c.limit));
  const bindingName = constraints.find(c => c.limit === optimal)?.name || 'none';
  constraints.forEach(c => c.binding = c.limit === optimal);
  
  // Calculate tax cost
  const taxBefore = calcFedOrdinary(Math.max(0, income - tax.sd), year, filing).gross_tax;
  const taxAfter = calcFedOrdinary(Math.max(0, income + optimal - tax.sd), year, filing).gross_tax;
  
  return {
    optimal: Math.round(optimal),
    binding: bindingName,
    tax_cost: Math.round((taxAfter - taxBefore) * 100) / 100,
    effective_rate: optimal > 0 ? (taxAfter - taxBefore) / optimal : 0,
    constraints
  };
}

function findBracketCeiling(rate, brackets) {
  for (let i = 0; i < brackets.length - 1; i++) {
    if (brackets[i][1] === rate) return brackets[i + 1][0];
  }
  return brackets[brackets.length - 1][0];
}

// ═══════════════════════════════════════════════════════════════
// CALC_303: LOT SELECTION
// ═══════════════════════════════════════════════════════════════

function selectLots(lots, amount, strategy = 'highest_basis') {
  require(lots.length > 0, 'No lots provided');
  require(amount > 0, `Non-positive amount: ${amount}`);
  
  let sorted;
  switch (strategy) {
    case 'highest_basis':
      // Sell highest basis first (minimizes gains)
      sorted = [...lots].sort((a, b) => 
        (a.current_value - a.basis) / a.current_value - (b.current_value - b.basis) / b.current_value
      );
      break;
    case 'lowest_basis':
      // Sell lowest basis first (maximizes gains - for loss harvesting)
      sorted = [...lots].sort((a, b) => 
        (b.current_value - b.basis) / b.current_value - (a.current_value - a.basis) / a.current_value
      );
      break;
    case 'tax_loss':
      // Sell losses first
      sorted = [...lots].filter(l => l.current_value < l.basis)
        .sort((a, b) => (a.current_value - a.basis) - (b.current_value - b.basis));
      break;
    case 'fifo':
      sorted = [...lots].sort((a, b) => new Date(a.purchase_date) - new Date(b.purchase_date));
      break;
    default:
      sorted = lots;
  }
  
  const selected = [];
  let remaining = amount;
  
  for (const lot of sorted) {
    if (remaining <= 0) break;
    
    const sellValue = Math.min(lot.current_value, remaining);
    const sellRatio = sellValue / lot.current_value;
    const sellBasis = lot.basis * sellRatio;
    
    selected.push({
      lot_id: lot.lot_id,
      shares: (lot.shares || 0) * sellRatio,
      proceeds: sellValue,
      basis: sellBasis,
      gain: sellValue - sellBasis,
      holding_period: lot.holding_period || 'long'
    });
    remaining -= sellValue;
  }
  
  const totalProceeds = selected.reduce((s, l) => s + l.proceeds, 0);
  const totalBasis = selected.reduce((s, l) => s + l.basis, 0);
  
  return {
    selected,
    proceeds: Math.round(totalProceeds * 100) / 100,
    basis: Math.round(totalBasis * 100) / 100,
    gain: Math.round((totalProceeds - totalBasis) * 100) / 100,
    gain_ratio: totalProceeds > 0 ? (totalProceeds - totalBasis) / totalProceeds : 0,
    unfilled: Math.max(0, remaining)
  };
}

// ═══════════════════════════════════════════════════════════════
// CALC_401: SOCIAL SECURITY BENEFIT
// ═══════════════════════════════════════════════════════════════

function calcSSBenefit(aime, birthYear, claimAge) {
  // PIA calculation
  const bp = SS.bend_points_2024;
  const mult = Math.pow(1.025, 2025 - 2024);  // Inflate bend points
  const bp1 = bp.first * mult;
  const bp2 = bp.second * mult;
  
  let pia = 0;
  if (aime <= bp1) {
    pia = aime * 0.90;
  } else if (aime <= bp2) {
    pia = bp1 * 0.90 + (aime - bp1) * 0.32;
  } else {
    pia = bp1 * 0.90 + (bp2 - bp1) * 0.32 + (aime - bp2) * 0.15;
  }
  
  // FRA determination
  const fra = SS.fra_by_birth_year[birthYear] || 67;
  
  // Adjustment for claiming age
  let benefit;
  if (claimAge < fra) {
    const monthsEarly = (fra - claimAge) * 12;
    const reduction = Math.min(36, monthsEarly) * (5/900) + Math.max(0, monthsEarly - 36) * (5/1200);
    benefit = pia * (1 - reduction);
  } else if (claimAge > fra) {
    const monthsLate = Math.min((claimAge - fra) * 12, 48);  // Max 70
    const increase = monthsLate * (SS.delayed_credit / 12);
    benefit = pia * (1 + increase);
  } else {
    benefit = pia;
  }
  
  // Calculate benefits at key ages
  const benefit62 = pia * (1 - (fra - 62) * SS.early_reduction);
  const benefit70 = pia * (1 + (70 - fra) * SS.delayed_credit);
  
  // Breakeven calculations
  const breakeven62vsFRA = Math.round(fra + (pia - benefit62) * (fra - 62) * 12 / (pia - benefit62) / 12);
  const breakevenFRAv70 = Math.round(70 + (benefit70 - pia) * (70 - fra) * 12 / (benefit70 - pia) / 12);
  
  return {
    aime,
    pia: Math.round(pia),
    fra,
    claim_age: claimAge,
    monthly_benefit: Math.round(benefit),
    annual_benefit: Math.round(benefit * 12),
    age_62_benefit: Math.round(benefit62),
    fra_benefit: Math.round(pia),
    age_70_benefit: Math.round(benefit70),
    breakeven_62_vs_fra: breakeven62vsFRA,
    breakeven_fra_vs_70: breakevenFRAv70
  };
}

// ═══════════════════════════════════════════════════════════════
// CALC_402: EARNINGS TEST
// ═══════════════════════════════════════════════════════════════

function calcSSEarningsTest(earned, ssBenefit, age, fra) {
  if (age >= fra) {
    return { threshold: Infinity, excess: 0, reduction: 0, net: ssBenefit, restored_at_fra: 0 };
  }
  
  const mult = Math.pow(1.025, 2025 - 2024);
  const isFRAYear = age === Math.floor(fra) && age < fra;
  const thresh = Math.round((isFRAYear ? SS.earnings_test_2024.fra_year : SS.earnings_test_2024.pre_fra) * mult);
  const rate = isFRAYear ? SS.reduction.fra_year : SS.reduction.pre_fra;
  
  const excess = Math.max(0, earned - thresh);
  const reduction = Math.round(excess * rate);
  const net = Math.max(0, ssBenefit - reduction);
  
  return {
    threshold: thresh,
    excess,
    reduction,
    net,
    months_withheld: Math.ceil(reduction / (ssBenefit / 12)),
    restored_at_fra: reduction  // Benefits restored via higher PIA at FRA
  };
}

// ═══════════════════════════════════════════════════════════════
// CALC_501: ESTATE TAX
// ═══════════════════════════════════════════════════════════════

function calcEstateTax(value, year, tcja, priorGifts = 0, filing = 'mfj') {
  const e = year >= 2026 
    ? ESTATE[2026][tcja]
    : ESTATE[2024].current;
  
  // Portability for MFJ
  const exemptionMultiplier = filing === 'mfj' ? 2 : 1;
  const exemption = e.exemption * exemptionMultiplier - priorGifts;
  
  const taxable = Math.max(0, value - exemption);
  const tax = taxable * e.rate;
  
  return {
    gross_estate: value,
    exemption,
    prior_gifts: priorGifts,
    taxable,
    tax: Math.round(tax),
    effective_rate: value > 0 ? tax / value : 0,
    mitigation_flag: taxable > 0
  };
}

// ═══════════════════════════════════════════════════════════════
// CALC_502: STEP-UP BASIS VALUE
// ═══════════════════════════════════════════════════════════════

function calcStepUp(value, basis, ltcgRate = 0.238) {
  const gain = value - basis;
  const savings = gain * ltcgRate;
  
  return {
    current_value: value,
    current_basis: basis,
    unrealized_gain: gain,
    tax_savings: Math.round(savings),
    effective_inheritance: value,  // Full value passes tax-free
    preserve_for_step_up: gain / value > 0.5  // Flag if significant gains
  };
}

// ═══════════════════════════════════════════════════════════════
// CALC_601: LONG-TERM CARE
// ═══════════════════════════════════════════════════════════════

function calcLTC(portfolio, strategy, yearsToNeed, facilityType = 'memory_care') {
  const baseCost = LTC.costs_2024[facilityType] || LTC.costs_2024.memory_care;
  const inflatedCost = baseCost * Math.pow(LTC.inflation, yearsToNeed);
  const duration = LTC.avg_duration;
  const totalNeed = inflatedCost * duration;
  
  let result;
  switch (strategy) {
    case 'self_insure':
      result = {
        strategy: 'Self-Insure',
        reserve_needed: Math.round(totalNeed),
        annual_cost: 0,
        integration: 'Add reserve to FIRE assets requirement'
      };
      break;
    case 'traditional':
      const annualPremium = Math.round(totalNeed * 0.02);  // ~2% of benefit
      result = {
        strategy: 'Traditional LTC Insurance',
        reserve_needed: 0,
        annual_cost: annualPremium,
        integration: 'Add premium to annual expenses'
      };
      break;
    case 'hybrid':
      const singlePremium = 150000;
      result = {
        strategy: 'Hybrid Life/LTC',
        single_premium: singlePremium,
        benefit_pool: Math.round(singlePremium * 2.5),
        death_benefit: singlePremium,
        integration: 'One-time premium, reduces portfolio'
      };
      break;
    default:
      result = { strategy: 'Unspecified', reserve_needed: Math.round(totalNeed) };
  }
  
  return {
    ...result,
    facility_type: facilityType,
    current_annual_cost: baseCost,
    inflated_annual_cost: Math.round(inflatedCost),
    years_to_need: yearsToNeed,
    avg_duration: duration,
    total_exposure: Math.round(totalNeed),
    probability: LTC.probability_at_65
  };
}

// ═══════════════════════════════════════════════════════════════
// CALC_701: MONTE CARLO SIMULATION
// ═══════════════════════════════════════════════════════════════

function runMonteCarlo(portfolio, annualSpend, horizon, params = {}) {
  const n = params.n || 10000;
  const returnMean = params.return_mean || 0.07;
  const returnStd = params.return_std || 0.15;
  const inflation = params.inflation || 0.025;
  
  const terminals = [];
  let failures = 0;
  let worstYear = 0, worstValue = Infinity;
  
  for (let sim = 0; sim < n; sim++) {
    let balance = portfolio;
    let spend = annualSpend;
    let failed = false;
    
    for (let year = 1; year <= horizon; year++) {
      // Random return (simplified normal approximation)
      const u1 = Math.random(), u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const annualReturn = returnMean + returnStd * z;
      
      // Withdraw at start of year
      balance -= spend;
      if (balance < 0) {
        failed = true;
        if (year < worstYear || worstYear === 0) {
          worstYear = year;
          worstValue = balance + spend;
        }
        break;
      }
      
      // Apply return
      balance *= (1 + annualReturn);
      
      // Inflate spending
      spend *= (1 + inflation);
    }
    
    if (failed) {
      failures++;
      terminals.push(0);
    } else {
      terminals.push(balance);
    }
  }
  
  terminals.sort((a, b) => a - b);
  const successRate = (n - failures) / n;
  
  return {
    params: { n, return_mean: returnMean, return_std: returnStd, inflation, horizon },
    results: {
      success_rate: Math.round(successRate * 1000) / 1000,
      median_terminal: Math.round(terminals[Math.floor(n * 0.5)]),
      p5: Math.round(terminals[Math.floor(n * 0.05)]),
      p25: Math.round(terminals[Math.floor(n * 0.25)]),
      p75: Math.round(terminals[Math.floor(n * 0.75)]),
      p95: Math.round(terminals[Math.floor(n * 0.95)]),
      worst_year: worstYear,
      worst_value: Math.round(worstValue)
    }
  };
}

---

---

## §5 SCHEDULE GENERATOR

```javascript
// ═══════════════════════════════════════════════════════════════
// COMPLETE SCHEDULE GENERATION
// ═══════════════════════════════════════════════════════════════

function generateSchedule(client, params = {}) {
  const schedule = [];
  const horizon = params.horizon || 40;
  const startYear = params.start_year || new Date().getFullYear();
  
  // Initialize portfolio state
  let portfolio = {
    taxable: { 
      value: client.accounts.taxable.value, 
      basis: client.accounts.taxable.basis,
      lots: client.accounts.taxable.lots || []
    },
    traditional: client.accounts.traditional,
    roth: client.accounts.roth,
    total: client.accounts.taxable.value + client.accounts.traditional + client.accounts.roth
  };
  
  // Track gain ratio evolution
  const updateGainRatio = () => {
    if (portfolio.taxable.value <= 0) return 0;
    return Math.max(0, (portfolio.taxable.value - portfolio.taxable.basis) / portfolio.taxable.value);
  };
  
  for (let i = 0; i < horizon; i++) {
    const year = startYear + i;
    const ageP = client.age_primary + i;
    const ageS = client.age_spouse ? client.age_spouse + i : null;
    
    // Determine phase
    const phase = determinePhase(ageP, client);
    
    // Step 1: Calculate income sources (GROSS)
    const income = calcAnnualIncome(client, year, ageP, ageS, phase);
    
    // Step 2: Calculate expenses INCLUDING healthcare
    const healthcare = calcHealthcareCosts(income.total_magi, year, ageP, client.filing);
    const baseExpenses = calcAnnualExpenses(client.base_spend, year, startYear, phase, params);
    const totalExpenses = baseExpenses.total + healthcare.total;
    
    // Step 3: Calculate tax on income ONLY (before withdrawal)
    const incomeDeductions = calcDeductions({
      gross_income: income.total_ordinary + income.qd + income.interest,
      salt: client.salt,
      mortgage: client.mortgage,
      charitable: client.charitable,
      above_line: {},
      filing: client.filing,
      year
    });
    const incomeOrdTax = calcFedOrdinary(Math.max(0, incomeDeductions.taxable_income - income.qd), year, client.filing);
    const incomePrefTax = calcFedPreferential(incomeOrdTax.taxable_income || 0, income.qd, 0, year, client.filing);
    const taxOnIncome = incomeOrdTax.gross_tax + incomePrefTax.total + (income.total_ordinary * (client.state_rate || 0.05));
    
    // Step 4: Calculate NET income (after tax on income)
    const incomeNet = income.total_gross - taxOnIncome - income.ss_tax - income.medicare_tax;
    
    // Step 5: Calculate GAP (what we need from portfolio)
    const gap = Math.max(0, totalExpenses - incomeNet);
    
    // Step 6: Optimal withdrawal (handles gross-up internally)
    const gainRatio = updateGainRatio();
    const accts = {
      taxable: { value: portfolio.taxable.value, gain_ratio: gainRatio },
      traditional: portfolio.traditional,
      roth: portfolio.roth
    };
    const withdrawal = gap > 0 
      ? calcWithdrawal(gap, accts, year, ageP, client.filing)
      : { plan: [], total_gross: 0, total_tax: 0, total_net: 0 };
    
    // Roth conversion opportunity
    const conversionIncome = income.total_ordinary + withdrawal.plan
      .filter(p => p.source === 'traditional')
      .reduce((s, p) => s + p.gross, 0);
    const rothConversion = calcRothConversion(
      conversionIncome, 
      { traditional: portfolio.traditional, cash: portfolio.taxable.value * 0.1 },
      ageP, year, client.filing, params.roth_prefs
    );
    
    // Tax calculations
    const ordinaryIncome = income.total_ordinary + 
      withdrawal.plan.filter(p => p.source === 'traditional').reduce((s, p) => s + p.gross, 0) +
      (params.do_roth_conversion ? rothConversion.optimal : 0);
    
    const deductions = calcDeductions({
      gross_income: ordinaryIncome + income.qd + income.interest,
      salt: client.salt,
      mortgage: client.mortgage,
      charitable: client.charitable,
      above_line: {},
      filing: client.filing,
      year
    });
    
    const fedOrd = calcFedOrdinary(deductions.taxable_income, year, client.filing);
    const ltcg = withdrawal.plan
      .filter(p => p.source === 'taxable')
      .reduce((s, p) => s + (p.gain || 0), 0);
    const fedPref = calcFedPreferential(deductions.taxable_income, income.qd, ltcg, year, client.filing);
    
    const taxes = {
      federal_ordinary: fedOrd.gross_tax,
      federal_preferential: fedPref.total,
      state: ordinaryIncome * (client.state_rate || 0.05),
      fica: income.ss_tax + income.medicare_tax,
      total: fedOrd.gross_tax + fedPref.total + ordinaryIncome * (client.state_rate || 0.05)
    };
    
    // Update portfolio (end of year)
    const returnRate = params.return_rate || 0.07;
    
    // Subtract withdrawals
    for (const w of withdrawal.plan) {
      if (w.source === 'taxable') {
        portfolio.taxable.value -= w.gross;
        portfolio.taxable.basis -= w.basis || (w.gross * (1 - gainRatio));
      } else if (w.source === 'traditional') {
        portfolio.traditional -= w.gross;
      } else if (w.source === 'roth') {
        portfolio.roth -= w.gross;
      }
    }
    
    // Apply Roth conversion
    if (params.do_roth_conversion && rothConversion.optimal > 0) {
      portfolio.traditional -= rothConversion.optimal;
      portfolio.roth += rothConversion.optimal;
    }
    
    // Apply returns
    portfolio.taxable.value *= (1 + returnRate);
    portfolio.taxable.basis *= 1;  // Basis doesn't grow
    portfolio.traditional *= (1 + returnRate);
    portfolio.roth *= (1 + returnRate);
    portfolio.total = portfolio.taxable.value + portfolio.traditional + portfolio.roth;
    
    // Balance verification: income_net + withdrawal_net should ≈ expenses
    const netAvailable = incomeNet + withdrawal.total_net;
    const balance = netAvailable - totalExpenses;
    
    schedule.push({
      year,
      age_p: ageP,
      age_s: ageS,
      phase,
      income: {
        earned: income.earned,
        ss_primary: income.ss_p,
        ss_spouse: income.ss_s,
        pension: income.pension,
        dividends_qualified: income.qd,
        dividends_ordinary: income.div_o,
        interest: income.interest,
        total_gross: income.total_gross,
        tax_on_income: Math.round(taxOnIncome),
        total_net: Math.round(incomeNet)
      },
      expenses: {
        base: baseExpenses.total,
        healthcare: healthcare.total,
        total: totalExpenses
      },
      gap: Math.round(gap),
      withdrawals: {
        plan: withdrawal.plan,
        total_gross: withdrawal.total_gross,
        total_tax: withdrawal.total_tax,
        total_net: withdrawal.total_net
      },
      roth_conversion: params.do_roth_conversion ? {
        amount: rothConversion.optimal,
        binding_constraint: rothConversion.binding,
        tax_cost: rothConversion.tax_cost
      } : null,
      deductions: {
        method: deductions.method,
        amount: deductions.deduction_used,
        salt_lost: deductions.detail?.salt?.lost || 0
      },
      taxes,
      balance_check: {
        income_net: Math.round(incomeNet),
        withdrawal_net: Math.round(withdrawal.total_net),
        total_available: Math.round(netAvailable),
        expenses_total: Math.round(totalExpenses),
        balance: Math.round(balance),
        balanced: Math.abs(balance) < 100
      },
      portfolio_eoy: {
        taxable: Math.round(portfolio.taxable.value),
        taxable_basis: Math.round(portfolio.taxable.basis),
        taxable_gain_ratio: updateGainRatio(),
        traditional: Math.round(portfolio.traditional),
        roth: Math.round(portfolio.roth),
        total: Math.round(portfolio.total)
      }
    });
  }
  
  return schedule;
}

function determinePhase(age, client) {
  if (age < client.retire_age) return 'accumulation';
  if (age < 65) return 'early_retire';
  if (age < (client.ss_claim_age || 67)) return 'bridge';
  if (age < 73) return 'ss';
  return 'rmd';
}

function calcAnnualIncome(client, year, ageP, ageS, phase) {
  const income = {
    earned: 0, ss_p: 0, ss_s: 0, pension: 0,
    qd: 0, div_o: 0, interest: 0,
    ss_tax: 0, medicare_tax: 0
  };
  
  // Earned income (pre-retirement)
  if (phase === 'accumulation') {
    income.earned = client.earned_income || 0;
    income.ss_tax = Math.min(income.earned, OPTIONS_RATES.ss_wage_base_2025) * 0.062;
    income.medicare_tax = income.earned * 0.0145;
  }
  
  // Social Security
  if (ageP >= (client.ss_claim_age || 67)) {
    income.ss_p = (client.ss_benefit_primary || 0) * 12;
  }
  if (ageS && ageS >= (client.ss_claim_age_spouse || 67)) {
    income.ss_s = (client.ss_benefit_spouse || 0) * 12;
  }
  
  // Pension
  if (client.pension && ageP >= client.pension.start_age) {
    income.pension = client.pension.annual;
  }
  
  // Investment income from taxable accounts
  const taxableValue = client.accounts.taxable.value;
  income.qd = taxableValue * 0.015;  // ~1.5% dividend yield
  income.interest = taxableValue * 0.002;  // ~0.2% interest
  
  // Calculate totals
  income.total_ordinary = income.earned + income.pension;
  income.total_gross = income.earned + income.ss_p + income.ss_s + income.pension + income.qd + income.div_o + income.interest;
  income.total_net = income.total_gross - income.ss_tax - income.medicare_tax;
  income.total_magi = income.total_gross;  // Simplified
  
  return income;
}

function calcHealthcareCosts(magi, year, age, filing) {
  let premium, irmaa_surcharge = 0, oop;
  
  if (age < 65) {
    // ACA
    const aca = calcACA(magi, [age], year);
    premium = aca.net * 12;
    oop = 5000;  // Estimated out-of-pocket
  } else {
    // Medicare
    const irmaa = calcIRMAA(magi, year - 2, filing);  // 2-year lookback
    premium = 175 * 12;  // Base Part B
    irmaa_surcharge = irmaa.annual;
    oop = 3000;  // Estimated out-of-pocket + Medigap
  }
  
  return {
    premium: Math.round(premium),
    irmaa_surcharge: Math.round(irmaa_surcharge),
    out_of_pocket: oop,
    total: Math.round(premium + irmaa_surcharge + oop)
  };
}

function calcAnnualExpenses(baseSpend, year, startYear, phase, params) {
  const inflationRate = params.inflation || 0.025;
  const inflationMult = Math.pow(1 + inflationRate, year - startYear);
  
  let base = baseSpend * inflationMult;
  let special = 0;
  
  // Retirement spending smile
  if (phase !== 'accumulation') {
    const retireYears = year - startYear;
    if (retireYears < 10) {
      base *= 1.1;  // Go-go years
    } else if (retireYears < 20) {
      base *= 1.0;  // Slow-go years
    } else {
      base *= 0.85;  // No-go years (offset by healthcare increases)
    }
  }
  
  return {
    base: Math.round(base),
    special: Math.round(special),
    total: Math.round(base + special)
  };
}
```



---

---

## §6 OUTPUT WORKFLOW

```yaml
ARTIFACT_PRODUCTION:
  philosophy: "Every calculation produces a tangible, inspectable artifact"
  
  workflow:
    1_ANNOUNCE: |
      ═══ GENERATING: {ARTIFACT_ID} ═══
      📋 Purpose: {description}
      📥 Inputs: {input_list}
      🛡️ Guards: Check §0 NEVER rules
    
    2_CALCULATE: |
      Formula: {formula}
      Substitution: {values}
      Result: {result}
    
    3_VERIFY: |
      ✅ Invariant 1: {check}
      ✅ Invariant 2: {check}
      ❌ FAIL → HALT
    
    4_OUTPUT: |
      | Field | Value |
      |-------|-------|
      | Tax   | $X    |
    
    5_COMPLETE: |
      ═══ ✅ COMPLETE ═══

QUALITY_CHECKLIST:
  - All must_include fields present
  - Numeric precision: $X,XXX.XX
  - All invariants passed
  - No §0 NEVER violations
  - Totals sum correctly

EXAMPLE: |
  ═══ GENERATING: CALC_101 ═══
  📋 Federal ordinary tax
  📥 taxable=$200K, MFJ, 2025
  🛡️ tax ≥ 0, eff ≤ marg
  
  10%: $23,850 × 0.10 = $2,385
  12%: $73,100 × 0.12 = $8,772
  22%: $103,050 × 0.22 = $22,671
  Total: $33,828
  
  ✅ Sum correct ✅ Eff 16.91% ≤ Marg 22%
  
  | Tax | $33,828 | Eff | 16.91% |
  
  ═══ ✅ COMPLETE ═══
```

---

## §7 QUICK REFERENCE

```yaml
COMMANDS:
  - "Load ULTRA FAT FIRE v8.2"
  - "Analyze {client}"
  - "Test CALC_106"
  - "What if retire_age = 58?"

CRITICAL_FORMULAS:
  withdrawal_rate: "rate = withdrawal / FIRE_assets (NOT total net worth)"
  taxable_tax: "tax = withdrawal × gain_ratio × ltcg_rate"
  salt: "deductible = min(state + property, $10,000)"
  nso_net: "net = spread - fed - state - SS(6.2%) - medicare(1.45%+)"
  
KEY_THRESHOLDS_2025:
  ltcg_0_pct: $96,700 (MFJ)
  ltcg_15_pct: $600,050 (MFJ)
  niit: $250,000 MAGI (MFJ)
  irmaa: [$206K, $258K, $322K, $386K, $750K]
  aca_cliff: ~$81,760 (400% FPL)
  estate: $13.61M ($27.22M MFJ)
  ss_earnings: $22,320 (2024)
  
WITHDRAWAL_SEQUENCE:
  1: RMD (mandatory if age ≥ 73)
  2: Taxable @ 0% bracket
  3: Taxable @ 15% bracket
  4: Traditional @ marginal rate
  5: Roth (preserve tax-free growth)

SAMPLE_CLIENT:
  ages: [52, 50]
  retire: 55
  state: CA
  accounts: { taxable: $3M (50% gain), traditional: $2M, roth: $500K }
  income: { salary: $650K, bonus: $100K, qd: $45K }
  deductions: { state: $55K, property: $22K, mortgage: $19K, charitable: $30K }
  spending: $285K/year
```

---

## FRAMEWORK COMPLETE

**ULTRA FAT FIRE v8.2** — Optimal Prompt-as-Code Sequencing:

1. **§0 CRITICAL INVARIANTS** — Guard rails FIRST (prevents errors before they happen)
2. **§1 EXECUTION PROTOCOL** — Interface after constraints
3. **§2 REFERENCE TABLES** — Data before logic
4. **§3 ARTIFACTS WITH INLINE TESTS** — Schema + tests together (zero forward refs)
5. **§4 CALCULATION ENGINES** — Implementation after schema
6. **§5 SCHEDULE GENERATOR** — Orchestration
7. **§6 OUTPUT WORKFLOW** — Production process
8. **§7 QUICK REFERENCE** — Summary at end

**Key Improvements over v8.1:**
- Guard rails in §0 (was §5) — LLM sees constraints before writing code
- Tests inline with artifacts — No forward references to §4
- Unified test format with worked calculations
- Reduced sections: 8 vs 9

**Metrics:**
```
| Version | Lines | Words | Sections | Forward Refs |
|---------|-------|-------|----------|--------------|
| v8.1    | 2,762 | 9,825 | 9        | ~34          |
| v8.2    | ~2,400| ~8,500| 8        | ~5           |
```
