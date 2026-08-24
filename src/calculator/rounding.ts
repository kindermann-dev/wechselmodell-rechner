/**
 * Currency math and floating-point safe rounding utilities.
 */

export const round2 = (val: number): number => {
  return Math.round((val + Number.EPSILON) * 100) / 100;
};

export const round4 = (val: number): number => {
  return Math.round((val + Number.EPSILON) * 10000) / 10000;
};

export const clamp = (val: number, min: number, max: number): number => {
  return Math.min(Math.max(val, min), max);
};
