import { rgbToHsl } from './colorConversions'

export function descriptiveName(r, g, b) {
  const { h, s, l } = rgbToHsl(r, g, b)

  let lightness = ''
  if (l < 10) lightness = 'Very Dark'
  else if (l < 25) lightness = 'Dark'
  else if (l < 45) lightness = 'Medium Dark'
  else if (l < 55) lightness = 'Medium'
  else if (l < 70) lightness = 'Light'
  else if (l < 85) lightness = 'Pale'
  else lightness = 'Very Light'

  if (s < 8) {
    if (l < 15) return 'Near Black'
    if (l > 90) return 'Near White'
    if (l < 40) return 'Dark Gray'
    if (l < 60) return 'Medium Gray'
    return 'Light Gray'
  }

  let saturation = ''
  if (s < 20) saturation = 'Muted'
  else if (s < 45) saturation = 'Soft'
  else if (s < 70) saturation = 'Vivid'
  else saturation = 'Bright'

  let hue = ''
  if (h < 15 || h >= 345) hue = 'Red'
  else if (h < 35) hue = 'Red-Orange'
  else if (h < 55) hue = 'Orange'
  else if (h < 70) hue = 'Yellow-Orange'
  else if (h < 80) hue = 'Yellow'
  else if (h < 100) hue = 'Yellow-Green'
  else if (h < 150) hue = 'Green'
  else if (h < 170) hue = 'Teal'
  else if (h < 200) hue = 'Cyan'
  else if (h < 240) hue = 'Blue'
  else if (h < 260) hue = 'Blue-Purple'
  else if (h < 290) hue = 'Purple'
  else if (h < 330) hue = 'Pink'
  else hue = 'Rose'

  return `${lightness} ${saturation} ${hue}`.trim()
}

export function contextualReference(r, g, b) {
  const { h, s, l } = rgbToHsl(r, g, b)
  if (s < 8) return null
  if (h < 15 || h >= 345) {
    if (s > 60 && l > 35 && l < 60) return 'Like a ripe tomato or fire truck'
    if (l < 30) return 'Like dried blood or dark wine'
  }
  if (h >= 15 && h < 40 && s > 50 && l > 30 && l < 60) return 'Like a pumpkin or autumn leaf'
  if (h >= 40 && h < 65 && s > 60) return 'Like a banana or school bus'
  if (h >= 100 && h < 145 && s > 40 && l > 30 && l < 60) return 'Like fresh grass or a tree leaf'
  if (h >= 190 && h < 230 && s > 50 && l > 40) return 'Like a clear sky or ocean water'
  if (h >= 230 && h < 260 && s > 50 && l < 50) return 'Like a navy uniform or deep ocean'
  if (h >= 40 && h < 55 && s > 20 && s < 60 && l > 25 && l < 50) return 'Like milk chocolate or coffee'
  return null
}
