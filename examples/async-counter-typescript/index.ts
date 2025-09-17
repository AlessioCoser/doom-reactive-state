import {Button, d, derive, Div, effect, h, H2, P, Signal, signal, toChildren } from "doom-reactive-state"

type MainProps = { counter: Signal<number> };
const Main = ({ counter }: MainProps) => {
  // this is a non-reactive component it's out of the renderer loop since it isn't wrapped with the `effect` function
  // here we can instantiate the state (!! never instantiate a state in an `effect` function !!)
  const [count, setCount] = counter;
  const [btnText, setBtnText] = signal("initial text");
  const [isLoading, setIsLoading] = signal(false);
  // we can use a derived signal and maintain the state in sync
  const doubledText = derive("", () => `doubled is: ${count() * 2}`);
  const half = derive(0, () => count() / 2);
  // we can also edit or update the derived signal (like adding an element to an array)
  const history = derive<number[]>([], (h) => [count(), ...h]);

  // we can use setTimeout and setInterval outside re-rendered components
  setTimeout(() => setBtnText("updated text"), 2000);
  setTimeout(() => setCount(count() + 1), 5000);

  effect(() => console.log("count effect", count()));
  effect(() => console.log("loading effect", isLoading()));
  effect(() => console.log("text effect", btnText()));

  const asyncOperation = async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(null), 1000);
    });
  };

  const onclick = async () => {
    setIsLoading(true);
    await asyncOperation();
    setCount(count() + 1);
    setIsLoading(false);
  };

  // h is a generic function to create a reactive HTMLElement.
  // we can also use wrappers for the most common tags like H1, H2, ..., Div, P ...
  return h("div", [
    // only functions inside objects are binded
    // all computed properties must be functions (or derivations)
    H2(() => `count ${count()}`),
    // d is shorthand for a derived signal. Is a tagged template function 'd' that creates a string derivation.
    // in the tagged template function the signal you want to derive must not be evaluated, otherwise it will not react on changes
    Div(d`half is: ${half}`),
    // we can also use text accessor as reactive text children
    doubledText,
    P([
      // we can avoid the element reacting for a specific property. we can pass the string directly without any function
      Div(`Initial Text ${btnText()}`),
      // since the state accessor is a function, you can pass it directly and still react to it's change like isLoading
      Button({ style: { display: "block" }, disabled: isLoading, onclick }, [
        `increase`,
      ]),
      // wrapping the text in a function, it will react to the btnText change
      Div(() => `Updated Text ${btnText()}`),
      // to make children to be reactive Use toChildren helper function. Keyed elements must be used
      Div(
        toChildren(history, (it) => {
          console.log("rendering history [", it(), "]");
          return P({ key: it() }, d`${it}`);
        })
      ),
    ]),
  ]);
};

const App = () => {
  // you can pass the state through all the components,
  // but will be re-rendered only the components that really access it
  const counter = signal(0);
  return Main({ counter });
};

// no need to use magic stuff to attach components to the dom,
// we always return a DOM Element from our components
document.body.appendChild(App());
