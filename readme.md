# Doom State JS

Super simple reactive state management and pure-js dom.

[![npm](https://img.shields.io/npm/v/doom-reactive-js?color=44CC11)](https://www.npmjs.com/package/doom-reactive-js)
&nbsp;&nbsp;&nbsp;
[![dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?colorB=44CC11)](https://www.npmjs.com/package/doom-reactive-js?activeTab=dependencies)
&nbsp;&nbsp;&nbsp;
[![Test](https://github.com/AlessioCoser/doom-state-js/actions/workflows/test.yml/badge.svg)](https://github.com/AlessioCoser/doom-state-js/actions/workflows/test.yml)

![npm bundle size](https://img.shields.io/bundlephobia/minzip/doom-reactive-js)
&nbsp;&nbsp;&nbsp;
[![downloads](https://img.shields.io/npm/dt/doom-reactive-js.svg?colorB=007EC6)](https://www.npmjs.com/package/coinbase-pro-api)
&nbsp;&nbsp;&nbsp;
[![license](https://img.shields.io/badge/license-MIT-blue.svg?colorB=007EC6)](https://spdx.org/licenses/MIT)

## Getting Started

```javascript
const { signal, effect } = require("doom-reactive-js")

const [count, setCount] = signal(1)

setInterval(() => setCount(count() + 1), 1000)

effect(() => console.log(count()))
```

## Run example
```
npm run example
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