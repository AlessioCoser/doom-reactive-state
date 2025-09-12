import {effect} from "../reactivity";
import {
    Child,
    Children,
    DoomProperties,
    DoomProperty,
    HTMLTag,
    Reactive,
    Style,
    Styles,
    KeyedElement,
    KeyValue,
} from "./types";

export function h<K extends keyof HTMLTag>(component: K, a: (DoomProperties<K> & { key: KeyValue }) | Children, b?: Children): KeyedElement;
export function h<K extends keyof HTMLTag>(component: K, a?: DoomProperties<K> | Children, b?: Children): Element;
export function h<K extends keyof HTMLTag>(component: K, a?: DoomProperties<K> | Children, b?: Children): Element {
    const el: HTMLTag[K] = document.createElement(component as K);
    const {properties, children} = prepareArguments(a, b);

    const maybeKey = (properties as Partial<DoomProperties<K>>)?.key as KeyValue | undefined;
    if (maybeKey != null) {
        (el as any).key = maybeKey;
    }

    toProperties(properties as DoomProperties<K>)
        .filter(({key}) => key !== ("key" as any))
        .forEach(({key, value}) => {
            if (key === "style") {
                effect(() => {
                    const styles = evaluate(value as Reactive<Styles>);
                    toStyles(styles).forEach((style) => {
                        el.style[style.key] = evaluate(style.value) || "";
                    });
                });
                return;
            }

            if ((key as String).startsWith("on")) {
                el[key as keyof HTMLTag[K]] = pass(value);
                return;
            }

            effect(() => ((el as any)[key] = evaluate(value)));
        });

    addChildren(el, children as Children);

    return el;
}

function t(text: Reactive<string>): Text {
    if (typeof text === "string") {
        return document.createTextNode(text);
    }
    const textNode = document.createTextNode("");
    effect(() => (textNode.textContent = evaluate(text)));
    return textNode;
}

function addChildren<K extends keyof HTMLTag>(el: HTMLTag[K], children: Children | undefined) {
    if (Array.isArray(children)) {
        children.map(toChildNode).map(appendTo(el));
    } else if (children) {
        appendTo(el)(toChildNode(children));
    }
}

function appendTo<K extends keyof HTMLTag>(element: HTMLTag[K]): (c: ChildNode) => ChildNode {
    return (child: ChildNode) => {
        element.appendChild(child);
        return child;
    };
}

function toProperties<K extends keyof HTMLTag>(properties: DoomProperties<K>): DoomProperty<K>[] {
    return Object.entries(properties).map((property) => {
        return {key: property[0], value: property[1]} as DoomProperty<K>;
    });
}

function toStyles(styleValue: Styles): Style[] {
    return Object.entries(styleValue).map((styleAttribute) => {
        return {
            key: styleAttribute[0] as Style["key"],
            value: styleAttribute[1] as Style["value"],
        };
    });
}

const toChildNode = (child: Child) => typeof child === "object" ? child : t(child);

const pass = <T>(prop: Reactive<T>): T => prop as T;
const evaluate = <T>(prop: Reactive<T>): T => typeof prop !== "function" ? prop : (prop as Function)();

function prepareArguments<K extends keyof HTMLTag>(a: unknown, b: unknown) {
    if (!a && !b) {
        return {properties: {} as DoomProperties<K>, children: [] as Children};
    }

    if (!b) {
        if (Array.isArray(a) || typeof a === "string" || typeof a === "function") {
            return {properties: {} as DoomProperties<K>, children: a as Children};
        } else {
            return {properties: a as DoomProperties<K>, children: [] as Children};
        }
    }

    return {properties: a as DoomProperties<K>, children: b as Children};
}
