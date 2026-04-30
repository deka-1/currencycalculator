const assert = require("assert");
const { seededBureaus } = require("../src/bureaus");
const {
  claimBureauProfile,
  createOwnerAccount,
  createOwnerStore,
  getOwnerDashboard,
  normalizeCurrencyList,
  updateOwnedBureauContact,
  updateOwnedSupportedCurrencies
} = require("../src/owners");

const store = createOwnerStore({
  bureaus: JSON.parse(JSON.stringify(seededBureaus))
});

const ownerResult = createOwnerAccount(store, {
  name: "Ama Mensah",
  email: "AMA@example.com"
});

assert.strictEqual(ownerResult.ok, true);
assert.strictEqual(ownerResult.owner.email, "ama@example.com");

const claimResult = claimBureauProfile(store, {
  ownerId: ownerResult.owner.id,
  bureauId: "accra-heritage-fx"
});

assert.strictEqual(claimResult.ok, true);

const contactResult = updateOwnedBureauContact(store, {
  ownerId: ownerResult.owner.id,
  bureauId: "accra-heritage-fx",
  phone: "+233 30 999 9999",
  email: "desk@example.com"
});

assert.strictEqual(contactResult.ok, true);
assert.strictEqual(contactResult.bureau.phone, "+233 30 999 9999");
assert.strictEqual(contactResult.bureau.email, "desk@example.com");

const currencyResult = updateOwnedSupportedCurrencies(store, {
  ownerId: ownerResult.owner.id,
  bureauId: "accra-heritage-fx",
  supportedCurrencies: "usd, ghs, eur, usd"
});

assert.strictEqual(currencyResult.ok, true);
assert.deepStrictEqual(currencyResult.bureau.supportedCurrencies, ["EUR", "GHS", "USD"]);

const dashboard = getOwnerDashboard(store, ownerResult.owner.id);
assert.strictEqual(dashboard.ok, true);
assert.strictEqual(dashboard.bureau.rating, 4.9);

const secondOwnerResult = createOwnerAccount(store, {
  name: "Kojo Owusu",
  email: "kojo@example.com"
});

assert.strictEqual(secondOwnerResult.ok, true);

const forbiddenEdit = updateOwnedBureauContact(store, {
  ownerId: secondOwnerResult.owner.id,
  bureauId: "accra-heritage-fx",
  phone: "+233 20 000 0000",
  email: "wrong@example.com"
});

assert.strictEqual(forbiddenEdit.ok, false);
assert.strictEqual(forbiddenEdit.error, "Owners can only edit their own bureau profile.");

assert.deepStrictEqual(normalizeCurrencyList("ghs, usd, bad-code, EUR"), ["EUR", "GHS", "USD"]);

console.log("owner profile tests passed");
