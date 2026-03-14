import { MapArray } from "./MapArray";
import { Subscriber, _Signal } from "../types";

export class Subscriptions {
  private currentSubscriber: Subscriber | null = null;
  private ancestors = new MapArray<_Signal<any>, _Signal<any>>();
  private subscriptions = new MapArray<_Signal<any>, Subscriber>();
  private subscriberSignals = new MapArray<Subscriber, _Signal<any>>();

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
      this.ancestors.addTo(subscriber.derived, signal);
    }

    this._getAncestors(signal).forEach((ancestor) => {
      this.subscriptions.addTo(ancestor, subscriber);
      this.subscriberSignals.addTo(subscriber, ancestor);
    });
  }

  unsubscribe(subscriber: Subscriber): void {
    subscriber.disposed = true;
    const signals = this.subscriberSignals.get(subscriber);
    for (const signal of signals) {
      this.subscriptions.removeFrom(signal, subscriber);
    }
    this.subscriberSignals.delete(subscriber);
  }

  executeAllSubscriptionsTo(signal: _Signal<any>) {
    this.subscriptions
      .get(signal)
      .filter((subscription) => subscription !== this.currentSubscriber && !subscription.disposed)
      .forEach((subscriber) => subscriber.execute());
  }

  private _getAncestors(signal: _Signal<any>): _Signal<any>[] {
    const ancestors = this.ancestors.get(signal);
    if (!ancestors || ancestors.length === 0) {
      return [signal];
    }

    return ancestors.flatMap((ancestor) => this._getAncestors(ancestor));
  }
}
