import { effect, signal } from "../reactivity";
import { Accessor } from "../reactivity/types";
import { KeyedElement, KeyValue } from "./types";
import { updateChildren } from "./updateChildren";

type ForProps<T> = {
  items: Accessor<T[]>
  each: (item: Accessor<T>) => KeyedElement
}

export function For<T>(props: ForProps<T>): Element {
    const container = document.createElement('div');
    container.style.display = 'contents';

    const itemSignals = new Map<KeyValue, [Accessor<T>, (value: T) => void]>();
    let prev: ChildNode[] = [];

    effect(() => {
        const items = props.items();
        if (items.length === 0) {
            itemSignals.clear();
            prev = updateChildren(container, prev, []);
            return;
        }
        // Track which keys are still in use
        const usedKeys = new Set<KeyValue>();
        const next = items.map((item) => {
            // Use a dummy accessor for key extraction
            const dummyItem = () => item;
            const el = props.each(dummyItem);
            if (el.key == null) {
                throw new Error("Each child in For must have a key property.");
            }
            const key = el.key;
            usedKeys.add(key);
            // Get or create managed signal for this key
            let managedSignal = itemSignals.get(key);
            if (!managedSignal) {
                managedSignal = signal(item);
                itemSignals.set(key, managedSignal);
            } else {
                const current = managedSignal[0]();
                if (current !== item) {
                    managedSignal[1](item); // Update existing signal
                }
            }
            // Create final element with managed signal
            return props.each(managedSignal[0]);
        });
        // Clean up unused signals
        for (const [key] of itemSignals) {
            if (!usedKeys.has(key)) {
                itemSignals.delete(key);
            }
        }
        prev = updateChildren(container, prev, next);
    });
    return container;
}
