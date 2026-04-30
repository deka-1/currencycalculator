const assert = require("assert");
const { seededBureaus } = require("../src/bureaus");
const {
  bureauSupportsCurrencyPair,
  getLocationForQuery,
  searchBureaus
} = require("../src/search");

assert.strictEqual(getLocationForQuery("Osu").name, "Accra");
assert.strictEqual(getLocationForQuery("Market Circle").name, "Takoradi");
assert.strictEqual(getLocationForQuery("unknown place"), null);

const accraResults = searchBureaus({
  bureaus: seededBureaus,
  query: "Accra",
  currencyPair: "USD/GHS"
});

assert.ok(accraResults.length > 0);
assert.strictEqual(accraResults[0].city, "Accra");

const nearbyAccraResults = searchBureaus({
  bureaus: seededBureaus,
  coordinates: { latitude: 5.6037, longitude: -0.187 },
  currencyPair: "USD/GHS"
});

assert.ok(nearbyAccraResults.some((bureau) => bureau.city === "Accra"));
assert.ok(nearbyAccraResults.some((bureau) => bureau.city === "Tema"));

for (let index = 1; index < nearbyAccraResults.length; index += 1) {
  assert.ok(
    nearbyAccraResults[index - 1].rating >= nearbyAccraResults[index].rating,
    "location search should keep best-rated bureaus first"
  );
}

const cnyResults = searchBureaus({
  bureaus: seededBureaus,
  query: "Tema",
  currencyPair: "CNY/GHS"
});

assert.strictEqual(cnyResults.length, 1);
assert.strictEqual(cnyResults[0].id, "tema-harbour-exchange");
assert.strictEqual(bureauSupportsCurrencyPair(cnyResults[0], "CNY/GHS"), true);

console.log("bureau search tests passed");
