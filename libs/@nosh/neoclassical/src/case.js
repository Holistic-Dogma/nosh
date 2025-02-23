// string case switcher
import { O_O } from '@nosh/unhelpfully'
import { NeoString } from './string.js'

const Case = O_O.fn.obj
Case.matchers = {
  human: /\s+/g,
  camel: /(?=[A-Z]+)/g,
  snake: /_/g,
  kebab: /-/g,
  title: /\s/g,
  sentence: /\s/g,
  pascal: /(?=[A-Z]+)/g,
  upper: /\s+/g,
  lower: /\s+/g,
  capitalize: /\s+/g,
  delimited: /\W+/g,
  piped: /\|+/g,
  dotted: /\.+/g,
  quoted: /['"]+/g,
  csv: /,+/g,
  tsv: /\t+/g,
  spaced: /\s+/g,
  slashed: /\/+/g,
  backslashed: /\\+/g,
  environment_variable: /_+/g
}
Case.types = Object.keys(Case.matchers)
Case.includes = (str) => Case.types.includes(str)

// first we match tokens, then we convert the array
const converters = {
  human: ((ary) => ary.join(' ').capitalize),
  camel: ((ary) => ary.map((x, i) => i === 0 ? x.lower : x.capitalize).join('')),
  snake: ((ary) => ary.join('_').lower),
  kebab: ((ary) => ary.join('-').lower),
  title: ((ary) => ary.map(x => x.capitalize).join(' ')),
  sentence: ((ary) => ary.map(x => x.capitalize).join(' ')),
  pascal: ((ary) => ary.map(x => x.capitalize).join('')),
  upper: ((ary) => ary.join(' ').upper),
  lower: ((ary) => ary.join(' ').lower),
  capitalize: ((ary) => ary.map(x => x.capitalize).join(' ')),
  delimited: ((ary) => ary.join(' ')),
  piped: ((ary) => ary.join('|')),
  dotted: ((ary) => ary.join('.')),
  quoted: ((ary) => ary.join('"')),
  csv: ((ary) => ary.join(',')),
  tsv: ((ary) => ary.join('\t')),
  spaced: ((ary) => ary.join(' ')),
  slashed: ((ary) => ary.join('/')),
  backslashed: ((ary) => ary.join('\\')),
  environment_variable: ((ary) => ary.map(x => x.upper).join('_'))
}

const convertCase = (str, from, to) => {
  const tokens = str.split(Case.matchers[from])
  return new NeoString(converters[to](tokens))
}

const allVariations = (str) => {
  if (typeof str !== 'string') return []
  const from = discoverCase(str)
}

const discoverCase = (str) => {
  if (typeof str !== 'string') return 'spaced'
  return Case.types.find(type => Case.matchers[type].test(str))
}
Case._convert = convertCase
Case.discover = discoverCase
Case.variations = allVariations
Case.convert = (str) => ({ to: O_O.fn.curry(convertCase, str, discoverCase(str)) })
Case.types.forEach(type => {
  O_O.add(type).to(Case).value({
    to: {...Case.types.reduce((acc, cur) => { acc[cur] = O_O.fn.curry(convertCase, type, cur); return acc }, {}) }
  })
})

// yes you can kebab.to.kebab
export { Case }
