export class MapArray<K, V> {
  private map = new Map<K, V[]>();

  addTo(key: K, newValue: V) {
    const arr = this.get(key);

    if (arr.some((each) => each === newValue)) {
      return;
    }

    this.map.set(key, [...arr, newValue]);
  }

  removeFrom(key: K, value: V): void {
    const arr = this.map.get(key);
    if (!arr) return;
    const filtered = arr.filter((each) => each !== value);
    if (filtered.length === 0) {
      this.map.delete(key);
    } else {
      this.map.set(key, filtered);
    }
  }

  delete(key: K): void {
    this.map.delete(key);
  }

  get(key: K | null): V[] {
    return (key && this.map.get(key)) || [];
  }
}
