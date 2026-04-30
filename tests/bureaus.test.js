const assert = require("assert");
const {
  getBureauById,
  getBureausSortedByRating,
  seededBureaus
} = require("../src/bureaus");

const sortedBureaus = getBureausSortedByRating();

assert.strictEqual(sortedBureaus.length, seededBureaus.length);

for (let index = 1; index < sortedBureaus.length; index += 1) {
  assert.ok(
    sortedBureaus[index - 1].rating >= sortedBureaus[index].rating,
    "bureaus should be ordered by highest rating first"
  );
}

const firstBureau = sortedBureaus[0];
assert.ok(firstBureau.name);
assert.ok(firstBureau.phone);
assert.ok(firstBureau.email);
assert.ok(firstBureau.city);
assert.ok(typeof firstBureau.verified === "boolean");
assert.ok(firstBureau.supportedCurrencies.length > 0);
assert.ok(firstBureau.rates.length > 0);

const profile = getBureauById(firstBureau.id);
assert.strictEqual(profile.id, firstBureau.id);
assert.strictEqual(getBureauById("missing-bureau"), null);

console.log("bureau directory tests passed");
