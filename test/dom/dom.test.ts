import { expect, describe, it, beforeEach } from "vitest";
import { Div, P, h, d, signal } from "../../src";

const body = document.body;

describe("dom", () => {
  beforeEach(() => {
    body.innerHTML = "";
  });

  it("create an element", () => {
    const element = h("div");
    body.appendChild(element);

    expect(body.innerHTML).toEqual("<div></div>");
  });

  it("create a div element with a text inside", () => {
    const element = h("div", ["ciao"]);
    body.appendChild(element);

    expect(body.innerHTML).toEqual("<div>ciao</div>");
  });

  it("create a div element with properties", () => {
    const element = h("div", { className: "class1" });
    body.appendChild(element);

    expect(body.innerHTML).toEqual(`<div class="class1"></div>`);
  });

  it("create a div element with style properties", () => {
    const element = h("div", { style: { fontSize: "15px" } });
    body.appendChild(element);

    expect(body.innerHTML).toEqual(`<div style="font-size: 15px;"></div>`);
  });

  it("create a div element with reactive properties", () => {
    const element = h("div", {
      className: () => "test",
      style: { padding: () => "5px" },
    });
    body.appendChild(element);

    expect(body.innerHTML).toEqual(
      `<div class="test" style="padding: 5px;"></div>`
    );
  });

  it("create a div element with reactive style attributes", () => {
    const element = h("div", { style: { padding: () => "5px" } });
    body.appendChild(element);

    expect(body.innerHTML).toEqual(`<div style="padding: 5px;"></div>`);
  });

  it("handle reactivity", () => {
    const [count, setCount] = signal(14);
    const element = h("div", { style: { fontSize: () => `${count()}px` } }, [
      "Increase",
    ]);
    body.appendChild(element);

    expect(body.innerHTML).toEqual(
      `<div style="font-size: 14px;">Increase</div>`
    );

    setCount(20);

    expect(body.innerHTML).toEqual(
      `<div style="font-size: 20px;">Increase</div>`
    );
  });

  it("update div style property on click", () => {
    const Element = () => {
      const [count, setCount] = signal(10);

      const fontSize = () => `${count()}px`;
      const increase = () => setCount(count() + 5);

      return h(
        "div",
        { className: "test", style: { fontSize }, onclick: increase },
        ["Click me"]
      );
    };
    body.appendChild(Element());

    expect(body.innerHTML).toEqual(
      `<div class="test" style="font-size: 10px;">Click me</div>`
    );

    body.querySelector("div")?.click();

    expect(body.innerHTML).toEqual(
      `<div class="test" style="font-size: 15px;">Click me</div>`
    );
  });

  it("remove a style property using an empty value", () => {
    const [visible, setVisible] = signal<string>("hidden");

    body.appendChild(
      h("div", { style: { visibility: () => visible() } }, ["Click me"])
    );

    expect(body.innerHTML).toEqual(
      `<div style="visibility: hidden;">Click me</div>`
    );
    setVisible("visible");
    expect(body.innerHTML).toEqual(
      `<div style="visibility: visible;">Click me</div>`
    );
    setVisible("");
    expect(body.innerHTML).toEqual(`<div style="">Click me</div>`);
  });

  it("update text child on click", () => {
    const Element = () => {
      const [count, setCount] = signal(10);

      const increase = () => setCount(count() + 5);
      const size = d`Size: ${count}px`;

      return h("div", { onclick: increase }, [size]);
    };
    body.appendChild(Element());

    expect(body.innerHTML).toEqual(`<div>Size: 10px</div>`);

    body.querySelector("div")?.click();

    expect(body.innerHTML).toEqual(`<div>Size: 15px</div>`);
  });

  it("update element child on click", () => {
    const Element = () => {
      const [count, setCount] = signal(10);

      const increase = () => setCount(count() + 5);

      return h("div", { onclick: increase }, [
        h("strong", [d`Size: ${count}px`]),
      ]);
    };
    body.appendChild(Element());

    expect(body.innerHTML).toEqual(`<div><strong>Size: 10px</strong></div>`);

    body.querySelector("div")?.click();

    expect(body.innerHTML).toEqual(`<div><strong>Size: 15px</strong></div>`);
  });

  it("h inside h", () => {
    const [count, setCount] = signal(5);
    const increase = () => setCount(count() + 5);

    const text = () => (count() >= 10 ? `Size: ${count()}px - ` : "c");
    const howBig = () =>
      count() < 10
        ? "CLICK ME"
        : count() < 20
        ? "S"
        : count() < 40
        ? "M"
        : count() < 60
        ? "L"
        : "XL";

    body.appendChild(h("div", [text, h("strong", [howBig])]));

    expect(body.innerHTML).toEqual(`<div>c<strong>CLICK ME</strong></div>`);

    increase();

    expect(body.innerHTML).toEqual(
      `<div>Size: 10px - <strong>S</strong></div>`
    );

    increase();

    expect(body.innerHTML).toEqual(
      `<div>Size: 15px - <strong>S</strong></div>`
    );

    increase();

    expect(body.innerHTML).toEqual(
      `<div>Size: 20px - <strong>M</strong></div>`
    );
  });

  it("nested elements", () => {
    const Nested = ({ name }: { name: string }) => {
      return h("p", { className: name }, ["Nested"]);
    };
    const Element = () => {
      return h("div", { className: "Element" }, [Nested({ name: "name" })]);
    };
    body.appendChild(Element());

    expect(body.innerHTML).toEqual(
      `<div class="Element"><p class="name">Nested</p></div>`
    );
  });

  it("use html components", () => {
    const Nested = ({ name }: { name: string }) => {
      return P({ className: name }, ["Nested"]);
    };
    const Element = () => {
      return Div({ className: "Element" }, [Nested({ name: "name" })]);
    };
    body.appendChild(Element());

    expect(body.innerHTML).toEqual(
      `<div class="Element"><p class="name">Nested</p></div>`
    );
  });

  it("create element with properties and children", () => {
    const element = h("div", { className: "container" }, ["Hello", " ", "World"]);
    body.appendChild(element);

    expect(body.innerHTML).toEqual(`<div class="container">Hello World</div>`);
  });

  it("create element with reactive children in array", () => {
    const [text, setText] = signal("initial");
    const element = h("div", ["Static: ", () => text()]);
    body.appendChild(element);

    expect(body.innerHTML).toEqual("<div>Static: initial</div>");

    setText("updated");
    expect(body.innerHTML).toEqual("<div>Static: updated</div>");
  });

  it("handle mixed static and reactive children", () => {
    const [count, setCount] = signal(5);
    const element = h("div", [
      "Count: ",
      () => count().toString(),
      " items"
    ]);
    body.appendChild(element);

    expect(body.innerHTML).toEqual("<div>Count: 5 items</div>");

    setCount(10);
    expect(body.innerHTML).toEqual("<div>Count: 10 items</div>");
  });

  it("handle reactive className changes", () => {
    const [isDone, setIsDone] = signal(false);
    const element = h("div", { className: () => isDone() ? "done" : "" }, ["Task"]);
    body.appendChild(element);

    expect(body.innerHTML).toEqual(`<div class="">Task</div>`);

    setIsDone(true);
    expect(body.innerHTML).toEqual(`<div class="done">Task</div>`);

    setIsDone(false);
    expect(body.innerHTML).toEqual(`<div class="">Task</div>`);
  });

  it("handle multiple reactive style properties", () => {
    const [size, setSize] = signal(16);
    const [color, setColor] = signal("red");

    const element = h("div", {
      style: {
        fontSize: () => `${size()}px`,
        color: () => color()
      }
    }, ["Styled text"]);
    body.appendChild(element);

    expect(body.innerHTML).toEqual(`<div style="font-size: 16px; color: red;">Styled text</div>`);

    setSize(20);
    expect(body.innerHTML).toEqual(`<div style="font-size: 20px; color: red;">Styled text</div>`);

    setColor("blue");
    expect(body.innerHTML).toEqual(`<div style="font-size: 20px; color: blue;">Styled text</div>`);
  });

  it("handle event handlers with reactive context", () => {
    const [clicked, setClicked] = signal(false);

    const element = h("button", {
      onclick: () => setClicked(true),
      className: () => clicked() ? "clicked" : ""
    }, [() => clicked() ? "Clicked!" : "Click me"]);
    body.appendChild(element);

    expect(body.innerHTML).toEqual(`<button class="">Click me</button>`);

    body.querySelector("button")?.click();
    expect(body.innerHTML).toEqual(`<button class="clicked">Clicked!</button>`);
  });

  it("handle nested reactive elements", () => {
    const [outer, setOuter] = signal("outer");
    const [inner, setInner] = signal("inner");

    const element = h("div", [
      () => outer(),
      h("span", [() => inner()])
    ]);
    body.appendChild(element);

    expect(body.innerHTML).toEqual("<div>outer<span>inner</span></div>");

    setOuter("OUTER");
    expect(body.innerHTML).toEqual("<div>OUTER<span>inner</span></div>");

    setInner("INNER");
    expect(body.innerHTML).toEqual("<div>OUTER<span>INNER</span></div>");
  });

  it("handle empty children arrays", () => {
    const element = h("div", []);
    body.appendChild(element);

    expect(body.innerHTML).toEqual("<div></div>");
  });

  it("handle undefined children", () => {
    const element = h("div", undefined);
    body.appendChild(element);

    expect(body.innerHTML).toEqual("<div></div>");
  });

  it("handle complex reactive conditions", () => {
    const [count, setCount] = signal(0);

    const element = h("div", [
      () => count() === 0 ? "Empty" : `Count: ${count()}`,
      h("span", [() => count() > 5 ? " (High)" : " (Low)"])
    ]);
    body.appendChild(element);

    expect(body.innerHTML).toEqual("<div>Empty<span> (Low)</span></div>");

    setCount(3);
    expect(body.innerHTML).toEqual("<div>Count: 3<span> (Low)</span></div>");

    setCount(7);
    expect(body.innerHTML).toEqual("<div>Count: 7<span> (High)</span></div>");
  });
});
