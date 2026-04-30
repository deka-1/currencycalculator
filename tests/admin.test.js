const assert = require("assert");
const { seededBureaus } = require("../src/bureaus");
const { createTrustStore, submitUserReport } = require("../src/trust");
const {
  claimBureauProfile,
  createOwnerAccount,
  createOwnerStore,
  updateOwnedBureauContact
} = require("../src/owners");
require("../src/rates");
const { createBookingStore, getBookingsForOwner } = require("../src/bookings");
const {
  createAdminStore,
  disableBureauAccount,
  getAdminQueue,
  moderateBureauProfile,
  resolveReport,
  verifyBureau
} = require("../src/admin");

const bureaus = JSON.parse(JSON.stringify(seededBureaus));
const adminStore = createAdminStore();
const trustStore = createTrustStore();
const ownerStore = createOwnerStore({ bureaus });
const bookingStore = createBookingStore();

const forbiddenVerify = verifyBureau({
  adminStore,
  bureaus,
  adminId: "not-admin",
  bureauId: "takoradi-coastal-fx",
  verified: true
});

assert.strictEqual(forbiddenVerify.ok, false);
assert.strictEqual(forbiddenVerify.error, "Admin access is required.");

const verifyResult = verifyBureau({
  adminStore,
  bureaus,
  adminId: "admin-1",
  bureauId: "takoradi-coastal-fx",
  verified: true
});

assert.strictEqual(verifyResult.ok, true);
assert.strictEqual(verifyResult.bureau.verified, true);

const moderationResult = moderateBureauProfile({
  adminStore,
  bureaus,
  adminId: "admin-1",
  bureauId: "takoradi-coastal-fx",
  updates: {
    phone: "+233 31 222 2222",
    email: "moderated@example.com"
  }
});

assert.strictEqual(moderationResult.ok, true);
assert.strictEqual(moderationResult.bureau.phone, "+233 31 222 2222");
assert.strictEqual(moderationResult.bureau.email, "moderated@example.com");

const reportResult = submitUserReport(trustStore, {
  bureaus,
  bureauId: "takoradi-coastal-fx",
  reporterEmail: "reporter@example.com",
  type: "profile-details",
  message: "Phone number looked wrong."
});

assert.strictEqual(reportResult.ok, true);

const queue = getAdminQueue({
  adminStore,
  trustStore,
  adminId: "admin-1"
});

assert.strictEqual(queue.ok, true);
assert.strictEqual(queue.reports.length, 1);

const resolveResult = resolveReport({
  adminStore,
  trustStore,
  adminId: "admin-1",
  reportId: reportResult.report.id
});

assert.strictEqual(resolveResult.ok, true);
assert.strictEqual(resolveResult.report.status, "resolved");

const owner = createOwnerAccount(ownerStore, {
  name: "Takoradi Owner",
  email: "takoradi-owner@example.com"
}).owner;

claimBureauProfile(ownerStore, {
  ownerId: owner.id,
  bureauId: "takoradi-coastal-fx"
});

const disableResult = disableBureauAccount({
  adminStore,
  bureaus,
  adminId: "admin-1",
  bureauId: "takoradi-coastal-fx",
  disabled: true
});

assert.strictEqual(disableResult.ok, true);
assert.strictEqual(disableResult.bureau.disabled, true);

const disabledProfileEdit = updateOwnedBureauContact(ownerStore, {
  ownerId: owner.id,
  bureauId: "takoradi-coastal-fx",
  phone: "+233 31 333 3333",
  email: "disabled@example.com"
});

assert.strictEqual(disabledProfileEdit.ok, false);
assert.strictEqual(disabledProfileEdit.error, "This bureau account has been disabled by admin moderation.");

const disabledBookings = getBookingsForOwner({
  ownerStore,
  bookingStore,
  ownerId: owner.id
});

assert.strictEqual(disabledBookings.ok, false);
assert.strictEqual(disabledBookings.error, "This bureau account has been disabled by admin moderation.");

console.log("admin moderation tests passed");
