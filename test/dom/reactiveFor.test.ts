import { beforeEach, describe, expect, it } from "vitest";
import { For, Div, Li, signal, Ul } from "../../src";

const body = document.body;

describe("ReactiveFor", () => {
  beforeEach(() => {
    body.innerHTML = "";
  });

  it("renders empty list", () => {
    const [items] = signal<{ id: number; name: string }[]>([]);

    const forElement = Ul(
      For(items, (item) => Li({ key: item().id }, [item().name]))
    );

    body.appendChild(forElement);
    expect(body.innerHTML).toEqual('<ul></ul>');
  });

  it("renders an item with key 0", () => {
    const [items, setItems] = signal<{ id: number; name: string }[]>([]);

    const forElement = Ul(
      For(items, (item) => Li({ key: item().id }, [item().name]))
    );

    body.appendChild(forElement);

    setItems([{ id: 0, name: "Zero" }]);

    expect(body.innerHTML).toEqual(
      '<ul><li>Zero</li></ul>'
    );
  });

  it("renders initial items", () => {
    const [items] = signal([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ]);

    const forElement = Ul(
      For(items, (item) => Li({ key: item().id }, [item().name]))
    );

    body.appendChild(forElement);
    expect(body.innerHTML).toContain("Item 1");
    expect(body.innerHTML).toContain("Item 2");
  });

  it("updates when items change", () => {
    const [items, setItems] = signal([{ id: 1, name: "Item 1" }]);

    const forElement = Ul(
      For(items, (item) => Li({ key: item().id }, [() => item().name]))
    );

    body.appendChild(forElement);
    expect(body.innerHTML).toContain("<li>Item 1</li>");

    setItems([
      { id: 1, name: "Updated Item 1" },
      { id: 2, name: "Item 2" },
    ]);

    expect(body.innerHTML).toContain("<li>Updated Item 1</li><li>Item 2</li>");
  });

  it("handles item removal", () => {
    const [items, setItems] = signal([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ]);

    const forElement = Ul(
      For(items, (item) => Li({ key: item().id }, [item().name]))
    );

    body.appendChild(forElement);
    expect(body.innerHTML).toContain("Item 1");
    expect(body.innerHTML).toContain("Item 2");
    expect(body.innerHTML).toContain("Item 3");

    // Remove middle item
    setItems([
      { id: 1, name: "Item 1" },
      { id: 3, name: "Item 3" },
    ]);

    expect(body.innerHTML).toContain("Item 1");
    expect(body.innerHTML).not.toContain("Item 2");
    expect(body.innerHTML).toContain("Item 3");
  });

  it("handles item insertion at beginning", () => {
    const [items, setItems] = signal([
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ]);

    const forElement = Ul(
      For(items, (item) => Li({ key: item().id }, [item().name]))
    );

    body.appendChild(forElement);
    expect(body.innerHTML).toContain("<li>Item 2</li><li>Item 3</li>");

    // Insert at beginning
    setItems([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ]);

    expect(body.innerHTML).toContain(
      "<li>Item 1</li><li>Item 2</li><li>Item 3</li>"
    );
  });

  it("handles item insertion in middle", () => {
    const [items, setItems] = signal([
      { id: 1, name: "Item 1" },
      { id: 3, name: "Item 3" },
    ]);

    const forElement = Ul(
      For(items, (item) => Li({ key: item().id }, [item().name]))
    );

    body.appendChild(forElement);
    expect(body.innerHTML).toContain("<li>Item 1</li><li>Item 3</li>");

    // Insert in middle
    setItems([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ]);

    expect(body.innerHTML).toContain(
      "<li>Item 1</li><li>Item 2</li><li>Item 3</li>"
    );
  });

  it("handles reordering items", () => {
    const [items, setItems] = signal([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ]);

    const forElement = Ul(
      For(items, (item) =>
        Li({ key: item().id }, [() => `${item().name}`])
      )
    );

    body.appendChild(forElement);
    expect(body.innerHTML).toContain(
      "<li>Item 1</li><li>Item 2</li><li>Item 3</li>"
    );

    // Reverse order
    setItems([
      { id: 3, name: "Item 3" },
      { id: 2, name: "Item 2" },
      { id: 1, name: "Item 1" },
    ]);

    expect(body.innerHTML).toContain(
      "<li>Item 3</li><li>Item 2</li><li>Item 1</li>"
    );
  });

  it("handles complete replacement of items", () => {
    const [items, setItems] = signal([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ]);

    const forElement = Ul(
      For(items, (item) => Li({ key: item().id }, [item().name]))
    );

    body.appendChild(forElement);
    expect(body.innerHTML).toContain("<li>Item 1</li><li>Item 2</li>");

    // Replace all items
    setItems([
      { id: 4, name: "Item 4" },
      { id: 5, name: "Item 5" },
    ]);

    expect(body.innerHTML).not.toContain("Item 1");
    expect(body.innerHTML).not.toContain("Item 2");
    expect(body.innerHTML).toContain("<li>Item 4</li><li>Item 5</li>");
  });

  it("handles clearing and refilling list", () => {
    const [items, setItems] = signal([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ]);

    const forElement = Ul(
      For(items, (item) => Li({ key: item().id }, [item().name]))
    );

    body.appendChild(forElement);
    expect(body.innerHTML).toContain("<li>Item 1</li><li>Item 2</li>");

    // Clear list
    setItems([]);
    expect(body.innerHTML).toEqual('<ul></ul>');

    // Refill list
    setItems([
      { id: 3, name: "Item 3" },
      { id: 4, name: "Item 4" },
    ]);
    expect(body.innerHTML).toContain("<li>Item 3</li><li>Item 4</li>");
  });

  it("handles mixed reactive and static content", () => {
    const [items, setItems] = signal([
      { id: 1, name: "Item 1", active: false },
    ]);

    const forElement = Ul(
      For(items, (item) => {
        return Li({ key: item().id }, [
          "Static: ",
          () => item().name,
          " - ",
          () => (item().active ? "Active" : "Inactive"),
        ]);
      })
    );

    body.appendChild(forElement);
    expect(body.innerHTML).toContain("Static: Item 1 - Inactive");

    // Update reactive parts
    setItems([{ id: 1, name: "Updated Item 1", active: true }]);

    expect(body.innerHTML).toContain("Static: Updated Item 1 - Active");
  });

  it("handles nested For components", () => {
    const [categories] = signal([
      {
        id: 1,
        name: "Category 1",
        items: [
          { id: 1, name: "Item 1" },
          { id: 2, name: "Item 2" },
        ],
      },
      { id: 2, name: "Category 2", items: [{ id: 3, name: "Item 3" }] },
    ]);

    const forElement = Ul(
      For(categories, (category) => {
        return Div({ key: category().id }, [
          () => category().name,
          Ul(
            For(
              () => category().items,
              (item) => Li({ key: item().id }, [() => item().name])
            )
          ),
        ]);
      })
    );

    body.appendChild(forElement);
    expect(body.innerHTML).toContain("Category 1");
    expect(body.innerHTML).toContain("Category 2");
    expect(body.innerHTML).toContain("Item 1");
    expect(body.innerHTML).toContain("Item 2");
    expect(body.innerHTML).toContain("Item 3");
  });

  it("preserves DOM identity for unchanged items", () => {
    const [items, setItems] = signal([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ]);

    const forElement = Ul(
      For(items, (item) => Li({ key: item().id }, [item().name]))
    );

    body.appendChild(forElement);

    const initialElements = Array.from(body.querySelectorAll("li"));
    expect(initialElements.length).toBe(3);

    // Remove middle item
    setItems([
      { id: 1, name: "Item 1" },
      { id: 3, name: "Item 3" },
    ]);

    const afterElements = Array.from(body.querySelectorAll("li"));
    expect(afterElements.length).toBe(2);

    // The first and third elements should be the same DOM nodes
    // (This tests that the reconciliation preserves DOM identity)
    expect(afterElements[0]).toBe(initialElements[0]);
    expect(afterElements[1]).toBe(initialElements[2]);
  });

  it("can be used as children in h() function with reactive updates", () => {
    const [items, setItems] = signal([{ id: 1, name: "Initial Item" }]);

    const wrapper = Ul(For(items, (item) => Li({ key: item().id }, [() => item().name])));

    body.appendChild(wrapper);

    expect(body.innerHTML).toContain('<ul><li>Initial Item</li></ul>');

    setItems([
      { id: 1, name: "Updated Item" },
      { id: 2, name: "New Item" },
    ]);

    expect(body.innerHTML).toContain(
      '<ul><li>Updated Item</li><li>New Item</li></ul>'
    );
  });
});
