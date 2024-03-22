export type Derivation<T> = (previous: T) => Exclude<T, void>;
export type Accessor<T> = () => T;
export type Setter<T> = (value: T) => void;
export type Signal<T> = { get: Accessor<T>; set: Setter<T> };
export type Subscriber = { derived: Signal<any> | null, execute: () => void };
