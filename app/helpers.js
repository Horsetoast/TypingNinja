
export const colorGradientHelper = (rgb1, rgb2, ratio) => {
  var result = rgb1.slice();
  for (var i = 0; i < 3; i++) {
    result[i] = result[i] + ratio * (rgb2[i] - rgb1[i]);
  }
  return result;
};

export const rgbToHex = (x) => {
  x = x.toString(16);
  return (x.length === 1) ? '0' + x : x;
};

export const convertToRange = (value, srcRange, dstRange) => {
  /* If value is outside source range return NaN */
  if (value < srcRange[0] || value > srcRange[1]) {
    return NaN;
  }

  const srcMax = srcRange[1] - srcRange[0];
  const dstMax = dstRange[1] - dstRange[0];
  const adjValue = value - srcRange[0];

  return (adjValue * dstMax / srcMax) + dstRange[0];
};
