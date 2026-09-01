import { FEDERAL_BRACKETS, FICA, STANDARD_DEDUCTION } from "./federal.js";
import { STATES_BY_CODE } from "./states.js";

export const FREQUENCIES = {
  annual: { label: "Annually", periods: 1 },
  monthly: { label: "Monthly", periods: 12 },
  biweekly: { label: "Every other week", periods: 26 },
  weekly: { label: "Weekly", periods: 52 },
  hourly: { label: "Hourly", periods: 52 },
};

export function taxFromBrackets(taxable, brackets) {
  const income = Math.max(0, taxable);
  if (!brackets || brackets.length === 0 || income === 0) return 0;
  let tax = 0;
  let lower = 0;
  for (const band of brackets) {
    const upper = band.max;
    const slice = Math.min(income, upper) - lower;
    if (slice > 0) tax += slice * band.rate;
    if (income <= upper) break;
    lower = upper;
  }
  return tax;
}

export function annualGross(input) {
  const freq = input.frequency;
  if (freq === "hourly") {
    const rate = Number(input.hourlyRate) || 0;
    const hours = Number(input.hoursPerWeek) || 0;
    return Math.max(0, rate * hours * 52);
  }
  const amount = Number(input.gross) || 0;
  const periods = FREQUENCIES[freq]?.periods || 1;
  return Math.max(0, amount * periods);
}

function personalExemption(state, filing, agi) {
  if (state.code === "IL") {
    const cap = filing === "marriedJoint" ? 500000 : 250000;
    if (agi > cap) return 0;
  }
  if (state.exemptionByAgi) {
    for (const row of state.exemptionByAgi) {
      if (agi <= row.maxAgi) return row[filing] || 0;
    }
    return 0;
  }
  return state.personalExemption?.[filing] || 0;
}

function standardDeduction(state, filing) {
  if (state.usesFederalStandardDeduction) return STANDARD_DEDUCTION[filing];
  return state.standardDeduction?.[filing] || 0;
}

/**
 * Client-side take-home estimate.
 * Traditional 401(k) elective deferrals reduce federal (and most state) income
 * tax bases but remain subject to Social Security and Medicare.
 */
export function calculateTakeHome(input) {
  const filing = input.filing === "marriedJoint" ? "marriedJoint" : "single";
  const frequency = FREQUENCIES[input.frequency] ? input.frequency : "annual";
  const state = STATES_BY_CODE[input.state] || STATES_BY_CODE.TX;
  const grossAnnual = annualGross({ ...input, frequency });
  const kPct = Math.min(100, Math.max(0, Number(input.k401) || 0));
  const deferral = grossAnnual * (kPct / 100);
  const federalAgi = Math.max(0, grossAnnual - deferral);
  const periods = FREQUENCIES[frequency].periods;

  const ssWages = Math.min(grossAnnual, FICA.socialSecurityWageBase);
  const socialSecurity = ssWages * FICA.socialSecurityRate;
  const extraMedThreshold = FICA.additionalMedicareThreshold[filing];
  const medicare =
    grossAnnual * FICA.medicareRate +
    Math.max(0, grossAnnual - extraMedThreshold) * FICA.additionalMedicareRate;

  const federalTaxable = Math.max(0, federalAgi - STANDARD_DEDUCTION[filing]);
  const federalIncomeTax = taxFromBrackets(federalTaxable, FEDERAL_BRACKETS[filing]);

  let stateIncomeTax = 0;
  let stateTaxable = 0;
  if (state.hasIncomeTax) {
    const stateAgi = state.pretaxReducesState ? federalAgi : grossAnnual;
    stateTaxable = Math.max(
      0,
      stateAgi - standardDeduction(state, filing) - personalExemption(state, filing, stateAgi)
    );
    const raw = taxFromBrackets(stateTaxable, state.brackets[filing]);
    const credit = state.exemptionCredit?.[filing] || 0;
    stateIncomeTax = Math.max(0, raw - credit);
  }

  const totalTax = federalIncomeTax + socialSecurity + medicare + stateIncomeTax;
  const netAnnual = grossAnnual - deferral - totalTax;
  const paycheckGross = periods ? grossAnnual / periods : 0;
  const paycheckNet = periods ? netAnnual / periods : 0;
  const paycheckDeferral = periods ? deferral / periods : 0;

  return {
    taxYear: 2026,
    filing,
    frequency,
    state,
    periods,
    grossAnnual,
    deferral,
    federalAgi,
    federalTaxable,
    federalIncomeTax,
    socialSecurity,
    medicare,
    stateTaxable,
    stateIncomeTax,
    totalTax,
    netAnnual,
    paycheckGross,
    paycheckNet,
    paycheckDeferral,
    effectiveRate: grossAnnual > 0 ? totalTax / grossAnnual : 0,
  };
}

export function money(n) {
  const v = Number.isFinite(n) ? n : 0;
  const abs = Math.abs(v);
  const formatted = abs.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
  return v < 0 ? `−${formatted}` : formatted;
}

export function moneyWhole(n) {
  const v = Number.isFinite(n) ? n : 0;
  const abs = Math.abs(Math.round(v));
  const formatted = abs.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  return v < 0 ? `−${formatted}` : formatted;
}
