const assert = require("assert");
const { seededBureaus } = require("../src/bureaus");
require("../src/rates");
const {
  claimBureauProfile,
  createOwnerAccount,
  createOwnerStore,
  updateOwnedBureauRate
} = require("../src/owners");

const store = createOwnerStore({
  bureaus: JSON.parse(JSON.stringify(seededBureaus))
});

const owner = createOwnerAccount(store, {
  name: "Yaw Boateng",
  email: "yaw@example.com"
}).owner;

claimBureauProfile(store, {
  ownerId: owner.id,
  bureauId: "tema-harbour-exchange"
});

const allowedRateUpdate = updateOwnedBureauRate(store, {
  ownerId: owner.id,
  bureauId: "tema-harbour-exchange",
  fromCurrency: "USD",
  toCurrency: "GHS",
  buy: 13.6,
  sell: 13.91,
  sourceType: "bureau-submitted",
  updatedAt: "2026-04-30T13:00:00Z"
});

assert.strictEqual(allowedRateUpdate.ok, true);
assert.strictEqual(allowedRateUpdate.rate.pair, "USD/GHS");
assert.strictEqual(allowedRateUpdate.rate.sourceType, "bureau-submitted");

const forbiddenRateUpdate = updateOwnedBureauRate(store, {
  ownerId: owner.id,
  bureauId: "accra-heritage-fx",
  fromCurrency: "USD",
  toCurrency: "GHS",
  buy: 13.9,
  sell: 14.2
});

assert.strictEqual(forbiddenRateUpdate.ok, false);
assert.strictEqual(forbiddenRateUpdate.error, "Owners can only edit their own bureau profile.");

console.log("owner rate permissions tests passed");
