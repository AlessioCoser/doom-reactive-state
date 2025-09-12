import {beforeEach, describe, expect, it} from "vitest";
import {signal, For, Li, Div} from "../../src";

const body = document.body;

describe("For component", () => {
    beforeEach(() => {
        body.innerHTML = "";
    });

    it("renders empty list", () => {
        const [items] = signal<{ id: number, name: string }[]>([]);

        const forElement = For({
            children: items,
            each: (item) => Li({key: item().id}, [item().name])
        });

        body.appendChild(forElement);
        expect(body.innerHTML).toEqual("<div style=\"display: contents;\"></div>");
    });

    it("renders initial items", () => {
        const [items] = signal([
            {id: 1, name: "Item 1"},
            {id: 2, name: "Item 2"}
        ]);

        const forElement = For({
            children: items,
            each: (item) => Li({key: item().id}, [item().name])
        });

        body.appendChild(forElement);
        expect(body.innerHTML).toContain("Item 1");
        expect(body.innerHTML).toContain("Item 2");
    });

    it("updates when items change", () => {
        const [items, setItems] = signal([
            {id: 1, name: "Item 1"}
        ]);

        const forElement = For({
            children: items,
            each: (item) => Li({key: item().id}, [() => item().name])
        });

        body.appendChild(forElement);
        expect(body.innerHTML).toContain("Item 1");

        setItems([
            {id: 1, name: "Updated Item 1"},
            {id: 2, name: "Item 2"}
        ]);

        expect(body.innerHTML).toContain("Updated Item 1");
        expect(body.innerHTML).toContain("Item 2");
    });

    it("handles item removal", () => {
        const [items, setItems] = signal([
            {id: 1, name: "Item 1"},
            {id: 2, name: "Item 2"},
            {id: 3, name: "Item 3"}
        ]);

        const forElement = For({
            children: items,
            each: (item) => Li({key: item().id}, [item().name])
        });

        body.appendChild(forElement);
        expect(body.innerHTML).toContain("Item 1");
        expect(body.innerHTML).toContain("Item 2");
        expect(body.innerHTML).toContain("Item 3");

        // Remove middle item
        setItems([
            {id: 1, name: "Item 1"},
            {id: 3, name: "Item 3"}
        ]);

        expect(body.innerHTML).toContain("Item 1");
        expect(body.innerHTML).not.toContain("Item 2");
        expect(body.innerHTML).toContain("Item 3");
    });

    it("provides correct index accessor", () => {
        const [items] = signal([
            {id: 1, name: "Item 1"},
            {id: 2, name: "Item 2"}
        ]);

        const forElement = For({
            children: items,
            each: (item, index) => Li({
                key: item().id
            }, [`${index()}: ${item().name}`])
        });

        body.appendChild(forElement);
        expect(body.innerHTML).toContain("0: Item 1");
        expect(body.innerHTML).toContain("1: Item 2");
    });

    // NEW TESTS - Missing edge cases

    it("handles item insertion at beginning", () => {
        const [items, setItems] = signal([
            {id: 2, name: "Item 2"},
            {id: 3, name: "Item 3"}
        ]);

        const forElement = For({
            children: items,
            each: (item) => Li({key: item().id}, [item().name])
        });

        body.appendChild(forElement);
        expect(body.innerHTML).toContain("Item 2");
        expect(body.innerHTML).toContain("Item 3");

        // Insert at beginning
        setItems([
            {id: 1, name: "Item 1"},
            {id: 2, name: "Item 2"},
            {id: 3, name: "Item 3"}
        ]);

        expect(body.innerHTML).toContain("Item 1");
        expect(body.innerHTML).toContain("Item 2");
        expect(body.innerHTML).toContain("Item 3");
    });

    it("handles item insertion in middle", () => {
        const [items, setItems] = signal([
            {id: 1, name: "Item 1"},
            {id: 3, name: "Item 3"}
        ]);

        const forElement = For({
            children: items,
            each: (item) => Li({key: item().id}, [item().name])
        });

        body.appendChild(forElement);
        expect(body.innerHTML).toContain("Item 1");
        expect(body.innerHTML).toContain("Item 3");

        // Insert in middle
        setItems([
            {id: 1, name: "Item 1"},
            {id: 2, name: "Item 2"},
            {id: 3, name: "Item 3"}
        ]);

        expect(body.innerHTML).toContain("Item 1");
        expect(body.innerHTML).toContain("Item 2");
        expect(body.innerHTML).toContain("Item 3");
    });

    it("handles reordering items", () => {
        const [items, setItems] = signal([
            {id: 1, name: "Item 1"},
            {id: 2, name: "Item 2"},
            {id: 3, name: "Item 3"}
        ]);

        const forElement = For({
            children: items,
            each: (item, index) => Li({key: item().id}, [() => `${index()}: ${item().name}`])
        });

        body.appendChild(forElement);
        expect(body.innerHTML).toContain("0: Item 1");
        expect(body.innerHTML).toContain("1: Item 2");
        expect(body.innerHTML).toContain("2: Item 3");

        // Reverse order
        setItems([
            {id: 3, name: "Item 3"},
            {id: 2, name: "Item 2"},
            {id: 1, name: "Item 1"}
        ]);

        expect(body.innerHTML).toContain("0: Item 3");
        expect(body.innerHTML).toContain("1: Item 2");
        expect(body.innerHTML).toContain("2: Item 1");
    });

    it("handles complete replacement of items", () => {
        const [items, setItems] = signal([
            {id: 1, name: "Item 1"},
            {id: 2, name: "Item 2"}
        ]);

        const forElement = For({
            children: items,
            each: (item) => Li({key: item().id}, [item().name])
        });

        body.appendChild(forElement);
        expect(body.innerHTML).toContain("Item 1");
        expect(body.innerHTML).toContain("Item 2");

        // Replace all items
        setItems([
            {id: 4, name: "Item 4"},
            {id: 5, name: "Item 5"}
        ]);

        expect(body.innerHTML).not.toContain("Item 1");
        expect(body.innerHTML).not.toContain("Item 2");
        expect(body.innerHTML).toContain("Item 4");
        expect(body.innerHTML).toContain("Item 5");
    });

    it("handles clearing and refilling list", () => {
        const [items, setItems] = signal([
            {id: 1, name: "Item 1"},
            {id: 2, name: "Item 2"}
        ]);

        const forElement = For({
            children: items,
            each: (item) => Li({key: item().id}, [item().name])
        });

        body.appendChild(forElement);
        expect(body.innerHTML).toContain("Item 1");
        expect(body.innerHTML).toContain("Item 2");

        // Clear list
        setItems([]);
        expect(body.innerHTML).toEqual("<div style=\"display: contents;\"></div>");

        // Refill list
        setItems([
            {id: 3, name: "Item 3"},
            {id: 4, name: "Item 4"}
        ]);
        expect(body.innerHTML).toContain("Item 3");
        expect(body.innerHTML).toContain("Item 4");
    });

    it("handles reactive index updates correctly", () => {
        const [items, setItems] = signal([
            {id: 1, name: "Item 1"},
            {id: 2, name: "Item 2"},
            {id: 3, name: "Item 3"}
        ]);

        const forElement = For({
            children: items,
            each: (item, index) => Li({key: item().id}, [() => `Index ${index()}`])
        });

        body.appendChild(forElement);
        expect(body.innerHTML).toContain("Index 0");
        expect(body.innerHTML).toContain("Index 1");
        expect(body.innerHTML).toContain("Index 2");

        // Remove first item, indexes should update
        setItems([
            {id: 2, name: "Item 2"},
            {id: 3, name: "Item 3"}
        ]);

        // The remaining items should now have indexes 0 and 1
        expect(body.innerHTML).toContain("Index 0");
        expect(body.innerHTML).toContain("Index 1");
        expect(body.innerHTML).not.toContain("Index 2");
    });

    it("handles mixed reactive and static content", () => {
        const [items, setItems] = signal([
            {id: 1, name: "Item 1", active: false}
        ]);

        const forElement = For({
            children: items,
            each: (item) => Li({key: item().id}, [
                "Static: ",
                () => item().name,
                " - ",
                () => item().active ? "Active" : "Inactive"
            ])
        });

        body.appendChild(forElement);
        expect(body.innerHTML).toContain("Static: Item 1 - Inactive");

        // Update reactive parts
        setItems([
            {id: 1, name: "Updated Item 1", active: true}
        ]);

        expect(body.innerHTML).toContain("Static: Updated Item 1 - Active");
    });

    it("handles nested For components", () => {
        const [categories] = signal([
            {id: 1, name: "Category 1", items: [{id: 1, name: "Item 1"}, {id: 2, name: "Item 2"}]},
            {id: 2, name: "Category 2", items: [{id: 3, name: "Item 3"}]}
        ]);

        const forElement = For({
            children: categories,
            each: (category) => Div({key: category().id}, [
                () => category().name,
                For({
                    children: () => category().items,
                    each: (item) => Li({key: item().id}, [() => item().name])
                })
            ])
        });

        body.appendChild(forElement);
        expect(body.innerHTML).toContain("Category 1");
        expect(body.innerHTML).toContain("Category 2");
        expect(body.innerHTML).toContain("Item 1");
        expect(body.innerHTML).toContain("Item 2");
        expect(body.innerHTML).toContain("Item 3");
    });

    it("preserves DOM identity for unchanged items", () => {
        const [items, setItems] = signal([
            {id: 1, name: "Item 1"},
            {id: 2, name: "Item 2"},
            {id: 3, name: "Item 3"}
        ]);

        const forElement = For({
            children: items,
            each: (item) => Li({key: item().id}, [item().name])
        });

        body.appendChild(forElement);
        
        const initialElements = Array.from(body.querySelectorAll('li'));
        expect(initialElements.length).toBe(3);

        // Remove middle item
        setItems([
            {id: 1, name: "Item 1"},
            {id: 3, name: "Item 3"}
        ]);

        const afterElements = Array.from(body.querySelectorAll('li'));
        expect(afterElements.length).toBe(2);
        
        // The first and third elements should be the same DOM nodes
        // (This tests that the reconciliation preserves DOM identity)
        expect(afterElements[0]).toBe(initialElements[0]);
        expect(afterElements[1]).toBe(initialElements[2]);
    });
});
