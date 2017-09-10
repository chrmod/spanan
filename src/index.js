/* @flow */

import Server from './server';
import UUID from './uuid';

let dispatchers = [];

const addDispatcher = (dispatcher) => {
  dispatchers.push(dispatcher);
};

const removeDispatcher = (dispatcher) => {
  dispatchers = dispatchers.filter(d => d !== dispatcher);
};

type DispatchParams = {|
  uuid: string,
  returnedValue: any,
|};

type sendFn = (any) => void;

export default class Spanan {

  sendFunction: sendFn;
  callbacks: Map<string, sendFn>;

  constructor(sendFunction: sendFn) {
    this.sendFunction = sendFunction;
    this.callbacks = new Map();
    addDispatcher(this.dispatch.bind(this));
  }

  send(functionName: string, ...args: any) {
    let resolver;
    const id = UUID();
    const promise: Promise<any> = new Promise((resolve) => { resolver = resolve; });
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

  dispatch({
    uuid,
    returnedValue,
  }: DispatchParams) {
    const callback = this.callbacks.get(uuid);
    if (!callback) {
      return false;
    }

    callback(returnedValue);
    this.callbacks.delete(uuid);
    return true;
  }

  static dispatch(message) {
    return dispatchers.some((dispatcher) => {
      try {
        return dispatcher(message);
      } catch (e) {
        /* eslint-disable */
        // TODO: introduce a custom logger
        console.error('Spanan dispatch error', e);
        /* eslint-enable */
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
    } = {},
  ) {
    const server = new Server({
      actions,
      respond,
      filter,
      transform,
      onTerminate: () => {
        removeDispatcher(server.dispatch);
      },
    });

    addDispatcher(server.dispatch);

    return server;
  }

  static reset() {
    dispatchers = [];
  }
}
