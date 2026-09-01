import { useEffect } from "react";

const CLIENT =
  import.meta.env.VITE_ADSENSE_CLIENT ||
  import.meta.env.VITE_ADSENSE_PUBLISHER_ID ||
  "";
const SLOT = import.meta.env.VITE_ADSENSE_SLOT_RESULT || "";

function isLive() {
  return /^ca-pub-\d+$/.test(CLIENT) && /^\d+$/.test(SLOT);
}

export default function AdSlot() {
  const live = isLive();

  useEffect(() => {
    if (!live || typeof window === "undefined") return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      /* AdSense may throw on duplicate pushes during HMR */
    }
  }, [live]);

  if (!live) {
    return (
      <aside className="ad-slot" aria-label="Advertisement placeholder">
        <span className="ad-kicker">Ad</span>
        <p>
          Result-page ad slot. Live AdSense is off until you set{" "}
          <code>VITE_ADSENSE_CLIENT</code> (ca-pub-…) and{" "}
          <code>VITE_ADSENSE_SLOT_RESULT</code>. No publisher id is bundled
          with this build.
        </p>
      </aside>
    );
  }

  return (
    <aside className="ad-slot" aria-label="Advertisement">
      <span className="ad-kicker">Ad</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={CLIENT}
        data-ad-slot={SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

export function AdSenseLoader() {
  const live = isLive();
  useEffect(() => {
    if (!live) return;
    if (document.querySelector("script[data-netcheck-adsense]")) return;
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
    s.crossOrigin = "anonymous";
    s.dataset.netcheckAdsense = "1";
    document.head.appendChild(s);
  }, [live]);
  return null;
}
