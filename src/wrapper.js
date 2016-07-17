import Transfer from "./transfer";
import uuid from "./uuid";

const loadingPromises = new WeakMap();

export default class {
  constructor(target, options = {}) {
    this._isLoaded = false;
    this._callbacks = Object.create(null);
    this.timeout = options.timeout || 1000;
    this.id = uuid();

    if ( target instanceof HTMLElement && target.nodeName === "IFRAME" ) {
      this.iframe = target;
      this.target = target.contentWindow;
    } else {
      this.target = target;
    }
  }

  send(fnName, ...fnArgs) {
    var transfer = new Transfer(fnName, fnArgs),
        promise, rejectTimeout;

    promise = new Promise( (resolve, reject) => {
      rejectTimeout = setTimeout(reject.bind(null, "timeout"), this.timeout);

      this.ready().then( () => {
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
    if (transferId in this._callbacks) {
      this._callbacks[transferId].call(null, response.response);
      delete this._callbacks[transferId];
    }
  }

  ready() {
    let loadingPromise = loadingPromises.get(this);

    if (!loadingPromise) {
      const initTransfer = new Transfer("-spanan-init-", []);

      loadingPromise = new Promise(resolve => {
        let interval;
        this._callbacks[initTransfer.id] = () => {
          clearInterval(interval);
          resolve();
        };

        interval = setInterval(this.postTransfer.bind(this, initTransfer), 100);
      });

      loadingPromises.set(this, loadingPromise);
    }

    return loadingPromise;
  }

  postTransfer(transfer) {
    transfer.wrapperId = this.id;
    this.target.postMessage(transfer.toString(), "*");
    return transfer;
  }
}
