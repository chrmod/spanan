import Transfer from "./transfer";

const loadingPromises = new WeakMap();

export default class {
  constructor(target, options = {}) {
    this._isLoaded = false;
    this._callbacks = Object.create(null);
    this.timeout = options.timeout || 1000;

    if ( target instanceof HTMLElement && target.nodeName === "IFRAME" ) {
      this.iframe = target;
      this.target = target.contentWindow;
    } else {
      this.target = target;
    }
  }

  send(fnName, fnArgs) {
    var transfer = new Transfer(fnName, fnArgs),
        promise;

    promise = new Promise( (resolve, reject) => {
      var rejectTimeout = setTimeout(reject, this.timeout);

      this.ready().then( () => {
        this.target.postMessage(transfer.toString(), "*");

        this._callbacks[transfer.id] = function () {
          clearTimeout(rejectTimeout);
          resolve.apply(null, arguments);
        };
      });
    });

    promise.transferId = transfer.id;

    return promise;
  }

  dispatchMessage(response) {
    const transferId = response.transferId;
    if (transferId in this._callbacks) {
      this._callbacks[transferId].apply();
      delete this._callbacks[transferId];
    }
  }

  ready() {
    let loadingPromise = loadingPromises.get(this);

    if (!loadingPromise) {
      loadingPromise = new Promise(resolve => {
        let interval;
        this._callbacks[0] = () => {
          resolve();
          clearInterval(interval);
        }
        interval = setInterval( () => {
          this.target.postMessage("spanan?", "*");
        }, 100);
      });

      loadingPromises.set(this, loadingPromise);
    }

    return loadingPromise;
  }
}
