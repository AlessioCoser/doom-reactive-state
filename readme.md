# Doom Reactive State

Super simple reactive state management with fine-grained reactive DOM elements.

[![npm](https://img.shields.io/npm/v/doom-reactive-state?color=44CC11)](https://www.npmjs.com/package/doom-reactive-state)
&nbsp;
[![dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?colorB=44CC11)](https://www.npmjs.com/package/doom-reactive-state?activeTab=dependencies)
&nbsp;
[![Test](https://github.com/AlessioCoser/doom-state-js/actions/workflows/test.yml/badge.svg)](https://github.com/AlessioCoser/doom-state-js/actions/workflows/test.yml)

![npm bundle size](https://img.shields.io/bundlephobia/minzip/doom-reactive-state)
&nbsp;
[![license](https://img.shields.io/badge/license-MIT-blue.svg?colorB=007EC6)](https://spdx.org/licenses/MIT)

## Features
1. Zero dependencies
2. Just a few lines of code
3. Super-Easy reactive concepts (signal, effect, derived)
4. No magic, you create components that are simple HTMLElements
5. Only a single HTMLElement wrapper to enable reactivity on Element properties
6. No compilation required (excluding Typescript transpilation)

## Examples
You can find some examples here: [./examples](./examples)

## Getting Started

### With Node.js - only pure reactive state

1. Create a file called index.js
    ```javascript
    const { signal, effect } = require("doom-reactive-state")

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
const { signal, h } = require("doom-reactive-state")

function App() {
  const [count, setCount] = signal(1)

  const onclick = () => setCount(count() + 1)

  return h("div", { children: [
    h("h2", { children: [
      "Count: ",
      h('span', { children: [() => `${count()}`] })
    ]}),
    h("button", { onclick, children: ['increment'] }),
  ]})
}

document.body.appendChild(App())
```

# Contributing

## Run Tests
```
npm test
```

## Run Dev
this runs an application present in dev folder with parcel
```
npm run dev
```

## Publish a new package version
If I want to publish the new `0.0.1` version I need to create and push a new `0.0.1` tag:
```bash
git tag 0.0.1
git push --tags
```
The Github Action will take care to publish the package with the tag name as version