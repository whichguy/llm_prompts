# Token-Efficient Code Style Guide for LLM Prompts

This guide defines conventions for writing compact, precise specifications and code that minimize token usage while maximizing clarity. Covers YAML specifications, JavaScript (ES6+), Python, HTML/CSS with Material Design, and sophisticated patterns for financial applications.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [YAML Specification Patterns](#yaml-specification-patterns)
3. [JavaScript Patterns (ES6+)](#javascript-patterns-es6)
4. [Sophisticated ES6 Patterns](#sophisticated-es6-patterns)
5. [JavaScript Generators](#javascript-generators)
6. [JavaScript Financial Classes](#javascript-financial-classes)
7. [Python Patterns](#python-patterns)
8. [Python Generators](#python-generators)
9. [Python Financial Classes](#python-financial-classes)
10. [HTML & Material Design Patterns](#html--material-design-patterns)
11. [JavaScript in HTML Reports](#javascript-in-html-reports)
12. [When Verbose is Better](#when-verbose-is-better)
13. [Quick Reference](#quick-reference)

---

## Core Principles

1. **YAML is specification, not execution.** YAML blocks define inputs, outputs, types, constraints, and test vectors. Generate implementation code FROM specs—never code that parses YAML at runtime.

2. **Formulas are pseudocode.** Mathematical expressions use notation like `×`, `Σ`, `→` for clarity. Translate to target language operators during implementation.

3. **Types are constraints.** Type annotations (`USD`, `ratio`, `year`) define validation rules that implementations must enforce.

4. **Tests are contracts.** Every calculation spec includes concrete test vectors with exact expected values. Implementations must pass all tests.

5. **Compact code is correct code.** Verbosity introduces error opportunities. Prefer idiomatic compression, but preserve clarity for complex logic.

---

## YAML Specification Patterns

YAML defines WHAT to compute. Keep specs declarative, typed, and testable.

### Naming and Structure

Use short, meaningful keys. Nest logically related items. Include defaults inline.

**❌ Anti-pattern: Verbose, flat structure**
```yaml
calculation_name: calculate_long_term_capital_gains_tax
calculation_description: This calculation determines the tax owed
input_ordinary_income_description: The taxpayer's ordinary taxable income
input_ordinary_income_type: number representing US dollars
input_ordinary_income_required: true
input_long_term_gains_description: The total long-term capital gains
input_long_term_gains_type: number representing US dollars
output_tax_at_zero_percent: number
output_tax_at_fifteen_percent: number
output_total_tax_owed: number
```

**✓ Pattern: Compact, nested structure**
```yaml
CALC_LTCG:
  inputs:
    ordi: { type: USD, note: "Ordinary taxable income" }
    ltcg: { type: USD, note: "Long-term gains" }
  outputs:
    at0:  { type: USD }
    at15: { type: USD }
    at20: { type: USD }
    tax:  { type: USD, formula: "at15 × 0.15 + at20 × 0.20" }
```

### Type Definitions

Define types once, reference everywhere. Include constraints inline.

**❌ Anti-pattern: Repeated verbose descriptions**
```yaml
inputs:
  value:
    description: "The current market value in US dollars, must be positive"
    type: number
    minimum: 0
  basis:
    description: "The cost basis in US dollars, cannot exceed value"
    type: number
    minimum: 0
    maximum: "must be less than or equal to value"
```

**✓ Pattern: Terse type syntax with constraints**
```yaml
types:
  USD:   "number, non-negative, 2 decimal precision"
  ratio: "number in [0,1], percentage as decimal"
  year:  "integer, 2020-2100"

inputs:
  value: { type: USD, constraint: "> 0" }
  basis: { type: USD, constraint: "≤ value" }
```

### Formulas

Express formulas as concise pseudocode. Use standard mathematical notation.

**❌ Anti-pattern: Prose descriptions**
```yaml
outputs:
  gain:
    description: "Calculate the gain by subtracting the basis from the value"
  gain_ratio:
    description: "Divide the gain by the value to get the ratio"
  effective_rate:
    description: "Multiply the gain ratio by the sum of federal and state rates"
```

**✓ Pattern: Symbolic formulas**
```yaml
outputs:
  gain:       { formula: "value - basis" }
  gain_ratio: { formula: "value > 0 ? gain / value : 0" }
  eff_rate:   { formula: "gain_ratio × (fed_rate + state_rate)" }
```

### Test Vectors

Include concrete numbers. Cover edge cases. Name tests descriptively.

**❌ Anti-pattern: No tests or vague descriptions**
```yaml
CALC_BRACKET:
  notes: "Should handle all tax brackets correctly"
  edge_cases: "Consider what happens at bracket boundaries"
```

**✓ Pattern: Explicit test vectors**
```yaml
CALC_BRACKET:
  tests:
    - name: "All in 0% bracket"
      input:  { ordi: 50000, ltcg: 40000 }
      expect: { at0: 40000, at15: 0, tax: 0 }
    - name: "Spans 0%/15%"
      input:  { ordi: 80000, ltcg: 50000 }
      expect: { at0: 16700, at15: 33300, tax: 4995 }
    - name: "All at 20%"
      input:  { ordi: 700000, ltcg: 100000 }
      expect: { at0: 0, at15: 0, at20: 100000, tax: 20000 }
```

### Reference Tables

Use compact table format. Avoid repeating structure.

**❌ Anti-pattern: Verbose repeated objects**
```yaml
tax_brackets:
  - bracket_name: "ten_percent"
    bracket_rate: 0.10
    bracket_floor_single: 0
    bracket_ceiling_single: 11600
    bracket_floor_mfj: 0
    bracket_ceiling_mfj: 23200
  - bracket_name: "twelve_percent"
    bracket_rate: 0.12
    bracket_floor_single: 11600
    bracket_ceiling_single: 47150
```

**✓ Pattern: Compact table**
```yaml
BRACKETS_2024:          # [floor, ceiling] by filing
  10%:  { single: [0, 11600],      mfj: [0, 23200] }
  12%:  { single: [11600, 47150],  mfj: [23200, 94300] }
  22%:  { single: [47150, 100525], mfj: [94300, 201050] }
  24%:  { single: [100525, 191950],mfj: [201050, 383900] }
```

---

## JavaScript Patterns (ES6+)

Leverage ES6 features for maximum compression while maintaining readability.

### Destructuring

Chain related destructures in single `const`. Use defaults inline. Nest for deep access.

**❌ Anti-pattern: Repeated property access**
```javascript
function calculate(params) {
  const client = params.client;
  const projection = params.projection;
  const spending = params.spending;
  const startYear = projection.startYear;
  const endYear = projection.endYear;
  const inflationRate = projection.inflationRate || 0.025;
  const returnRate = projection.returnRate || 0.07;
  const results = [];
  // ...
}
```

**✓ Pattern: Chained destructuring**
```javascript
const calculate = params => {
  const { client, projection: proj, spending } = params,
        { startYear: start, endYear: end, inflationRate: inf = .025, returnRate: ret = .07 } = proj,
        results = [];
  // ...
};
```

**❌ Anti-pattern: Verbose nested access**
```javascript
const federalRate = client.taxes.federal;
const stateRate = client.taxes.state;
const ficaRate = client.taxes.fica;
const totalRate = client.taxes.federal + client.taxes.state + client.taxes.fica;
```

**✓ Pattern: Nested destructure**
```javascript
const { taxes: { federal, state, fica } } = client,
      totalRate = federal + state + fica;
```

### Functions

Use arrow syntax. Destructure parameters. Omit braces and `return` for single expressions.

**❌ Anti-pattern: Verbose function declarations**
```javascript
function calculateNet(gross, rate) {
  return gross * (1 - rate);
}

function getBucketTax(bucket) {
  return bucket.gross * bucket.rate;
}
```

**✓ Pattern: Arrow functions with destructuring**
```javascript
const calcNet = (gross, rate) => gross * (1 - rate);
const getBucketTax = ({ gross, rate }) => gross * rate;
```

**❌ Anti-pattern: Unnecessary braces and return**
```javascript
const double = (x) => {
  return x * 2;
};
```

**✓ Pattern: Implicit return**
```javascript
const double = x => x * 2;
const getNet = b => b.gross - b.tax;
```

### Objects

Use shorthand properties. Spread for merging/cloning. Computed keys when needed.

**❌ Anti-pattern: Verbose object literals**
```javascript
return {
  gross: gross,
  tax: tax,
  net: net,
  rate: rate
};
```

**✓ Pattern: Shorthand properties**
```javascript
return { gross, tax, net, rate };
```

**❌ Anti-pattern: Manual merging**
```javascript
const result = {};
result.a = defaults.a;
result.b = defaults.b;
result.c = overrides.c;
result.computed = calculated;
```

**✓ Pattern: Spread operator**
```javascript
const result = { ...defaults, ...overrides, computed };
```

**❌ Anti-pattern: Clone and mutate**
```javascript
const newBucket = Object.assign({}, bucket);
newBucket.used = true;
newBucket.remaining = 0;
```

**✓ Pattern: Spread with overrides**
```javascript
const newBucket = { ...bucket, used: true, remaining: 0 };
```

**✓ Pattern: Transform object values**
```javascript
const doubled = Object.fromEntries(
  Object.entries(rates).map(([k, v]) => [k, v * 2])
);
```

**✓ Pattern: Computed property keys**
```javascript
const field = 'taxRate';
const yearData = { [field]: 0.22, [`${field}2025`]: 0.24 };
```

### Conditionals

Use ternary chains for bracket-style logic. Optional chaining and nullish coalescing for safe access.

**❌ Anti-pattern: Verbose if/else chains**
```javascript
let rate;
if (income <= 23200) {
  rate = 0.10;
} else if (income <= 94300) {
  rate = 0.12;
} else if (income <= 201050) {
  rate = 0.22;
} else if (income <= 383900) {
  rate = 0.24;
} else {
  rate = 0.32;
}
```

**✓ Pattern: Ternary chain (limit to 4-5 levels)**
```javascript
const rate = income <= 23200  ? .10
           : income <= 94300  ? .12
           : income <= 201050 ? .22
           : income <= 383900 ? .24 : .32;
```

**❌ Anti-pattern: Verbose null checks**
```javascript
let value;
if (obj && obj.nested && obj.nested.deep && obj.nested.deep.value) {
  value = obj.nested.deep.value;
} else {
  value = 0;
}
```

**✓ Pattern: Optional chain + nullish coalescing**
```javascript
const value = obj?.nested?.deep?.value ?? 0;
```

**❌ Anti-pattern: Redundant boolean**
```javascript
const isValid = x > 0 ? true : false;
```

**✓ Pattern: Direct boolean**
```javascript
const isValid = x > 0;
```

**✓ Pattern: Logical assignment operators**
```javascript
state.cache ||= {};           // assign if falsy
state.count ??= 0;            // assign if null/undefined
state.total &&= state.total * 1.1;  // assign if truthy
```

### Numeric Literals

Use separators for large financial constants.

**❌ Anti-pattern: Hard to read**
```javascript
const EXEMPTION = 13610000;
const THRESHOLD = 250000;
```

**✓ Pattern: Numeric separators**
```javascript
const EXEMPTION = 13_610_000;
const THRESHOLD = 250_000;
```

### Iteration

Prefer array methods over loops. Chain when processing. Destructure in callbacks.

**❌ Anti-pattern: for loop for transformation**
```javascript
const nets = [];
for (let i = 0; i < buckets.length; i++) {
  nets.push(buckets[i].gross * (1 - buckets[i].rate));
}
```

**✓ Pattern: map with destructuring**
```javascript
const nets = buckets.map(({ gross, rate }) => gross * (1 - rate));
```

**❌ Anti-pattern: for loop for filtering**
```javascript
const taxable = [];
for (let i = 0; i < buckets.length; i++) {
  if (buckets[i].source === 'taxable') {
    taxable.push(buckets[i]);
  }
}
```

**✓ Pattern: filter**
```javascript
const taxable = buckets.filter(b => b.source === 'taxable');
```

**❌ Anti-pattern: for loop for summation**
```javascript
let total = 0;
for (let i = 0; i < items.length; i++) {
  total = total + items[i].amount;
}
```

**✓ Pattern: reduce with destructuring**
```javascript
const total = items.reduce((sum, { amount }) => sum + amount, 0);
```

**❌ Anti-pattern: Multiple intermediate arrays**
```javascript
const filtered = buckets.filter(b => b.source === 'taxable');
const mapped = filtered.map(b => b.gross);
const total = mapped.reduce((a, b) => a + b, 0);
```

**✓ Pattern: Chained methods**
```javascript
const total = buckets
  .filter(b => b.source === 'taxable')
  .reduce((sum, { gross }) => sum + gross, 0);
```

**✓ Pattern: find instead of loop**
```javascript
const first = buckets.find(b => b.rate === 0);
```

**✓ Pattern: some/every for boolean checks**
```javascript
const hasNegative = items.some(x => x.value < 0);
const allValid = items.every(x => x.value >= 0);
```

**✓ Pattern: flatMap for nested transformations**
```javascript
const allLots = accounts.flatMap(a => a.lots);
const taxEvents = years.flatMap(y => y.withdrawals.map(w => ({ year: y.year, ...w })));
```

### Guards

Use compact require helper. Validate early. Fail loudly with context.

**❌ Anti-pattern: Verbose validation**
```javascript
function calcTax(ltcg, basis, value) {
  if (ltcg < 0) {
    throw new Error('LTCG cannot be negative: ' + ltcg);
  }
  if (basis > value) {
    throw new Error('Basis cannot exceed value: ' + basis + ' > ' + value);
  }
  // calculation...
}
```

**✓ Pattern: Require helper**
```javascript
const require = (cond, msg) => { if (!cond) throw new Error(msg); };

const calcTax = (ltcg, basis, value) => {
  require(ltcg >= 0, `LTCG negative: ${ltcg}`);
  require(basis <= value, `Basis ${basis} > value ${value}`);
  // calculation...
};
```

**❌ Anti-pattern: Silent failure**
```javascript
const safeDiv = (a, b) => {
  if (b === 0) return 0;  // Caller doesn't know division failed
  return a / b;
};
```

**✓ Pattern: Guarded OR documented default**
```javascript
// Option A: Fail explicitly
const safeDiv = (a, b) => {
  require(b !== 0, `Division by zero: ${a}/${b}`);
  return a / b;
};

// Option B: Document the default
const safeDiv = (a, b) => b !== 0 ? a / b : 0;  // Returns 0 when b=0
```

### Complete Basic JS Example

**❌ Anti-pattern: Verbose bracket calculation**
```javascript
function calculateLTCGTax(ordinaryIncome, longTermGains, taxYear) {
  var inflationFactor = Math.pow(1.025, taxYear - 2024);
  var bracket0Ceiling = 96700 * inflationFactor;
  var bracket15Ceiling = 600050 * inflationFactor;
  
  var spaceAtZeroPercent;
  if (ordinaryIncome < bracket0Ceiling) {
    spaceAtZeroPercent = bracket0Ceiling - ordinaryIncome;
  } else {
    spaceAtZeroPercent = 0;
  }
  
  var spaceAt15Percent;
  if (ordinaryIncome < bracket15Ceiling) {
    spaceAt15Percent = bracket15Ceiling - Math.max(ordinaryIncome, bracket0Ceiling);
  } else {
    spaceAt15Percent = 0;
  }
  
  var gainsAtZero, gainsAt15, gainsAt20;
  if (longTermGains <= spaceAtZeroPercent) {
    gainsAtZero = longTermGains;
    gainsAt15 = 0;
    gainsAt20 = 0;
  } else if (longTermGains <= spaceAtZeroPercent + spaceAt15Percent) {
    gainsAtZero = spaceAtZeroPercent;
    gainsAt15 = longTermGains - spaceAtZeroPercent;
    gainsAt20 = 0;
  } else {
    gainsAtZero = spaceAtZeroPercent;
    gainsAt15 = spaceAt15Percent;
    gainsAt20 = longTermGains - spaceAtZeroPercent - spaceAt15Percent;
  }
  
  var totalTax = (gainsAt15 * 0.15) + (gainsAt20 * 0.20);
  
  return {
    gainsAtZero: gainsAtZero,
    gainsAt15: gainsAt15,
    gainsAt20: gainsAt20,
    totalTax: totalTax
  };
}
```

**✓ Pattern: Compact implementation**
```javascript
const calcLTCG = (ordi, ltcg, yr) => {
  const inf = 1.025 ** (yr - 2024),
        [b0, b1] = [96_700, 600_050].map(x => x * inf),
        s0 = Math.max(0, b0 - ordi),
        s1 = Math.max(0, b1 - Math.max(ordi, b0)),
        at0 = Math.min(ltcg, s0),
        at15 = Math.min(ltcg - at0, s1),
        at20 = ltcg - at0 - at15;
  
  return { at0, at15, at20, tax: at15 * .15 + at20 * .20 };
};
```

---

## Sophisticated ES6 Patterns

Advanced patterns for complex financial applications.

### Private Class Fields

**❌ Anti-pattern: Convention-based privacy**
```javascript
class Portfolio {
  constructor(holdings) {
    this._holdings = holdings;  // Not truly private
    this._cache = null;
  }
  
  _recalculate() {  // Can be called externally
    this._cache = this._holdings.reduce((s, h) => s + h.value, 0);
  }
}
```

**✓ Pattern: True private fields**
```javascript
class Portfolio {
  #holdings;
  #cache = null;
  
  constructor(holdings) { this.#holdings = holdings; }
  
  #recalculate() { this.#cache = this.#holdings.reduce((s, h) => s + h.value, 0); }
  
  get totalValue() {
    if (this.#cache === null) this.#recalculate();
    return this.#cache;
  }
  
  addHolding(h) {
    this.#holdings.push(h);
    this.#cache = null;  // Invalidate
  }
}
```

### Static Fields and Methods

**✓ Pattern: Static configuration and factory methods**
```javascript
class TaxBracket {
  static #brackets2024 = [
    { floor: 0, ceil: 23_200, rate: .10 },
    { floor: 23_200, ceil: 94_300, rate: .12 },
    { floor: 94_300, ceil: 201_050, rate: .22 },
    { floor: 201_050, ceil: 383_900, rate: .24 },
    { floor: 383_900, ceil: Infinity, rate: .32 }
  ];
  
  static forYear(yr, filing = 'mfj') {
    const inf = 1.025 ** (yr - 2024);
    return this.#brackets2024.map(b => ({
      ...b,
      floor: Math.round(b.floor * inf),
      ceil: b.ceil === Infinity ? Infinity : Math.round(b.ceil * inf)
    }));
  }
  
  static calcTax(income, yr) {
    return this.forYear(yr).reduce((tax, { floor, ceil, rate }) =>
      income > floor ? tax + (Math.min(income, ceil) - floor) * rate : tax, 0);
  }
}

// Usage
const tax2026 = TaxBracket.calcTax(150_000, 2026);
```

### Symbol for Unique Keys

**✓ Pattern: Symbol-keyed metadata**
```javascript
const META = {
  source: Symbol('source'),
  timestamp: Symbol('timestamp'),
  audit: Symbol('audit')
};

class Transaction {
  constructor(amount, type) {
    this.amount = amount;
    this.type = type;
    this[META.source] = 'manual';
    this[META.timestamp] = Date.now();
    this[META.audit] = [];
  }
  
  log(msg) {
    this[META.audit].push({ time: Date.now(), msg });
  }
  
  toJSON() {
    // Symbols excluded from JSON.stringify automatically
    return { amount: this.amount, type: this.type };
  }
}
```

### WeakMap for Private Instance Data

**✓ Pattern: WeakMap for truly encapsulated data**
```javascript
const _balance = new WeakMap();
const _history = new WeakMap();

class Account {
  constructor(initial = 0) {
    _balance.set(this, initial);
    _history.set(this, [{ type: 'open', amount: initial, date: new Date() }]);
  }
  
  get balance() { return _balance.get(this); }
  
  deposit(amt) {
    require(amt > 0, 'Deposit must be positive');
    _balance.set(this, _balance.get(this) + amt);
    _history.get(this).push({ type: 'deposit', amount: amt, date: new Date() });
  }
  
  withdraw(amt) {
    require(amt > 0 && amt <= this.balance, `Invalid withdrawal: ${amt}`);
    _balance.set(this, _balance.get(this) - amt);
    _history.get(this).push({ type: 'withdraw', amount: amt, date: new Date() });
  }
  
  get history() { return [..._history.get(this)]; }  // Return copy
}
```

### Proxy for Validation and Logging

**✓ Pattern: Proxy for automatic validation**
```javascript
const createValidatedPortfolio = (holdings = []) => new Proxy({ holdings, cache: null }, {
  set(obj, prop, val) {
    if (prop === 'holdings') {
      require(Array.isArray(val), 'Holdings must be array');
      val.forEach((h, i) => {
        require(h.symbol && typeof h.symbol === 'string', `Invalid symbol at ${i}`);
        require(typeof h.shares === 'number' && h.shares >= 0, `Invalid shares at ${i}`);
        require(typeof h.basis === 'number' && h.basis >= 0, `Invalid basis at ${i}`);
      });
      obj.cache = null;  // Invalidate
    }
    obj[prop] = val;
    return true;
  },
  
  get(obj, prop) {
    if (prop === 'totalBasis') {
      obj.cache ??= obj.holdings.reduce((s, h) => s + h.basis, 0);
      return obj.cache;
    }
    return obj[prop];
  }
});

const portfolio = createValidatedPortfolio();
portfolio.holdings = [{ symbol: 'AAPL', shares: 100, basis: 15_000 }];  // Validated
```

### Async/Await Patterns

**❌ Anti-pattern: Nested promises**
```javascript
function fetchPortfolioData(userId) {
  return fetch(`/api/user/${userId}`)
    .then(res => res.json())
    .then(user => {
      return fetch(`/api/portfolio/${user.portfolioId}`)
        .then(res => res.json())
        .then(portfolio => {
          return fetch(`/api/prices?symbols=${portfolio.holdings.map(h => h.symbol).join(',')}`)
            .then(res => res.json())
            .then(prices => {
              return { user, portfolio, prices };
            });
        });
    });
}
```

**✓ Pattern: Async/await with destructuring**
```javascript
const fetchPortfolioData = async userId => {
  const user = await fetch(`/api/user/${userId}`).then(r => r.json());
  const portfolio = await fetch(`/api/portfolio/${user.portfolioId}`).then(r => r.json());
  const symbols = portfolio.holdings.map(h => h.symbol).join(',');
  const prices = await fetch(`/api/prices?symbols=${symbols}`).then(r => r.json());
  return { user, portfolio, prices };
};
```

**✓ Pattern: Parallel async with Promise.all**
```javascript
const fetchAllAccountData = async accountIds => {
  const results = await Promise.all(
    accountIds.map(id => fetch(`/api/account/${id}`).then(r => r.json()))
  );
  return results.reduce((map, acct) => ({ ...map, [acct.id]: acct }), {});
};
```

**✓ Pattern: Promise.allSettled for partial failures**
```javascript
const fetchPricesResilient = async symbols => {
  const results = await Promise.allSettled(
    symbols.map(s => fetch(`/api/price/${s}`).then(r => r.json()))
  );
  return symbols.reduce((acc, sym, i) => {
    acc[sym] = results[i].status === 'fulfilled' ? results[i].value : null;
    return acc;
  }, {});
};
```

---

## JavaScript Generators

Generators for memory-efficient iteration over large financial datasets.

### Basic Generator Pattern

**❌ Anti-pattern: Build entire array in memory**
```javascript
function getAllWithdrawalYears(startYear, endYear, annualAmount, inflationRate) {
  const years = [];
  let amount = annualAmount;
  for (let yr = startYear; yr <= endYear; yr++) {
    years.push({ year: yr, amount, cumulative: years.reduce((s, y) => s + y.amount, 0) + amount });
    amount *= (1 + inflationRate);
  }
  return years;
}
// Creates array of 30+ objects even if we only need first few
```

**✓ Pattern: Generator yields on demand**
```javascript
function* withdrawalYears(startYr, endYr, annual, inf = .025) {
  let amt = annual, cumulative = 0;
  for (let yr = startYr; yr <= endYr; yr++) {
    cumulative += amt;
    yield { year: yr, amount: amt, cumulative };
    amt *= (1 + inf);
  }
}

// Memory efficient iteration
for (const yr of withdrawalYears(2025, 2055, 200_000)) {
  if (yr.cumulative > 5_000_000) break;  // Early exit
  console.log(yr);
}

// Convert to array only when needed
const allYears = [...withdrawalYears(2025, 2055, 200_000)];
```

### Generator for Tax Lot Processing

**✓ Pattern: Generator for lot-by-lot withdrawal**
```javascript
function* processLots(lots, targetGain) {
  let remainingGain = targetGain;
  const sorted = [...lots].sort((a, b) => b.gainRatio - a.gainRatio);  // Highest gain first
  
  for (const lot of sorted) {
    if (remainingGain <= 0) return;
    
    const lotGain = lot.value - lot.basis;
    const useGain = Math.min(remainingGain, lotGain);
    const useFraction = lotGain > 0 ? useGain / lotGain : 1;
    const useValue = lot.value * useFraction;
    const useBasis = lot.basis * useFraction;
    
    yield {
      lotId: lot.id,
      useValue,
      useBasis,
      realizedGain: useGain,
      remaining: { ...lot, value: lot.value - useValue, basis: lot.basis - useBasis }
    };
    
    remainingGain -= useGain;
  }
}

// Process lots until we've realized enough gain
const lots = [
  { id: 'A', value: 50_000, basis: 30_000, gainRatio: 0.4 },
  { id: 'B', value: 80_000, basis: 70_000, gainRatio: 0.125 },
  { id: 'C', value: 30_000, basis: 10_000, gainRatio: 0.667 }
];

for (const sale of processLots(lots, 25_000)) {
  console.log(`Sell from lot ${sale.lotId}: $${sale.useValue.toFixed(2)}, gain: $${sale.realizedGain.toFixed(2)}`);
}
```

### Async Generator for Paginated API

**✓ Pattern: Async generator for paginated data**
```javascript
async function* fetchTransactionHistory(accountId, startDate) {
  let cursor = null;
  do {
    const url = `/api/transactions?account=${accountId}&after=${startDate}${cursor ? `&cursor=${cursor}` : ''}`;
    const { data, nextCursor } = await fetch(url).then(r => r.json());
    
    for (const txn of data) {
      yield txn;
    }
    
    cursor = nextCursor;
  } while (cursor);
}

// Process transactions one at a time, fetching pages as needed
const processTransactions = async accountId => {
  let total = 0;
  for await (const txn of fetchTransactionHistory(accountId, '2024-01-01')) {
    total += txn.amount;
    if (total > 1_000_000) {
      console.log('Hit million dollar threshold');
      break;  // Stops fetching more pages
    }
  }
  return total;
};
```

### Generator Composition

**✓ Pattern: Composing generators with yield***
```javascript
function* range(start, end) {
  for (let i = start; i <= end; i++) yield i;
}

function* inflationAdjusted(values, rate) {
  let factor = 1;
  for (const v of values) {
    yield v * factor;
    factor *= (1 + rate);
  }
}

function* withRunningTotal(values) {
  let total = 0;
  for (const v of values) {
    total += v;
    yield { value: v, cumulative: total };
  }
}

// Compose generators
function* projectedWithdrawals(baseAmount, startYr, endYr, inf) {
  yield* withRunningTotal(
    inflationAdjusted(
      Array.from(range(startYr, endYr), () => baseAmount),
      inf
    )
  );
}

// Usage: lazy evaluation through entire pipeline
for (const w of projectedWithdrawals(200_000, 2025, 2060, .025)) {
  console.log(`Year withdrawal: $${w.value.toFixed(0)}, cumulative: $${w.cumulative.toFixed(0)}`);
}
```

### Generator with State Machine

**✓ Pattern: Generator as withdrawal state machine**
```javascript
function* withdrawalStateMachine(accounts, annualNeed) {
  const state = {
    year: new Date().getFullYear(),
    remaining: annualNeed,
    accounts: accounts.map(a => ({ ...a })),
    withdrawals: []
  };
  
  while (state.remaining > 0) {
    // Find best account (lowest tax cost)
    const sorted = state.accounts
      .filter(a => a.balance > 0)
      .sort((a, b) => a.effectiveRate - b.effectiveRate);
    
    if (sorted.length === 0) {
      yield { ...state, error: 'Insufficient funds' };
      return;
    }
    
    const acct = sorted[0];
    const withdraw = Math.min(state.remaining, acct.balance);
    const grossUp = withdraw / (1 - acct.effectiveRate);
    
    acct.balance -= grossUp;
    state.remaining -= withdraw;
    state.withdrawals.push({
      account: acct.name,
      gross: grossUp,
      net: withdraw,
      tax: grossUp - withdraw
    });
    
    yield { ...state };  // Yield intermediate state
  }
}

// Step through withdrawal process
const accounts = [
  { name: 'Taxable', balance: 500_000, effectiveRate: .15 },
  { name: 'Traditional IRA', balance: 800_000, effectiveRate: .24 },
  { name: 'Roth', balance: 300_000, effectiveRate: 0 }
];

const machine = withdrawalStateMachine(accounts, 200_000);
for (const state of machine) {
  console.log('Withdrawals so far:', state.withdrawals);
  console.log('Remaining need:', state.remaining);
}
```

---

## JavaScript Financial Classes

Comprehensive class patterns for financial modeling.

### Tax Lot with Immutable Updates

```javascript
class TaxLot {
  #id; #symbol; #shares; #basis; #acquiredDate; #source;
  
  constructor({ id, symbol, shares, basis, acquiredDate, source = 'purchase' }) {
    this.#id = id;
    this.#symbol = symbol;
    this.#shares = shares;
    this.#basis = basis;
    this.#acquiredDate = new Date(acquiredDate);
    this.#source = source;
    Object.freeze(this);
  }
  
  get id() { return this.#id; }
  get symbol() { return this.#symbol; }
  get shares() { return this.#shares; }
  get basis() { return this.#basis; }
  get basisPerShare() { return this.#shares > 0 ? this.#basis / this.#shares : 0; }
  get acquiredDate() { return new Date(this.#acquiredDate); }
  get source() { return this.#source; }
  
  isLongTerm(asOfDate = new Date()) {
    const held = asOfDate - this.#acquiredDate;
    return held > 365.25 * 24 * 60 * 60 * 1000;  // > 1 year
  }
  
  valueAt(price) { return this.#shares * price; }
  
  gainAt(price) { return this.valueAt(price) - this.#basis; }
  
  gainRatioAt(price) {
    const value = this.valueAt(price);
    return value > 0 ? this.gainAt(price) / value : 0;
  }
  
  // Immutable split: returns [sold portion, remaining portion]
  split(sharesToSell) {
    require(sharesToSell > 0 && sharesToSell <= this.#shares, 
      `Invalid split: ${sharesToSell} of ${this.#shares}`);
    
    const fraction = sharesToSell / this.#shares;
    const soldBasis = this.#basis * fraction;
    
    return [
      new TaxLot({
        id: `${this.#id}-sold`,
        symbol: this.#symbol,
        shares: sharesToSell,
        basis: soldBasis,
        acquiredDate: this.#acquiredDate,
        source: this.#source
      }),
      sharesToSell < this.#shares ? new TaxLot({
        id: this.#id,
        symbol: this.#symbol,
        shares: this.#shares - sharesToSell,
        basis: this.#basis - soldBasis,
        acquiredDate: this.#acquiredDate,
        source: this.#source
      }) : null
    ];
  }
  
  toJSON() {
    return {
      id: this.#id, symbol: this.#symbol, shares: this.#shares,
      basis: this.#basis, acquiredDate: this.#acquiredDate.toISOString(),
      source: this.#source
    };
  }
  
  static fromJSON(json) { return new TaxLot(json); }
}
```

### Withdrawal Engine with Strategy Pattern

```javascript
// Strategy interface
const WithdrawalStrategies = {
  lowestTaxFirst: (accounts) => [...accounts].sort((a, b) => a.effectiveRate - b.effectiveRate),
  
  rothLast: (accounts) => [...accounts].sort((a, b) => {
    if (a.type === 'roth' && b.type !== 'roth') return 1;
    if (b.type === 'roth' && a.type !== 'roth') return -1;
    return a.effectiveRate - b.effectiveRate;
  }),
  
  proportional: (accounts) => accounts,  // No sorting; will withdraw proportionally
  
  highestGainFirst: (accounts) => [...accounts].sort((a, b) => b.gainRatio - a.gainRatio)
};

class WithdrawalEngine {
  #accounts; #strategy; #history;
  
  constructor(accounts, strategy = 'lowestTaxFirst') {
    this.#accounts = new Map(accounts.map(a => [a.id, { ...a }]));
    this.#strategy = typeof strategy === 'function' ? strategy : WithdrawalStrategies[strategy];
    this.#history = [];
  }
  
  get accounts() { return [...this.#accounts.values()]; }
  get history() { return [...this.#history]; }
  get totalBalance() { return this.accounts.reduce((s, a) => s + a.balance, 0); }
  
  withdraw(netNeeded) {
    require(netNeeded > 0, 'Withdrawal must be positive');
    
    const ordered = this.#strategy(this.accounts.filter(a => a.balance > 0));
    const txns = [];
    let remaining = netNeeded;
    
    for (const acct of ordered) {
      if (remaining <= 0) break;
      
      const current = this.#accounts.get(acct.id);
      const maxNet = current.balance * (1 - current.effectiveRate);
      const takeNet = Math.min(remaining, maxNet);
      const takeGross = takeNet / (1 - current.effectiveRate);
      
      current.balance -= takeGross;
      remaining -= takeNet;
      
      txns.push({
        accountId: acct.id,
        accountType: acct.type,
        gross: takeGross,
        net: takeNet,
        tax: takeGross - takeNet,
        newBalance: current.balance
      });
    }
    
    const result = {
      date: new Date(),
      requested: netNeeded,
      fulfilled: netNeeded - remaining,
      shortfall: remaining,
      transactions: txns
    };
    
    this.#history.push(result);
    return result;
  }
  
  project(years, annualNeed, inflation = .025) {
    // Clone for projection without mutating
    const clone = new WithdrawalEngine(this.accounts, this.#strategy);
    const projection = [];
    let need = annualNeed;
    
    for (let yr = 0; yr < years; yr++) {
      const result = clone.withdraw(need);
      projection.push({
        year: new Date().getFullYear() + yr,
        ...result,
        balances: Object.fromEntries(clone.#accounts)
      });
      
      if (result.shortfall > 0) break;  // Ran out
      need *= (1 + inflation);
    }
    
    return projection;
  }
}

// Usage
const engine = new WithdrawalEngine([
  { id: 'tax', type: 'taxable', balance: 1_000_000, effectiveRate: .18, gainRatio: .6 },
  { id: 'ira', type: 'traditional', balance: 800_000, effectiveRate: .24, gainRatio: 1 },
  { id: 'roth', type: 'roth', balance: 400_000, effectiveRate: 0, gainRatio: 0 }
], 'rothLast');

const result = engine.withdraw(100_000);
console.log(result.transactions);
```

### Observable Portfolio with Events

```javascript
class ObservablePortfolio extends EventTarget {
  #holdings = new Map();
  #prices = new Map();
  
  addHolding(symbol, shares, basis) {
    const current = this.#holdings.get(symbol) || { shares: 0, basis: 0 };
    this.#holdings.set(symbol, {
      shares: current.shares + shares,
      basis: current.basis + basis
    });
    this.#emit('holdingChanged', { symbol, ...this.#holdings.get(symbol) });
  }
  
  updatePrice(symbol, price) {
    const old = this.#prices.get(symbol);
    this.#prices.set(symbol, price);
    
    if (this.#holdings.has(symbol)) {
      const holding = this.#holdings.get(symbol);
      const value = holding.shares * price;
      const gain = value - holding.basis;
      this.#emit('valueChanged', { symbol, price, value, gain, previousPrice: old });
    }
  }
  
  get totalValue() {
    return [...this.#holdings.entries()].reduce((sum, [sym, h]) => 
      sum + h.shares * (this.#prices.get(sym) || 0), 0);
  }
  
  get totalGain() {
    return [...this.#holdings.entries()].reduce((sum, [sym, h]) => 
      sum + (h.shares * (this.#prices.get(sym) || 0) - h.basis), 0);
  }
  
  #emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

// Usage
const portfolio = new ObservablePortfolio();
portfolio.addEventListener('valueChanged', e => {
  console.log(`${e.detail.symbol}: $${e.detail.value.toFixed(2)} (${e.detail.gain >= 0 ? '+' : ''}$${e.detail.gain.toFixed(2)})`);
});

portfolio.addHolding('AAPL', 100, 15_000);
portfolio.updatePrice('AAPL', 180);  // Triggers event
```

---

## Python Patterns

Leverage comprehensions, unpacking, and concise expressions while maintaining readability.

### Naming

Use short meaningful names. Avoid shadowing builtins (`ord`, `sum`, `list`, `type`, `id`).

**❌ Anti-pattern: Long names or shadowed builtins**
```python
def calculate_inflation_adjusted_value(original_value, inflation_rate, number_of_years):
    sum = original_value  # shadows builtin sum()
    return sum * (1 + inflation_rate) ** number_of_years
```

**✓ Pattern: Short names, no shadows**
```python
def calc_inf_adj(val, inf, yrs):
    return val * (1 + inf) ** yrs
```

### Destructuring / Unpacking

Use tuple unpacking. Unpack in signatures. Use starred expressions.

**❌ Anti-pattern: Index access**
```python
def process(data):
    client = data[0]
    projection = data[1]
    spending = data[2]
    start = projection['start']
    end = projection['end']
    inflation = projection.get('inflation', 0.025)
```

**✓ Pattern: Tuple and dict unpacking**
```python
def process(data):
    client, proj, spending = data
    start, end, inf = proj['start'], proj['end'], proj.get('inf', .025)
```

**❌ Anti-pattern: Manual list splitting**
```python
first = items[0]
rest = items[1:]
last = items[-1]
```

**✓ Pattern: Starred unpacking**
```python
first, *rest = items
head, *middle, tail = items
*init, last = items
```

### Comprehensions

Use list/dict/set comprehensions over loops. Generator expressions for large sequences.

**❌ Anti-pattern: Loop to build list**
```python
nets = []
for bucket in buckets:
    nets.append(bucket['gross'] * (1 - bucket['rate']))
```

**✓ Pattern: List comprehension**
```python
nets = [b['gross'] * (1 - b['rate']) for b in buckets]
```

**❌ Anti-pattern: Loop with conditional**
```python
taxable = []
for bucket in buckets:
    if bucket['source'] == 'taxable':
        taxable.append(bucket)
```

**✓ Pattern: Filtered comprehension**
```python
taxable = [b for b in buckets if b['source'] == 'taxable']
```

**❌ Anti-pattern: Loop to build dict**
```python
rates = {}
for bracket in brackets:
    rates[bracket['name']] = bracket['rate']
```

**✓ Pattern: Dict comprehension**
```python
rates = {b['name']: b['rate'] for b in brackets}
```

**❌ Anti-pattern: Nested loops to flat list**
```python
all_items = []
for category in categories:
    for item in category['items']:
        all_items.append(item)
```

**✓ Pattern: Nested comprehension**
```python
all_items = [item for cat in categories for item in cat['items']]
```

**✓ Pattern: Generator for large sequences (memory efficient)**
```python
# Don't materialize if only iterating once
total = sum(calc(x) for x in large_items)  # generator, not list
```

### Conditionals

Use ternary expressions. Use `or` / `get()` for defaults.

**❌ Anti-pattern: Verbose if/else for assignment**
```python
if income <= 23200:
    rate = 0.10
elif income <= 94300:
    rate = 0.12
elif income <= 201050:
    rate = 0.22
else:
    rate = 0.24
```

**✓ Pattern: Ternary (for 2-3 conditions)**
```python
rate = .10 if income <= 23200 else .12 if income <= 94300 else .22
```

**✓ Pattern: next() with generator (for many conditions)**
```python
brackets = [(23200, .10), (94300, .12), (201050, .22), (383900, .24), (float('inf'), .32)]
rate = next(r for ceil, r in brackets if income <= ceil)
```

**❌ Anti-pattern: Verbose None checks**
```python
if config is not None and 'rate' in config and config['rate'] is not None:
    rate = config['rate']
else:
    rate = 0.07
```

**✓ Pattern: get() with default**
```python
rate = (config or {}).get('rate', 0.07)
```

### Functions

Use default arguments. Return tuples for multiple values.

**❌ Anti-pattern: Verbose defaults**
```python
def calculate(income, rate, year, filing):
    if rate is None:
        rate = 0.25
    if year is None:
        year = 2024
    if filing is None:
        filing = 'mfj'
```

**✓ Pattern: Default arguments**
```python
def calculate(income, rate=.25, year=2024, filing='mfj'):
    pass
```

**❌ Anti-pattern: Dict return for multiple values**
```python
def calc_tax(gross, rate):
    tax = gross * rate
    net = gross - tax
    return {'gross': gross, 'tax': tax, 'net': net}

result = calc_tax(100000, 0.25)
net = result['net']
```

**✓ Pattern: Tuple return with unpacking**
```python
def calc_tax(gross, rate):
    tax = gross * rate
    return gross, tax, gross - tax

gross, tax, net = calc_tax(100000, .25)
```

### Guards

Use require helper or assert. Validate early.

**❌ Anti-pattern: Verbose validation**
```python
def calc_gain(value, basis):
    if value <= 0:
        raise ValueError(f'Value must be positive: {value}')
    if basis < 0:
        raise ValueError(f'Basis cannot be negative: {basis}')
    if basis > value:
        raise ValueError(f'Basis cannot exceed value: {basis} > {value}')
    return value - basis
```

**✓ Pattern: Require helper**
```python
def require(cond, msg):
    if not cond:
        raise ValueError(msg)

def calc_gain(value, basis):
    require(value > 0, f'Value must be positive: {value}')
    require(0 <= basis <= value, f'Invalid basis: {basis} vs value {value}')
    return value - basis
```

### Walrus Operator

Use `:=` to avoid repeated computation.

**❌ Anti-pattern: Repeated computation**
```python
results = []
for item in items:
    computed = expensive_calc(item)
    if computed > threshold:
        results.append(computed)
```

**✓ Pattern: Walrus in comprehension**
```python
results = [c for item in items if (c := expensive_calc(item)) > threshold]
```

**✓ Pattern: Walrus in conditional**
```python
if match := regex.search(text):
    process(match.group(1))
```

### String Formatting

Use f-strings with expressions.

**❌ Anti-pattern: Concatenation or .format()**
```python
msg = 'Tax: ' + str(rate * 100) + '% on $' + str(gross)
msg = 'Tax: {}% on ${}'.format(rate * 100, gross)
```

**✓ Pattern: f-string with formatting**
```python
msg = f'Tax: {rate:.1%} on ${gross:,.0f}'
```

### Complete Basic Python Example

**❌ Anti-pattern: Verbose bracket calculation**
```python
def calculate_ltcg_tax(ordinary_income, long_term_gains, tax_year):
    inflation_factor = (1.025) ** (tax_year - 2024)
    bracket_0_ceiling = 96700 * inflation_factor
    bracket_15_ceiling = 600050 * inflation_factor
    
    if ordinary_income < bracket_0_ceiling:
        space_at_0 = bracket_0_ceiling - ordinary_income
    else:
        space_at_0 = 0
    
    if ordinary_income < bracket_15_ceiling:
        space_at_15 = bracket_15_ceiling - max(ordinary_income, bracket_0_ceiling)
    else:
        space_at_15 = 0
    
    if long_term_gains <= space_at_0:
        at_0 = long_term_gains
        at_15 = 0
        at_20 = 0
    elif long_term_gains <= space_at_0 + space_at_15:
        at_0 = space_at_0
        at_15 = long_term_gains - space_at_0
        at_20 = 0
    else:
        at_0 = space_at_0
        at_15 = space_at_15
        at_20 = long_term_gains - space_at_0 - space_at_15
    
    total_tax = (at_15 * 0.15) + (at_20 * 0.20)
    
    return {
        'at_0': at_0,
        'at_15': at_15,
        'at_20': at_20,
        'tax': total_tax
    }
```

**✓ Pattern: Compact implementation**
```python
def calc_ltcg(ordi, ltcg, yr):
    inf = 1.025 ** (yr - 2024)
    b0, b1 = 96_700 * inf, 600_050 * inf
    s0, s1 = max(0, b0 - ordi), max(0, b1 - max(ordi, b0))
    at0 = min(ltcg, s0)
    at15 = min(ltcg - at0, s1)
    at20 = ltcg - at0 - at15
    return {'at0': at0, 'at15': at15, 'at20': at20, 'tax': at15 * .15 + at20 * .20}
```

---

## Python Generators

Memory-efficient iteration for large financial datasets.

### Basic Generator for Year-by-Year Projection

**❌ Anti-pattern: Build entire projection in memory**
```python
def project_all_years(start_balance, withdrawal, years, inflation=0.025, returns=0.07):
    results = []
    balance = start_balance
    annual = withdrawal
    for yr in range(years):
        balance = balance * (1 + returns) - annual
        results.append({
            'year': yr + 1,
            'withdrawal': annual,
            'end_balance': balance
        })
        annual *= (1 + inflation)
    return results
```

**✓ Pattern: Generator yields on demand**
```python
def project_years(start_bal, withdrawal, years, inf=.025, ret=.07):
    bal, annual = start_bal, withdrawal
    for yr in range(1, years + 1):
        bal = bal * (1 + ret) - annual
        yield {'year': yr, 'withdrawal': annual, 'end_balance': bal}
        annual *= (1 + inf)
        if bal <= 0:
            return  # Early termination

# Lazy iteration
for yr in project_years(2_000_000, 80_000, 30):
    if yr['end_balance'] < 500_000:
        print(f"Warning at year {yr['year']}: balance low")
        break
```

### Generator Pipeline for Tax Lot Processing

**✓ Pattern: Chained generators**
```python
def filter_long_term(lots, as_of=None):
    """Yield only long-term lots."""
    from datetime import datetime, timedelta
    cutoff = (as_of or datetime.now()) - timedelta(days=366)
    for lot in lots:
        if lot['acquired'] < cutoff:
            yield lot

def sort_by_gain_ratio(lots):
    """Yield lots sorted by gain ratio (highest first)."""
    yield from sorted(lots, key=lambda l: l['gain'] / l['value'] if l['value'] else 0, reverse=True)

def take_until_target(lots, target_gain):
    """Yield lots until target gain reached."""
    remaining = target_gain
    for lot in lots:
        if remaining <= 0:
            return
        use_gain = min(remaining, lot['gain'])
        use_fraction = use_gain / lot['gain'] if lot['gain'] else 1
        yield {
            **lot,
            'use_value': lot['value'] * use_fraction,
            'use_gain': use_gain
        }
        remaining -= use_gain

# Compose pipeline
def optimal_lots_for_gain(lots, target, as_of=None):
    return take_until_target(
        sort_by_gain_ratio(
            filter_long_term(lots, as_of)
        ),
        target
    )

# Usage - lazy evaluation through entire pipeline
lots = [
    {'id': 'A', 'acquired': datetime(2020, 1, 15), 'value': 50_000, 'gain': 20_000},
    {'id': 'B', 'acquired': datetime(2023, 6, 1), 'value': 30_000, 'gain': 5_000},  # Short-term, filtered
    {'id': 'C', 'acquired': datetime(2019, 3, 10), 'value': 80_000, 'gain': 60_000},
]

for lot in optimal_lots_for_gain(lots, 25_000):
    print(f"Sell {lot['id']}: ${lot['use_value']:,.0f} (gain: ${lot['use_gain']:,.0f})")
```

### Async Generator for API Pagination

**✓ Pattern: Async generator for paginated external data**
```python
import aiohttp

async def fetch_transactions(account_id, start_date):
    """Async generator yielding transactions page by page."""
    async with aiohttp.ClientSession() as session:
        cursor = None
        while True:
            params = {'account': account_id, 'after': start_date}
            if cursor:
                params['cursor'] = cursor
            
            async with session.get('/api/transactions', params=params) as resp:
                data = await resp.json()
            
            for txn in data['transactions']:
                yield txn
            
            cursor = data.get('next_cursor')
            if not cursor:
                break

# Usage
async def sum_deposits(account_id):
    total = 0
    async for txn in fetch_transactions(account_id, '2024-01-01'):
        if txn['type'] == 'deposit':
            total += txn['amount']
        if total > 1_000_000:
            break  # Early exit stops pagination
    return total
```

### Generator with Send for Interactive Control

**✓ Pattern: Two-way generator for withdrawal simulation**
```python
def withdrawal_simulator(accounts, annual_need):
    """Generator that accepts commands via send()."""
    year = 0
    need = annual_need
    state = {name: bal for name, bal in accounts.items()}
    
    while any(b > 0 for b in state.values()):
        year += 1
        
        # Yield current state, receive optional adjustment
        adjustment = yield {
            'year': year,
            'need': need,
            'balances': state.copy(),
            'total': sum(state.values())
        }
        
        # Apply adjustment if sent
        if adjustment:
            if 'need' in adjustment:
                need = adjustment['need']
            if 'extra_deposit' in adjustment:
                state[adjustment['account']] = state.get(adjustment['account'], 0) + adjustment['extra_deposit']
        
        # Simulate withdrawal
        remaining = need
        for name in sorted(state.keys()):  # Alphabetical for determinism
            if remaining <= 0:
                break
            take = min(remaining, state[name])
            state[name] -= take
            remaining -= take
        
        need *= 1.025  # Inflation

# Usage
sim = withdrawal_simulator({'taxable': 1_000_000, 'ira': 500_000}, 80_000)
state = next(sim)  # Initialize

for _ in range(30):
    print(f"Year {state['year']}: need ${state['need']:,.0f}, total ${state['total']:,.0f}")
    
    # Send adjustment in year 10
    if state['year'] == 10:
        state = sim.send({'extra_deposit': 200_000, 'account': 'ira'})
    else:
        state = sim.send(None)
    
    if state['total'] <= 0:
        print("Depleted!")
        break
```

### Generator Expression Patterns

**✓ Pattern: Generator expressions for aggregation**
```python
# Sum with generator (memory efficient)
total_gains = sum(lot['gain'] for lot in lots if lot['gain'] > 0)

# Any/all with generators
has_loss = any(lot['gain'] < 0 for lot in lots)
all_long_term = all(lot['holding_period'] > 365 for lot in lots)

# Max/min with generators
highest_gain_lot = max(lots, key=lambda l: l['gain'])
lowest_basis = min(lot['basis'] for lot in lots)

# Chained generators
total_lt_gains = sum(
    lot['gain'] 
    for lot in lots 
    if lot['holding_period'] > 365 and lot['gain'] > 0
)
```

---

## Python Financial Classes

Comprehensive class patterns for financial modeling.

### Immutable Tax Lot with Dataclass

```python
from dataclasses import dataclass, field, replace
from datetime import date, datetime
from typing import Optional

@dataclass(frozen=True)
class TaxLot:
    lot_id: str
    symbol: str
    shares: float
    basis: float
    acquired: date
    source: str = 'purchase'
    
    @property
    def basis_per_share(self) -> float:
        return self.basis / self.shares if self.shares > 0 else 0
    
    def is_long_term(self, as_of: Optional[date] = None) -> bool:
        ref = as_of or date.today()
        return (ref - self.acquired).days > 365
    
    def value_at(self, price: float) -> float:
        return self.shares * price
    
    def gain_at(self, price: float) -> float:
        return self.value_at(price) - self.basis
    
    def gain_ratio_at(self, price: float) -> float:
        val = self.value_at(price)
        return self.gain_at(price) / val if val > 0 else 0
    
    def split(self, shares_to_sell: float) -> tuple['TaxLot', Optional['TaxLot']]:
        """Return (sold_lot, remaining_lot). Remaining is None if fully sold."""
        if shares_to_sell <= 0 or shares_to_sell > self.shares:
            raise ValueError(f'Invalid split: {shares_to_sell} of {self.shares}')
        
        fraction = shares_to_sell / self.shares
        sold_basis = self.basis * fraction
        
        sold = replace(self, 
            lot_id=f'{self.lot_id}-sold',
            shares=shares_to_sell,
            basis=sold_basis
        )
        
        remaining = None
        if shares_to_sell < self.shares:
            remaining = replace(self,
                shares=self.shares - shares_to_sell,
                basis=self.basis - sold_basis
            )
        
        return sold, remaining
```

### Portfolio with Slots for Memory Efficiency

```python
from typing import Dict, List, Iterator
from collections import defaultdict

class Portfolio:
    __slots__ = ('_holdings', '_prices', '_cache')
    
    def __init__(self):
        self._holdings: Dict[str, List[TaxLot]] = defaultdict(list)
        self._prices: Dict[str, float] = {}
        self._cache: Dict[str, float] = {}
    
    def add_lot(self, lot: TaxLot) -> None:
        self._holdings[lot.symbol].append(lot)
        self._invalidate_cache()
    
    def update_price(self, symbol: str, price: float) -> None:
        self._prices[symbol] = price
        self._invalidate_cache()
    
    def _invalidate_cache(self) -> None:
        self._cache.clear()
    
    @property
    def total_value(self) -> float:
        if 'total_value' not in self._cache:
            self._cache['total_value'] = sum(
                lot.value_at(self._prices.get(lot.symbol, 0))
                for lots in self._holdings.values()
                for lot in lots
            )
        return self._cache['total_value']
    
    @property
    def total_basis(self) -> float:
        if 'total_basis' not in self._cache:
            self._cache['total_basis'] = sum(
                lot.basis
                for lots in self._holdings.values()
                for lot in lots
            )
        return self._cache['total_basis']
    
    @property
    def unrealized_gain(self) -> float:
        return self.total_value - self.total_basis
    
    def lots_by_symbol(self, symbol: str) -> List[TaxLot]:
        return list(self._holdings.get(symbol, []))
    
    def all_lots(self) -> Iterator[TaxLot]:
        for lots in self._holdings.values():
            yield from lots
    
    def long_term_lots(self, as_of: Optional[date] = None) -> Iterator[TaxLot]:
        return (lot for lot in self.all_lots() if lot.is_long_term(as_of))
```

### Withdrawal Strategy with Protocol

```python
from typing import Protocol, List, Dict
from abc import abstractmethod

class WithdrawalStrategy(Protocol):
    """Protocol defining withdrawal strategy interface."""
    
    @abstractmethod
    def order_accounts(self, accounts: List[Dict]) -> List[Dict]:
        """Return accounts in withdrawal order."""
        ...

class LowestTaxFirst:
    """Withdraw from lowest effective tax rate first."""
    
    def order_accounts(self, accounts: List[Dict]) -> List[Dict]:
        return sorted(accounts, key=lambda a: a.get('effective_rate', 0))

class RothLast:
    """Preserve Roth accounts until other sources depleted."""
    
    def order_accounts(self, accounts: List[Dict]) -> List[Dict]:
        roth = [a for a in accounts if a.get('type') == 'roth']
        other = [a for a in accounts if a.get('type') != 'roth']
        return sorted(other, key=lambda a: a.get('effective_rate', 0)) + roth

class Proportional:
    """Withdraw proportionally from all accounts."""
    
    def order_accounts(self, accounts: List[Dict]) -> List[Dict]:
        return list(accounts)  # No reordering

@dataclass
class WithdrawalEngine:
    accounts: Dict[str, Dict]
    strategy: WithdrawalStrategy = field(default_factory=LowestTaxFirst)
    history: List[Dict] = field(default_factory=list)
    
    def withdraw(self, net_needed: float) -> Dict:
        ordered = self.strategy.order_accounts(
            [a for a in self.accounts.values() if a['balance'] > 0]
        )
        
        txns = []
        remaining = net_needed
        
        for acct in ordered:
            if remaining <= 0:
                break
            
            rate = acct.get('effective_rate', 0)
            max_net = acct['balance'] * (1 - rate)
            take_net = min(remaining, max_net)
            take_gross = take_net / (1 - rate) if rate < 1 else take_net
            
            acct['balance'] -= take_gross
            remaining -= take_net
            
            txns.append({
                'account': acct['name'],
                'gross': take_gross,
                'net': take_net,
                'tax': take_gross - take_net
            })
        
        result = {
            'requested': net_needed,
            'fulfilled': net_needed - remaining,
            'shortfall': remaining,
            'transactions': txns
        }
        self.history.append(result)
        return result
```

---

## HTML & Material Design Patterns

Compact HTML reports using Materialize CSS framework.

### CDN References (Required)

```html
<!-- Fonts and Icons -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" rel="stylesheet">

<!-- Materialize CSS -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" rel="stylesheet">

<!-- jQuery (load before Materialize JS) -->
<script src="https://code.jquery.com/jquery-3.7.1.slim.min.js"></script>

<!-- Materialize JS -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
```

### Document Structure

**❌ Anti-pattern: Verbose, repetitive structure**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Financial Report</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" rel="stylesheet">
  <style>
    .custom-card {
      margin-bottom: 20px;
    }
    .custom-card .card-title {
      font-weight: 500;
    }
    .custom-header {
      padding: 20px;
      background-color: #1976d2;
      color: white;
    }
    /* ... many more custom styles */
  </style>
</head>
<body>
  <div class="custom-header">
    <h1>Financial Report</h1>
  </div>
  <div class="container">
    <div class="row">
      <div class="col s12">
        <div class="card custom-card">
          <div class="card-content">
            <span class="card-title">Portfolio Summary</span>
            <!-- content -->
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
```

**✓ Pattern: Compact, semantic structure**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Financial Report</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" rel="stylesheet">
  <style>
    :root{--gap:1rem;--radius:4px}
    .gap-y>*+*{margin-top:var(--gap)}
    .text-right{text-align:right}
    .mono{font-family:monospace}
    .positive{color:#4caf50}
    .negative{color:#f44336}
  </style>
</head>
<body>
  <nav class="blue darken-2"><div class="nav-wrapper container"><span class="brand-logo">Financial Report</span></div></nav>
  <main class="container gap-y" style="padding:var(--gap) 0">
    <section class="card">
      <div class="card-content">
        <span class="card-title">Portfolio Summary</span>
        <!-- content -->
      </div>
    </section>
  </main>
  <script src="https://code.jquery.com/jquery-3.7.1.slim.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
</body>
</html>
```

### CSS Utility Classes

**✓ Pattern: Minimal custom CSS with utility classes**
```html
<style>
  /* Layout utilities */
  :root{--gap:1rem;--gap-sm:.5rem}
  .gap-y>*+*{margin-top:var(--gap)}
  .gap-x>*+*{margin-left:var(--gap)}
  .flex{display:flex}
  .flex-between{justify-content:space-between}
  .flex-center{align-items:center}
  .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:var(--gap)}
  .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--gap)}
  
  /* Typography utilities */
  .text-right{text-align:right}
  .text-center{text-align:center}
  .mono{font-family:'Roboto Mono',monospace}
  .bold{font-weight:500}
  .small{font-size:.875rem}
  
  /* Financial utilities */
  .positive{color:#4caf50}
  .negative{color:#f44336}
  .currency::before{content:'$'}
  .pct::after{content:'%'}
  
  /* Compact table */
  table.compact td,table.compact th{padding:8px 12px}
</style>
```

### Tables

**❌ Anti-pattern: Verbose table markup**
```html
<table class="striped">
  <thead>
    <tr>
      <th>Account</th>
      <th>Balance</th>
      <th>Gain/Loss</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Taxable Brokerage</td>
      <td style="text-align: right;">$1,250,000</td>
      <td style="text-align: right; color: green;">+$350,000</td>
    </tr>
    <tr>
      <td>Traditional IRA</td>
      <td style="text-align: right;">$890,000</td>
      <td style="text-align: right; color: green;">+$240,000</td>
    </tr>
    <tr>
      <td>Roth IRA</td>
      <td style="text-align: right;">$425,000</td>
      <td style="text-align: right; color: green;">+$125,000</td>
    </tr>
  </tbody>
</table>
```

**✓ Pattern: Compact table with data attributes**
```html
<table class="striped compact">
  <thead><tr><th>Account</th><th class="text-right">Balance</th><th class="text-right">Gain/Loss</th></tr></thead>
  <tbody id="accounts"></tbody>
</table>
<script>
const accounts = [
  { name: 'Taxable Brokerage', balance: 1250000, gain: 350000 },
  { name: 'Traditional IRA', balance: 890000, gain: 240000 },
  { name: 'Roth IRA', balance: 425000, gain: 125000 }
];
$('#accounts').html(accounts.map(a => `
  <tr>
    <td>${a.name}</td>
    <td class="text-right mono">$${a.balance.toLocaleString()}</td>
    <td class="text-right mono ${a.gain >= 0 ? 'positive' : 'negative'}">${a.gain >= 0 ? '+' : ''}$${a.gain.toLocaleString()}</td>
  </tr>
`).join(''));
</script>
```

### Cards

**❌ Anti-pattern: Repetitive card markup**
```html
<div class="row">
  <div class="col s12 m4">
    <div class="card">
      <div class="card-content">
        <span class="card-title">Total Assets</span>
        <p class="flow-text" style="color: #1976d2;">$2,565,000</p>
      </div>
    </div>
  </div>
  <div class="col s12 m4">
    <div class="card">
      <div class="card-content">
        <span class="card-title">Total Gain</span>
        <p class="flow-text" style="color: #4caf50;">+$715,000</p>
      </div>
    </div>
  </div>
  <div class="col s12 m4">
    <div class="card">
      <div class="card-content">
        <span class="card-title">Tax Liability</span>
        <p class="flow-text" style="color: #f44336;">$142,500</p>
      </div>
    </div>
  </div>
</div>
```

**✓ Pattern: Generated metric cards**
```html
<div class="row" id="metrics"></div>
<script>
const metrics = [
  { label: 'Total Assets', value: 2565000, color: 'blue-text' },
  { label: 'Total Gain', value: 715000, color: 'green-text', prefix: '+' },
  { label: 'Tax Liability', value: 142500, color: 'red-text' }
];
$('#metrics').html(metrics.map(m => `
  <div class="col s12 m4">
    <div class="card">
      <div class="card-content">
        <span class="card-title">${m.label}</span>
        <p class="flow-text ${m.color}">${m.prefix || ''}$${m.value.toLocaleString()}</p>
      </div>
    </div>
  </div>
`).join(''));
</script>
```

### Icons

**✓ Pattern: Inline icons with semantic meaning**
```html
<!-- Status indicators -->
<span class="material-symbols-outlined green-text">check_circle</span> Funded
<span class="material-symbols-outlined red-text">error</span> Shortfall
<span class="material-symbols-outlined orange-text">warning</span> Review

<!-- In buttons -->
<a class="btn waves-effect"><i class="material-symbols-outlined left">download</i>Export</a>

<!-- In cards -->
<div class="card-content">
  <span class="card-title"><i class="material-symbols-outlined">account_balance</i> Portfolio</span>
</div>
```

### Responsive Grid

**✓ Pattern: Responsive columns**
```html
<!-- 1 col mobile, 2 col tablet, 3 col desktop -->
<div class="row">
  <div class="col s12 m6 l4"><!-- Card 1 --></div>
  <div class="col s12 m6 l4"><!-- Card 2 --></div>
  <div class="col s12 m6 l4"><!-- Card 3 --></div>
</div>
```

### Complete Report Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Portfolio Report</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" rel="stylesheet">
  <style>
    :root{--gap:1rem}
    .gap-y>*+*{margin-top:var(--gap)}
    .text-right{text-align:right}
    .mono{font-family:'Roboto Mono',monospace}
    .positive{color:#4caf50}
    .negative{color:#f44336}
    table.compact td,table.compact th{padding:8px 12px}
    .metric{font-size:1.5rem;font-weight:500}
  </style>
</head>
<body class="grey lighten-4">
  <nav class="blue darken-2">
    <div class="nav-wrapper container">
      <span class="brand-logo"><i class="material-symbols-outlined left">analytics</i>Portfolio Report</span>
      <span class="right hide-on-small-only" id="date"></span>
    </div>
  </nav>
  
  <main class="container gap-y" style="padding:var(--gap) 0">
    <div class="row" id="summary"></div>
    
    <section class="card">
      <div class="card-content">
        <span class="card-title">Account Holdings</span>
        <table class="striped compact">
          <thead><tr><th>Account</th><th>Type</th><th class="text-right">Balance</th><th class="text-right">Gain</th><th class="text-right">Rate</th></tr></thead>
          <tbody id="holdings"></tbody>
          <tfoot id="totals"></tfoot>
        </table>
      </div>
    </section>
    
    <section class="card">
      <div class="card-content">
        <span class="card-title">Withdrawal Projection</span>
        <table class="striped compact">
          <thead><tr><th>Year</th><th class="text-right">Need</th><th class="text-right">Withdrawal</th><th class="text-right">End Balance</th></tr></thead>
          <tbody id="projection"></tbody>
        </table>
      </div>
    </section>
  </main>
  
  <script src="https://code.jquery.com/jquery-3.7.1.slim.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
  <script>
  // Data
  const data = {
    accounts: [
      { name: 'Taxable', type: 'Brokerage', balance: 1_250_000, gain: 350_000, rate: .18 },
      { name: 'Traditional', type: 'IRA', balance: 890_000, gain: 0, rate: .24 },
      { name: 'Roth', type: 'IRA', balance: 425_000, gain: 0, rate: 0 }
    ],
    projection: [
      { year: 2025, need: 200_000, withdrawal: 200_000, balance: 2_465_000 },
      { year: 2026, need: 205_000, withdrawal: 205_000, balance: 2_428_000 },
      { year: 2027, need: 210_125, withdrawal: 210_125, balance: 2_387_000 }
    ]
  };
  
  // Helpers
  const fmt = n => n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  const pct = n => (n * 100).toFixed(1);
  const cls = n => n >= 0 ? 'positive' : 'negative';
  const sign = n => n >= 0 ? '+' : '';
  
  // Render
  $('#date').text(new Date().toLocaleDateString());
  
  const totals = data.accounts.reduce((t, a) => ({ balance: t.balance + a.balance, gain: t.gain + a.gain }), { balance: 0, gain: 0 });
  
  $('#summary').html([
    { label: 'Total Assets', value: totals.balance, icon: 'account_balance', color: 'blue-text' },
    { label: 'Unrealized Gain', value: totals.gain, icon: 'trending_up', color: 'green-text', signed: true },
    { label: 'Accounts', value: data.accounts.length, icon: 'folder', color: 'grey-text', raw: true }
  ].map(m => `
    <div class="col s12 m4">
      <div class="card">
        <div class="card-content">
          <span class="grey-text"><i class="material-symbols-outlined tiny">${m.icon}</i> ${m.label}</span>
          <p class="metric ${m.color}">${m.signed ? sign(m.value) : ''}${m.raw ? m.value : '$' + fmt(m.value)}</p>
        </div>
      </div>
    </div>
  `).join(''));
  
  $('#holdings').html(data.accounts.map(a => `
    <tr>
      <td>${a.name}</td>
      <td>${a.type}</td>
      <td class="text-right mono">$${fmt(a.balance)}</td>
      <td class="text-right mono ${cls(a.gain)}">${sign(a.gain)}$${fmt(a.gain)}</td>
      <td class="text-right mono">${pct(a.rate)}%</td>
    </tr>
  `).join(''));
  
  $('#totals').html(`
    <tr class="bold">
      <td colspan="2">Total</td>
      <td class="text-right mono">$${fmt(totals.balance)}</td>
      <td class="text-right mono ${cls(totals.gain)}">${sign(totals.gain)}$${fmt(totals.gain)}</td>
      <td></td>
    </tr>
  `);
  
  $('#projection').html(data.projection.map(p => `
    <tr>
      <td>${p.year}</td>
      <td class="text-right mono">$${fmt(p.need)}</td>
      <td class="text-right mono">$${fmt(p.withdrawal)}</td>
      <td class="text-right mono">$${fmt(p.balance)}</td>
    </tr>
  `).join(''));
  </script>
</body>
</html>
```

---

## JavaScript in HTML Reports

Patterns for embedding dynamic JavaScript in HTML reports.

### Data-Driven Rendering

**❌ Anti-pattern: Inline HTML strings with concatenation**
```javascript
var html = '';
for (var i = 0; i < accounts.length; i++) {
  html += '<tr>';
  html += '<td>' + accounts[i].name + '</td>';
  html += '<td>' + accounts[i].balance + '</td>';
  html += '</tr>';
}
document.getElementById('table').innerHTML = html;
```

**✓ Pattern: Template literals with map**
```javascript
const renderTable = accounts => accounts.map(({ name, balance, gain }) => `
  <tr>
    <td>${name}</td>
    <td class="text-right mono">$${balance.toLocaleString()}</td>
    <td class="text-right mono ${gain >= 0 ? 'positive' : 'negative'}">
      ${gain >= 0 ? '+' : ''}$${gain.toLocaleString()}
    </td>
  </tr>
`).join('');

$('#accounts').html(renderTable(data.accounts));
```

### jQuery Chaining

**❌ Anti-pattern: Separate jQuery calls**
```javascript
$('#myTable').addClass('striped');
$('#myTable').addClass('highlight');
$('#myTable').find('th').addClass('center-align');
$('#myTable').find('.amount').addClass('right-align');
$('#myTable').show();
```

**✓ Pattern: Chained methods**
```javascript
$('#myTable')
  .addClass('striped highlight')
  .find('th').addClass('center-align').end()
  .find('.amount').addClass('right-align').end()
  .show();
```

### Event Delegation

**❌ Anti-pattern: Individual handlers**
```javascript
$('#row1').click(function() { handleClick(1); });
$('#row2').click(function() { handleClick(2); });
$('#row3').click(function() { handleClick(3); });
```

**✓ Pattern: Delegated handler with data attributes**
```javascript
// HTML: <tr data-id="1">...</tr>
$('#table').on('click', 'tr[data-id]', function() {
  const id = $(this).data('id');
  handleClick(id);
});
```

### Dynamic Formatting Functions

**✓ Pattern: Composable formatters**
```javascript
const fmt = {
  usd: n => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
  pct: n => `${(n * 100).toFixed(1)}%`,
  signed: n => (n >= 0 ? '+' : '') + fmt.usd(n),
  date: d => new Date(d).toLocaleDateString(),
  cls: n => n >= 0 ? 'positive' : 'negative'
};

// Usage in templates
const row = a => `
  <tr>
    <td>${a.name}</td>
    <td class="text-right mono">${fmt.usd(a.balance)}</td>
    <td class="text-right mono ${fmt.cls(a.gain)}">${fmt.signed(a.gain)}</td>
    <td class="text-right mono">${fmt.pct(a.rate)}</td>
  </tr>
`;
```

### Conditional Rendering

**✓ Pattern: Ternary and && for conditional content**
```javascript
const renderAccount = a => `
  <div class="card ${a.balance < 0 ? 'red lighten-5' : ''}">
    <div class="card-content">
      <span class="card-title">${a.name}</span>
      ${a.warning ? `<p class="orange-text"><i class="material-symbols-outlined tiny">warning</i> ${a.warning}</p>` : ''}
      <p class="metric">${fmt.usd(a.balance)}</p>
      ${a.lastUpdated && `<span class="grey-text small">Updated: ${fmt.date(a.lastUpdated)}</span>`}
    </div>
  </div>
`;
```

### Materialize Component Initialization

**✓ Pattern: Initialize all components at once**
```javascript
$(document).ready(() => {
  // Auto-init all Materialize components
  M.AutoInit();
  
  // Or selective init
  M.Tooltip.init(document.querySelectorAll('.tooltipped'));
  M.Collapsible.init(document.querySelectorAll('.collapsible'));
  M.Modal.init(document.querySelectorAll('.modal'));
});
```

### Responsive Data Handling

**✓ Pattern: Adapt display to data size**
```javascript
const renderProjection = data => {
  const years = data.projection;
  const showAll = years.length <= 10;
  const display = showAll ? years : [...years.slice(0, 5), null, ...years.slice(-3)];
  
  return display.map((p, i) => p ? `
    <tr>
      <td>${p.year}</td>
      <td class="text-right mono">${fmt.usd(p.need)}</td>
      <td class="text-right mono">${fmt.usd(p.balance)}</td>
    </tr>
  ` : `
    <tr class="grey-text"><td colspan="3" class="center-align">... ${years.length - 8} years omitted ...</td></tr>
  `).join('');
};
```

### Complete JS Module Pattern

**✓ Pattern: IIFE with exposed API**
```javascript
const Report = (() => {
  // Private
  const _cache = {};
  
  const _fmt = {
    usd: n => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    pct: n => `${(n * 100).toFixed(1)}%`,
    signed: n => (n >= 0 ? '+' : '') + _fmt.usd(Math.abs(n)),
    cls: n => n >= 0 ? 'positive' : 'negative'
  };
  
  const _renderRow = a => `
    <tr data-id="${a.id}">
      <td>${a.name}</td>
      <td class="text-right mono">${_fmt.usd(a.balance)}</td>
      <td class="text-right mono ${_fmt.cls(a.gain)}">${_fmt.signed(a.gain)}</td>
    </tr>
  `;
  
  // Public API
  return {
    init(data) {
      _cache.data = data;
      this.render();
      this.bindEvents();
    },
    
    render() {
      const { accounts } = _cache.data;
      $('#accounts').html(accounts.map(_renderRow).join(''));
      
      const total = accounts.reduce((t, a) => t + a.balance, 0);
      $('#total').text(_fmt.usd(total));
    },
    
    bindEvents() {
      $('#accounts').on('click', 'tr[data-id]', function() {
        const id = $(this).data('id');
        const acct = _cache.data.accounts.find(a => a.id === id);
        M.toast({ html: `Selected: ${acct.name}` });
      });
    },
    
    fmt: _fmt  // Expose formatters
  };
})();

// Usage
$(document).ready(() => Report.init(reportData));
```

---

## When Verbose is Better

Not all compression improves code. Preserve verbosity when:

### Complex Conditionals with Side Effects

```javascript
// ❌ Compact is bad
const process = x => x < 0 ? (log('neg'), fix(x)) : x > 100 ? (log('cap'), cap(x)) : x;

// ✓ Verbose is good
const process = x => {
  if (x < 0) {
    log('Negative value:', x);
    return fix(x);
  }
  if (x > 100) {
    log('Exceeds cap:', x);
    return cap(x);
  }
  return x;
};
```

### Tax Rules Requiring Citation

```javascript
// ❌ Compact is bad — rule unclear
const niit = magi > 250000 && inv > 0 ? Math.min(inv, magi - 250000) * .038 : 0;

// ✓ Verbose is good — rule documented
// NIIT (Net Investment Income Tax) - IRC §1411
// 3.8% on lesser of: (a) net investment income, or (b) MAGI exceeding threshold
// Thresholds: $250K MFJ, $200K single, $125K MFS
const niitThresh = filing === 'mfj' ? 250_000 : filing === 'single' ? 200_000 : 125_000;
const niitBase = Math.min(inv, Math.max(0, magi - niitThresh));
const niit = niitBase * 0.038;
```

### Debugging Complex Chains

```javascript
// ❌ Compact is bad when debugging
const result = items.filter(valid).map(transform).reduce(aggregate, init);

// ✓ Verbose is good temporarily
const filtered = items.filter(valid);
console.log('After filter:', filtered.length);

const mapped = filtered.map(transform);
console.log('After transform:', mapped);

const result = mapped.reduce(aggregate, init);
```

### Multi-Step Calculations with Audit Requirements

```python
# ❌ Compact is bad — no audit trail
tax = sum(min(inc - f, c - f) * r for f, c, r in brackets if inc > f)

# ✓ Verbose is good — auditable
tax, audit = 0, []
for floor, ceiling, rate in brackets:
    if inc <= floor:
        continue
    taxable = min(inc, ceiling) - floor
    bracket_tax = taxable * rate
    tax += bracket_tax
    audit.append({'bracket': rate, 'taxable': taxable, 'tax': bracket_tax})
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ YAML                                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✓ Short keys: ordi, ltcg, inf, gr                                          │
│ ✓ Inline types: { type: USD, constraint: "> 0" }                           │
│ ✓ Symbolic formulas: "gain × rate"                                         │
│ ✓ Concrete test vectors with exact values                                  │
│ ✗ Prose descriptions                                                        │
│ ✗ Repeated structure                                                        │
│ ✗ Missing tests                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ JavaScript (ES6+)                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✓ Destructure chains: const {a, b} = x, {c} = b, arr = [];                 │
│ ✓ Arrows: x => x * 2, ({a, b}) => a + b                                    │
│ ✓ Shorthand: {a, b}, spread: {...x, ...y}                                  │
│ ✓ Ternary chains (≤5 levels), ?., ??, ||=, ??=                             │
│ ✓ Array methods: map, filter, reduce, find, flatMap, some, every           │
│ ✓ Numeric separators: 250_000                                              │
│ ✓ Private fields: #field, static #config                                   │
│ ✓ Generators: function*, yield, yield*, for...of                           │
│ ✓ Async: async/await, Promise.all, Promise.allSettled                      │
│ ✓ Guard: const require = (c,m) => {if(!c) throw new Error(m)};             │
│ ✗ var, for loops (when array methods work), function keyword               │
│ ✗ Single-use intermediates, redundant property names: {a: a}               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Python                                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✓ Short names: inf, gr, val (avoid shadowing: ord, sum, list, id, type)    │
│ ✓ Unpacking: a, b, *rest = items                                           │
│ ✓ Comprehensions: [x for x in items if valid(x)]                           │
│ ✓ Generators: yield, yield from, generator expressions                     │
│ ✓ Async generators: async for, async with                                  │
│ ✓ Defaults: def f(x, rate=.25):                                            │
│ ✓ Walrus: [y for x in items if (y := calc(x)) > 0]                         │
│ ✓ f-strings: f'{rate:.1%} on ${gross:,.0f}'                                │
│ ✓ Dataclasses (frozen=True), __slots__, Protocol                           │
│ ✗ Verbose loops for list building                                          │
│ ✗ Manual dict grouping, repeated None checks                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ HTML / Material Design                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✓ Materialize CSS via CDN (not custom duplicates)                          │
│ ✓ Semantic HTML5: <main>, <section>, <nav>, <article>                      │
│ ✓ Utility classes: .text-right, .mono, .positive, .negative                │
│ ✓ CSS custom properties: :root{--gap:1rem}                                 │
│ ✓ Data attributes for JS hooks: data-id, data-action                       │
│ ✓ Template literals for dynamic HTML                                        │
│ ✓ jQuery chaining: $('#t').addClass('x').find('y').end()                   │
│ ✓ Event delegation: .on('click', '[data-id]', fn)                          │
│ ✓ M.AutoInit() for components                                               │
│ ✗ Inline styles (use classes)                                               │
│ ✗ Repeated markup (generate with JS)                                        │
│ ✗ Multiple <style>/<script> blocks                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Embedding in Prompts

### Full Version
Include this entire document in system prompts or project instructions.

### Compact Version
```
CODE_STYLE:
  yaml: "Specs only—formulas=pseudocode, tests=contracts, generate code FROM specs"
  js: "ES6+: destructure chains, arrows, shorthand, spread, ?. ?? ||= ??=, 
       array methods, generators, async/await, private #fields, require() guard"
  python: "Short names (no shadows), unpacking, comprehensions, generators, 
           walrus :=, f-strings, dataclasses, Protocol, __slots__"
  html: "Materialize CDN, semantic HTML5, utility classes, CSS vars, 
         data-* attributes, template literals, jQuery chains, event delegation"
  avoid: "var, verbose loops, single-use vars, inline styles, repeated markup"
```

### Minimal Version
```
CODE: YAML=specs. JS=ES6+ (destructure, arrows, spread, ?., generators, async, #private). 
Python=comprehensions, generators, walrus, dataclasses. HTML=Materialize, semantic, utilities.
```
