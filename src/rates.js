(function attachRateManagement(globalScope) {
  "use strict";

  const allowedSourceTypes = new Set([
    "official",
    "bureau-submitted",
    "partner-provided",
    "scraped",
    "user-reported"
  ]);

  const sourceLabels = {
    official: "Official market",
    "bureau-submitted": "Bureau-submitted",
    "partner-provided": "Partner-provided",
    scraped: "Scraped",
    "user-reported": "User-reported"
  };

  function normalizeCurrency(code) {
    return String(code || "").trim().toUpperCase();
  }

  function normalizeCurrencyPair(fromCurrency, toCurrency) {
    const from = normalizeCurrency(fromCurrency);
    const to = normalizeCurrency(toCurrency);

    if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to) || from === to) {
      return null;
    }

    return `${from}/${to}`;
  }

  function normalizeSourceType(sourceType) {
    const value = String(sourceType || "bureau-submitted").trim().toLowerCase();
    return allowedSourceTypes.has(value) ? value : "bureau-submitted";
  }

  function normalizeRateInput({ fromCurrency, toCurrency, buy, sell, sourceType, updatedAt }) {
    const pair = normalizeCurrencyPair(fromCurrency, toCurrency);
    const buyRate = Number(buy);
    const sellRate = Number(sell);
    const normalizedSourceType = normalizeSourceType(sourceType);

    if (!pair) {
      return { ok: false, error: "Choose two different valid currencies." };
    }

    if (!Number.isFinite(buyRate) || buyRate <= 0) {
      return { ok: false, error: "Buy rate must be greater than zero." };
    }

    if (!Number.isFinite(sellRate) || sellRate <= 0) {
      return { ok: false, error: "Sell rate must be greater than zero." };
    }

    return {
      ok: true,
      rate: {
        pair,
        buy: buyRate,
        sell: sellRate,
        sourceType: normalizedSourceType,
        source: sourceLabels[normalizedSourceType],
        updatedAt: updatedAt || new Date().toISOString()
      }
    };
  }

  function bureauSupportsPair(bureau, pair) {
    const [fromCurrency, toCurrency] = pair.split("/");
    return bureau.supportedCurrencies.includes(fromCurrency) && bureau.supportedCurrencies.includes(toCurrency);
  }

  function upsertBureauRate({ bureau, fromCurrency, toCurrency, buy, sell, sourceType = "bureau-submitted", updatedAt }) {
    const normalized = normalizeRateInput({ fromCurrency, toCurrency, buy, sell, sourceType, updatedAt });

    if (!normalized.ok) {
      return normalized;
    }

    if (!bureauSupportsPair(bureau, normalized.rate.pair)) {
      return { ok: false, error: "That currency pair is not in the bureau's supported currencies." };
    }

    const existingIndex = bureau.rates.findIndex((rate) => rate.pair === normalized.rate.pair);

    if (existingIndex >= 0) {
      bureau.rates[existingIndex] = normalized.rate;
    } else {
      bureau.rates.push(normalized.rate);
    }

    return { ok: true, rate: normalized.rate, bureau };
  }

  function getComparableRates({ bureaus, currencyPair }) {
    const [fromCurrency, toCurrency] = String(currencyPair || "").split("/");
    const pair = normalizeCurrencyPair(fromCurrency, toCurrency);

    if (!pair) {
      return [];
    }

    const reversePair = pair.split("/").reverse().join("/");

    return bureaus
      .flatMap((bureau) => bureau.rates
        .filter((rate) => rate.pair === pair || rate.pair === reversePair)
        .map((rate) => ({
          bureauId: bureau.id,
          bureauName: bureau.name,
          city: bureau.city,
          area: bureau.area,
          rating: bureau.rating,
          verified: bureau.verified,
          pair: rate.pair,
          buy: rate.buy,
          sell: rate.sell,
          sourceType: rate.sourceType || "bureau-submitted",
          source: rate.source || sourceLabels[rate.sourceType] || rate.source || "Bureau-submitted",
          updatedAt: rate.updatedAt
        })))
      .sort((first, second) => {
        if (second.rating !== first.rating) {
          return second.rating - first.rating;
        }

        return first.sell - second.sell;
      });
  }

  const rates = {
    getComparableRates,
    normalizeCurrencyPair,
    normalizeRateInput,
    normalizeSourceType,
    sourceLabels,
    upsertBureauRate
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = rates;
  }

  globalScope.RateManagement = rates;
})(typeof globalThis !== "undefined" ? globalThis : window);
