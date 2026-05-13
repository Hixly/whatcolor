const CONFUSION_ZONES = {
  protanopia: [
    { name: 'red', hRange: [345, 360], sMin: 30, message: 'This red can look similar to brown or dark green' },
    { name: 'red', hRange: [0, 20], sMin: 30, message: 'This red can look similar to brown or dark green' },
    { name: 'green', hRange: [80, 160], sMin: 25, message: 'This green can look similar to red or brown' },
    { name: 'brown/orange', hRange: [20, 50], sMin: 20, lMax: 55, message: 'This orange-brown can look similar to green or red' },
    { name: 'purple', hRange: [260, 300], sMin: 25, message: 'This purple can look similar to blue' },
  ],
  deuteranopia: [
    { name: 'red', hRange: [345, 360], sMin: 30, message: 'This red can look similar to green or brown' },
    { name: 'red', hRange: [0, 20], sMin: 30, message: 'This red can look similar to green or brown' },
    { name: 'green', hRange: [80, 160], sMin: 25, message: 'This green can look similar to red or brown' },
    { name: 'orange', hRange: [20, 55], sMin: 40, message: 'This orange can look similar to green' },
  ],
  tritanopia: [
    { name: 'blue', hRange: [200, 250], sMin: 30, message: 'This blue can look similar to green' },
    { name: 'yellow', hRange: [50, 70], sMin: 40, message: 'This yellow can look similar to violet or pink' },
  ],
  custom: [
    { name: 'white/pink', hRange: [300, 360], sMin: 0, sMax: 30, lMin: 80, message: 'This light color can look similar to white' },
    { name: 'dark green', hRange: [80, 160], sMin: 10, lMax: 40, message: 'This dark green can look similar to black or dark brown' },
    { name: 'dark brown', hRange: [20, 50], sMin: 10, lMax: 40, message: 'This dark brown can look similar to black or dark green' },
    { name: 'dark purple', hRange: [250, 310], sMin: 10, lMax: 45, message: 'This dark purple can look similar to black or dark blue' },
  ],
}

function hInRange(h, [min, max]) {
  if (min > max) return h >= min || h <= max
  return h >= min && h <= max
}

export function getConfusionWarning(h, s, l, profile) {
  if (!profile || profile === 'none') return null
  const zones = CONFUSION_ZONES[profile] || []
  for (const zone of zones) {
    if (!hInRange(h, zone.hRange)) continue
    if (zone.sMin !== undefined && s < zone.sMin) continue
    if (zone.sMax !== undefined && s > zone.sMax) continue
    if (zone.lMin !== undefined && l < zone.lMin) continue
    if (zone.lMax !== undefined && l > zone.lMax) continue
    return zone.message
  }
  return null
}

export const PROFILE_LABELS = {
  none: 'No color vision deficiency',
  protanopia: 'Protanopia (Red-Weak)',
  deuteranopia: 'Deuteranopia (Green-Weak)',
  tritanopia: 'Tritanopia (Blue-Weak)',
  achromatopsia: 'Achromatopsia (Full color blindness)',
  custom: 'Mixed/Custom (Partial)',
}
