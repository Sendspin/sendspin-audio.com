// Exposes the referrer allowlist to templates (see the Plausible init in base.html).
// allowed-referrers.json is fetched once per build by script/fetch-allowed-referrers.js;
// if a build skips that step we fall back to an empty list, which filters every referrer
// instead of emitting a broken script tag.
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");

const SOURCE = path.join(__dirname, "allowed-referrers.json");

module.exports = function () {
  if (!existsSync(SOURCE)) {
    console.warn("[allowed-referrers] no allowlist found, filtering all referrers");
    return [];
  }
  return JSON.parse(readFileSync(SOURCE, "utf8"));
};
