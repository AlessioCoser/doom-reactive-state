import { MapSet } from "./MapSet";
import { Subscriber, _Signal } from "../types";

export class Subscriptions {
  private currentSubscriber: Subscriber | null = null;
  private ancestors = new Map<_Signal<any>, _Signal<any>>();
  private subscriptions = new MapSet<_Signal<any>, Subscriber>();

  run(subscriber: Subscriber, fn: () => void): void {
    this.currentSubscriber = subscriber;
    try {
      fn();
    } finally {
      this.currentSubscriber = null;
    }
  }

  subscribeTo(signal: _Signal<any>): void {
    const subscriber = this.currentSubscriber;
    if (!signal || !subscriber || signal === subscriber.derived) {
      return;
    }

    if (subscriber.derived) {
      this.ancestors.set(subscriber.derived, signal);
    }

    this.subscriptions.addTo(this._getAncestor(signal), subscriber);
  }

  executeAllSubscriptionsTo(signal: _Signal<any>) {
    this.subscriptions
      .get(signal)
      .filter((subscription) => subscription !== this.currentSubscriber)
      .forEach((subscriber) => subscriber.execute());
  }

  private _getAncestor(signal: _Signal<any>): _Signal<any> {
    const ancestor = this.ancestors.get(signal);
    if (!ancestor) {
      return signal;
    }

    return this._getAncestor(ancestor);
  }
}
