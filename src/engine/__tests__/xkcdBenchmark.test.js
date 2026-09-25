// Benchmark: does the engine put colors in the same family people do?
//
// Source: XKCD color survey (CC0), ~950 names with the average color people
// picked for each. For names containing a family word ("dark green", "navy
// blue", "tan") we check the engine's family against the name's head word.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { identify } from '../identify'
import { parseHex } from '../colorMath'

const KEYWORDS = {
  red: ['red', 'maroon', 'burgundy', 'crimson', 'scarlet', 'wine', 'cherry', 'ruby', 'brick', 'blood'],
  orange: ['orange', 'tangerine', 'pumpkin', 'peach', 'apricot', 'terracotta', 'terracota'],
  yellow: ['yellow', 'lemon', 'gold', 'golden', 'mustard', 'canary', 'butter', 'sunflower', 'banana'],
  green: ['green', 'olive', 'lime', 'sage', 'mint', 'emerald', 'jade', 'chartreuse', 'avocado', 'moss', 'pistachio', 'kelly', 'grass', 'seafoam', 'pea'],
  teal: ['teal', 'turquoise', 'aqua', 'cyan', 'aquamarine'],
  blue: ['blue', 'navy', 'azure', 'cerulean', 'cobalt', 'denim', 'sapphire', 'indigo', 'periwinkle', 'sky'],
  purple: ['purple', 'violet', 'lavender', 'lilac', 'plum', 'eggplant', 'grape', 'amethyst', 'orchid', 'aubergine'],
  pink: ['pink', 'magenta', 'fuchsia', 'rose', 'blush', 'raspberry'],
  brown: ['brown', 'tan', 'beige', 'khaki', 'chocolate', 'coffee', 'mocha', 'caramel', 'camel', 'chestnut', 'mahogany', 'taupe', 'sand', 'umber', 'sienna', 'bronze', 'mud', 'poop', 'dirt'],
  gray: ['gray', 'grey', 'silver', 'charcoal', 'slate', 'ash', 'steel'],
  black: ['black'],
  white: ['white', 'cream', 'ivory', 'eggshell'],
}
const WORD_TO_FAMILY = Object.fromEntries(
  Object.entries(KEYWORDS).flatMap(([fam, words]) => words.map((w) => [w, fam])),
)
const ISH = { reddish: 'red', orangish: 'orange', orangey: 'orange', yellowish: 'yellow', greenish: 'green', bluish: 'blue', blueish: 'blue', purplish: 'purple', purpley: 'purple', pinkish: 'pink', pinky: 'pink', greeny: 'green', bluey: 'blue', reddy: 'red', purply: 'purple', yellowy: 'yellow', browny: 'brown', brownish: 'brown', greyish: 'gray', grayish: 'gray' }

function expectation(name) {
  const tokens = name.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(Boolean)
  const heads = tokens.map((t) => WORD_TO_FAMILY[t]).filter(Boolean)
  if (!heads.length) return null
  const lean = tokens.map((t) => ISH[t]).filter(Boolean)
  const ok = new Set([...heads, ...lean])
  // "blue green" / "greenish blue" describe teal, whichever word comes last.
  if (ok.has('blue') && ok.has('green')) ok.add('teal')
  return { head: heads.at(-1), ok }
}

function loadSurvey() {
  const txt = readFileSync(resolve(__dirname, '../../../scripts/data/xkcd-rgb.txt'), 'utf8')
  return txt
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const [name, hex] = l.split('\t')
      return { name: name.trim(), hex: hex.trim(), rgb: parseHex(hex.trim()) }
    })
}

describe('XKCD survey benchmark', () => {
  const rows = loadSurvey()
    .map((row) => ({ ...row, exp: expectation(row.name) }))
    .filter((row) => row.exp)

  const results = rows.map((row) => {
    const out = identify(row.rgb.r, row.rgb.g, row.rgb.b)
    return { ...row, got: out.familyKey, name2: out.name }
  })
  const strict = results.filter((x) => x.got === x.exp.head).length / results.length
  const lenient = results.filter((x) => x.exp.ok.has(x.got)).length / results.length

  it('reports accuracy', () => {
    const misses = results.filter((x) => !x.exp.ok.has(x.got))
    const pairs = {}
    for (const m of misses) {
      const k = `${m.exp.head} -> ${m.got}`
      pairs[k] = (pairs[k] || 0) + 1
    }
    const top = Object.entries(pairs).sort((a, b) => b[1] - a[1]).slice(0, 14)
    console.log(
      `\nXKCD benchmark on ${results.length} colors: head-family ${(strict * 100).toFixed(1)}%, ` +
        `any-named-family ${(lenient * 100).toFixed(1)}%\nMost common misses: ` +
        top.map(([k, n]) => `${k} (${n})`).join(', '),
    )
    if (process.env.WC_BENCH_VERBOSE) {
      console.log(misses.map((m) => `${m.name} ${m.hex} -> ${m.got} (${m.name2})`).join('\n'))
    }
  })

  it('agrees with people on the family most of the time', () => {
    expect(lenient).toBeGreaterThan(0.85)
  })
})
