const { signal, effect } = require("doom-reactive-state")

const [count, setCount] = signal(1)

setInterval(() => {
  setCount(count() + 1)
}, 1000)

effect(() => console.log(count()))
