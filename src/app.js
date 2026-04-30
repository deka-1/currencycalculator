(function bootConverter() {
  "use strict";

  const {
    convertCurrency,
    getCurrencyLabel,
    getSupportedCurrencies
  } = window.CurrencyConverter;
  const {
    getBureauById,
    seededBureaus
  } = window.BureauDirectory;
  const {
    searchBureaus
  } = window.BureauSearch;
  const {
    getComparableRates
  } = window.RateManagement;
  const {
    claimBureauProfile,
    createOwnerAccount,
    createOwnerStore,
    getOwnerDashboard,
    updateOwnedBureauContact,
    updateOwnedBureauRate,
    updateOwnedSupportedCurrencies
  } = window.OwnerPortal;
  const {
    createBookingRequest,
    createBookingStore,
    getBookingsForOwner,
    updateBookingStatus
  } = window.BookingManagement;
  const {
    createTrustStore,
    getReviewsForBureau,
    submitBureauReview,
    submitUserReport
  } = window.TrustManagement;
  const {
    createAdminStore,
    disableBureauAccount,
    getAdminQueue,
    moderateBureauProfile,
    resolveReport,
    verifyBureau
  } = window.AdminModeration;

  const form = document.querySelector("#converter-form");
  const amountInput = document.querySelector("#amount");
  const fromSelect = document.querySelector("#from-currency");
  const toSelect = document.querySelector("#to-currency");
  const swapButton = document.querySelector("#swap-currencies");
  const errorMessage = document.querySelector("#form-error");
  const resultPanel = document.querySelector("#result-panel");
  const resultAmount = document.querySelector("#result-amount");
  const resultPair = document.querySelector("#result-pair");
  const resultRate = document.querySelector("#result-rate");
  const resultSource = document.querySelector("#result-source");
  const resultUpdated = document.querySelector("#result-updated");
  const bureauList = document.querySelector("#bureau-list");
  const bureauCount = document.querySelector("#bureau-count");
  const bureauProfile = document.querySelector("#bureau-profile");
  const bureauSearchForm = document.querySelector("#bureau-search-form");
  const bureauQuery = document.querySelector("#bureau-query");
  const searchFromSelect = document.querySelector("#search-from-currency");
  const searchToSelect = document.querySelector("#search-to-currency");
  const useLocationButton = document.querySelector("#use-location");
  const clearSearchButton = document.querySelector("#clear-search");
  const searchStatus = document.querySelector("#search-status");
  const ownerAccountForm = document.querySelector("#owner-account-form");
  const ownerNameInput = document.querySelector("#owner-name");
  const ownerEmailInput = document.querySelector("#owner-email");
  const ownerBureauSelect = document.querySelector("#owner-bureau-select");
  const ownerAccountStatus = document.querySelector("#owner-account-status");
  const ownerProfileForm = document.querySelector("#owner-profile-form");
  const ownerSummary = document.querySelector("#owner-summary");
  const ownerPhoneInput = document.querySelector("#owner-phone");
  const ownerProfileEmailInput = document.querySelector("#owner-profile-email");
  const ownerCurrenciesInput = document.querySelector("#owner-currencies");
  const saveOwnerProfileButton = document.querySelector("#save-owner-profile");
  const ownerProfileStatus = document.querySelector("#owner-profile-status");
  const ownerRateForm = document.querySelector("#owner-rate-form");
  const ownerRateFromSelect = document.querySelector("#owner-rate-from");
  const ownerRateToSelect = document.querySelector("#owner-rate-to");
  const ownerBuyRateInput = document.querySelector("#owner-buy-rate");
  const ownerSellRateInput = document.querySelector("#owner-sell-rate");
  const ownerRateSourceSelect = document.querySelector("#owner-rate-source");
  const saveOwnerRateButton = document.querySelector("#save-owner-rate");
  const ownerRateStatus = document.querySelector("#owner-rate-status");
  const compareRateFromSelect = document.querySelector("#compare-rate-from");
  const compareRateToSelect = document.querySelector("#compare-rate-to");
  const rateComparisonList = document.querySelector("#rate-comparison-list");
  const ownerBookingList = document.querySelector("#owner-booking-list");
  const adminLoginForm = document.querySelector("#admin-login-form");
  const adminEmailInput = document.querySelector("#admin-email");
  const adminStatus = document.querySelector("#admin-status");
  const adminProfileForm = document.querySelector("#admin-profile-form");
  const adminBureauSelect = document.querySelector("#admin-bureau-select");
  const adminBureauNameInput = document.querySelector("#admin-bureau-name");
  const adminBureauAreaInput = document.querySelector("#admin-bureau-area");
  const adminBureauCityInput = document.querySelector("#admin-bureau-city");
  const adminBureauPhoneInput = document.querySelector("#admin-bureau-phone");
  const adminBureauEmailInput = document.querySelector("#admin-bureau-email");
  const adminSaveProfileButton = document.querySelector("#admin-save-profile");
  const adminVerifyButton = document.querySelector("#admin-verify-bureau");
  const adminUnverifyButton = document.querySelector("#admin-unverify-bureau");
  const adminDisableButton = document.querySelector("#admin-disable-bureau");
  const adminReportList = document.querySelector("#admin-report-list");

  let currentBureauResults = [];
  let activeOwnerId = null;
  let activeAdminId = null;
  const ownerStore = createOwnerStore({ bureaus: seededBureaus });
  const bookingStore = createBookingStore();
  const trustStore = createTrustStore();
  const adminStore = createAdminStore();

  function populateCurrencySelects() {
    const currencies = getSupportedCurrencies();
    const options = currencies
      .map((code) => `<option value="${code}">${getCurrencyLabel(code)}</option>`)
      .join("");

    fromSelect.innerHTML = options;
    toSelect.innerHTML = options;
    searchFromSelect.innerHTML = options;
    searchToSelect.innerHTML = options;
    ownerRateFromSelect.innerHTML = options;
    ownerRateToSelect.innerHTML = options;
    compareRateFromSelect.innerHTML = options;
    compareRateToSelect.innerHTML = options;
    fromSelect.value = "GHS";
    toSelect.value = "USD";
    searchFromSelect.value = "USD";
    searchToSelect.value = "GHS";
    ownerRateFromSelect.value = "USD";
    ownerRateToSelect.value = "GHS";
    compareRateFromSelect.value = "USD";
    compareRateToSelect.value = "GHS";
  }

  function populateOwnerBureauSelect() {
    ownerBureauSelect.innerHTML = seededBureaus
      .map((bureau) => `<option value="${bureau.id}">${bureau.name} - ${bureau.area}, ${bureau.city}</option>`)
      .join("");
  }

  function populateAdminBureauSelect() {
    adminBureauSelect.innerHTML = seededBureaus
      .map((bureau) => `<option value="${bureau.id}">${bureau.name} - ${bureau.area}, ${bureau.city}</option>`)
      .join("");
  }

  function formatMoney(value, currency) {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency,
      maximumFractionDigits: value >= 100 ? 2 : 4
    }).format(value);
  }

  function formatRate(value) {
    return new Intl.NumberFormat("en-GH", {
      maximumFractionDigits: 6
    }).format(value);
  }

  function formatUpdatedDate(value) {
    return new Intl.DateTimeFormat("en-GH", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC"
    }).format(new Date(value));
  }

  function formatShortDate(value) {
    return new Intl.DateTimeFormat("en-GH", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC"
    }).format(new Date(value));
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    resultPanel.hidden = true;
  }

  function showResult(result) {
    errorMessage.hidden = true;
    resultPanel.hidden = false;
    resultAmount.textContent = formatMoney(result.convertedAmount, result.toCurrency);
    resultPair.textContent = `${result.fromCurrency} to ${result.toCurrency}`;
    resultRate.textContent = `1 ${result.fromCurrency} = ${formatRate(result.rate)} ${result.toCurrency}`;
    resultSource.textContent = result.sourceLabel;
    resultUpdated.textContent = formatUpdatedDate(result.lastUpdated);
  }

  function runConversion() {
    const result = convertCurrency({
      amount: amountInput.value,
      fromCurrency: fromSelect.value,
      toCurrency: toSelect.value
    });

    if (!result.ok) {
      showError(result.error);
      return;
    }

    showResult(result);
  }

  function badgeMarkup(bureau) {
    const className = bureau.verified ? "verified-badge" : "unverified-badge";
    const label = bureau.verified ? "Verified" : "Pending verification";
    return `<span class="${className}">${label}</span>`;
  }

  function renderContacts(bureau) {
    return `
      <ul class="contact-list">
        <li><a href="tel:${bureau.phone.replaceAll(" ", "")}">${bureau.phone}</a></li>
        <li><a href="mailto:${bureau.email}">${bureau.email}</a></li>
      </ul>
    `;
  }

  function renderCurrencyChips(currencies) {
    return `
      <ul class="currency-chips">
        ${currencies.map((currency) => `<li class="currency-chip">${currency}</li>`).join("")}
      </ul>
    `;
  }

  function formatDistance(distanceKm) {
    if (distanceKm === null || typeof distanceKm === "undefined") {
      return "";
    }

    if (distanceKm < 1) {
      return "less than 1 km away";
    }

    return `${Math.round(distanceKm)} km away`;
  }

  function renderBureauList(bureaus, statusPrefix = "Showing") {
    currentBureauResults = bureaus;
    bureauCount.textContent = `${bureaus.length} seeded profiles`;

    if (!bureaus.length) {
      bureauList.innerHTML = `
        <div class="empty-state">
          No bureaus matched that search. Try another Ghana city, area, or currency pair.
        </div>
      `;
      bureauProfile.innerHTML = `
        <div class="profile-section">
          <h3 id="profile-title">No profile selected</h3>
          <p class="profile-location">Search results will appear here when a bureau matches.</p>
        </div>
      `;
      searchStatus.textContent = "No matching bureaus found.";
      return;
    }

    searchStatus.textContent = `${statusPrefix} ${bureaus.length} bureau${bureaus.length === 1 ? "" : "s"}, ranked by best rating.`;
    bureauList.innerHTML = bureaus
      .map((bureau, index) => `
        <article class="bureau-card">
          <div class="bureau-card-header">
            <div class="bureau-title">
              <h4>${bureau.name}</h4>
              <p>${bureau.area}, ${bureau.city}</p>
              ${bureau.distanceKm !== null && typeof bureau.distanceKm !== "undefined" ? `<p>${formatDistance(bureau.distanceKm)}</p>` : ""}
            </div>
            ${badgeMarkup(bureau)}
          </div>
          <div class="rating-line">
            <span>${bureau.rating.toFixed(1)} rating</span>
            <span>${bureau.reviewCount} reviews</span>
          </div>
          ${renderContacts(bureau)}
          ${renderCurrencyChips(bureau.supportedCurrencies)}
          <button
            class="secondary-action"
            type="button"
            data-profile-id="${bureau.id}"
            aria-current="${index === 0 ? "true" : "false"}"
          >
            View profile
          </button>
        </article>
      `)
      .join("");

    renderProfile(bureaus[0].id);
  }

  function renderRateList(rates) {
    if (!rates.length) {
      return "<p class=\"profile-location\">No visible rates yet.</p>";
    }

    return `
      <ul class="rate-list">
        ${rates.map((rate) => `
          <li>
            <span>
              <strong>${rate.pair}</strong><br />
              <span class="rate-source">${rate.source}</span>
            </span>
            <span>
              Buy ${rate.buy}<br />
              Sell ${rate.sell}<br />
              <span class="rate-source">${formatShortDate(rate.updatedAt)}</span>
            </span>
          </li>
        `).join("")}
      </ul>
    `;
  }

  function renderBookingPairOptions(bureau) {
    return bureau.rates
      .map((rate) => `<option value="${rate.pair}" data-sell="${rate.sell}">${rate.pair} at sell ${rate.sell}</option>`)
      .join("");
  }

  function renderRecentReviews(bureau) {
    const reviews = getReviewsForBureau(trustStore, bureau.id).slice(0, 3);

    if (!reviews.length) {
      return "<p class=\"profile-location\">No new reviews in this demo session.</p>";
    }

    return `
      <ul class="rate-list">
        ${reviews.map((review) => `
          <li>
            <span>
              <strong>${review.rating}/5 from ${review.reviewerName}</strong><br />
              <span class="rate-source">${review.comment || "No comment provided."}</span>
            </span>
            <span class="rate-source">${formatShortDate(review.createdAt)}</span>
          </li>
        `).join("")}
      </ul>
    `;
  }

  function renderProfile(id) {
    const bureau = getBureauById(id);

    if (!bureau) {
      return;
    }

    bureauProfile.innerHTML = `
      ${badgeMarkup(bureau)}
      <div class="profile-section">
        <h3 id="profile-title">${bureau.name}</h3>
        <p class="profile-location">${bureau.area}, ${bureau.city}</p>
      </div>
      <div class="profile-section">
        <h4>Rating</h4>
        <p class="rating-line">${bureau.rating.toFixed(1)} rating from ${bureau.reviewCount} reviews</p>
      </div>
      <div class="profile-section">
        <h4>Contact</h4>
        ${renderContacts(bureau)}
      </div>
      <div class="profile-section">
        <h4>Supported currencies</h4>
        ${renderCurrencyChips(bureau.supportedCurrencies)}
      </div>
      <div class="profile-section">
        <h4>Visible demo rates</h4>
        ${renderRateList(bureau.rates)}
      </div>
      <div class="profile-section">
        <h4>Book this rate</h4>
        <form class="booking-form" data-booking-form data-bureau-id="${bureau.id}" novalidate>
          <label class="field">
            <span>Your name</span>
            <input name="customerName" type="text" required />
          </label>
          <label class="field">
            <span>Your email</span>
            <input name="customerEmail" type="email" required />
          </label>
          <label class="field">
            <span>Amount</span>
            <input name="bookingAmount" type="number" min="0" step="0.01" required />
          </label>
          <label class="field">
            <span>Currency pair</span>
            <select name="bookingPair" required>
              ${renderBookingPairOptions(bureau)}
            </select>
          </label>
          <button class="primary-action" type="submit">Request booking</button>
          <p class="search-status" data-booking-status role="status"></p>
        </form>
      </div>
      <div class="profile-section">
        <h4>Reviews and reports</h4>
        ${renderRecentReviews(bureau)}
        <form class="booking-form" data-review-form data-bureau-id="${bureau.id}" novalidate>
          <label class="field">
            <span>Your name</span>
            <input name="reviewerName" type="text" required />
          </label>
          <label class="field">
            <span>Your email</span>
            <input name="reviewerEmail" type="email" required />
          </label>
          <label class="field">
            <span>Rating</span>
            <select name="rating" required>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Okay</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Bad</option>
            </select>
          </label>
          <label class="field">
            <span>Review</span>
            <input name="comment" type="text" placeholder="Helpful service and clear rates" />
          </label>
          <button class="primary-action" type="submit">Submit review</button>
          <p class="search-status" data-review-status role="status"></p>
        </form>
        <form class="booking-form" data-report-form data-bureau-id="${bureau.id}" novalidate>
          <label class="field">
            <span>Your email</span>
            <input name="reporterEmail" type="email" required />
          </label>
          <label class="field">
            <span>Report type</span>
            <select name="reportType" required>
              <option value="profile-details">Profile details</option>
              <option value="rate-data">Rate data</option>
            </select>
          </label>
          <label class="field">
            <span>Rate pair</span>
            <select name="ratePair">
              <option value="">Not rate-specific</option>
              ${renderBookingPairOptions(bureau)}
            </select>
          </label>
          <label class="field">
            <span>Details</span>
            <input name="reportMessage" type="text" placeholder="Tell us what looks inaccurate" required />
          </label>
          <button class="secondary-action" type="submit">Report issue</button>
          <p class="search-status" data-report-status role="status"></p>
        </form>
      </div>
    `;

    document.querySelectorAll("[data-profile-id]").forEach((button) => {
      button.setAttribute("aria-current", String(button.dataset.profileId === id));
    });
  }

  function bootDirectory() {
    renderBureauList(searchBureaus({ bureaus: seededBureaus }), "Showing");
  }

  function getSelectedSearchPair() {
    return `${searchFromSelect.value}/${searchToSelect.value}`;
  }

  function runManualSearch() {
    const results = searchBureaus({
      bureaus: seededBureaus,
      query: bureauQuery.value,
      currencyPair: getSelectedSearchPair()
    });

    renderBureauList(results, bureauQuery.value ? `Showing matches for "${bureauQuery.value}"` : "Showing");
  }

  function runLocationSearch() {
    if (!navigator.geolocation) {
      searchStatus.textContent = "Browser location is not available here. Try city or area search.";
      return;
    }

    searchStatus.textContent = "Checking your browser location...";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const results = searchBureaus({
          bureaus: seededBureaus,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          },
          currencyPair: getSelectedSearchPair()
        });

        renderBureauList(results, "Showing nearby matches");
      },
      () => {
        searchStatus.textContent = "Location permission was not granted. Try city or area search.";
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }

  function clearDirectorySearch() {
    bureauQuery.value = "";
    searchFromSelect.value = "USD";
    searchToSelect.value = "GHS";
    renderBureauList(searchBureaus({ bureaus: seededBureaus }), "Showing");
  }

  function setOwnerFormEnabled(enabled) {
    ownerPhoneInput.disabled = !enabled;
    ownerProfileEmailInput.disabled = !enabled;
    ownerCurrenciesInput.disabled = !enabled;
    saveOwnerProfileButton.disabled = !enabled;
    ownerRateFromSelect.disabled = !enabled;
    ownerRateToSelect.disabled = !enabled;
    ownerBuyRateInput.disabled = !enabled;
    ownerSellRateInput.disabled = !enabled;
    ownerRateSourceSelect.disabled = !enabled;
    saveOwnerRateButton.disabled = !enabled;
  }

  function setAdminFormEnabled(enabled) {
    adminBureauSelect.disabled = !enabled;
    adminBureauNameInput.disabled = !enabled;
    adminBureauAreaInput.disabled = !enabled;
    adminBureauCityInput.disabled = !enabled;
    adminBureauPhoneInput.disabled = !enabled;
    adminBureauEmailInput.disabled = !enabled;
    adminSaveProfileButton.disabled = !enabled;
    adminVerifyButton.disabled = !enabled;
    adminUnverifyButton.disabled = !enabled;
    adminDisableButton.disabled = !enabled;
  }

  function fillAdminProfileForm() {
    const bureau = getBureauById(adminBureauSelect.value);

    if (!bureau) {
      return;
    }

    adminBureauNameInput.value = bureau.name;
    adminBureauAreaInput.value = bureau.area;
    adminBureauCityInput.value = bureau.city;
    adminBureauPhoneInput.value = bureau.phone;
    adminBureauEmailInput.value = bureau.email;
    adminDisableButton.textContent = bureau.disabled ? "Enable" : "Disable";
  }

  function refreshOwnerDashboard(message = "") {
    if (!activeOwnerId) {
      setOwnerFormEnabled(false);
      ownerSummary.textContent = "Create an owner account to unlock profile management.";
      return;
    }

    const dashboard = getOwnerDashboard(ownerStore, activeOwnerId);

    if (!dashboard.ok || !dashboard.bureau) {
      setOwnerFormEnabled(false);
      ownerSummary.textContent = dashboard.error || "Claim a bureau profile to manage it.";
      return;
    }

    const { owner, bureau } = dashboard;
    setOwnerFormEnabled(true);
    ownerPhoneInput.value = bureau.phone;
    ownerProfileEmailInput.value = bureau.email;
    ownerCurrenciesInput.value = bureau.supportedCurrencies.join(", ");
    ownerSummary.innerHTML = `
      <strong>${owner.name}</strong> is managing <strong>${bureau.name}</strong>.<br />
      Rating: ${bureau.rating.toFixed(1)} from ${bureau.reviewCount} reviews.
    `;
    ownerProfileStatus.textContent = message;
    renderOwnerBookings();
  }

  function getSelectedComparisonPair() {
    return `${compareRateFromSelect.value}/${compareRateToSelect.value}`;
  }

  function renderRateComparison() {
    const comparableRates = getComparableRates({
      bureaus: seededBureaus,
      currencyPair: getSelectedComparisonPair()
    });

    if (!comparableRates.length) {
      rateComparisonList.innerHTML = `
        <div class="empty-state">
          No visible rates for ${getSelectedComparisonPair()} yet.
        </div>
      `;
      return;
    }

    rateComparisonList.innerHTML = comparableRates
      .map((rate) => `
        <article class="comparison-row">
          <div>
            <strong>${rate.bureauName}</strong>
            <p>${rate.area}, ${rate.city} · ${rate.rating.toFixed(1)} rating</p>
          </div>
          <div>
            <strong>${rate.pair}</strong>
            <p>Buy ${rate.buy} · Sell ${rate.sell}</p>
          </div>
          <div>
            <strong>${rate.source}</strong>
            <p>${formatShortDate(rate.updatedAt)}</p>
          </div>
        </article>
      `)
      .join("");
  }

  function renderOwnerBookings() {
    if (!activeOwnerId) {
      ownerBookingList.innerHTML = "<div class=\"empty-state\">Create an owner account to view booking requests.</div>";
      return;
    }

    const bookingResult = getBookingsForOwner({
      ownerStore,
      bookingStore,
      ownerId: activeOwnerId
    });

    if (!bookingResult.ok) {
      ownerBookingList.innerHTML = `<div class="empty-state">${bookingResult.error}</div>`;
      return;
    }

    if (!bookingResult.bookings.length) {
      ownerBookingList.innerHTML = "<div class=\"empty-state\">No booking requests yet.</div>";
      return;
    }

    ownerBookingList.innerHTML = bookingResult.bookings
      .map((booking) => `
        <article class="comparison-row">
          <div>
            <strong>${booking.customerName}</strong>
            <p>${booking.customerEmail}</p>
            <span class="status-pill">${booking.status}</span>
          </div>
          <div>
            <strong>${booking.currencyPair}</strong>
            <p>Amount ${booking.amount} - requested rate ${booking.requestedRate}</p>
          </div>
          <div>
            <p>${formatShortDate(booking.createdAt)}</p>
            <div class="booking-actions">
              <button class="secondary-action" type="button" data-booking-id="${booking.id}" data-booking-status="accepted">Accept</button>
              <button class="quiet-action" type="button" data-booking-id="${booking.id}" data-booking-status="rejected">Reject</button>
            </div>
          </div>
        </article>
      `)
      .join("");
  }

  function renderAdminReports() {
    if (!activeAdminId) {
      adminReportList.innerHTML = "<div class=\"empty-state\">Open the admin console to review reports.</div>";
      return;
    }

    const queue = getAdminQueue({
      adminStore,
      trustStore,
      adminId: activeAdminId
    });

    if (!queue.ok) {
      adminReportList.innerHTML = `<div class="empty-state">${queue.error}</div>`;
      return;
    }

    if (!queue.reports.length) {
      adminReportList.innerHTML = "<div class=\"empty-state\">No open reports.</div>";
      return;
    }

    adminReportList.innerHTML = queue.reports
      .map((report) => `
        <article class="comparison-row">
          <div>
            <strong>${report.bureauName}</strong>
            <p>${report.type}${report.ratePair ? ` - ${report.ratePair}` : ""}</p>
            <span class="status-pill">${report.status}</span>
          </div>
          <div>
            <strong>${report.reporterEmail}</strong>
            <p>${report.message}</p>
          </div>
          <div>
            <p>${formatShortDate(report.createdAt)}</p>
            <button class="secondary-action" type="button" data-report-id="${report.id}">Resolve</button>
          </div>
        </article>
      `)
      .join("");
  }

  function refreshDirectoryAfterOwnerEdit() {
    const results = searchBureaus({
      bureaus: seededBureaus,
      query: bureauQuery.value,
      currencyPair: getSelectedSearchPair()
    });

    renderBureauList(results, bureauQuery.value ? `Showing matches for "${bureauQuery.value}"` : "Showing");
  }

  function refreshMarketplaceViews() {
    refreshDirectoryAfterOwnerEdit();
    renderRateComparison();
    refreshOwnerDashboard();
    fillAdminProfileForm();
    renderAdminReports();
  }

  function refreshDirectoryAfterTrustUpdate(bureauId) {
    const results = searchBureaus({
      bureaus: seededBureaus,
      query: bureauQuery.value,
      currencyPair: getSelectedSearchPair()
    });

    renderBureauList(results, bureauQuery.value ? `Showing matches for "${bureauQuery.value}"` : "Showing");
    renderProfile(bureauId);
    refreshOwnerDashboard();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runConversion();
  });

  swapButton.addEventListener("click", () => {
    const currentFrom = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = currentFrom;

    if (amountInput.value) {
      runConversion();
    }
  });

  bureauList.addEventListener("click", (event) => {
    const profileButton = event.target.closest("[data-profile-id]");

    if (!profileButton) {
      return;
    }

    renderProfile(profileButton.dataset.profileId);
  });

  bureauProfile.addEventListener("submit", (event) => {
    const bookingForm = event.target.closest("[data-booking-form]");
    const reviewForm = event.target.closest("[data-review-form]");
    const reportForm = event.target.closest("[data-report-form]");

    if (!bookingForm && !reviewForm && !reportForm) {
      return;
    }

    event.preventDefault();

    if (reviewForm) {
      const status = reviewForm.querySelector("[data-review-status]");
      const reviewResult = submitBureauReview(trustStore, {
        bureaus: seededBureaus,
        bureauId: reviewForm.dataset.bureauId,
        reviewerName: reviewForm.elements.reviewerName.value,
        reviewerEmail: reviewForm.elements.reviewerEmail.value,
        rating: reviewForm.elements.rating.value,
        comment: reviewForm.elements.comment.value
      });

      if (!reviewResult.ok) {
        status.textContent = reviewResult.error;
        return;
      }

      reviewForm.reset();
      refreshDirectoryAfterTrustUpdate(reviewForm.dataset.bureauId);
      return;
    }

    if (reportForm) {
      const status = reportForm.querySelector("[data-report-status]");
      const reportResult = submitUserReport(trustStore, {
        bureaus: seededBureaus,
        bureauId: reportForm.dataset.bureauId,
        reporterEmail: reportForm.elements.reporterEmail.value,
        type: reportForm.elements.reportType.value,
        message: reportForm.elements.reportMessage.value,
        ratePair: reportForm.elements.ratePair.value
      });

      if (!reportResult.ok) {
        status.textContent = reportResult.error;
        return;
      }

      status.textContent = `Report ${reportResult.report.id} submitted for admin review.`;
      reportForm.reset();
      renderAdminReports();
      return;
    }

    const pairSelect = bookingForm.elements.bookingPair;
    const selectedOption = pairSelect.options[pairSelect.selectedIndex];
    const status = bookingForm.querySelector("[data-booking-status]");
    const bookingResult = createBookingRequest(bookingStore, {
      bureaus: seededBureaus,
      bureauId: bookingForm.dataset.bureauId,
      customerName: bookingForm.elements.customerName.value,
      customerEmail: bookingForm.elements.customerEmail.value,
      amount: bookingForm.elements.bookingAmount.value,
      currencyPair: pairSelect.value,
      requestedRate: selectedOption ? selectedOption.dataset.sell : undefined
    });

    if (!bookingResult.ok) {
      status.textContent = bookingResult.error;
      return;
    }

    status.textContent = `Booking ${bookingResult.booking.id} submitted. Status: pending.`;
    bookingForm.reset();
    renderOwnerBookings();
  });

  bureauSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    runManualSearch();
  });

  searchFromSelect.addEventListener("change", runManualSearch);
  searchToSelect.addEventListener("change", runManualSearch);
  useLocationButton.addEventListener("click", runLocationSearch);
  clearSearchButton.addEventListener("click", clearDirectorySearch);

  ownerAccountForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const accountResult = createOwnerAccount(ownerStore, {
      name: ownerNameInput.value,
      email: ownerEmailInput.value
    });

    if (!accountResult.ok) {
      ownerAccountStatus.textContent = accountResult.error;
      return;
    }

    const claimResult = claimBureauProfile(ownerStore, {
      ownerId: accountResult.owner.id,
      bureauId: ownerBureauSelect.value
    });

    if (!claimResult.ok) {
      ownerAccountStatus.textContent = claimResult.error;
      return;
    }

    activeOwnerId = accountResult.owner.id;
    ownerAccountStatus.textContent = "Owner dashboard created.";
    refreshOwnerDashboard("Profile ready to manage.");
  });

  ownerProfileForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const dashboard = getOwnerDashboard(ownerStore, activeOwnerId);

    if (!dashboard.ok || !dashboard.bureau) {
      ownerProfileStatus.textContent = dashboard.error || "Create an owner account first.";
      return;
    }

    const contactResult = updateOwnedBureauContact(ownerStore, {
      ownerId: activeOwnerId,
      bureauId: dashboard.bureau.id,
      phone: ownerPhoneInput.value,
      email: ownerProfileEmailInput.value
    });

    if (!contactResult.ok) {
      ownerProfileStatus.textContent = contactResult.error;
      return;
    }

    const currencyResult = updateOwnedSupportedCurrencies(ownerStore, {
      ownerId: activeOwnerId,
      bureauId: dashboard.bureau.id,
      supportedCurrencies: ownerCurrenciesInput.value
    });

    if (!currencyResult.ok) {
      ownerProfileStatus.textContent = currencyResult.error;
      return;
    }

    refreshOwnerDashboard("Profile changes saved.");
    refreshDirectoryAfterOwnerEdit();
  });

  ownerRateForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const dashboard = getOwnerDashboard(ownerStore, activeOwnerId);

    if (!dashboard.ok || !dashboard.bureau) {
      ownerRateStatus.textContent = dashboard.error || "Create an owner account first.";
      return;
    }

    const rateResult = updateOwnedBureauRate(ownerStore, {
      ownerId: activeOwnerId,
      bureauId: dashboard.bureau.id,
      fromCurrency: ownerRateFromSelect.value,
      toCurrency: ownerRateToSelect.value,
      buy: ownerBuyRateInput.value,
      sell: ownerSellRateInput.value,
      sourceType: ownerRateSourceSelect.value
    });

    if (!rateResult.ok) {
      ownerRateStatus.textContent = rateResult.error;
      return;
    }

    ownerRateStatus.textContent = `${rateResult.rate.pair} rate saved with ${rateResult.rate.source} source.`;
    refreshDirectoryAfterOwnerEdit();
    renderRateComparison();
  });

  compareRateFromSelect.addEventListener("change", renderRateComparison);
  compareRateToSelect.addEventListener("change", renderRateComparison);

  ownerBookingList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-booking-id]");

    if (!actionButton) {
      return;
    }

    const result = updateBookingStatus({
      ownerStore,
      bookingStore,
      ownerId: activeOwnerId,
      bookingId: actionButton.dataset.bookingId,
      status: actionButton.dataset.bookingStatus
    });

    if (!result.ok) {
      ownerRateStatus.textContent = result.error;
      return;
    }

    ownerRateStatus.textContent = `Booking ${result.booking.id} ${result.booking.status}.`;
    renderOwnerBookings();
  });

  adminLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const admin = adminStore.admins.find((candidate) => (
      candidate.email === adminEmailInput.value.trim().toLowerCase()
    ));

    if (!admin) {
      adminStatus.textContent = "Admin access is required.";
      return;
    }

    activeAdminId = admin.id;
    adminStatus.textContent = "Admin console opened.";
    setAdminFormEnabled(true);
    fillAdminProfileForm();
    renderAdminReports();
  });

  adminBureauSelect.addEventListener("change", fillAdminProfileForm);

  adminProfileForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const result = moderateBureauProfile({
      adminStore,
      bureaus: seededBureaus,
      adminId: activeAdminId,
      bureauId: adminBureauSelect.value,
      updates: {
        name: adminBureauNameInput.value,
        area: adminBureauAreaInput.value,
        city: adminBureauCityInput.value,
        phone: adminBureauPhoneInput.value,
        email: adminBureauEmailInput.value
      }
    });

    adminStatus.textContent = result.ok ? "Bureau profile moderated." : result.error;

    if (result.ok) {
      refreshMarketplaceViews();
    }
  });

  adminVerifyButton.addEventListener("click", () => {
    const result = verifyBureau({
      adminStore,
      bureaus: seededBureaus,
      adminId: activeAdminId,
      bureauId: adminBureauSelect.value,
      verified: true
    });

    adminStatus.textContent = result.ok ? "Bureau verified." : result.error;

    if (result.ok) {
      refreshMarketplaceViews();
    }
  });

  adminUnverifyButton.addEventListener("click", () => {
    const result = verifyBureau({
      adminStore,
      bureaus: seededBureaus,
      adminId: activeAdminId,
      bureauId: adminBureauSelect.value,
      verified: false
    });

    adminStatus.textContent = result.ok ? "Bureau unverified." : result.error;

    if (result.ok) {
      refreshMarketplaceViews();
    }
  });

  adminDisableButton.addEventListener("click", () => {
    const bureau = getBureauById(adminBureauSelect.value);
    const result = disableBureauAccount({
      adminStore,
      bureaus: seededBureaus,
      adminId: activeAdminId,
      bureauId: adminBureauSelect.value,
      disabled: !bureau.disabled
    });

    adminStatus.textContent = result.ok
      ? `Bureau ${result.bureau.disabled ? "disabled" : "enabled"}.`
      : result.error;

    if (result.ok) {
      refreshMarketplaceViews();
    }
  });

  adminReportList.addEventListener("click", (event) => {
    const reportButton = event.target.closest("[data-report-id]");

    if (!reportButton) {
      return;
    }

    const result = resolveReport({
      adminStore,
      trustStore,
      adminId: activeAdminId,
      reportId: reportButton.dataset.reportId
    });

    adminStatus.textContent = result.ok ? "Report resolved." : result.error;
    renderAdminReports();
  });

  populateCurrencySelects();
  populateOwnerBureauSelect();
  populateAdminBureauSelect();
  setAdminFormEnabled(false);
  amountInput.value = "1000";
  runConversion();
  bootDirectory();
  refreshOwnerDashboard();
  renderRateComparison();
  renderOwnerBookings();
  renderAdminReports();
})();
