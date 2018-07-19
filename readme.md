# Container Store
A simple container for dependency injection / service without `new` or `this` written in `es6` syntax with no dependencies.

## Install
* `npm install --save container-store`

## Use it
```
const Container = require('container-store')

// Create a new container
const container = Container()

// Try to make something
container.make('not yet set') // undefined

// Define a key with some value
container.define('foo', 'foo value')
// Now you can access it
container.make('foo') // 'foo value'

// Bind a function that will get called with the container and some args
container.bind('bar', (container, key) => {
  return ['bar', container.make(key)]
})
// Now you can make it
container.make('bar', 'foo') // ['bar', 'foo value']
container.make('bar', 'not yet set') // ['bar', undefined]

// Sometimes you want to have a function invoked only once and always return the same result
container.singleton('baz', (container, key) => {
  return container.make('bar', key)
})
container.make('baz', 'foo') // ['bar', 'foo value']
// Subsequent calls will return result of first call
container.make('baz', 'not yet set') // ['bar', 'foo value']
```

## Credits

Inspired by https://github.com/mcordingley/Inverse.js
