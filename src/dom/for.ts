import { effect, signal } from "../reactivity";
import { Accessor } from "../reactivity/types";
import { KeyedElement, KeyValue } from "./types";
import { updateChildrenFast } from "./updateChildren";

type ForProps<T> = {
  children: Accessor<T[]>
  each: (item: Accessor<T>, index: Accessor<number>) => KeyedElement
}

export function For<T>(props: ForProps<T>): Element {
    const container = document.createElement('div');
    container.style.display = 'contents';
    
    const itemSignals = new Map<KeyValue, [Accessor<T>, (value: T) => void]>();
    let prev: ChildNode[] = [];
    
    effect(() => {
        const items = props.children();
        
        if (items.length === 0) {
            itemSignals.clear();
            prev = updateChildrenFast(container, prev, []);
            return;
        }
        
        // Track which keys are still in use
        const usedKeys = new Set<KeyValue>();
        
        const next = items.map((item, index) => {
            // Create element first to get the key
            const tempItemSignal = signal(item);
            const tempElement = props.each(tempItemSignal[0], () => index);
            const key = tempElement.key;
            
            usedKeys.add(key);
            
            // Get or create managed signal for this key
            let managedSignal = itemSignals.get(key);
            if (!managedSignal) {
                managedSignal = signal(item);
                itemSignals.set(key, managedSignal);
            } else {
                managedSignal[1](item); // Update existing signal
            }
            
            const indexSignal = () => props.children().findIndex(currentItem => {
                const testSignal = signal(currentItem);
                const testElement = props.each(testSignal[0], () => 0);
                return testElement.key === key;
            });
            
            // Create final element with managed signal
            return props.each(managedSignal[0], indexSignal);
        });
        
        // Clean up unused signals
        for (const [key] of itemSignals) {
            if (!usedKeys.has(key)) {
                itemSignals.delete(key);
            }
        }
        
        prev = updateChildrenFast(container, prev, next);
    });
    
    return container;
}
