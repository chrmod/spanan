import Transfer from "./transfer";

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

    this.ready(); // Sets load listener ASAP
  }

  send(fnName, fnArgs) {
    var transfer = new Transfer(fnName, fnArgs),
        promise;

    promise = new Promise(function (resolve, reject) {
      var rejectTimeout = setTimeout(reject, this.timeout);

      this.ready().then(function () {
        this.target.postMessage(transfer.toString(), "*");

        this._callbacks[transfer.id] = function () {
          clearTimeout(rejectTimeout);
          resolve.apply(null, arguments);
        };
      }.bind(this));
    }.bind(this));

    promise.transferId = transfer.id;

    return promise;
  }

  // TODO: need a solid way to determine if iframe is loaded
  ready() {
    if (this._isLoaded) {
      return Promise.resolve();
    } else {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve();
          this._isLoaded = true;
        }.bind(this), 200);
        /*
        if ( this.iframe ) {
          this.iframe.addEventListener("load", resolve);
          this._isLoaded = true;
        } else {
          this._isLoaded = true;
          resolve();
        }
        */
      }.bind(this));
    }
  }
}
