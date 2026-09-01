import fs from "node:fs";
import path from "node:path";
import { SEO_PAGES } from "../src/seo.js";

const docs = path.resolve("docs");
const indexPath = path.join(docs, "index.html");
const html = fs.readFileSync(indexPath, "utf8");

function applyPage(source, page) {
  let out = source;
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`);
  out = out.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${page.description.replace(/"/g, "&quot;")}" />`
  );
  out = out.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${page.canonical}" />`
  );
  out = out.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${page.title}" />`
  );
  out = out.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${page.description.replace(/"/g, "&quot;")}" />`
  );
  out = out.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${page.canonical}" />`
  );
  return out;
}

fs.writeFileSync(path.join(docs, ".nojekyll"), "");
fs.writeFileSync(path.join(docs, "404.html"), applyPage(html, SEO_PAGES[0]));

for (const page of SEO_PAGES) {
  const outHtml = applyPage(html, page);
  if (!page.slug) {
    fs.writeFileSync(indexPath, outHtml);
    continue;
  }
  const dir = path.join(docs, page.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), outHtml);
}

console.log(`Prerendered ${SEO_PAGES.length} routes into docs/`);
