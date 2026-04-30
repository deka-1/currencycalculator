# PRD: Ghana Currency Converter & Forex Bureau Marketplace

## Problem Statement

People in Ghana need a simple way to convert currencies, compare exchange rates, and find trustworthy nearby forex bureaus. Today, users often rely on scattered WhatsApp messages, phone calls, walk-ins, or outdated online listings. This makes it hard to know which bureau has a good rate, whether the bureau is reliable, and how to contact them before visiting.

## Solution

Build a Ghana-first website where users can convert any world currency, compare exchange rates, discover nearby forex bureaus, view bureau profiles, see ratings, contact bureaus by phone or email, and optionally book or reserve a rate before visiting. Forex bureaus will have accounts where they can manage their profile and update rates.

## User Stories

1. As a visitor, I want to convert one currency to another, so that I can estimate how much money I will receive.
2. As a visitor, I want to choose from all world currencies, so that I am not limited to only popular currencies.
3. As a visitor in Ghana, I want to find forex bureaus near me, so that I can visit a convenient bureau.
4. As a visitor, I want to manually enter my city or area, so that I can search even if I do not allow location access.
5. As a visitor, I want to use browser location, so that nearby bureaus can be found automatically.
6. As a visitor, I want to view bureau ratings, so that I can choose a trusted bureau.
7. As a visitor, I want bureaus ranked by best rating, so that reputable businesses appear first.
8. As a visitor, I want to see each bureau's phone and email, so that I can contact them directly.
9. As a visitor, I want to view bureau profiles, so that I can compare their services and current rates.
10. As a visitor, I want to see whether a bureau is verified, so that I can trust the listing more.
11. As a visitor, I want to see when a rate was last updated, so that I can judge whether it is still useful.
12. As a visitor, I want to book or reserve a rate, so that I can confirm availability before traveling.
13. As a visitor, I want to submit my contact details during booking, so that the bureau can follow up with me.
14. As a visitor, I want to receive confirmation after booking, so that I know my request was recorded.
15. As a visitor, I want to understand whether a displayed rate is official, bureau-submitted, partner-provided, scraped, or user-reported, so that I can decide how much to trust it.
16. As a visitor, I want to compare rates across multiple bureaus, so that I can choose where to exchange money.
17. As a visitor, I want to search by a specific currency pair, so that I only see bureaus that support the exchange I need.
18. As a visitor, I want to report inaccurate bureau details or rates, so that bad information can be corrected.
19. As a forex bureau owner, I want to create an account, so that I can manage my bureau profile.
20. As a forex bureau owner, I want to update my phone and email, so that customers can reach me.
21. As a forex bureau owner, I want to update my rates, so that customers see current information.
22. As a forex bureau owner, I want to manage supported currencies, so that customers know which exchanges I offer.
23. As a forex bureau owner, I want to receive booking or inquiry requests, so that I can serve customers before they arrive.
24. As a forex bureau owner, I want to accept or reject booking requests, so that customers know whether their requested exchange can be handled.
25. As a forex bureau owner, I want to see my profile rating, so that I understand how customers view my business.
26. As an admin, I want to verify forex bureaus, so that fake or low-quality listings are reduced.
27. As an admin, I want to review reported rates, so that misleading exchange-rate data can be corrected.
28. As an admin, I want to moderate bureau profiles, so that the marketplace remains trustworthy.
29. As an admin, I want to disable suspicious bureau accounts, so that users are protected from fraud.
30. As an admin, I want to review user reports, so that the platform can improve data accuracy over time.

## Implementation Decisions

- The product will launch Ghana-first but support all world currencies in the converter.
- Exchange-rate data should support multiple sources: official market rates, bureau-submitted rates, partner or scraped sources where legally permitted, and user-reported rate signals.
- Each displayed rate should show its source and last-updated timestamp.
- Bureau listing order will prioritize best rating first.
- Distance, rate quality, verification status, and supported currency filters can be available as secondary sorting or filtering options.
- Users can search by browser location or manual city and area entry.
- Bureau contact details for the first version are phone number and email.
- The marketplace will include bureau profiles, ratings, rate updates, and booking or reservation flows.
- Forex bureaus will have authenticated dashboards to manage profile details, supported currencies, and exchange rates.
- Admin moderation is needed for bureau verification, rate quality, user reports, and abuse prevention.
- A rate data module should normalize official, bureau-submitted, partner, scraped, and user-reported rates into a consistent format.
- A currency conversion module should expose a simple interface for converting an amount from one currency to another.
- A location and search module should support Ghana cities, coordinates, distance calculations, and nearby bureau discovery.
- A bureau profile module should manage bureau identity, contact details, verification status, ratings, supported currencies, and visible rate data.
- A booking module should capture user contact details, selected bureau, currency pair, amount, requested rate, and booking status.
- A ratings and reviews module should capture customer feedback and calculate bureau ranking signals.
- An admin module should support bureau verification, report review, moderation, and account disabling.

## Testing Decisions

- Tests should focus on external behavior, not implementation details.
- Currency conversion should be tested with mocked exchange-rate providers.
- Rate normalization should be tested across official, bureau-submitted, partner, scraped, and user-reported sources.
- Location search should be tested with fixed Ghana coordinates and city inputs.
- Bureau ranking should be tested to ensure highest-rated bureaus appear first.
- Bureau filtering should be tested by currency pair, location, and verification status.
- Booking flows should be tested for required fields, valid currency pairs, and bureau notification behavior.
- Bureau dashboard permissions should be tested to ensure owners can only edit their own bureau profiles and rates.
- Admin permissions should be tested to ensure only admins can verify bureaus, moderate reports, or disable accounts.
- Rate freshness display should be tested so users can see when rate data was last updated.

## Out of Scope

- Launching globally in the first version.
- Supporting in-app payments or money transfer.
- Guaranteeing bureau rates unless a reservation or booking system explicitly confirms them.
- Full KYC or compliance workflows for money exchange transactions.
- Native mobile apps for iOS or Android in the first version.
- Complex automated ranking by live best rate, distance, and fees unless added after the first marketplace version.
- Customer-to-customer currency exchange.
- Wallets, stored balances, or remittance features.

## Further Notes

The biggest product risk is rate reliability. Since the product will support multiple rate sources, the app should clearly label where each rate came from: official, bureau-submitted, partner-provided, scraped, or user-reported. For trust, verified bureau profiles and recent update timestamps should be visible to users.

Because this is Ghana-first, the earliest marketplace data should prioritize major exchange areas such as Accra, Kumasi, Tema, Takoradi, Cape Coast, and Tamale. A strong admin verification flow will be important before scaling the bureau directory.
