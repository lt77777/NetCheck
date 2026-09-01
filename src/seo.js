import { SEO_STATE_CODES, STATES_BY_CODE } from "./tax/states.js";

export const SEO_PAGES = [
  {
    slug: "",
    title: "Paycheck calculator United States | Net Check",
    description:
      "Free US take-home pay calculator. Estimate federal income tax, Social Security, Medicare, and state tax from your gross paycheck. Tax year 2026.",
    heading: "See what actually lands.",
    lede: "Gross pay is a headline. Net Check turns it into a paycheck — federal income tax, Social Security, Medicare, and your state’s wage tax — on this phone, in under half a minute.",
    canonical: "https://lt77777.github.io/NetCheck/",
    defaultState: "CA",
  },
  ...SEO_STATE_CODES.map((code) => {
    const s = STATES_BY_CODE[code];
    return {
      slug: s.slug,
      title: `Paycheck calculator ${s.name} | Net Check`,
      description: `Free ${s.name} take-home pay calculator. Estimate federal income tax, FICA, and ${s.name} state income tax from your gross wages. Tax year 2026.`,
      heading: `Paycheck calculator, ${s.name}.`,
      lede: s.hasIncomeTax
        ? `An estimate of ${s.name} take-home pay after federal income tax, Social Security, Medicare, and ${s.name} state income tax. Nothing is stored.`
        : `${s.name} does not tax wages. This page still estimates federal income tax, Social Security, and Medicare so you can see the real paycheck.`,
      canonical: `https://lt77777.github.io/NetCheck/${s.slug}/`,
      defaultState: code,
    };
  }),
];

export function pageForPath(pathname) {
  const cleaned = pathname.replace(/\/+$/, "").replace(/^\//, "");
  return SEO_PAGES.find((p) => p.slug === cleaned) || SEO_PAGES[0];
}
