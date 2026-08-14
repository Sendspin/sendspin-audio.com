// Downloads the Open Home Foundation referrer allowlist once per build. The list is read
// back by src/_data/allowedReferrers.js and inlined by base.html for the Plausible init.
// Never hard-fails: on error we keep whatever was fetched by an earlier build, and the
// data file copes with the list being absent altogether.
const { existsSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const SOURCE_URL = "https://www.openhomefoundation.org/allowed-referrers.json";
const OUTPUT = path.join(__dirname, "..", "src", "_data", "allowed-referrers.json");

async function main() {
  const response = await fetch(SOURCE_URL, {
    headers: { "User-Agent": "sendspin-audio.com-build" },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || !data.every((d) => typeof d === "string")) {
    throw new Error("payload is not an array of strings");
  }

  const referrers = data
    .map((d) => d.trim().toLowerCase().replace(/\.$/, ""))
    .filter((d) => d.length > 0);

  writeFileSync(OUTPUT, JSON.stringify(referrers, null, 2) + "\n");
  console.log(`[allowed-referrers] wrote ${referrers.length} domains`);
}

main().catch((e) => {
  const fallback = existsSync(OUTPUT) ? "keeping the file from an earlier build" : "no list available";
  console.warn(`[allowed-referrers] fetch failed, ${fallback}. ${e}`);
});
