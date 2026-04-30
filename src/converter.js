(function attachConverter(globalScope) {
  "use strict";

  const fallbackCurrencies = [
    "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD",
    "BIF", "BMD", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY",
    "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP",
    "GBP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HTG", "HUF", "IDR", "ILS", "INR",
    "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KRW", "KWD", "KYD", "KZT", "LAK",
    "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR",
    "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP",
    "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLE",
    "SOS", "SRD", "SSP", "STN", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS",
    "UAH", "UGX", "USD", "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XOF", "XPF", "YER", "ZAR",
    "ZMW", "ZWL"
  ];

  const currencyNames = {
    AED: "UAE dirham",
    AUD: "Australian dollar",
    CAD: "Canadian dollar",
    CHF: "Swiss franc",
    CNY: "Chinese yuan",
    EUR: "Euro",
    GBP: "British pound",
    GHS: "Ghanaian cedi",
    JPY: "Japanese yen",
    NGN: "Nigerian naira",
    USD: "US dollar",
    XOF: "West African CFA franc",
    ZAR: "South African rand"
  };

  const usdAnchors = {
    USD: 1,
    GHS: 13.68,
    EUR: 0.92,
    GBP: 0.79,
    NGN: 1470,
    XOF: 603,
    CAD: 1.36,
    AUD: 1.52,
    CNY: 7.24,
    JPY: 151.5,
    ZAR: 18.3,
    CHF: 0.91
  };

  const defaultRateFixture = {
    sourceType: "official-market-demo",
    sourceLabel: "Demo official-market fixture",
    lastUpdated: "2026-04-30T00:00:00Z",
    anchorsPerUsd: buildAnchors(fallbackCurrencies, usdAnchors)
  };

  function buildAnchors(currencies, explicitAnchors) {
    const anchors = {};

    currencies.forEach((code) => {
      if (explicitAnchors[code]) {
        anchors[code] = explicitAnchors[code];
        return;
      }

      anchors[code] = deterministicAnchor(code);
    });

    return anchors;
  }

  function deterministicAnchor(code) {
    const seed = code
      .split("")
      .reduce((total, character, index) => total + character.charCodeAt(0) * (index + 3), 0);
    return Number(((seed % 2800) / 37 + 0.5).toFixed(6));
  }

  function getSupportedCurrencies() {
    const intlCurrencies =
      typeof Intl !== "undefined" &&
      typeof Intl.supportedValuesOf === "function" &&
      Intl.supportedValuesOf("currency");

    return Array.from(new Set([...(intlCurrencies || []), ...fallbackCurrencies])).sort();
  }

  function getCurrencyLabel(code) {
    return `${code} - ${currencyNames[code] || code}`;
  }

  function validateAmount(amount) {
    const numericAmount = Number(amount);

    if (amount === "" || amount === null || typeof amount === "undefined") {
      return { valid: false, message: "Enter an amount to convert." };
    }

    if (!Number.isFinite(numericAmount)) {
      return { valid: false, message: "Enter a valid number." };
    }

    if (numericAmount < 0) {
      return { valid: false, message: "Amount cannot be negative." };
    }

    return { valid: true, value: numericAmount };
  }

  function convertCurrency({ amount, fromCurrency, toCurrency, rateFixture = defaultRateFixture }) {
    const amountValidation = validateAmount(amount);

    if (!amountValidation.valid) {
      return { ok: false, error: amountValidation.message };
    }

    const fromRate = rateFixture.anchorsPerUsd[fromCurrency];
    const toRate = rateFixture.anchorsPerUsd[toCurrency];

    if (!fromRate || !toRate) {
      return { ok: false, error: "A rate is not available for that currency pair." };
    }

    const rate = toRate / fromRate;
    const convertedAmount = amountValidation.value * rate;

    return {
      ok: true,
      amount: amountValidation.value,
      convertedAmount,
      fromCurrency,
      toCurrency,
      rate,
      sourceType: rateFixture.sourceType,
      sourceLabel: rateFixture.sourceLabel,
      lastUpdated: rateFixture.lastUpdated
    };
  }

  const converter = {
    convertCurrency,
    defaultRateFixture,
    getCurrencyLabel,
    getSupportedCurrencies,
    validateAmount
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = converter;
  }

  globalScope.CurrencyConverter = converter;
})(typeof globalThis !== "undefined" ? globalThis : window);
