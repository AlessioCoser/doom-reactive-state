import {Accessor, effect} from "../reactivity";

export function If(
    condition: Accessor<boolean>,
    ifTrue: () => Element,
    ifFalse: () => Element
) {
    return new ReactiveIf(condition, ifTrue, ifFalse);
}

export class ReactiveIf {
    constructor(
        private readonly condition: Accessor<boolean>,
        private readonly ifTrue: () => Element,
        private readonly ifFalse: () => Element
    ) {
    }

    applyTo(container: Element): void {
        let prevNode: ChildNode | null = null;
        let prevCondition: boolean | null = null;

        effect(() => {
            const isTrue = this.condition();
            if (isTrue === prevCondition) {
                return;
            }
            prevCondition = isTrue;

            const nextNode = isTrue ? this.ifTrue() : this.ifFalse();
            if (prevNode) {
                container.replaceChild(nextNode, prevNode);
            } else {
                container.appendChild(nextNode);
            }
            prevNode = nextNode;
        })
    }
}