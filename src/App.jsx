import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdSlot, { AdSenseLoader } from "./components/AdSlot.jsx";
import { pageForPath, SEO_PAGES } from "./seo.js";
import { calculateTakeHome, FREQUENCIES, money, moneyWhole } from "./tax/calculate.js";
import { CA_STD_SOURCE, SEO_STATE_CODES, STATE_SOURCE, STATES, STATES_BY_CODE } from "./tax/states.js";
import { FEDERAL_SOURCES, TAX_YEAR } from "./tax/federal.js";

function LogoMark() {
  return (
    <svg className="mark" viewBox="0 0 44 44" aria-hidden="true">
      <rect width="44" height="44" rx="12" fill="currentColor" />
      <path
        d="M10 16.5h24v14.5H10z"
        fill="none"
        stroke="#f6efe0"
        strokeWidth="1.4"
      />
      <path d="M10 16.5l12 8 12-8" fill="none" stroke="#f6efe0" strokeWidth="1.4" />
      <path d="M14 31.5l4.2 3.2L24.8 26" fill="none" stroke="#e7b089" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function Calculator({ page }) {
  const [frequency, setFrequency] = useState("annual");
  const [gross, setGross] = useState("72000");
  const [hourlyRate, setHourlyRate] = useState("28");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [filing, setFiling] = useState("single");
  const [stateCode, setStateCode] = useState(page.defaultState);
  const [k401, setK401] = useState("0");

  useEffect(() => {
    setStateCode(page.defaultState);
  }, [page.defaultState]);

  useEffect(() => {
    document.title = page.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", page.description);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", page.canonical);
  }, [page]);

  const result = useMemo(
    () =>
      calculateTakeHome({
        frequency,
        gross,
        hourlyRate,
        hoursPerWeek,
        filing,
        state: stateCode,
        k401,
      }),
    [frequency, gross, hourlyRate, hoursPerWeek, filing, stateCode, k401]
  );

  const ready = result.grossAnnual > 0;
  const state = STATES_BY_CODE[stateCode];
  const periodLabel =
    frequency === "hourly"
      ? "week"
      : frequency === "annual"
        ? "year"
        : FREQUENCIES[frequency].label.toLowerCase();

  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/">
          <LogoMark />
          <span className="brand-text">
            <span className="brand-kicker">Take-home pay</span>
            <span className="brand-name">Net Check</span>
          </span>
        </Link>
        <span className="year-pill">Tax year {TAX_YEAR}</span>
      </header>

      <section className="hero">
        <h1>{page.heading}</h1>
        <p>{page.lede}</p>
      </section>

      <div className="layout">
        <form className="check" onSubmit={(e) => e.preventDefault()}>
          <h2>Your pay</h2>
          <p className="lede">Runs entirely in this browser. Salaries are not stored or sent anywhere.</p>

          <div className="field">
            <label>How often are you paid?</label>
            <div className="freq" role="group" aria-label="Pay frequency">
              {Object.entries(FREQUENCIES).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={frequency === key}
                  onClick={() => setFrequency(key)}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          {frequency === "hourly" ? (
            <div className="pair">
              <div className="field">
                <label htmlFor="hourly">Hourly rate</label>
                <input
                  id="hourly"
                  inputMode="decimal"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="hours">Hours / week</label>
                <input
                  id="hours"
                  inputMode="decimal"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="field">
              <label htmlFor="gross">Gross pay per {periodLabel}</label>
              <input
                id="gross"
                inputMode="decimal"
                value={gross}
                onChange={(e) => setGross(e.target.value)}
              />
            </div>
          )}

          <div className="field">
            <label>Filing status</label>
            <div className="seg" role="group" aria-label="Filing status">
              <button type="button" aria-pressed={filing === "single"} onClick={() => setFiling("single")}>
                Single
              </button>
              <button
                type="button"
                aria-pressed={filing === "marriedJoint"}
                onClick={() => setFiling("marriedJoint")}
              >
                Married jointly
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="state">US state</label>
            <select id="state" value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
              {STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="k401">Pre-tax 401(k) %</label>
            <input
              id="k401"
              inputMode="decimal"
              value={k401}
              onChange={(e) => setK401(e.target.value)}
            />
            <p className="hint">
              Traditional elective deferral. Lowers federal (and most state) income tax, not Social Security or Medicare.
              {state?.code === "PA" ? " Pennsylvania generally still taxes the deferral." : ""}
            </p>
          </div>
        </form>

        <section className={`result-card${ready ? "" : " idle"}`} aria-live="polite">
          <p className="result-kicker">{ready ? `Net / ${periodLabel}` : "Your result"}</p>
          <p className="net">{ready ? moneyWhole(result.paycheckNet) : "—"}</p>
          <p className="net-sub">
            {ready
              ? `${money(result.netAnnual)} a year after tax and 401(k)`
              : "Enter gross pay to see take-home."}
          </p>

          {ready && (
            <>
              <dl className="annual-row">
                <div>
                  <dt>Gross / year</dt>
                  <dd>{money(result.grossAnnual)}</dd>
                </div>
                <div>
                  <dt>Effective tax</dt>
                  <dd>{(result.effectiveRate * 100).toFixed(1)}%</dd>
                </div>
              </dl>
              <ul className="breakdown">
                <li>
                  <span>Federal income tax</span>
                  <span className="amt">{money(result.federalIncomeTax)}</span>
                </li>
                <li>
                  <span>Social Security</span>
                  <span className="amt">{money(result.socialSecurity)}</span>
                </li>
                <li>
                  <span>Medicare</span>
                  <span className="amt">{money(result.medicare)}</span>
                </li>
                <li>
                  <span>{state?.name} income tax</span>
                  <span className="amt">{money(result.stateIncomeTax)}</span>
                </li>
                {result.deferral > 0 && (
                  <li>
                    <span>401(k) deferral</span>
                    <span className="amt">{money(result.deferral)}</span>
                  </li>
                )}
                <li>
                  <span>Total withheld (est.)</span>
                  <span className="amt">{money(result.totalTax + result.deferral)}</span>
                </li>
              </ul>
            </>
          )}

          {ready && <AdSlot />}
        </section>
      </div>

      {state?.notes && (
        <p className="seo-note">
          <strong>{state.name}:</strong> {state.notes}
        </p>
      )}

      <section className="gaps">
        <strong>This is an estimate, not tax advice.</strong> Gaps we do not calculate:
        <ul>
          <li>Local / city / school-district income tax (NYC, Pennsylvania EIT, Ohio cities, Maryland counties, and others)</li>
          <li>NIIT, AMT, self-employment tax, unemployment tax</li>
          <li>Credits (EITC, Child Tax Credit, state credits beyond a simple personal-exemption credit)</li>
          <li>Itemized deductions, dependents, extra jobs, bonuses, equity, or multi-state allocation</li>
          <li>SDI / paid-family-leave payroll taxes (California, Massachusetts, Washington, and others)</li>
        </ul>
      </section>

      <nav className="state-links" aria-label="State paycheck calculators">
        <Link to="/" aria-current={page.slug === "" ? "page" : undefined}>
          United States
        </Link>
        {SEO_STATE_CODES.map((code) => {
          const s = STATES_BY_CODE[code];
          return (
            <Link
              key={code}
              to={`/${s.slug}/`}
              aria-current={page.slug === s.slug ? "page" : undefined}
            >
              {s.name}
            </Link>
          );
        })}
      </nav>

      <footer className="site-footer">
        <h2>Sources · tax year {TAX_YEAR}</h2>
        <ul>
          {FEDERAL_SOURCES.map((s) => (
            <li key={s.href}>
              <a href={s.href} rel="noopener noreferrer">
                {s.label}
              </a>
            </li>
          ))}
          <li>
            <a href={STATE_SOURCE.href} rel="noopener noreferrer">
              {STATE_SOURCE.label}
            </a>
          </li>
          <li>
            <a href={CA_STD_SOURCE.href} rel="noopener noreferrer">
              {CA_STD_SOURCE.label}
            </a>
          </li>
        </ul>
        <p className="disclaimer">
          Net Check is a free estimator for US wages. Figures are rounded and simplified.
          Confirm withholding with your payroll department or a tax professional. No accounts.
          We do not store salaries.
        </p>
      </footer>
    </>
  );
}

function RoutedCalculator() {
  const location = useLocation();
  const page = pageForPath(location.pathname);
  return <Calculator page={page} />;
}

export default function App() {
  const extraRoutes = SEO_PAGES.filter((p) => p.slug).map((p) => (
    <Route key={p.slug} path={`/${p.slug}/`} element={<RoutedCalculator />} />
  ));

  return (
    <div className="app">
      <AdSenseLoader />
      <Routes>
        <Route path="/" element={<RoutedCalculator />} />
        {extraRoutes}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
