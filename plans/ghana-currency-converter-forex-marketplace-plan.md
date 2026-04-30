# Plan: Ghana Currency Converter & Forex Bureau Marketplace

> Source PRD: `plans/ghana-currency-converter-forex-marketplace-prd.md`

## Architectural Decisions

Durable decisions that apply across all phases:

- **Primary market**: Ghana-first marketplace, with early location support for Accra, Kumasi, Tema, Takoradi, Cape Coast, and Tamale.
- **Currency support**: All world currencies should be available in the converter and rate-management flows.
- **Routes**: Public users should have routes for the converter, bureau directory, bureau profile pages, search results, and booking requests. Bureau owners should have dashboard routes for profile, supported currencies, rates, ratings, and bookings. Admins should have moderation routes for verification, reports, profiles, and account status.
- **Key models**: Currency, ExchangeRate, RateSource, ForexBureau, BureauProfile, BureauSupportedCurrency, BureauRating, BureauReview, BookingRequest, UserReport, User, and AdminAction.
- **Rate sources**: Rates must be normalized across official market rates, bureau-submitted rates, partner-provided rates, scraped rates where legally permitted, and user-reported signals.
- **Trust signals**: Bureau verification status, user ratings, source labels, and rate freshness timestamps should be visible where they affect user decisions.
- **Ranking**: Bureau listing order should prioritize best rating first. Distance, rate quality, verification status, and supported currency filters can be layered in as secondary controls.
- **Location search**: Users should be able to search by manual city or area entry and by browser location permission.
- **Authentication**: Public browsing and conversion should not require login. Bureau profile management, rate updates, booking management, and admin moderation require authenticated roles.
- **Authorization**: Bureau owners can only manage their own bureau records. Admins can verify, moderate, disable, and review reports across the marketplace.
- **Booking lifecycle**: Booking requests should support at least pending, accepted, rejected, and cancelled statuses.
- **Testing approach**: Tests should focus on user-visible behavior and stable module contracts, using mocked exchange-rate providers and deterministic Ghana location fixtures.

---

## Phase 1: Public Currency Converter

**Status**: Done

**User stories**: 1, 2, 15

### What to Build

Build the first complete public path: a visitor can enter an amount, choose any source currency, choose any target currency, and see a converted estimate. The result should include the exchange-rate source and last-updated timestamp so users understand how much to trust the number.

This phase should establish the currency list, conversion behavior, rate-source labeling, and a testable conversion module that later phases can reuse.

### Acceptance Criteria

- [x] A visitor can enter an amount and convert from one world currency to another.
- [x] The converter validates missing, invalid, and negative amounts.
- [x] The result displays the converted amount, selected currency pair, rate source, and last-updated timestamp.
- [x] Currency conversion behavior can be tested with mocked rate data.
- [x] The interface works without requiring a user account.

---

## Phase 2: Seeded Ghana Bureau Directory

**Status**: Done

**User stories**: 3, 4, 6, 7, 8, 9, 10

### What to Build

Build a public bureau directory seeded with Ghana forex bureau profile data. A visitor can browse bureaus, view profile pages, see ratings, check verification status, and contact bureaus by phone or email. Directory results should be ordered by best rating first.

This phase should make the marketplace visible before adding live owner dashboards or advanced location search.

### Acceptance Criteria

- [x] A visitor can browse a list of Ghana forex bureaus.
- [x] Directory results are ordered by highest rating first.
- [x] Each listing shows bureau name, rating, verification status, phone, email, and location summary.
- [x] A visitor can open a bureau profile page.
- [x] Bureau profile pages show contact details, ratings, verification status, supported currencies if available, and current visible rates if available.
- [x] Directory and profile behavior can be tested with seeded data.

---

## Phase 3: Location-Based Bureau Search

**Status**: Done

**User stories**: 3, 4, 5, 16, 17

### What to Build

Add search that helps users find relevant bureaus near them. Visitors can search manually by Ghana city or area, or they can allow browser location access. Results should support filtering by currency pair so users only see bureaus that support the exchange they need.

This phase should connect public discovery, location logic, and bureau profile data end to end.

### Acceptance Criteria

- [x] A visitor can search for bureaus by manually entering a Ghana city or area.
- [x] A visitor can choose to use browser location when supported by the browser.
- [x] Search results show nearby or matching bureaus.
- [x] A visitor can filter search results by currency pair.
- [x] Search results continue to prioritize best-rated bureaus.
- [x] Location search behavior can be tested with deterministic Ghana coordinates and city fixtures.

---

## Phase 4: Bureau Accounts & Profile Management

**Status**: Done

**User stories**: 19, 20, 22, 25

### What to Build

Add authenticated bureau owner accounts. Bureau owners can create an account, claim or create a bureau profile, update phone and email, manage supported currencies, and view their bureau rating.

This phase should establish ownership and authorization rules before allowing rate updates or booking management.

### Acceptance Criteria

- [x] A bureau owner can create an account and access a bureau dashboard.
- [x] A bureau owner can create or manage their bureau profile.
- [x] A bureau owner can update bureau phone and email.
- [x] A bureau owner can manage supported currencies.
- [x] A bureau owner can view their bureau rating.
- [x] A bureau owner cannot edit another bureau's profile.
- [x] Profile management permissions are covered by tests.

---

## Phase 5: Bureau Rate Management

**Status**: Done

**User stories**: 11, 15, 16, 21

### What to Build

Allow bureau owners to publish and update exchange rates for supported currency pairs. Public users can see bureau-submitted rates on bureau profiles and compare rates across multiple bureaus. Every displayed rate should include source labeling and freshness information.

This phase should make rate data useful while preserving trust through clear timestamps and source labels.

### Acceptance Criteria

- [x] A bureau owner can add or update rates for supported currency pairs.
- [x] Bureau-submitted rates show as bureau-submitted to public users.
- [x] Public users can compare visible rates across bureaus.
- [x] Each displayed rate includes a last-updated timestamp.
- [x] Rate updates are restricted to the owning bureau account.
- [x] Rate normalization supports official, bureau-submitted, partner-provided, scraped, and user-reported source types.
- [x] Rate management and rate freshness behavior are covered by tests.

---

## Phase 6: Booking & Reservation Flow

**Status**: Done

**User stories**: 12, 13, 14, 23, 24

### What to Build

Add booking or reservation requests from public bureau profiles and search results. A visitor can request a rate reservation by submitting contact details, amount, currency pair, and selected bureau. Bureau owners can view incoming requests and accept or reject them.

This phase should create a complete loop between public user intent and bureau owner response.

### Acceptance Criteria

- [x] A visitor can start a booking request from a bureau profile.
- [x] A booking request captures user contact details, bureau, amount, currency pair, requested rate, and status.
- [x] A visitor receives visible confirmation after submitting a booking request.
- [x] A bureau owner can view booking requests for their bureau.
- [x] A bureau owner can accept or reject a booking request.
- [x] Booking status changes are visible in the bureau dashboard.
- [x] Booking flow validation and authorization are covered by tests.

---

## Phase 7: Reports, Reviews & Trust Signals

**Status**: Done

**User stories**: 6, 10, 18, 25, 27, 30

### What to Build

Add user reviews, bureau ratings, and reporting tools. Public users can rate bureaus and report inaccurate details or misleading rates. Ratings should feed the public ranking system, while reports should create moderation work for admins.

This phase should deepen marketplace trust without changing the core conversion, search, and booking paths.

### Acceptance Criteria

- [x] A user can submit a rating for a bureau.
- [x] A user can submit a review or report inaccurate bureau details.
- [x] A user can report inaccurate or misleading rate data.
- [x] Bureau ratings update public ranking behavior.
- [x] Bureau owners can view their rating from the dashboard.
- [x] Reports are captured for admin review.
- [x] Rating calculations and report submission behavior are covered by tests.

---

## Phase 8: Admin Moderation Console

**Status**: Done

**User stories**: 26, 27, 28, 29, 30

### What to Build

Build the admin moderation console for marketplace integrity. Admins can verify bureaus, review reports, moderate profile data, review rate issues, and disable suspicious bureau accounts.

This phase should close the trust loop and give the platform operators control over quality and abuse prevention.

### Acceptance Criteria

- [x] An admin can view pending bureau verification requests.
- [x] An admin can verify or unverify a bureau.
- [x] An admin can review user reports about bureau details or rates.
- [x] An admin can moderate bureau profile information.
- [x] An admin can disable suspicious bureau accounts.
- [x] Disabled bureau accounts cannot manage profiles, rates, or bookings.
- [x] Admin actions are restricted to admin users.
- [x] Admin moderation permissions and key workflows are covered by tests.
