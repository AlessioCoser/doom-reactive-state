const { signal, effect, derive } = require("doom-reactive-state")

const [count, setCount] = signal(1)
const multiply = derive(0, () => count() * 2)

setInterval(() => {
  setCount(count() + 1)
}, 3000)

effect(() => {
  console.log("=====================")
  console.log(count())
  console.log(multiply())
})
