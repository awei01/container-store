const Container = require('~/Container')

describe('Container()', () => {
  test('it returns object', () => {
    expect(Container()).toEqual({})
  })

  describe('make()', () => {
    test('called with [non-existent key] returns [undefined]', () => {
      const container = Container()
      expect(container.make('i.dont.exist')).toBe(undefined)
    })
    test('called with [non-string key] throws', () => {
      const container = Container()
      expect(() => {
        container.make(3)
      }).toThrow('Container cannot make without valid key')
      expect(() => {
        container.make(null)
      }).toThrow('Container cannot make without valid key')
      expect(() => {
        container.make([])
      }).toThrow('Container cannot make without valid key')
    })
  })

  describe('value()', () => {
    test('called with [key, value] can then make() with [key] or by property', () => {
      const container = Container()
      container.value('foo', 'foo value')
      const bar = {}
      container.value('bar', bar)

      expect(container.make('foo')).toBe('foo value')
      expect(container.foo).toBe('foo value')
      expect(container.make('bar')).toBe(bar)
      expect(container.bar).toBe(bar)
    })
    test('called with [key, value] throws error when trying to value() with same [key]', () => {
      const container = Container()
      container.value('foo', 'foo value')

      expect(() => {
        container.value('foo', 'other value')
      }).toThrow('Container already has [foo] defined')
    })
    test('it should make the key enumerable', () => {
      const container = Container()
      container.value('foo', 'foo value')
      expect(Object.keys(container)).toEqual(['foo'])
    })
  })

  describe('instance()', () => {
    test('called with [key, non-fn] throws', () => {
      const container = Container()

      expect(() => {
        container.instance('foo', 'other value')
      }).toThrow('Container instance() requires a function')
    })
    test('called with [key, fn] creates and returns same instance and is accessible by property', () => {
      const container = Container()
      container.instance('foo', () => {
        return { foo: 'result' }
      })

      const result = container.make('foo')
      expect(result).toEqual({ foo: 'result' })
      expect(container.make('foo')).toBe(result)
      expect(container.foo).toBe(result)
    })
    test(`called with [key, fn] on make()
        calls fn() with this as { container, key }
        can be passed arguments
        does not modify fn`, () => {
      const container = Container()
      container.value('foo', 'foo value')
      function barFn (...args) {
        return `[${this.key}]: ${this.container.foo}: ${args.join(', ')}`
      }
      container.instance('bar', barFn)

      expect(container.make('bar', 1, 2, 3)).toBe('[bar]: foo value: 1, 2, 3')
      expect(barFn.container).toBe(undefined)
      expect(barFn.key).toBe(undefined)
    })
    test(`called with [key, fn] called with make()
        then make() called again with arguments throws`, () => {
      const container = Container()
      container.instance('bar', () => {
        return 'bar value'
      })
      container.make('bar')

      expect(() => {
        container.make('bar', 1, 2, 3)
      }).toThrow('Container already made instance of [bar]')
    })
    test(`called with [key, fn] reveals enumerable key`, () => {
      const container = Container()
      container.instance('bar', () => {
        return 'bar value'
      })
      expect(Object.keys(container)).toEqual(['bar'])
    })
  })

  describe('factory()', () => {
    test('called with [key, non-fn] throws', () => {
      const container = Container()

      expect(() => {
        container.factory('foo', 'other value')
      }).toThrow('Container factory() requires a function')
    })
    test('called with [key, fn] returns new instance on make()', () => {
      const container = Container()
      container.factory('foo', () => {
        return { foo: 'result' }
      })

      const result = container.make('foo')
      expect(result).toEqual({ foo: 'result' })
      expect(container.make('foo')).not.toBe(result)
    })
    test('called with [key, fn] can make via property access', () => {
      const container = Container()
      container.factory('foo', (value) => {
        return { foo: value }
      })
      expect(container.foo('value')).toEqual({ foo: 'value' })
    })
    test('called with [key, fn] exposes key as enumerable', () => {
      const container = Container()
      container.factory('foo', (value) => {
        return { foo: value }
      })
      expect(Object.keys(container)).toEqual(['foo'])
    })
    test(`called with [key, fn] on make()
        calls fn() with this as { container, key }
        can be passed arguments
        does not modify fn`, () => {
      const container = Container()
      container.value('foo', 'foo value')
      function barFn (...args) {
        return `[${this.key}]: ${this.container.foo}: ${args.join(', ')}`
      }
      container.factory('bar', barFn)

      expect(container.make('bar', 1, 2, 3)).toBe('[bar]: foo value: 1, 2, 3')
      expect(barFn.container).toBe(undefined)
      expect(barFn.key).toBe(undefined)
    })
  })

  describe('substitute()', () => {
    test('called with [existing key] can override define, instance, factory', () => {
      const container = Container()
      container.value('foo', 'defined value')
      container.instance('bar', () => {
        return 'instance value'
      })
      container.factory('baz', () => {
        return 'factory value'
      })
      expect(container.foo).toBe('defined value')
      expect(container.bar).toBe('instance value')
      expect(container.make('baz')).toBe('factory value')

      container.substitute('foo', 'foo')
      container.substitute('bar', 'bar')
      container.substitute('baz', 'baz')
      expect(container.foo).toBe('foo')
      expect(container.bar).toBe('bar')
      expect(container.make('baz')).toBe('baz')
    })

    test('called with [non-existent key] throws error', () => {
      const container = Container()
      expect(() => {
        container.substitute('new', 'value')
      }).toThrow('Cannot substitute [new] as it has not been defined')
    })
  })
})
