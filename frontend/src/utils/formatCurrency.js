/**
 * Multi-Currency Formatter Utility
 * Supports Indian Rupees (INR, ₹) and US Dollars (USD, $) with locale-sensitive formatting.
 */
export const formatCurrency = (amount, currency = 'INR', { includeDecimals = false } = {}) => {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(numeric)) {
    return currency === 'USD' ? '$0' : '₹0';
  }

  // Handle historical or explicitly tagged USD currency
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: includeDecimals ? 2 : 0,
      minimumFractionDigits: includeDecimals ? 2 : 0,
    }).format(numeric);
  }

  // Default to Indian Rupee (INR) with en-IN formatting
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  }).format(numeric);
};

export const formatINR = (amount, options) => formatCurrency(amount, 'INR', options);
export default formatCurrency;
