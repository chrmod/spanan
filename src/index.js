import uuidV4 from 'uuid/v4';

export default class Spanan {
  constructor(sendFunction) {
    this.sendFunction = sendFunction;
    this.callbacks = new Map();
  }

  send(functionName, ...args) {
    let resolver;
    const uuid = Spanan.uuid();
    const promise = new Promise(function (resolve) {
      resolver = resolve;
    });
    this.callbacks.set(uuid, function () {
      resolver.apply(null, arguments);
    });
    this.sendFunction({
      functionName,
      args,
      uuid,
    });
    return promise;
  }

  createProxy() {
    return new Proxy(this, {
      get(target, key) {
        return target.send.bind(target, key);
      }
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

  static uuid() {
    return uuidV4();
  }
}
