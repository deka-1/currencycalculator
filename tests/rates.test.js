const assert = require("assert");
const { seededBureaus } = require("../src/bureaus");
const {
  getComparableRates,
  normalizeRateInput,
  normalizeSourceType,
  upsertBureauRate
} = require("../src/rates");

const bureaus = JSON.parse(JSON.stringify(seededBureaus));
const bureau = bureaus.find((candidate) => candidate.id === "accra-heritage-fx");

assert.strictEqual(normalizeSourceType("official"), "official");
assert.strictEqual(normalizeSourceType("partner-provided"), "partner-provided");
assert.strictEqual(normalizeSourceType("scraped"), "scraped");
assert.strictEqual(normalizeSourceType("user-reported"), "user-reported");
assert.strictEqual(normalizeSourceType("unknown"), "bureau-submitted");

const normalizedRate = normalizeRateInput({
  fromCurrency: "usd",
  toCurrency: "ghs",
  buy: "13.7",
  sell: "13.9",
  sourceType: "bureau-submitted",
  updatedAt: "2026-04-30T12:00:00Z"
});

assert.strictEqual(normalizedRate.ok, true);
assert.strictEqual(normalizedRate.rate.pair, "USD/GHS");
assert.strictEqual(normalizedRate.rate.source, "Bureau-submitted");
assert.strictEqual(normalizedRate.rate.updatedAt, "2026-04-30T12:00:00Z");

const updateResult = upsertBureauRate({
  bureau,
  fromCurrency: "USD",
  toCurrency: "GHS",
  buy: 13.7,
  sell: 13.95,
  sourceType: "bureau-submitted",
  updatedAt: "2026-04-30T12:00:00Z"
});

assert.strictEqual(updateResult.ok, true);
assert.strictEqual(bureau.rates.find((rate) => rate.pair === "USD/GHS").sell, 13.95);

const unsupportedResult = upsertBureauRate({
  bureau,
  fromCurrency: "JPY",
  toCurrency: "GHS",
  buy: 0.08,
  sell: 0.09
});

assert.strictEqual(unsupportedResult.ok, false);
assert.strictEqual(unsupportedResult.error, "That currency pair is not in the bureau's supported currencies.");

const comparableRates = getComparableRates({
  bureaus,
  currencyPair: "USD/GHS"
});

assert.ok(comparableRates.length > 1);
assert.strictEqual(comparableRates[0].bureauName, "Accra Heritage Forex");
assert.strictEqual(comparableRates[0].source, "Bureau-submitted");
assert.ok(comparableRates[0].updatedAt);

console.log("rate management tests passed");
