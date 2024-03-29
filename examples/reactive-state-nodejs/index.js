const { signal, effect, derive, d } = require("doom-reactive-state");

const [count, setCount] = signal(1);
const multiply = derive(0, () => count() * 2);
const moltiplication = d`${count} * 2 = ${multiply}`;

setInterval(() => setCount(count() + 1), 3000);

effect(() => console.log(moltiplication()));
