(function attachBureauDirectory(globalScope) {
  "use strict";

  const seededBureaus = [
    {
      id: "accra-heritage-fx",
      name: "Accra Heritage Forex",
      city: "Accra",
      area: "Osu",
      coordinates: { latitude: 5.5601, longitude: -0.1828 },
      rating: 4.9,
      reviewCount: 214,
      verified: true,
      phone: "+233 30 200 1101",
      email: "hello@accraheritagefx.example",
      supportedCurrencies: ["GHS", "USD", "EUR", "GBP", "NGN", "CAD"],
      rates: [
        { pair: "USD/GHS", buy: 13.55, sell: 13.84, sourceType: "bureau-submitted", source: "Bureau-submitted", updatedAt: "2026-04-30T08:30:00Z" },
        { pair: "EUR/GHS", buy: 14.62, sell: 14.96, sourceType: "bureau-submitted", source: "Bureau-submitted", updatedAt: "2026-04-30T08:30:00Z" },
        { pair: "GBP/GHS", buy: 17.08, sell: 17.52, sourceType: "bureau-submitted", source: "Bureau-submitted", updatedAt: "2026-04-30T08:30:00Z" }
      ]
    },
    {
      id: "kumasi-gold-rate-bureau",
      name: "Kumasi Gold Rate Bureau",
      city: "Kumasi",
      area: "Adum",
      coordinates: { latitude: 6.6931, longitude: -1.6212 },
      rating: 4.8,
      reviewCount: 176,
      verified: true,
      phone: "+233 32 200 4420",
      email: "rates@kumasigoldbureau.example",
      supportedCurrencies: ["GHS", "USD", "EUR", "GBP", "XOF"],
      rates: [
        { pair: "USD/GHS", buy: 13.5, sell: 13.8, sourceType: "bureau-submitted", source: "Bureau-submitted", updatedAt: "2026-04-30T07:45:00Z" },
        { pair: "XOF/GHS", buy: 0.021, sell: 0.024, sourceType: "bureau-submitted", source: "Bureau-submitted", updatedAt: "2026-04-30T07:45:00Z" }
      ]
    },
    {
      id: "tema-harbour-exchange",
      name: "Tema Harbour Exchange",
      city: "Tema",
      area: "Community 1",
      coordinates: { latitude: 5.6698, longitude: -0.0166 },
      rating: 4.7,
      reviewCount: 132,
      verified: true,
      phone: "+233 30 320 7788",
      email: "desk@temaharbourexchange.example",
      supportedCurrencies: ["GHS", "USD", "EUR", "GBP", "CNY"],
      rates: [
        { pair: "USD/GHS", buy: 13.48, sell: 13.82, sourceType: "bureau-submitted", source: "Bureau-submitted", updatedAt: "2026-04-30T09:15:00Z" },
        { pair: "CNY/GHS", buy: 1.82, sell: 1.95, sourceType: "bureau-submitted", source: "Bureau-submitted", updatedAt: "2026-04-30T09:15:00Z" }
      ]
    },
    {
      id: "takoradi-coastal-fx",
      name: "Takoradi Coastal FX",
      city: "Takoradi",
      area: "Market Circle",
      coordinates: { latitude: 4.8894, longitude: -1.7519 },
      rating: 4.5,
      reviewCount: 89,
      verified: false,
      phone: "+233 31 202 9030",
      email: "contact@takoradicoastalfx.example",
      supportedCurrencies: ["GHS", "USD", "EUR", "GBP"],
      rates: [
        { pair: "USD/GHS", buy: 13.4, sell: 13.88, sourceType: "bureau-submitted", source: "Bureau-submitted", updatedAt: "2026-04-29T16:20:00Z" }
      ]
    },
    {
      id: "tamale-savanna-exchange",
      name: "Tamale Savanna Exchange",
      city: "Tamale",
      area: "Central",
      coordinates: { latitude: 9.4075, longitude: -0.8533 },
      rating: 4.4,
      reviewCount: 64,
      verified: true,
      phone: "+233 37 202 1188",
      email: "info@tamalesavannaexchange.example",
      supportedCurrencies: ["GHS", "USD", "EUR", "NGN", "XOF"],
      rates: [
        { pair: "USD/GHS", buy: 13.42, sell: 13.9, sourceType: "bureau-submitted", source: "Bureau-submitted", updatedAt: "2026-04-30T06:50:00Z" },
        { pair: "NGN/GHS", buy: 0.0086, sell: 0.0098, sourceType: "bureau-submitted", source: "Bureau-submitted", updatedAt: "2026-04-30T06:50:00Z" }
      ]
    }
  ];

  function getBureausSortedByRating(bureaus = seededBureaus) {
    return [...bureaus].sort((first, second) => {
      if (second.rating !== first.rating) {
        return second.rating - first.rating;
      }

      return second.reviewCount - first.reviewCount;
    });
  }

  function getBureauById(id, bureaus = seededBureaus) {
    return bureaus.find((bureau) => bureau.id === id) || null;
  }

  const directory = {
    getBureauById,
    getBureausSortedByRating,
    seededBureaus
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = directory;
  }

  globalScope.BureauDirectory = directory;
})(typeof globalThis !== "undefined" ? globalThis : window);
