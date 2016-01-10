import Transfer from './transfer';

export default class {
  constructor(target) {
    if ( target instanceof HTMLElement && target.nodeName === 'IFRAME' ) {
      this.iframe = target;
      this.target = target.contentWindow;
    } else {
      this.target = target;
    }

    this.ready(); // Sets load listener ASAP
  }

  send(fnName, fnArgs) {
    var serializedCall = new Transfer(fnName, fnArgs);

    return this.ready().then(function () {
      this.target.postMessage(serializedCall.toString(), "*");
    }.bind(this));
  }

  // TODO: need a solid way to determine if iframe is loaded
  ready() {
    if (this._isLoaded) {
      return Promise.resolve();
    } else {
      return new Promise(function (resolve, reject) {
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
};
