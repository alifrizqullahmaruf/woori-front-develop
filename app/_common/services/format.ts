export const formatCurrency = (value: number, currency: string = "KRW"): string => {
  if (currency === "USD") {
    // USD formatting: $X.XT, $X.XB, $X.XM, $X.XK
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    if (absValue >= 1e12) return `${sign}$${(absValue / 1e12).toFixed(1)}T`;
    if (absValue >= 1e9) return `${sign}$${(absValue / 1e9).toFixed(1)}B`;
    if (absValue >= 1e6) return `${sign}$${(absValue / 1e6).toFixed(1)}M`;
    if (absValue >= 1e3) return `${sign}$${(absValue / 1e3).toFixed(1)}K`;
    return `${sign}$${absValue.toFixed(2)}`;
  } else if (currency === "%") {
    // Percentage formatting
    return `${value.toFixed(2)}%`;
  } else if (currency === null || currency === "null") {
    // No currency (for PER, PBR, etc.)
    return value.toFixed(2);
  } else {
    // KRW formatting (default): X조원, X억원, X만원
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    if (absValue >= 1e12) return `${sign}${(absValue / 1e12).toFixed(1)}조원`;
    if (absValue >= 1e8) return `${sign}${(absValue / 1e8).toFixed(1)}억원`;
    if (absValue >= 1e4) return `${sign}${(absValue / 1e4).toFixed(1)}만원`;
    return `${sign}${absValue.toLocaleString()}원`;
  }
};

export const getCurrencySymbol = (currency: string): string => {
  switch (currency) {
    case "KRW":
      return "원";
    case "USD":
      return "$";
    default:
      return currency;
  }
};


export const formatPercentage = (value: number): string =>
  `${(value * 100).toFixed(2)}%`;

export const formatRatio = (value: number): string => value.toFixed(2);
