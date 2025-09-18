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
1. :gem: Zero dependencies
2. :zap: No compilation required
3. :surfer: Super-Easy reactive concepts (signal, effect, derive)
4. :four_leaf_clover: No magic, you create components that are simple HTMLElements
5. :blossom: Just a few lines of code
6. :hatching_chick: Only a single HTMLElement wrapper to enable a **fine-grained reactivity** on Element properties
7. :lipstick: Some helper functions to easily create common reactive HTMLElement such as `Div`, `P` and `Span`.

## Examples & Docs
- You can find **some examples** here: [Examples](https://github.com/AlessioCoser/doom-reactive-state/tree/master/examples)
- You can find the **full documentation** here: [Documentation](#documentation)

## Install
Use your preferred package manager:
- `npm install doom-reactive-state`
- `yarn add doom-reactive-state`
- `pnpm add doom-reactive-state`

## Getting Started

This is a simple increment counter component
```javascript
const { signal, Div, H2, Button, Span, d } = require("doom-reactive-state")

const App = () => {
  const [count, setCount] = signal(0)

  const onclick = () => setCount(count() + 1)

  return Div([
    H2(['Count: ', Span(d`${count}`)]),
    Button({ onclick }, 'increment'),
  ])
}

document.body.appendChild(App())
```

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


### Use it directly inside the HTML
You can load the script from the github release url and start use it right away.
```html
<html>
  <head>
    <!-- other stuff -->
    <script src="https://github.com/AlessioCoser/doom-reactive-state/releases/download/1.5.1/doom-reactive-state.global.js"></script>
  </head>
  <body>
    <script type="application/javascript">
      function HelloWorldApp() {
        return doom.Span("Hello World!")
      }

      document.body.appendChild(HelloWorldApp());
    </script>
  </body>
</html>
```

# Documentation

## Core Concepts: Reactivity

The reactivity system is built on three main primitives: `signal`, `effect`, and `derive`.

### `signal(initialValue)`
A signal is the fundamental building block for reactive state. 
It holds a value and notifies its subscribers when that value changes. 
Calling `signal` returns a tuple containing a getter and a setter function.

- **Getter**: A function that returns the current value. Accessing the value within an `effect` or `derive` will subscribe to its changes.
- **Setter**: A function that updates the signal's value and triggers any dependent effects or derivations.

```typescript
import { signal, effect } from "doom-reactive-state";

const [count, setCount] = signal(0); // Create a signal with an initial value of 0

console.log(count()); // Prints: 0
setCount(10); // Update the value to 10
console.log(count()); // Prints: 10
```

### `effect(fn)`

An effect is a function that automatically re-runs whenever the signals it depends on are updated.
It's ideal for side effects like logging, data fetching, or manual DOM manipulations.


```typescript
import { signal, effect } from "doom-reactive-state";

const [firstName, setFirstName] = signal("John");
const [lastName, setLastName] = signal("Doe");

effect(() => console.log(`${firstName()} ${lastName()}`)); // Prints "John Doe"

setFirstName("Bob"); // Prints: "Bob Doe"
```

### `derive(fn)`

A derived signal (or computed signal) creates a new signal whose value is calculated from other signals.
It is both reactive itself and memoized, meaning it only re-computes its value when one of its dependencies changes.

```typescript
const [count, setCount] = signal(1);
const double = derive(() => count() * 2);

console.log(double()); // Prints: 2
setCount(5);
console.log(double()); // Prints: 10
```

### `d\`...\`` (Template Literal)

The `d` tagged template literal is a convenient shorthand for creating
a derived signal that combines strings and reactive signals.

```typescript
const [count, setCount] = signal(14);
const fontSize = d`${count}px`;

console.log(fontSize()); // Prints: "14px"
setCount(20);
console.log(fontSize()); // Prints: "20px"
```

## DOM Rendering

The library provides a function `h` (and HTML tag helpers like `Div`, `P`, `Ul`, `Li`) to create DOM elements with reactive capabilities.

### `h(tag, properties, children)`

This is the core function for creating an `HTMLElement`.

-   `tag`: The HTML tag name (e.g., `'div'`).
-   `properties`: An optional object for attributes, styles, and event listeners.
-   `children`: An optional array of child nodes (elements, strings, or reactive functions).

### Properties

Properties can be static or reactive.
**To make a property reactive, pass a function that returns the desired value.**

The reactivity is fine-grained on every property, meaning only the properties that depend on signals will be updated when those signals change.

```typescript
import { signal, h } from "doom-reactive-state";

const [isDone, setIsDone] = signal(false);
const [color, setColor] = signal("blue");

const element = h(
  "div",
  {
    className: () => (isDone() ? "done" : "pending"), // Reactive className
    style: {
      color: () => color(), // Reactive style color property
      fontSize: "16px", // Static style fontSize property
    },
    onclick: () => setIsDone(!isDone()), // Event handler
  },
  "Click me to toggle status"
);

document.body.appendChild(element);
```

### Children
The `h` function accepts children in several forms, allowing for both static content and powerful, fine-grained reactivity.

#### Static and Reactive Children

You can provide a single child or an array of children. The library intelligently handles each type:
- **Static Text**: Plain strings are rendered once and remain static.
- **Reactive Text**: A function that returns a string (e.g., () => \Count: ${count()}``) creates a reactive text node. This node will automatically update in the DOM whenever a signal it depends on changes, without re-rendering the entire component.
- **Element**: An HTMLElement created with `h` is statically added to the dom. It is inherently reactive if it uses at least one signal in one of its properties.
- **Array**: You can pass an array containing any combination of the above types. The array will ever be statically rendered, but individual elements within it can be reactive.

```typescript
import { signal, h } from "doom-reactive-state";

const [count, setCount] = signal(0);

const counterDisplay = h("div", [ // Static array of elements
  "The current count is: ", // Static text node
  () => `${count()}`,       // Reactive text node
  h("button", { onclick: () => setCount(c => c + 1) }, "+") // Static element with single static child
]);

document.body.appendChild(counterDisplay);
```

#### Reactive Array of children
Passing a standard JavaScript array as children creates a static list.
The framework will not react to items being added, removed, or reordered in that array after the initial render.

To render a dynamic list that efficiently updates, you must use the `toChildren` helper.
This function is designed to work with a signal that holds an array, applying a mapping function to transform each item into a DOM element.

Keying is crucial for performance. And enforced within the typing system. When rendering a list with `toChildren`, you must provide a unique key property for each element.

This key allows the reconciliation algorithm to identify, reorder, and preserve elements across updates, preventing unnecessary DOM node re-creation and dramatically improving performance.

```typescript
import { signal, Ul, Li, toChildren } from "doom-reactive-state";

const Example = () => {
   const [items, setItems] = signal([
      {id: 1, text: "First"},
      {id: 2, text: "Second"},
   ]);

   const updateItems = () => setItems([
      {id: 2, text: "Second"}, // moved at the top
      {id: 1, text: "First"},
      {id: 3, text: "Third"}, // added at the end
   ])

   return Div([
      Ul(toChildren(items, (item) => Li({key: item().id}, [() => item().text]))),
      Button({ onclick: updateItems }, 'update array')
   ])
}

document.body.appendChild(Example());

// After the button click the DOM will be efficiently updated:
// - The element with key 2 is moved to the first position.
// - A new element with key 3 is created and appended.
```

# Contributing

## Run Tests
```
npm test
```

## Run Dev
this runs an application present in the dev folder with vite
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
