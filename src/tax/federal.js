/**
 * Federal individual income tax and FICA parameters for tax year 2026.
 *
 * Ordinary rates and standard deduction: IRS newsroom release of inflation
 * adjustments for TY 2026, and Revenue Procedure 2025-32 (also summarized by
 * Tax Foundation, "2026 Tax Brackets and Federal Income Tax Rates").
 * OASDI wage base: SSA contribution and benefit base for 2026.
 * Additional Medicare Tax: IRC §3101(b)(2); thresholds are not inflation-indexed
 * (IRS Form 8959 instructions).
 */

export const TAX_YEAR = 2026;

export const STANDARD_DEDUCTION = {
  single: 16100,
  marriedJoint: 32200,
};

/** Exclusive upper bound of each ordinary-income bracket, plus the rate. */
export const FEDERAL_BRACKETS = {
  single: [
    { max: 12400, rate: 0.1 },
    { max: 50400, rate: 0.12 },
    { max: 105700, rate: 0.22 },
    { max: 201775, rate: 0.24 },
    { max: 256225, rate: 0.32 },
    { max: 640600, rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ],
  marriedJoint: [
    { max: 24800, rate: 0.1 },
    { max: 100800, rate: 0.12 },
    { max: 211400, rate: 0.22 },
    { max: 403550, rate: 0.24 },
    { max: 512450, rate: 0.32 },
    { max: 768700, rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ],
};

export const FICA = {
  socialSecurityRate: 0.062,
  socialSecurityWageBase: 184500,
  medicareRate: 0.0145,
  additionalMedicareRate: 0.009,
  additionalMedicareThreshold: {
    single: 200000,
    marriedJoint: 250000,
  },
};

export const FEDERAL_SOURCES = [
  {
    label: "IRS — TY 2026 inflation adjustments (standard deduction and ordinary brackets)",
    href: "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill",
  },
  {
    label: "Tax Foundation summary of Rev. Proc. 2025-32 (2026 federal brackets)",
    href: "https://taxfoundation.org/data/all/federal/2026-tax-brackets/",
  },
  {
    label: "SSA — 2026 OASDI contribution and benefit base ($184,500)",
    href: "https://www.ssa.gov/oact/cola/cbb.html",
  },
  {
    label: "IRS — Additional Medicare Tax (Form 8959 instructions)",
    href: "https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax",
  },
];
