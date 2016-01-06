function spanan() {}

spanan.SpananWrapper = function (target) {
  this.isReady = false;

  if ( target instanceof HTMLElement && target.nodeName === 'IFRAME' ) {
    this.target = target.contentWindow;

    target.addEventListener("load", function () {
      this.isReady = true;
    }.bind(this));
  } else {
    this.target = target;
    this.isReady = true;
  }
};

spanan.SpananWrapper.prototype.send = function (fnName, fnArgs) {
  var serializedCall = new SpananProtocol(fnName, fnArgs);
  this.target.postMessage(serializedCall.toString(), "*");
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
          var loadingCheckerInterval,
              rejectTimeout;

          rejectTimeout = setTimeout(function () {
            clearInterval(loadingCheckerInterval);
            reject();
          }, options.timeout || 1000);

          loadingCheckerInterval = setInterval(function () {
            if(!wrapper.loaded) { return; }
            clearInterval(loadingCheckerInterval);

            wrapper.send(fnName, fnArgs);

            wrapper.lastCallCb = function (...args) {
              clearTimeout(rejectTimeout);
              resolve.apply(null, args);
            };
          }, 50);
        });
      };
    }
  };

  wrapper.target.addEventListener("load", function () {
    wrapper.loaded = true;
  });

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
