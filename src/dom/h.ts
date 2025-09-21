import {effect} from "../reactivity";
import {ReactiveChildren} from "./reactiveChildren";
import {
  Child,
  Children,
  DoomProperties,
  DoomPropertiesNoStyle,
  DoomPropertiesNoStyleNoEvents,
  DoomProperty, ElementEvents,
  HTMLTag,
  KeyedDoomProperties,
  KeyedElement,
  KeyValue,
  Reactive,
  Styles,
} from "./types";

export function h<K extends keyof HTMLTag>(component: K, a?: Children): Element;
export function h<K extends keyof HTMLTag>(component: K, a: DoomProperties<K>, b?: Children): Element;
export function h<K extends keyof HTMLTag>(component: K, a: KeyedDoomProperties<K>, b?: Children): KeyedElement;
export function h<K extends keyof HTMLTag>(component: K, a: unknown, b?: unknown): Element | KeyedElement {
  const el: HTMLTag[K] = document.createElement(component as K);
  const { children, properties: allProps } = prepareArguments(a, b);
  const { key, properties: doomProperties } = extractKey(allProps);
  const { style, properties: props } = extractStyle(doomProperties);
  const { events, properties } = extractEvents(props);

  const keyValue = `${key}`
  if (keyValue.length > 0) {
    (el as any).key = keyValue
  }

  forEach(properties, (key, prop) => reactOn(prop, (newProp) => ((el as any)[key] = newProp)))
  forEach(style, (key, value) => reactOn(value, (newValue) =>  ((el.style as any)[key] = newValue)))
  forEach(events, (key, handler) => ((el as any)[key] = handler))

  addChildren(el, children as Children);

  return el;
}

function extractEvents<K extends keyof HTMLTag>(
  props: DoomPropertiesNoStyle<K>
) {
  const entries = Object.entries(props) as unknown as [keyof DoomPropertiesNoStyle<K>, DoomProperty<K>][]
  const events = entries.filter(([key]) => (key as String).startsWith("on"))
  const properties = entries.filter(([key]) => !(key as String).startsWith("on"))
  return {
    events: Object.fromEntries(events) as ElementEvents<K>,
    properties: Object.fromEntries(properties) as DoomPropertiesNoStyleNoEvents<K>,
  }
}

function extractStyle<K extends keyof HTMLTag>(props: DoomProperties<K>) {
  if (!('style' in props)) {
    return { style: {} as Styles, properties: props as DoomPropertiesNoStyle<K> }
  }
  const { style, ...properties } = props;
  return { style: style as Styles, properties: properties as DoomPropertiesNoStyle<K> }
}

function extractKey<K extends keyof HTMLTag>(
  props: KeyedDoomProperties<K> | DoomProperties<K>
): { key: KeyValue | undefined; properties: DoomProperties<K> } {
  if (props && typeof props === "object" && "key" in props) {
    const { key, ...rest } = props as KeyedDoomProperties<K>;
    return { key, properties: rest as unknown as DoomProperties<K> };
  }
  return { key: undefined, properties: props };
}

function t(text: Reactive<string>): Text {
  if (typeof text === "string") {
    return document.createTextNode(text);
  }
  const textNode = document.createTextNode("");
  reactOn(text, (newText) => (textNode.textContent = newText));
  return textNode;
}

function addChildren<K extends keyof HTMLTag>(
  el: HTMLTag[K],
  children: Children | undefined
) {
  if (!children) return;
  if (children instanceof ReactiveChildren) {
    return children.applyTo(el);
  }
  if (Array.isArray(children)) {
    return children.map(toChildNode).forEach(appendTo(el));
  }
  appendTo(el)(toChildNode(children));
}

function appendTo<K extends keyof HTMLTag>(
  element: HTMLTag[K]
): (c: ChildNode) => ChildNode {
  return (child: ChildNode) => {
    element.appendChild(child);
    return child;
  };
}

const toChildNode = (child: Child) =>
  typeof child === "object" ? child : t(child);

function prepareArguments<K extends keyof HTMLTag>(a: unknown, b: unknown) {
  if (!a && !b) {
    return { properties: {} as DoomProperties<K>, children: [] as Children };
  }

  if (!b) {
    if (Array.isArray(a) || typeof a === "string" || typeof a === "function" || a instanceof Element || a instanceof ReactiveChildren) {
      return { properties: {} as DoomProperties<K>, children: a as Children };
    } else {
      return { properties: a as DoomProperties<K>, children: [] as Children };
    }
  }

  return { properties: a as DoomProperties<K>, children: b as Children };
}

function reactOn<T>(value: Reactive<T>, apply: (next: T) => void) {
  if (typeof value !== "function") {
    apply(value);
    return;
  }

  let prevValue: T;
  effect(() => {
    const newValue = (value as Function)()
    if (newValue !== prevValue) {
      apply(newValue)
      prevValue = newValue
    }
  })
}

function forEach<T>(object: T, fn: (key: keyof T, value: T[keyof T]) => void) {
  if (object) {
    return Object.entries(object).forEach(([key, value]) => fn(key as keyof T, value as T[keyof T]))
  }
  return []
}
