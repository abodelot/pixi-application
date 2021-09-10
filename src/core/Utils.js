/**
 * Ensure value is inside [min, max] limits
 */
export function clamp(value, min, max) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

/**
 * Scale a number from [valmin:valmax] range, to [min:max] range
 */
export function normalize(val, valmin, valmax, min, max) {
  val = clamp(val, valmin, valmax);
  return (((val - valmin) / (valmax - valmin)) * (max - min)) + min;
}
