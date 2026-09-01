# Net Check

Free US take-home pay calculator. Enter gross wages and see an estimate of net per paycheck and per year, with a breakdown of federal income tax, Social Security, Medicare, and state income tax.

Live site (GitHub Pages): https://lt77777.github.io/NetCheck/

Nothing is uploaded. There are no accounts. Salaries never leave the browser. This is an estimate, not tax advice.

## Run locally

Needs Node 20 or newer.

```bash
npm install
npm test
npm run dev
```

Open http://localhost:5173/NetCheck/. Production build writes `docs/`. Preview with `npm run preview`.

## Tax year and sources

Figures are for **tax year 2026**.

### Federal

- Ordinary brackets and standard deduction: IRS TY 2026 inflation adjustments at https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill (Rev. Proc. 2025-32). Also summarized by Tax Foundation at https://taxfoundation.org/data/all/federal/2026-tax-brackets/
  - Standard deduction: **$16,100** single / **$32,200** married filing jointly
  - Rates 10 / 12 / 22 / 24 / 32 / 35 / 37 percent with the 2026 thresholds from that release
- Social Security (OASDI): **6.2 percent** employee rate on wages up to the SSA 2026 contribution and benefit base of **$184,500** (https://www.ssa.gov/oact/cola/cbb.html)
- Medicare: **1.45 percent** on all wages, plus **0.9 percent Additional Medicare Tax** on earned income above **$200,000** single / **$250,000** married filing jointly (https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax). Thresholds are not inflation-indexed.

Traditional 401(k) elective deferrals reduce the federal (and most state) income-tax base. They do not reduce Social Security or Medicare.

### State

Wage income-tax rates, brackets, standard deductions, and personal exemptions come from Tax Foundation, 2026 State Income Tax Rates and Brackets (https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/), compiled from state statutes, forms, and instructions as of 11 February 2026.

California 2026 standard deduction is from the FTB 2026 Form 540-ES instructions (https://www.ftb.ca.gov/forms/2026/2026-540-es-instructions.html): $5,706 single / $11,412 joint. The FTB 2026 inflation-adjusted rate schedule had not been published at build time; California brackets therefore use the Tax Foundation 2026 table (that table notes 2025 inflation-adjusted widths where 2026 widths were not yet available).

States with no wage income tax (including Texas, Florida, Nevada, Washington, Tennessee, South Dakota, Alaska, Wyoming, and New Hampshire) are modeled as $0 state tax.

Pennsylvania generally still taxes employee 401(k) deferrals; the optional 401(k) percent does not reduce PA tax in this calculator.

### What is not calculated

Local / city / school-district tax, NIIT, AMT, self-employment tax, credits (EITC, CTC, most state credits), itemized deductions, dependents, extra jobs, SDI / paid-family-leave payroll taxes, high-income recapture, and multi-state allocation. See the on-page footer for the same list.

## AdSense

Revenue is meant to come from ads on the result card. This project does not ship a publisher id.

Copy `.env.example` to `.env`. Set `VITE_ADSENSE_CLIENT` to a real ca-pub id and `VITE_ADSENSE_SLOT_RESULT` to the numeric ad-unit slot, then rebuild. Until both are valid, the result card shows a labeled Ad placeholder and does not load the AdSense script.

## GitHub Pages

The production build lives in `docs/` (Vite base is `/NetCheck/`). Pages should serve from the main branch, `/docs` folder.

If Pages is not on yet: open https://github.com/lt77777/NetCheck/settings/pages → Build and deployment → Source: Deploy from a branch → Branch `main`, folder `/docs` → Save. The site will be https://lt77777.github.io/NetCheck/

A `.nojekyll` file is included so GitHub does not run Jekyll. SEO routes (california, texas, new-york, florida, illinois, pennsylvania, ohio, georgia, north-carolina, michigan) are prerendered as extra index.html files during the production build.

## Stack

Vite + React, static export, client-side tax math, installable PWA (`public/manifest.webmanifest` and `public/sw.js`).
