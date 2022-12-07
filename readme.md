# Doom Reactive State

Super simple reactive state management and pure-js fine-grained reactive DOM components.

[![npm](https://img.shields.io/npm/v/doom-reactive-js?color=44CC11)](https://www.npmjs.com/package/doom-reactive-js)
&nbsp;
[![dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?colorB=44CC11)](https://www.npmjs.com/package/doom-reactive-js?activeTab=dependencies)
&nbsp;
[![Test](https://github.com/AlessioCoser/doom-state-js/actions/workflows/test.yml/badge.svg)](https://github.com/AlessioCoser/doom-state-js/actions/workflows/test.yml)

![npm bundle size](https://img.shields.io/bundlephobia/minzip/doom-reactive-js)
&nbsp;
[![downloads](https://img.shields.io/npm/dt/doom-reactive-js.svg?colorB=007EC6)](https://www.npmjs.com/package/coinbase-pro-api)
&nbsp;
[![license](https://img.shields.io/badge/license-MIT-blue.svg?colorB=007EC6)](https://spdx.org/licenses/MIT)

## Features
1. Zero dependencies
2. Just a few lines of code
3. Super-Easy concepts
4. No magic, you create components that are simple HTMLElements
5. Only a single Pure-JS HTMLElement wrapper to enable reactivity on properties
6. No compilation required (excluding Typescript transpilation)

## Examples
You can find some examples here: [./examples](./examples)

## Getting Started

### With Node.js - only pure reactive state

1. Create a file called index.js
    ```javascript
    const { signal, effect } = require("doom-reactive-js")

    const [count, setCount] = signal(1)

    setInterval(() => setCount(count() + 1), 1000)

    effect(() => console.log(count()))
    ```
2. Run the file with node
    ```
    node index.js
    ```
3. You will see that every second the incremented number will be printed

### With the reactive dom

This is a simple increment counter component
```javascript
const { signal, h } = require("doom-reactive-js")

function App() {
  const [count, setCount] = signal(1)

  function increment() {
    setCount(count() + 1)
  }

  return h("div", [
    h("h2", { innerText: 'Count: ' }, [
      h('span', { innerText: () => `${count()}` })
    ]),
    h("button", { innerText: 'increment', onclick: increment }),
  ])
}

document.body.appendChild(App())
```

# Contributing

## Run Tests
```
npm test
```

## Publish a new package version
If I want to publish the new `0.0.1` version I need to create and push a new `0.0.1` tag:
```bash
git tag 0.0.1
git push --tags
```
The Github Action will take care to publish the package with the tag name as version