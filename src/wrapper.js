import Transfer from "./transfer";

export default class {
  constructor(target) {
    this._isLoaded = false;
    this._callbacks = Object.create(null);

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
        target = this.target,
        callbacks = this._callbacks;

    return this.ready().then(function () {

      target.postMessage(transfer.toString(), "*");

      return new Promise(function (resolve) {
        callbacks[transfer.id] = resolve;
      });
    });
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
