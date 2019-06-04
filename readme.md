# Container Store
A simple container for dependency injection / service without `new` or `this` with no dependencies.

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
container.value('foo', 'foo value')

// Now you can access it using .make()
container.make('foo') // 'foo value'
// or by property
container.foo // 'foo value'

// Define a factory fn (do not use fat arrow functions)
container.bind('bar', function (prop) {
  return ['bar', this[key]]
})

// Now you can run the bound fn using .make()
container.make('bar', 'foo') // ['bar', 'foo value']
container.make('bar', 'not yet set') // ['bar', undefined]


// Sometimes you want to have a function invoked only once and always return the same result
container.singleton('baz', function (prop) {
  return this.container.make('bar', prop)
})
container.make('baz', 'foo') // ['bar', 'foo value']

// Subsequent calls will return result of first call
container.make('baz') // ['bar', 'foo value']
container.baz // ['bar', 'foo value']
// Subsequent calls with params will throw error
container.make('baz', 'not yet set') // Error
```

## Credits
Inspired by
* https://github.com/mcordingley/Inverse.js
* https://laravel.com/docs/5.6/container
