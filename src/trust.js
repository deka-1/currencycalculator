(function attachTrustManagement(globalScope) {
  "use strict";

  const reportTypes = new Set(["profile-details", "rate-data"]);

  function createTrustStore() {
    return {
      reviews: [],
      reports: [],
      nextReviewNumber: 1,
      nextReportNumber: 1
    };
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function findBureau(bureaus, bureauId) {
    return bureaus.find((bureau) => bureau.id === bureauId) || null;
  }

  function recalculateRating(bureau, rating) {
    const existingTotal = bureau.rating * bureau.reviewCount;
    const nextCount = bureau.reviewCount + 1;
    bureau.rating = Number(((existingTotal + rating) / nextCount).toFixed(2));
    bureau.reviewCount = nextCount;
  }

  function submitBureauReview(store, {
    bureaus,
    bureauId,
    reviewerName,
    reviewerEmail,
    rating,
    comment,
    createdAt
  }) {
    const bureau = findBureau(bureaus, bureauId);
    const name = String(reviewerName || "").trim();
    const email = normalizeEmail(reviewerEmail);
    const numericRating = Number(rating);
    const reviewComment = String(comment || "").trim();

    if (!bureau) {
      return { ok: false, error: "Bureau profile was not found." };
    }

    if (!name) {
      return { ok: false, error: "Reviewer name is required." };
    }

    if (!email || !email.includes("@")) {
      return { ok: false, error: "A valid reviewer email is required." };
    }

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return { ok: false, error: "Rating must be between 1 and 5." };
    }

    const review = {
      id: `review-${store.nextReviewNumber}`,
      bureauId,
      bureauName: bureau.name,
      reviewerName: name,
      reviewerEmail: email,
      rating: numericRating,
      comment: reviewComment,
      createdAt: createdAt || new Date().toISOString()
    };

    store.nextReviewNumber += 1;
    store.reviews.push(review);
    recalculateRating(bureau, numericRating);

    return { ok: true, review, bureau };
  }

  function submitUserReport(store, {
    bureaus,
    bureauId,
    reporterEmail,
    type,
    message,
    ratePair,
    createdAt
  }) {
    const bureau = findBureau(bureaus, bureauId);
    const email = normalizeEmail(reporterEmail);
    const reportType = String(type || "").trim();
    const reportMessage = String(message || "").trim();

    if (!bureau) {
      return { ok: false, error: "Bureau profile was not found." };
    }

    if (!email || !email.includes("@")) {
      return { ok: false, error: "A valid reporter email is required." };
    }

    if (!reportTypes.has(reportType)) {
      return { ok: false, error: "Report type is not supported." };
    }

    if (!reportMessage) {
      return { ok: false, error: "Report details are required." };
    }

    const report = {
      id: `report-${store.nextReportNumber}`,
      bureauId,
      bureauName: bureau.name,
      reporterEmail: email,
      type: reportType,
      message: reportMessage,
      ratePair: String(ratePair || "").trim().toUpperCase(),
      status: "open",
      createdAt: createdAt || new Date().toISOString()
    };

    store.nextReportNumber += 1;
    store.reports.push(report);

    return { ok: true, report };
  }

  function getReviewsForBureau(store, bureauId) {
    return store.reviews
      .filter((review) => review.bureauId === bureauId)
      .sort((first, second) => first.createdAt < second.createdAt ? 1 : -1);
  }

  function getOpenReports(store) {
    return store.reports.filter((report) => report.status === "open");
  }

  const trust = {
    createTrustStore,
    getOpenReports,
    getReviewsForBureau,
    submitBureauReview,
    submitUserReport
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = trust;
  }

  globalScope.TrustManagement = trust;
})(typeof globalThis !== "undefined" ? globalThis : window);
