import Server from './server';
import UUID from './uuid';
import { has } from './helpers';

// eslint-disable-next-line
const getDefaultLogger = () => console.error.bind(console);

export default class Spanan {
  constructor(sendFunction, { errorLogger } = {}) {
    this.sendFunction = sendFunction;
    this.callbacks = new Map();
    this.errorLogger = errorLogger || getDefaultLogger();
    this.listeners = [this];
  }

  send(action, ...args) {
    let resolver;
    let rejecter;
    const id = UUID();
    const promise = new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });
    this.callbacks.set(id, {
      resolver,
      rejecter,
    });
    this.sendFunction({
      action,
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

  dispatch(message = {}) {
    const callback = this.callbacks.get(message.uuid);

    if (!callback) {
      return false;
    }

    if (has(message, 'response')) {
      callback.resolver(message.response);
    } else if (has(message, 'error')) {
      callback.rejecter(message.error);
    } else {
      return false;
    }

    this.callbacks.delete(message.uuid);
    return true;
  }

  handleMessage(message) {
    return this.listeners.some((listener) => {
      try {
        return listener.dispatch(message);
      } catch (e) {
        listener.errorLogger('Spanan dispatch error', e);
        return false;
      }
    });
  }

  export(
    actions,
    {
      filter,
      transform,
      respond,
      respondWithError,
      errorLogger,
    } = {},
  ) {
    const server = new Server({
      actions,
      respond,
      respondWithError,
      filter,
      transform,
      errorLogger: errorLogger || getDefaultLogger(),
      onTerminate: () => {
        this.listeners = this.listeners.filter(listener => listener !== server);
      },
    });

    this.listeners.push(server);

    return server;
  }

  reset() {
    this.listeners = [];
  }
}
