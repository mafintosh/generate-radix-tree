const genfun = require('generate-function')
const toRadixTree = require('to-radix-tree')

const SLICE_THRESHOLD = 16

module.exports = gentree

function isNotSwitchable (child) {
  return !isSwitchable(child)
}

function isSwitchable (child) {
  return typeof child.prefix[0] === 'string'
}

function gentree (strings, opts) {
  if (!opts) opts = {}

  const tree = toRadixTree(strings)
  const gen = opts.gen || genfun()
  const name = opts.name || 's'
  const onvalue = opts.onvalue || visitValue
  const syms = new Map()

  gen.sym(name)

  if (!opts.gen) {
    gen(`function choose (${name}) {`)
  }

  visit(tree, '', 0)

  if (!opts.gen) {
    gen(`
      return null
    }`)

    return gen.toFunction()
  }

  function visitValue (gen, val) {
    const i = strings.indexOf(val)
    gen.scope['result' + i] = val
    gen(`return result${i}`)
  }

  function visit (tree, abs, offset) {
    if (tree.prefix.length) {
      genif(tree.prefix, tree.value === null)
    }

    if (tree.value !== null) {
      onvalue(gen, tree.value)
    } else {
      const first = tree.children.length && tree.children[0]

      if (first && !first.prefix.length) {
        gen(`if (${name}.length === ${ptr()}) {`)
        visit(tree.children.shift(), abs, offset)
        gen('}')
      }

      const switchable = tree.children.filter(isSwitchable)
      const notSwitchable = tree.children.filter(isNotSwitchable)

      if (switchable.length > 1) {
        gen(`switch (${ch(ptr())}) {`)

        for (const node of switchable) {
          gen(`case ${code(node.prefix[0])}:`)
          node.prefix = node.prefix.slice(1)
          visit(node, abs, offset + 1)
          gen('break')
        }

        gen('}')
      } else if (switchable.length > 0) {
        visit(switchable[0], abs, offset)
      }

      for (const node of notSwitchable) {
        visit(node, abs, offset)
      }
    }

    if (tree.prefix.length) {
      gen('}')
    }

    function genif (match, prefix) {
      const m = normalize(match).map(mapMatch)
      if (!prefix) m.push(`${name}.length === ${ptr()}`)
      gen('if (' + m.join(' && ') + ') {')
    }

    function mapString (str) {
      if (str.length > SLICE_THRESHOLD) {
        const start = ptr()
        offset += str.length
        const end = ptr()
        return `${name}.slice(${start}, ${end}) === ${JSON.stringify(str)}`
      }

      const res = []
      for (var i = 0; i < str.length; i++) {
        res.push(`${ch(inc())} === ${code(str[i])}`)
      }
      return res.join(' && ')
    }

    function mapMatch (x) {
      if (typeof x === 'string') return mapString(x)
      const match = syms.get(x) || gen.sym('match')
      syms.set(x, match)
      gen.scope[match] = x
      const src = `${match}(${name}, ${ptr()})`
      abs = match + '.pointer'
      offset = 0
      return src
    }

    function inc () {
      const p = ptr()
      offset++
      return p
    }

    function ptr () {
      if (!offset && abs) return abs
      return (abs ? abs + ' + ' : '') + offset
    }
  }

  function code (c) {
    return c.charCodeAt(0)
  }

  function ch (i) {
    return `${name}.charCodeAt(${i})`
  }
}

function normalize (str) {
  if (typeof str === 'string') return [str]
  const res = []
  for (var i = 0; i < str.length; i++) {
    if (typeof str[i] === 'string' && typeof res[res.length - 1] === 'string') {
      res[res.length - 1] += str[i]
    } else {
      res.push(str[i])
    }
  }
  return res
}
