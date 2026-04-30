(function attachOwnerPortal(globalScope) {
  "use strict";

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function normalizeCurrencyList(currencies) {
    const values = Array.isArray(currencies)
      ? currencies
      : String(currencies || "").split(",");

    return Array.from(new Set(
      values
        .map((currency) => String(currency).trim().toUpperCase())
        .filter((currency) => /^[A-Z]{3}$/.test(currency))
    )).sort();
  }

  function createOwnerStore({ bureaus }) {
    return {
      bureaus,
      owners: [],
      nextOwnerNumber: 1
    };
  }

  function findBureau(store, bureauId) {
    return store.bureaus.find((bureau) => bureau.id === bureauId) || null;
  }

  function createOwnerAccount(store, { name, email }) {
    const ownerName = String(name || "").trim();
    const ownerEmail = normalizeEmail(email);

    if (!ownerName) {
      return { ok: false, error: "Owner name is required." };
    }

    if (!ownerEmail || !ownerEmail.includes("@")) {
      return { ok: false, error: "A valid owner email is required." };
    }

    if (store.owners.some((owner) => owner.email === ownerEmail)) {
      return { ok: false, error: "That owner email already exists." };
    }

    const owner = {
      id: `owner-${store.nextOwnerNumber}`,
      name: ownerName,
      email: ownerEmail,
      bureauId: null
    };

    store.nextOwnerNumber += 1;
    store.owners.push(owner);

    return { ok: true, owner };
  }

  function claimBureauProfile(store, { ownerId, bureauId }) {
    const owner = store.owners.find((candidate) => candidate.id === ownerId);
    const bureau = findBureau(store, bureauId);

    if (!owner) {
      return { ok: false, error: "Owner account was not found." };
    }

    if (!bureau) {
      return { ok: false, error: "Bureau profile was not found." };
    }

    const alreadyClaimed = store.owners.some((candidate) => (
      candidate.id !== ownerId && candidate.bureauId === bureauId
    ));

    if (alreadyClaimed) {
      return { ok: false, error: "That bureau profile is already claimed." };
    }

    owner.bureauId = bureauId;
    return { ok: true, owner, bureau };
  }

  function ensureOwnerCanEdit(store, ownerId, bureauId) {
    const owner = store.owners.find((candidate) => candidate.id === ownerId);

    if (!owner) {
      return { ok: false, error: "Owner account was not found." };
    }

    if (owner.bureauId !== bureauId) {
      return { ok: false, error: "Owners can only edit their own bureau profile." };
    }

    const bureau = findBureau(store, bureauId);

    if (!bureau) {
      return { ok: false, error: "Bureau profile was not found." };
    }

    if (bureau.disabled) {
      return { ok: false, error: "This bureau account has been disabled by admin moderation." };
    }

    return { ok: true, owner, bureau };
  }

  function updateOwnedBureauContact(store, { ownerId, bureauId, phone, email }) {
    const permission = ensureOwnerCanEdit(store, ownerId, bureauId);

    if (!permission.ok) {
      return permission;
    }

    const nextPhone = String(phone || "").trim();
    const nextEmail = normalizeEmail(email);

    if (!nextPhone) {
      return { ok: false, error: "Phone number is required." };
    }

    if (!nextEmail || !nextEmail.includes("@")) {
      return { ok: false, error: "A valid bureau email is required." };
    }

    permission.bureau.phone = nextPhone;
    permission.bureau.email = nextEmail;

    return { ok: true, bureau: permission.bureau };
  }

  function updateOwnedSupportedCurrencies(store, { ownerId, bureauId, supportedCurrencies }) {
    const permission = ensureOwnerCanEdit(store, ownerId, bureauId);

    if (!permission.ok) {
      return permission;
    }

    const currencies = normalizeCurrencyList(supportedCurrencies);

    if (currencies.length < 2) {
      return { ok: false, error: "Add at least two supported currencies." };
    }

    permission.bureau.supportedCurrencies = currencies;

    return { ok: true, bureau: permission.bureau };
  }

  function updateOwnedBureauRate(store, {
    ownerId,
    bureauId,
    fromCurrency,
    toCurrency,
    buy,
    sell,
    sourceType,
    updatedAt
  }) {
    const permission = ensureOwnerCanEdit(store, ownerId, bureauId);

    if (!permission.ok) {
      return permission;
    }

    if (!globalScope.RateManagement || typeof globalScope.RateManagement.upsertBureauRate !== "function") {
      return { ok: false, error: "Rate management is not available." };
    }

    return globalScope.RateManagement.upsertBureauRate({
      bureau: permission.bureau,
      fromCurrency,
      toCurrency,
      buy,
      sell,
      sourceType,
      updatedAt
    });
  }

  function getOwnerDashboard(store, ownerId) {
    const owner = store.owners.find((candidate) => candidate.id === ownerId);

    if (!owner) {
      return { ok: false, error: "Owner account was not found." };
    }

    return {
      ok: true,
      owner,
      bureau: owner.bureauId ? findBureau(store, owner.bureauId) : null
    };
  }

  const owners = {
    claimBureauProfile,
    createOwnerAccount,
    createOwnerStore,
    ensureOwnerCanEdit,
    getOwnerDashboard,
    normalizeCurrencyList,
    updateOwnedBureauContact,
    updateOwnedBureauRate,
    updateOwnedSupportedCurrencies
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = owners;
  }

  globalScope.OwnerPortal = owners;
})(typeof globalThis !== "undefined" ? globalThis : window);
