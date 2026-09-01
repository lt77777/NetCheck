import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateTakeHome, taxFromBrackets } from "./calculate.js";
import { FEDERAL_BRACKETS } from "./federal.js";

test("federal brackets: $80k single taxable after $16,100 deduction", () => {
  const taxable = 80000 - 16100;
  const tax = taxFromBrackets(taxable, FEDERAL_BRACKETS.single);
  assert.equal(Math.round(tax * 100) / 100, 8770);
});

test("Texas $80k single: zero state tax, FICA on full wages", () => {
  const r = calculateTakeHome({
    gross: 80000,
    frequency: "annual",
    filing: "single",
    state: "TX",
    k401: 0,
  });
  assert.equal(r.stateIncomeTax, 0);
  assert.equal(Math.round(r.socialSecurity), 4960);
  assert.equal(Math.round(r.medicare * 100) / 100, 1160);
  assert.equal(Math.round(r.federalIncomeTax * 100) / 100, 8770);
  assert.equal(Math.round(r.netAnnual * 100) / 100, 65110);
});

test("Florida and Wyoming also have $0 state wage tax", () => {
  for (const code of ["FL", "WY", "NV", "WA", "TN", "SD", "AK", "NH"]) {
    const r = calculateTakeHome({
      gross: 120000,
      frequency: "annual",
      filing: "marriedJoint",
      state: code,
      k401: 5,
    });
    assert.equal(r.stateIncomeTax, 0, code);
  }
});

test("Social Security wage base caps at $184,500", () => {
  const r = calculateTakeHome({
    gross: 250000,
    frequency: "annual",
    filing: "single",
    state: "TX",
    k401: 0,
  });
  assert.equal(Math.round(r.socialSecurity * 100) / 100, 11439);
});

test("Additional Medicare Tax 0.9% over $200k single", () => {
  const r = calculateTakeHome({
    gross: 250000,
    frequency: "annual",
    filing: "single",
    state: "TX",
    k401: 0,
  });
  const expected = 250000 * 0.0145 + 50000 * 0.009;
  assert.equal(Math.round(r.medicare * 100) / 100, Math.round(expected * 100) / 100);
});

test("401k reduces federal taxable income but not FICA", () => {
  const base = calculateTakeHome({
    gross: 100000,
    frequency: "annual",
    filing: "single",
    state: "TX",
    k401: 0,
  });
  const deferred = calculateTakeHome({
    gross: 100000,
    frequency: "annual",
    filing: "single",
    state: "TX",
    k401: 10,
  });
  assert.equal(deferred.deferral, 10000);
  assert.equal(deferred.socialSecurity, base.socialSecurity);
  assert.equal(deferred.medicare, base.medicare);
  assert.ok(deferred.federalIncomeTax < base.federalIncomeTax);
});

test("Pennsylvania 401k does not reduce PA tax", () => {
  const r = calculateTakeHome({
    gross: 100000,
    frequency: "annual",
    filing: "single",
    state: "PA",
    k401: 10,
  });
  assert.equal(Math.round(r.stateIncomeTax * 100) / 100, 3070);
});

test("Illinois flat 4.95% after $2,925 exemption", () => {
  const r = calculateTakeHome({
    gross: 50000,
    frequency: "annual",
    filing: "single",
    state: "IL",
    k401: 0,
  });
  assert.equal(Math.round(r.stateIncomeTax * 100) / 100, 2330.21);
});

test("North Carolina 3.99% after $12,750 standard deduction", () => {
  const r = calculateTakeHome({
    gross: 80000,
    frequency: "annual",
    filing: "single",
    state: "NC",
    k401: 0,
  });
  const expected = (80000 - 12750) * 0.0399;
  assert.equal(Math.round(r.stateIncomeTax * 100) / 100, Math.round(expected * 100) / 100);
});

test("Georgia 5.19% after $12,000 standard deduction", () => {
  const r = calculateTakeHome({
    gross: 70000,
    frequency: "annual",
    filing: "single",
    state: "GA",
    k401: 0,
  });
  const expected = (70000 - 12000) * 0.0519;
  assert.equal(Math.round(r.stateIncomeTax * 100) / 100, Math.round(expected * 100) / 100);
});

test("Michigan 4.25% after $5,900 exemption", () => {
  const r = calculateTakeHome({
    gross: 60000,
    frequency: "annual",
    filing: "single",
    state: "MI",
    k401: 0,
  });
  const expected = (60000 - 5900) * 0.0425;
  assert.equal(Math.round(r.stateIncomeTax * 100) / 100, Math.round(expected * 100) / 100);
});

test("Ohio 2.75% above $26,050 after AGI-tier exemption", () => {
  const r = calculateTakeHome({
    gross: 80000,
    frequency: "annual",
    filing: "single",
    state: "OH",
    k401: 0,
  });
  const taxable = 80000 - 2150;
  const expected = Math.max(0, taxable - 26050) * 0.0275;
  assert.equal(Math.round(r.stateIncomeTax * 100) / 100, Math.round(expected * 100) / 100);
});

test("biweekly paycheck divides annual net by 26", () => {
  const r = calculateTakeHome({
    gross: 3000,
    frequency: "biweekly",
    filing: "single",
    state: "TX",
    k401: 0,
  });
  assert.equal(r.periods, 26);
  assert.equal(Math.round(r.paycheckNet * 26 * 100) / 100, Math.round(r.netAnnual * 100) / 100);
});

test("hourly annualizes rate × hours × 52", () => {
  const r = calculateTakeHome({
    hourlyRate: 25,
    hoursPerWeek: 40,
    frequency: "hourly",
    filing: "single",
    state: "TX",
    k401: 0,
  });
  assert.equal(r.grossAnnual, 52000);
});
