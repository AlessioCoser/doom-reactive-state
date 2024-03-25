export class TreeSet<T> {
  private _set: Set<T>;

  constructor(arr: T[] = []) {
    this._set = new Set(arr);
  }

  has(value: T): boolean {
    return this._set.has(value);
  }

  add(value: T): TreeSet<T> {
    return new TreeSet([...this._set, value]);
  }

  filter(condition: (value: T) => boolean): TreeSet<T> {
    return new TreeSet([...this._set].filter(condition));
  }

  flatMap<R>(transformation: (value: T) => TreeSet<R>): TreeSet<R> {
    if (this._set.size === 0) {
      return new TreeSet();
    }

    return new TreeSet(
      [...this._set].flatMap((it) => transformation(it)._toArray())
    );
  }

  forEach(each: (value: T) => void): void {
    this._set.forEach(each);
  }

  private _toArray(): T[] {
    return [...this._set];
  }
}
