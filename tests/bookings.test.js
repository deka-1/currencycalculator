const assert = require("assert");
const { seededBureaus } = require("../src/bureaus");
const {
  claimBureauProfile,
  createOwnerAccount,
  createOwnerStore
} = require("../src/owners");
const {
  createBookingRequest,
  createBookingStore,
  getBookingsForOwner,
  updateBookingStatus
} = require("../src/bookings");

const bureaus = JSON.parse(JSON.stringify(seededBureaus));
const ownerStore = createOwnerStore({ bureaus });
const bookingStore = createBookingStore();

const accraOwner = createOwnerAccount(ownerStore, {
  name: "Ama Mensah",
  email: "ama-bookings@example.com"
}).owner;

claimBureauProfile(ownerStore, {
  ownerId: accraOwner.id,
  bureauId: "accra-heritage-fx"
});

const bookingResult = createBookingRequest(bookingStore, {
  bureaus,
  bureauId: "accra-heritage-fx",
  customerName: "Kojo Customer",
  customerEmail: "kojo@example.com",
  amount: "500",
  currencyPair: "USD/GHS",
  createdAt: "2026-04-30T14:00:00Z"
});

assert.strictEqual(bookingResult.ok, true);
assert.strictEqual(bookingResult.booking.status, "pending");
assert.strictEqual(bookingResult.booking.bureauName, "Accra Heritage Forex");
assert.strictEqual(bookingResult.booking.amount, 500);
assert.strictEqual(bookingResult.booking.requestedRate, 13.84);

const invalidBooking = createBookingRequest(bookingStore, {
  bureaus,
  bureauId: "accra-heritage-fx",
  customerName: "",
  customerEmail: "bad",
  amount: "0",
  currencyPair: "USD/GHS"
});

assert.strictEqual(invalidBooking.ok, false);
assert.strictEqual(invalidBooking.error, "Customer name is required.");

const ownerBookings = getBookingsForOwner({
  ownerStore,
  bookingStore,
  ownerId: accraOwner.id
});

assert.strictEqual(ownerBookings.ok, true);
assert.strictEqual(ownerBookings.bookings.length, 1);

const acceptResult = updateBookingStatus({
  ownerStore,
  bookingStore,
  ownerId: accraOwner.id,
  bookingId: bookingResult.booking.id,
  status: "accepted",
  updatedAt: "2026-04-30T14:05:00Z"
});

assert.strictEqual(acceptResult.ok, true);
assert.strictEqual(acceptResult.booking.status, "accepted");
assert.strictEqual(acceptResult.booking.updatedAt, "2026-04-30T14:05:00Z");

const temaOwner = createOwnerAccount(ownerStore, {
  name: "Yaw Tema",
  email: "yaw-tema@example.com"
}).owner;

claimBureauProfile(ownerStore, {
  ownerId: temaOwner.id,
  bureauId: "tema-harbour-exchange"
});

const forbiddenStatusChange = updateBookingStatus({
  ownerStore,
  bookingStore,
  ownerId: temaOwner.id,
  bookingId: bookingResult.booking.id,
  status: "rejected"
});

assert.strictEqual(forbiddenStatusChange.ok, false);
assert.strictEqual(forbiddenStatusChange.error, "Owners can only manage bookings for their own bureau.");

console.log("booking flow tests passed");
