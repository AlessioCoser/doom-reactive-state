import { effect } from "../reactivity";
import {
  Child,
  Children,
  DoomEvents,
  DoomProperties,
  DoomPropertiesNoStyle,
  DoomPropertiesNoStyleNoEvents,
  DoomProperty,
  HTMLTag,
  KeyedDoomProperties,
  KeyedElement,
  KeyValue,
  Reactive,
  Style,
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

  if (key) {
    (el as any).key = key;
  }

  Object.entries(properties)
    .forEach(([key, prop]) => reactOn(prop, (newProp) => ((el as any)[key] = newProp)))

  Object.entries(events)
    .forEach(([key, handler]) => ((el as any)[key] = pass(handler)))

  applyStyles(el, style);

  addChildren(el, children as Children);

  return el;
}

function applyStyles<K extends keyof HTMLTag>(
  el: HTMLTag[K],
  style: Reactive<Styles> | undefined
) {
  if (style) {
    let prevStyles: Styles | undefined;
    effect(() => {
      const styles = evaluate(style) || {};
      const newStyles: Styles = {};
      toStyles(styles).forEach((style) => {
        const newStyleKey = style.key;
        const newStyleValue = evaluate(style.value) || "";
        newStyles[newStyleKey] = newStyleValue;
        if (!prevStyles || prevStyles[newStyleKey] !== newStyleValue) {
          (el.style as any)[newStyleKey] = newStyleValue;
        }
      });
      if (prevStyles) {
        for (const k of Object.keys(prevStyles)) {
          if (!(k in newStyles)) (el.style as any)[k] = "";
        }
      }
      prevStyles = newStyles;
    });
  }
}

function extractEvents<K extends keyof HTMLTag>(
  props: DoomPropertiesNoStyle<K>
) {
  const entries = Object.entries(props) as [keyof DoomPropertiesNoStyle<K>, DoomProperty<K>][]
  const events = entries.filter(([key]) => (key as String).startsWith("on"))
  const properties = entries.filter(([key]) => !(key as String).startsWith("on"))
  return {
    events: Object.fromEntries(events) as DoomEvents<K>,
    properties: Object.fromEntries(properties) as DoomPropertiesNoStyleNoEvents<K>,
  }
}

function extractStyle<K extends keyof HTMLTag>(props: DoomProperties<K>) {
  if (!('style' in props)) {
    return { style: undefined, properties: props as DoomPropertiesNoStyle<K> }
  }
  const { style, ...properties } = props;
  return { style: style as Reactive<Styles>, properties: properties as DoomPropertiesNoStyle<K> }
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

function reactOn<T>(prop: Reactive<T>, apply: (next: T) => void) {
  let prev: T;
  effect(() => {
    const next = evaluate(prop);
    if (next !== prev) {
      apply(next);
      prev = next;
    }
  });
}

function addChildren<K extends keyof HTMLTag>(
  el: HTMLTag[K],
  children: Children | undefined
) {
  if (Array.isArray(children)) {
    children.map(toChildNode).map(appendTo(el));
  } else if (children) {
    appendTo(el)(toChildNode(children));
  }
}

function appendTo<K extends keyof HTMLTag>(
  element: HTMLTag[K]
): (c: ChildNode) => ChildNode {
  return (child: ChildNode) => {
    element.appendChild(child);
    return child;
  };
}

function toStyles(styleValue: Styles): Style[] {
  return Object.entries(styleValue).map((styleAttribute) => {
    return {
      key: styleAttribute[0] as Style["key"],
      value: styleAttribute[1] as Style["value"],
    };
  });
}

const toChildNode = (child: Child) =>
  typeof child === "object" ? child : t(child);

const pass = <T>(prop: Reactive<T>): T => prop as T;
const evaluate = <T>(prop: Reactive<T>): T =>
  typeof prop !== "function" ? prop : (prop as Function)();

function prepareArguments<K extends keyof HTMLTag>(a: unknown, b: unknown) {
  if (!a && !b) {
    return { properties: {} as DoomProperties<K>, children: [] as Children };
  }

  if (!b) {
    if (Array.isArray(a) || typeof a === "string" || typeof a === "function") {
      return { properties: {} as DoomProperties<K>, children: a as Children };
    } else {
      return { properties: a as DoomProperties<K>, children: [] as Children };
    }
  }

  return { properties: a as DoomProperties<K>, children: b as Children };
}
