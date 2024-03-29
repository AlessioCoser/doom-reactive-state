export class MapSet<K, V> {
  private map = new Map<K, V[]>();

  addTo(key: K, newValue: V) {
    const arr = this.get(key);

    if (arr.some((each) => each === newValue)) {
      return;
    }

    this.map.set(key, [...arr, newValue]);
  }

  get(key: K | null): V[] {
    return (key && this.map.get(key)) || [];
  }
}
