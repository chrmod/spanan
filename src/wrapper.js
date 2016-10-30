import { RequestTransfer, ResponseTransfer } from "./transfer";
import uuid from "./uuid";

const loadingPromises = new WeakMap();

export default class {
  /**
   * options = {
   *   timeout: 1000,
   *   meta: {
   *
   *   },
   *   requestProperties: {
   *
   *   }
   * }
   */
  constructor(target, options = {}) {
    this._isLoaded = false;
    this._callbacks = Object.create(null);
    this.timeout = options.timeout || 1000;
    this.requestConfig = {
      meta: options.meta,
      requestProperties: options.requestProperties,
    };
    this.id = uuid();

    if ( target instanceof HTMLElement && target.nodeName === "IFRAME" ) {
      this.iframe = target;
      this.target = target.contentWindow;
    } else {
      this.target = target;
    }
  }

  createRequestTransfer(fnName, fnArgs) {
    return new RequestTransfer(fnName, fnArgs, this.requestConfig);
  }

  send(fnName, ...fnArgs) {
    const transfer = this.createRequestTransfer(fnName, fnArgs);
    let rejectTimeout;

    const promise = new Promise( (resolve, reject) => {
      rejectTimeout = setTimeout(reject.bind(null, "timeout"), this.timeout);

      if (!this.loadingPromise) {
        this.loadingPromise = this.ready();
      }

      this.loadingPromise.then( () => {
        this.postTransfer(transfer);

        this._callbacks[transfer.id] = function () {
          clearTimeout(rejectTimeout);
          resolve.apply(null, arguments);
        };
      });
    });

    promise.transferId = transfer.id;
    promise.rejectTimeout = rejectTimeout;

    return promise;
  }

  createProxy() {
    const wrapper = this;
    const handler = {
      get(target, name) {
        return name in target ?
          target[name] :
          this.send(name);
      },

      send(name) {
        return function () {
          return wrapper.send.apply(wrapper, [name, ...arguments]);
        };
      }
    };

    return new Proxy(this, handler);
  }

  dispatchMessage(response) {
    const transferId = response.transferId;
    const callback = this._callbacks[transferId];

    if (callback) {
      callback.call(null, response.response);
      delete this._callbacks[transferId];
    }
  }

  ready() {
    const initTransfer = this.createRequestTransfer("-spanan-init-", []);
    let interval;

    const loadingPromise = new Promise(resolve => {
      this._callbacks[initTransfer.id] = () => {
        loadingPromise.stop();
        resolve();
      };

      interval = setInterval(this.postTransfer.bind(this), 100, initTransfer);
    });

    loadingPromise.stop = clearInterval.bind(null, interval);

    return loadingPromise;
  }

  postTransfer(transfer) {
    transfer.wrapperId = this.id;
    const message = transfer.toString();
    this.target.postMessage(message, "*");
    return transfer;
  }
}
