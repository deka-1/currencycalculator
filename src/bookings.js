(function attachBookingManagement(globalScope) {
  "use strict";

  const allowedStatuses = new Set(["pending", "accepted", "rejected", "cancelled"]);

  function createBookingStore() {
    return {
      bookings: [],
      nextBookingNumber: 1
    };
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function normalizePair(pair) {
    const parts = String(pair || "")
      .toUpperCase()
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length !== 2 || parts[0] === parts[1]) {
      return null;
    }

    return `${parts[0]}/${parts[1]}`;
  }

  function findBureau(bureaus, bureauId) {
    return bureaus.find((bureau) => bureau.id === bureauId) || null;
  }

  function findRate(bureau, pair) {
    return bureau.rates.find((rate) => rate.pair === pair) || null;
  }

  function createBookingRequest(store, {
    bureaus,
    bureauId,
    customerName,
    customerEmail,
    amount,
    currencyPair,
    requestedRate,
    createdAt
  }) {
    const bureau = findBureau(bureaus, bureauId);
    const name = String(customerName || "").trim();
    const email = normalizeEmail(customerEmail);
    const numericAmount = Number(amount);
    const pair = normalizePair(currencyPair);

    if (!bureau) {
      return { ok: false, error: "Bureau profile was not found." };
    }

    if (!name) {
      return { ok: false, error: "Customer name is required." };
    }

    if (!email || !email.includes("@")) {
      return { ok: false, error: "A valid customer email is required." };
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return { ok: false, error: "Booking amount must be greater than zero." };
    }

    if (!pair) {
      return { ok: false, error: "Choose a valid currency pair." };
    }

    const rate = findRate(bureau, pair);

    if (!rate && typeof requestedRate === "undefined") {
      return { ok: false, error: "A visible rate is required for booking." };
    }

    const booking = {
      id: `booking-${store.nextBookingNumber}`,
      bureauId,
      bureauName: bureau.name,
      customerName: name,
      customerEmail: email,
      amount: numericAmount,
      currencyPair: pair,
      requestedRate: Number(requestedRate || rate.sell),
      status: "pending",
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: createdAt || new Date().toISOString()
    };

    store.nextBookingNumber += 1;
    store.bookings.push(booking);

    return { ok: true, booking };
  }

  function getBookingsForBureau(store, bureauId) {
    return store.bookings
      .filter((booking) => booking.bureauId === bureauId)
      .sort((first, second) => first.createdAt < second.createdAt ? 1 : -1);
  }

  function getOwnerBureau(ownerStore, ownerId) {
    const owner = ownerStore.owners.find((candidate) => candidate.id === ownerId);

    if (!owner) {
      return { ok: false, error: "Owner account was not found." };
    }

    if (!owner.bureauId) {
      return { ok: false, error: "Owner has not claimed a bureau profile." };
    }

    const bureau = ownerStore.bureaus.find((candidate) => candidate.id === owner.bureauId);

    if (!bureau) {
      return { ok: false, error: "Bureau profile was not found." };
    }

    if (bureau.disabled) {
      return { ok: false, error: "This bureau account has been disabled by admin moderation." };
    }

    return { ok: true, owner, bureau };
  }

  function getBookingsForOwner({ ownerStore, bookingStore, ownerId }) {
    const ownership = getOwnerBureau(ownerStore, ownerId);

    if (!ownership.ok) {
      return ownership;
    }

    return {
      ok: true,
      bureau: ownership.bureau,
      bookings: getBookingsForBureau(bookingStore, ownership.bureau.id)
    };
  }

  function updateBookingStatus({ ownerStore, bookingStore, ownerId, bookingId, status, updatedAt }) {
    const ownership = getOwnerBureau(ownerStore, ownerId);
    const normalizedStatus = String(status || "").trim().toLowerCase();

    if (!ownership.ok) {
      return ownership;
    }

    if (!allowedStatuses.has(normalizedStatus) || normalizedStatus === "pending") {
      return { ok: false, error: "Booking status is not supported." };
    }

    const booking = bookingStore.bookings.find((candidate) => candidate.id === bookingId);

    if (!booking) {
      return { ok: false, error: "Booking request was not found." };
    }

    if (booking.bureauId !== ownership.bureau.id) {
      return { ok: false, error: "Owners can only manage bookings for their own bureau." };
    }

    booking.status = normalizedStatus;
    booking.updatedAt = updatedAt || new Date().toISOString();

    return { ok: true, booking };
  }

  const bookings = {
    createBookingRequest,
    createBookingStore,
    getBookingsForBureau,
    getBookingsForOwner,
    updateBookingStatus
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = bookings;
  }

  globalScope.BookingManagement = bookings;
})(typeof globalThis !== "undefined" ? globalThis : window);
