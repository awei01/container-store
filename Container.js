function Container () {
  const _cached = {}
  const _factoryFns = {}
  const _instanceFns = {}

  const container = {}

  function _hasKey (key) {
    return key in _cached || key in _factoryFns || key in _instanceFns
  }

  function _validateKeyAvailable (key) {
    if (_hasKey(key)) {
      throw new Error(`Container already has [${key}] defined`)
    }
  }
  function _register (cache, needsFnMethod, key, value) {
    _validateKeyAvailable(key)
    if (needsFnMethod && typeof value !== 'function') {
      throw new Error(`Container ${needsFnMethod}() requires a function`)
    }
    cache[key] = value
    Object.defineProperty(container, key, { enumerable: true, get:
      cache !== _factoryFns
        ? _make.bind(null, key)
        : () => {
            return (...args) => { return _make(key, ...args) }
          }
    })
    return container
  }

  function _make (key, ...params) {
    /**
     * Get something out of the container
     * @param key {string} - a key to lookup on the container
     * @returns {any} - the container's definition for key
     */
    if (!key || typeof key !== 'string') { throw new Error('Container cannot make without valid key') }

    const instanceFn = _instanceFns[key]
    if (_cached[key]) {
      if (instanceFn && params.length) {
        // we have a made instance already but we're trying to make it again w/ params
        throw new Error(`Container already made instance of [${key}]`)
      }
      // object or singleton is already _cached, return it
      return _cached[key]
    }

    // always use the container and key as the context for the fn
    const context = { container, key }
    if (instanceFn) {
      // we found a singleton, make it and register it
      const result = _cached[key] = instanceFn.apply(context, params)
      return result
    }

    if (_factoryFns[key]) {
      // we have a bound fn, instantiate it every time
      return _factoryFns[key].apply(context, params)
    }
  }

  function _substitute (key, value) {
    if (!_hasKey(key)) { throw new Error(`Cannot substitute [${key}] as it has not been defined`) }
    _cached[key] = value
  }

  Object.defineProperty(container, 'make', { value: _make })
  Object.defineProperty(container, 'value', { value: _register.bind(null, _cached, false) })
  Object.defineProperty(container, 'instance', { value: _register.bind(null, _instanceFns, 'instance') })
  Object.defineProperty(container, 'factory', { value: _register.bind(null, _factoryFns, 'factory') })
  Object.defineProperty(container, 'substitute', { value: _substitute })

  return container
}

module.exports = Container
