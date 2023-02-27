import { Component, Accessor, effect, signal } from "doom-reactive-state";
import { JSX } from "doom-reactive-state/dom";

type ButtonProps = {
  size: Accessor<number>;
  onButtonClick: () => void;
  children: JSX.Element[]
};
const Button: Component<ButtonProps> = ({ size, onButtonClick, children }) => {
  const [isLoading, setIsLoading] = signal(false);
  const fontSize = () => `${size()}em`;

  const onClick = async () => {
    return new Promise((resolve) => {
      setIsLoading(true);
      setTimeout(() => {
        onButtonClick();
        setIsLoading(false);
        resolve(null);
      }, 2000);
    });
  };

  return (
    <button style={{ fontSize }} disabled={isLoading} onclick={onClick}>
      {children}
    </button>
  );
};

const App = () => {
  const [count, setCount] = signal(1);
  const [btnText, setBtnText] = signal("initial text");
  effect(() => console.log("Count changed to:", count()));

  const onButtonClick = async () => {
    setBtnText("New Text");
    setCount(count() + 1);
  };

  return (
    <div>
      <h2>count {count}</h2>
      <Button
        onButtonClick={onButtonClick}
        text={btnText}
        size={count}
      >button {count}</Button>
    </div>
  );
};

// no need to use magic stuff to attach components to the dom,
// we always return a DOM Element from our components
document.body.appendChild(App());
