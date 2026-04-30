const assert = require("assert");
const {
  convertCurrency,
  getSupportedCurrencies,
  validateAmount
} = require("../src/converter");

const mockedRateFixture = {
  sourceType: "official-market-demo",
  sourceLabel: "Mock official market",
  lastUpdated: "2026-04-30T00:00:00Z",
  anchorsPerUsd: {
    USD: 1,
    GHS: 10,
    EUR: 0.5
  }
};

assert.deepStrictEqual(validateAmount(""), {
  valid: false,
  message: "Enter an amount to convert."
});

assert.deepStrictEqual(validateAmount("-1"), {
  valid: false,
  message: "Amount cannot be negative."
});

const conversion = convertCurrency({
  amount: "100",
  fromCurrency: "GHS",
  toCurrency: "USD",
  rateFixture: mockedRateFixture
});

assert.strictEqual(conversion.ok, true);
assert.strictEqual(conversion.convertedAmount, 10);
assert.strictEqual(conversion.sourceLabel, "Mock official market");
assert.strictEqual(conversion.lastUpdated, "2026-04-30T00:00:00Z");

const crossRateConversion = convertCurrency({
  amount: "100",
  fromCurrency: "GHS",
  toCurrency: "EUR",
  rateFixture: mockedRateFixture
});

assert.strictEqual(crossRateConversion.ok, true);
assert.strictEqual(crossRateConversion.convertedAmount, 5);

assert.ok(getSupportedCurrencies().includes("GHS"));
assert.ok(getSupportedCurrencies().includes("USD"));

console.log("converter tests passed");
