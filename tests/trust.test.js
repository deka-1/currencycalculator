const assert = require("assert");
const { seededBureaus } = require("../src/bureaus");
const { getBureausSortedByRating } = require("../src/bureaus");
const {
  createTrustStore,
  getOpenReports,
  getReviewsForBureau,
  submitBureauReview,
  submitUserReport
} = require("../src/trust");

const bureaus = JSON.parse(JSON.stringify(seededBureaus));
const trustStore = createTrustStore();
const tamale = bureaus.find((bureau) => bureau.id === "tamale-savanna-exchange");
const originalReviewCount = tamale.reviewCount;

const reviewResult = submitBureauReview(trustStore, {
  bureaus,
  bureauId: "tamale-savanna-exchange",
  reviewerName: "Akosua",
  reviewerEmail: "akosua@example.com",
  rating: 5,
  comment: "Clear rates and quick service.",
  createdAt: "2026-04-30T15:00:00Z"
});

assert.strictEqual(reviewResult.ok, true);
assert.strictEqual(reviewResult.review.rating, 5);
assert.strictEqual(reviewResult.bureau.reviewCount, originalReviewCount + 1);
assert.ok(reviewResult.bureau.rating > 4.4);

const bureauReviews = getReviewsForBureau(trustStore, "tamale-savanna-exchange");
assert.strictEqual(bureauReviews.length, 1);
assert.strictEqual(bureauReviews[0].comment, "Clear rates and quick service.");

const reportResult = submitUserReport(trustStore, {
  bureaus,
  bureauId: "tamale-savanna-exchange",
  reporterEmail: "reporter@example.com",
  type: "rate-data",
  message: "The USD/GHS sell rate looked different in the shop.",
  ratePair: "USD/GHS",
  createdAt: "2026-04-30T15:05:00Z"
});

assert.strictEqual(reportResult.ok, true);
assert.strictEqual(reportResult.report.status, "open");
assert.strictEqual(reportResult.report.type, "rate-data");
assert.strictEqual(getOpenReports(trustStore).length, 1);

const invalidReview = submitBureauReview(trustStore, {
  bureaus,
  bureauId: "tamale-savanna-exchange",
  reviewerName: "Bad Rating",
  reviewerEmail: "bad@example.com",
  rating: 6
});

assert.strictEqual(invalidReview.ok, false);
assert.strictEqual(invalidReview.error, "Rating must be between 1 and 5.");

const ranked = getBureausSortedByRating(bureaus);
for (let index = 1; index < ranked.length; index += 1) {
  assert.ok(ranked[index - 1].rating >= ranked[index].rating);
}

console.log("trust signal tests passed");
