import { Tree } from "./Tree";
import { TreeSet } from "./TreeSet";
import { Subscriber, _Signal } from "../types";

export class Subscriptions {
  private currentSubscriber: Subscriber | null = null;
  private derivations = new Tree<_Signal<any>, _Signal<any>>();
  private subscriptions = new Tree<_Signal<any>, Subscriber>();

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
    this.subscriptions.addTo(signal, subscriber);
    this.derivations.addTo(signal, subscriber.derived);
  }

  executeAllSubscriptionsTo(signal: _Signal<any> | null) {
    this._subscriptionsTo(signal).forEach((subscriber) => subscriber.execute());
  }

  private _subscriptionsTo(signal: _Signal<any> | null): TreeSet<Subscriber> {
    if (!signal) {
      return new TreeSet();
    }
    const derivedSubscriptions = this.derivations
      .get(signal)
      .flatMap((derived) => this.derivations.get(derived).add(derived))
      .flatMap(this._subscriptionsTo.bind(this));

    return this.subscriptions.get(signal).filter((subscription) => {
      return (
        subscription !== this.currentSubscriber &&
        !derivedSubscriptions.has(subscription)
      );
    });
  }
}
