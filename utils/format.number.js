export const toNumber = (val) => {
    if (val === undefined || val === null || val === "") return 0;
    if (typeof val === "number") return val;
    const parsed = parseFloat(
      String(val)
        .replace(/,/g, ".")
        .replace(/[^0-9.\\-]/g, "")
    );
    return isNaN(parsed) ? 0 : parsed;
  };

  export function formatSwissNumber(num) {
    return new Intl.NumberFormat('de-CH', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }

export function parseSwissNumber(numOrStr) {
  if (typeof numOrStr === 'number') {
    return numOrStr;
  }
  if (typeof numOrStr !== 'string' || numOrStr.trim() === '') {
    return NaN;
  }

  const cleanedStr = numOrStr.trim().replace(/['\s]/g, '').replace(/,/g, '.');

  if ((cleanedStr.match(/\./g) || []).length > 1) {
      return NaN;
  }

  const num = parseFloat(cleanedStr);

  return isNaN(num) ? NaN : num;
}

export function formatNumericValue(num) {
  // Convert to number if it's not already
  const value = typeof num === 'number' ? num : parseFloat(num);
  
  if (isNaN(value) || value === 0) {
    return formatSwissNumber(value); // Use existing function for 0 or NaN
  }
  
  // Get the absolute value to count digits
  const absValue = Math.abs(value);
  
  // Count the number of digits before decimal point
  const integerPart = Math.floor(absValue);
  const digitCount = integerPart.toString().length;
  
  // Determine decimal places based on digit count
  let decimals;
  if (digitCount === 1) {
    decimals = 2; // 1 digit: 2 decimals
  } else if (digitCount === 2) {
    decimals = 1; // 2 digits: 1 decimal
  } else {
    decimals = 0; // 3+ digits: no decimals
  }
  
  return new Intl.NumberFormat('de-CH', {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}