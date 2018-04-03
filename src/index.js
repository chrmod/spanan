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
    const id = UUID();
    const promise = new Promise((resolve) => { resolver = resolve; });
    this.callbacks.set(id, (...argList) => resolver(...argList));
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
    if (
      !callback ||
      (
        callback &&
        !has(message, 'response')
      )
    ) {
      return false;
    }

    callback(message.response);
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
