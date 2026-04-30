(function attachBureauSearch(globalScope) {
  "use strict";

  const ghanaLocations = [
    { name: "Accra", aliases: ["osu", "airport", "madina", "circle"], latitude: 5.6037, longitude: -0.187 },
    { name: "Kumasi", aliases: ["adum", "kejetia"], latitude: 6.6666, longitude: -1.6163 },
    { name: "Tema", aliases: ["community 1", "tema harbour"], latitude: 5.6698, longitude: -0.0166 },
    { name: "Takoradi", aliases: ["market circle"], latitude: 4.9016, longitude: -1.7831 },
    { name: "Cape Coast", aliases: ["cape coast"], latitude: 5.1053, longitude: -1.2466 },
    { name: "Tamale", aliases: ["central"], latitude: 9.4075, longitude: -0.8533 }
  ];

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function parseCurrencyPair(currencyPair) {
    if (!currencyPair) {
      return null;
    }

    const parts = currencyPair
      .toUpperCase()
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length !== 2 || parts[0] === parts[1]) {
      return null;
    }

    return parts;
  }

  function bureauSupportsCurrencyPair(bureau, currencyPair) {
    const pair = parseCurrencyPair(currencyPair);

    if (!pair) {
      return true;
    }

    const [fromCurrency, toCurrency] = pair;
    const supported = new Set(bureau.supportedCurrencies);
    const exactPair = `${fromCurrency}/${toCurrency}`;
    const reversePair = `${toCurrency}/${fromCurrency}`;

    return (
      (supported.has(fromCurrency) && supported.has(toCurrency)) ||
      bureau.rates.some((rate) => rate.pair === exactPair || rate.pair === reversePair)
    );
  }

  function getLocationForQuery(query) {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return null;
    }

    const exactMatch = ghanaLocations.find((location) => {
      const names = [location.name, ...location.aliases].map(normalize);
      return names.some((name) => normalizedQuery === name);
    });

    if (exactMatch) {
      return exactMatch;
    }

    return ghanaLocations.find((location) => {
      const names = [location.name, ...location.aliases].map(normalize);
      return names.some((name) => normalizedQuery.includes(name) || name.includes(normalizedQuery));
    }) || null;
  }

  function bureauMatchesQuery(bureau, query) {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return true;
    }

    return [bureau.name, bureau.city, bureau.area]
      .map(normalize)
      .some((value) => value.includes(normalizedQuery) || normalizedQuery.includes(value));
  }

  function toRadians(value) {
    return value * Math.PI / 180;
  }

  function getDistanceKm(first, second) {
    const earthRadiusKm = 6371;
    const latitudeDelta = toRadians(second.latitude - first.latitude);
    const longitudeDelta = toRadians(second.longitude - first.longitude);
    const firstLatitude = toRadians(first.latitude);
    const secondLatitude = toRadians(second.latitude);
    const haversine =
      Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
      Math.cos(firstLatitude) * Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);

    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  }

  function decorateWithDistance(bureau, origin) {
    if (!origin || !bureau.coordinates) {
      return { ...bureau, distanceKm: null };
    }

    return {
      ...bureau,
      distanceKm: getDistanceKm(origin, bureau.coordinates)
    };
  }

  function sortByRatingThenDistance(first, second) {
    if (second.rating !== first.rating) {
      return second.rating - first.rating;
    }

    if (first.distanceKm !== null && second.distanceKm !== null && first.distanceKm !== second.distanceKm) {
      return first.distanceKm - second.distanceKm;
    }

    return second.reviewCount - first.reviewCount;
  }

  function searchBureaus({
    bureaus,
    query = "",
    coordinates = null,
    currencyPair = "",
    radiusKm = 90
  }) {
    const queryLocation = getLocationForQuery(query);
    const origin = coordinates || queryLocation;
    const hasQuery = Boolean(normalize(query));
    const hasCoordinates = Boolean(origin);

    return bureaus
      .map((bureau) => decorateWithDistance(bureau, origin))
      .filter((bureau) => {
        if (!bureauSupportsCurrencyPair(bureau, currencyPair)) {
          return false;
        }

        if (hasQuery && !queryLocation) {
          return bureauMatchesQuery(bureau, query);
        }

        if (hasCoordinates && bureau.distanceKm !== null) {
          return bureau.distanceKm <= radiusKm;
        }

        return true;
      })
      .sort(sortByRatingThenDistance);
  }

  const search = {
    bureauSupportsCurrencyPair,
    getDistanceKm,
    getLocationForQuery,
    ghanaLocations,
    searchBureaus
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = search;
  }

  globalScope.BureauSearch = search;
})(typeof globalThis !== "undefined" ? globalThis : window);
