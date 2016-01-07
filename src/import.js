var spanan = {
  pendingMessages: [],
  messageListener(e) {
    this.pendingMessages.push(e);
  },
  startListening() {
    this.messageListener = this.messageListener.bind(this);
    window.addEventListener("message", this.messageListener);
  },
  stopListening() {
    window.removeEventListener("message", this.messageListener);
  }
};

spanan.SpananWrapper = function (target) {
  if ( target instanceof HTMLElement && target.nodeName === 'IFRAME' ) {
    this.iframe = target;
    this.target = target.contentWindow;
  } else {
    this.target = target;
  }

  this.ready(); // Sets load listener ASAP
};

spanan.SpananWrapper.prototype.send = function (fnName, fnArgs) {
  var serializedCall = new SpananProtocol(fnName, fnArgs);

  return this.ready().then(function () {
    this.target.postMessage(serializedCall.toString(), "*");
  }.bind(this));
};

// TODO: need a solid way to determine if iframe is loaded
spanan.SpananWrapper.prototype.ready = function () {
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
};

spanan.import = function (url, options = {}) {
  var iframe = spanan.createIframe(url),
      wrapper = new spanan.SpananWrapper(iframe);

  var handler = {
    get: function (target, name) {
      return name in target ?
        target[name] :
        this.send(name);
    },

    send: function (name) {
      return function () {
        var fnName = name,
            fnArgs = arguments;

        return new Promise(function (resolve, reject) {
          var rejectTimeout;

          rejectTimeout = setTimeout(function () {
            reject();
          }, options.timeout || 1000);

          wrapper.ready().then(function () {
            wrapper.send(fnName, fnArgs);

            wrapper.lastCallCb = function (...args) {
              clearTimeout(rejectTimeout);
              resolve.apply(null, args);
            };
          });
        });
      };
    }
  };

  window.addEventListener("message", function (e) {
    wrapper.lastCallCb && wrapper.lastCallCb(e.data);
  });

  return new Proxy(wrapper, handler);
}

spanan.createIframe = function(url) {
  var iframe = document.createElement("iframe");

  iframe.src           = url;
  iframe.className     = "spanan";
  iframe.style.display = "none";

  document.body.appendChild(iframe);

  return iframe;
}
