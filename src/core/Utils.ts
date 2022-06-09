/**
 * Ensure value is inside [min, max] limits
 */
export function clamp(value: number, min: number, max: number): number {
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
export function normalize(
  val: number,
  valmin: number,
  valmax: number,
  min: number,
  max: number,
): number {
  val = clamp(val, valmin, valmax);
  return (((val - valmin) / (valmax - valmin)) * (max - min)) + min;
}
