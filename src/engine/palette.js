import { parseHex, rgbToOklab, oklabToOklch } from './colorMath'

// Everyday color names, the words a normal person would actually say.
//
// Values lean on the XKCD color survey (≈200k people naming colors in their own
// words, CC0), nudged where the survey average drifts from common usage.
// Deliberately no CSS/developer names ("PapayaWhip", "Gainsboro"...).
//
// Each entry: [name, hex, family, like?]
// family is one of the twelve basic color groups below; `like` is an optional
// real-world anchor, which helps most when you can't trust your own eyes.

export const FAMILIES = {
  red: 'Red',
  orange: 'Orange',
  yellow: 'Yellow',
  green: 'Green',
  teal: 'Teal',
  blue: 'Blue',
  purple: 'Purple',
  pink: 'Pink',
  brown: 'Brown',
  gray: 'Gray',
  black: 'Black',
  white: 'White',
}

const RAW = [
  // ── Neutrals ──
  ['Black', '#0b0b0b', 'black', 'like a chalkboard eraser or a black tee'],
  ['Black', '#1b1b1d', 'black'],
  ['Charcoal', '#383b3e', 'gray', 'like charcoal or pencil graphite'],
  ['Dark Gray', '#555555', 'gray'],
  ['Gray', '#8b8b8b', 'gray'],
  ['Light Gray', '#c4c4c4', 'gray'],
  ['Pale Gray', '#dddddd', 'gray'],
  ['Silver', '#b9bcbf', 'gray', 'like brushed metal or foil'],
  ['Slate Gray', '#5a6670', 'gray', 'like slate roof tiles'],
  ['Blue Gray', '#6d8193', 'gray'],
  ['Warm Gray', '#8a847d', 'gray'],
  ['Greenish Gray', '#7f8a7a', 'gray'],
  ['White', '#ffffff', 'white', 'like printer paper'],
  ['White', '#f4f4f3', 'white', 'like printer paper'],
  ['Off-White', '#f2f0e9', 'white'],
  ['Ivory', '#fbf8e6', 'white', 'like piano keys'],
  ['Cream', '#fcf6d0', 'white', 'like heavy cream'],
  ['Cream', '#f1e6c8', 'white', 'like heavy cream'],

  // ── Browns ──
  ['Brown', '#7b4d28', 'brown', 'like a wooden table'],
  ['Dark Brown', '#3e2716', 'brown'],
  ['Light Brown', '#a8805a', 'brown'],
  ['Chocolate', '#4b2a18', 'brown', 'like dark chocolate'],
  ['Coffee', '#6b4c35', 'brown', 'like brewed coffee'],
  ['Tan', '#d0b07c', 'brown', 'like cardboard or a paper bag'],
  ['Beige', '#e2d3b4', 'brown', 'like oatmeal or sand'],
  ['Khaki', '#bfae8a', 'brown', 'like khaki pants'],
  ['Camel', '#bf9665', 'brown', 'like a camel coat'],
  ['Caramel', '#b06f31', 'brown', 'like caramel sauce'],
  ['Rust', '#a2461f', 'brown', 'like rusty metal'],
  ['Copper', '#b5703a', 'brown', 'like a copper penny'],
  ['Chestnut', '#7a3a21', 'brown', 'like a roasted chestnut'],
  ['Mahogany', '#5b2118', 'brown', 'like mahogany furniture'],
  ['Sand', '#dcc38a', 'brown', 'like beach sand'],
  ['Taupe', '#8b7d6d', 'brown'],
  ['Walnut', '#5d4330', 'brown'],
  ['Bronze', '#9c7a22', 'brown', 'like a bronze medal'],

  // ── Reds ──
  ['Red', '#d8211f', 'red', 'like a stop sign'],
  ['Bright Red', '#ff1f1f', 'red'],
  ['Dark Red', '#8c0d0d', 'red'],
  ['Cherry Red', '#cc0a2f', 'red', 'like ripe cherries'],
  ['Crimson', '#aa0f24', 'red'],
  ['Scarlet', '#e3301b', 'red'],
  ['Tomato Red', '#e9442e', 'red', 'like a ripe tomato'],
  ['Brick Red', '#9d3526', 'red', 'like red bricks'],
  ['Maroon', '#6b1022', 'red', 'like dried cherries'],
  ['Dark Maroon', '#3f0a12', 'red'],
  ['Burgundy', '#6a1330', 'red', 'like red wine'],
  ['Wine', '#7b2140', 'red'],
  ['Ruby', '#a0123a', 'red', 'like a ruby'],

  // ── Oranges ──
  ['Orange', '#f47a1c', 'orange', 'like an orange'],
  ['Bright Orange', '#ff6a00', 'orange', 'like a traffic cone'],
  ['Dark Orange', '#c9580f', 'orange'],
  ['Burnt Orange', '#bd5520', 'orange'],
  ['Tangerine', '#ff9616', 'orange', 'like a tangerine'],
  ['Pumpkin', '#e2741c', 'orange', 'like a pumpkin'],
  ['Amber', '#f4a711', 'orange', 'like a traffic light on amber'],
  ['Peach', '#ffc39c', 'orange', 'like a ripe peach'],
  ['Apricot', '#fab47a', 'orange'],
  ['Coral', '#f6735f', 'orange', 'like living coral'],
  ['Light Peach', '#ffdcbc', 'orange'],
  ['Terracotta', '#c7653f', 'orange', 'like a clay flower pot'],

  // ── Yellows ──
  ['Yellow', '#ffe414', 'yellow', 'like a school bus or a banana'],
  ['Bright Yellow', '#fff41f', 'yellow'],
  ['Lemon Yellow', '#fff45a', 'yellow', 'like a lemon'],
  ['Light Yellow', '#fff49a', 'yellow'],
  ['Butter Yellow', '#f9e38a', 'yellow', 'like butter'],
  ['Golden Yellow', '#ffc31a', 'yellow', 'like sunflower petals'],
  ['Gold', '#d0a83a', 'yellow', 'like gold jewelry'],
  ['Mustard', '#d2a41e', 'yellow', 'like yellow mustard'],
  ['Dark Yellow', '#c4a30c', 'yellow'],
  ['Ochre', '#c38d1f', 'yellow'],
  ['Straw', '#e3d672', 'yellow', 'like dry straw'],

  // ── Greens ──
  ['Green', '#1fa637', 'green', 'like a green traffic light'],
  ['Bright Green', '#22dd33', 'green'],
  ['Dark Green', '#0e4a1f', 'green'],
  ['Forest Green', '#1f5c30', 'green', 'like a pine forest'],
  ['Hunter Green', '#355e3b', 'green'],
  ['Emerald', '#079a5c', 'green', 'like an emerald'],
  ['Grass Green', '#4a9a2a', 'green', 'like fresh grass'],
  ['Lime Green', '#7fd52a', 'green', 'like a lime'],
  ['Lime', '#b3e635', 'green'],
  ['Yellow Green', '#a2c21f', 'green'],
  ['Pea Green', '#8ea61a', 'green', 'like green peas'],
  ['Chartreuse', '#c9e41c', 'green', 'like a tennis ball'],
  ['Olive', '#6f771a', 'green', 'like green olives'],
  ['Olive Green', '#5c6b22', 'green'],
  ['Army Green', '#4b5424', 'green', 'like military gear'],
  ['Moss Green', '#6c8338', 'green', 'like moss'],
  ['Avocado', '#6f8b30', 'green', 'like avocado skin'],
  ['Khaki Green', '#8a8a4f', 'green'],
  ['Sage', '#9aae8a', 'green', 'like sage leaves'],
  ['Mint', '#a6e6c4', 'green', 'like mint ice cream'],
  ['Seafoam', '#7fdcb0', 'green'],
  ['Light Green', '#95e888', 'green'],
  ['Pale Green', '#cfeecb', 'green'],
  ['Pistachio', '#b8d99a', 'green', 'like pistachio ice cream'],
  ['Sea Green', '#2e8b57', 'green'],
  ['Jade', '#00a472', 'green', 'like jade stone'],

  // ── Teals ──
  ['Teal', '#0b8a84', 'teal', 'like a peacock feather'],
  ['Dark Teal', '#0a4f55', 'teal'],
  ['Light Teal', '#8fd8d0', 'teal'],
  ['Light Aqua', '#94f2df', 'teal'],
  ['Turquoise', '#27c3b5', 'teal', 'like tropical water'],
  ['Aqua', '#27e2cf', 'teal', 'like pool water'],
  ['Cyan', '#1ee3f0', 'teal'],
  ['Blue Green', '#12807b', 'teal'],
  ['Petrol', '#1c5a68', 'teal'],

  // ── Blues ──
  ['Blue', '#1f55d8', 'blue', 'like a clear blue logo or blue ink'],
  ['Bright Blue', '#1c6cff', 'blue'],
  ['Royal Blue', '#2742c0', 'blue'],
  ['Navy', '#1a2347', 'blue', 'like a navy suit'],
  ['Dark Blue', '#0f2472', 'blue'],
  ['Cobalt', '#1f4ea3', 'blue'],
  ['Sky Blue', '#7fc1f2', 'blue', 'like a clear daytime sky'],
  ['Light Blue', '#a8d3f4', 'blue'],
  ['Pale Blue', '#d7eaf7', 'blue'],
  ['Ice Blue', '#d2f6fb', 'blue'],
  ['Robin Egg Blue', '#96e6f2', 'blue', 'like a robin egg'],
  ['Powder Blue', '#b3cfe6', 'blue'],
  ['Baby Blue', '#9fcaf6', 'blue'],
  ['Denim', '#3d5f8d', 'blue', 'like blue jeans'],
  ['Steel Blue', '#4e79a2', 'blue'],
  ['Slate Blue', '#2f4a64', 'blue'],
  ['Dusty Blue', '#6f8fb2', 'blue'],
  ['Cerulean', '#1d8fd2', 'blue'],
  ['Ocean Blue', '#1c6e9f', 'blue', 'like deep ocean water'],
  ['Cornflower Blue', '#6a94ea', 'blue'],
  ['Periwinkle', '#8e94f2', 'blue'],
  ['Indigo', '#3b2c92', 'blue', 'like dark denim dye'],

  // ── Purples ──
  ['Purple', '#7a2d9d', 'purple', 'like grape soda'],
  ['Dark Purple', '#3f1650', 'purple'],
  ['Light Purple', '#bf91e2', 'purple'],
  ['Violet', '#8c3dd6', 'purple', 'like violets'],
  ['Bright Purple', '#bd1cf0', 'purple'],
  ['Royal Purple', '#5b2a87', 'purple'],
  ['Lavender', '#c5a9ec', 'purple', 'like lavender flowers'],
  ['Pale Lavender', '#e8d5fb', 'purple'],
  ['Lilac', '#c9a3cc', 'purple', 'like lilac blossoms'],
  ['Amethyst', '#9967cc', 'purple', 'like amethyst crystal'],
  ['Orchid', '#cc7ecd', 'purple'],
  ['Plum', '#632153', 'purple', 'like a ripe plum'],
  ['Eggplant', '#3e1a3b', 'purple', 'like eggplant skin'],
  ['Grape', '#5e2a7a', 'purple'],
  ['Dusty Purple', '#83698f', 'purple'],

  // ── Pinks ──
  ['Pink', '#f78fbe', 'pink', 'like bubblegum'],
  ['Hot Pink', '#ff1f8f', 'pink'],
  ['Light Pink', '#ffc4d6', 'pink'],
  ['Pale Pink', '#fbdde4', 'pink'],
  ['Rose', '#d4627b', 'pink', 'like a pink rose'],
  ['Dusty Rose', '#c18284', 'pink'],
  ['Blush', '#f2b8b6', 'pink'],
  ['Salmon', '#f88b80', 'pink', 'like a salmon fillet'],
  ['Mauve', '#b3818f', 'pink'],
  ['Raspberry', '#b3164f', 'pink', 'like raspberries'],
  ['Dark Pink', '#c63f6e', 'pink'],
  ['Magenta', '#c8198c', 'pink'],
  ['Dark Magenta', '#8f0a5a', 'pink'],
  ['Fuchsia', '#e22ad0', 'pink'],
]


export const PALETTE = RAW.map(([name, hex, family, like]) => {
  const rgb = parseHex(hex)
  const lab = rgbToOklab(rgb.r, rgb.g, rgb.b)
  return { name, hex, family, like: like || null, lab, lch: oklabToOklch(lab) }
})
