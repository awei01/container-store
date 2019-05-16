const test = require('ava')
const Container = require('./Container')

test('make() called with [non-existent key] returns [undefined]', (t) => {
  const container = Container()
  t.is(container.make('i.dont.exist'), undefined)
})
test('make() called with [non-string key] throws', (t) => {
  const container = Container()
  t.throws(() => {
    container.make(3)
  }, 'Container cannot make without valid key')
  t.throws(() => {
    container.make(null)
  }, 'Container cannot make without valid key')
  t.throws(() => {
    container.make([])
  }, 'Container cannot make without valid key')
})

// define()
test('define() with [key, value] can then make() with [key] or by property', (t) => {
  const container = Container()
  container.define('foo', 'foo value')
  const bar = {}
  container.define('bar', bar)

  t.is(container.make('foo'), 'foo value')
  t.is(container.foo, 'foo value')
  t.is(container.make('bar'), bar)
  t.is(container.bar, bar)
})
test('define() with [key, value] throws error when trying to define() with same [key]', (t) => {
  const container = Container()
  container.define('foo', 'foo value')

  t.throws(() => {
    container.define('foo', 'other value')
  }, 'Container already has [foo] defined')
})

// instance()
test('instance() with [key, non-fn] throws', (t) => {
  const container = Container()

  t.throws(() => {
    container.instance('foo', 'other value')
  }, 'Container instance() requires a function')
})
test('instance() with [key, fn] creates and returns same instance and is accessible by property', (t) => {
  const container = Container()
  container.instance('foo', () => {
    return { foo: 'result' }
  })

  const result = container.make('foo')
  t.deepEqual(result, { foo: 'result' })
  t.is(container.make('foo'), result)
  t.is(container.foo, result)
})
test(`instance() with [key, fn] on make()
    calls fn() with this as { container, key }
    can be passed arguments
    does not modify fn`, (t) => {
  const container = Container()
  container.define('foo', 'foo value')
  function barFn (...args) {
    return `[${this.key}]: ${this.container.foo}: ${args.join(', ')}`
  }
  container.instance('bar', barFn)

  t.is(container.make('bar', 1, 2, 3), '[bar]: foo value: 1, 2, 3')
  t.is(barFn.container, undefined)
  t.is(barFn.key, undefined)
})
test(`instance() with [key, fn] called with make()
    then make() called again with arguments throws`, (t) => {
  const container = Container()
  container.instance('bar', () => {
    return 'bar value'
  })
  container.make('bar')

  t.throws(() => {
    container.make('bar', 1, 2, 3)
  }, 'Container already made instance of [bar]')
})

// factory()
test('factory() with [key, non-fn] throws', (t) => {
  const container = Container()

  t.throws(() => {
    container.factory('foo', 'other value')
  }, 'Container factory() requires a function')
})
test('factory() with [key, fn] returns new instance on make()', (t) => {
  const container = Container()
  container.factory('foo', () => {
    return { foo: 'result' }
  })

  const result = container.make('foo')
  t.deepEqual(result, { foo: 'result' })
  t.not(container.make('foo'), result)
})
test('factory() with [key, fn] throws on property access', (t) => {
  const container = Container()
  container.factory('foo', () => {
    return { foo: 'result' }
  })
  t.throws(() => {
    container.foo
  }, 'Container [foo] is a factory and cannot be accessed by property')
})
test(`factory() with [key, fn] on make()
    calls fn() with this as { container, key }
    can be passed arguments
    does not modify fn`, (t) => {
  const container = Container()
  container.define('foo', 'foo value')
  function barFn (...args) {
    return `[${this.key}]: ${this.container.foo}: ${args.join(', ')}`
  }
  container.factory('bar', barFn)

  t.is(container.make('bar', 1, 2, 3), '[bar]: foo value: 1, 2, 3')
  t.is(barFn.container, undefined)
  t.is(barFn.key, undefined)
})
