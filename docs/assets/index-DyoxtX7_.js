const n = 14;
const base = new URL("./index-DyoxtX7_.p", import.meta.url).href;
const parts = await Promise.all(
  Array.from({ length: n }, (_, i) =>
    fetch(base + String(i).padStart(2, "0") + ".txt").then((r) => {
      if (!r.ok) throw new Error("Missing bundle chunk " + i);
      return r.text();
    })
  )
);
const blob = new Blob(parts, { type: "text/javascript" });
await import(URL.createObjectURL(blob));
