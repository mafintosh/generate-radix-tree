const tape = require('tape')
const gentree = require('./')

tape('basic', function (t) {
  const choose = gentree([
    'hello world',
    'hello',
    'world',
    'hey',
    { match: 'ho' }
  ])

  t.same(choose('hello'), 'hello')
  t.same(choose('ho'), { match: 'ho' })
  t.same(choose('hey'), 'hey')
  t.same(choose('world'), 'world')
  t.same(choose('hello world'), 'hello world')
  t.same(choose('else'), null)
  t.end()
})

tape('basic with function', function (t) {
  const choose = gentree([
    [ 'hello', any, 'world' ],
    'hello world',
    'hey',
    { match: 'ho' }
  ])

  t.same(choose('hello world'), 'hello world')
  t.same(choose('hello!world'), [ 'hello', any, 'world' ])
  t.same(choose('hellooworld'), [ 'hello', any, 'world' ])
  t.same(choose('hey'), 'hey')
  t.same(choose('ho'), { match: 'ho' })
  t.end()

  function any (s, ptr) {
    if (ptr >= s.length) return false
    any.pointer = ptr + 1
    return true
  }
})
