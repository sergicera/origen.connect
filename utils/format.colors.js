/**
 * Convert #rrggbb to rgba(r,g,b,alpha).
 */
export function hexToRgba(hex, alpha) {
  hex = hex.replace(/^#/, "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Helper function to determine if a color is dark
 */
export function isColorDark(color) {
  // Remove the '#' if it's there
  const c = color.startsWith("#") ? color.substring(1) : color;

  // Convert hex to RGB
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;

  // Calculate luminance
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  // If luminance is less than 128, the color is dark
  return luminance < 128;
}
