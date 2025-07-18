# Ultra Fat FIRE Analysis Framework - Complete Expert System

## EXECUTION WORKFLOW

### Phase 1: Document Analysis & Data Extraction
**YOU MUST:**
1. Read all uploaded client documents thoroughly
2. Extract ONLY discrete values - never use summary values or pre-calculated totals
3. Create individual entries for each option grant, RSU grant, and stock position
4. Research current market prices independently from multiple sources
5. Populate the complete clientData structure with extracted values

### Phase 2: Price Research (MANDATORY)
**YOU MUST:**
1. Identify all unique ticker symbols from options, RSUs, and stock positions
2. Research current prices from at least 3 sources (Yahoo Finance, Google Finance, MarketWatch)
3. Verify prices are within $0.50 across all sources
4. Use most recent prices (within last trading day)
5. Update all currentStockPrice and currentPrice fields with researched values

### Phase 3: Expert Analysis Execution
**YOU MUST:**
1. Execute all 11 experts in dependency order
2. Preserve complete state flow - each expert receives clientData + prior expert results
3. Validate dependencies before each expert execution
4. Track context flow and state transitions
5. Handle errors with full state context

### Phase 4: Final Integration & Reporting
**YOU MUST:**
1. Integrate all expert results with complete client context
2. Show naive vs actual value calculations with percentage reductions
3. Provide client-specific risk assessments and recommendations
4. Include implementation dependencies and expected outcomes
5. Generate comprehensive final determination with confidence level

---

## EXPERT SYSTEM ROLES & RESPONSIBILITIES

### Expert 1: Portfolio Valuation Specialist
**AUTHORITY:** Final authority on all asset valuations
**RESPONSIBILITIES:**
- Execute same-day sale calculations for all option grants
- Calculate RSU values with tax withholding reality
- Show dramatic value reduction vs naive assumptions
- Provide foundation portfolio valuation for all other experts

### Expert 2: Tax & Estate Planning Strategist
**AUTHORITY:** Tax optimization and estate planning strategy
**RESPONSIBILITIES:**
- Roth conversion optimization based on current tax brackets
- Estate tax analysis with TCJA sunset risk assessment
- Urgency level determination for tax planning actions

### Expert 3: Expense Modeling & Healthcare Specialist
**AUTHORITY:** Comprehensive expense projection
**RESPONSIBILITIES:**
- Age-adjusted healthcare cost projections
- Medicare transition analysis
- Complete annual expense calculations for withdrawal rate analysis

### Expert 4: Asset Allocation & Risk Management Specialist
**AUTHORITY:** Portfolio optimization and risk assessment
**RESPONSIBILITIES:**
- Monte Carlo simulation (10,000 iterations, 40-year horizon)
- Withdrawal rate calculations and risk categorization
- Age and portfolio-size adjusted asset allocation recommendations

### Expert 5: Withdrawal Strategy & Implementation Specialist
**AUTHORITY:** Tax-efficient withdrawal sequencing
**RESPONSIBILITIES:**
- Tax-efficient withdrawal sequence design
- Implementation timeline with immediate, short-term, and ongoing actions
- Effective tax rate projections

### Expert 6: Financial Disruption & Life Event Specialist
**AUTHORITY:** Risk assessment and contingency planning
**RESPONSIBILITIES:**
- Major risk probability and impact analysis
- Contingency fund calculations
- Mitigation strategy recommendations

### Expert 7: Tax Policy & Legislative Change Specialist
**AUTHORITY:** Legislative risk assessment
**RESPONSIBILITIES:**
- TCJA sunset impact analysis with day countdown
- State tax risk assessment
- Legislative urgency level determination

### Expert 8: Geographic Arbitrage & Location Optimization Specialist
**AUTHORITY:** Location-based tax optimization
**RESPONSIBILITIES:**
- State tax comparison analysis
- Alternative location recommendations
- Annual savings projections and relocation recommendations

### Expert 9: Alternative Investment Access Specialist
**AUTHORITY:** Alternative investment allocation
**RESPONSIBILITIES:**
- Portfolio size-based alternative investment access determination
- Expected return improvement calculations
- Access level categorization (FULL/MODERATE/LIMITED)

### Expert 10: Business Exit Strategy Specialist
**AUTHORITY:** Business interest valuation and exit planning
**RESPONSIBILITIES:**
- Business concentration risk assessment
- Exit strategy analysis (strategic sale vs earnout)
- Timeline and net proceeds projections

### Expert 11: Sequence of Returns Risk Specialist
**AUTHORITY:** Early retirement sequence risk mitigation
**RESPONSIBILITIES:**
- Bond tent strategy design
- Cash buffer requirements
- Mitigation score calculation and risk level determination

---

## STATE MANAGEMENT REQUIREMENTS

### Critical State Flow Rules:
1. **clientData Immutability:** Original clientData must flow through all experts unchanged
2. **Dependency Validation:** Each expert must validate required dependencies before execution
3. **Context Preservation:** All expert results must include complete client context
4. **Error Handling:** Failed expert execution must provide full state context for debugging
5. **Completion Validation:** All 11 experts must complete successfully before final integration

### State Transition Tracking:
- Track input context, output context, and dependencies for each expert
- Maintain execution status and timestamps
- Preserve error logs with expert context
- Validate state integrity at each transition point

---

## IMPLEMENTATION CODE

```javascript
// Ultra-compact logging with method chaining and token efficiency
const L = {
  s: (title, data = {}) => console.log(`\n=== ${title} ===`, 
    Object.entries(data).map(([k,v]) => `${k}: ${typeof v === 'number' ? v.toLocaleString() : v}`).join('\n')),
  b: (title, items) => console.log(`\n💸 ${title}:`, 
    items.map(({label, value, format = 'currency'}) => 
      `${label}: ${format === 'currency' ? value.toLocaleString() : 
                  format === 'percent' ? `${value.toFixed(2)}%` : value}`).join('\n')),
  c: (title, naive, actual) => {
    const destroyed = naive - actual, pct = (destroyed / naive) * 100;
    console.log(`\n📊 ${title}:\n❌ Naive: ${naive.toLocaleString()}\n✅ Actual: ${actual.toLocaleString()}\n💸 Destroyed: ${destroyed.toLocaleString()}\n📉 Reduction: ${pct.toFixed(1)}%`);
    return { destroyed, pct };
  },
  r: (risks) => console.log(`\n⚠️ RISKS:`, risks.map(r => `${r.risk}: ${r.probability}%/${r.impact.toLocaleString()}${r.context ? ` - ${r.context}` : ''}`).join('\n')),
  a: (actions) => console.log(`\n🎯 ACTIONS:`, actions.map((a,i) => `${i+1}. ${a.action}: ${a.amount.toLocaleString()} [${a.urgency}]${a.context ? ` - ${a.context}` : ''}`).join('\n')),
  warn: (msg) => console.log(`\n⚠️ WARNING: ${msg}`),
  error: (msg) => console.log(`\n❌ ERROR: ${msg}`)
};

// Client data structure with validation
const createClientData = (extracted) => {
  const data = {
    profile: { 
      name: extracted.profile.name,
      age: extracted.profile.age,
      spouseName: extracted.profile.spouseName,
      spouseAge: extracted.profile.spouseAge,
      plannedRetirementDate: extracted.profile.plannedRetirementDate,
      currentAnnualIncome: extracted.profile.currentAnnualIncome,
      location: {
        city: extracted.profile.location.city,
        state: extracted.profile.location.state, 
        zip: extracted.profile.location.zip
      },
      filingStatus: extracted.profile.filingStatus,
      currentFederalTaxBracket: extracted.profile.currentFederalTaxBracket,
      currentStateTaxRate: extracted.profile.currentStateTaxRate,
      riskTolerance: extracted.profile.riskTolerance || 'moderate',
      retirementAge: extracted.profile.retirementAge
    },
    
    taxRates: { 
      federal: extracted.taxRates.federal,
      state: extracted.taxRates.state,
      fica: 7.65, medicareSurtax: 0.9,
      longTermCapitalGains: extracted.taxRates.federal + extracted.taxRates.state + 3.8,
      shortTermCapitalGains: extracted.taxRates.federal + extracted.taxRates.state + 15.55
    },
    
    optionGrants: extracted.optionGrants.map((g,i) => ({
      grantId: `OPT_${i+1}_${g.grantDate?.replace(/-/g, '')}`,
      grantType: g.grantType,
      ticker: g.ticker,
      strikePrice: g.strikePrice,
      totalGranted: g.totalGranted,
      vestedShares: g.vestedShares,
      unvestedShares: g.unvestedShares,
      grantDate: g.grantDate,
      expirationDate: g.expirationDate,
      vestingSchedule: g.vestingSchedule,
      currentStockPrice: 0 // MUST BE RESEARCHED
    })),
    
    rsuGrants: extracted.rsuGrants.map((g,i) => ({
      grantId: `RSU_${i+1}_${g.grantDate?.replace(/-/g, '')}`,
      grantType: 'RSU',
      ticker: g.ticker,
      totalGranted: g.totalGranted,
      vestedShares: g.vestedShares,
      unvestedShares: g.unvestedShares,
      grantDate: g.grantDate,
      vestingSchedule: g.vestingSchedule,
      currentStockPrice: 0, // MUST BE RESEARCHED
      withholdingRates: { federal: 22, state: extracted.taxRates.state, fica: 7.65 }
    })),
    
    stockPositions: extracted.stockPositions.map((p,i) => ({
      positionId: `STOCK_${i+1}_${p.ticker}`,
      ticker: p.ticker,
      companyName: p.companyName,
      shares: p.shares,
      purchasePrice: p.purchasePrice,
      purchaseDate: p.purchaseDate,
      costBasis: p.costBasis,
      currentPrice: 0, // MUST BE RESEARCHED
      holdingPeriod: Math.floor((new Date() - new Date(p.purchaseDate)) / 86400000)
    })),
    
    retirementAccounts: extracted.retirementAccounts,
    businessInterests: extracted.businessInterests || [],
    expenses: extracted.expenses,
    currentCash: extracted.currentCash || 0
  };
  
  // Validate required fields
  const required = ['profile.name', 'profile.age', 'profile.location.state', 'taxRates.federal', 'taxRates.state'];
  const missing = required.filter(field => !field.split('.').reduce((o, k) => o?.[k], data));
  if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);
  
  return data;
};

// Price Research System
const PriceResearch = {
  async getCurrentPrice(ticker) {
    L.s('PRICE RESEARCH REQUIRED', { ticker });
    L.warn('MANDATORY: Research current stock prices from multiple sources');
    L.warn('Sources to check: Yahoo Finance, Google Finance, MarketWatch, Bloomberg');
    L.warn('MUST verify price accuracy within $0.50 across all sources');
    L.error('DO NOT use any price from uploaded documents');
    
    const price = 0; // MUST BE REPLACED WITH ACTUAL RESEARCHED PRICE
    if (!price) throw new Error(`Price research required for ${ticker}`);
    
    L.s('PRICE VERIFIED', { ticker, price, sources: 'verified from 3+ sources' });
    return price;
  },
  
  async researchAll(clientData) {
    L.s('PRICE RESEARCH PROTOCOL', { message: 'Must research current prices for all equity positions' });
    
    const tickers = [...new Set([
      ...clientData.optionGrants.map(g => g.ticker),
      ...clientData.rsuGrants.map(g => g.ticker),
      ...clientData.stockPositions.map(s => s.ticker)
    ].filter(Boolean))];
    
    L.s('TICKERS REQUIRING RESEARCH', { count: tickers.length, tickers: tickers.join(', ') });
    
    const prices = new Map();
    for (const ticker of tickers) prices.set(ticker, await this.getCurrentPrice(ticker));
    return prices;
  }
};

// Same-Day Sale Calculator
const OptionAnalyzer = {
  calculateSameDaySale: (grant, taxRates) => {
    const { grantId, grantType, strikePrice, vestedShares, ticker } = grant;
    const { federal, state, fica, medicareSurtax } = taxRates;
    
    L.s('SAME-DAY SALE CALCULATION', { grantId, grantType, strikePrice, vestedShares });
    L.warn('Same-day sale analysis shows dramatic value reduction vs naive calculations');
    
    const currentPrice = PriceResearch.getCurrentPrice(ticker);
    
    // Step 1: Naive calculation (wrong)
    const naive = vestedShares * (currentPrice - strikePrice);
    L.s('NAIVE INTRINSIC VALUE (WRONG)', { 
      calculation: `${vestedShares.toLocaleString()} × (${currentPrice} - ${strikePrice})`,
      result: naive,
      warning: 'This is what most people think their options are worth - but it is WRONG!'
    });
    
    // Step 2: Actual calculation (correct)
    const costs = { 
      exercise: vestedShares * strikePrice, 
      fees: 25,
      get total() { return this.exercise + this.fees; }
    };
    
    const proceeds = {
      gross: vestedShares * currentPrice,
      secFees: Math.min(vestedShares * currentPrice * 0.0000231, 7.95),
      brokerageFees: 0,
      get totalFees() { return this.secFees + this.brokerageFees; }
    };
    
    const taxableGain = proceeds.gross - costs.exercise;
    const combinedTaxRate = federal + state + fica + medicareSurtax;
    
    const taxes = {
      federal: taxableGain * (federal / 100),
      state: taxableGain * (state / 100),
      fica: taxableGain * (fica / 100),
      medicare: taxableGain * (medicareSurtax / 100),
      get total() { return this.federal + this.state + this.fica + this.medicare; }
    };
    
    const netCash = proceeds.gross - costs.total - proceeds.totalFees - taxes.total;
    
    L.b('LIQUIDITY REQUIREMENT', [
      { label: 'Exercise Cost', value: costs.exercise },
      { label: 'Exercise Fees', value: costs.fees },
      { label: 'TOTAL CASH REQUIRED', value: costs.total }
    ]);
    
    L.b('TAX BREAKDOWN', [
      { label: 'Federal Tax', value: taxes.federal },
      { label: 'State Tax', value: taxes.state },
      { label: 'FICA Tax', value: taxes.fica },
      { label: 'Medicare Surtax', value: taxes.medicare },
      { label: 'Combined Rate', value: combinedTaxRate, format: 'percent' },
      { label: 'TOTAL TAX LIABILITY', value: taxes.total }
    ]);
    
    const comparison = L.c('VALUE REDUCTION ANALYSIS', naive, netCash);
    
    if (comparison.pct > 50) {
      L.warn('Over 50% value reduction due to same-day sale!');
    }
    
    return {
      grantId, grantType, vestedShares, strikePrice, currentPrice, naive, costs, proceeds,
      taxes, taxableGain, netCash, overvaluation: comparison.destroyed, overvaluationPct: comparison.pct
    };
  }
};

// RSU Value Calculator
const RSUAnalyzer = {
  calculateRSUValue: (grant, taxRates) => {
    const { grantId, vestedShares, ticker, withholdingRates } = grant;
    const { federal, state, fica, medicareSurtax } = taxRates;
    
    L.s('RSU VALUATION', { grantId, vestedShares });
    L.warn('RSU analysis shows significant value reduction due to tax withholding');
    
    const currentPrice = PriceResearch.getCurrentPrice(ticker);
    const naive = vestedShares * currentPrice;
    
    L.s('NAIVE MARKET VALUE (WRONG)', { 
      calculation: `${vestedShares.toLocaleString()} × ${currentPrice}`,
      result: naive,
      warning: 'This is what most people think their RSUs are worth - but it is WRONG!'
    });
    
    const withholding = {
      federal: withholdingRates.federal,
      state: withholdingRates.state,
      fica: withholdingRates.fica,
      get totalRate() { return this.federal + this.state + this.fica; },
      get dollarAmount() { return naive * (this.totalRate / 100); }
    };
    
    const sharesWithheld = Math.floor(withholding.dollarAmount / currentPrice);
    const netShares = vestedShares - sharesWithheld;
    const netShareValue = netShares * currentPrice;
    
    const actualTaxRate = federal + state + fica + medicareSurtax;
    const actualTaxLiability = naive * (actualTaxRate / 100);
    const additionalTax = Math.max(0, actualTaxLiability - withholding.dollarAmount);
    
    const transactionCosts = naive * 0.0000231;
    const finalNet = netShareValue - additionalTax - transactionCosts;
    
    L.b('TAX WITHHOLDING AT VESTING', [
      { label: 'Federal Withholding', value: withholding.federal, format: 'percent' },
      { label: 'State Withholding', value: withholding.state, format: 'percent' },
      { label: 'FICA Withholding', value: withholding.fica, format: 'percent' },
      { label: 'TOTAL WITHHOLDING RATE', value: withholding.totalRate, format: 'percent' },
      { label: 'Dollar Withholding', value: withholding.dollarAmount }
    ]);
    
    const comparison = L.c('RSU VALUE REDUCTION ANALYSIS', naive, finalNet);
    
    return {
      grantId, vestedShares, currentPrice, naive, withholding, sharesWithheld,
      netShares, netShareValue, additionalTax, transactionCosts, finalNet,
      overvaluation: comparison.destroyed, overvaluationPct: comparison.pct
    };
  }
};

// Monte Carlo Simulator
const MonteCarloSimulator = {
  generateRandomReturn: (mean, std) => {
    const [u1, u2] = [Math.random(), Math.random()];
    return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  },
  
  runSimulation: (portfolio, expenses, years, iterations = 10000) => {
    L.s('MONTE CARLO SIMULATION', { portfolio, expenses, years, iterations });
    
    const results = Array.from({ length: iterations }, () => {
      let p = portfolio, e = expenses;
      for (let y = 0; y < years; y++) {
        const returns = {
          stock: this.generateRandomReturn(0.085, 0.16),
          bond: this.generateRandomReturn(0.045, 0.04),
          inflation: this.generateRandomReturn(0.025, 0.015)
        };
        
        const portfolioReturn = (returns.stock * 0.70) + (returns.bond * 0.30);
        p = p * (1 + portfolioReturn) - e;
        e *= (1 + returns.inflation);
        
        if (p <= 0) return { success: false, final: 0 };
      }
      return { success: true, final: p };
    });
    
    const successRate = results.filter(r => r.success).length / iterations * 100;
    const finals = results.map(r => r.final).sort((a,b) => a-b);
    
    const result = {
      successRate,
      percentiles: {
        p10: finals[Math.floor(iterations * 0.1)],
        p50: finals[Math.floor(iterations * 0.5)],
        p90: finals[Math.floor(iterations * 0.9)]
      }
    };
    
    L.s('SIMULATION RESULTS', { 
      successRate: `${successRate.toFixed(1)}%`,
      p10: result.percentiles.p10,
      p50: result.percentiles.p50,
      p90: result.percentiles.p90
    });
    
    return result;
  }
};

// Expert System
class Expert {
  constructor(id, name, deps = [], exec) {
    Object.assign(this, { id, name, deps, exec });
  }
  
  analyze(clientData, results) {
    const missing = this.deps.filter(d => !results[d]);
    if (missing.length) throw new Error(`Expert ${this.id} missing dependencies: ${missing.join(', ')}`);
    
    L.s(`EXPERT ${this.id}: ${this.name}`, { dependencies: this.deps.length ? this.deps.join(', ') : 'None' });
    
    const result = this.exec(clientData, results);
    return { expertId: this.id, clientData, ...result };
  }
}

// Expert definitions
const experts = [
  new Expert(1, 'PORTFOLIO VALUATION SPECIALIST', [], (clientData) => {
    const { optionGrants, rsuGrants, retirementAccounts } = clientData;
    
    const optionResults = optionGrants.map(g => OptionAnalyzer.calculateSameDaySale(g, clientData.taxRates));
    const rsuResults = rsuGrants.map(g => RSUAnalyzer.calculateRSUValue(g, clientData.taxRates));
    
    const summary = {
      totalOptionsNet: optionResults.reduce((s, r) => s + r.netCash, 0),
      totalRSUNet: rsuResults.reduce((s, r) => s + r.finalNet, 0),
      totalCashReq: optionResults.reduce((s, r) => s + r.costs.total, 0),
      retirementTotal: retirementAccounts.reduce((s, a) => s + a.balance, 0)
    };
    
    summary.totalFireEligible = summary.totalOptionsNet + summary.totalRSUNet + summary.retirementTotal;
    summary.concentrationRisk = ((summary.totalOptionsNet + summary.totalRSUNet) / summary.totalFireEligible) * 100;
    
    return { 
      portfolioResults: { optionResults, rsuResults, summary }, 
      totalFireEligible: summary.totalFireEligible, 
      concentrationRisk: summary.concentrationRisk,
      liquidityRequirements: summary.totalCashReq
    };
  }),
  
  new Expert(2, 'TAX & ESTATE PLANNING STRATEGIST', ['expert1'], (clientData, { expert1 }) => {
    const { taxRates, retirementAccounts, businessInterests = [] } = clientData;
    
    const currentBracket = taxRates.federal + taxRates.state;
    const traditionalBalance = retirementAccounts
      .filter(a => a.accountType.includes('Traditional'))
      .reduce((s, a) => s + a.balance, 0);
    const optimalConversion = Math.min(50000, traditionalBalance * 0.15);
    
    const totalNetWorth = expert1.totalFireEligible + 
      businessInterests.reduce((s, b) => s + b.estimatedValue, 0);
    const estateTaxRisk = Math.max(0, totalNetWorth - 7000000) * 0.40;
    
    return { 
      optimalConversion, estateTaxRisk, totalNetWorth,
      urgencyLevel: estateTaxRisk > 0 ? 'CRITICAL' : 'LOW'
    };
  }),
  
  new Expert(3, 'EXPENSE MODELING & HEALTHCARE SPECIALIST', ['expert1'], (clientData) => {
    const { expenses, profile } = clientData;
    const { housing, healthcare, other } = expenses;
    
    const annualHousing = housing.monthlyPayment * 12 + (housing.propertyTax || 0) + 
                         (housing.insurance || 0) + (housing.utilities || 0) + (housing.maintenance || 0);
    
    const yearsToMedicare = Math.max(0, 65 - profile.age);
    const currentHealthcare = healthcare.currentPremium + healthcare.estimatedMedicalExpenses + healthcare.prescriptionCosts;
    const projectedHealthcare = currentHealthcare * Math.pow(1.065, yearsToMedicare);
    
    const annualOther = other.food + other.insurance + other.discretionary;
    const totalAnnualExpenses = annualHousing + projectedHealthcare + annualOther;
    
    return { 
      totalAnnualExpenses, housing: annualHousing, healthcare: projectedHealthcare, 
      other: annualOther, yearsToMedicare 
    };
  }),
  
  new Expert(4, 'ASSET ALLOCATION & RISK MANAGEMENT SPECIALIST', ['expert1', 'expert3'], (clientData, { expert1, expert3 }) => {
    const monteCarloResults = MonteCarloSimulator.runSimulation(
      expert1.totalFireEligible, expert3.totalAnnualExpenses, 40, 10000
    );
    
    const withdrawalRate = (expert3.totalAnnualExpenses / expert1.totalFireEligible) * 100;
    const recommendedEquity = Math.max(50, Math.min(85, 70 - (clientData.profile.age - 50) * 0.5 + 
      (expert1.totalFireEligible > 10000000 ? 5 : 0)));
    const riskAssessment = withdrawalRate <= 3.5 ? 'CONSERVATIVE' : 
                          withdrawalRate <= 4.0 ? 'MODERATE' : 'AGGRESSIVE';
    
    return { monteCarloResults, withdrawalRate, recommendedEquity, riskAssessment };
  })
];

// Generate experts 5-11 with template system
const generateExpert = (id, name, deps, config) => new Expert(id, name, deps, 
  typeof config === 'function' ? config : (clientData, results) => config({ clientData, results }));

experts.push(
  generateExpert(5, 'WITHDRAWAL STRATEGY & IMPLEMENTATION SPECIALIST', ['expert1', 'expert2', 'expert3', 'expert4'], 
    ({ results: { expert1, expert2 } }) => ({
      withdrawalSequence: ['Taxable', 'Traditional', 'Roth', 'HSA'],
      effectiveTaxRate: 15,
      implementationPlan: {
        immediate: [`Execute equity liquidation: ${(expert1.portfolioResults.summary.totalOptionsNet + expert1.portfolioResults.summary.totalRSUNet).toLocaleString()}`],
        ongoing: ['Annual rebalancing', 'Tax-loss harvesting', 'Withdrawal monitoring']
      }
    })),
  
  generateExpert(6, 'FINANCIAL DISRUPTION & LIFE EVENT SPECIALIST', ['expert1', 'expert3'], 
    ({ clientData, results: { expert1, expert3 } }) => ({
      majorRisks: {
        health: { probability: clientData.profile.age > 50 ? 25 : 15, impact: 500000 },
        market: { probability: 30, impact: expert1.totalFireEligible * 0.35 },
        inflation: { probability: 40, impact: expert3.totalAnnualExpenses * 0.5 }
      },
      contingencyFund: Math.max(expert3.totalAnnualExpenses * 3, 500000, 200000)
    })),
  
  generateExpert(7, 'TAX POLICY & LEGISLATIVE CHANGE SPECIALIST', ['expert2'], 
    ({ clientData, results: { expert2 } }) => ({
      tcjaSunsetImpact: {
        additionalTax: clientData.profile.currentAnnualIncome * 0.025,
        estateTaxIncrease: expert2.estateTaxRisk,
        daysRemaining: Math.floor((new Date('2025-12-31') - new Date()) / 86400000)
      },
      urgencyLevel: 'CRITICAL'
    })),
  
  generateExpert(8, 'GEOGRAPHIC ARBITRAGE & LOCATION OPTIMIZATION SPECIALIST', [], 
    ({ clientData }) => {
      const currentTax = clientData.profile.currentAnnualIncome * (clientData.taxRates.state / 100);
      const alternatives = [
        { location: 'Austin, TX', savings: currentTax },
        { location: 'Nashville, TN', savings: currentTax },
        { location: 'Miami, FL', savings: currentTax }
      ];
      const best = alternatives.reduce((b, c) => c.savings > b.savings ? c : b);
      return { currentTax, alternatives, best, recommendation: best.savings > 50000 ? 'RELOCATE' : 'STAY' };
    }),
  
  generateExpert(9, 'ALTERNATIVE INVESTMENT ACCESS SPECIALIST', ['expert1'], 
    ({ results: { expert1 } }) => {
      const allocation = expert1.totalFireEligible >= 25000000 ? 0.35 : 
                        expert1.totalFireEligible >= 10000000 ? 0.25 : 0.15;
      return { allocation, value: expert1.totalFireEligible * allocation, expectedImprovement: allocation * 0.02 };
    }),
  
  generateExpert(10, 'BUSINESS EXIT STRATEGY SPECIALIST', ['expert1'], 
    ({ clientData, results: { expert1 } }) => {
      if (!clientData.businessInterests?.length) return { hasBusinessInterests: false, businessValue: 0 };
      const totalValue = clientData.businessInterests.reduce((s, b) => s + b.estimatedValue, 0);
      const concentration = totalValue / (expert1.totalFireEligible + totalValue) * 100;
      return { hasBusinessInterests: true, totalValue, concentration, recommended: 'strategicSale' };
    }),
  
  generateExpert(11, 'SEQUENCE OF RETURNS RISK SPECIALIST', ['expert3', 'expert4'], 
    ({ clientData, results: { expert3, expert4 } }) => {
      const yearsToSS = Math.max(0, 62 - (clientData.profile.retirementAge || 50));
      const criticalYears = Math.min(10, yearsToSS);
      const cashBuffer = { amount: expert3.totalAnnualExpenses * 3, years: 3 };
      const mitigationScore = 100 - (expert4.withdrawalRate > 4 ? 20 : 0) + (criticalYears >= 3 ? 10 : 0);
      return { yearsToSS, criticalYears, cashBuffer, mitigationScore };
    })
);

// State Management
class AnalysisState {
  constructor(clientData) {
    this.clientData = clientData;
    this.results = {};
    this.status = {};
    this.flow = {};
    this.errors = [];
  }
  
  execute(expert) {
    try {
      this.results[`expert${expert.id}`] = expert.analyze(this.clientData, this.results);
      this.status[`expert${expert.id}`] = 'COMPLETED';
      this.flow[`expert${expert.id}`] = { deps: expert.deps, completed: true };
      return this.results[`expert${expert.id}`];
    } catch (error) {
      this.errors.push({ expert: expert.id, error: error.message });
      L.error(`Expert ${expert.id} failed: ${error.message}`);
      throw error;
    }
  }
  
  validateCompletion() {
    const expectedExperts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const missing = expectedExperts.filter(num => !this.results[`expert${num}`]);
    if (missing.length) throw new Error(`Missing expert results: ${missing.join(', ')}`);
    return true;
  }
}

// Master Analyzer
class UltraFatFireAnalyzer {
  async execute(clientData) {
    const state = new AnalysisState(clientData);
    
    L.s('ULTRA FAT FIRE ANALYSIS INITIATED', {
      client: clientData.profile.name,
      age: clientData.profile.age,
      location: `${clientData.profile.location.city}, ${clientData.profile.location.state}`
    });
    
    // Execute all experts
    for (const expert of experts) {
      state.execute(expert);
    }
    
    state.validateCompletion();
    return this.integrate(state);
  }
  
  integrate(state) {
    const { expert1, expert2, expert3, expert4, expert6, expert7, expert8, expert10, expert11 } = state.results;
    
    const integrated = {
      portfolioValue: expert1.totalFireEligible + (expert10.hasBusinessInterests ? expert10.totalValue : 0),
      adjustedPortfolio: expert1.totalFireEligible,
      annualExpenses: expert3.totalAnnualExpenses,
      withdrawalRate: expert4.withdrawalRate,
      successRate: expert4.monteCarloResults.successRate,
      
      majorRisks: [
        { 
          risk: 'Market Crash', probability: 30, impact: expert1.totalFireEligible * 0.35,
          context: `Age ${state.clientData.profile.age}, ${expert4.withdrawalRate.toFixed(1)}% withdrawal rate`
        },
        { 
          risk: 'Sequence Risk', probability: 25, impact: expert3.totalAnnualExpenses * 5,
          context: `${expert11.yearsToSS} years to SS, ${expert11.mitigationScore}/100 score`
        },
        { 
          risk: 'Tax Policy', probability: 80, impact: expert7.tcjaSunsetImpact.additionalTax * 10,
          context: `${expert7.tcjaSunsetImpact.daysRemaining} days to TCJA sunset`
        }
      ],
      
      criticalActions: [
        {
          action: 'Execute equity liquidation',
          amount: expert1.portfolioResults.summary.totalOptionsNet + expert1.portfolioResults.summary.totalRSUNet,
          urgency: 'IMMEDIATE',
          context: `${state.clientData.optionGrants.length} options, ${state.clientData.rsuGrants.length} RSUs`
        },
        {
          action: 'Implement Roth conversion',
          amount: expert2.optimalConversion,
          urgency: 'IMMEDIATE',
          context: `${state.clientData.taxRates.federal}% federal, ${state.clientData.taxRates.state}% state`
        },
        {
          action: expert8.recommendation === 'RELOCATE' ? `Relocate to ${expert8.best.location}` : 'Optimize location',
          amount: expert8.best.savings,
          urgency: 'HIGH',
          context: `Current: ${state.clientData.profile.location.city}, ${state.clientData.profile.location.state}`
        }
      ]
    };
    
    const feasible = integrated.adjustedPortfolio >= 5000000 && 
                    integrated.withdrawalRate <= 4.0 && 
                    integrated.successRate >= 90.0;
    
    const confidence = integrated.successRate >= 95 ? 'HIGH' : 
                      integrated.successRate >= 85 ? 'MEDIUM' : 'LOW';
    
    L.s('FINAL DETERMINATION', {
      client: state.clientData.profile.name,
      feasible: feasible ? 'YES' : 'NO',
      confidence,
      portfolioValue: integrated.portfolioValue,
      withdrawalRate: `${integrated.withdrawalRate.toFixed(2)}%`,
      successRate: `${integrated.successRate.toFixed(1)}%`
    });
    
    L.r(integrated.majorRisks);
    L.a(integrated.criticalActions);
    
    return { feasible, confidence, clientData: state.clientData, ...integrated };
  }
}

// Main execution function
const executeCompleteAnalysis = async (clientData) => {
  const analyzer = new UltraFatFireAnalyzer();
  return await analyzer.execute(clientData);
};

export { UltraFatFireAnalyzer, executeCompleteAnalysis, PriceResearch, OptionAnalyzer, RSUAnalyzer, MonteCarloSimulator, L, createClientData };
```

---

## FINAL OUTPUT REQUIREMENTS

### Your analysis must include:

1. **Complete Client Profile** - All extracted data with discrete values
2. **Portfolio Analysis** - Naive vs actual calculations showing value destruction percentages
3. **Expert Analysis Results** - All 11 experts with specific recommendations
4. **Risk Assessment** - Major risks with client-specific context and mitigation strategies
5. **Critical Actions** - Prioritized actions with urgency levels, dependencies, and expected outcomes
6. **Final Determination** - Feasibility conclusion with confidence level and key success factors

### Expected Output Format:

```
Ultra Fat FIRE Analysis for [CLIENT_NAME]

=== CLIENT PROFILE ===
Name: [name] | Age: [age] | Location: [city, state]
Income: $[income] | Tax: [federal]%F/[state]%S

=== PORTFOLIO ANALYSIS ===
Options: [count] grants | RSUs: [count] grants | Positions: [count]
Naive Value: $[naive] | Actual Value: $[actual] | Destroyed: $[destroyed] ([%])

=== EXPERT RESULTS ===
✅ E1-Portfolio: $[value] | ✅ E2-Tax: $[savings] | ✅ E3-Expenses: $[annual]
✅ E4-Risk: [success]% | ✅ E5-Withdrawal: [rate]% | ✅ E6-Contingency: $[fund]
✅ E7-Policy: $[impact] | ✅ E8-Location: $[savings] | ✅ E9-Alternative: [access]
✅ E10-Business: $[value] | ✅ E11-Sequence: [score]/100

=== DETERMINATION ===
Ultra Fat FIRE Feasible: [YES/NO] | Confidence: [HIGH/MEDIUM/LOW]

=== CRITICAL ACTIONS ===
1. [Action]: $[Amount] [URGENCY] - [Context]
2. [Action]: $[Amount] [URGENCY] - [Context]
3. [Action]: $[Amount] [URGENCY] - [Context]

=== MAJOR RISKS ===
1. [Risk]: [%] chance, $[impact] - [Context]
2. [Risk]: [%] chance, $[impact] - [Context]
3. [Risk]: [%] chance, $[impact] - [Context]
```

**Execute the complete analysis following all instructions above.**
