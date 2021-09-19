export class EventBus {
  // eslint-disable-next-line
  static #listeners: Record<string, ((arg: any) => void)[]> = {};

  /**
   * Send an event and dispatch it to the listeners
   */
  static emit<T>(eventName: string, eventArg: T = null): void {
    if (EventBus.#listeners[eventName]) {
      EventBus.#listeners[eventName].forEach((callback) => callback(eventArg));
    }
  }

  /**
   * Register an event listener
   */
  static on<T>(eventName: string, callback: (eventArg: T) => void): void {
    if (EventBus.#listeners[eventName] === undefined) {
      EventBus.#listeners[eventName] = [];
    }
    EventBus.#listeners[eventName].push(callback);
  }
}
