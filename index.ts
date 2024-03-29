import { Button, Div, H1, H2 } from "./src/dom";
import { Component } from "./src/dom/types";
import { d, effect, signal } from "./src/reactivity";
import { Accessor } from "./src/reactivity/types";

type ButtonProps = {
  size: Accessor<number>;
  onButtonClick: () => void;
};
const MyButton: Component<ButtonProps> = ({ size, onButtonClick }, children) => {
  const [isLoading, setIsLoading] = signal(false);
  const fontSize = d`${size}em`;

  const onclick = async () => {
    return new Promise((resolve) => {
      setIsLoading(true);
      setTimeout(() => {
        onButtonClick();
        setIsLoading(false);
        resolve(null);
      }, 2000);
    });
  };

  return Button(
    {
      style: { fontSize },
      disabled: isLoading,
      onclick,
    },
    children
  );
};

const App = () => {
  const [size, setSize] = signal(1);
  const [text, setText] = signal("initial text");

  effect(() => console.log("Size changed to:", size()));

  const onButtonClick = async () => {
    setText("New Text");
    setSize(size() + 1);
  };

  return Div([
    H1("Static Text"),
    H2(d`String derivation. This will update the signal size to "${size}"`),
    MyButton({ onButtonClick, size }, d`button ${text}`),
  ]);
};

// no need to use magic stuff to attach components to the dom,
// we always return a DOM Element from our components
document.body.appendChild(App());
