let dispatchers = [];

const addDispatcher = (dispatcher) => {
  dispatchers.push(dispatcher);
};

export default class Spanan {
  constructor(sendFunction) {
    this.sendFunction = sendFunction;
    this.callbacks = new Map();
    addDispatcher(this.dispatch);
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
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  static dispatch(message) {
    return dispatchers.some((dispatcher) => {
      try {
        return dispatcher(message);
      } catch(e) {
        return false;
      }
    });
  }

  static export(
    actions = {},
    {
      respond = (res, req) => {},
      filter = () => true,
      transform = r => r,
    } = {},
  ) {
    const dispatch = (request) => {

      if (!filter) {
        return false;
      }

      const { args = [], action } = transform(request);

      if (!actions.hasOwnProperty(action)) {
        return false;
      }

      let res = actions[action](...args);

      if (!(res instanceof Promise)) {
        res = Promise.resolve(res);
      }

      res.then((response) => respond(response, request));

      return true;
    };

    addDispatcher(dispatch);
  }

  static reset() {
    dispatchers = [];
  }
}
