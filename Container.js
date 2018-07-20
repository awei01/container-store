function Container () {
  /**
   * Create a dependency injection container
   * @returns {object} - with { make, define, singleton, bind } methods
   */
  const _cached = {}
  const _bindFns = {}
  const _singletonFns = {}

  const container = {}

  function _validateKeyAvailable (key) {
    if (key in _cached || key in _bindFns || key in _singletonFns) {
      throw new Error(`Container already has [${key}] defined`)
    }
  }
  function _register (cache, key, value) {
    _validateKeyAvailable(key)
    cache[key] = value
    Object.defineProperty(container, key, { get: _make.bind(null, key) })
    return container
  }

  function _make (key, ...rest) {
    /**
     * Get something out of the container
     * @param key {string} - a key to lookup on the container
     * @returns {any} - the container's definition for key
     */
    if (!key || typeof key !== 'string') { throw new Error('Container cannot make without valid [key]') }

    if (_cached[key]) {
      // object or singleton is already _cached, return it
      return _cached[key]
    }
    const args = [container, ...rest]
    if (_singletonFns[key]) {
      // we found a singleton, make it and register it
      const result = _cached[key] = _singletonFns[key].apply(null, args)
      return result
    }
    if (_bindFns[key]) {
      // we have a bound fn, instantiate it every time
      return _bindFns[key].apply(null, args)
    }
  }
  Object.defineProperty(container, 'make', { value: _make })

  /**
   * Define a static value on container
   * @param key {string} - unique key
   * @param value {any} - whatever you want to set the key to
   */
  Object.defineProperty(container, 'define', { value: _register.bind(null, _cached) })
  /**
   * Bind a key to a particular function which will be run every time the key is made
   * @param key {string} - unique key
   * @param callback {function} - a function to be invoked on every make()
   */
  Object.defineProperty(container, 'bind', { value: _register.bind(null, _bindFns) })
  /**
   * Bind a key to a particular function which will be run only once the key is made
   * @param key {string} - unique key
   * @param callback {function} - a function to be invoked for first make() and its result will be returned on subsequent make()
   */
  Object.defineProperty(container, 'singleton', { value: _register.bind(null, _singletonFns) })

  return container
}

module.exports = Container
