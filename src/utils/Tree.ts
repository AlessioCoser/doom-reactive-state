import { TreeSet } from "./TreeSet";

export class Tree<K, V> {
  private map = new Map<K, TreeSet<V>>();

  addTo(key: K, newValue: V | null) {
    if (newValue) {
      const oldList = this.get(key);
      this.map.set(key, oldList.add(newValue));
    }
  }

  get(key: K | null): TreeSet<V> {
    return (key && this.map.get(key)) || new TreeSet();
  }
}
