export type Derivation<T> = (previous: T) => Exclude<T, void>;
export type Accessor<T> = () => T;
export type Setter<T> = (value: T) => void;
export type _Signal<T> = { get: Accessor<T>; set: Setter<T> };
export type Signal<T> = [Accessor<T>, Setter<T>];
export type Subscriber = { derived: _Signal<any> | null; execute: () => void };
