const roast = require('roast.it')
const Container = require('./Container')

function expectError(cb, message) {
  try {
    cb()
  } catch (e) {
    return e.message === message
  }
}

roast.it('make() called with [non-existent key] returns undefined', () => {
  const container = Container()
  return container.make('i.dont.exist') === undefined
})

roast.it('define() called with [key, value] sets key with value on container and returns self', () => {
  const container = Container()
  const self = container.define('foo', 'foo value')
  return container.make('foo') === 'foo value'
        && self === container
})
roast.it('define() called with [existing key, value] throws', () => {
  const container = Container()
  container.define('foo', 'foo value')
  return expectError(() => {
    container.define('foo', 'new value')
  }, 'Container already has [foo] defined')
})

let counter = 0
function factoryFn (container, param1, param2) {
  counter++
  return { container, param1, param2, counter }
}

roast.it(`bind() called with [key, callback] returns self
          then make() called with [args] multiple times
          calls callback with [container, ...args]
          returns callback result for every call`, () => {
  const container = Container()
  const self = container.bind('binder', factoryFn)
  const first = container.make('binder', 'foo', 'bar')
  const second = container.make('binder', 'foo', 'bar')
  return self === container &&
        first.container === container && first.param1 === 'foo' && first.param2 === 'bar' &&
        first.container === second.container && first.param1 === second.param1 && first.param2 === second.param2 &&
        first.counter !== second.counter &&
        first !== second
})
roast.it('bind() called with [existing key, value] throws', () => {
  const container = Container()
  container.bind('foo', factoryFn)
  return expectError(() => {
    container.bind('foo', factoryFn)
  }, 'Container already has [foo] defined')
})

roast.it(`singleton() called with [key, callback] returns self
          then make() called with [args] multiple times
          calls callback with [container, ...args] only once
          returns same callback result`, () => {
  const container = Container()
  counter = 0
  const self = container.singleton('instantiator', factoryFn)
  const first = container.make('instantiator', 'foo', 'bar')
  const second = container.make('instantiator', 'foo', 'bar')
  return self === container &&
        first.container === container && first.param1 === 'foo' && first.param2 === 'bar' &&
        first.counter === 1 &&
        first === second
})
roast.it('singleton() called with [existing key, value] throws', () => {
  const container = Container()
  container.singleton('foo', factoryFn)
  return expectError(() => {
    container.singleton('foo', factoryFn)
  }, 'Container already has [foo] defined')
})

roast.it('can resolve dependencies from itself', () => {
  const container = Container()
  container.define('foo', 'foo value')
  container.bind('bar', () => {
    return 'bar value'
  })
  container.singleton('baz', (container, ...args) => {
    return args.map(container.make)
  })
  const result = container.make('baz', 'foo', 'bar')
  return result.length === 2 &&
        result[0] === 'foo value' && result[1] === 'bar value'
})

roast.run()
roast.exit()
