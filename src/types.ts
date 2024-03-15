export type Derivation<T> = (previous: T) => Exclude<T, void>;
export type Accessor<T> = () => T;
type Setter<T> = (value: T) => void;
export type Signal<T> = [Accessor<T>, Setter<T>];
export type Context = { execute: () => void };
