import Server from './server';
import UUID from './uuid';

let listeners = [];

const addListener = (listener) => {
  listeners.push(listener);
};

const removeListeners = (listener) => {
  listeners = listeners.filter(d => d !== listener);
};

// eslint-disable-next-line
const getDefaultLogger = () => console.error.bind(console);

export default class Spanan {
  constructor(sendFunction, { errorLogger } = {}) {
    this.sendFunction = sendFunction;
    this.callbacks = new Map();
    this.errorLogger = errorLogger || getDefaultLogger();
    addListener(this);
  }

  send(functionName, ...args) {
    let resolver;
    const id = UUID();
    const promise = new Promise((resolve) => { resolver = resolve; });
    this.callbacks.set(id, (...argList) => resolver(...argList));
    this.sendFunction({
      functionName,
      args,
      uuid: id,
    });
    return promise;
  }

  createProxy() {
    return new Proxy(this, {
      get(target, key) {
        return target.send.bind(target, key);
      },
    });
  }

  dispatch({ uuid, returnedValue } = {}) {
    const callback = this.callbacks.get(uuid);
    if (!callback) {
      return false;
    }

    callback(returnedValue);
    this.callbacks.delete(uuid);
    return true;
  }

  static dispatch(message) {
    return listeners.some((listener) => {
      try {
        return listener.dispatch(message);
      } catch (e) {
        listener.errorLogger('Spanan dispatch error', e);
        return false;
      }
    });
  }

  static export(
    actions,
    {
      filter,
      transform,
      respond,
      errorLogger,
    } = {},
  ) {
    const server = new Server({
      actions,
      respond,
      filter,
      transform,
      errorLogger: errorLogger || getDefaultLogger(),
      onTerminate: () => {
        removeListeners(server);
      },
    });

    addListener(server);

    return server;
  }

  static reset() {
    listeners = [];
  }
}
